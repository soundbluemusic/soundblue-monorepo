/**
 * Type declarations for Paraglide runtime
 *
 * Paraglide generates runtime code at build time.
 * This declaration provides types for the generated module.
 */

declare module '~/paraglide/runtime' {
  /** Supported locales */
  export type Locale = 'en' | 'ko';

  /** Get the current locale */
  export function getLocale(): Locale;

  /** Set the current locale */
  export function setLocale(locale: Locale): void;

  /** Check if a value is a valid locale */
  export function isLocale(value: unknown): value is Locale;

  /** Available locales */
  export const locales: readonly Locale[];

  /** Default/source locale */
  export const sourceLocale: Locale;
}
