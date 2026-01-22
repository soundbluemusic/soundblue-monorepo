/**
 * @fileoverview Music Theory Utilities using Tonal
 *
 * Provides chord, scale, interval, and key analysis functions.
 */

import { Chord, ChordType, Interval, Key, Note, Progression, RomanNumeral, Scale } from 'tonal';

export interface ChordInfo {
  name: string;
  symbol: string;
  notes: string[];
  intervals: string[];
  quality: string;
  type: string;
}

export interface ScaleInfo {
  name: string;
  notes: string[];
  intervals: string[];
  chords: string[];
  type: string;
}

export interface KeyInfo {
  tonic: string;
  type: 'major' | 'minor';
  scale: string[];
  chords: string[];
  chordsHarmonicFunction: string[];
}

export const MusicTheory = {
  getChordInfo(chordName: string): ChordInfo | null {
    const chord = Chord.get(chordName);
    if (chord.empty) return null;

    return {
      name: chord.name,
      symbol: chord.symbol,
      notes: chord.notes,
      intervals: chord.intervals,
      quality: chord.quality,
      type: chord.type,
    };
  },

  getChordNotes(chordName: string): string[] {
    return Chord.get(chordName).notes;
  },

  detectChord(notes: string[]): string[] {
    return Chord.detect(notes);
  },

  getScaleInfo(scaleName: string): ScaleInfo | null {
    const scale = Scale.get(scaleName);
    if (scale.empty) return null;

    return {
      name: scale.name,
      notes: scale.notes,
      intervals: scale.intervals,
      chords: Scale.scaleChords(scale.name),
      type: scale.type,
    };
  },

  getScaleNotes(scaleName: string): string[] {
    return Scale.get(scaleName).notes;
  },

  getAllScaleNames(): string[] {
    return Scale.names();
  },

  getAllChordTypes(): string[] {
    return ChordType.names();
  },

  getKeyInfo(keyName: string): KeyInfo | null {
    const key = Key.majorKey(keyName);
    if (!key.tonic) {
      const minorKey = Key.minorKey(keyName);
      if (!minorKey.tonic) return null;

      return {
        tonic: minorKey.tonic,
        type: 'minor',
        scale: [...minorKey.natural.scale],
        chords: [...minorKey.natural.chords],
        chordsHarmonicFunction: [...minorKey.natural.chordsHarmonicFunction],
      };
    }

    return {
      tonic: key.tonic,
      type: 'major',
      scale: [...key.scale],
      chords: [...key.chords],
      chordsHarmonicFunction: [...key.chordsHarmonicFunction],
    };
  },

  getRelativeKeys(keyName: string): { major: string; minor: string } | null {
    const key = Key.majorKey(keyName);
    if (!key.tonic) return null;

    const relativeTonic = Note.transpose(key.tonic, '6m');
    return {
      major: key.tonic,
      minor: relativeTonic,
    };
  },

  transposeNote(note: string, interval: string): string {
    return Note.transpose(note, interval);
  },

  transposeChord(chordName: string, interval: string): string {
    const chord = Chord.get(chordName);
    if (chord.empty || !chord.tonic) return chordName;

    const newRoot = Note.transpose(chord.tonic, interval);
    return `${newRoot}${chord.aliases[0] || chord.type}`;
  },

  getInterval(note1: string, note2: string): string {
    return Interval.distance(note1, note2);
  },

  getIntervalSemitones(interval: string): number {
    const info = Interval.get(interval);
    return info.semitones ?? 0;
  },

  getNoteFromMidi(midi: number): string {
    return Note.fromMidi(midi);
  },

  getMidiFromNote(note: string): number | null {
    return Note.midi(note);
  },

  getFrequencyFromNote(note: string): number | null {
    return Note.freq(note);
  },

  getNoteFromFrequency(frequency: number): string {
    return Note.fromFreq(frequency);
  },

  generateProgression(keyName: string, numerals: string[]): string[] {
    return Progression.fromRomanNumerals(keyName, numerals);
  },

  romanNumeralToChord(keyName: string, numeral: string): string {
    const rn = RomanNumeral.get(numeral);
    if (rn.empty) return numeral;

    const key = Key.majorKey(keyName);
    if (!key.tonic) return numeral;

    const root = Note.transpose(key.tonic, rn.interval);
    return `${root}${rn.chordType || ''}`;
  },

  getCommonProgressions(): { name: string; numerals: string[] }[] {
    return [
      { name: 'I-IV-V-I', numerals: ['I', 'IV', 'V', 'I'] },
      { name: 'I-V-vi-IV (Pop)', numerals: ['I', 'V', 'vi', 'IV'] },
      { name: 'ii-V-I (Jazz)', numerals: ['ii', 'V', 'I'] },
      { name: 'I-vi-IV-V (50s)', numerals: ['I', 'vi', 'IV', 'V'] },
      { name: 'vi-IV-I-V (Axis)', numerals: ['vi', 'IV', 'I', 'V'] },
      { name: 'I-IV-vi-V', numerals: ['I', 'IV', 'vi', 'V'] },
      { name: 'I-V-IV-V', numerals: ['I', 'V', 'IV', 'V'] },
      { name: 'i-VI-III-VII (Minor)', numerals: ['i', 'VI', 'III', 'VII'] },
    ];
  },

  getCircleOfFifths(): string[] {
    return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
  },

  sortNotes(notes: string[]): string[] {
    const midiNotes = notes.map((n) => Note.midi(n)).filter((m): m is number => m !== null);
    midiNotes.sort((a, b) => a - b);
    return midiNotes.map((midi) => Note.fromMidi(midi));
  },

  simplifyNote(note: string): string {
    return Note.simplify(note);
  },

  enharmonicNote(note: string): string {
    return Note.enharmonic(note);
  },
};
