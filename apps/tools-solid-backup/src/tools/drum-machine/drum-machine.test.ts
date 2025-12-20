import { describe, expect, it } from 'vitest';
import {
  createEmptyPattern,
  DRUM_DEFAULTS,
  DRUM_SOUNDS,
  defaultDrumMachineSettings,
  drumMachineMeta,
} from './settings';

describe('Drum Machine Tool', () => {
  describe('defaultDrumMachineSettings', () => {
    it('should have correct default BPM', () => {
      expect(defaultDrumMachineSettings.bpm).toBe(120);
    });

    it('should have 16 steps by default', () => {
      expect(defaultDrumMachineSettings.steps).toBe(16);
    });

    it('should have correct default volume', () => {
      expect(defaultDrumMachineSettings.volume).toBe(0.7);
    });

    it('should have swing disabled by default', () => {
      expect(defaultDrumMachineSettings.swing).toBe(0);
    });

    it('should have metronome disabled by default', () => {
      expect(defaultDrumMachineSettings.metronomeEnabled).toBe(false);
    });

    it('should have empty pattern for all drums', () => {
      const pattern = defaultDrumMachineSettings.pattern;
      expect(pattern.kick).toHaveLength(16);
      expect(pattern.snare).toHaveLength(16);
      expect(pattern.hihat).toHaveLength(16);
      expect(pattern.clap).toHaveLength(16);

      expect(pattern.kick.every((step) => step === false)).toBe(true);
      expect(pattern.snare.every((step) => step === false)).toBe(true);
      expect(pattern.hihat.every((step) => step === false)).toBe(true);
      expect(pattern.clap.every((step) => step === false)).toBe(true);
    });

    it('should have synth params for all drums', () => {
      const synth = defaultDrumMachineSettings.synth;
      expect(synth.kick).toBeDefined();
      expect(synth.snare).toBeDefined();
      expect(synth.hihat).toBeDefined();
      expect(synth.clap).toBeDefined();
    });

    it('should have correct kick synth defaults', () => {
      const kick = defaultDrumMachineSettings.synth.kick;
      expect(kick.pitch).toBe(60);
      expect(kick.decay).toBe(0.5);
      expect(kick.tone).toBe(30);
      expect(kick.punch).toBe(80);
    });
  });

  describe('drumMachineMeta', () => {
    it('should have correct meta id', () => {
      expect(drumMachineMeta.id).toBe('drum-machine');
    });

    it('should have bilingual name', () => {
      expect(drumMachineMeta.name.ko).toBe('드럼 머신');
      expect(drumMachineMeta.name.en).toBe('Drum Machine');
    });

    it('should have bilingual description', () => {
      expect(drumMachineMeta.description.ko).toContain('16스텝');
      expect(drumMachineMeta.description.en).toContain('16-step');
    });

    it('should have correct icon', () => {
      expect(drumMachineMeta.icon).toBe('🥁');
    });

    it('should be in music category', () => {
      expect(drumMachineMeta.category).toBe('music');
    });

    it('should have correct default size', () => {
      expect(drumMachineMeta.defaultSize).toBe('lg');
    });

    it('should have minimum size constraints', () => {
      expect(drumMachineMeta.minSize).toEqual({ width: 400, height: 300 });
    });

    it('should have search tags', () => {
      expect(drumMachineMeta.tags).toContain('drums');
      expect(drumMachineMeta.tags).toContain('beats');
      expect(drumMachineMeta.tags).toContain('sequencer');
    });
  });

  describe('DRUM_DEFAULTS', () => {
    it('should have defaults for all drum types', () => {
      expect(DRUM_DEFAULTS.kick).toBeDefined();
      expect(DRUM_DEFAULTS.snare).toBeDefined();
      expect(DRUM_DEFAULTS.hihat).toBeDefined();
      expect(DRUM_DEFAULTS.clap).toBeDefined();
    });

    it('should have valid synth params structure', () => {
      Object.values(DRUM_DEFAULTS).forEach((params) => {
        expect(typeof params.pitch).toBe('number');
        expect(typeof params.decay).toBe('number');
        expect(typeof params.tone).toBe('number');
        expect(typeof params.punch).toBe('number');
      });
    });
  });

  describe('DRUM_SOUNDS', () => {
    it('should have 4 drum sounds', () => {
      expect(DRUM_SOUNDS).toHaveLength(4);
    });

    it('should have id, name, and icon for each sound', () => {
      DRUM_SOUNDS.forEach((sound) => {
        expect(sound.id).toBeDefined();
        expect(sound.name).toBeDefined();
        expect(sound.icon).toBeDefined();
      });
    });
  });

  describe('createEmptyPattern', () => {
    it('should create pattern with specified steps', () => {
      const pattern8 = createEmptyPattern(8);
      const pattern32 = createEmptyPattern(32);

      expect(pattern8.kick).toHaveLength(8);
      expect(pattern32.kick).toHaveLength(32);
    });

    it('should create patterns for all drum types', () => {
      const pattern = createEmptyPattern(16);
      expect(pattern.kick).toBeDefined();
      expect(pattern.snare).toBeDefined();
      expect(pattern.hihat).toBeDefined();
      expect(pattern.clap).toBeDefined();
    });

    it('should initialize all steps to false', () => {
      const pattern = createEmptyPattern(16);
      Object.values(pattern).forEach((steps) => {
        expect(steps.every((step) => step === false)).toBe(true);
      });
    });
  });

  describe('DrumMachineSettings validation', () => {
    it('should allow different step counts', () => {
      const settings8 = { ...defaultDrumMachineSettings, steps: 8 };
      const settings32 = { ...defaultDrumMachineSettings, steps: 32 };
      expect(settings8.steps).toBe(8);
      expect(settings32.steps).toBe(32);
    });

    it('should allow swing values', () => {
      const noSwing = { ...defaultDrumMachineSettings, swing: 0 };
      const maxSwing = { ...defaultDrumMachineSettings, swing: 100 };
      expect(noSwing.swing).toBe(0);
      expect(maxSwing.swing).toBe(100);
    });

    it('should allow volume between 0 and 1', () => {
      const muted = { ...defaultDrumMachineSettings, volume: 0 };
      const full = { ...defaultDrumMachineSettings, volume: 1 };
      expect(muted.volume).toBe(0);
      expect(full.volume).toBe(1);
    });

    it('should allow pattern modifications', () => {
      const settings = {
        ...defaultDrumMachineSettings,
        pattern: {
          ...defaultDrumMachineSettings.pattern,
          kick: [
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
          ],
        },
      };
      expect(settings.pattern.kick[0]).toBe(true);
      expect(settings.pattern.kick[4]).toBe(true);
    });
  });
});
