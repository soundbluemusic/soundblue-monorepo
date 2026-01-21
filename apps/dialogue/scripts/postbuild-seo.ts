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

const BUILD_DIR = join(import.meta.dirname, '../build/client');

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

  // 2. Validate 404.html exists
  const notFoundPath = join(BUILD_DIR, '404.html');
  if (existsSync(notFoundPath)) {
    result.has404Page = true;
    console.log('✅ 404.html exists');
  } else {
    result.errors.push('404.html not found - Cloudflare needs this for proper 404 responses');
  }

  // 3. Check _redirects doesn't have SPA fallback
  const redirectsPath = join(BUILD_DIR, '_redirects');
  if (existsSync(redirectsPath)) {
    const content = readFileSync(redirectsPath, 'utf-8');
    // Check for problematic SPA fallback patterns (only check non-comment lines)
    const nonCommentLines = content
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n');

    const hasSpaFallback =
      nonCommentLines.includes('/* /__spa-fallback.html') ||
      nonCommentLines.includes('/* /index.html 200') ||
      nonCommentLines.includes('/* /200.html') ||
      // Check for actual SPA fallback rules (not just mentions in comments)
      /\/c\/\*\s+\S+\s+200/.test(nonCommentLines) ||
      /\/ko\/c\/\*\s+\S+\s+200/.test(nonCommentLines);

    if (hasSpaFallback) {
      result.errors.push('_redirects contains SPA fallback rule - this causes Soft 404');
    } else {
      result.hasProperRedirects = true;
      console.log('✅ _redirects has no SPA fallback (correct for SSG)');
    }
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
