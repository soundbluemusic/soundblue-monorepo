#!/usr/bin/env node
/**
 * Post-build script for React Router:
 * 1. Generate sitemap_index.xml (sitemap index)
 * 2. Generate sitemap-pages.xml (static pages)
 * 3. Generate robots.txt
 *
 * Structure:
 * sitemap_index.xml
 * ├── sitemap-pages.xml   (static pages)
 * ├── sitemap-blog.xml    (future: blog posts)
 * └── sitemap-tracks.xml  (future: sound recordings)
 */

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT_DIR = 'dist/client';
const SITE_URL = 'https://soundbluemusic.com';
const STYLESHEET_INSTRUCTION = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

// All static routes for sitemap-pages.xml
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/ko/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about/', changefreq: 'monthly', priority: '0.9' },
  { path: '/ko/about/', changefreq: 'monthly', priority: '0.9' },
  { path: '/music/', changefreq: 'weekly', priority: '0.9' },
  { path: '/ko/music/', changefreq: 'weekly', priority: '0.9' },
  { path: '/sitemap/', changefreq: 'monthly', priority: '0.8' },
  { path: '/ko/sitemap/', changefreq: 'monthly', priority: '0.8' },
  { path: '/news/', changefreq: 'weekly', priority: '0.8' },
  { path: '/ko/news/', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog/', changefreq: 'weekly', priority: '0.8' },
  { path: '/ko/blog/', changefreq: 'weekly', priority: '0.8' },
  { path: '/chat/', changefreq: 'monthly', priority: '0.7' },
  { path: '/ko/chat/', changefreq: 'monthly', priority: '0.7' },
  { path: '/built-with/', changefreq: 'monthly', priority: '0.6' },
  { path: '/ko/built-with/', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy/', changefreq: 'yearly', priority: '0.5' },
  { path: '/ko/privacy/', changefreq: 'yearly', priority: '0.5' },
  { path: '/terms/', changefreq: 'yearly', priority: '0.5' },
  { path: '/ko/terms/', changefreq: 'yearly', priority: '0.5' },
  { path: '/license/', changefreq: 'yearly', priority: '0.5' },
  { path: '/ko/license/', changefreq: 'yearly', priority: '0.5' },
  { path: '/sound-recording/', changefreq: 'yearly', priority: '0.5' },
  { path: '/ko/sound-recording/', changefreq: 'yearly', priority: '0.5' },
];

// Sitemap index configuration
const SITEMAP_INDEX_ENTRIES = [
  { filename: 'sitemap-pages.xml', description: 'Static pages' },
  // Future sitemaps:
  // { filename: 'sitemap-blog.xml', description: 'Blog posts' },
  // { filename: 'sitemap-tracks.xml', description: 'Sound recordings' },
];

function generateUrlEntry(route) {
  const lastmod = new Date().toISOString().split('T')[0];
  const enPath = route.path.startsWith('/ko/') ? route.path.replace('/ko/', '/') : route.path;
  const koPath = route.path.startsWith('/ko/')
    ? route.path
    : `/ko${route.path === '/' ? '/' : route.path}`;

  let alternates = '';
  if (!route.path.includes('/ko/')) {
    alternates = `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${enPath}" />
    <xhtml:link rel="alternate" hreflang="ko" href="${SITE_URL}${koPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${enPath}" />`;
  } else {
    const enEquivalent = route.path.replace('/ko/', '/');
    alternates = `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${enEquivalent}" />
    <xhtml:link rel="alternate" hreflang="ko" href="${SITE_URL}${route.path}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${enEquivalent}" />`;
  }

  return `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>${alternates}
  </url>`;
}

async function generateSitemapPages() {
  const urlEntries = STATIC_ROUTES.map(generateUrlEntry).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
${STYLESHEET_INSTRUCTION}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

  await writeFile(join(OUT_DIR, 'sitemap-pages.xml'), sitemap, 'utf-8');
  console.log('✓ Generated sitemap-pages.xml');
}

async function generateSitemapIndex() {
  const lastmod = new Date().toISOString().split('T')[0];

  const sitemapEntries = SITEMAP_INDEX_ENTRIES.map(
    (entry) => `  <sitemap>
    <loc>${SITE_URL}/${entry.filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
  ).join('\n');

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
${STYLESHEET_INSTRUCTION}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

  await writeFile(join(OUT_DIR, 'sitemap.xml'), sitemapIndex, 'utf-8');
  console.log('✓ Generated sitemap.xml');
}

async function generateRobots() {
  const robots = `# robots.txt for ${SITE_URL}
# Sound Blue - Music Artist Website

# =============================================================================
# AI Crawlers - Explicitly Allowed
# =============================================================================
# OpenAI
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# Anthropic (Claude)
User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

# Google AI
User-agent: Google-Extended
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Amazon
User-agent: Amazonbot
Allow: /

# Microsoft/Bing AI
User-agent: Bingbot
Allow: /

# Apple
User-agent: Applebot
Allow: /

# Meta
User-agent: FacebookBot
Allow: /

# =============================================================================
# All Other Crawlers
# =============================================================================
User-agent: *
Allow: /

# Block dev paths
Disallow: /_build/
Disallow: /_server/

# Crawl-delay for polite crawling
Crawl-delay: 1

# =============================================================================
# Sitemaps & AI Context
# =============================================================================
Sitemap: ${SITE_URL}/sitemap.xml

# LLM context file for AI assistants
# See: https://llmstxt.org/
# File: ${SITE_URL}/llms.txt
`;

  await writeFile(join(OUT_DIR, 'robots.txt'), robots, 'utf-8');
  console.log('✓ Generated robots.txt');
}

async function main() {
  try {
    await generateSitemapIndex();
    await generateSitemapPages();
    await generateRobots();
    console.log('✅ Sitemap generation complete');
    console.log('');
    console.log('Structure:');
    console.log('  sitemap.xml');
    console.log('  └── sitemap-pages.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

main();
