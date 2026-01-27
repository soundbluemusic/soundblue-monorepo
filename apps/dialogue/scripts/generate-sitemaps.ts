#!/usr/bin/env npx tsx

/**
 * Sitemap generator for dialogue.soundbluemusic.com
 *
 * 🔄 AUTO-SYNC: Routes are scanned from src/routes directory
 */

import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://dialogue.soundbluemusic.com';
const PUBLIC_DIR = 'public';
const OUT_DIR = 'dist/client';

function getLastmodDate(): string {
  return new Date().toISOString().split('T')[0];
}

interface UrlDef {
  path: string;
  priority: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Route priority & changefreq configuration
const ROUTE_CONFIG: Record<string, { priority: string; changefreq: UrlDef['changefreq'] }> = {
  index: { priority: '1.0', changefreq: 'weekly' },
  about: { priority: '0.8', changefreq: 'monthly' },
  changelog: { priority: '0.5', changefreq: 'monthly' },
  'built-with': { priority: '0.4', changefreq: 'monthly' },
  sitemap: { priority: '0.3', changefreq: 'monthly' },
};
const DEFAULT_CONFIG = { priority: '0.5', changefreq: 'monthly' as const };

// 🔄 AUTO-SYNC: Scan routes directory
function scanRoutes(): string[] {
  const routesDir = join(process.cwd(), 'src/routes');
  const files = readdirSync(routesDir);

  const routes = files
    .filter(
      (f) =>
        f.endsWith('.tsx') &&
        !f.startsWith('__') &&
        !f.endsWith('.lazy.tsx') &&
        f !== 'sitemap.tsx',
    )
    .map((f) => f.replace('.tsx', ''))
    .map((name) => (name === 'index' ? '' : name));

  // Add sitemap at the end
  routes.push('sitemap');

  return routes;
}

// Generate routes from scanned directory
function generateRoutes(): UrlDef[] {
  const routes = scanRoutes();
  const result: UrlDef[] = [];

  for (const route of routes) {
    const config = ROUTE_CONFIG[route || 'index'] || DEFAULT_CONFIG;
    const path = route === '' ? '' : route;

    result.push({ path, ...config });
  }

  return result;
}

const PAGES = generateRoutes();

// Generate URL entry with hreflang
function generateUrlEntry(item: UrlDef, lastmod: string): string {
  const enUrl = item.path === '' ? SITE_URL : `${SITE_URL}/${item.path}`;
  const koUrl = item.path === '' ? `${SITE_URL}/ko` : `${SITE_URL}/ko/${item.path}`;

  return `  <url>
    <loc>${enUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="ko" href="${koUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>
  <url>
    <loc>${koUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="ko" href="${koUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`;
}

// Generate sitemap index
function generateSitemapIndex(): string {
  const lastmod = getLastmodDate();
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// Generate pages sitemap
function generatePagesSitemap(): string {
  const lastmod = getLastmodDate();
  const urls = PAGES.map((page) => generateUrlEntry(page, lastmod)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

function writeToDirectories(filename: string, content: string): void {
  writeFileSync(join(PUBLIC_DIR, filename), content, 'utf-8');
  console.log(`  ${filename}`);

  if (existsSync(OUT_DIR)) {
    writeFileSync(join(OUT_DIR, filename), content, 'utf-8');
  }
}

function main(): void {
  console.log('Generating sitemaps...\n');

  // Sitemap Index
  writeToDirectories('sitemap.xml', generateSitemapIndex());

  // Pages Sitemap
  writeToDirectories('sitemap-pages.xml', generatePagesSitemap());
  console.log(`    └─ ${PAGES.length * 2} URLs (${PAGES.length} pages × 2 langs)`);

  console.log(`\nTotal: ${PAGES.length * 2} URLs`);
  console.log(`\n🔄 Auto-synced from src/routes directory`);
}

main();
