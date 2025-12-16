#!/usr/bin/env node
/**
 * Post-build script for sitemap processing:
 * 1. Rename sitemap-0.xml to sitemap-pages.xml
 * 2. Update references in sitemap.xml index
 * 3. Add XSL stylesheet reference to all sitemap XML files
 */

import { readdir, readFile, writeFile, rename, access } from 'node:fs/promises';
import { join } from 'node:path';

const OUT_DIR = 'out';
const STYLESHEET_INSTRUCTION = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';
const SITE_URL = 'https://soundbluemusic.com';

// Mapping of generated sitemap names to descriptive names
const SITEMAP_RENAMES = {
  'sitemap_index-0.xml': 'sitemap-pages.xml',
};

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function renameSitemaps() {
  console.log('Renaming sitemap files...\n');

  for (const [oldName, newName] of Object.entries(SITEMAP_RENAMES)) {
    const oldPath = join(OUT_DIR, oldName);
    const newPath = join(OUT_DIR, newName);

    if (await fileExists(oldPath)) {
      await rename(oldPath, newPath);
      console.log(`  [rename] ${oldName} → ${newName}`);
    }
  }
}

async function updateSitemapIndex() {
  console.log('\nUpdating sitemap index references...\n');

  const indexPath = join(OUT_DIR, 'sitemap_index.xml');
  if (!(await fileExists(indexPath))) {
    console.log('  [skip] sitemap.xml not found');
    return;
  }

  let content = await readFile(indexPath, 'utf-8');

  // Update references to renamed sitemaps
  for (const [oldName, newName] of Object.entries(SITEMAP_RENAMES)) {
    const oldUrl = `${SITE_URL}/${oldName}`;
    const newUrl = `${SITE_URL}/${newName}`;
    content = content.replace(oldUrl, newUrl);
  }

  await writeFile(indexPath, content, 'utf-8');
  console.log('  [done] Updated sitemap.xml references');
}

async function addStylesheetToSitemaps() {
  console.log('\nAdding XSL stylesheet to sitemap files...\n');

  const files = await readdir(OUT_DIR);
  const xmlFiles = files.filter(
    (file) => file.endsWith('.xml') && file.includes('sitemap'),
  );

  if (xmlFiles.length === 0) {
    console.log('  No sitemap XML files found');
    return;
  }

  for (const file of xmlFiles) {
    const filePath = join(OUT_DIR, file);
    let content = await readFile(filePath, 'utf-8');

    // Check if stylesheet is already added
    if (content.includes('xml-stylesheet')) {
      console.log(`  [skip] ${file} - stylesheet already present`);
      continue;
    }

    // Add stylesheet instruction after XML declaration
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    if (content.startsWith(xmlDeclaration)) {
      content = content.replace(xmlDeclaration, `${xmlDeclaration}\n${STYLESHEET_INSTRUCTION}`);
    } else {
      content = `${xmlDeclaration}\n${STYLESHEET_INSTRUCTION}\n${content}`;
    }

    await writeFile(filePath, content, 'utf-8');
    console.log(`  [done] ${file}`);
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Sitemap Post-Processing');
  console.log('='.repeat(50) + '\n');

  try {
    await renameSitemaps();
    await updateSitemapIndex();
    await addStylesheetToSitemaps();
    console.log('\n' + '='.repeat(50));
    console.log('Sitemap processing complete!');
    console.log('='.repeat(50));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Output directory "${OUT_DIR}" not found. Run build first.`);
    } else {
      console.error('Error processing sitemaps:', error);
    }
    process.exit(1);
  }
}

main();
