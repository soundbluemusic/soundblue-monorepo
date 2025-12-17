/**
 * Generate PWA icons from source image
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const SOURCE_ICON = join(ROOT_DIR, 'public/branding-assets/icon.png');
const OUTPUT_DIR = join(ROOT_DIR, 'public/icons');

// Icon sizes for PWA manifest
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Maskable icon sizes (with padding for safe zone)
const MASKABLE_SIZES = [192, 512];

// Favicon sizes
const FAVICON_SIZES = [16, 32];

// Apple touch icon size
const APPLE_TOUCH_SIZE = 180;

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Load source image
  const sourceImage = sharp(SOURCE_ICON);
  const metadata = await sourceImage.metadata();
  console.log(`Source image: ${metadata.width}x${metadata.height}\n`);

  // Generate standard icons
  console.log('Standard icons:');
  for (const size of ICON_SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-${size}.png`);
    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ icon-${size}.png`);
  }

  // Generate maskable icons (with padding for safe zone)
  // Maskable icons need ~10% padding on all sides
  console.log('\nMaskable icons:');
  for (const size of MASKABLE_SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-maskable-${size}.png`);
    const iconSize = Math.floor(size * 0.8); // 80% of total size for icon
    const padding = Math.floor((size - iconSize) / 2);

    await sharp(SOURCE_ICON)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ icon-maskable-${size}.png`);
  }

  // Generate favicons
  console.log('\nFavicons:');
  for (const size of FAVICON_SIZES) {
    const outputPath = join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ favicon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon
  console.log('\nApple Touch Icon:');
  const appleTouchPath = join(OUTPUT_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_ICON)
    .resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(appleTouchPath);
  console.log(`  ✓ apple-touch-icon.png (${APPLE_TOUCH_SIZE}x${APPLE_TOUCH_SIZE})`);

  // Generate favicon.ico (using 32x32 PNG as ICO - modern browsers support this)
  console.log('\nFavicon.ico:');
  const faviconPath = join(ROOT_DIR, 'public/favicon.ico');
  await sharp(SOURCE_ICON)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(faviconPath);
  console.log(`  ✓ favicon.ico (32x32)`);

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
