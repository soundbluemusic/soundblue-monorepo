// ========================================
// @soundblue/audio-engine - Rhythm
// Rhythm patterns and utilities
// Pure computation - no browser APIs
// ========================================

/**
 * @module rhythm
 * @description
 * Rhythm pattern generation and manipulation utilities for music applications.
 *
 * This module provides:
 * - **Time Signatures**: Common musical time signatures (4/4, 3/4, 6/8, etc.)
 * - **Note Values**: Standard note duration values (whole, half, quarter, etc.)
 * - **Rhythm Patterns**: Pre-defined patterns (four-on-floor, clave, breakbeat, etc.)
 * - **Euclidean Rhythms**: Bjorklund's algorithm for generating mathematically distributed patterns
 * - **Pattern Operations**: Combine, rotate, scale, and invert patterns
 *
 * All functions are pure and have no browser API dependencies, making them
 * suitable for both browser and SSG build environments.
 *
 * @example
 * ```typescript
 * import {
 *   euclideanRhythm,
 *   combineOr,
 *   rotatePattern,
 *   RHYTHM_PATTERNS,
 *   patternToSteps
 * } from '@soundblue/audio-engine';
 *
 * // Generate a 5-hit pattern across 8 steps
 * const hiHat = euclideanRhythm(5, 8);
 * // Result: [true, false, true, true, false, true, true, false]
 *
 * // Combine kick and snare patterns
 * const kick = patternToSteps('fourOnFloor', 16);
 * const snare = patternToSteps('backbeat', 16);
 * const combined = combineOr(kick, snare);
 *
 * // Rotate pattern for variation
 * const shifted = rotatePattern(hiHat, 2);
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Euclidean_rhythm} - Euclidean rhythm theory
 * @see {@link https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf} - Bjorklund's algorithm paper
 */

/**
 * Common musical time signatures.
 *
 * Each time signature defines:
 * - `beats`: Number of beats per measure (numerator)
 * - `noteValue`: The note value that gets one beat (denominator)
 *
 * @example
 * ```typescript
 * const timeSignature = TIME_SIGNATURES['4/4'];
 * console.log(timeSignature.beats);     // 4
 * console.log(timeSignature.noteValue); // 4 (quarter note)
 *
 * // 6/8 time - 6 eighth notes per measure
 * const compound = TIME_SIGNATURES['6/8'];
 * console.log(compound.beats);     // 6
 * console.log(compound.noteValue); // 8 (eighth note)
 * ```
 */
export const TIME_SIGNATURES = {
  '4/4': { beats: 4, noteValue: 4 },
  '3/4': { beats: 3, noteValue: 4 },
  '6/8': { beats: 6, noteValue: 8 },
  '2/4': { beats: 2, noteValue: 4 },
  '5/4': { beats: 5, noteValue: 4 },
  '7/8': { beats: 7, noteValue: 8 },
  '12/8': { beats: 12, noteValue: 8 },
} as const;

export type TimeSignature = keyof typeof TIME_SIGNATURES;

/**
 * Standard note value divisions relative to a whole note.
 *
 * The numeric value represents how many of that note fit in a whole note:
 * - `whole`: 1 (one whole note per whole note)
 * - `half`: 2 (two half notes per whole note)
 * - `quarter`: 4 (four quarter notes per whole note)
 * - `eighth`: 8 (eight eighth notes per whole note)
 * - `sixteenth`: 16 (sixteen sixteenth notes per whole note)
 * - `thirtySecond`: 32 (thirty-two 32nd notes per whole note)
 *
 * @example
 * ```typescript
 * import { NOTE_VALUES, getNoteDuration } from '@soundblue/audio-engine';
 *
 * // Get duration of a quarter note at 120 BPM
 * const quarterDuration = getNoteDuration(120, NOTE_VALUES.quarter);
 * console.log(quarterDuration); // 500ms
 *
 * // Get duration of an eighth note at 120 BPM
 * const eighthDuration = getNoteDuration(120, NOTE_VALUES.eighth);
 * console.log(eighthDuration); // 250ms
 * ```
 */
