/**
 * @soundblue/web-audio - AudioContext Manager Noop Implementation Tests
 * Tests for SSG/build time implementation
 */
import { describe, expect, it } from 'vitest';
import {
  audioContextManager,
  closeAudioContext,
  createGain,
  createOscillator,
  getAudioContext,
  getAudioContextState,
  getCurrentTime,
  getSampleRate,
  onAudioContextStateChange,
  resumeAudioContext,
} from '../src/context/manager.noop';

describe('@soundblue/web-audio AudioContext Manager noop implementation', () => {
  describe('audioContextManager', () => {
    it('should return null for getContext', () => {
      expect(audioContextManager.getContext()).toBeNull();
    });

    it('should not throw on resume', async () => {
      await expect(audioContextManager.resume()).resolves.not.toThrow();
    });

    it('should return null for getState', () => {
      expect(audioContextManager.getState()).toBeNull();
    });

    it('should return cleanup function from onStateChange', () => {
      const cleanup = audioContextManager.onStateChange(() => {});
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    it('should not throw on close', async () => {
      await expect(audioContextManager.close()).resolves.not.toThrow();
    });

    it('should return 0 for getCurrentTime', () => {
      expect(audioContextManager.getCurrentTime()).toBe(0);
    });

    it('should return default sample rate', () => {
      expect(audioContextManager.getSampleRate()).toBe(44100);
    });
  });

  describe('convenience functions', () => {
    it('getAudioContext should return null', () => {
      expect(getAudioContext()).toBeNull();
    });

    it('resumeAudioContext should not throw', async () => {
      await expect(resumeAudioContext()).resolves.not.toThrow();
    });

    it('getAudioContextState should return null', () => {
      expect(getAudioContextState()).toBeNull();
    });

    it('onAudioContextStateChange should return cleanup function', () => {
      const cleanup = onAudioContextStateChange(() => {});
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    it('closeAudioContext should not throw', async () => {
      await expect(closeAudioContext()).resolves.not.toThrow();
    });

    it('createOscillator should return null', () => {
      expect(createOscillator(440)).toBeNull();
      expect(createOscillator(440, 'sine')).toBeNull();
    });

    it('createGain should return null', () => {
      expect(createGain()).toBeNull();
      expect(createGain(0.5)).toBeNull();
    });

    it('getCurrentTime should return 0', () => {
      expect(getCurrentTime()).toBe(0);
    });

    it('getSampleRate should return default', () => {
      expect(getSampleRate()).toBe(44100);
    });
  });
});
