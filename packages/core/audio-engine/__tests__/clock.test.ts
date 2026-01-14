/**
 * @soundblue/audio-engine - Clock Tests
 * Tests for BPM and timing calculations
 */
import { describe, expect, it } from 'vitest';
import {
  bpmToMs,
  bpmToSeconds,
  getBarPosition,
  getBeatAtTime,
  getBeatTime,
  getNoteDuration,
  getSwingOffset,
  getTotalBeats,
  msToBpm,
  samplesPerBeat,
} from '../src/timing/clock';

describe('@soundblue/audio-engine clock', () => {
  describe('bpmToMs', () => {
    it('should convert BPM to milliseconds', () => {
      expect(bpmToMs(120)).toBe(500); // 60/120 * 1000 = 500ms
      expect(bpmToMs(60)).toBe(1000); // 60/60 * 1000 = 1000ms
      expect(bpmToMs(240)).toBe(250); // 60/240 * 1000 = 250ms
    });

    it('should throw error for non-positive BPM', () => {
      expect(() => bpmToMs(0)).toThrow('BPM must be positive');
      expect(() => bpmToMs(-120)).toThrow('BPM must be positive');
    });
  });

  describe('bpmToSeconds', () => {
    it('should convert BPM to seconds', () => {
      expect(bpmToSeconds(120)).toBe(0.5);
      expect(bpmToSeconds(60)).toBe(1);
      expect(bpmToSeconds(240)).toBe(0.25);
    });

    it('should throw error for non-positive BPM', () => {
      expect(() => bpmToSeconds(0)).toThrow('BPM must be positive');
    });
  });

  describe('msToBpm', () => {
    it('should convert milliseconds to BPM', () => {
      expect(msToBpm(500)).toBe(120);
      expect(msToBpm(1000)).toBe(60);
      expect(msToBpm(250)).toBe(240);
    });

    it('should throw error for non-positive interval', () => {
      expect(() => msToBpm(0)).toThrow('Interval must be positive');
      expect(() => msToBpm(-500)).toThrow('Interval must be positive');
    });
  });

  describe('getNoteDuration', () => {
    it('should calculate note durations at 120 BPM', () => {
      // Quarter note at 120 BPM = 500ms
      expect(getNoteDuration(120, 4)).toBe(500);
      // Half note = 1000ms
      expect(getNoteDuration(120, 2)).toBe(1000);
      // Eighth note = 250ms
      expect(getNoteDuration(120, 8)).toBe(250);
      // Sixteenth note = 125ms
      expect(getNoteDuration(120, 16)).toBe(125);
      // Whole note = 2000ms
      expect(getNoteDuration(120, 1)).toBe(2000);
    });
  });

  describe('samplesPerBeat', () => {
    it('should calculate samples per beat', () => {
      // At 120 BPM with 44100 Hz sample rate
      // 44100 * 60 / 120 = 22050 samples
      expect(samplesPerBeat(120, 44100)).toBe(22050);
      expect(samplesPerBeat(60, 44100)).toBe(44100);
    });
  });

  describe('getBeatTime', () => {
    it('should calculate beat time', () => {
      expect(getBeatTime(0, 120)).toBe(0);
      expect(getBeatTime(1, 120)).toBe(0.5);
      expect(getBeatTime(2, 120)).toBe(1);
      expect(getBeatTime(4, 120)).toBe(2);
    });

    it('should respect start time offset', () => {
      expect(getBeatTime(0, 120, 1)).toBe(1);
      expect(getBeatTime(1, 120, 1)).toBe(1.5);
    });
  });

  describe('getBeatAtTime', () => {
    it('should calculate beat at given time', () => {
      expect(getBeatAtTime(0, 120)).toBe(0);
      expect(getBeatAtTime(0.5, 120)).toBe(1);
      expect(getBeatAtTime(0.9, 120)).toBe(1);
      expect(getBeatAtTime(1, 120)).toBe(2);
    });

    it('should return -1 for time before start', () => {
      expect(getBeatAtTime(0.5, 120, 1)).toBe(-1);
    });

    it('should respect start time offset', () => {
      expect(getBeatAtTime(1, 120, 1)).toBe(0);
      expect(getBeatAtTime(1.5, 120, 1)).toBe(1);
    });
  });

  describe('getBarPosition', () => {
    it('should calculate bar and beat position', () => {
      expect(getBarPosition(0, 4)).toEqual({ bar: 0, beatInBar: 0 });
      expect(getBarPosition(3, 4)).toEqual({ bar: 0, beatInBar: 3 });
      expect(getBarPosition(4, 4)).toEqual({ bar: 1, beatInBar: 0 });
      expect(getBarPosition(7, 4)).toEqual({ bar: 1, beatInBar: 3 });
      expect(getBarPosition(8, 4)).toEqual({ bar: 2, beatInBar: 0 });
    });

    it('should handle different time signatures', () => {
      expect(getBarPosition(6, 3)).toEqual({ bar: 2, beatInBar: 0 });
      expect(getBarPosition(7, 3)).toEqual({ bar: 2, beatInBar: 1 });
    });
  });

  describe('getTotalBeats', () => {
    it('should calculate total beats from bar position', () => {
      expect(getTotalBeats(0, 0, 4)).toBe(0);
      expect(getTotalBeats(0, 3, 4)).toBe(3);
      expect(getTotalBeats(1, 0, 4)).toBe(4);
      expect(getTotalBeats(2, 2, 4)).toBe(10);
    });
  });

  describe('getSwingOffset', () => {
    it('should return 0 for on-beats', () => {
      expect(getSwingOffset(0, 0.5, 120)).toBe(0);
      expect(getSwingOffset(2, 0.5, 120)).toBe(0);
      expect(getSwingOffset(4, 0.5, 120)).toBe(0);
    });

    it('should return 0 when swing is 0', () => {
      expect(getSwingOffset(1, 0, 120)).toBe(0);
      expect(getSwingOffset(3, 0, 120)).toBe(0);
    });

    it('should return offset for off-beats with swing', () => {
      // Eighth note at 120 BPM = 250ms
      // Full swing (1.0) delays by 1/3 = 83.33ms
      expect(getSwingOffset(1, 1, 120)).toBeCloseTo(83.33, 1);
      // Half swing (0.5) = 41.67ms
      expect(getSwingOffset(1, 0.5, 120)).toBeCloseTo(41.67, 1);
    });
  });
});
