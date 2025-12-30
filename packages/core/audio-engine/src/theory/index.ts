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
