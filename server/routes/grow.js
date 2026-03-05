/**
 * Grow — Planting calendar, crop rotation, post-harvest tips
 */
import { Router } from 'express';

const router = Router();

// Planting windows by crop (month ranges, 1-12) — simplified for Africa
// Format: { crop: { west: [start, end], east: [start, end], south: [start, end], central: [start, end], north: [start, end] } }
const PLANTING_WINDOWS = {
  maize: { west: [3, 6], east: [2, 4], south: [9, 11], central: [3, 5], north: [10, 12] },
  cassava: { west: [3, 5], east: [9, 11], south: [9, 11], central: [3, 5], north: [3, 5] },
  yam: { west: [2, 4], east: [9, 10], south: [9, 10], central: [2, 4], north: [3, 4] },
  rice: { west: [4, 6], east: [2, 4], south: [10, 12], central: [3, 5], north: [4, 5] },
  sorghum: { west: [4, 6], east: [2, 4], south: [10, 12], central: [4, 6], north: [4, 6] },
  beans: { west: [3, 6], east: [2, 4], south: [9, 11], central: [3, 5], north: [3, 5] },
  cowpea: { west: [4, 6], east: [2, 4], south: [10, 11], central: [4, 6], north: [4, 6] },
  millet: { west: [4, 6], east: [2, 4], south: [10, 11], central: [4, 6], north: [4, 6] },
  tomato: { west: [8, 10], east: [2, 4], south: [8, 10], central: [8, 10], north: [2, 4] },
};

// Crop rotation: what to plant after X
const ROTATION_RULES = {
  maize: ['beans', 'cowpea', 'cassava', 'sorghum'],
  cassava: ['maize', 'beans', 'yam'],
  yam: ['maize', 'beans', 'cassava'],
  beans: ['maize', 'sorghum', 'cassava'],
  rice: ['beans', 'vegetables', 'fallow'],
  sorghum: ['beans', 'cowpea', 'maize'],
};

// Post-harvest storage tips by crop
const POST_HARVEST_TIPS = {
  maize: ['Dry cobs to 12-13% moisture before storage', 'Store in airtight bags or cribs away from pests', 'Apply diatomaceous earth to prevent weevils'],
  cassava: ['Process within 2-3 days — fresh cassava spoils fast', 'Dry to gari or fufu for longer storage', 'Store in cool, dry place if keeping fresh'],
  yam: ['Cure yams 1-2 weeks in shade before storage', 'Store in ventilated, cool place (not fridge)', 'Avoid bruises — they rot faster'],
  rice: ['Dry to 14% moisture before storage', 'Store in sealed bags to prevent insects', 'Keep away from rodents'],
  sorghum: ['Thresh and dry before storage', 'Store in dry, ventilated place', 'Check for weevils regularly'],
  beans: ['Dry thoroughly before storing', 'Use hermetic bags to prevent bruchids', 'Store off the ground'],
  tomato: ['Sort: ripe for immediate use, green to ripen', 'Do not refrigerate unripe tomatoes', 'Use within 1-2 weeks'],
};

function getRegion(lat, lng) {
  if (lat >= 15) return 'north';
  if (lat < -5) return 'south';
  if (lng > 20) return 'east';
  if (lng < 10 && lng > -10) return 'central';
  return 'west';
}

// GET /api/grow/planting-calendar?crop=maize&lat=&lng=
router.get('/planting-calendar', (req, res) => {
  const { crop = 'maize', lat = -1.29, lng = 36.82 } = req.query;
  const region = getRegion(parseFloat(lat), parseFloat(lng));
  const windows = PLANTING_WINDOWS[crop.toLowerCase()] || PLANTING_WINDOWS.maize;
  const [start, end] = windows[region] || windows.west;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const monthNames = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let status = 'now';
  if (currentMonth < start) status = 'upcoming';
  else if (currentMonth > end) status = 'passed';
  res.json({
    crop,
    region,
    window: { start, end, startName: monthNames[start], endName: monthNames[end] },
    status,
    tip: status === 'now' ? 'Good time to plant. Prepare land and seeds.' : status === 'upcoming' ? `Plant in ${monthNames[start]}-${monthNames[end]}. Prepare now.` : `Planting window passed. Next season: ${monthNames[start]}-${monthNames[end]}.`,
  });
});

// GET /api/grow/rotation?after=maize
router.get('/rotation', (req, res) => {
  const after = (req.query.after || 'maize').toLowerCase();
  const next = ROTATION_RULES[after] || ROTATION_RULES.maize;
  res.json({ after, suggested: next, tip: `After ${after}, plant ${next.join(', ')} to restore soil and reduce pests.` });
});

// GET /api/grow/post-harvest?crop=maize
router.get('/post-harvest', (req, res) => {
  const crop = (req.query.crop || 'maize').toLowerCase();
  const tips = POST_HARVEST_TIPS[crop] || POST_HARVEST_TIPS.maize;
  res.json({ crop, tips });
});

// GET /api/grow/post-harvest/all
router.get('/post-harvest/all', (_, res) => {
  res.json({ crops: Object.keys(POST_HARVEST_TIPS), tips: POST_HARVEST_TIPS });
});

// GET /api/grow/care-milestones?crop=maize
router.get('/care-milestones', (req, res) => {
  const crop = (req.query.crop || 'maize').toLowerCase();
  // Key growth stages in days after planting
  const milestones = {
    maize: [
      { day: 14, task: 'First weeding', desc: 'Remove weeds to reduce competition.' },
      { day: 42, task: 'Top-dress fertilizer', desc: 'Apply nitrogen (e.g. urea) between rows.' },
      { day: 60, task: 'Second weeding', desc: 'Final weeding before canopy closes.' },
      { day: 90, task: 'Check for pests', desc: 'Look for fall armyworm, stalk borers.' },
    ],
    cassava: [
      { day: 30, task: 'First weeding', desc: 'Keep area weed-free.' },
      { day: 90, task: 'Second weeding', desc: 'Weed before canopy closes.' },
      { day: 180, task: 'Harvest window', desc: 'Can harvest from 6 months.' },
    ],
    beans: [
      { day: 21, task: 'First weeding', desc: 'Remove weeds early.' },
      { day: 35, task: 'Flowering check', desc: 'Water if dry; watch for aphids.' },
      { day: 60, task: 'Harvest', desc: 'Pick when pods are dry.' },
    ],
    rice: [
      { day: 14, task: 'First weeding', desc: 'Critical for upland rice.' },
      { day: 45, task: 'Fertilizer top-dress', desc: 'Apply before flowering.' },
    ],
    yam: [
      { day: 30, task: 'Stake vines', desc: 'Support vines for better yield.' },
      { day: 90, task: 'Second weeding', desc: 'Keep mounds weed-free.' },
    ],
  };
  const m = milestones[crop] || milestones.maize;
  res.json({ crop, milestones: m });
});

export const growRouter = router;
