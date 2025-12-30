// ========================================
// @soundblue/locale - Types
// Pure locale type definitions
// ========================================

/**
 * Supported locales in the application
 */
export type Locale = 'en' | 'ko';

/**
 * All supported locales as a readonly tuple
 */
export const SUPPORTED_LOCALES = ['en', 'ko'] as const satisfies readonly Locale[];

/**
 * Default locale for the application
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Text direction
 */
export type TextDirection = 'ltr' | 'rtl';
