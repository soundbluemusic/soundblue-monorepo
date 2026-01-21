/**
 * @module theory
 *
 * @description
 * Music theory utilities for scales, rhythms, and note calculations.
 *
 * This module provides two main areas of functionality:
 *
 * 1. **Rhythm** - Pattern generation, Euclidean rhythms, and pattern manipulation
 * 2. **Scale** - Musical scales, note conversion, and MIDI calculations
 *
 * All functions are pure and have no browser API dependencies.
 *
 * ## Rhythm Utilities
 *
 * ### Pre-defined Patterns
 *
 * Common drum patterns ready to use:
 *
 * ```typescript
 * import { RHYTHM_PATTERNS, patternToSteps } from '@soundblue/audio-engine/theory';
 *
 * // Get a pattern as boolean array
 * const kick = patternToSteps('fourOnFloor', 16);   // Kick on every beat
 * const snare = patternToSteps('backbeat', 16);     // Snare on 2 and 4
 * const hiHat = patternToSteps('hiHatEighths', 16); // Hi-hat on 8th notes
 * const clave = patternToSteps('clave32', 16);      // 3-2 son clave
 * ```
 *
 * ### Euclidean Rhythms
 *
 * Generate mathematically distributed rhythms:
 *
 * ```typescript
 * import { euclideanRhythm } from '@soundblue/audio-engine/theory';
 *
 * // Cuban tresillo: 3 hits across 8 steps
 * const tresillo = euclideanRhythm(3, 8);
 * // [true, false, false, true, false, false, true, false]
 * // Visual: X--X--X-
 *
 * // Cuban cinquillo: 5 hits across 8 steps
 * const cinquillo = euclideanRhythm(5, 8);
 * // Visual: X-XX-XX-
 *
 * // With rotation for different starting points
 * const rotated = euclideanRhythm(5, 16, 3);
 * ```
 *
 * ### Pattern Operations
 *
 * ```typescript
 * import {
 *   combineOr,
 *   combineAnd,
 *   combineXor,
 *   invertPattern,
 *   rotatePattern,
 *   scalePattern,
 *   calculateDensity,
 * } from '@soundblue/audio-engine/theory';
 *
 * // Combine patterns
 * const combined = combineOr(kick, snare);     // Union (either hits)
 * const accents = combineAnd(hiHat, kick);     // Intersection (both hit)
 * const offBeats = combineXor(hiHat, kick);    // XOR (one but not both)
 *
 * // Invert pattern (flip hits/rests)
 * const inverted = invertPattern(kick);
 *
 * // Rotate pattern
 * const shifted = rotatePattern(clave, 4);  // Shift by 4 steps
 *
 * // Scale pattern to different length
 * const doubled = scalePattern(pattern8, 16);
 *
 * // Calculate pattern density (0-1)
 * const density = calculateDensity(kick);  // 0.25 (4 hits in 16 steps)
 * ```
 *
 * ### Time Signatures and Note Values
 *
 * ```typescript
 * import { TIME_SIGNATURES, NOTE_VALUES } from '@soundblue/audio-engine/theory';
 *
 * // Time signatures
 * const fourFour = TIME_SIGNATURES['4/4'];  // { beats: 4, noteValue: 4 }
 * const sixEight = TIME_SIGNATURES['6/8'];  // { beats: 6, noteValue: 8 }
 *
 * // Note value divisors
 * NOTE_VALUES.quarter;     // 4 (4 quarter notes per whole)
 * NOTE_VALUES.sixteenth;   // 16 (16 sixteenth notes per whole)
 * ```
 *
 * ## Scale Utilities
 *
 * ### Note Conversion
 *
 * ```typescript
 * import {
 *   toMidiNote,
 *   getNoteName,
 *   getOctave,
 *   getNoteIndex,
 *   midiToFrequency,
 *   frequencyToMidi,
 * } from '@soundblue/audio-engine/theory';
 *
 * // Note name + octave to MIDI
 * const middleC = toMidiNote('C', 4);  // 60
 * const a4 = toMidiNote('A', 4);       // 69
 *
 * // MIDI to note name and octave
 * getNoteName(60);   // 'C'
 * getOctave(60);     // 4
 *
 * // Frequency conversion
 * midiToFrequency(69);    // 440 Hz (A4)
 * midiToFrequency(60);    // 261.63 Hz (C4)
 * frequencyToMidi(440);   // 69
 * ```
 *
 * ### Scale Operations
 *
 * ```typescript
 * import {
 *   SCALE_INTERVALS,
 *   getScaleNotes,
 *   getScaleNotesMultiOctave,
 *   isNoteInScale,
 *   quantizeToScale,
 *   getRelativeMinor,
 *   getRelativeMajor,
 * } from '@soundblue/audio-engine/theory';
 *
 * // Available scales
 * SCALE_INTERVALS.major;          // [0, 2, 4, 5, 7, 9, 11]
 * SCALE_INTERVALS.minor;          // [0, 2, 3, 5, 7, 8, 10]
 * SCALE_INTERVALS.pentatonicMajor;// [0, 2, 4, 7, 9]
 * SCALE_INTERVALS.blues;          // [0, 3, 5, 6, 7, 10]
 *
 * // Get MIDI notes in a scale
 * const cMajor = getScaleNotes('C', 'major', 4);
 * // [60, 62, 64, 65, 67, 69, 71]
 *
 * // Multi-octave scale
 * const cMajor2Oct = getScaleNotesMultiOctave('C', 'major', 4, 2);
 * // [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83]
 *
 * // Check if note is in scale
 * isNoteInScale(62, 'C', 'major');  // true (D is in C major)
 * isNoteInScale(61, 'C', 'major');  // false (C# is not)
 *
 * // Quantize to nearest scale note
 * quantizeToScale(61, 'C', 'major');  // 62 (snaps C# to D)
 *
 * // Relative keys
 * getRelativeMinor('C');  // 'A'
 * getRelativeMajor('A');  // 'C'
 * ```
 *
 * ### Transposition
 *
 * ```typescript
 * import { transpose, toMidiNote } from '@soundblue/audio-engine/theory';
 *
 * const c4 = toMidiNote('C', 4);  // 60
 *
 * // Transpose up a perfect fifth
 * const g4 = transpose(c4, 7);    // 67
 *
 * // Transpose down an octave
 * const c3 = transpose(c4, -12);  // 48
 * ```
 *
 * ## Common Use Cases
 *
 * ### Creating a Chord Progression
 *
 * ```typescript
 * import { toMidiNote, getScaleNotes } from '@soundblue/audio-engine/theory';
 *
 * function getTriad(root: NoteName, scale: ScaleName, degree: number): number[] {
 *   const scaleNotes = getScaleNotesMultiOctave(root, scale, 4, 2);
 *   return [
 *     scaleNotes[degree],      // Root
 *     scaleNotes[degree + 2],  // Third
 *     scaleNotes[degree + 4],  // Fifth
 *   ];
 * }
 *
 * const I = getTriad('C', 'major', 0);   // C major: [60, 64, 67]
 * const IV = getTriad('C', 'major', 3);  // F major: [65, 69, 72]
 * const V = getTriad('C', 'major', 4);   // G major: [67, 71, 74]
 * ```
 *
 * ### Building a Drum Pattern
 *
 * ```typescript
 * import {
 *   euclideanRhythm,
 *   patternToSteps,
 *   combineOr,
 * } from '@soundblue/audio-engine/theory';
 *
 * // Layer patterns for a complete drum beat
 * const kick = patternToSteps('fourOnFloor', 16);
 * const snare = patternToSteps('backbeat', 16);
 * const hiHat = euclideanRhythm(7, 16);  // Interesting hi-hat pattern
 *
 * // Combine for visualization
 * const fullBeat = combineOr(combineOr(kick, snare), hiHat);
 * ```
 *
 * @see {@link RHYTHM_PATTERNS} - Pre-defined rhythm patterns
 * @see {@link SCALE_INTERVALS} - Scale interval definitions
 * @see {@link NOTE_NAMES} - Chromatic note names
 */

// ========================================
// @soundblue/audio-engine - Theory
// Public API
// ========================================

export {
  calculateDensity,
  combineAnd,
  combineOr,
  combineXor,
  euclideanRhythm,
  invertPattern,
  NOTE_VALUES,
  type NoteValue,
  patternToSteps,
  RHYTHM_PATTERNS,
  type RhythmPatternName,
  rotatePattern,
  scalePattern,
  stepsToPattern,
  TIME_SIGNATURES,
  type TimeSignature,
} from './rhythm';
export {
  frequencyToMidi,
  getNoteIndex,
  getNoteName,
  getOctave,
  getRelativeMajor,
  getRelativeMinor,
  getScaleNotes,
  getScaleNotesMultiOctave,
  isNoteInScale,
  midiToFrequency,
  NOTE_NAMES,
  type NoteName,
  quantizeToScale,
  SCALE_INTERVALS,
  type ScaleName,
  toMidiNote,
  transpose,
} from './scale';
