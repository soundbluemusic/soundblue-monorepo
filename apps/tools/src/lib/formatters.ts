/**
 * Unified Formatting Utilities
 *
 * Consolidated from multiple tool files.
 */

/**
 * Format milliseconds to human-readable string
 *
 * @param ms - Milliseconds
 * @returns Formatted string (e.g., "500 ms" or "1.5 s")
 */
export function formatMs(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Format frequency in Hz
 *
 * @param hz - Frequency in Hz
 * @returns Formatted string (e.g., "440.0 Hz")
 */
export function formatHz(hz: number): string {
  return `${hz.toFixed(1)} Hz`;
}

/**
 * Format time duration from milliseconds to MM:SS format
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "02:30")
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format BPM value
 *
 * @param bpm - Beats per minute
 * @returns Formatted string (e.g., "120 BPM")
 */
export function formatBpm(bpm: number): string {
  return `${Math.round(bpm)} BPM`;
}

/**
 * Format percentage
 *
 * @param value - Value between 0-100
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string (e.g., "85%")
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with locale-aware thousands separator
 *
 * @param value - Number to format
 * @param locale - Locale string (default: 'en')
 * @returns Formatted string
 */
export function formatNumber(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale).format(value);
}
