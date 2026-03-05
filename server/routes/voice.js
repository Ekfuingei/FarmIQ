/**
 * Voice-First Interface — Gemini-powered farming assistant
 * Farmer speaks → Gemini answers → spoken response
 * Supports: Hausa, Yoruba, Igbo, Pidgin, French, Arabic, Swahili
 */
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const FARMING_CONTEXT = `You are a friendly farming advisor for African farmers. They ask you questions by voice.
Rules:
- Keep answers SHORT (2-4 sentences max) — suitable for spoken response
- Use simple language. No jargon.
- Be practical: give actionable tips for smallholder farmers
- Topics: crops (maize, cassava, yam, etc.), soil, pests, weather, planting, market prices, equipment
- If they greet you, greet back and ask how you can help
- If the question is unclear, ask them to repeat or be more specific
- Answer in the SAME LANGUAGE they used (Hausa, Yoruba, Igbo, Pidgin, French, Arabic, Swahili, or English)
`;

router.post('/ask', async (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }
    const langHint = language ? `The farmer is speaking ${language}. Respond in the same language.` : '';
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });
    const result = await model.generateContent([
      FARMING_CONTEXT + langHint,
      question.trim(),
    ]);
    const text = result.response.text();
    res.json({ answer: text });
  } catch (err) {
    console.error('Voice ask error:', err);
    res.status(500).json({
      error: err.message || 'Could not get answer',
      answer: 'Samuwa ta yi. Ka sake gwada. Sorry, please try again.',
    });
  }
});

export const voiceRouter = router;
