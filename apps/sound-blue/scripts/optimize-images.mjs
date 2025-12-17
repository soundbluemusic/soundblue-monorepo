/**
 * Image Optimization Script
 * Generates optimized PNG, WebP, and AVIF versions for all images
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

// Quality settings
const QUALITY = {
  png: 85,
  webp: 82,
  avif: 72, // AVIF is more efficient, so lower quality = similar visual
};

// Images to optimize with their target dimensions
const imagesToOptimize = [
  // OG Image - standard size is 1200x630
  {
    input: 'og-image.png',
    output: 'og-image',
    width: 1200,
    height: 630,
    formats: ['png', 'webp'], // OG images don't need AVIF (social platforms)
  },
  // PWA Screenshots
  {
    input: 'icons/screenshot-narrow.png',
    output: 'icons/screenshot-narrow',
    width: 540,
    height: 720,
    formats: ['png', 'webp'],
  },
  {
    input: 'icons/screenshot-wide.png',
    output: 'icons/screenshot-wide',
    width: 720,
    height: 540,
    formats: ['png', 'webp'],
  },
  // Branding assets - full optimization (keep original aspect ratio 863:468 ≈ 1.84:1)
  {
    input: 'branding-assets/logo-mascot-nb.png',
    output: 'branding-assets/logo-mascot-nb',
    width: 800,
    height: 434,
    formats: ['png', 'webp', 'avif'],
    sizes: [400, 600, 800], // Multiple sizes for srcset
    fit: 'inside', // Preserve aspect ratio
  },
  {
    input: 'branding-assets/icon.png',
    output: 'branding-assets/icon',
    width: 512,
    height: 512,
    formats: ['png', 'webp', 'avif'],
    sizes: [64, 128, 256, 512],
  },
];

// PWA icons to compress (keep dimensions, just optimize)
// Note: PWA icons MUST remain PNG format per spec
const iconsToCompress = [
  'icons/icon-512.png',
  'icons/icon-384.png',
  'icons/icon-192.png',
  'icons/icon-maskable-512.png',
  'icons/icon-maskable-192.png',
  'icons/apple-touch-icon.png',
];

async function generateFormat(sharpInstance, outputPath, format, quality) {
  switch (format) {
    case 'png':
      await sharpInstance
        .clone()
        .png({ compressionLevel: 9 })
        .toFile(`${outputPath}.png`);
      break;
    case 'webp':
      await sharpInstance
        .clone()
        .webp({ quality, effort: 6 })
        .toFile(`${outputPath}.webp`);
      break;
    case 'avif':
      await sharpInstance
        .clone()
        .avif({ quality, effort: 6 })
        .toFile(`${outputPath}.avif`);
      break;
  }
}

async function optimizeImage(config) {
  const inputPath = path.join(publicDir, config.input);

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${config.input} (not found)`);
    return;
  }

  const originalSize = fs.statSync(inputPath).size;
  console.log(`\n📸 Processing ${config.input} (${Math.round(originalSize / 1024)}KB)`);

  try {
    const sizes = config.sizes || [config.width];

    for (const size of sizes) {
      const suffix = sizes.length > 1 ? `-${size}` : '';
      const outputPath = path.join(publicDir, `${config.output}${suffix}`);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = config.width / config.height;
      const width = size;
      const height = Math.round(size / aspectRatio);

      const sharpInstance = sharp(inputPath).resize(width, height, {
        fit: config.fit || 'cover',
        position: 'center',
      });

      for (const format of config.formats) {
        await generateFormat(sharpInstance, outputPath, format, QUALITY[format]);
        const outputFile = `${outputPath}.${format}`;
        const newSize = fs.statSync(outputFile).size;
        const savings = Math.round((1 - newSize / originalSize) * 100);
        console.log(
          `   ✅ ${path.basename(outputFile)}: ${Math.round(newSize / 1024)}KB (${savings}% saved)`,
        );
      }
    }
  } catch (error) {
    console.error(`❌ Error optimizing ${config.input}:`, error.message);
  }
}

async function compressIcon(iconPath) {
  const inputPath = path.join(publicDir, iconPath);

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${iconPath} (not found)`);
    return;
  }

  const originalSize = fs.statSync(inputPath).size;

  try {
    await sharp(inputPath)
      .png({ compressionLevel: 9 })
      .toFile(inputPath + '.tmp');

    fs.renameSync(inputPath + '.tmp', inputPath);

    const newSize = fs.statSync(inputPath).size;
    const savings = Math.round((1 - newSize / originalSize) * 100);

    console.log(
      `   ✅ ${iconPath}: ${Math.round(originalSize / 1024)}KB → ${Math.round(newSize / 1024)}KB (${savings}% saved)`,
    );
  } catch (error) {
    console.error(`❌ Error compressing ${iconPath}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Image Optimization (PNG + WebP + AVIF)\n');
  console.log('═'.repeat(50));

  console.log('\n📐 Optimizing images with multiple formats:');
  for (const config of imagesToOptimize) {
    await optimizeImage(config);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('\n🗜️  Compressing PWA icons (PNG only):');
  for (const iconPath of iconsToCompress) {
    await compressIcon(iconPath);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('\n✨ Optimization complete!');
  console.log('   Generated formats: PNG, WebP, AVIF');
  console.log('   Use <OptimizedImage> component for automatic format selection\n');
}

main().catch(console.error);
