#!/usr/bin/env node
/**
 * Generate high-quality PWA icons from source image
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { mkdir, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOUND_BLUE_SOURCE = join(ROOT, 'apps/sound-blue/public/branding-assets/icon.png');
const SOUND_BLUE_OUTPUT = join(ROOT, 'apps/sound-blue/public/icons');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons(sourcePath, outputDir, prefix = 'icon') {
  console.log(`\nGenerating icons from: ${sourcePath}`);
  console.log(`Output directory: ${outputDir}\n`);

  await mkdir(outputDir, { recursive: true });

  for (const size of ICON_SIZES) {
    const outputPath = join(outputDir, `${prefix}-${size}.png`);

    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 6,  // balanced compression
        palette: false,       // disable palette (8-bit) mode for better quality
      })
      .toFile(outputPath);

    console.log(`  ✓ ${prefix}-${size}.png`);
  }

  // Generate maskable icons (with padding for safe area)
  for (const size of [192, 512]) {
    const outputPath = join(outputDir, `${prefix}-maskable-${size}.png`);
    const padding = Math.floor(size * 0.1); // 10% padding
    const innerSize = size - (padding * 2);

    // Create a canvas with the icon centered
    const resized = await sharp(sourcePath)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 250, g: 249, b: 247, alpha: 1 } // #faf9f7 - Sound Blue bg color
      }
    })
      .composite([{
        input: resized,
        top: padding,
        left: padding
      }])
      .png({
        quality: 100,
        compressionLevel: 6,
        palette: false,
      })
      .toFile(outputPath);

    console.log(`  ✓ ${prefix}-maskable-${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  const appleTouchPath = join(outputDir, 'apple-touch-icon.png');
  await sharp(sourcePath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 250, g: 249, b: 247, alpha: 1 }
    })
    .png({
      quality: 100,
      compressionLevel: 6,
      palette: false,
    })
    .toFile(appleTouchPath);
  console.log(`  ✓ apple-touch-icon.png`);

  // Generate favicons
  for (const size of [16, 32]) {
    const faviconPath = join(outputDir, `favicon-${size}x${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 6,
        palette: false,
      })
      .toFile(faviconPath);
    console.log(`  ✓ favicon-${size}x${size}.png`);
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('PWA Icon Generator');
  console.log('='.repeat(50));

  try {
    // Generate Sound Blue icons
    await generateIcons(SOUND_BLUE_SOURCE, SOUND_BLUE_OUTPUT);

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('\n❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

main();
