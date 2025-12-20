import { describe, expect, it } from 'vitest';
import { BRAND } from './brand';

describe('BRAND constants', () => {
  it('should have required brand name properties', () => {
    expect(BRAND.name).toBe('Sound Blue');
    expect(BRAND.subtitle).toBe('SoundBlueMusic');
    expect(BRAND.tagline).toBe('SoundBlueMusic');
    expect(BRAND.copyrightHolder).toBe('SoundBlueMusic');
  });

  it('should have valid site URL', () => {
    expect(BRAND.siteUrl).toBe('https://soundbluemusic.com');
    expect(BRAND.siteUrl).toMatch(/^https:\/\//);
  });

  it('should have valid GitHub URL', () => {
    expect(BRAND.githubUrl).toContain('github.com');
    expect(BRAND.githubUrl).toMatch(/^https:\/\/github\.com\//);
  });

  it('should have bilingual descriptions', () => {
    expect(BRAND.description).toHaveProperty('ko');
    expect(BRAND.description).toHaveProperty('en');
    expect(typeof BRAND.description.ko).toBe('string');
    expect(typeof BRAND.description.en).toBe('string');
    expect(BRAND.description.ko.length).toBeGreaterThan(0);
    expect(BRAND.description.en.length).toBeGreaterThan(0);
  });

  it('should have bilingual share titles', () => {
    expect(BRAND.shareTitle).toHaveProperty('ko');
    expect(BRAND.shareTitle).toHaveProperty('en');
    expect(typeof BRAND.shareTitle.ko).toBe('string');
    expect(typeof BRAND.shareTitle.en).toBe('string');
  });

  it('should be readonly (as const)', () => {
    // TypeScript enforces this at compile time, but we can verify structure
    expect(Object.keys(BRAND)).toEqual([
      'name',
      'subtitle',
      'tagline',
      'copyrightHolder',
      'siteUrl',
      'githubUrl',
      'description',
      'shareTitle',
    ]);
  });
});
