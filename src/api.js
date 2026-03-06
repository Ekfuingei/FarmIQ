/**
 * API base URL for backend calls.
 * In dev: empty string → Vite proxy forwards /api to localhost:3001
 * In prod: VITE_API_URL (e.g. https://farmiq-7qet.onrender.com) → direct call to Render
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
