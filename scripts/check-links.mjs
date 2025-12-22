#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Recursively find all HTML files in a directory
 */
async function findHtmlFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await findHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract internal links from HTML content
 */
function extractLinks(html, _baseDir) {
  const links = new Set();

  // Match href and src attributes
  const hrefRegex = /(?:href|src)=["']([^"']+)["']/gi;
  let match = hrefRegex.exec(html);

  while (match !== null) {
    const link = match[1];
    match = hrefRegex.exec(html);

    // Skip external links, anchors, data URIs, and special protocols
    if (
      link.startsWith('http://') ||
      link.startsWith('https://') ||
      link.startsWith('//') ||
      link.startsWith('#') ||
      link.startsWith('mailto:') ||
      link.startsWith('tel:') ||
      link.startsWith('data:') ||
      link.startsWith('javascript:')
    ) {
      continue;
    }

    // Remove query strings and anchors
    const cleanLink = link.split('?')[0].split('#')[0];

    if (cleanLink) {
      links.add(cleanLink);
    }
  }

  return links;
}

/**
 * Check if a link exists
 */
async function linkExists(link, baseDir) {
  try {
    const fullPath = join(baseDir, link);
    await readFile(fullPath);
    return true;
  } catch {
    // Try with index.html appended
    try {
      const indexPath = link.endsWith('/')
        ? join(baseDir, link, 'index.html')
        : join(baseDir, link, 'index.html');
      await readFile(indexPath);
      return true;
    } catch {
      // Try as HTML file
      try {
        const htmlPath = join(baseDir, `${link}.html`);
        await readFile(htmlPath);
        return true;
      } catch {
        return false;
      }
    }
  }
}

/**
 * Check all links in a directory
 */
async function checkLinks(appName, buildDir) {
  console.log(`\n🔍 Checking links in ${appName}...`);
  console.log(`   Build directory: ${buildDir}\n`);

  const htmlFiles = await findHtmlFiles(buildDir);
  console.log(`   Found ${htmlFiles.length} HTML files\n`);

  const allLinks = new Set();
  const brokenLinks = new Map();

  // Extract all links from all HTML files
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf-8');
    const links = extractLinks(html, buildDir);

    for (const link of links) {
      allLinks.add(link);
    }
  }

  console.log(`   Found ${allLinks.size} unique internal links\n`);

  // Check each link
  for (const link of allLinks) {
    const exists = await linkExists(link, buildDir);

    if (!exists) {
      brokenLinks.set(link, true);
    }
  }

  // Report results
  if (brokenLinks.size === 0) {
    console.log(`   ✅ All ${allLinks.size} links are valid!\n`);
    return 0;
  }

  console.log(`   ❌ Found ${brokenLinks.size} broken links:\n`);
  for (const link of brokenLinks.keys()) {
    console.log(`      - ${link}`);
  }
  console.log('');

  return brokenLinks.size;
}

/**
 * Main function
 */
async function main() {
  const apps = [
    { name: 'Sound Blue', path: join(__dirname, '../apps/sound-blue/build/client') },
    { name: 'Tools', path: join(__dirname, '../apps/tools/build/client') },
    { name: 'Dialogue', path: join(__dirname, '../apps/dialogue/build/client') },
  ];

  let totalBroken = 0;

  for (const app of apps) {
    try {
      const broken = await checkLinks(app.name, app.path);
      totalBroken += broken;
    } catch (error) {
      console.error(`   ❌ Error checking ${app.name}: ${error.message}\n`);
    }
  }

  console.log('═'.repeat(60));
  if (totalBroken === 0) {
    console.log('✅ All links are valid across all apps!');
  } else {
    console.log(`❌ Total broken links found: ${totalBroken}`);
  }
  console.log('═'.repeat(60));

  process.exit(totalBroken > 0 ? 1 : 0);
}

main();
