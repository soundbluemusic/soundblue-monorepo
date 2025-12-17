/**
 * @fileoverview Shared message types for chat functionality
 *
 * Provides unified message types used across chat-enabled apps.
 *
 * @module @soundblue/shared/types/message
 */

/**
 * Message role type.
 * Using 'user' | 'assistant' as the standard (OpenAI convention).
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Base message interface for chat functionality.
 *
 * @example
 * ```ts
 * const message: Message = {
 *   id: 'msg-123',
 *   role: 'user',
 *   content: 'Hello!',
 *   timestamp: Date.now(),
 * };
 * ```
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Message sender role */
  role: MessageRole;
  /** Message text content */
  content: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Creates a new message with auto-generated ID and timestamp.
 *
 * @param role - The message sender role
 * @param content - The message content
 * @returns A new Message object
 *
 * @example
 * ```ts
 * const msg = createMessage('user', 'Hello!');
 * ```
 */
export function createMessage(role: MessageRole, content: string): Message {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

/**
 * Type guard to check if a value is a valid Message.
 *
 * @param value - Value to check
 * @returns true if value is a valid Message
 */
export function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    (obj['role'] === 'user' || obj['role'] === 'assistant') &&
    typeof obj['content'] === 'string' &&
    typeof obj['timestamp'] === 'number'
  );
}

/**
 * Type guard to check if a value is a valid Message array.
 *
 * @param value - Value to check
 * @returns true if value is a valid Message array
 */
export function isMessageArray(value: unknown): value is Message[] {
  return Array.isArray(value) && value.every(isMessage);
}

/**
 * Legacy message type alias for backward compatibility.
 * Maps 'bot' to 'assistant' for older code.
 *
 * @deprecated Use MessageRole instead
 */
export type LegacyMessageType = 'user' | 'bot';

/**
 * Converts legacy message type to standard role.
 *
 * @param type - Legacy message type
 * @returns Standard message role
 *
 * @deprecated Use MessageRole directly
 */
export function legacyTypeToRole(type: LegacyMessageType): MessageRole {
  return type === 'bot' ? 'assistant' : type;
}

/**
 * Converts standard role to legacy message type.
 *
 * @param role - Standard message role
 * @returns Legacy message type
 *
 * @deprecated Use MessageRole directly
 */
export function roleToLegacyType(role: MessageRole): LegacyMessageType {
  return role === 'assistant' ? 'bot' : role;
}
