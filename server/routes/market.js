/**
 * Live Market Prices — placeholder for crowdsourced/verified data
 * Pan-African: West, East, Southern, Central, North Africa
 * Hook up to your own DB or external APIs
 */
import { Router } from 'express';

const router = Router();

// Mock data — markets across all African regions (replace with real crowdsourced data)
const MOCK_MARKETS = [
  // West Africa
  { name: 'Lagos Mile 12', country: 'Nigeria', crop: 'Tomato', price: 45000, currency: 'NGN', unit: 'crate', trend: 'up' },
  { name: 'Kano Sabon Gari', country: 'Nigeria', crop: 'Yam', price: 28000, currency: 'NGN', unit: '100kg', trend: 'stable' },
  { name: 'Accra Agbogbloshie', country: 'Ghana', crop: 'Cassava', price: 180, currency: 'GHS', unit: '100kg', trend: 'down' },
  // East Africa
  { name: 'Nairobi Wakulima', country: 'Kenya', crop: 'Maize', price: 5200, currency: 'KES', unit: '90kg', trend: 'up' },
  { name: 'Dar es Salaam Kariakoo', country: 'Tanzania', crop: 'Rice', price: 185000, currency: 'TZS', unit: '100kg', trend: 'stable' },
  // Southern Africa
  { name: 'Johannesburg City Deep', country: 'South Africa', crop: 'Maize', price: 4200, currency: 'ZAR', unit: 'ton', trend: 'up' },
  // Central Africa
  { name: 'Douala Central', country: 'Cameroon', crop: 'Plantain', price: 8500, currency: 'XAF', unit: 'bunch', trend: 'stable' },
  { name: 'Kinshasa Marché', country: 'DR Congo', crop: 'Cassava', price: 12000, currency: 'CDF', unit: '100kg', trend: 'up' },
  // North Africa
  { name: 'Cairo Rod El Farag', country: 'Egypt', crop: 'Wheat', price: 12500, currency: 'EGP', unit: '100kg', trend: 'down' },
  { name: 'Casablanca Derb Omar', country: 'Morocco', crop: 'Olives', price: 18, currency: 'MAD', unit: 'kg', trend: 'up' },
  { name: 'Algiers Bab Ezzouar', country: 'Algeria', crop: 'Dates', price: 850, currency: 'DZD', unit: 'kg', trend: 'stable' },
];

router.get('/prices', (_, res) => {
  res.json({ markets: MOCK_MARKETS, updated: new Date().toISOString() });
});

router.get('/best-market', (req, res) => {
  const { crop } = req.query;
  const match = MOCK_MARKETS.find(m => m.crop.toLowerCase() === (crop || 'tomato').toLowerCase());
  res.json({ best: match || MOCK_MARKETS[0], message: 'Best market to sell today based on location' });
});

export const marketRouter = router;
