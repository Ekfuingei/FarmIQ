/**
 * Gemini API helper with retry logic for 429 (rate limit) errors
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash';
const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.1-pro'];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(err) {
  const msg = err?.message || '';
  return msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
}

/**
 * Generate content with retry on 429. Tries fallback models if main fails.
 */
export async function generateWithRetry(contents) {
  const models = [DEFAULT_MODEL, ...FALLBACK_MODELS.filter((m) => m !== DEFAULT_MODEL)];

  let lastErr = null;
  for (const modelName of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(contents);
        return result.response.text();
      } catch (err) {
        lastErr = err;
        const is404 = (err?.message || '').includes('404') || (err?.message || '').includes('not found');
        if (is404) break; // Try next model immediately
        if (!isRetryable(err) || attempt >= 3) throw err;
        await sleep(5000 * attempt); // 5s, 10s, 15s
      }
    }
  }
  throw lastErr;
}

export { genAI };
