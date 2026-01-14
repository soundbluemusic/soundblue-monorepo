/**
 * @soundblue/web-audio - ToneEngine Noop Implementation Tests
 * Tests for SSG/build time implementation
 */
import { describe, expect, it } from 'vitest';
import { Tone, toneEngine } from '../src/tone-engine.noop';

describe('@soundblue/web-audio ToneEngine noop implementation', () => {
  describe('toneEngine', () => {
    it('should report not initialized', () => {
      expect(toneEngine.isInitialized()).toBe(false);
    });

    it('should report not playing', () => {
      expect(toneEngine.isPlaying()).toBe(false);
    });

    it('should return default BPM', () => {
      expect(toneEngine.getBpm()).toBe(120);
    });

    it('should not throw on initialize', async () => {
      await expect(toneEngine.initialize()).resolves.not.toThrow();
    });

    it('should not throw on setBpm', () => {
      expect(() => toneEngine.setBpm(140)).not.toThrow();
    });

    it('should not throw on play', () => {
      expect(() => toneEngine.play()).not.toThrow();
    });

    it('should not throw on pause', () => {
      expect(() => toneEngine.pause()).not.toThrow();
    });

    it('should not throw on stop', () => {
      expect(() => toneEngine.stop()).not.toThrow();
    });

    it('should not throw on startBeatLoop', () => {
      expect(() => toneEngine.startBeatLoop()).not.toThrow();
      expect(() => toneEngine.startBeatLoop(4)).not.toThrow();
    });

    it('should not throw on stopBeatLoop', () => {
      expect(() => toneEngine.stopBeatLoop()).not.toThrow();
    });

    it('should not throw on setCallbacks', () => {
      expect(() =>
        toneEngine.setCallbacks({
          onBeat: () => {},
          onStateChange: () => {},
        }),
      ).not.toThrow();
    });

    it('should not throw on dispose', () => {
      expect(() => toneEngine.dispose()).not.toThrow();
    });

    it('should return default state', () => {
      const state = toneEngine.getState();
      expect(state).toEqual({
        isInitialized: false,
        isPlaying: false,
        bpm: 120,
        currentBeat: 0,
        currentBar: 0,
      });
    });
  });

  describe('Tone noop object', () => {
    it('should have start method', async () => {
      await expect(Tone.start()).resolves.not.toThrow();
    });

    it('should have getTransport method', () => {
      const transport = Tone.getTransport();
      expect(transport.bpm.value).toBe(120);
      expect(transport.state).toBe('stopped');
    });

    it('should have noop transport methods', () => {
      const transport = Tone.getTransport();
      expect(() => transport.start()).not.toThrow();
      expect(() => transport.pause()).not.toThrow();
      expect(() => transport.stop()).not.toThrow();
      expect(() => transport.cancel()).not.toThrow();
    });

    it('should have Loop class', () => {
      const loop = new Tone.Loop();
      expect(loop.start()).toBe(loop);
      expect(loop.stop()).toBe(loop);
      expect(() => loop.dispose()).not.toThrow();
    });
  });
});
