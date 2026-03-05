#!/usr/bin/env node
/**
 * Generates sitemap.xml at build time.
 * Set VITE_APP_URL in .env.production for your domain.
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config({ path: '.env.production' });
config({ path: '.env' });

const baseUrl = process.env.VITE_APP_URL || 'https://farmiq.app';
const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

const routes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/crop-doctor', priority: 0.9, changefreq: 'weekly' },
  { path: '/weather', priority: 0.9, changefreq: 'daily' },
  { path: '/market', priority: 0.9, changefreq: 'daily' },
  { path: '/tools', priority: 0.9, changefreq: 'weekly' },
  { path: '/voice', priority: 0.9, changefreq: 'weekly' },
  { path: '/grow', priority: 0.9, changefreq: 'weekly' },
];

const lastmod = new Date().toISOString().split('T')[0];
const urls = routes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.path === '/' ? '' : r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(distDir, 'sitemap.xml'), sitemap);

const robots = `# FarmIQ - Allow all crawlers
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
writeFileSync(join(distDir, 'robots.txt'), robots);

console.log('✅ sitemap.xml & robots.txt generated for', baseUrl);
