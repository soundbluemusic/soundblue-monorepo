// ========================================
// Event Bus - 도구 간 통신
// ========================================
// 예: 메트로놈 ↔ 피아노롤 BPM 동기화

type EventCallback<T = unknown> = (data: T) => void;

interface EventBus {
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void;
  off<T = unknown>(event: string, callback: EventCallback<T>): void;
  emit<T = unknown>(event: string, data: T): void;
  once<T = unknown>(event: string, callback: EventCallback<T>): () => void;
}

class EventBusImpl implements EventBus {
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback<unknown>);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = unknown>(event: string, data: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after first call)
   * @returns Unsubscribe function
   */
  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const onceCallback: EventCallback<T> = (data) => {
      this.off(event, onceCallback);
      callback(data);
    };
    return this.on(event, onceCallback);
  }
}

// Singleton instance
export const eventBus = new EventBusImpl();

// ========================================
// Predefined Events
// ========================================

// Tempo sync events
export const TEMPO_CHANGE = 'tempo:change';

// Beat events
export const BEAT_TICK = 'beat:tick';

// MIDI events
export const MIDI_NOTE_ON = 'midi:note-on';
export const MIDI_NOTE_OFF = 'midi:note-off';
export const MIDI_CC = 'midi:cc';

// Type definitions for events
export interface TempoChangeEvent {
  bpm: number;
  source: string;
}

export interface BeatTickEvent {
  beat: number;
  measure: number;
  time: number;
}

export interface MidiNoteEvent {
  note: number;
  velocity: number;
  channel: number;
}

export interface MidiCCEvent {
  controller: number;
  value: number;
  channel: number;
}

// Helper functions for common events
export function emitTempoChange(bpm: number, source: string): void {
  eventBus.emit<TempoChangeEvent>(TEMPO_CHANGE, { bpm, source });
}

export function onTempoChange(callback: (event: TempoChangeEvent) => void): () => void {
  return eventBus.on(TEMPO_CHANGE, callback);
}

export function emitBeatTick(beat: number, measure: number, time: number): void {
  eventBus.emit<BeatTickEvent>(BEAT_TICK, { beat, measure, time });
}

export function onBeatTick(callback: (event: BeatTickEvent) => void): () => void {
  return eventBus.on(BEAT_TICK, callback);
}
