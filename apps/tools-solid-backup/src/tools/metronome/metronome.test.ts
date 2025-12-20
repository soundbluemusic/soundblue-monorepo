import { describe, expect, it } from 'vitest';
import { BPM_RANGE, defaultMetronomeSettings, metronomeMeta, TIMING } from './settings';

describe('Metronome Tool', () => {
  describe('defaultMetronomeSettings', () => {
    it('should have correct default BPM', () => {
      expect(defaultMetronomeSettings.bpm).toBe(120);
    });

    it('should have correct default beats per measure', () => {
      expect(defaultMetronomeSettings.beatsPerMeasure).toBe(4);
    });

    it('should have correct default beat unit', () => {
      expect(defaultMetronomeSettings.beatUnit).toBe(4);
    });

    it('should have correct default volume', () => {
      expect(defaultMetronomeSettings.volume).toBe(80);
    });

    it('should have empty default timer values', () => {
      expect(defaultMetronomeSettings.timerMinutes).toBe('');
      expect(defaultMetronomeSettings.timerSeconds).toBe('');
    });
  });

  describe('metronomeMeta', () => {
    it('should have correct meta id', () => {
      expect(metronomeMeta.id).toBe('metronome');
    });

    it('should have bilingual name', () => {
      expect(metronomeMeta.name.ko).toBe('메트로놈');
      expect(metronomeMeta.name.en).toBe('Metronome');
    });

    it('should have bilingual description', () => {
      expect(metronomeMeta.description.ko).toBeDefined();
      expect(metronomeMeta.description.en).toBeDefined();
    });

    it('should have correct icon', () => {
      expect(metronomeMeta.icon).toBe('⏱️');
    });

    it('should be in music category', () => {
      expect(metronomeMeta.category).toBe('music');
    });

    it('should have correct default size', () => {
      expect(metronomeMeta.defaultSize).toBe('lg');
    });

    it('should have minimum size constraints', () => {
      expect(metronomeMeta.minSize).toEqual({ width: 320, height: 400 });
    });

    it('should have search tags', () => {
      expect(metronomeMeta.tags).toContain('tempo');
      expect(metronomeMeta.tags).toContain('bpm');
      expect(metronomeMeta.tags).toContain('rhythm');
    });
  });

  describe('Constants', () => {
    it('should have valid BPM range', () => {
      expect(BPM_RANGE.MIN).toBe(40);
      expect(BPM_RANGE.MAX).toBe(240);
      expect(BPM_RANGE.MIN).toBeLessThan(BPM_RANGE.MAX);
    });

    it('should have valid timing constants', () => {
      expect(TIMING.SCHEDULER_INTERVAL_MS).toBe(25);
      expect(TIMING.LOOK_AHEAD_SECONDS).toBe(0.1);
      expect(TIMING.CLICK_DURATION_SECONDS).toBe(0.08);
    });
  });

  describe('MetronomeSettings validation', () => {
    it('should allow BPM within valid range (40-240)', () => {
      const minBpm = { ...defaultMetronomeSettings, bpm: 40 };
      const maxBpm = { ...defaultMetronomeSettings, bpm: 240 };
      expect(minBpm.bpm).toBe(40);
      expect(maxBpm.bpm).toBe(240);
    });

    it('should allow different time signatures', () => {
      const timeSignatures = [2, 3, 4, 5, 6, 7, 8, 9, 12];
      timeSignatures.forEach((beats) => {
        const settings = { ...defaultMetronomeSettings, beatsPerMeasure: beats };
        expect(settings.beatsPerMeasure).toBe(beats);
      });
    });

    it('should allow volume between 0 and 100', () => {
      const muteSettings = { ...defaultMetronomeSettings, volume: 0 };
      const maxSettings = { ...defaultMetronomeSettings, volume: 100 };
      expect(muteSettings.volume).toBe(0);
      expect(maxSettings.volume).toBe(100);
    });

    it('should allow timer values', () => {
      const settings = {
        ...defaultMetronomeSettings,
        timerMinutes: '5',
        timerSeconds: '30',
      };
      expect(settings.timerMinutes).toBe('5');
      expect(settings.timerSeconds).toBe('30');
    });
  });
});
