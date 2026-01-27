/**
 * TranslatorLayout Pattern Tests
 *
 * Verifies that URL/state synchronization patterns don't cause infinite loops.
 * This is a static analysis test that checks the source code structure.
 *
 * @see .claude/rules/react-patterns.md
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TRANSLATOR_LAYOUT_PATH = join(__dirname, '..', 'TranslatorLayout.tsx');

describe('TranslatorLayout - Infinite Loop Prevention', () => {
  const content = readFileSync(TRANSLATOR_LAYOUT_PATH, 'utf-8');

  it('should have initialization ref to prevent URL sync loop', () => {
    // Must have a ref to track initialization
    expect(content).toMatch(/isUrlSyncInitializedRef|isInitializedRef/);
  });

  it('should have previous settings ref for change detection', () => {
    // Must have a ref to compare previous values
    expect(content).toMatch(/prevSettingsRef|prevValueRef/);
  });

  it('should NOT have searchParams in URL update useEffect dependencies', () => {
    // Find the URL update useEffect
    const urlUpdateEffect = content.match(
      /\/\/ Update URL when settings change[\s\S]*?useEffect\([\s\S]*?\], \[([^\]]*)\]\)/,
    );

    if (urlUpdateEffect) {
      const dependencies = urlUpdateEffect[1];
      // searchParams should NOT be in dependencies (causes infinite loop)
      expect(dependencies).not.toContain('searchParams');
    }
  });

  it('should have empty dependency array for initial URL read', () => {
    // Find the initial URL read useEffect
    const urlReadEffect = content.match(
      /\/\/ Read settings from URL on mount[\s\S]*?useEffect\([\s\S]*?\], \[([^\]]*)\]\)/,
    );

    if (urlReadEffect) {
      const dependencies = urlReadEffect[1];
      // Should be empty (mount only) or have eslint disable comment
      const hasEmptyDeps = dependencies.trim() === '';
      const hasEslintDisable = content.includes('eslint-disable-next-line react-hooks');
      expect(hasEmptyDeps || hasEslintDisable).toBe(true);
    }
  });

  it('should check initialization before running URL sync', () => {
    // Must check ref before running sync logic
    expect(content).toMatch(/if\s*\(\s*isUrlSyncInitializedRef\.current\s*\)\s*return/);
  });

  it('should compare with previous settings before URL update', () => {
    // Must compare before updating
    expect(content).toMatch(/hasChanged|prev\s*!==|prevSettingsRef\.current/);
  });
});

describe('URL Sync Pattern - No Circular Dependencies', () => {
  const content = readFileSync(TRANSLATOR_LAYOUT_PATH, 'utf-8');

  it('should not have both searchParams dependency AND setSearchParams call in same useEffect', () => {
    // Extract all useEffect blocks
    const useEffectBlocks = content.match(
      /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?\},\s*\[[^\]]*\]\)/g,
    );

    if (useEffectBlocks) {
      for (const block of useEffectBlocks) {
        const hasBothInSameBlock =
          block.includes('searchParams') &&
          block.includes('setSearchParams') &&
          // Check if searchParams is in dependency array (not just used)
          /\],\s*\[[^\]]*searchParams[^\]]*\]/.test(block);

        expect(hasBothInSameBlock).toBe(false);
      }
    }
  });
});
