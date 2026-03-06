/**
 * Gemini API helper with retry logic for 429 (rate limit) errors
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(err) {
  const msg = err?.message || '';
  return msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
}

/**
 * Generate content with retry on 429. Falls back to gemini-1.5-flash if 2.0 quota is exhausted.
 */
export async function generateWithRetry(contents) {
  const models = DEFAULT_MODEL === FALLBACK_MODEL ? [DEFAULT_MODEL] : [DEFAULT_MODEL, FALLBACK_MODEL];

  let lastErr = null;
  for (const modelName of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(contents);
        return result.response.text();
      } catch (err) {
        lastErr = err;
        if (!isRetryable(err) || attempt >= 3) throw err;
        await sleep(5000 * attempt); // 5s, 10s, 15s
      }
    }
  }
  throw lastErr;
}

export { genAI };
