import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BEAT_TICK,
  emitBeatTick,
  emitTempoChange,
  eventBus,
  MIDI_NOTE_ON,
  onBeatTick,
  onTempoChange,
  TEMPO_CHANGE,
} from './event-bus';

describe('EventBus', () => {
  beforeEach(() => {
    // Clear all listeners between tests
    vi.clearAllMocks();
  });

  describe('on/off/emit', () => {
    it('should subscribe to events and receive data', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);

      eventBus.emit('test-event', { value: 42 });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ value: 42 });
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.on('test-event', callback);

      eventBus.emit('test-event', 'first');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      eventBus.emit('test-event', 'second');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('multi-event', callback1);
      eventBus.on('multi-event', callback2);

      eventBus.emit('multi-event', 'data');

      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('should not call unsubscribed listeners', () => {
      const callback = vi.fn();
      eventBus.on('test', callback);
      eventBus.off('test', callback);

      eventBus.emit('test', 'data');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should only fire once', () => {
      const callback = vi.fn();
      eventBus.once('once-event', callback);

      eventBus.emit('once-event', 'first');
      eventBus.emit('once-event', 'second');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.once('once-event', callback);

      unsubscribe();
      eventBus.emit('once-event', 'data');

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Tempo events', () => {
    it('should emit and receive tempo change events', () => {
      const callback = vi.fn();
      const unsubscribe = onTempoChange(callback);

      emitTempoChange(120, 'metronome');

      expect(callback).toHaveBeenCalledWith({
        bpm: 120,
        source: 'metronome',
      });

      unsubscribe();
    });

    it('should handle multiple tempo listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = onTempoChange(callback1);
      const unsub2 = onTempoChange(callback2);

      emitTempoChange(90, 'daw');

      expect(callback1).toHaveBeenCalledWith({ bpm: 90, source: 'daw' });
      expect(callback2).toHaveBeenCalledWith({ bpm: 90, source: 'daw' });

      unsub1();
      unsub2();
    });
  });

  describe('Beat events', () => {
    it('should emit and receive beat tick events', () => {
      const callback = vi.fn();
      const unsubscribe = onBeatTick(callback);

      emitBeatTick(1, 1, 0.5);

      expect(callback).toHaveBeenCalledWith({
        beat: 1,
        measure: 1,
        time: 0.5,
      });

      unsubscribe();
    });
  });

  describe('Event constants', () => {
    it('should have correct event names', () => {
      expect(TEMPO_CHANGE).toBe('tempo:change');
      expect(BEAT_TICK).toBe('beat:tick');
      expect(MIDI_NOTE_ON).toBe('midi:note-on');
    });
  });
});
