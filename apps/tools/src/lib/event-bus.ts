// ========================================
// Event Bus - 도구 간 통신
// ========================================
// 예: 메트로놈 ↔ 피아노롤 BPM 동기화

// ========================================
// Event Type Definitions
// ========================================

/** Tempo change event payload */
export interface TempoChangeEvent {
  bpm: number;
  source: string;
}

/** Beat tick event payload */
export interface BeatTickEvent {
  beat: number;
  measure: number;
  time: number;
}

/** MIDI note event payload */
export interface MidiNoteEvent {
  note: number;
  velocity: number;
  channel: number;
}

/** MIDI CC event payload */
export interface MidiCCEvent {
  controller: number;
  value: number;
  channel: number;
}

// ========================================
// Event Map - Type-safe event registry
// ========================================

/**
 * Maps event names to their payload types.
 * This enables type-safe event emission and subscription.
 */
export interface EventMap {
  'tempo:change': TempoChangeEvent;
  'beat:tick': BeatTickEvent;
  'midi:note-on': MidiNoteEvent;
  'midi:note-off': MidiNoteEvent;
  'midi:cc': MidiCCEvent;
}

/** All known event names */
export type EventName = keyof EventMap;

/** Callback type for a specific event */
type EventCallback<T> = (data: T) => void;

/** Generic callback for unknown events (for internal storage) */
type GenericCallback = (data: unknown) => void;

// ========================================
// Type-safe EventBus Interface
// ========================================

interface EventBus {
  /** Subscribe to a known event with type-safe payload */
  on<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): () => void;
  /** Subscribe to a custom event with explicit type */
  on<T>(event: string, callback: EventCallback<T>): () => void;

  /** Unsubscribe from a known event */
  off<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): void;
  /** Unsubscribe from a custom event */
  off<T>(event: string, callback: EventCallback<T>): void;

  /** Emit a known event with type-safe payload */
  emit<K extends EventName>(event: K, data: EventMap[K]): void;
  /** Emit a custom event with explicit type */
  emit<T>(event: string, data: T): void;

  /** Subscribe once to a known event */
  once<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): () => void;
  /** Subscribe once to a custom event */
  once<T>(event: string, callback: EventCallback<T>): () => void;
}

class EventBusImpl implements EventBus {
  private listeners: Map<string, Set<GenericCallback>> = new Map();

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): () => void;
  on<T>(event: string, callback: EventCallback<T>): () => void;
  on(event: string, callback: GenericCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): void;
  off<T>(event: string, callback: EventCallback<T>): void;
  off(event: string, callback: GenericCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<K extends EventName>(event: K, data: EventMap[K]): void;
  emit<T>(event: string, data: T): void;
  emit(event: string, data: unknown): void {
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
  once<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): () => void;
  once<T>(event: string, callback: EventCallback<T>): () => void;
  once(event: string, callback: GenericCallback): () => void {
    const onceCallback: GenericCallback = (data) => {
      this.off(event, onceCallback);
      callback(data);
    };
    return this.on(event, onceCallback);
  }
}

// Singleton instance
export const eventBus = new EventBusImpl();

// ========================================
// Predefined Event Constants
// ========================================
// Using 'as const' satisfies for type-safe event names

/** Tempo sync event - triggered when BPM changes */
export const TEMPO_CHANGE = 'tempo:change' as const satisfies EventName;

/** Beat tick event - triggered on each beat */
export const BEAT_TICK = 'beat:tick' as const satisfies EventName;

/** MIDI note on event */
export const MIDI_NOTE_ON = 'midi:note-on' as const satisfies EventName;

/** MIDI note off event */
export const MIDI_NOTE_OFF = 'midi:note-off' as const satisfies EventName;

/** MIDI control change event */
export const MIDI_CC = 'midi:cc' as const satisfies EventName;

// ========================================
// Type-safe Helper Functions
// ========================================

/** Emit a tempo change event */
export function emitTempoChange(bpm: number, source: string): void {
  eventBus.emit(TEMPO_CHANGE, { bpm, source });
}

/** Subscribe to tempo change events */
export function onTempoChange(callback: EventCallback<TempoChangeEvent>): () => void {
  return eventBus.on(TEMPO_CHANGE, callback);
}

/** Emit a beat tick event */
export function emitBeatTick(beat: number, measure: number, time: number): void {
  eventBus.emit(BEAT_TICK, { beat, measure, time });
}

/** Subscribe to beat tick events */
export function onBeatTick(callback: EventCallback<BeatTickEvent>): () => void {
  return eventBus.on(BEAT_TICK, callback);
}

/** Emit a MIDI note on event */
export function emitMidiNoteOn(note: number, velocity: number, channel: number): void {
  eventBus.emit(MIDI_NOTE_ON, { note, velocity, channel });
}

/** Subscribe to MIDI note on events */
export function onMidiNoteOn(callback: EventCallback<MidiNoteEvent>): () => void {
  return eventBus.on(MIDI_NOTE_ON, callback);
}

/** Emit a MIDI note off event */
export function emitMidiNoteOff(note: number, velocity: number, channel: number): void {
  eventBus.emit(MIDI_NOTE_OFF, { note, velocity, channel });
}

/** Subscribe to MIDI note off events */
export function onMidiNoteOff(callback: EventCallback<MidiNoteEvent>): () => void {
  return eventBus.on(MIDI_NOTE_OFF, callback);
}

/** Emit a MIDI CC event */
export function emitMidiCC(controller: number, value: number, channel: number): void {
  eventBus.emit(MIDI_CC, { controller, value, channel });
}

/** Subscribe to MIDI CC events */
export function onMidiCC(callback: EventCallback<MidiCCEvent>): () => void {
  return eventBus.on(MIDI_CC, callback);
}
