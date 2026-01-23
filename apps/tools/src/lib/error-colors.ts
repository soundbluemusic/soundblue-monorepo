/**
 * @fileoverview Error Color Utilities
 *
 * Unified color system for spell checker error types.
 * Used by both Korean and English spell checkers.
 */

/** Error color definitions */
const ERROR_COLORS = {
  // Common error types
  spacing: {
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  grammar: {
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  // Korean spell checker: typo
  typo: {
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  // English spell checker: spelling
  spelling: {
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
} as const;

/** Default colors for unknown error types */
const DEFAULT_COLORS = {
  text: 'text-muted-foreground',
  badge: 'bg-muted text-muted-foreground',
} as const;

/** Supported error types */
export type ErrorType = keyof typeof ERROR_COLORS;

/**
 * Get text color class for an error type
 *
 * @param type - Error type (spacing, grammar, typo, spelling)
 * @returns Tailwind text color class
 *
 * @example
 * getErrorColor('typo') // 'text-red-600 dark:text-red-400'
 */
export function getErrorColor<T extends string>(type: T): string {
  return ERROR_COLORS[type as ErrorType]?.text ?? DEFAULT_COLORS.text;
}

/**
 * Get badge color class for an error type
 *
 * @param type - Error type (spacing, grammar, typo, spelling)
 * @returns Tailwind badge color classes
 *
 * @example
 * getErrorBadgeColor('spacing') // 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
 */
export function getErrorBadgeColor<T extends string>(type: T): string {
  return ERROR_COLORS[type as ErrorType]?.badge ?? DEFAULT_COLORS.badge;
}
