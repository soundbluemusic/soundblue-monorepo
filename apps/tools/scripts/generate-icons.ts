#!/usr/bin/env npx tsx

import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const sourceIcon = join(rootDir, 'public/branding asset/icon.png');
const outputDir = join(rootDir, 'public/icons');

interface IconSize {
  name: string;
  size: number;
}

const sizes: IconSize[] = [
  { name: 'icon-72.png', size: 72 },
  { name: 'icon-96.png', size: 96 },
  { name: 'icon-128.png', size: 128 },
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-384.png', size: 384 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-192.png', size: 192 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
];

async function generateIcons(): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  for (const { name, size } of sizes) {
    const outputPath = join(outputDir, name);
    await sharp(sourceIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  // Generate favicon.ico (multi-size ICO file)
  const faviconPath = join(rootDir, 'public/favicon.ico');

  // Create 32x32 PNG for favicon (simple approach)
  await sharp(sourceIcon)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));

  // For .ico, we'll use the 32x32 PNG since sharp doesn't support ICO directly
  // Browsers also accept PNG files named favicon.ico
  await sharp(sourceIcon)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(faviconPath);

  console.log('Generated: favicon.ico');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
