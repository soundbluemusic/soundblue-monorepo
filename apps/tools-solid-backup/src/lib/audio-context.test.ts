import { afterEach, describe, expect, it } from 'vitest';
import {
  closeAudioContext,
  createGain,
  createOscillator,
  getAudioContext,
  getAudioContextState,
  getCurrentTime,
  getSampleRate,
  resumeAudioContext,
} from './audio-context';

describe('AudioContext utilities', () => {
  afterEach(async () => {
    await closeAudioContext();
  });

  describe('getAudioContext', () => {
    it('should return an AudioContext instance', () => {
      const ctx = getAudioContext();
      expect(ctx).toBeDefined();
      expect(ctx).toBeInstanceOf(AudioContext);
    });

    it('should return the same instance on multiple calls', () => {
      const ctx1 = getAudioContext();
      const ctx2 = getAudioContext();
      expect(ctx1).toBe(ctx2);
    });
  });

  describe('getAudioContextState', () => {
    it('should return null before context is created', async () => {
      await closeAudioContext();
      // After closing, state should be null until new context is created
      const state = getAudioContextState();
      expect(state).toBeNull();
    });

    it('should return state after context is created', () => {
      getAudioContext();
      const state = getAudioContextState();
      expect(['running', 'suspended', 'closed']).toContain(state);
    });
  });

  describe('resumeAudioContext', () => {
    it('should resume suspended context', async () => {
      const ctx = getAudioContext();
      await resumeAudioContext();
      expect(ctx.state).toBe('running');
    });
  });

  describe('closeAudioContext', () => {
    it('should close the context', async () => {
      getAudioContext();
      await closeAudioContext();
      const state = getAudioContextState();
      expect(state).toBeNull();
    });
  });

  describe('createOscillator', () => {
    it('should create an oscillator with default type', () => {
      const osc = createOscillator(440);
      expect(osc).toBeDefined();
      expect(osc.frequency.value).toBe(440);
      expect(osc.type).toBe('sine');
    });

    it('should create an oscillator with specified type', () => {
      const osc = createOscillator(880, 'square');
      expect(osc.frequency.value).toBe(880);
      expect(osc.type).toBe('square');
    });
  });

  describe('createGain', () => {
    it('should create a gain node with default value', () => {
      const gain = createGain();
      expect(gain).toBeDefined();
      expect(gain.gain.value).toBe(1);
    });

    it('should create a gain node with specified value', () => {
      const gain = createGain(0.5);
      expect(gain.gain.value).toBe(0.5);
    });
  });

  describe('getCurrentTime', () => {
    it('should return current audio time', () => {
      getAudioContext();
      const time = getCurrentTime();
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSampleRate', () => {
    it('should return sample rate', () => {
      getAudioContext();
      const rate = getSampleRate();
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThan(0);
    });
  });
});
