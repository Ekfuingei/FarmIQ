/**
 * JSON-LD structured data for search engines
 */
import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://farmiq.app';

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'FarmIQ',
  alternateName: 'FarmIQ - Your Farming Super-App',
  url: SITE_URL,
  description: 'AI Crop Doctor, weather forecast, market prices & tool sharing for African farmers. Free. Works in Hausa, Yoruba, Igbo, Pidgin, French, Arabic, Swahili & English.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI Crop & Soil Doctor',
    '7-day Weather Forecast',
    'Market Prices Across Africa',
    'Tool & Equipment Sharing',
    'Voice Assistant (8 languages)',
    'Planting Calendar & Crop Care',
  ],
  inLanguage: ['en', 'ha', 'yo', 'ig', 'pcm', 'fr', 'ar', 'sw'],
};

export function StructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(webAppSchema)}
      </script>
    </Helmet>
  );
}
