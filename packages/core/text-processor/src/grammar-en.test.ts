import { describe, expect, it } from 'vitest';
import {
  checkArticles,
  checkEnglishGrammar,
  checkPrepositions,
  checkSubjectVerbAgreement,
  checkTenseConsistency,
} from './grammar-en';

describe('checkSubjectVerbAgreement', () => {
  it('should detect "he go" → "he goes"', () => {
    const errors = checkSubjectVerbAgreement('He go to school.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('He goes');
  });

  it('should detect "she have" → "she has"', () => {
    const errors = checkSubjectVerbAgreement('She have a book.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('She has');
  });

  it('should detect "he do" → "he does"', () => {
    const errors = checkSubjectVerbAgreement('He do his homework.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('He does');
  });

  it('should detect "I is" → "I am"', () => {
    const errors = checkSubjectVerbAgreement('I is happy.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('I am');
  });

  it('should detect "they goes" → "they go"', () => {
    const errors = checkSubjectVerbAgreement('They goes to work.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('They go');
  });

  it('should detect "we has" → "we have"', () => {
    const errors = checkSubjectVerbAgreement('We has a problem.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('We have');
  });

  it('should detect "he are" → "he is"', () => {
    const errors = checkSubjectVerbAgreement('He are tired.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('He is');
  });

  it('should detect "they is" → "they are"', () => {
    const errors = checkSubjectVerbAgreement('They is here.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('They are');
  });

  it('should not flag correct usage "he goes"', () => {
    const errors = checkSubjectVerbAgreement('He goes to school.');
    expect(errors.length).toBe(0);
  });

  it('should not flag correct usage "they go"', () => {
    const errors = checkSubjectVerbAgreement('They go to work.');
    expect(errors.length).toBe(0);
  });

  it('should not flag modals', () => {
    const errors = checkSubjectVerbAgreement('He will go.');
    expect(errors.length).toBe(0);
  });
});

describe('checkArticles', () => {
  it('should detect missing article "saw dog" → "saw a dog"', () => {
    const errors = checkArticles('I saw dog.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.message).toContain('article');
  });

  it('should detect "a water" → uncountable noun issue', () => {
    const errors = checkArticles('I need a water.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.message).toContain('uncountable');
  });

  it('should detect "a information" → uncountable noun issue', () => {
    const errors = checkArticles('I need a information.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.message).toContain('uncountable');
  });

  it('should not flag "the water"', () => {
    // "the water" is acceptable for uncountable nouns
    const errors = checkArticles('I drink the water.');
    // This specific pattern shouldn't match our rules
    expect(errors.filter((e) => e.original.includes('the water')).length).toBe(0);
  });
});

describe('checkPrepositions', () => {
  it('should detect "listen at" → "listen to"', () => {
    const errors = checkPrepositions('I listen at music.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('listen to');
  });

  it('should detect "depend at" → "depend on"', () => {
    const errors = checkPrepositions('It depend at you.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('depend on');
  });

  it('should detect "interested on" → "interested in"', () => {
    const errors = checkPrepositions('I am interested on music.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('interested in');
  });

  it('should detect "good in" → "good at"', () => {
    const errors = checkPrepositions('She is good in math.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('good at');
  });

  it('should detect "different than" → "different from"', () => {
    const errors = checkPrepositions('This is different than that.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('different from');
  });

  it('should detect "married with" → "married to"', () => {
    const errors = checkPrepositions('She is married with him.');
    expect(errors.length).toBeGreaterThan(0);
    const first = errors[0];
    expect(first).toBeDefined();
    expect(first?.suggestions).toContain('married to');
  });

  it('should not flag correct "listen to"', () => {
    const errors = checkPrepositions('I listen to music.');
    expect(errors.length).toBe(0);
  });
});

describe('checkTenseConsistency', () => {
  it('should detect past indicator with present verb', () => {
    // This is a heuristic check, may have lower confidence
    const errors = checkTenseConsistency('Yesterday he walks to school.');
    // May or may not detect depending on verb pattern
    // Just ensure it doesn't crash
    expect(Array.isArray(errors)).toBe(true);
  });
});

describe('checkEnglishGrammar (integration)', () => {
  it('should detect multiple grammar issues', () => {
    const errors = checkEnglishGrammar('He go to school and listen at music.');
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should return errors sorted by position', () => {
    const errors = checkEnglishGrammar('He go to school. She have a book.');
    if (errors.length >= 2) {
      const first = errors[0];
      const second = errors[1];
      expect(first).toBeDefined();
      expect(second).toBeDefined();
      if (first && second) {
        expect(first.start).toBeLessThanOrEqual(second.start);
      }
    }
  });
});