export const NOTE_VALUES = {
  whole: 1,
  half: 2,
  quarter: 4,
  eighth: 8,
  sixteenth: 16,
  thirtySecond: 32,
} as const;

export type NoteValue = keyof typeof NOTE_VALUES;

/**
 * Pre-defined rhythm patterns commonly used in music production.
 *
 * Each pattern is an array of step indices (0-indexed) where a hit occurs.
 * All patterns are designed for 16-step sequences (one measure of 16th notes).
 *
 * **Pattern Categories:**
 *
 * - **Basic Patterns**: `fourOnFloor`, `backbeat`, `hiHatEighths`, `hiHatSixteenths`, `offbeatHiHat`
 * - **Syncopated Patterns**: `syncopated1`, `syncopated2`, `shuffle`
 * - **Latin Patterns**: `clave32`, `clave23`, `tumbao`
 * - **Breakbeat Patterns**: `breakbeat1`, `breakbeat2`
 *
 * **Visual Representation (16 steps, X = hit, - = rest):**
 *
 * ```
 * fourOnFloor:     X---X---X---X---  (kick on every quarter note)
 * backbeat:        ----X-------X---  (snare on beats 2 and 4)
 * hiHatEighths:    X-X-X-X-X-X-X-X-  (hi-hat on eighth notes)
 * clave32:         X--X---X-X--X---  (3-2 son clave)
 * ```
 *
 * @example
 * ```typescript
 * import { RHYTHM_PATTERNS, patternToSteps } from '@soundblue/audio-engine';
 *
 * // Get the four-on-floor kick pattern
 * const kickIndices = RHYTHM_PATTERNS.fourOnFloor;
 * console.log(kickIndices); // [0, 4, 8, 12]
 *
 * // Convert to boolean step array
 * const kickSteps = patternToSteps('fourOnFloor', 16);
 * // [true, false, false, false, true, false, false, false, ...]
 *
 * // Create a classic house drum pattern
 * const kick = patternToSteps('fourOnFloor', 16);
 * const snare = patternToSteps('backbeat', 16);
 * const hiHat = patternToSteps('hiHatEighths', 16);
 * ```
 *
 * @see {@link https://en.wikipedia.org/wiki/Clave_(rhythm)} - Son clave patterns
 */
export const RHYTHM_PATTERNS = {
  // 16-step patterns
  fourOnFloor: [0, 4, 8, 12], // Kick on every beat
  backbeat: [4, 12], // Snare on 2 and 4
  hiHatEighths: [0, 2, 4, 6, 8, 10, 12, 14], // Hi-hat on 8th notes
  hiHatSixteenths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  offbeatHiHat: [2, 6, 10, 14], // Hi-hat on off-beats

  // Syncopated patterns
  syncopated1: [0, 3, 6, 10, 12, 15], // Basic syncopation
  syncopated2: [0, 3, 4, 7, 8, 11, 12, 15], // More complex
  shuffle: [0, 3, 4, 7, 8, 11, 12, 15], // Shuffle feel

  // Latin patterns (16 steps)
  clave32: [0, 3, 7, 8, 10], // 3-2 son clave
  clave23: [0, 2, 3, 7, 10], // 2-3 son clave
  tumbao: [3, 7, 10, 14], // Basic tumbao

  // Breakbeat patterns
  breakbeat1: [0, 4, 6, 10, 12],
  breakbeat2: [0, 3, 6, 10, 12, 15],
} as const;

export type RhythmPatternName = keyof typeof RHYTHM_PATTERNS;

