/**
 * @soundblue/audio-engine - Scale Tests
 * Tests for music scale utilities
 */
import { describe, expect, it } from 'vitest';
import {
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
  quantizeToScale,
  SCALE_INTERVALS,
  toMidiNote,
  transpose,
} from '../src/theory/scale';

describe('@soundblue/audio-engine scale', () => {
  describe('NOTE_NAMES', () => {
    it('should have 12 notes', () => {
      expect(NOTE_NAMES.length).toBe(12);
    });

    it('should start with C', () => {
      expect(NOTE_NAMES[0]).toBe('C');
    });
  });

  describe('SCALE_INTERVALS', () => {
    it('should have major scale with 7 notes', () => {
      expect(SCALE_INTERVALS.major.length).toBe(7);
      expect(SCALE_INTERVALS.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('should have chromatic scale with 12 notes', () => {
      expect(SCALE_INTERVALS.chromatic.length).toBe(12);
    });

    it('should have pentatonic scales with 5 notes', () => {
      expect(SCALE_INTERVALS.pentatonicMajor.length).toBe(5);
      expect(SCALE_INTERVALS.pentatonicMinor.length).toBe(5);
    });
  });

  describe('getNoteIndex', () => {
    it('should return correct index for notes', () => {
      expect(getNoteIndex('C')).toBe(0);
      expect(getNoteIndex('C#')).toBe(1);
      expect(getNoteIndex('D')).toBe(2);
      expect(getNoteIndex('A')).toBe(9);
      expect(getNoteIndex('B')).toBe(11);
    });
  });

  describe('getNoteName', () => {
    it('should return note name from MIDI number', () => {
      expect(getNoteName(60)).toBe('C'); // Middle C
      expect(getNoteName(61)).toBe('C#');
      expect(getNoteName(69)).toBe('A'); // A4
      expect(getNoteName(72)).toBe('C'); // C5
    });
  });

  describe('getOctave', () => {
    it('should return octave from MIDI number', () => {
      expect(getOctave(60)).toBe(4); // Middle C = C4
      expect(getOctave(48)).toBe(3); // C3
      expect(getOctave(72)).toBe(5); // C5
      expect(getOctave(21)).toBe(0); // A0 (lowest piano note)
    });
  });

  describe('toMidiNote', () => {
    it('should convert note and octave to MIDI', () => {
      expect(toMidiNote('C', 4)).toBe(60); // Middle C
      expect(toMidiNote('A', 4)).toBe(69); // A4 = 440Hz
      expect(toMidiNote('C', 5)).toBe(72);
      expect(toMidiNote('A', 0)).toBe(21);
    });
  });

  describe('getScaleNotes', () => {
    it('should return C major scale', () => {
      const notes = getScaleNotes('C', 'major', 4);
      expect(notes).toEqual([60, 62, 64, 65, 67, 69, 71]); // C D E F G A B
    });

    it('should return A minor scale', () => {
      const notes = getScaleNotes('A', 'minor', 4);
      expect(notes).toEqual([69, 71, 72, 74, 76, 77, 79]); // A B C D E F G
    });

    it('should return C pentatonic major', () => {
      const notes = getScaleNotes('C', 'pentatonicMajor', 4);
      expect(notes).toEqual([60, 62, 64, 67, 69]); // C D E G A
    });
  });

  describe('getScaleNotesMultiOctave', () => {
    it('should span multiple octaves', () => {
      const notes = getScaleNotesMultiOctave('C', 'major', 4, 2);
      expect(notes.length).toBe(14); // 7 notes × 2 octaves
      expect(notes[0]).toBe(60); // C4
      expect(notes[7]).toBe(72); // C5
    });
  });

  describe('isNoteInScale', () => {
    it('should return true for notes in C major', () => {
      expect(isNoteInScale(60, 'C', 'major')).toBe(true); // C
      expect(isNoteInScale(62, 'C', 'major')).toBe(true); // D
      expect(isNoteInScale(64, 'C', 'major')).toBe(true); // E
    });

    it('should return false for notes not in C major', () => {
      expect(isNoteInScale(61, 'C', 'major')).toBe(false); // C#
      expect(isNoteInScale(63, 'C', 'major')).toBe(false); // D#
      expect(isNoteInScale(66, 'C', 'major')).toBe(false); // F#
    });

    it('should work across octaves', () => {
      expect(isNoteInScale(72, 'C', 'major')).toBe(true); // C5
      expect(isNoteInScale(73, 'C', 'major')).toBe(false); // C#5
    });
  });

  describe('transpose', () => {
    it('should transpose notes', () => {
      expect(transpose(60, 12)).toBe(72); // Up one octave
      expect(transpose(60, -12)).toBe(48); // Down one octave
      expect(transpose(60, 7)).toBe(67); // Up a fifth
    });
  });

  describe('getRelativeMinor', () => {
    it('should return relative minor', () => {
      expect(getRelativeMinor('C')).toBe('A');
      expect(getRelativeMinor('G')).toBe('E');
      expect(getRelativeMinor('F')).toBe('D');
    });
  });

  describe('getRelativeMajor', () => {
    it('should return relative major', () => {
      expect(getRelativeMajor('A')).toBe('C');
      expect(getRelativeMajor('E')).toBe('G');
      expect(getRelativeMajor('D')).toBe('F');
    });
  });

  describe('midiToFrequency', () => {
    it('should convert MIDI to frequency', () => {
      expect(midiToFrequency(69)).toBe(440); // A4
      expect(midiToFrequency(81)).toBe(880); // A5
      expect(midiToFrequency(57)).toBe(220); // A3
    });

    it('should handle custom A4 frequency', () => {
      expect(midiToFrequency(69, 432)).toBe(432);
    });
  });

  describe('frequencyToMidi', () => {
    it('should convert frequency to MIDI', () => {
      expect(frequencyToMidi(440)).toBe(69); // A4
      expect(frequencyToMidi(880)).toBe(81); // A5
      expect(frequencyToMidi(220)).toBe(57); // A3
    });

    it('should round to nearest MIDI note', () => {
      expect(frequencyToMidi(442)).toBe(69); // Still A4
    });
  });

  describe('quantizeToScale', () => {
    it('should return same note if already in scale', () => {
      expect(quantizeToScale(60, 'C', 'major')).toBe(60); // C
      expect(quantizeToScale(62, 'C', 'major')).toBe(62); // D
    });

    it('should quantize to nearest scale note', () => {
      // C# should quantize to C or D in C major
      const result = quantizeToScale(61, 'C', 'major');
      expect([60, 62]).toContain(result);
    });
  });
});
