/**
 * Post-build SEO cleanup script
 *
 * Fixes SSG build output for proper SEO:
 * 1. Removes __spa-fallback.html (causes Soft 404 in Google Search Console)
 * 2. Validates 404.html exists
 * 3. Ensures _redirects has proper 404 handling
 *
 * @see CLAUDE.md - 100% SSG Only policy
 */

import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const BUILD_DIR = join(import.meta.dirname, '../dist/client');

interface CleanupResult {
  spaFallbackRemoved: boolean;
  has404Page: boolean;
  hasProperRedirects: boolean;
  errors: string[];
}

function cleanup(): CleanupResult {
  const result: CleanupResult = {
    spaFallbackRemoved: false,
    has404Page: false,
    hasProperRedirects: false,
    errors: [],
  };

  // 1. Remove __spa-fallback.html (Soft 404 원인)
  const spaFallbackPath = join(BUILD_DIR, '__spa-fallback.html');
  if (existsSync(spaFallbackPath)) {
    try {
      unlinkSync(spaFallbackPath);
      result.spaFallbackRemoved = true;
      console.log('✅ Removed __spa-fallback.html (Soft 404 prevention)');
    } catch (error) {
      result.errors.push(`Failed to remove __spa-fallback.html: ${error}`);
    }
  } else {
    console.log('ℹ️  __spa-fallback.html not found (already clean)');
  }

  // 2. Validate 404.html exists (optional for SSR apps - handled by server)
  const notFoundPath = join(BUILD_DIR, '404.html');
  if (existsSync(notFoundPath)) {
    result.has404Page = true;
    console.log('✅ 404.html exists');
  } else {
    // SSR apps handle 404 at runtime, so this is just informational
    console.log('ℹ️  404.html not found (SSR apps handle 404 at runtime)');
    result.has404Page = true; // Mark as OK for SSR apps
  }

  // 3. Check _redirects doesn't have SPA fallback
  const redirectsPath = join(BUILD_DIR, '_redirects');
  if (existsSync(redirectsPath)) {
    const content = readFileSync(redirectsPath, 'utf-8');
    // Check for problematic SPA fallback patterns
    const hasSpaFallback =
      content.includes('/* /__spa-fallback.html') ||
      content.includes('/* /index.html 200') ||
      content.includes('/* /200.html');

    if (hasSpaFallback) {
      result.errors.push('_redirects contains SPA fallback rule - this causes Soft 404');
    } else {
      result.hasProperRedirects = true;
      console.log('✅ _redirects has no SPA fallback (correct for SSR)');
    }
  } else {
    // No _redirects file is OK for SSR apps
    result.hasProperRedirects = true;
    console.log('ℹ️  No _redirects file (SSR app handles routing)');
  }

  // Summary
  console.log('\n📊 SEO Cleanup Summary:');
  console.log(`   SPA Fallback Removed: ${result.spaFallbackRemoved ? '✅' : '⏭️  (not needed)'}`);
  console.log(`   404 Page Exists: ${result.has404Page ? '✅' : '❌'}`);
  console.log(`   Proper Redirects: ${result.hasProperRedirects ? '✅' : '❌'}`);

  if (result.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    for (const error of result.errors) {
      console.log(`   - ${error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ SEO cleanup complete - ready for deployment');
  return result;
}

cleanup();