/**
 * Converts a named rhythm pattern to a boolean step array.
 *
 * Takes a pattern name from {@link RHYTHM_PATTERNS} and creates a boolean array
 * where `true` indicates a hit and `false` indicates a rest.
 *
 * @param patternName - The name of the pattern from RHYTHM_PATTERNS
 * @param totalSteps - The total number of steps in the output array
 * @returns A boolean array where `true` = hit, `false` = rest
 *
 * @example
 * ```typescript
 * // Basic usage - four-on-floor kick pattern
 * const kick = patternToSteps('fourOnFloor', 16);
 * // [true, false, false, false, true, false, false, false,
 * //  true, false, false, false, true, false, false, false]
 *
 * // Use with different step counts (8-step pattern)
 * const shortKick = patternToSteps('fourOnFloor', 8);
 * // [true, false, false, false, true, false, false, false]
 * // Note: Steps beyond totalSteps are ignored
 *
 * // Create a drum machine pattern
 * const kick = patternToSteps('fourOnFloor', 16);
 * const snare = patternToSteps('backbeat', 16);
 * const hiHat = patternToSteps('hiHatEighths', 16);
 *
 * // Play step by step
 * for (let i = 0; i < 16; i++) {
 *   if (kick[i]) playKick();
 *   if (snare[i]) playSnare();
 *   if (hiHat[i]) playHiHat();
 * }
 * ```
 */
export function patternToSteps(patternName: RhythmPatternName, totalSteps: number): boolean[] {
  const pattern = RHYTHM_PATTERNS[patternName];
  const steps: boolean[] = new Array(totalSteps).fill(false);

  for (const step of pattern) {
    if (step < totalSteps) {
      steps[step] = true;
    }
  }

  return steps;
}

/**
 * Converts a boolean step array to an array of active step indices.
 *
 * This is the inverse operation of {@link patternToSteps}.
 * Useful for analyzing patterns or converting user-created patterns
 * to a compact index format.
 *
 * @param steps - A boolean array where `true` = hit, `false` = rest
 * @returns An array of indices where the pattern has hits
 *
 * @example
 * ```typescript
 * // Convert boolean array to indices
 * const steps = [true, false, false, true, false, true, false, false];
 * const indices = stepsToPattern(steps);
 * console.log(indices); // [0, 3, 5]
 *
 * // Round-trip conversion
 * const original = patternToSteps('fourOnFloor', 16);
 * const indices = stepsToPattern(original);
 * console.log(indices); // [0, 4, 8, 12]
 *
 * // Analyze user pattern
 * const userPattern = [true, true, false, true, true, false, true, true];
 * const hitIndices = stepsToPattern(userPattern);
 * const density = hitIndices.length / userPattern.length;
 * console.log(`Pattern density: ${(density * 100).toFixed(0)}%`); // "Pattern density: 75%"
 * ```
 */
export function stepsToPattern(steps: boolean[]): number[] {
  return steps.reduce<number[]>((acc, step, index) => {
    if (step) acc.push(index);
    return acc;
  }, []);
}

/**
 * Generates an Euclidean rhythm pattern using Bjorklund's algorithm.
 *
 * Euclidean rhythms distribute a given number of hits as evenly as possible
 * across a given number of steps. Many traditional world music rhythms
 * (Cuban tresillo, African bell patterns, etc.) are Euclidean rhythms.
 *
 * **Algorithm:**
 * Uses Bjorklund's algorithm (originally designed for neutron accelerator timing)
 * to compute the maximally even distribution. Time complexity: O(n log n)
 *
 * **Mathematical Properties:**
 * - E(k, n) produces a pattern where the maximum gap between consecutive hits
 *   differs by at most 1 from the minimum gap
 * - The algorithm is equivalent to computing Bresenham's line algorithm
 *
 * **Common Euclidean Rhythms in Music:**
 * - E(3, 8) = Cuban tresillo [X--X--X-]
 * - E(5, 8) = Cuban cinquillo [X-XX-XX-]
 * - E(7, 12) = West African bell pattern
 * - E(5, 16) = Bossa nova
 * - E(4, 12) = Afro-Cuban 6/8 feel
 *
 * @param hits - Number of active steps (onsets). Must be non-negative.
 * @param steps - Total number of steps in the pattern. Must be positive.
 * @param rotation - Optional rotation offset (default: 0). Positive rotates left.
 * @returns A boolean array where `true` = hit, `false` = rest
 *
 * @example
 * ```typescript
 * // Cuban tresillo - 3 hits over 8 steps
 * const tresillo = euclideanRhythm(3, 8);
 * // [true, false, false, true, false, false, true, false]
 * // Visual: X--X--X-
 *
 * // Cuban cinquillo - 5 hits over 8 steps
 * const cinquillo = euclideanRhythm(5, 8);
 * // [true, false, true, true, false, true, true, false]
 * // Visual: X-XX-XX-
 *
 * // Bossa nova - 5 hits over 16 steps with rotation
 * const bossaNova = euclideanRhythm(5, 16, 3);
 *
 * // Edge cases
 * const empty = euclideanRhythm(0, 8);  // [false, false, false, false, false, false, false, false]
 * const full = euclideanRhythm(8, 8);   // [true, true, true, true, true, true, true, true]
 *
 * // Create variations with rotation
 * const base = euclideanRhythm(5, 16);
 * const variation1 = euclideanRhythm(5, 16, 1);  // Shifted by 1
 * const variation2 = euclideanRhythm(5, 16, -2); // Shifted by -2 (wraps around)
 * ```
 *
 * @see {@link https://cgm.cs.mcgill.ca/~godfried/publications/banff.pdf} - Original Bjorklund paper
 * @see {@link https://en.wikipedia.org/wiki/Euclidean_rhythm} - Euclidean rhythm theory
 */
