/**
 * Generate PWA icons from SVG source
 * Run: node scripts/generate-icons.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'icons');
const SVG_PATH = join(ICONS_DIR, 'icon.svg');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Ensure icons directory exists
  mkdirSync(ICONS_DIR, { recursive: true });

  // Read SVG file
  const svgData = readFileSync(SVG_PATH, 'utf8');

  for (const size of SIZES) {
    const resvg = new Resvg(svgData, {
      fitTo: {
        mode: 'width',
        value: size,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const outputPath = join(ICONS_DIR, `icon-${size}x${size}.png`);
    writeFileSync(outputPath, pngBuffer);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  // Also generate favicon.ico (use 32x32)
  const faviconResvg = new Resvg(svgData, {
    fitTo: { mode: 'width', value: 32 },
  });
  const faviconPng = faviconResvg.render().asPng();
  writeFileSync(join(ROOT, 'public', 'favicon.png'), faviconPng);
  console.log('  ✓ favicon.png');

  console.log('Done!');
}

generateIcons().catch(console.error);
