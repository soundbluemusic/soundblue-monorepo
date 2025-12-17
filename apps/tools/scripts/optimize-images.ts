/**
 * Image Optimization Script
 * Converts PNG/JPG images to WebP and AVIF formats for optimal performance
 *
 * Usage: pnpm dlx tsx scripts/optimize-images.ts
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import sharp from 'sharp';

// Configuration
const CONFIG = {
  inputDir: 'public',
  // Skip these directories
  skipDirs: ['audio-worklet'],
  // Image extensions to process
  extensions: ['.png', '.jpg', '.jpeg'],
  // Output formats
  formats: {
    webp: { quality: 85 },
    avif: { quality: 75 },
  },
  // Skip files smaller than this (bytes) - icons don't benefit much
  minSize: 1024, // 1KB
  // Skip files matching these patterns
  skipPatterns: [/favicon/, /icon-\d+/, /apple-touch/],
};

interface ProcessResult {
  file: string;
  original: number;
  webp: number;
  avif: number;
  webpSavings: string;
  avifSavings: string;
}

const results: ProcessResult[] = [];

async function processImage(filePath: string): Promise<void> {
  const ext = extname(filePath).toLowerCase();
  const fileName = basename(filePath);
  const dir = dirname(filePath);

  // Check skip patterns
  if (CONFIG.skipPatterns.some((pattern) => pattern.test(fileName))) {
    console.log(`⏭️  Skipping (pattern): ${filePath}`);
    return;
  }

  // Check file size
  const stats = statSync(filePath);
  if (stats.size < CONFIG.minSize) {
    console.log(`⏭️  Skipping (too small): ${filePath}`);
    return;
  }

  const baseName = basename(filePath, ext);
  const webpPath = join(dir, `${baseName}.webp`);
  const avifPath = join(dir, `${baseName}.avif`);

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Generate WebP
    const webpBuffer = await image.webp(CONFIG.formats.webp).toBuffer();

    // Generate AVIF
    const avifBuffer = await sharp(filePath).avif(CONFIG.formats.avif).toBuffer();

    // Only save if smaller than original
    let webpSize = stats.size;
    let avifSize = stats.size;

    if (webpBuffer.length < stats.size) {
      await sharp(filePath).webp(CONFIG.formats.webp).toFile(webpPath);
      webpSize = webpBuffer.length;
      console.log(`✅ WebP: ${webpPath}`);
    } else {
      console.log(`⏭️  WebP larger than original: ${fileName}`);
    }

    if (avifBuffer.length < stats.size) {
      await sharp(filePath).avif(CONFIG.formats.avif).toFile(avifPath);
      avifSize = avifBuffer.length;
      console.log(`✅ AVIF: ${avifPath}`);
    } else {
      console.log(`⏭️  AVIF larger than original: ${fileName}`);
    }

    const webpSavings = (((stats.size - webpSize) / stats.size) * 100).toFixed(1);
    const avifSavings = (((stats.size - avifSize) / stats.size) * 100).toFixed(1);

    results.push({
      file: fileName,
      original: stats.size,
      webp: webpSize,
      avif: avifSize,
      webpSavings: `${webpSavings}%`,
      avifSavings: `${avifSavings}%`,
    });
  } catch (error: unknown) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function scanDirectory(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!CONFIG.skipDirs.includes(entry)) {
        await scanDirectory(fullPath);
      }
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase();
      if (CONFIG.extensions.includes(ext)) {
        await processImage(fullPath);
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('🖼️  Image Optimization Script');
  console.log('============================\n');

  await scanDirectory(CONFIG.inputDir);

  if (results.length > 0) {
    console.log('\n📊 Results Summary:');
    console.log('==================');

    let totalOriginal = 0;
    let totalWebp = 0;
    let totalAvif = 0;

    for (const r of results) {
      totalOriginal += r.original;
      totalWebp += r.webp;
      totalAvif += r.avif;
      console.log(`${r.file}: WebP ${r.webpSavings}, AVIF ${r.avifSavings}`);
    }

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
    };

    console.log('\n📈 Total Savings:');
    console.log(`   Original: ${formatSize(totalOriginal)}`);
    console.log(
      `   WebP:     ${formatSize(totalWebp)} (${(((totalOriginal - totalWebp) / totalOriginal) * 100).toFixed(1)}% saved)`
    );
    console.log(
      `   AVIF:     ${formatSize(totalAvif)} (${(((totalOriginal - totalAvif) / totalOriginal) * 100).toFixed(1)}% saved)`
    );
  } else {
    console.log('No images processed.');
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
