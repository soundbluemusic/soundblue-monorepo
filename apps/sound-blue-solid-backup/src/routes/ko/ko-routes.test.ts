/**
 * @fileoverview Korean route re-export tests
 *
 * Tests to verify that Korean routes correctly re-export
 * their English counterparts for i18n support.
 *
 * Note: Using fs to read files to avoid JSX import issues in test environment
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const koRoutesDir = resolve(__dirname);

describe('Korean Route Re-exports', () => {
  const routeFiles = [
    { file: 'index.tsx', expectedImport: '../index', expectedExport: 'Home' },
    { file: 'about.tsx', expectedImport: '../about', expectedExport: 'AboutPage' },
    { file: 'blog.tsx', expectedImport: '../blog', expectedExport: 'BlogPage' },
    { file: 'built-with.tsx', expectedImport: '../built-with', expectedExport: 'BuiltWithPage' },
    { file: 'chat.tsx', expectedImport: '../chat', expectedExport: 'ChatPage' },
    { file: 'license.tsx', expectedImport: '../license', expectedExport: 'LicensePage' },
    { file: 'news.tsx', expectedImport: '../news', expectedExport: 'NewsPage' },
    { file: 'privacy.tsx', expectedImport: '../privacy', expectedExport: 'PrivacyPage' },
    { file: 'sitemap.tsx', expectedImport: '../sitemap', expectedExport: 'SitemapPage' },
    {
      file: 'sound-recording.tsx',
      expectedImport: '../sound-recording',
      expectedExport: 'SoundRecordingPage',
    },
    { file: 'terms.tsx', expectedImport: '../terms', expectedExport: 'TermsPage' },
  ];

  describe('File structure', () => {
    it.each(routeFiles)('$file should exist', ({ file }) => {
      const filePath = resolve(koRoutesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Import statements', () => {
    it.each(routeFiles)('$file should import from $expectedImport', ({ file, expectedImport }) => {
      const filePath = resolve(koRoutesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain(`from '${expectedImport}'`);
    });
  });

  describe('Export statements', () => {
    it.each(routeFiles)('$file should have default export', ({ file }) => {
      const filePath = resolve(koRoutesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain('export default');
    });
  });

  describe('Re-export pattern', () => {
    it.each(routeFiles)('$file should follow the re-export pattern (import then export default)', ({
      file,
    }) => {
      const filePath = resolve(koRoutesDir, file);
      const content = readFileSync(filePath, 'utf-8');

      // Check for import statement
      expect(content).toMatch(/import\s+\w+\s+from\s+'\.\.\//);

      // Check for export default statement
      expect(content).toMatch(/export\s+default\s+\w+;?/);

      // File should be minimal (just import and export)
      const lines = content.trim().split('\n').filter(Boolean);
      expect(lines.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Consistency check', () => {
    it('all Korean routes should re-export from parent directory', () => {
      for (const { file, expectedImport } of routeFiles) {
        const filePath = resolve(koRoutesDir, file);
        const content = readFileSync(filePath, 'utf-8');

        // All imports should be from parent directory
        expect(expectedImport.startsWith('../')).toBe(true);
        expect(content).toContain(expectedImport);
      }
    });
  });
});
