/**
 * Event Bus Integration Tests with Mocks
 * Mock을 사용한 이벤트 버스 통합 테스트
 *
 * Test Quality: Mock/Spy 사용, 통합 테스트
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BEAT_TICK,
  emitBeatTick,
  emitTempoChange,
  eventBus,
  MIDI_CC,
  MIDI_NOTE_OFF,
  MIDI_NOTE_ON,
  onBeatTick,
  onTempoChange,
  TEMPO_CHANGE,
} from './event-bus';

describe('Event Bus Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cross-Tool Communication', () => {
    it('should allow metronome to broadcast tempo to drum machine', () => {
      const drumMachineHandler = vi.fn();
      const unsubscribe = onTempoChange(drumMachineHandler);

      // 메트로놈에서 템포 변경 발생
      emitTempoChange(140, 'metronome-1');

      expect(drumMachineHandler).toHaveBeenCalledTimes(1);
      expect(drumMachineHandler).toHaveBeenCalledWith({
        bpm: 140,
        source: 'metronome-1',
      });

      unsubscribe();
    });

    it('should broadcast beat ticks to all subscribers', () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsub1 = onBeatTick(subscriber1);
      const unsub2 = onBeatTick(subscriber2);

      emitBeatTick(0, 1, 0.5);

      expect(subscriber1).toHaveBeenCalledWith({ beat: 0, measure: 1, time: 0.5 });
      expect(subscriber2).toHaveBeenCalledWith({ beat: 0, measure: 1, time: 0.5 });

      unsub1();
      unsub2();
    });

    it('should not receive events after unsubscribe', () => {
      const handler = vi.fn();
      const unsubscribe = onTempoChange(handler);

      emitTempoChange(120, 'source-1');
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      emitTempoChange(140, 'source-2');
      expect(handler).toHaveBeenCalledTimes(1); // 여전히 1번
    });

    it('should handle multiple tempo changes in sequence', () => {
      const handler = vi.fn();
      const unsubscribe = onTempoChange(handler);

      emitTempoChange(100, 'source');
      emitTempoChange(120, 'source');
      emitTempoChange(140, 'source');

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, { bpm: 100, source: 'source' });
      expect(handler).toHaveBeenNthCalledWith(2, { bpm: 120, source: 'source' });
      expect(handler).toHaveBeenNthCalledWith(3, { bpm: 140, source: 'source' });

      unsubscribe();
    });
  });

  describe('Event Type Constants', () => {
    it('should have all required event types defined', () => {
      expect(TEMPO_CHANGE).toBeDefined();
      expect(BEAT_TICK).toBeDefined();
      expect(MIDI_NOTE_ON).toBeDefined();
      expect(MIDI_NOTE_OFF).toBeDefined();
      expect(MIDI_CC).toBeDefined();
    });

    it('should have unique event type values', () => {
      const values = [TEMPO_CHANGE, BEAT_TICK, MIDI_NOTE_ON, MIDI_NOTE_OFF, MIDI_CC];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should use namespaced event names', () => {
      expect(TEMPO_CHANGE).toContain(':');
      expect(BEAT_TICK).toContain(':');
      expect(MIDI_NOTE_ON).toContain(':');
    });
  });

  describe('Generic Event Bus Operations', () => {
    it('should emit and receive custom events', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('custom-event', handler);

      eventBus.emit('custom-event', { data: 'test' });

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
      unsubscribe();
    });

    it('should support once subscription', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.once('once-event', handler);

      eventBus.emit('once-event', { first: true });
      eventBus.emit('once-event', { second: true });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ first: true });
      unsubscribe();
    });

    it('should handle events with no subscribers gracefully', () => {
      expect(() => {
        eventBus.emit('no-subscribers', { data: 'test' });
      }).not.toThrow();
    });

    it('should isolate different event channels', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsub1 = eventBus.on('channel-1', handler1);
      const unsub2 = eventBus.on('channel-2', handler2);

      eventBus.emit('channel-1', 'data-1');

      expect(handler1).toHaveBeenCalledWith('data-1');
      expect(handler2).not.toHaveBeenCalled();

      unsub1();
      unsub2();
    });
  });

  describe('Error Handling', () => {
    it('should propagate handler errors (current behavior)', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });

      const unsub = eventBus.on('error-test', errorHandler);

      // 현재 구현은 에러를 전파함
      expect(() => {
        eventBus.emit('error-test', 'data');
      }).toThrow('Handler error');

      unsub();
    });

    it('should call handlers in order of subscription', () => {
      const order: number[] = [];

      const handler1 = vi.fn(() => order.push(1));
      const handler2 = vi.fn(() => order.push(2));
      const handler3 = vi.fn(() => order.push(3));

      const unsub1 = eventBus.on('order-test', handler1);
      const unsub2 = eventBus.on('order-test', handler2);
      const unsub3 = eventBus.on('order-test', handler3);

      eventBus.emit('order-test', 'data');

      expect(order).toEqual([1, 2, 3]);

      unsub1();
      unsub2();
      unsub3();
    });
  });

  describe('Performance', () => {
    it('should handle many subscribers efficiently', () => {
      const handlers: ReturnType<typeof vi.fn>[] = [];
      const unsubscribers: (() => void)[] = [];

      // 100개의 구독자 추가
      for (let i = 0; i < 100; i++) {
        const handler = vi.fn();
        handlers.push(handler);
        unsubscribers.push(eventBus.on('perf-test', handler));
      }

      const start = performance.now();
      eventBus.emit('perf-test', 'data');
      const duration = performance.now() - start;

      // 100개 구독자에게 이벤트 전달이 10ms 이내여야 함
      expect(duration).toBeLessThan(10);

      // 모든 핸들러가 호출됨
      handlers.forEach((h) => expect(h).toHaveBeenCalled());

      // 정리
      unsubscribers.forEach((u) => u());
    });
  });
});
