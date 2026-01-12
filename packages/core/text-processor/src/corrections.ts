// ========================================
// @soundblue/text-processor - Correction Utilities
// Common correction algorithms for text processing
// ========================================

import type { TextError } from './types';

/**
 * Minimal interface for correction application
 * Allows compatibility with different error types (TextError, EnglishSpellError, etc.)
 */
interface CorrectionError {
  start: number;
  end: number;
  suggestions: string[];
}

/**
 * Apply corrections to text based on error list
 *
 * Algorithm:
 * 1. Sort errors by position (descending - back to front)
 * 2. Apply each correction using string slicing
 * 3. Processing back-to-front prevents position shifts
 *
 * @param text - Original text to correct
 * @param errors - List of errors with suggestions (only needs start, end, suggestions)
 * @returns Corrected text (using first suggestion for each error)
 *
 * @example
 * const errors = [
 *   { start: 0, end: 5, suggestions: ['Hello'] },
 *   { start: 6, end: 11, suggestions: ['world'] }
 * ];
 * applyCorrections('Helo  wrold', errors);
 * // Returns: 'Hello world'
 */
export function applyCorrections(text: string, errors: CorrectionError[]): string {
  if (errors.length === 0) return text;

  // Sort by position descending (back to front)
  // This prevents position shifts when applying corrections
  const sorted = [...errors].sort((a, b) => b.start - a.start);

  let corrected = text;
  for (const error of sorted) {
    if (error.suggestions.length > 0) {
      corrected =
        corrected.slice(0, error.start) + error.suggestions[0] + corrected.slice(error.end);
    }
  }

  return corrected;
}

/**
 * Sort errors by position (ascending)
 * Useful for displaying errors in order
 *
 * @param errors - List of errors to sort
 * @returns New array sorted by start position
 */
export function sortErrorsByPosition(errors: TextError[]): TextError[] {
  return [...errors].sort((a, b) => a.start - b.start);
}

/**
 * Filter overlapping errors, keeping the higher confidence one
 * Prevents double-correction of the same text region
 *
 * @param errors - List of errors (may contain overlaps)
 * @returns Filtered list without overlaps
 */
export function filterOverlappingErrors(errors: TextError[]): TextError[] {
  if (errors.length <= 1) return errors;

  // Sort by start position
  const sorted = sortErrorsByPosition(errors);
  const result: TextError[] = [];

  for (const error of sorted) {
    // Check if this error overlaps with the last accepted error
    const last = result[result.length - 1];
    if (!last || error.start >= last.end) {
      // No overlap, add to result
      result.push(error);
    } else {
      // Overlap detected - keep the one with higher confidence
      const errorConfidence = error.confidence ?? 0.5;
      const lastConfidence = last.confidence ?? 0.5;
      if (errorConfidence > lastConfidence) {
        result[result.length - 1] = error;
      }
      // Otherwise keep the existing one (last)
    }
  }

  return result;
}
