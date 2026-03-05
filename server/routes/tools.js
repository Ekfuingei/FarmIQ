/**
 * Tool & Equipment Sharing — Hello Tractor style
 * List tractor, sprayer, harvester, irrigation pump for rent
 * Book by hour/day, GPS tracking, community ratings
 */
import { Router } from 'express';

const router = Router();

const EQUIPMENT_TYPES = ['tractor', 'sprayer', 'harvester', 'irrigation pump'];

const CURRENCY = { Nigeria: 'NGN', Kenya: 'KES', Ghana: 'GHS', Tanzania: 'TZS', Cameroon: 'XAF', 'DR Congo': 'CDF', Egypt: 'EGP', Morocco: 'MAD', Algeria: 'DZD', 'South Africa': 'ZAR' };

// In-memory store (replace with Supabase/DB for production)
let equipment = [
  { id: '1', type: 'tractor', name: 'John Deere 5055E', owner: 'Ibrahim Farms', ownerPhone: '+2348012345678', lat: 6.5244, lng: 3.3792, country: 'Nigeria', currency: 'NGN', ratePerHour: 15000, ratePerDay: 95000, rating: 4.7, reviews: 24 },
  { id: '2', type: 'sprayer', name: 'Knapsack Sprayer 20L', owner: 'Amina Agros', ownerPhone: '+254712345678', lat: -1.2921, lng: 36.8219, country: 'Kenya', currency: 'KES', ratePerHour: 500, ratePerDay: 2500, rating: 4.5, reviews: 12 },
  { id: '3', type: 'harvester', name: 'Combine Harvester', owner: 'Sunrise Co-op', ownerPhone: '+233241234567', lat: 5.6037, lng: -0.1870, country: 'Ghana', currency: 'GHS', ratePerHour: 800, ratePerDay: 4500, rating: 4.9, reviews: 8 },
  { id: '4', type: 'irrigation pump', name: 'Diesel Pump 3HP', owner: 'Water Ways', ownerPhone: '+255712345678', lat: -6.7924, lng: 39.2083, country: 'Tanzania', currency: 'TZS', ratePerHour: 3000, ratePerDay: 18000, rating: 4.3, reviews: 18 },
  { id: '5', type: 'tractor', name: 'Mahindra 575', owner: 'Green Valley', ownerPhone: '+237691234567', lat: 4.0483, lng: 9.7043, country: 'Cameroon', currency: 'XAF', ratePerHour: 12000, ratePerDay: 75000, rating: 4.6, reviews: 15 },
];

let bookings = [];
let ratings = [];

// GET /api/tools — list equipment, filter by type, lat/lng (nearby)
router.get('/', (req, res) => {
  const { type, lat, lng, country } = req.query;
  let list = [...equipment];
  if (type) list = list.filter(e => e.type === type);
  if (country) list = list.filter(e => e.country?.toLowerCase() === country.toLowerCase());
  if (lat && lng) {
    const userLat = parseFloat(lat), userLng = parseFloat(lng);
    list = list.map(e => ({
      ...e,
      distance: Math.round(
        Math.sqrt(Math.pow(e.lat - userLat, 2) + Math.pow(e.lng - userLng, 2)) * 111
      ), // approx km
    })).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }
  res.json({ equipment: list, types: EQUIPMENT_TYPES });
});

// POST /api/tools — list new equipment
router.post('/', (req, res) => {
  const { type, name, owner, ownerPhone, lat, lng, country, ratePerHour, ratePerDay } = req.body;
  if (!type || !name || !owner || !ownerPhone || !country || !ratePerHour || !ratePerDay) {
    return res.status(400).json({ error: 'Missing required fields: type, name, owner, ownerPhone, country, ratePerHour, ratePerDay' });
  }
  if (!EQUIPMENT_TYPES.includes(type)) {
    return res.status(400).json({ error: `Type must be one of: ${EQUIPMENT_TYPES.join(', ')}` });
  }
  const id = String(equipment.length + 1);
  const newEquip = {
    id,
    type,
    name,
    owner,
    ownerPhone,
    lat: parseFloat(lat) || 0,
    lng: parseFloat(lng) || 0,
    country,
    currency: CURRENCY[country] || 'NGN',
    ratePerHour: Number(ratePerHour),
    ratePerDay: Number(ratePerDay),
    rating: 0,
    reviews: 0,
  };
  equipment.push(newEquip);
  res.status(201).json(newEquip);
});

// GET /api/tools/:id — equipment detail + GPS location
router.get('/:id', (req, res) => {
  const e = equipment.find(x => x.id === req.params.id);
  if (!e) return res.status(404).json({ error: 'Equipment not found' });
  res.json(e);
});

// POST /api/tools/:id/book — book equipment (hour or day)
router.post('/:id/book', (req, res) => {
  const { durationHours, durationDays, farmerName, farmerPhone } = req.body;
  const equip = equipment.find(e => e.id === req.params.id);
  if (!equip) return res.status(404).json({ error: 'Equipment not found' });
  const hours = durationHours ? Number(durationHours) : (durationDays ? Number(durationDays) * 8 : 1);
  const cost = hours <= 8 ? equip.ratePerHour * hours : Math.ceil(hours / 8) * equip.ratePerDay;
  const booking = {
    id: String(bookings.length + 1),
    equipmentId: equip.id,
    equipmentName: equip.name,
    owner: equip.owner,
    farmerName: farmerName || 'Farmer',
    farmerPhone: farmerPhone || '',
    durationHours: hours,
    cost,
    status: 'pending',
    lat: equip.lat,
    lng: equip.lng,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  res.status(201).json({
    ...booking,
    message: 'Booking request sent. Owner will contact you at ' + (farmerPhone || 'your number') + '.',
  });
});

// GET /api/tools/bookings/:bookingId — get booking (for GPS tracking)
router.get('/bookings/:bookingId', (req, res) => {
  const b = bookings.find(x => x.id === req.params.bookingId);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  const equip = equipment.find(e => e.id === b.equipmentId);
  res.json({
    ...b,
    gps: equip ? { lat: equip.lat, lng: equip.lng } : null,
    trackingUrl: equip ? `https://www.google.com/maps?q=${equip.lat},${equip.lng}` : null,
  });
});

// POST /api/tools/:id/rate — rate equipment owner
router.post('/:id/rate', (req, res) => {
  const { stars, review } = req.body;
  const equip = equipment.find(e => e.id === req.params.id);
  if (!equip) return res.status(404).json({ error: 'Equipment not found' });
  const s = Math.min(5, Math.max(1, Number(stars) || 5));
  ratings.push({ equipmentId: equip.id, stars: s, review: review || '' });
  const equipRatings = ratings.filter(r => r.equipmentId === equip.id);
  const avg = equipRatings.reduce((a, r) => a + r.stars, 0) / equipRatings.length;
  equip.rating = Math.round(avg * 10) / 10;
  equip.reviews = equipRatings.length;
  res.json({ rating: equip.rating, reviews: equip.reviews });
});

export const toolsRouter = router;
