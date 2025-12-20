/**
 * @fileoverview Zod schemas for runtime type validation.
 *
 * This module provides schemas for validating data at runtime,
 * especially for external data sources like localStorage, APIs, etc.
 *
 * Benefits:
 * - Runtime validation ensures data matches expected shape
 * - Automatic TypeScript type inference from schemas
 * - Detailed error messages for debugging
 *
 * @module lib/schemas
 */

import { z } from 'zod';

// ============================================================================
// Theme Schema
// ============================================================================

/**
 * Valid theme values
 */
export const ThemeSchema = z.enum(['light', 'dark']);

/**
 * Theme type inferred from schema
 */
export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Validates a theme value.
 * @param value - The value to validate
 * @returns The validated theme or null if invalid
 */
export function parseTheme(value: unknown): Theme | null {
  const result = ThemeSchema.safeParse(value);
  return result.success ? result.data : null;
}

// ============================================================================
// Language Schema
// ============================================================================

/**
 * Valid language values
 */
export const LanguageSchema = z.enum(['en', 'ko']);

/**
 * Language type inferred from schema
 */
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Validates a language value.
 * @param value - The value to validate
 * @returns The validated language or null if invalid
 */
export function parseLanguage(value: unknown): Language | null {
  const result = LanguageSchema.safeParse(value);
  return result.success ? result.data : null;
}

// ============================================================================
// Chat Message Schema
// ============================================================================

/**
 * Chat message type enum
 */
export const MessageTypeSchema = z.enum(['user', 'bot']);

/**
 * Single chat message schema
 */
export const MessageSchema = z.object({
  id: z.string().min(1),
  type: MessageTypeSchema,
  content: z.string(),
  timestamp: z.number().int().positive(),
});

/**
 * Message type inferred from schema
 */
export type Message = z.infer<typeof MessageSchema>;

/**
 * Chat message array schema
 */
export const MessagesSchema = z.array(MessageSchema);

/**
 * Validates an array of messages.
 * @param value - The value to validate
 * @returns The validated messages array or null if invalid
 */
export function parseMessages(value: unknown): Message[] | null {
  const result = MessagesSchema.safeParse(value);
  return result.success ? result.data : null;
}

// ============================================================================
// Chat State Schema (for redirect persistence)
// ============================================================================

/**
 * Saved chat state schema (used during language redirect)
 */
export const SavedChatStateSchema = z.object({
  messages: MessagesSchema,
  pendingMessage: z.string(),
});

/**
 * SavedChatState type inferred from schema
 */
export type SavedChatState = z.infer<typeof SavedChatStateSchema>;

/**
 * Validates saved chat state.
 * @param value - The value to validate
 * @returns The validated chat state or null if invalid
 */
export function parseSavedChatState(value: unknown): SavedChatState | null {
  const result = SavedChatStateSchema.safeParse(value);
  return result.success ? result.data : null;
}

// ============================================================================
// Storage Key Schema
// ============================================================================

/**
 * Valid storage keys in the application
 */
export const StorageKeySchema = z.enum([
  'sb-theme',
  'sb-language',
  'sb-chat-state',
  'sb-chat-history',
]);

/**
 * StorageKey type inferred from schema
 */
export type StorageKey = z.infer<typeof StorageKeySchema>;

/**
 * Validates a storage key.
 * @param value - The value to validate
 * @returns true if value is a valid storage key
 */
export function isValidStorageKey(value: unknown): value is StorageKey {
  return StorageKeySchema.safeParse(value).success;
}

// ============================================================================
// Generic JSON Parse with Schema
// ============================================================================

/**
 * Safely parses JSON and validates against a schema.
 *
 * @template T - The expected type after validation
 * @param json - The JSON string to parse
 * @param schema - The Zod schema to validate against
 * @returns The validated data or null if parsing/validation fails
 *
 * @example
 * ```ts
 * const messages = safeJsonParse(localStorage.getItem('chat'), MessagesSchema);
 * if (messages) {
 *   // messages is Message[] with full type safety
 * }
 * ```
 */
export function safeJsonParse<T>(json: string | null, schema: z.ZodType<T>): T | null {
  if (!json) return null;

  try {
    const parsed = JSON.parse(json);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// ============================================================================
// Schema Type Inference Utility
// ============================================================================

/**
 * Utility type to infer the TypeScript type from a Zod schema.
 * Re-exported for convenience.
 *
 * @example
 * ```ts
 * const UserSchema = z.object({ name: z.string(), age: z.number() });
 * type User = InferSchema<typeof UserSchema>;
 * // { name: string; age: number }
 * ```
 */
export type InferSchema<T extends z.ZodType> = z.infer<T>;