export function euclideanRhythm(hits: number, steps: number, rotation = 0): boolean[] {
  if (hits <= 0) return new Array(steps).fill(false);
  if (hits >= steps) return new Array(steps).fill(true);

  // Bjorklund's algorithm
  const pattern: number[][] = [];

  for (let i = 0; i < steps; i++) {
    pattern.push([i < hits ? 1 : 0]);
  }

  let divisor = steps - hits;

  while (divisor > 1) {
    const remainder = pattern.length - divisor;
    const count = Math.min(divisor, remainder);

    for (let i = 0; i < count; i++) {
      const removed = pattern.pop();
      if (removed) {
        pattern[i].push(...removed);
      }
    }

    divisor = pattern.length - count;
  }

  // Flatten and convert to boolean
  const result = pattern.flat().map((v) => v === 1);

  // Apply rotation
  if (rotation !== 0) {
    const rot = ((rotation % steps) + steps) % steps;
    return [...result.slice(rot), ...result.slice(0, rot)];
  }

  return result;
}

/**
 * Calculates the density (fill ratio) of a rhythm pattern.
 *
 * Density is the ratio of hits to total steps, expressed as a value between 0 and 1.
 * This is useful for analyzing pattern complexity or comparing patterns.
 *
 * **Density Interpretation:**
 * - 0.0 = Empty pattern (no hits)
 * - 0.25 = Sparse pattern (e.g., basic kick drum)
 * - 0.5 = Medium density (e.g., eighth note hi-hat)
 * - 0.75+ = Dense pattern (e.g., sixteenth note fills)
 * - 1.0 = Fully filled pattern
 *
 * @param pattern - A boolean array representing the rhythm pattern
 * @returns A number between 0 and 1 representing the density
 *
 * @example
 * ```typescript
 * // Four-on-floor: 4 hits in 16 steps = 0.25
 * const kick = patternToSteps('fourOnFloor', 16);
 * console.log(calculateDensity(kick)); // 0.25
 *
 * // Eighth note hi-hat: 8 hits in 16 steps = 0.5
 * const hiHat = patternToSteps('hiHatEighths', 16);
 * console.log(calculateDensity(hiHat)); // 0.5
 *
 * // Sixteenth note hi-hat: 16 hits in 16 steps = 1.0
 * const dense = patternToSteps('hiHatSixteenths', 16);
 * console.log(calculateDensity(dense)); // 1.0
 *
 * // Empty pattern
 * const empty: boolean[] = new Array(16).fill(false);
 * console.log(calculateDensity(empty)); // 0
 *
 * // Use for pattern analysis
 * function describePattern(pattern: boolean[]): string {
 *   const density = calculateDensity(pattern);
 *   if (density < 0.2) return 'sparse';
 *   if (density < 0.5) return 'moderate';
 *   if (density < 0.8) return 'dense';
 *   return 'very dense';
 * }
 * ```
 */
export function calculateDensity(pattern: boolean[]): number {
  if (pattern.length === 0) return 0;
  const hits = pattern.filter(Boolean).length;
  return hits / pattern.length;
}

