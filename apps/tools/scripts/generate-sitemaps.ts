#!/usr/bin/env npx tsx

/**
 * Sitemap generator for tools.soundbluemusic.com
 * Generates sitemap index with pages and tools sitemaps
 */

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://tools.soundbluemusic.com';
const PUBLIC_DIR = 'public';
const OUT_DIR = '.output/public'; // SolidStart output directory

function getLastmodDate(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Page/Tool definition
interface UrlDef {
  path: string; // English path (without locale prefix)
  priority: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// Static pages (actual existing pages)
const PAGES: UrlDef[] = [
  { path: '', priority: '1.0', changefreq: 'daily' }, // Home
  { path: 'built-with', priority: '0.6', changefreq: 'monthly' },
];

// Tool pages (actual existing tools)
const TOOLS: UrlDef[] = [
  { path: 'metronome', priority: '0.9', changefreq: 'weekly' },
  { path: 'drum-machine', priority: '0.9', changefreq: 'weekly' },
  { path: 'qr', priority: '0.8', changefreq: 'monthly' },
];

// Generate URL (no trailing slash for cleaner URLs)
function getUrl(path: string, locale?: 'ko'): string {
  if (path === '') {
    return locale ? `${SITE_URL}/ko` : SITE_URL;
  }
  return locale ? `${SITE_URL}/ko/${path}` : `${SITE_URL}/${path}`;
}

// Generate URL entry with hreflang
function generateUrlEntry(item: UrlDef, lastmod: string): string {
  const enUrl = getUrl(item.path);
  const koUrl = getUrl(item.path, 'ko');

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

// Generate sitemap index (sitemap.xml)
function generateSitemapIndex(): string {
  const lastmod = getLastmodDate();
  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-tools.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

// Generate pages sitemap (sitemap-pages.xml)
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

// Generate tools sitemap (sitemap-tools.xml)
function generateToolsSitemap(): string {
  const lastmod = getLastmodDate();
  const urls = TOOLS.map((tool) => generateUrlEntry(tool, lastmod)).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

// Generate XSL stylesheet (sitemap.xsl)
function generateXslStylesheet(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html>
      <head>
        <title>
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">Sitemap Index - Tools</xsl:when>
            <xsl:otherwise>Sitemap - Tools</xsl:otherwise>
          </xsl:choose>
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          :root {
            --bg: #ffffff;
            --text: #1a1a1a;
            --text-muted: #666666;
            --border: #e5e5e5;
            --link: #2563eb;
            --link-hover: #1d4ed8;
            --en-badge: #22c55e;
            --ko-badge: #eab308;
            --header-bg: #f8fafc;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0f172a;
              --text: #f1f5f9;
              --text-muted: #94a3b8;
              --border: #334155;
              --link: #60a5fa;
              --link-hover: #93c5fd;
              --header-bg: #1e293b;
            }
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem 1rem;
          }

          .container { max-width: 1000px; margin: 0 auto; }

          h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }

          .subtitle {
            color: var(--text-muted);
            margin-bottom: 2rem;
            font-size: 0.875rem;
          }

          table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

          th {
            text-align: left;
            padding: 0.75rem 1rem;
            background: var(--header-bg);
            border-bottom: 2px solid var(--border);
            font-weight: 600;
          }

          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
          }

          /* Group multilingual pages - no border between EN/KO pairs */
          tr.group-first td { border-bottom: none; padding-bottom: 0.375rem; }
          tr.group-last td { padding-top: 0.375rem; }

          tr:hover td { background: var(--header-bg); }
          tr.group-first:hover td, tr.group-first:hover + tr td { background: var(--header-bg); }

          a { color: var(--link); text-decoration: none; word-break: break-all; }
          a:hover { color: var(--link-hover); text-decoration: underline; }

          .badge {
            display: inline-block;
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-right: 0.5rem;
          }

          .badge-en { background: var(--en-badge); color: white; }
          .badge-ko { background: var(--ko-badge); color: #1a1a1a; }

          .stats {
            margin-top: 2rem;
            padding: 1rem;
            background: var(--header-bg);
            border-radius: 0.5rem;
            font-size: 0.875rem;
            color: var(--text-muted);
          }

          @media (max-width: 640px) {
            body { padding: 1rem 0.5rem; }
            th, td { padding: 0.5rem; }
            .hide-mobile { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <xsl:call-template name="sitemapindex" />
            </xsl:when>
            <xsl:otherwise>
              <xsl:call-template name="urlset" />
            </xsl:otherwise>
          </xsl:choose>
        </div>
      </body>
    </html>
  </xsl:template>

  <!-- Sitemap Index Template -->
  <xsl:template name="sitemapindex">
    <h1>Sitemap Index</h1>
    <p class="subtitle">tools.soundbluemusic.com</p>

    <table>
      <thead>
        <tr>
          <th>Sitemap</th>
          <th class="hide-mobile">Last Modified</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
          <tr>
            <td>
              <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
            </td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:lastmod" /></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <div class="stats">
      Total: <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)" /> sitemaps
    </div>
  </xsl:template>

  <!-- URL Set Template -->
  <xsl:template name="urlset">
    <h1>Sitemap</h1>
    <p class="subtitle">tools.soundbluemusic.com</p>

    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th class="hide-mobile">Priority</th>
          <th class="hide-mobile">Freq</th>
        </tr>
      </thead>
      <tbody>
        <xsl:for-each select="sitemap:urlset/sitemap:url">
          <tr>
            <xsl:attribute name="class">
              <xsl:choose>
                <xsl:when test="contains(sitemap:loc, '/ko/')">group-last</xsl:when>
                <xsl:when test="substring(sitemap:loc, string-length(sitemap:loc) - 2) = '/ko'">group-last</xsl:when>
                <xsl:otherwise>group-first</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            <td>
              <xsl:choose>
                <xsl:when test="contains(sitemap:loc, '/ko')">
                  <span class="badge badge-ko">KO</span>
                </xsl:when>
                <xsl:otherwise>
                  <span class="badge badge-en">EN</span>
                </xsl:otherwise>
              </xsl:choose>
              <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc" /></a>
            </td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:priority" /></td>
            <td class="hide-mobile"><xsl:value-of select="sitemap:changefreq" /></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <div class="stats">
      Total: <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> URLs
    </div>
  </xsl:template>

</xsl:stylesheet>`;
}

// Generate robots.txt with AI crawler settings
function generateRobotsTxt(): string {
  return `# Robots.txt for ${SITE_URL}

# Default rules for all crawlers
User-agent: *
Allow: /
Crawl-delay: 1

# Disallow build artifacts
Disallow: /_build/
Disallow: /_server/

# ========================================
# AI Chatbot Crawlers - Explicitly Allowed
# ========================================

# OpenAI (ChatGPT)
User-agent: GPTBot
Allow: /

# OpenAI (ChatGPT plugins)
User-agent: ChatGPT-User
Allow: /

# Anthropic (Claude)
User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

# Google (Gemini / Bard)
User-agent: Google-Extended
Allow: /

# Perplexity AI
User-agent: PerplexityBot
Allow: /

# Microsoft Copilot / Bing AI
User-agent: Bingbot
Allow: /

# Meta AI
User-agent: Meta-ExternalAgent
Allow: /

User-agent: FacebookBot
Allow: /

# Cohere AI
User-agent: cohere-ai
Allow: /

# Common Crawl (used by many AI training datasets)
User-agent: CCBot
Allow: /

# ========================================
# Sitemaps & LLM Info
# ========================================

Sitemap: ${SITE_URL}/sitemap.xml

# AI Assistant Guide
# See: ${SITE_URL}/llms.txt
`;
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

  // Tools Sitemap
  writeToDirectories('sitemap-tools.xml', generateToolsSitemap());
  console.log(`    └─ ${TOOLS.length * 2} URLs (${TOOLS.length} tools × 2 langs)`);

  // XSL Stylesheet
  writeToDirectories('sitemap.xsl', generateXslStylesheet());

  // Robots.txt
  writeToDirectories('robots.txt', generateRobotsTxt());

  const totalUrls = (PAGES.length + TOOLS.length) * 2;
  console.log(`\nTotal: ${totalUrls} URLs across 2 sitemaps`);
}

main();
