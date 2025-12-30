// ========================================
// @soundblue/audio-engine - Scale
// Music scale definitions and utilities
// Pure computation - no browser APIs
// ========================================

/**
 * Note names
 */
export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;
export type NoteName = (typeof NOTE_NAMES)[number];

/**
 * Scale intervals (semitones from root)
 */
export const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  wholeWholeTone: [0, 2, 4, 6, 8, 10],
} as const;

export type ScaleName = keyof typeof SCALE_INTERVALS;

/**
 * Get note index (0-11) from note name
 */
export function getNoteIndex(note: NoteName): number {
  return NOTE_NAMES.indexOf(note);
}

/**
 * Get note name from MIDI note number
 */
export function getNoteName(midiNote: number): NoteName {
  return NOTE_NAMES[midiNote % 12];
}

/**
 * Get octave from MIDI note number
 */
export function getOctave(midiNote: number): number {
  return Math.floor(midiNote / 12) - 1;
}

/**
 * Convert note name and octave to MIDI note number
 */
export function toMidiNote(note: NoteName, octave: number): number {
  return (octave + 1) * 12 + getNoteIndex(note);
}

/**
 * Get all notes in a scale
 * @param root - Root note
 * @param scaleName - Scale name
 * @param octave - Starting octave
 */
export function getScaleNotes(root: NoteName, scaleName: ScaleName, octave = 4): number[] {
  const intervals = SCALE_INTERVALS[scaleName];
  const rootMidi = toMidiNote(root, octave);

  return intervals.map((interval) => rootMidi + interval);
}

/**
 * Get all notes in a scale across multiple octaves
 */
export function getScaleNotesMultiOctave(
  root: NoteName,
  scaleName: ScaleName,
  startOctave: number,
  octaveCount: number,
): number[] {
  const notes: number[] = [];

  for (let oct = 0; oct < octaveCount; oct++) {
    notes.push(...getScaleNotes(root, scaleName, startOctave + oct));
  }

  return notes;
}

/**
 * Check if a MIDI note is in a given scale
 */
export function isNoteInScale(midiNote: number, root: NoteName, scaleName: ScaleName): boolean {
  const intervals = SCALE_INTERVALS[scaleName] as readonly number[];
  const rootIndex = getNoteIndex(root);
  const noteIndex = midiNote % 12;
  const intervalFromRoot = (noteIndex - rootIndex + 12) % 12;

  return intervals.includes(intervalFromRoot);
}

/**
 * Transpose a note by semitones
 */
export function transpose(midiNote: number, semitones: number): number {
  return midiNote + semitones;
}

/**
 * Get the relative minor of a major key
 */
export function getRelativeMinor(majorRoot: NoteName): NoteName {
  const rootIndex = getNoteIndex(majorRoot);
  const minorIndex = (rootIndex + 9) % 12; // Down 3 semitones = up 9
  return NOTE_NAMES[minorIndex];
}

/**
 * Get the relative major of a minor key
 */
export function getRelativeMajor(minorRoot: NoteName): NoteName {
  const rootIndex = getNoteIndex(minorRoot);
  const majorIndex = (rootIndex + 3) % 12; // Up 3 semitones
  return NOTE_NAMES[majorIndex];
}

/**
 * Get frequency from MIDI note number (A4 = 440Hz)
 */
export function midiToFrequency(midiNote: number, a4Frequency = 440): number {
  return a4Frequency * 2 ** ((midiNote - 69) / 12);
}

/**
 * Get MIDI note from frequency
 */
export function frequencyToMidi(frequency: number, a4Frequency = 440): number {
  return Math.round(12 * Math.log2(frequency / a4Frequency) + 69);
}

/**
 * Quantize a MIDI note to the nearest note in a scale
 */
export function quantizeToScale(midiNote: number, root: NoteName, scaleName: ScaleName): number {
  if (isNoteInScale(midiNote, root, scaleName)) {
    return midiNote;
  }

  const intervals = SCALE_INTERVALS[scaleName] as readonly number[];
  const rootIndex = getNoteIndex(root);
  const noteIndex = midiNote % 12;
  const intervalFromRoot = (noteIndex - rootIndex + 12) % 12;

  // Find nearest interval in scale
  let nearestInterval: number = intervals[0];
  let minDistance = Math.abs(intervalFromRoot - intervals[0]);

  for (const interval of intervals) {
    // Check distance in both directions (wrapping around)
    const distance = Math.min(
      Math.abs(intervalFromRoot - interval),
      12 - Math.abs(intervalFromRoot - interval),
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestInterval = interval;
    }
  }

  const octave = Math.floor(midiNote / 12);
  return octave * 12 + ((rootIndex + nearestInterval) % 12);
}
