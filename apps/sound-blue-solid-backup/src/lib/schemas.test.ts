/**
 * @fileoverview Tests for Zod schemas and validation utilities
 */

import { describe, expect, it } from 'vitest';
import {
  isValidStorageKey,
  LanguageSchema,
  MessageSchema,
  MessagesSchema,
  parseLanguage,
  parseMessages,
  parseSavedChatState,
  parseTheme,
  SavedChatStateSchema,
  StorageKeySchema,
  safeJsonParse,
  ThemeSchema,
} from './schemas';

describe('schemas', () => {
  // ============================================================================
  // ThemeSchema Tests
  // ============================================================================

  describe('ThemeSchema', () => {
    it('should accept valid themes', () => {
      expect(ThemeSchema.safeParse('light').success).toBe(true);
      expect(ThemeSchema.safeParse('dark').success).toBe(true);
    });

    it('should reject invalid themes', () => {
      expect(ThemeSchema.safeParse('blue').success).toBe(false);
      expect(ThemeSchema.safeParse('').success).toBe(false);
      expect(ThemeSchema.safeParse(null).success).toBe(false);
      expect(ThemeSchema.safeParse(123).success).toBe(false);
    });
  });

  describe('parseTheme', () => {
    it('should return theme for valid input', () => {
      expect(parseTheme('light')).toBe('light');
      expect(parseTheme('dark')).toBe('dark');
    });

    it('should return null for invalid input', () => {
      expect(parseTheme('invalid')).toBeNull();
      expect(parseTheme(null)).toBeNull();
      expect(parseTheme(undefined)).toBeNull();
    });
  });

  // ============================================================================
  // LanguageSchema Tests
  // ============================================================================

  describe('LanguageSchema', () => {
    it('should accept valid languages', () => {
      expect(LanguageSchema.safeParse('en').success).toBe(true);
      expect(LanguageSchema.safeParse('ko').success).toBe(true);
    });

    it('should reject invalid languages', () => {
      expect(LanguageSchema.safeParse('jp').success).toBe(false);
      expect(LanguageSchema.safeParse('').success).toBe(false);
      expect(LanguageSchema.safeParse(null).success).toBe(false);
    });
  });

  describe('parseLanguage', () => {
    it('should return language for valid input', () => {
      expect(parseLanguage('en')).toBe('en');
      expect(parseLanguage('ko')).toBe('ko');
    });

    it('should return null for invalid input', () => {
      expect(parseLanguage('invalid')).toBeNull();
      expect(parseLanguage(null)).toBeNull();
    });
  });

  // ============================================================================
  // MessageSchema Tests
  // ============================================================================

  describe('MessageSchema', () => {
    it('should accept valid messages', () => {
      const validMessage = {
        id: 'msg-1',
        type: 'user',
        content: 'Hello',
        timestamp: 1234567890,
      };
      expect(MessageSchema.safeParse(validMessage).success).toBe(true);
    });

    it('should accept bot messages', () => {
      const botMessage = {
        id: 'msg-2',
        type: 'bot',
        content: 'Hi there!',
        timestamp: 1234567891,
      };
      expect(MessageSchema.safeParse(botMessage).success).toBe(true);
    });

    it('should reject messages with empty id', () => {
      const invalidMessage = {
        id: '',
        type: 'user',
        content: 'Hello',
        timestamp: 1234567890,
      };
      expect(MessageSchema.safeParse(invalidMessage).success).toBe(false);
    });

    it('should reject messages with invalid type', () => {
      const invalidMessage = {
        id: 'msg-1',
        type: 'admin',
        content: 'Hello',
        timestamp: 1234567890,
      };
      expect(MessageSchema.safeParse(invalidMessage).success).toBe(false);
    });

    it('should reject messages with non-positive timestamp', () => {
      const invalidMessage = {
        id: 'msg-1',
        type: 'user',
        content: 'Hello',
        timestamp: -1,
      };
      expect(MessageSchema.safeParse(invalidMessage).success).toBe(false);
    });

    it('should reject messages with non-integer timestamp', () => {
      const invalidMessage = {
        id: 'msg-1',
        type: 'user',
        content: 'Hello',
        timestamp: 123.456,
      };
      expect(MessageSchema.safeParse(invalidMessage).success).toBe(false);
    });
  });

  describe('MessagesSchema', () => {
    it('should accept empty array', () => {
      expect(MessagesSchema.safeParse([]).success).toBe(true);
    });

    it('should accept array of valid messages', () => {
      const messages = [
        { id: 'msg-1', type: 'user', content: 'Hello', timestamp: 1 },
        { id: 'msg-2', type: 'bot', content: 'Hi!', timestamp: 2 },
      ];
      expect(MessagesSchema.safeParse(messages).success).toBe(true);
    });

    it('should reject array with invalid message', () => {
      const messages = [
        { id: 'msg-1', type: 'user', content: 'Hello', timestamp: 1 },
        { id: '', type: 'bot', content: 'Hi!', timestamp: 2 }, // invalid: empty id
      ];
      expect(MessagesSchema.safeParse(messages).success).toBe(false);
    });
  });

  describe('parseMessages', () => {
    it('should return messages for valid input', () => {
      const messages = [{ id: 'msg-1', type: 'user', content: 'Hello', timestamp: 1 }];
      const result = parseMessages(messages);
      expect(result).toEqual(messages);
    });

    it('should return null for invalid input', () => {
      expect(parseMessages('invalid')).toBeNull();
      expect(parseMessages(null)).toBeNull();
      expect(parseMessages([{ invalid: true }])).toBeNull();
    });
  });

  // ============================================================================
  // SavedChatStateSchema Tests
  // ============================================================================

  describe('SavedChatStateSchema', () => {
    it('should accept valid chat state', () => {
      const validState = {
        messages: [{ id: 'msg-1', type: 'user', content: 'Hello', timestamp: 1 }],
        pendingMessage: 'test message',
      };
      expect(SavedChatStateSchema.safeParse(validState).success).toBe(true);
    });

    it('should accept empty messages array', () => {
      const state = {
        messages: [],
        pendingMessage: '',
      };
      expect(SavedChatStateSchema.safeParse(state).success).toBe(true);
    });

    it('should reject missing pendingMessage', () => {
      const invalidState = {
        messages: [],
      };
      expect(SavedChatStateSchema.safeParse(invalidState).success).toBe(false);
    });

    it('should reject missing messages', () => {
      const invalidState = {
        pendingMessage: 'test',
      };
      expect(SavedChatStateSchema.safeParse(invalidState).success).toBe(false);
    });
  });

  describe('parseSavedChatState', () => {
    it('should return state for valid input', () => {
      const state = {
        messages: [{ id: 'msg-1', type: 'user', content: 'Hello', timestamp: 1 }],
        pendingMessage: 'test',
      };
      const result = parseSavedChatState(state);
      expect(result).toEqual(state);
    });

    it('should return null for invalid input', () => {
      expect(parseSavedChatState(null)).toBeNull();
      expect(parseSavedChatState({ invalid: true })).toBeNull();
    });
  });

  // ============================================================================
  // StorageKeySchema Tests
  // ============================================================================

  describe('StorageKeySchema', () => {
    it('should accept valid storage keys', () => {
      expect(StorageKeySchema.safeParse('sb-theme').success).toBe(true);
      expect(StorageKeySchema.safeParse('sb-language').success).toBe(true);
      expect(StorageKeySchema.safeParse('sb-chat-state').success).toBe(true);
      expect(StorageKeySchema.safeParse('sb-chat-history').success).toBe(true);
    });

    it('should reject invalid storage keys', () => {
      expect(StorageKeySchema.safeParse('invalid-key').success).toBe(false);
      expect(StorageKeySchema.safeParse('theme').success).toBe(false);
      expect(StorageKeySchema.safeParse('').success).toBe(false);
    });
  });

  describe('isValidStorageKey', () => {
    it('should return true for valid keys', () => {
      expect(isValidStorageKey('sb-theme')).toBe(true);
      expect(isValidStorageKey('sb-language')).toBe(true);
      expect(isValidStorageKey('sb-chat-state')).toBe(true);
      expect(isValidStorageKey('sb-chat-history')).toBe(true);
    });

    it('should return false for invalid keys', () => {
      expect(isValidStorageKey('invalid')).toBe(false);
      expect(isValidStorageKey('')).toBe(false);
      expect(isValidStorageKey(null)).toBe(false);
      expect(isValidStorageKey(undefined)).toBe(false);
    });
  });

  // ============================================================================
  // safeJsonParse Tests
  // ============================================================================

  describe('safeJsonParse', () => {
    it('should parse and validate valid JSON', () => {
      const json = JSON.stringify({ id: 'msg-1', type: 'user', content: 'Hi', timestamp: 1 });
      const result = safeJsonParse(json, MessageSchema);
      expect(result).toEqual({ id: 'msg-1', type: 'user', content: 'Hi', timestamp: 1 });
    });

    it('should return null for invalid JSON', () => {
      const result = safeJsonParse('not valid json', ThemeSchema);
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = safeJsonParse(null, ThemeSchema);
      expect(result).toBeNull();
    });

    it('should return null when schema validation fails', () => {
      const json = JSON.stringify({ invalid: 'data' });
      const result = safeJsonParse(json, MessageSchema);
      expect(result).toBeNull();
    });

    it('should work with simple schemas', () => {
      const json = JSON.stringify('dark');
      const result = safeJsonParse(json, ThemeSchema);
      expect(result).toBe('dark');
    });

    it('should work with array schemas', () => {
      const json = JSON.stringify([
        { id: '1', type: 'user', content: 'Hello', timestamp: 1 },
        { id: '2', type: 'bot', content: 'Hi!', timestamp: 2 },
      ]);
      const result = safeJsonParse(json, MessagesSchema);
      expect(result).toHaveLength(2);
    });
  });
});
