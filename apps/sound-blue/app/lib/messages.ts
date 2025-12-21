/**
 * @fileoverview Message loader for i18n
 *
 * Provides typed message functions that load from JSON files.
 * Messages are tree-shakeable and compiled at build time.
 */

// @ts-expect-error - Paraglide runtime types not available
import { getLocale } from '~/paraglide/runtime';
import enMessagesRaw from '../../project.inlang/messages/en.json';
import koMessagesRaw from '../../project.inlang/messages/ko.json';

// Handle both ESM and CommonJS JSON imports
// biome-ignore lint/suspicious/noExplicitAny: Required for ESM/CommonJS compatibility
const enMessages = (enMessagesRaw as any).default || enMessagesRaw;
// biome-ignore lint/suspicious/noExplicitAny: Required for ESM/CommonJS compatibility
const koMessages = (koMessagesRaw as any).default || koMessagesRaw;

type MessageKey = keyof typeof enMessages;
type MessageValue = (typeof enMessages)[MessageKey];

const messages: Record<string, Record<string, MessageValue>> = {
  en: enMessages,
  ko: koMessages,
};

/**
 * Get a translated message by key (string only)
 */
export function getMessage(key: MessageKey): string {
  try {
    const locale = typeof getLocale === 'function' ? getLocale() : 'en';
    const keyStr = String(key);
    const value = messages[locale]?.[keyStr] ?? messages['en']?.[keyStr] ?? keyStr;
    return typeof value === 'string' ? value : keyStr;
  } catch {
    // Fallback to English if getLocale fails (e.g., during SSR)
    const keyStr = String(key);
    const value = messages['en']?.[keyStr] ?? keyStr;
    return typeof value === 'string' ? value : keyStr;
  }
}

/**
 * Get raw message data (can be string or array)
 */
export function getRawMessage(key: MessageKey): MessageValue {
  try {
    const locale = typeof getLocale === 'function' ? getLocale() : 'en';
    const keyStr = String(key);
    return messages[locale]?.[keyStr] ?? messages['en']?.[keyStr];
  } catch {
    const keyStr = String(key);
    return messages['en']?.[keyStr];
  }
}

// Create message functions - simple object without Proxy
const createMessageFn = (key: MessageKey) => () => getMessage(key);

// Export message object
const m: Record<string, () => string> = {};

// Generate all message functions
Object.keys(enMessages).forEach((key) => {
  const msgKey = key as MessageKey;
  const dottedKey = key.replace(/_/g, '.');
  m[dottedKey] = createMessageFn(msgKey);
  m[key] = createMessageFn(msgKey);
});

export default m;
