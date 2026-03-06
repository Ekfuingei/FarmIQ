/**
 * AI Crop Doctor — Gemini Vision API
 * Crop: snap photo → disease, pest, deficiency
 * Soil: photo/video → what's lacking, best crops to plant
 */
import { Router } from 'express';
import multer from 'multer';
import { generateWithRetry } from '../lib/gemini.js';

const router = Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Use JPEG, PNG, or WebP.'));
  },
});

// For soil: images (7MB) or videos (50MB) - Gemini supports mp4, webm
const soilUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/heic',
      'video/mp4', 'video/webm', 'video/quicktime',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Use a photo (JPEG/PNG) or video (MP4/WebM) of the soil.'));
  },
});

const CROP_CONTEXT = `
You are an expert agronomist for African farmers across the continent. You specialize in: maize, cassava, yam, cocoa, sorghum, rice, teff, coffee, beans, millet, plantain, wheat, olives, dates, and other staple crops grown in West, East, Southern, Central, and North Africa.
When analyzing a crop/plant photo, ALWAYS respond in this exact JSON structure (no markdown, no extra text):
{
  "diagnosis": "Brief 1-2 sentence diagnosis in plain language",
  "condition": "disease|pest|deficiency|healthy|unknown",
  "confidence": 0.0-1.0,
  "treatment": [
    "Step 1: actionable treatment in simple terms",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "prevention": ["Tip 1", "Tip 2"],
  "language": "en"
}

Rules:
- Write in simple, farmer-friendly language. Avoid jargon.
- If image is unclear or not a plant, set condition to "unknown" and diagnosis to "Please upload a clear photo of the affected plant leaf or crop."
- If healthy, say so clearly and suggest general care tips.
- Treatment steps must be practical for smallholder farmers (low cost, locally available solutions).
`;

const SOIL_CONTEXT = `
You are an expert soil scientist and agronomist for African farmers across the continent. You analyze soil from photos or videos.
From visual cues (color, texture, cracking, moisture, vegetation) infer likely soil conditions.

ALWAYS respond in this exact JSON structure (no markdown, no extra text):
{
  "summary": "2-3 sentence plain-language summary of the soil condition",
  "indicators": {
    "color": "description (e.g. red=iron, dark=organic matter, pale=leached)",
    "texture": "sandy|loamy|clayey|mixed",
    "moisture": "dry|moist|wet",
    "structure": "crumbly|cracking|compacted|soft"
  },
  "likelyDeficiencies": [
    {"nutrient": "Nitrogen", "sign": "why you think so", "fix": "how to improve"}
  ],
  "recommendedCrops": [
    {"crop": "name", "reason": "why it suits this soil", "tips": "brief planting tip"}
  ],
  "improvements": [
    "Step 1: practical soil improvement (compost, mulch, crop rotation)",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "confidence": 0.0-1.0
}

Rules:
- Base recommendations on African conditions: West (maize, cassava, yam, cocoa), East (teff, coffee, beans), Southern (maize, sorghum), Central (cassava, plantain, coffee, palm oil), North (wheat, barley, olives, dates, citrus). Include cowpea, vegetables, millet where suitable.
- Use simple language. Avoid jargon.
- If image/video is unclear or not soil, set summary to "Please upload a clear photo or short video of the soil surface."
- Be conservative: visual analysis has limits; suggest soil testing for precise results.
`;

export async function diagnoseWithGemini(imageBuffer, mimeType) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to .env');
  }
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg',
    },
  };
  const text = await generateWithRetry([CROP_CONTEXT, imagePart]);
  return parseDiagnosisResponse(text);
}

function parseDiagnosisResponse(text) {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      diagnosis: text,
      condition: 'unknown',
      confidence: 0.5,
      treatment: [],
      prevention: [],
      language: 'en',
    };
  }
}

function parseSoilResponse(text) {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      summary: text,
      indicators: {},
      likelyDeficiencies: [],
      recommendedCrops: [],
      improvements: [],
      confidence: 0.5,
    };
  }
}

export async function analyzeSoilWithGemini(fileBuffer, mimeType) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Add it to .env');
  }
  const part = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg',
    },
  };
  const text = await generateWithRetry([SOIL_CONTEXT, part]);
  return parseSoilResponse(text);
}

router.post('/diagnose', imageUpload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded. Send as multipart/form-data with field "image".' });
    }
    const result = await diagnoseWithGemini(file.buffer, file.mimetype);
    res.json(result);
  } catch (err) {
    console.error('Crop Doctor error:', err);
    const isQuota = (err?.message || '').includes('429') || (err?.message || '').includes('quota');
    const msg = isQuota ? 'Too many requests. Please try again in a few minutes.' : (err.message || 'Diagnosis failed');
    res.status(isQuota ? 429 : 500).json({
      error: msg,
      diagnosis: isQuota ? 'Our AI is busy. Please wait a moment and try again.' : 'We couldn\'t analyze your photo. Please check your connection and try again.',
      condition: 'unknown',
      confidence: 0,
      treatment: [],
      prevention: [],
    });
  }
});

router.post('/analyze-soil', soilUpload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded. Send a photo or video of soil as multipart/form-data with field "file".',
      });
    }
    const result = await analyzeSoilWithGemini(file.buffer, file.mimetype);
    res.json(result);
  } catch (err) {
    console.error('Soil analysis error:', err);
    const isQuota = (err?.message || '').includes('429') || (err?.message || '').includes('quota');
    const msg = isQuota ? 'Too many requests. Please try again in a few minutes.' : (err.message || 'Soil analysis failed');
    res.status(isQuota ? 429 : 500).json({
      error: msg,
      summary: isQuota ? 'Our AI is busy. Please wait a moment and try again.' : 'We couldn\'t analyze your soil. Please try again with a clear photo or short video.',
      indicators: {},
      likelyDeficiencies: [],
      recommendedCrops: [],
      improvements: [],
      confidence: 0,
    });
  }
});

export const cropDoctorRouter = router;
