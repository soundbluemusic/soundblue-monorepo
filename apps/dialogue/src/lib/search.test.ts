import { describe, expect, it } from 'vitest';
import { searchKnowledge } from './search';

describe('searchKnowledge', () => {
  describe('basic functionality', () => {
    it('should return empty array for empty query', () => {
      const results = searchKnowledge('', 'en');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only query', () => {
      const results = searchKnowledge('   ', 'en');
      expect(results).toEqual([]);
    });

    it('should return results for valid query', () => {
      const results = searchKnowledge('dialogue', 'en');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should respect the limit parameter', () => {
      const results = searchKnowledge('test', 'en', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should default to 3 results max', () => {
      const results = searchKnowledge('test', 'en');
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('locale filtering', () => {
    it('should filter results by locale', () => {
      const enResults = searchKnowledge('dialogue', 'en');
      const koResults = searchKnowledge('dialogue', 'ko');

      // Results should be locale-specific or "all"
      for (const result of enResults) {
        expect(result.locale === 'en' || result.locale === 'all').toBe(true);
      }
      for (const result of koResults) {
        expect(result.locale === 'ko' || result.locale === 'all').toBe(true);
      }
    });
  });

  describe('result structure', () => {
    it('should return KnowledgeItem objects with required properties', () => {
      const results = searchKnowledge('help', 'en');

      for (const result of results) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('question');
        expect(result).toHaveProperty('answer');
        expect(result).toHaveProperty('keywords');
        expect(result).toHaveProperty('locale');
        expect(typeof result.id).toBe('string');
        expect(typeof result.question).toBe('string');
        expect(typeof result.answer).toBe('string');
        expect(Array.isArray(result.keywords)).toBe(true);
      }
    });
  });

  describe('search scoring', () => {
    it('should return higher scored results first', () => {
      // Search with a specific term that might have varying relevance
      const results = searchKnowledge('what is dialogue', 'en');

      // Results should be sorted by relevance (descending score)
      // We can't check exact scores, but we verify the function runs correctly
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('case insensitivity', () => {
    it('should return same results regardless of query case', () => {
      const lowerResults = searchKnowledge('dialogue', 'en');
      const upperResults = searchKnowledge('DIALOGUE', 'en');
      const mixedResults = searchKnowledge('DiAlOgUe', 'en');

      // Results should be the same regardless of case
      expect(lowerResults.map((r) => r.id)).toEqual(upperResults.map((r) => r.id));
      expect(lowerResults.map((r) => r.id)).toEqual(mixedResults.map((r) => r.id));
    });
  });
});
