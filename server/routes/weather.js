/**
 * Hyper-Local Weather — Open-Meteo API (free, no API key)
 * Works across Africa — pass lat/lng for any location
 */
import { Router } from 'express';
import axios from 'axios';

const router = Router();
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';

// Default: Nairobi (East Africa) — use lat/lng query for user's location
const DEFAULT_LAT = -1.2921;
const DEFAULT_LNG = 36.8219;

router.get('/forecast', async (req, res) => {
  try {
    const { lat = DEFAULT_LAT, lng = DEFAULT_LNG } = req.query;
    const { data } = await axios.get(OPEN_METEO, {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
        timezone: 'auto', // Uses location to pick Africa/* timezone
        forecast_days: 7,
      },
    });
    res.json(data);
  } catch (err) {
    console.error('Weather error:', err);
    res.status(500).json({ error: 'Weather forecast unavailable' });
  }
});

router.get('/planting-tip', async (req, res) => {
  try {
    const lat = req.query.lat || DEFAULT_LAT;
    const lng = req.query.lng || DEFAULT_LNG;
    const { data } = await axios.get(OPEN_METEO, {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'precipitation_sum',
        timezone: 'auto',
        forecast_days: 1,
      },
    });
    const rain = data?.daily?.precipitation_sum?.[0] ?? 0;
    const tip = rain > 20
      ? 'Heavy rain expected. Consider planting in 2-3 days when rain eases.'
      : 'Weather looks suitable for planting. Water seedlings if soil is dry.';
    res.json({ tip });
  } catch {
    res.json({ tip: 'Check local weather before planting. Keep soil moist for new seeds.' });
  }
});

// GET /api/weather/alerts — detect heavy rain, drought risk, extreme heat
router.get('/alerts', async (req, res) => {
  try {
    const lat = req.query.lat || DEFAULT_LAT;
    const lng = req.query.lng || DEFAULT_LNG;
    const { data } = await axios.get(OPEN_METEO, {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode',
        timezone: 'auto',
        forecast_days: 7,
      },
    });
    const alerts = [];
    const precip = data?.daily?.precipitation_sum || [];
    const tMax = data?.daily?.temperature_2m_max || [];
    const days = data?.daily?.time || [];
    for (let i = 0; i < Math.min(7, precip.length); i++) {
      const rain = precip[i] ?? 0;
      const temp = tMax[i] ?? 0;
      if (rain > 25) alerts.push({ type: 'heavy_rain', day: days[i], msg: `Heavy rain (${Math.round(rain)}mm). Delay spraying, protect seedlings.` });
      if (temp > 35) alerts.push({ type: 'heat', day: days[i], msg: `Very hot (${Math.round(temp)}°C). Water early morning; shade young plants.` });
    }
    const totalRain7 = precip.reduce((a, b) => a + (b || 0), 0);
    if (totalRain7 < 5 && precip.length >= 5) alerts.push({ type: 'drought_risk', day: null, msg: 'Little rain expected. Water crops; delay planting if possible.' });
    res.json({ alerts });
  } catch {
    res.json({ alerts: [] });
  }
});

export const weatherRouter = router;
