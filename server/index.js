/**
 * FarmIQ Backend — Gemini AI, Weather, Market APIs
 */
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { cropDoctorRouter } from './routes/crop-doctor.js';
import { weatherRouter } from './routes/weather.js';
import { marketRouter } from './routes/market.js';
import { toolsRouter } from './routes/tools.js';
import { voiceRouter } from './routes/voice.js';
import { growRouter } from './routes/grow.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/crop-doctor', cropDoctorRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/market', marketRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/grow', growRouter);

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'FarmIQ API' }));

app.listen(PORT, () => {
  console.log(`🌱 FarmIQ API running on http://localhost:${PORT}`);
});
