import { onCleanup } from 'solid-js';
import { eventBus } from '~/lib/event-bus';

/**
 * Hook to subscribe to event bus events
 * @param event - Event name to subscribe to
 * @param callback - Callback to execute when event is emitted
 */
export function useEventBus<T = unknown>(event: string, callback: (data: T) => void): void {
  const unsubscribe = eventBus.on<T>(event, callback);
  onCleanup(unsubscribe);
}

/** Return type for useEventEmitter hook */
export interface UseEventEmitterReturn {
  emit: <T = unknown>(event: string, data: T) => void;
}

/**
 * Hook to emit events to the event bus
 * @returns emit function
 */
export function useEventEmitter(): UseEventEmitterReturn {
  const emit = <T = unknown>(event: string, data: T): void => {
    eventBus.emit<T>(event, data);
  };

  return { emit };
}

/** Return type for useEventBusChannel hook */
export interface UseEventBusChannelReturn<T> {
  emit: (data: T) => void;
  subscribe: (callback: (data: T) => void) => () => void;
  once: (callback: (data: T) => void) => () => void;
}

/**
 * Combined hook for both subscribing and emitting
 */
export function useEventBusChannel<T = unknown>(event: string): UseEventBusChannelReturn<T> {
  const emit = (data: T): void => {
    eventBus.emit<T>(event, data);
  };

  const subscribe = (callback: (data: T) => void): (() => void) => {
    return eventBus.on<T>(event, callback);
  };

  const once = (callback: (data: T) => void): (() => void) => {
    return eventBus.once<T>(event, callback);
  };

  return { emit, subscribe, once };
}
