// ========================================
// @soundblue/text-processor - Statistics Utilities
// Common statistics calculation for text processing
// ========================================

import type { TextCheckStats, TextError } from './types';

/**
 * Calculate error statistics from a list of errors
 *
 * @param errors - List of text errors
 * @param totalItems - Total items checked (words or characters)
 * @returns Statistics object with counts by error type
 *
 * @example
 * const stats = calculateStats(errors, 100);
 * // { totalItems: 100, spellingErrors: 3, spacingErrors: 2, ... }
 */
export function calculateStats(errors: TextError[], totalItems = 0): TextCheckStats {
  return {
    totalItems,
    spellingErrors: errors.filter((e) => e.type === 'spelling').length,
    spacingErrors: errors.filter((e) => e.type === 'spacing').length,
    grammarErrors: errors.filter((e) => e.type === 'grammar').length,
    typoErrors: errors.filter((e) => e.type === 'typo').length,
  };
}

/**
 * Get total error count from statistics
 *
 * @param stats - Statistics object
 * @returns Total number of errors
 */
export function getTotalErrors(stats: TextCheckStats): number {
  return stats.spellingErrors + stats.spacingErrors + stats.grammarErrors + stats.typoErrors;
}

/**
 * Calculate error rate (errors per item)
 *
 * @param stats - Statistics object
 * @returns Error rate (0-1), or 0 if no items
 */
export function getErrorRate(stats: TextCheckStats): number {
  if (stats.totalItems === 0) return 0;
  return getTotalErrors(stats) / stats.totalItems;
}

/**
 * Create empty statistics object
 *
 * @param totalItems - Total items checked
 * @returns Empty statistics with zero counts
 */
export function createEmptyStats(totalItems = 0): TextCheckStats {
  return {
    totalItems,
    spellingErrors: 0,
    spacingErrors: 0,
    grammarErrors: 0,
    typoErrors: 0,
  };
}