/**
 * Inverts a rhythm pattern (flips all hits to rests and vice versa).
 *
 * This creates the "negative" of a pattern, which can be useful for:
 * - Creating complementary patterns
 * - Ghost notes (playing where the main instrument doesn't)
 * - Off-beat patterns
 *
 * @param pattern - A boolean array representing the rhythm pattern
 * @returns A new array with all values inverted
 *
 * @example
 * ```typescript
 * // Invert four-on-floor to get off-beat pattern
 * const kick = patternToSteps('fourOnFloor', 8);
 * // [true, false, false, false, true, false, false, false]
 *
 * const offBeats = invertPattern(kick);
 * // [false, true, true, true, false, true, true, true]
 *
 * // Create ghost notes for hi-hat
 * const mainHiHat = patternToSteps('hiHatEighths', 16);
 * const ghostNotes = invertPattern(mainHiHat);
 *
 * // Combine for layered feel (using combineOr for both)
 * // Main hi-hat: X-X-X-X-X-X-X-X-
 * // Ghost notes: -X-X-X-X-X-X-X-X
 * ```
 */
export function invertPattern(pattern: boolean[]): boolean[] {
  return pattern.map((step) => !step);
}

/**
 * Rotates a rhythm pattern by a specified number of steps.
 *
 * Rotation shifts all elements in the pattern, with elements that fall off
 * one end wrapping around to the other. Positive values rotate left (earlier),
 * negative values rotate right (later).
 *
 * **Use Cases:**
 * - Create pattern variations without changing the feel
 * - Align patterns to different downbeats
 * - Explore different groove positions for the same pattern
 *
 * @param pattern - A boolean array representing the rhythm pattern
 * @param amount - Number of steps to rotate. Positive = left, negative = right.
 * @returns A new rotated array (original is not modified)
 *
 * @example
 * ```typescript
 * // Original pattern: X--X--X-
 * const original = [true, false, false, true, false, false, true, false];
 *
 * // Rotate left by 1: --X--X-X
 * const left1 = rotatePattern(original, 1);
 * // [false, false, true, false, false, true, false, true]
 *
 * // Rotate right by 1: -X--X--X
 * const right1 = rotatePattern(original, -1);
 * // [false, true, false, false, true, false, false, true]
 *
 * // Rotate by pattern length returns original
 * const full = rotatePattern(original, 8);
 * // Same as original
 *
 * // Create 4 variations of a clave pattern
 * const clave = euclideanRhythm(5, 16);
 * const variations = [
 *   clave,
 *   rotatePattern(clave, 4),
 *   rotatePattern(clave, 8),
 *   rotatePattern(clave, 12),
 * ];
 * ```
 */
export function rotatePattern(pattern: boolean[], amount: number): boolean[] {
  if (pattern.length === 0) return [];
  const rot = ((amount % pattern.length) + pattern.length) % pattern.length;
  return [...pattern.slice(rot), ...pattern.slice(0, rot)];
}

/**
 * Combines two rhythm patterns using logical AND.
 *
 * The result pattern has a hit only where **both** input patterns have hits.
 * This creates an "intersection" of the two patterns.
 *
 * **Use Cases:**
 * - Create accent patterns (hits on strong beats only)
 * - Find common elements between two patterns
 * - Create sparse "skeleton" patterns from dense ones
 *
 * **Pattern lengths:** If patterns have different lengths, the result uses
 * the longer length. Missing positions in the shorter pattern are treated as `false`.
 *
 * @param pattern1 - First boolean pattern array
 * @param pattern2 - Second boolean pattern array
 * @returns A new array with AND-combined values
 *
 * @example
 * ```typescript
 * // Visual: AND only keeps positions where both have hits
 * // Pattern 1: X-X-X-X-  (8th note hi-hat)
 * // Pattern 2: X---X---  (4-on-floor kick)
 * // Result:    X---X---  (only where both hit)
 *
 * const hiHat = [true, false, true, false, true, false, true, false];
 * const kick = [true, false, false, false, true, false, false, false];
 * const accents = combineAnd(hiHat, kick);
 * // [true, false, false, false, true, false, false, false]
 *
 * // Create accented hi-hat that emphasizes kick hits
 * const mainHiHat = patternToSteps('hiHatEighths', 16);
 * const kickPattern = patternToSteps('fourOnFloor', 16);
 * const accentedHits = combineAnd(mainHiHat, kickPattern);
 *
 * // Different lengths (shorter pattern padded with false)
 * const short = [true, true, true, true];
 * const long = [true, false, true, false, true, false, true, false];
 * const result = combineAnd(short, long);
 * // [true, false, true, false, false, false, false, false]
 * ```
 *
 * @see {@link combineOr} - For union (OR) combination
 * @see {@link combineXor} - For exclusive OR combination
 */
