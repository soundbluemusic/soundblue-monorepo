/**
 * @fileoverview Library utilities barrel export.
 *
 * Re-exports all utility functions, types, and schemas from the lib module.
 *
 * @module lib
 */

// Route types and utilities
export type { AppRoute, ExternalUrl, KoreanRoute, PageRoute } from './routes';
export {
  createLocalizedPath,
  getBasePath,
  isAppRoute,
  isExternalUrl,
  isKoreanRoute,
  isPageRoute,
  PAGE_ROUTES,
} from './routes';
// Schemas and validation
export type {
  InferSchema,
  Language,
  Message,
  SavedChatState,
  StorageKey,
  Theme,
} from './schemas';
export {
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
// Type utilities
export type { Branded, Failure, Result, StorageKeyBrand, Success, UrlPathBrand } from './types';
export {
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
// Class name utility
export { cn } from './utils';
