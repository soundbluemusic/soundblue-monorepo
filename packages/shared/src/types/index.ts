/**
 * @fileoverview Advanced TypeScript type utilities for enhanced type safety.
 *
 * This module provides:
 * - Branded Types: Prevent mixing semantically different values
 * - Result Type: Type-safe error handling without exceptions
 * - Type Guards: Runtime type checking with type narrowing
 *
 * @module types
 */

// ============================================================================
// Branded Types
// ============================================================================

/**
 * Creates a branded type that is nominally distinct from its base type.
 * This prevents accidental mixing of values that have the same structure
 * but different semantic meanings.
 *
 * @template T - The base type to brand
 * @template Brand - A unique string literal to identify the brand
 *
 * @example
 * ```ts
 * type UserId = Branded<string, 'UserId'>;
 * type PostId = Branded<string, 'PostId'>;
 *
 * function getUser(id: UserId) { ... }
 *
 * const userId = 'user-123' as UserId;
 * const postId = 'post-456' as PostId;
 *
 * getUser(userId); // ✅ OK
 * getUser(postId); // ❌ Type error!
 * ```
 */
export type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

/**
 * Storage key branded type - prevents typos in localStorage keys.
 */
export type StorageKeyBrand = Branded<string, 'StorageKey'>;

/**
 * URL path branded type - ensures valid route paths.
 */
export type UrlPathBrand = Branded<string, 'UrlPath'>;

// ============================================================================
// Result Type
// ============================================================================

/**
 * Represents a successful operation result.
 * @template T - The type of the success value
 */
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Represents a failed operation result.
 * @template E - The type of the error
 */
export interface Failure<E = Error> {
  readonly success: false;
  readonly error: E;
}

/**
 * Result type for operations that can fail.
 * Forces explicit error handling at compile time.
 *
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 *
 * @example
 * ```ts
 * function parseConfig(json: string): Result<Config> {
 *   try {
 *     return ok(JSON.parse(json));
 *   } catch (e) {
 *     return err(e as Error);
 *   }
 * }
 *
 * const result = parseConfig(data);
 * if (result.success) {
 *   console.log(result.data); // Config type
 * } else {
 *   console.error(result.error); // Error type
 * }
 * ```
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Creates a successful Result.
 * @template T - The type of the success value
 * @param data - The success value
 * @returns A Success result
 */
export function ok<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Creates a failed Result.
 * @template E - The type of the error
 * @param error - The error value
 * @returns A Failure result
 */
export function err<E = Error>(error: E): Failure<E> {
  return { success: false, error };
}

/**
 * Unwraps a Result, throwing if it's a failure.
 * Use sparingly - prefer pattern matching with if/else.
 *
 * @template T - The type of the success value
 * @param result - The result to unwrap
 * @returns The success value
 * @throws The error if result is a failure
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwraps a Result, returning a default value if it's a failure.
 *
 * @template T - The type of the success value
 * @param result - The result to unwrap
 * @param defaultValue - The value to return on failure
 * @returns The success value or the default value
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Checks if a value is not null or undefined.
 * Narrows the type to exclude null and undefined.
 *
 * @template T - The type to check
 * @param value - The value to check
 * @returns true if value is defined
 *
 * @example
 * ```ts
 * const items = [1, null, 2, undefined, 3];
 * const defined = items.filter(isDefined); // number[]
 * ```
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Checks if a value is a non-empty string.
 *
 * @param value - The value to check
 * @returns true if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Checks if a value is a valid array with at least one element.
 *
 * @template T - The array element type
 * @param value - The value to check
 * @returns true if value is a non-empty array
 */
export function isNonEmptyArray<T>(value: T[] | null | undefined): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if an object has a specific property.
 *
 * @template K - The property key type
 * @param obj - The object to check
 * @param key - The property key to look for
 * @returns true if the object has the property
 */
export function hasProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// ============================================================================
// Assertion Functions
// ============================================================================

/**
 * Asserts that a condition is true, throwing an error if not.
 * Use for invariant checks that should never fail in correct code.
 *
 * @param condition - The condition to assert
 * @param message - The error message if assertion fails
 * @throws Error if condition is false
 *
 * @example
 * ```ts
 * const element = document.getElementById('app');
 * assertDefined(element, 'App element must exist');
 * // element is now non-null
 * ```
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Asserts that a value is defined (not null or undefined).
 *
 * @template T - The type of the value
 * @param value - The value to check
 * @param message - The error message if assertion fails
 * @throws Error if value is null or undefined
 */
export function assertDefined<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Marks code paths that should never be reached.
 * Useful for exhaustive switch statements.
 *
 * @param _value - The value that should be of type never
 * @param message - Optional error message
 * @throws Error always
 *
 * @example
 * ```ts
 * type Status = 'pending' | 'done';
 * function handle(status: Status) {
 *   switch (status) {
 *     case 'pending': return 'Waiting...';
 *     case 'done': return 'Complete!';
 *     default: return assertNever(status);
 *   }
 * }
 * ```
 */
export function assertNever(_value: never, message?: string): never {
  throw new Error(message ?? 'Unexpected value in assertNever');
}

// ============================================================================
// Message Types (for chat functionality)
// ============================================================================

export {
  createMessage,
  isMessage,
  isMessageArray,
  type LegacyMessageType,
  legacyTypeToRole,
  type Message,
  type MessageRole,
  roleToLegacyType,
} from './message';
