// ========================================
// @soundblue/audio-engine - Rhythm
// Rhythm patterns and utilities
// Pure computation - no browser APIs
// ========================================

/**
 * Common time signatures
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
 * Note value names
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
 * Common rhythm patterns (as arrays of step indices)
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
 * Convert rhythm pattern to step array
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
 * Convert step array to rhythm pattern (indices of active steps)
 */
export function stepsToPattern(steps: boolean[]): number[] {
  return steps.reduce<number[]>((acc, step, index) => {
    if (step) acc.push(index);
    return acc;
  }, []);
}

/**
 * Generate euclidean rhythm
 * @param hits - Number of active steps
 * @param steps - Total number of steps
 * @param rotation - Rotation offset
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
 * Calculate the density of a rhythm pattern (0-1)
 */
export function calculateDensity(pattern: boolean[]): number {
  if (pattern.length === 0) return 0;
  const hits = pattern.filter(Boolean).length;
  return hits / pattern.length;
}

/**
 * Invert a rhythm pattern
 */
export function invertPattern(pattern: boolean[]): boolean[] {
  return pattern.map((step) => !step);
}

/**
 * Rotate a rhythm pattern
 */
export function rotatePattern(pattern: boolean[], amount: number): boolean[] {
  if (pattern.length === 0) return [];
  const rot = ((amount % pattern.length) + pattern.length) % pattern.length;
  return [...pattern.slice(rot), ...pattern.slice(0, rot)];
}

/**
 * Combine two patterns with AND logic
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
 * Combine two patterns with OR logic
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
 * Combine two patterns with XOR logic
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
 * Scale a pattern to a different length
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
