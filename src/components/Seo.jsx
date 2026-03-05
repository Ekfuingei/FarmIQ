/**
 * SEO meta tags per page — title, description, Open Graph, Twitter Cards
 * Set VITE_APP_URL in .env.production for your deployed domain.
 */
import { Helmet } from 'react-helmet-async';

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://farmiq.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`;

export function Seo({
  title = 'FarmIQ — Your Farming Super-App',
  description = 'FarmIQ — Your farming super-app. AI Crop Doctor, weather, market prices & tool sharing for African farmers. Free, in your language.',
  path = '/',
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}) {
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`;
  const fullTitle = title.includes('FarmIQ') ? title : `${title} | FarmIQ`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="FarmIQ" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
