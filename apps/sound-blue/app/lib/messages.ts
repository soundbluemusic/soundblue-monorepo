/**
 * @fileoverview Message loader for i18n
 *
 * Provides typed message functions that load from JSON files.
 * Messages are tree-shakeable and compiled at build time.
 */

import { getLocale } from '~/paraglide/runtime';
import enMessagesRaw from '../../project.inlang/messages/en.json';
import koMessagesRaw from '../../project.inlang/messages/ko.json';

/** Type for JSON modules that may have a default wrapper (ESM/CJS compatibility) */
type JsonModuleWithDefault<T> = T & { default?: T };

/**
 * Unwrap JSON module handling both ESM and CommonJS formats
 * ESM bundles JSON directly, CJS may wrap in { default: ... }
 */
function unwrapJsonModule<T extends Record<string, string | string[]>>(
  module: JsonModuleWithDefault<T>,
): T {
  return module.default ?? module;
}

const enMessages = unwrapJsonModule(enMessagesRaw);
const koMessages = unwrapJsonModule(koMessagesRaw);

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

// Create message functions on-demand
const createMessageFn = (key: MessageKey) => () => getMessage(key);

// Export message object with Proxy for on-demand function creation
const m = new Proxy({} as Record<string, () => string>, {
  get(_target, prop: string) {
    // Convert dotted notation back to underscore for lookup
    const underscoreKey = prop.replace(/\./g, '_');
    return createMessageFn(underscoreKey as MessageKey);
  },
});

export default m;
