import { describe, expect, it, vi } from 'vitest';
import { eventBus } from '@/lib/event-bus';
import { useEventBusChannel, useEventEmitter } from './use-event-bus';

describe('useEventBus hooks', () => {
  describe('useEventEmitter', () => {
    it('should return an emit function', () => {
      const { emit } = useEventEmitter();
      expect(typeof emit).toBe('function');
    });

    it('should emit events to the event bus', () => {
      const { emit } = useEventEmitter();
      const callback = vi.fn();
      const unsubscribe = eventBus.on('test-event', callback);

      emit('test-event', { value: 42 });

      expect(callback).toHaveBeenCalledWith({ value: 42 });
      unsubscribe();
    });

    it('should emit events with different data types', () => {
      const { emit } = useEventEmitter();
      const callback = vi.fn();
      const unsubscribe = eventBus.on('typed-event', callback);

      emit('typed-event', 'string value');
      expect(callback).toHaveBeenCalledWith('string value');

      emit('typed-event', 123);
      expect(callback).toHaveBeenCalledWith(123);

      emit('typed-event', { nested: { data: true } });
      expect(callback).toHaveBeenCalledWith({ nested: { data: true } });

      unsubscribe();
    });
  });

  describe('useEventBusChannel', () => {
    it('should return emit, subscribe, and once functions', () => {
      const channel = useEventBusChannel('channel-test');
      expect(typeof channel.emit).toBe('function');
      expect(typeof channel.subscribe).toBe('function');
      expect(typeof channel.once).toBe('function');
    });

    it('should emit and receive events on the same channel', () => {
      const channel = useEventBusChannel<{ message: string }>('message-channel');
      const callback = vi.fn();
      const unsubscribe = channel.subscribe(callback);

      channel.emit({ message: 'hello' });

      expect(callback).toHaveBeenCalledWith({ message: 'hello' });
      unsubscribe();
    });

    it('should allow multiple subscribers', () => {
      const channel = useEventBusChannel<number>('multi-channel');
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = channel.subscribe(callback1);
      const unsub2 = channel.subscribe(callback2);

      channel.emit(100);

      expect(callback1).toHaveBeenCalledWith(100);
      expect(callback2).toHaveBeenCalledWith(100);

      unsub1();
      unsub2();
    });

    it('should unsubscribe correctly', () => {
      const channel = useEventBusChannel<string>('unsub-channel');
      const callback = vi.fn();

      const unsubscribe = channel.subscribe(callback);
      channel.emit('first');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      channel.emit('second');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle once subscription', () => {
      const channel = useEventBusChannel<string>('once-channel');
      const callback = vi.fn();

      const unsubscribe = channel.once(callback);

      channel.emit('first');
      channel.emit('second');
      channel.emit('third');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');
      unsubscribe();
    });

    it('should isolate different channels', () => {
      const channel1 = useEventBusChannel<string>('channel-1');
      const channel2 = useEventBusChannel<string>('channel-2');

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = channel1.subscribe(callback1);
      const unsub2 = channel2.subscribe(callback2);

      channel1.emit('message-1');

      expect(callback1).toHaveBeenCalledWith('message-1');
      expect(callback2).not.toHaveBeenCalled();

      unsub1();
      unsub2();
    });
  });
});
