/**
 * @soundblue/audio-engine - Pattern Tests
 * Tests for pattern definitions and manipulation
 */
import { describe, expect, it } from 'vitest';
import {
  clearPattern,
  createEmptyPattern,
  getActiveStepsAt,
  getActiveTracks,
  randomizePattern,
  setStepVelocity,
  shiftPattern,
  toggleMute,
  toggleSolo,
  toggleStep,
} from '../src/sequencer/pattern';

describe('@soundblue/audio-engine pattern', () => {
  describe('createEmptyPattern', () => {
    it('should create pattern with correct structure', () => {
      const pattern = createEmptyPattern('p1', 'Pattern 1', 4, 16);

      expect(pattern.id).toBe('p1');
      expect(pattern.name).toBe('Pattern 1');
      expect(pattern.tracks.length).toBe(4);
      expect(pattern.length).toBe(16);
      expect(pattern.subdivision).toBe(4);
    });

    it('should create tracks with empty steps', () => {
      const pattern = createEmptyPattern('p1', 'Test', 2, 8);

      expect(pattern.tracks[0].steps.length).toBe(8);
      expect(pattern.tracks[0].steps.every((s) => !s.active)).toBe(true);
      expect(pattern.tracks[0].muted).toBe(false);
      expect(pattern.tracks[0].solo).toBe(false);
    });

    it('should use default subdivision of 4', () => {
      const pattern = createEmptyPattern('p1', 'Test', 1, 16);
      expect(pattern.subdivision).toBe(4);
    });
  });

  describe('toggleStep', () => {
    it('should toggle step active state', () => {
      const pattern = createEmptyPattern('p1', 'Test', 2, 8);

      const toggled = toggleStep(pattern, 'track-0', 0);
      expect(toggled.tracks[0].steps[0].active).toBe(true);

      const toggledAgain = toggleStep(toggled, 'track-0', 0);
      expect(toggledAgain.tracks[0].steps[0].active).toBe(false);
    });

    it('should not affect other steps', () => {
      const pattern = createEmptyPattern('p1', 'Test', 2, 8);
      const toggled = toggleStep(pattern, 'track-0', 0);

      expect(toggled.tracks[0].steps[1].active).toBe(false);
      expect(toggled.tracks[1].steps[0].active).toBe(false);
    });
  });

  describe('setStepVelocity', () => {
    it('should set step velocity', () => {
      const pattern = createEmptyPattern('p1', 'Test', 1, 4);
      const updated = setStepVelocity(pattern, 'track-0', 0, 0.75);

      expect(updated.tracks[0].steps[0].velocity).toBe(0.75);
    });

    it('should clamp velocity to 0-1 range', () => {
      const pattern = createEmptyPattern('p1', 'Test', 1, 4);

      const tooHigh = setStepVelocity(pattern, 'track-0', 0, 1.5);
      expect(tooHigh.tracks[0].steps[0].velocity).toBe(1);

      const tooLow = setStepVelocity(pattern, 'track-0', 0, -0.5);
      expect(tooLow.tracks[0].steps[0].velocity).toBe(0);
    });
  });

  describe('toggleMute', () => {
    it('should toggle track mute state', () => {
      const pattern = createEmptyPattern('p1', 'Test', 2, 4);

      const muted = toggleMute(pattern, 'track-0');
      expect(muted.tracks[0].muted).toBe(true);
      expect(muted.tracks[1].muted).toBe(false);

      const unmuted = toggleMute(muted, 'track-0');
      expect(unmuted.tracks[0].muted).toBe(false);
    });
  });

  describe('toggleSolo', () => {
    it('should toggle track solo state', () => {
      const pattern = createEmptyPattern('p1', 'Test', 2, 4);

      const soloed = toggleSolo(pattern, 'track-0');
      expect(soloed.tracks[0].solo).toBe(true);
      expect(soloed.tracks[1].solo).toBe(false);
    });
  });

  describe('clearPattern', () => {
    it('should clear all steps', () => {
      let pattern = createEmptyPattern('p1', 'Test', 2, 4);
      pattern = toggleStep(pattern, 'track-0', 0);
      pattern = toggleStep(pattern, 'track-0', 1);
      pattern = toggleStep(pattern, 'track-1', 2);

      const cleared = clearPattern(pattern);

      expect(cleared.tracks[0].steps.every((s) => !s.active)).toBe(true);
      expect(cleared.tracks[1].steps.every((s) => !s.active)).toBe(true);
    });
  });

  describe('getActiveTracks', () => {
    it('should return all non-muted tracks when no solo', () => {
      const pattern = createEmptyPattern('p1', 'Test', 3, 4);
      const active = getActiveTracks(pattern);

      expect(active.length).toBe(3);
    });

    it('should exclude muted tracks', () => {
      let pattern = createEmptyPattern('p1', 'Test', 3, 4);
      pattern = toggleMute(pattern, 'track-0');

      const active = getActiveTracks(pattern);
      expect(active.length).toBe(2);
      expect(active.find((t) => t.id === 'track-0')).toBeUndefined();
    });

    it('should return only soloed tracks when solo is active', () => {
      let pattern = createEmptyPattern('p1', 'Test', 3, 4);
      pattern = toggleSolo(pattern, 'track-1');

      const active = getActiveTracks(pattern);
      expect(active.length).toBe(1);
      expect(active[0].id).toBe('track-1');
    });

    it('should exclude muted soloed tracks', () => {
      let pattern = createEmptyPattern('p1', 'Test', 3, 4);
      pattern = toggleSolo(pattern, 'track-0');
      pattern = toggleSolo(pattern, 'track-1');
      pattern = toggleMute(pattern, 'track-0');

      const active = getActiveTracks(pattern);
      expect(active.length).toBe(1);
      expect(active[0].id).toBe('track-1');
    });
  });

  describe('getActiveStepsAt', () => {
    it('should return active steps at index', () => {
      let pattern = createEmptyPattern('p1', 'Test', 2, 4);
      pattern = toggleStep(pattern, 'track-0', 0);
      pattern = toggleStep(pattern, 'track-1', 0);

      const activeSteps = getActiveStepsAt(pattern, 0);
      expect(activeSteps.length).toBe(2);
    });

    it('should return empty array when no active steps', () => {
      const pattern = createEmptyPattern('p1', 'Test', 2, 4);
      const activeSteps = getActiveStepsAt(pattern, 0);

      expect(activeSteps.length).toBe(0);
    });

    it('should respect mute state', () => {
      let pattern = createEmptyPattern('p1', 'Test', 2, 4);
      pattern = toggleStep(pattern, 'track-0', 0);
      pattern = toggleStep(pattern, 'track-1', 0);
      pattern = toggleMute(pattern, 'track-0');

      const activeSteps = getActiveStepsAt(pattern, 0);
      expect(activeSteps.length).toBe(1);
      expect(activeSteps[0].trackId).toBe('track-1');
    });
  });

  describe('shiftPattern', () => {
    it('should shift pattern left', () => {
      let pattern = createEmptyPattern('p1', 'Test', 1, 4);
      pattern = toggleStep(pattern, 'track-0', 0);

      const shifted = shiftPattern(pattern, 'left');
      expect(shifted.tracks[0].steps[0].active).toBe(false);
      expect(shifted.tracks[0].steps[3].active).toBe(true);
    });

    it('should shift pattern right', () => {
      let pattern = createEmptyPattern('p1', 'Test', 1, 4);
      pattern = toggleStep(pattern, 'track-0', 0);

      const shifted = shiftPattern(pattern, 'right');
      expect(shifted.tracks[0].steps[0].active).toBe(false);
      expect(shifted.tracks[0].steps[1].active).toBe(true);
    });
  });

  describe('randomizePattern', () => {
    it('should randomize with density 0', () => {
      const pattern = createEmptyPattern('p1', 'Test', 1, 16);
      const randomized = randomizePattern(pattern, 0);

      expect(randomized.tracks[0].steps.every((s) => !s.active)).toBe(true);
    });

    it('should clamp density to valid range', () => {
      const pattern = createEmptyPattern('p1', 'Test', 1, 4);

      // Should not throw
      expect(() => randomizePattern(pattern, -0.5)).not.toThrow();
      expect(() => randomizePattern(pattern, 1.5)).not.toThrow();
    });
  });
});
