/**
 * @fileoverview Message loader for i18n
 *
 * Provides typed message functions that load from JSON files.
 * Messages are tree-shakeable and compiled at build time.
 */

import { getLocale } from '~/paraglide/runtime';
import enMessagesRaw from '../../project.inlang/messages/en.json';
import koMessagesRaw from '../../project.inlang/messages/ko.json';

// Handle both ESM and CommonJS JSON imports
const enMessages = (enMessagesRaw as any).default || enMessagesRaw;
const koMessages = (koMessagesRaw as any).default || koMessagesRaw;

type MessageKey = keyof typeof enMessages;

const messages: Record<string, Record<MessageKey, string>> = {
  en: enMessages,
  ko: koMessages,
};

/**
 * Get a translated message by key
 */
export function getMessage(key: MessageKey): string {
  try {
    const locale = typeof getLocale === 'function' ? getLocale() : 'en';
    return messages[locale]?.[key] ?? messages['en']?.[key] ?? (key as string);
  } catch {
    // Fallback to English if getLocale fails (e.g., during SSR)
    return messages['en']?.[key] ?? (key as string);
  }
}

// Create message functions - simple object without Proxy
const createMessageFn = (key: MessageKey) => () => getMessage(key);

// Export message object
const m: Record<string, () => string> = {};

// Generate all message functions
Object.keys(enMessages).forEach((key: string) => {
  const msgKey = key as MessageKey;
  const dottedKey = key.replace(/_/g, '.');
  m[dottedKey] = createMessageFn(msgKey);
  m[key] = createMessageFn(msgKey);
});

export default m;
