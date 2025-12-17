/**
 * @fileoverview Shared responsive breakpoint constants
 *
 * Provides consistent breakpoint values across all apps for responsive design.
 * These values align with Tailwind CSS default breakpoints.
 *
 * @module @soundblue/shared/constants/breakpoints
 */

/**
 * Responsive breakpoint values in pixels.
 *
 * These match Tailwind CSS defaults:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 * - 2xl: 1536px
 */
export const BREAKPOINTS = {
  /** Small devices (sm) - 640px */
  sm: 640,
  /** Medium devices (md) - 768px, commonly used for tablet/mobile threshold */
  md: 768,
  /** Large devices (lg) - 1024px */
  lg: 1024,
  /** Extra large devices (xl) - 1280px */
  xl: 1280,
  /** 2x Extra large devices (2xl) - 1536px */
  '2xl': 1536,

  // Semantic aliases
  /** Mobile breakpoint (same as md) */
  mobile: 768,
  /** Tablet breakpoint (same as lg) */
  tablet: 1024,
  /** Desktop breakpoint (same as xl) */
  desktop: 1280,
} as const;

/**
 * Type for breakpoint keys.
 */
export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Checks if the current window width is below a breakpoint.
 * Safe to call during SSR (returns false).
 *
 * @param breakpoint - The breakpoint to check against
 * @returns true if window width is below the breakpoint
 *
 * @example
 * ```ts
 * if (isBelowBreakpoint('md')) {
 *   // Mobile layout
 * }
 * ```
 */
export function isBelowBreakpoint(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS[breakpoint];
}

/**
 * Checks if the current window width is at or above a breakpoint.
 * Safe to call during SSR (returns true for default/desktop).
 *
 * @param breakpoint - The breakpoint to check against
 * @returns true if window width is at or above the breakpoint
 *
 * @example
 * ```ts
 * if (isAtOrAboveBreakpoint('lg')) {
 *   // Desktop layout
 * }
 * ```
 */
export function isAtOrAboveBreakpoint(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Gets the current breakpoint based on window width.
 * Safe to call during SSR (returns '2xl' as default).
 *
 * @returns The current breakpoint key
 *
 * @example
 * ```ts
 * const bp = getCurrentBreakpoint();
 * // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * ```
 */
export function getCurrentBreakpoint(): 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (typeof window === 'undefined') return '2xl';

  const width = window.innerWidth;
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  if (width < BREAKPOINTS.xl) return 'xl';
  return '2xl';
}

/**
 * Creates a media query string for a breakpoint.
 *
 * @param breakpoint - The breakpoint to create query for
 * @param type - 'min' for min-width, 'max' for max-width
 * @returns Media query string
 *
 * @example
 * ```ts
 * const query = getMediaQuery('md', 'max');
 * // '(max-width: 767px)'
 * ```
 */
export function getMediaQuery(
  breakpoint: BreakpointKey,
  type: 'min' | 'max' = 'min',
): string {
  const value = BREAKPOINTS[breakpoint];
  if (type === 'max') {
    return `(max-width: ${value - 1}px)`;
  }
  return `(min-width: ${value}px)`;
}
