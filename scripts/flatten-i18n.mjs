#!/usr/bin/env node
/**
 * Script to flatten nested i18n JSON into Paraglide-compatible format
 *
 * Converts:
 * { "seo": { "siteName": "Sound Blue" } }
 *
 * To:
 * { "seo_siteName": "Sound Blue" }
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function flattenObject(obj, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

function flattenI18nFile(inputPath, outputPath) {
  console.log(`📖 Reading: ${inputPath}`);
  const content = readFileSync(inputPath, 'utf-8');
  const json = JSON.parse(content);

  console.log(`🔄 Flattening structure...`);
  const flattened = flattenObject(json);

  console.log(`💾 Writing: ${outputPath}`);
  writeFileSync(outputPath, JSON.stringify(flattened, null, 2), 'utf-8');

  const keyCount = Object.keys(flattened).length;
  console.log(`✅ Flattened ${keyCount} keys`);
}

// Process sound-blue
const soundBlueBase = 'apps/sound-blue';
flattenI18nFile(
  join(soundBlueBase, 'messages/en.json'),
  join(soundBlueBase, 'project.inlang/messages/en.json')
);
flattenI18nFile(
  join(soundBlueBase, 'messages/ko.json'),
  join(soundBlueBase, 'project.inlang/messages/ko.json')
);

console.log('');

// Process tools
const toolsBase = 'apps/tools';
flattenI18nFile(
  join(toolsBase, 'messages/en.json'),
  join(toolsBase, 'project.inlang/messages/en.json')
);
flattenI18nFile(
  join(toolsBase, 'messages/ko.json'),
  join(toolsBase, 'project.inlang/messages/ko.json')
);

console.log('\n🎉 All files flattened successfully!');
