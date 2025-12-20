/**
 * @fileoverview Tests for type utilities
 */

import { describe, expect, it } from 'vitest';
import {
  assert,
  assertDefined,
  assertNever,
  err,
  hasProperty,
  isDefined,
  isNonEmptyArray,
  isNonEmptyString,
  ok,
  unwrap,
  unwrapOr,
} from './types';

describe('types utilities', () => {
  // ============================================================================
  // Result Type Tests
  // ============================================================================

  describe('ok', () => {
    it('should create a success result', () => {
      const result = ok(42);
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should work with objects', () => {
      const data = { name: 'test', value: 123 };
      const result = ok(data);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should work with null', () => {
      const result = ok(null);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('err', () => {
    it('should create a failure result', () => {
      const error = new Error('test error');
      const result = err(error);
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should work with string errors', () => {
      const result = err('error message');
      expect(result.success).toBe(false);
      expect(result.error).toBe('error message');
    });

    it('should work with custom error types', () => {
      const customError = { code: 404, message: 'Not found' };
      const result = err(customError);
      expect(result.success).toBe(false);
      expect(result.error).toEqual(customError);
    });
  });

  describe('unwrap', () => {
    it('should return data for success result', () => {
      const result = ok(42);
      expect(unwrap(result)).toBe(42);
    });

    it('should throw for failure result', () => {
      const error = new Error('test error');
      const result = err(error);
      expect(() => unwrap(result)).toThrow(error);
    });
  });

  describe('unwrapOr', () => {
    it('should return data for success result', () => {
      const result = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('should return default for failure result', () => {
      const result = err(new Error('test'));
      expect(unwrapOr(result, 0)).toBe(0);
    });

    it('should work with complex default values', () => {
      const defaultValue = { items: [], count: 0 };
      const result = err(new Error('test'));
      expect(unwrapOr(result, defaultValue)).toEqual(defaultValue);
    });
  });

  // ============================================================================
  // Type Guard Tests
  // ============================================================================

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it('should return false for null', () => {
      expect(isDefined(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString(' ')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
      expect(isNonEmptyString([])).toBe(false);
    });
  });

  describe('isNonEmptyArray', () => {
    it('should return true for non-empty arrays', () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray([null])).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isNonEmptyArray(null)).toBe(false);
      expect(isNonEmptyArray(undefined)).toBe(false);
    });
  });

  describe('hasProperty', () => {
    it('should return true when property exists', () => {
      expect(hasProperty({ name: 'test' }, 'name')).toBe(true);
      expect(hasProperty({ a: 1, b: 2 }, 'a')).toBe(true);
    });

    it('should return true for undefined property values', () => {
      expect(hasProperty({ name: undefined }, 'name')).toBe(true);
    });

    it('should return false when property does not exist', () => {
      expect(hasProperty({ name: 'test' }, 'age')).toBe(false);
      expect(hasProperty({}, 'anything')).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(hasProperty(null, 'key')).toBe(false);
      expect(hasProperty(undefined, 'key')).toBe(false);
      expect(hasProperty('string', 'length')).toBe(false);
      expect(hasProperty(123, 'toString')).toBe(false);
    });
  });

  // ============================================================================
  // Assertion Function Tests
  // ============================================================================

  describe('assert', () => {
    it('should not throw for true condition', () => {
      expect(() => assert(true, 'should not throw')).not.toThrow();
      expect(() => assert(2 > 1, 'math works')).not.toThrow();
    });

    it('should throw for false condition', () => {
      expect(() => assert(false, 'test message')).toThrow('Assertion failed: test message');
    });

    it('should include message in error', () => {
      expect(() => assert(false, 'custom error')).toThrow(/custom error/);
    });
  });

  describe('assertDefined', () => {
    it('should not throw for defined values', () => {
      expect(() => assertDefined(0, 'zero')).not.toThrow();
      expect(() => assertDefined('', 'empty string')).not.toThrow();
      expect(() => assertDefined(false, 'false')).not.toThrow();
      expect(() => assertDefined({}, 'object')).not.toThrow();
    });

    it('should throw for null', () => {
      expect(() => assertDefined(null, 'value is null')).toThrow('Assertion failed: value is null');
    });

    it('should throw for undefined', () => {
      expect(() => assertDefined(undefined, 'value is undefined')).toThrow(
        'Assertion failed: value is undefined',
      );
    });
  });

  describe('assertNever', () => {
    it('should throw with default message', () => {
      expect(() => assertNever('unexpected' as never)).toThrow('Unexpected value in assertNever');
    });

    it('should throw with custom message', () => {
      expect(() => assertNever('value' as never, 'Custom message')).toThrow('Custom message');
    });
  });
});