export function combineAnd(pattern1: boolean[], pattern2: boolean[]): boolean[] {
  const length = Math.max(pattern1.length, pattern2.length);
  const result: boolean[] = [];

  for (let i = 0; i < length; i++) {
    result.push((pattern1[i] ?? false) && (pattern2[i] ?? false));
  }

  return result;
}

/**
 * Combines two rhythm patterns using logical OR.
 *
 * The result pattern has a hit where **either** (or both) input patterns have hits.
 * This creates a "union" of the two patterns.
 *
 * **Use Cases:**
 * - Layer multiple drum parts into one pattern
 * - Merge variations to create a fuller pattern
 * - Combine different instruments for analysis
 *
 * **Pattern lengths:** If patterns have different lengths, the result uses
 * the longer length. Missing positions in the shorter pattern are treated as `false`.
 *
 * @param pattern1 - First boolean pattern array
 * @param pattern2 - Second boolean pattern array
 * @returns A new array with OR-combined values
 *
 * @example
 * ```typescript
 * // Visual: OR keeps positions where either has a hit
 * // Pattern 1: X---X---  (kick)
 * // Pattern 2: ----X-------X---  (snare)
 * // Result:    X---X-------X---  (combined)
 *
 * const kick = patternToSteps('fourOnFloor', 16);
 * const snare = patternToSteps('backbeat', 16);
 * const drumPattern = combineOr(kick, snare);
 *
 * // Layer hi-hat with kick for combined rhythm
 * const hiHat = patternToSteps('hiHatEighths', 16);
 * const layered = combineOr(hiHat, kick);
 *
 * // Build complex pattern by layering multiple elements
 * const clave = euclideanRhythm(5, 16);
 * const pulse = euclideanRhythm(3, 16);
 * const complex = combineOr(clave, pulse);
 *
 * // Different lengths
 * const short = [true, false, true, false];
 * const long = [false, false, false, false, true, false, true, false];
 * const result = combineOr(short, long);
 * // [true, false, true, false, true, false, true, false]
 * ```
 *
 * @see {@link combineAnd} - For intersection (AND) combination
 * @see {@link combineXor} - For exclusive OR combination
 */
export function combineOr(pattern1: boolean[], pattern2: boolean[]): boolean[] {
  const length = Math.max(pattern1.length, pattern2.length);
  const result: boolean[] = [];

  for (let i = 0; i < length; i++) {
    result.push((pattern1[i] ?? false) || (pattern2[i] ?? false));
  }

  return result;
}

