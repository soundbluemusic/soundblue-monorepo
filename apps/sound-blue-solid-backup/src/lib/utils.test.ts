import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  it('should merge simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('should merge Tailwind classes correctly', () => {
    // twMerge should resolve conflicting Tailwind utilities
    expect(cn('px-4', 'px-6')).toBe('px-6');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn('base', ['foo', 'bar'])).toBe('base foo bar');
  });

  it('should handle objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should handle complex Tailwind merging', () => {
    // Background colors
    expect(cn('bg-red-500', 'bg-surface')).toBe('bg-surface');
    // Padding: p-4 stays because px/py only override specific axes
    expect(cn('p-4', 'px-2', 'py-6')).toBe('p-4 px-2 py-6');
    // Full padding override
    expect(cn('p-4', 'p-6')).toBe('p-6');
    // Margin: m-4 stays, mt-2 overrides top only
    expect(cn('m-4', 'mt-2')).toBe('m-4 mt-2');
  });

  it('should handle responsive prefixes', () => {
    expect(cn('text-sm', 'md:text-lg', 'lg:text-xl')).toBe('text-sm md:text-lg lg:text-xl');
  });

  it('should handle state variants', () => {
    expect(cn('bg-white', 'hover:bg-gray-100', 'focus:bg-gray-200')).toBe(
      'bg-white hover:bg-gray-100 focus:bg-gray-200',
    );
  });

  // ========================================
  // Boundary Value Tests
  // ========================================
  describe('Boundary Value Tests', () => {
    it('should handle many arguments', () => {
      const result = cn('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j');
      expect(result).toBe('a b c d e f g h i j');
      expect(result.split(' ').length).toBe(10);
    });

    it('should handle very long class names', () => {
      const longClass = 'a'.repeat(100);
      expect(cn(longClass)).toBe(longClass);
      expect(cn(longClass).length).toBe(100);
    });

    it('should handle deeply nested arrays', () => {
      expect(cn([['foo'], ['bar', ['baz']]])).toBe('foo bar baz');
    });

    it('should handle all falsy values', () => {
      expect(cn(false, null, undefined, 0, '', NaN)).toBe('');
    });

    it('should handle mixed truthy and falsy', () => {
      expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c');
    });

    it('should handle whitespace-only strings', () => {
      // clsx trims whitespace
      expect(cn('  ', 'foo', '   ')).toBe('foo');
    });

    it('should handle special Tailwind arbitrary values', () => {
      expect(cn('w-[100px]', 'h-[50vh]')).toBe('w-[100px] h-[50vh]');
    });

    it('should handle negative values', () => {
      expect(cn('-mt-4', '-ml-2')).toBe('-mt-4 -ml-2');
    });

    it('should handle important modifier', () => {
      expect(cn('!text-red-500', '!bg-blue-500')).toBe('!text-red-500 !bg-blue-500');
    });

    it('should handle dark mode prefix', () => {
      expect(cn('bg-white', 'dark:bg-black')).toBe('bg-white dark:bg-black');
    });

    it('should handle complex object with many keys', () => {
      const result = cn({
        a: true,
        b: false,
        c: true,
        d: false,
        e: true,
        f: false,
      });
      expect(result).toBe('a c e');
      expect(result.split(' ').length).toBe(3);
    });

    it('should preserve order of non-conflicting classes', () => {
      const result = cn('flex', 'items-center', 'justify-between');
      expect(result).toBe('flex items-center justify-between');
      expect(result.indexOf('flex')).toBeLessThan(result.indexOf('items-center'));
    });
  });

  // ========================================
  // Assertion Quality: Behavioral Tests
  // ========================================
  describe('Behavioral Tests (not just existence)', () => {
    it('should produce deterministic output', () => {
      const input = ['foo', 'bar', { baz: true }];
      const result1 = cn(...input);
      const result2 = cn(...input);
      expect(result1).toBe(result2);
      expect(result1).toStrictEqual(result2);
    });

    it('should return a string type', () => {
      const result = cn('foo');
      expect(typeof result).toBe('string');
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });

    it('should not modify input arrays', () => {
      const input = ['foo', 'bar'];
      const original = [...input];
      cn(input);
      expect(input).toEqual(original);
      expect(input).toHaveLength(2);
    });

    it('should handle Tailwind conflict resolution correctly', () => {
      // Verify that later classes win in conflicts
      const result1 = cn('p-2', 'p-4');
      const result2 = cn('p-4', 'p-2');
      expect(result1).toBe('p-4');
      expect(result2).toBe('p-2');
      expect(result1).not.toBe(result2);
    });

    it('should produce valid CSS class string format', () => {
      const result = cn('foo', 'bar', 'baz');
      // No leading/trailing spaces
      expect(result).not.toMatch(/^\s/);
      expect(result).not.toMatch(/\s$/);
      // Single space between classes
      expect(result).not.toMatch(/\s{2,}/);
    });
  });
});
