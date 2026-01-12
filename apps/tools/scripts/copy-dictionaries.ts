/**
 * Copy dictionary files from node_modules to public folder
 * This is needed because dictionary-en package doesn't expose .aff/.dic files via exports
 */

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Source files (in node_modules)
const nodeModulesBase = resolve(
  rootDir,
  '../../node_modules/.pnpm/dictionary-en@4.0.0/node_modules/dictionary-en',
);

// If pnpm symlinked version doesn't exist, try the regular node_modules
const altNodeModulesBase = resolve(rootDir, '../../node_modules/dictionary-en');

const sourceBase = existsSync(nodeModulesBase) ? nodeModulesBase : altNodeModulesBase;

const sourceAff = resolve(sourceBase, 'index.aff');
const sourceDic = resolve(sourceBase, 'index.dic');

// Destination folder
const destDir = resolve(rootDir, 'public/dictionaries');
const destAff = resolve(destDir, 'en.aff');
const destDic = resolve(destDir, 'en.dic');

// Ensure destination directory exists
if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Copy files
try {
  copyFileSync(sourceAff, destAff);
  console.log(`Copied: ${sourceAff} -> ${destAff}`);
} catch (error) {
  console.error(`Failed to copy .aff file:`, error);
  process.exit(1);
}

try {
  copyFileSync(sourceDic, destDic);
  console.log(`Copied: ${sourceDic} -> ${destDic}`);
} catch (error) {
  console.error(`Failed to copy .dic file:`, error);
  process.exit(1);
}

console.log('Dictionary files copied successfully!');