/**
 * Combines two rhythm patterns using logical XOR (exclusive OR).
 *
 * The result pattern has a hit where **exactly one** of the input patterns has a hit,
 * but not both. This creates a "symmetric difference" of the two patterns.
 *
 * **Use Cases:**
 * - Create call-and-response patterns
 * - Generate complementary rhythms that don't overlap
 * - Create polyrhythmic textures
 * - Identify unique hits in each pattern
 *
 * **Pattern lengths:** If patterns have different lengths, the result uses
 * the longer length. Missing positions in the shorter pattern are treated as `false`.
 *
 * @param pattern1 - First boolean pattern array
 * @param pattern2 - Second boolean pattern array
 * @returns A new array with XOR-combined values
 *
 * @example
 * ```typescript
 * // Visual: XOR keeps positions where exactly one has a hit
 * // Pattern 1: X-X-X-X-  (8th note hi-hat)
 * // Pattern 2: X---X---  (4-on-floor kick)
 * // Result:    --X---X-  (hi-hat hits without kick)
 *
 * const hiHat = [true, false, true, false, true, false, true, false];
 * const kick = [true, false, false, false, true, false, false, false];
 * const hiHatOnly = combineXor(hiHat, kick);
 * // [false, false, true, false, false, false, true, false]
 *
 * // Create call-and-response between two patterns
 * const patternA = euclideanRhythm(3, 8);  // X--X--X-
 * const patternB = euclideanRhythm(5, 8);  // X-XX-XX-
 * const response = combineXor(patternA, patternB);
 * // Only hits where patterns differ
 *
 * // Create ghost notes (play where kick doesn't)
 * const kickPattern = patternToSteps('fourOnFloor', 16);
 * const offBeats = combineXor(
 *   new Array(16).fill(true),  // All hits
 *   kickPattern                 // Kick pattern
 * );
 * // Same as invertPattern(kickPattern) in this case
 * ```
 *
 * @see {@link combineAnd} - For intersection (AND) combination
 * @see {@link combineOr} - For union (OR) combination
 */
export function combineXor(pattern1: boolean[], pattern2: boolean[]): boolean[] {
  const length = Math.max(pattern1.length, pattern2.length);
  const result: boolean[] = [];

  for (let i = 0; i < length; i++) {
    const a = pattern1[i] ?? false;
    const b = pattern2[i] ?? false;
    result.push((a || b) && !(a && b));
  }

  return result;
}

/**
 * Scales a rhythm pattern to a different length using nearest-neighbor sampling.
 *
 * This resamples the pattern to fit a new number of steps while preserving
 * the overall rhythm structure. Useful for tempo changes, time signature
 * conversions, or fitting patterns to different grid resolutions.
 *
 * **Scaling Behavior:**
 * - **Upscaling** (larger newLength): Stretches pattern, may duplicate hits
 * - **Downscaling** (smaller newLength): Compresses pattern, may lose some hits
 * - Uses nearest-neighbor interpolation (no smoothing)
 *
 * **Limitations:**
 * - Non-integer scaling ratios may shift hit positions slightly
 * - Very aggressive downscaling may lose pattern character
 * - For musical results, prefer 2x or 0.5x scaling ratios
 *
 * @param pattern - A boolean array representing the rhythm pattern
 * @param newLength - The desired length of the output pattern. Must be positive.
 * @returns A new array with the scaled pattern, or empty array if newLength ≤ 0
 *
 * @example
 * ```typescript
 * // Upscale 8-step pattern to 16 steps (double time)
 * const pattern8 = [true, false, true, false, true, false, true, false];
 * const pattern16 = scalePattern(pattern8, 16);
 * // [true, true, false, false, true, true, false, false,
 * //  true, true, false, false, true, true, false, false]
 *
 * // Downscale 16-step pattern to 8 steps (half time)
 * const hiHat16 = patternToSteps('hiHatSixteenths', 16);
 * const hiHat8 = scalePattern(hiHat16, 8);
 *
 * // Convert between time signatures
 * const pattern12 = euclideanRhythm(7, 12);  // 12/8 feel
 * const pattern16 = scalePattern(pattern12, 16);  // 4/4 feel
 *
 * // Fit 16-step pattern to 32-step grid for higher resolution
 * const kick = patternToSteps('fourOnFloor', 16);
 * const kickHiRes = scalePattern(kick, 32);
 *
 * // Edge cases
 * const empty = scalePattern([true, false], 0);  // []
 * const fromEmpty = scalePattern([], 8);  // []
 * ```
 */
export function scalePattern(pattern: boolean[], newLength: number): boolean[] {
  if (newLength <= 0 || pattern.length === 0) return [];

  const result: boolean[] = [];
  const ratio = pattern.length / newLength;

  for (let i = 0; i < newLength; i++) {
    const sourceIndex = Math.floor(i * ratio);
    result.push(pattern[sourceIndex]);
  }

  return result;
}
