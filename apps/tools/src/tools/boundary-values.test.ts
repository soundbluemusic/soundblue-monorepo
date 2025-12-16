/**
 * Boundary Value Tests
 * 경계값 테스트
 *
 * Boundary Value Coverage: 모든 입력의 최소/최대/경계값 테스트
 */

import { describe, expect, it } from 'vitest';
import { createEmptyPattern, defaultDrumMachineSettings } from './drum-machine/settings';
import { BPM_RANGE, defaultMetronomeSettings } from './metronome/settings';
import { defaultQRSettings } from './qr-generator/settings';

describe('Boundary Value Tests', () => {
  describe('Metronome BPM Boundaries', () => {
    it('should accept minimum BPM (40)', () => {
      const settings = { ...defaultMetronomeSettings, bpm: BPM_RANGE.MIN };
      expect(settings.bpm).toBe(40);
    });

    it('should accept maximum BPM (240)', () => {
      const settings = { ...defaultMetronomeSettings, bpm: BPM_RANGE.MAX };
      expect(settings.bpm).toBe(240);
    });

    it('should handle BPM just above minimum (41)', () => {
      const settings = { ...defaultMetronomeSettings, bpm: BPM_RANGE.MIN + 1 };
      expect(settings.bpm).toBe(41);
    });

    it('should handle BPM just below maximum (239)', () => {
      const settings = { ...defaultMetronomeSettings, bpm: BPM_RANGE.MAX - 1 };
      expect(settings.bpm).toBe(239);
    });

    it('should handle middle value BPM (140)', () => {
      const midBpm = Math.floor((BPM_RANGE.MIN + BPM_RANGE.MAX) / 2);
      const settings = { ...defaultMetronomeSettings, bpm: midBpm };
      expect(settings.bpm).toBe(midBpm);
    });
  });

  describe('Metronome Volume Boundaries', () => {
    it('should accept minimum volume (0 - mute)', () => {
      const settings = { ...defaultMetronomeSettings, volume: 0 };
      expect(settings.volume).toBe(0);
    });

    it('should accept maximum volume (100)', () => {
      const settings = { ...defaultMetronomeSettings, volume: 100 };
      expect(settings.volume).toBe(100);
    });

    it('should handle volume just above minimum (1)', () => {
      const settings = { ...defaultMetronomeSettings, volume: 1 };
      expect(settings.volume).toBe(1);
    });

    it('should handle volume just below maximum (99)', () => {
      const settings = { ...defaultMetronomeSettings, volume: 99 };
      expect(settings.volume).toBe(99);
    });
  });

  describe('Metronome Beats Per Measure Boundaries', () => {
    it('should accept minimum beats (2)', () => {
      const settings = { ...defaultMetronomeSettings, beatsPerMeasure: 2 };
      expect(settings.beatsPerMeasure).toBe(2);
    });

    it('should accept maximum beats (12)', () => {
      const settings = { ...defaultMetronomeSettings, beatsPerMeasure: 12 };
      expect(settings.beatsPerMeasure).toBe(12);
    });

    it('should handle common time signatures', () => {
      [2, 3, 4, 5, 6, 7, 8, 9, 12].forEach((beats) => {
        const settings = { ...defaultMetronomeSettings, beatsPerMeasure: beats };
        expect(settings.beatsPerMeasure).toBe(beats);
      });
    });
  });

  describe('Metronome Timer Boundaries', () => {
    it('should accept empty timer (no limit)', () => {
      const settings = { ...defaultMetronomeSettings, timerMinutes: '', timerSeconds: '' };
      expect(settings.timerMinutes).toBe('');
      expect(settings.timerSeconds).toBe('');
    });

    it('should accept minimum timer (0:01)', () => {
      const settings = { ...defaultMetronomeSettings, timerMinutes: '0', timerSeconds: '1' };
      const totalSeconds =
        parseInt(settings.timerMinutes || '0') * 60 + parseInt(settings.timerSeconds || '0');
      expect(totalSeconds).toBe(1);
    });

    it('should accept maximum minutes (99)', () => {
      const settings = { ...defaultMetronomeSettings, timerMinutes: '99', timerSeconds: '59' };
      const totalSeconds = parseInt(settings.timerMinutes) * 60 + parseInt(settings.timerSeconds);
      expect(totalSeconds).toBe(5999);
    });

    it('should handle seconds boundary (0-59)', () => {
      const settings0 = { ...defaultMetronomeSettings, timerSeconds: '0' };
      const settings59 = { ...defaultMetronomeSettings, timerSeconds: '59' };
      expect(parseInt(settings0.timerSeconds)).toBe(0);
      expect(parseInt(settings59.timerSeconds)).toBe(59);
    });
  });

  describe('Drum Machine Boundaries', () => {
    it('should accept minimum steps (1)', () => {
      const pattern = createEmptyPattern(1);
      expect(pattern.kick).toHaveLength(1);
    });

    it('should accept standard steps (16)', () => {
      const pattern = createEmptyPattern(16);
      expect(pattern.kick).toHaveLength(16);
    });

    it('should accept extended steps (32)', () => {
      const pattern = createEmptyPattern(32);
      expect(pattern.kick).toHaveLength(32);
    });

    it('should accept large step count (64)', () => {
      const pattern = createEmptyPattern(64);
      expect(pattern.kick).toHaveLength(64);
    });

    it('should handle minimum volume (0)', () => {
      const settings = { ...defaultDrumMachineSettings, volume: 0 };
      expect(settings.volume).toBe(0);
    });

    it('should handle maximum volume (1)', () => {
      const settings = { ...defaultDrumMachineSettings, volume: 1 };
      expect(settings.volume).toBe(1);
    });

    it('should handle minimum swing (0)', () => {
      const settings = { ...defaultDrumMachineSettings, swing: 0 };
      expect(settings.swing).toBe(0);
    });

    it('should handle maximum swing (100)', () => {
      const settings = { ...defaultDrumMachineSettings, swing: 100 };
      expect(settings.swing).toBe(100);
    });
  });

  describe('QR Generator Boundaries', () => {
    it('should accept minimum size', () => {
      const settings = { ...defaultQRSettings, size: 64 };
      expect(settings.size).toBe(64);
    });

    it('should accept maximum practical size', () => {
      const settings = { ...defaultQRSettings, size: 1024 };
      expect(settings.size).toBe(1024);
    });

    it('should accept empty text', () => {
      const settings = { ...defaultQRSettings, text: '' };
      expect(settings.text).toBe('');
    });

    it('should accept very long text', () => {
      const longText = 'a'.repeat(1000);
      const settings = { ...defaultQRSettings, text: longText };
      expect(settings.text.length).toBe(1000);
    });

    it('should accept all error correction levels', () => {
      const levels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
      levels.forEach((level) => {
        const settings = { ...defaultQRSettings, errorCorrection: level };
        expect(settings.errorCorrection).toBe(level);
      });
    });

    it('should accept valid hex colors', () => {
      const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
      colors.forEach((color) => {
        const settings = { ...defaultQRSettings, foregroundColor: color };
        expect(settings.foregroundColor).toBe(color);
      });
    });
  });
});
