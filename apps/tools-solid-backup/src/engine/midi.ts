// ========================================
// WebMIDI API Wrapper
// ========================================
// 실제 MIDI 건반/컨트롤러 연결 지원

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

export interface MIDIMessage {
  command: number; // Note On, Note Off, CC, etc.
  channel: number; // 0-15
  note?: number; // 0-127
  velocity?: number; // 0-127
  controller?: number; // CC number
  value?: number; // CC value
  timestamp: number;
}

// MIDI Commands
export const MIDI_COMMANDS = {
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  AFTERTOUCH: 0xa0,
  CONTROL_CHANGE: 0xb0,
  PROGRAM_CHANGE: 0xc0,
  CHANNEL_PRESSURE: 0xd0,
  PITCH_BEND: 0xe0,
} as const;

// Common CC numbers
export const MIDI_CC = {
  MODULATION: 1,
  BREATH: 2,
  VOLUME: 7,
  PAN: 10,
  EXPRESSION: 11,
  SUSTAIN: 64,
  PORTAMENTO: 65,
  SOSTENUTO: 66,
  SOFT_PEDAL: 67,
  ALL_SOUND_OFF: 120,
  ALL_NOTES_OFF: 123,
} as const;

type MIDIMessageCallback = (message: MIDIMessage) => void;
type MIDIDeviceCallback = (devices: MIDIDevice[]) => void;

class MIDIManager {
  private midiAccess: MIDIAccess | null = null;
  private inputs: Map<string, MIDIInput> = new Map();
  private outputs: Map<string, MIDIOutput> = new Map();

  private messageCallbacks: Set<MIDIMessageCallback> = new Set();
  private deviceCallbacks: Set<MIDIDeviceCallback> = new Set();

  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!navigator.requestMIDIAccess) {
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });

      // Setup state change handler
      this.midiAccess.onstatechange = () => {
        this.updateDevices();
      };

      // Initial device scan
      this.updateDevices();

      this.isInitialized = true;
      return true;
    } catch {
      return false;
    }
  }

  private updateDevices(): void {
    if (!this.midiAccess) return;

    // Clear old connections
    this.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    this.inputs.clear();
    this.outputs.clear();

    // Add inputs
    this.midiAccess.inputs.forEach((input, id) => {
      this.inputs.set(id, input);
      input.onmidimessage = (event) => this.handleMIDIMessage(event);
    });

    // Add outputs
    this.midiAccess.outputs.forEach((output, id) => {
      this.outputs.set(id, output);
    });

    // Notify listeners
    const devices = this.getDevices();
    this.deviceCallbacks.forEach((callback) => {
      callback(devices);
    });
  }

  private handleMIDIMessage(event: MIDIMessageEvent): void {
    const data = event.data;
    if (!data || data.length < 1) return;

    const byte0 = data[0];
    if (byte0 === undefined) return;

    const command = byte0 & 0xf0;
    const channel = byte0 & 0x0f;

    const message: MIDIMessage = {
      command,
      channel,
      timestamp: event.timeStamp,
    };

    switch (command) {
      case MIDI_COMMANDS.NOTE_ON:
      case MIDI_COMMANDS.NOTE_OFF:
        message.note = data[1];
        message.velocity = data[2];
        // Note On with velocity 0 is Note Off
        if (command === MIDI_COMMANDS.NOTE_ON && message.velocity === 0) {
          message.command = MIDI_COMMANDS.NOTE_OFF;
        }
        break;

      case MIDI_COMMANDS.CONTROL_CHANGE:
        message.controller = data[1];
        message.value = data[2];
        break;

      case MIDI_COMMANDS.AFTERTOUCH:
        message.note = data[1];
        message.value = data[2];
        break;

      case MIDI_COMMANDS.PITCH_BEND:
        message.value = ((data[2] ?? 0) << 7) | (data[1] ?? 0); // 14-bit value
        break;

      case MIDI_COMMANDS.PROGRAM_CHANGE:
        message.value = data[1];
        break;

      case MIDI_COMMANDS.CHANNEL_PRESSURE:
        message.value = data[1];
        break;
    }

    // Notify listeners
    this.messageCallbacks.forEach((callback) => {
      callback(message);
    });
  }

  // Get all connected devices
  getDevices(): MIDIDevice[] {
    const devices: MIDIDevice[] = [];

    this.inputs.forEach((input, id) => {
      devices.push({
        id,
        name: input.name || 'Unknown',
        manufacturer: input.manufacturer || 'Unknown',
        type: 'input',
        state: input.state as 'connected' | 'disconnected',
      });
    });

    this.outputs.forEach((output, id) => {
      devices.push({
        id,
        name: output.name || 'Unknown',
        manufacturer: output.manufacturer || 'Unknown',
        type: 'output',
        state: output.state as 'connected' | 'disconnected',
      });
    });

    return devices;
  }

  // Subscribe to MIDI messages
  onMessage(callback: MIDIMessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  // Subscribe to device changes
  onDeviceChange(callback: MIDIDeviceCallback): () => void {
    this.deviceCallbacks.add(callback);
    return () => this.deviceCallbacks.delete(callback);
  }

  // Send MIDI message to output
  send(outputId: string, data: number[]): void {
    const output = this.outputs.get(outputId);
    if (output) {
      output.send(data);
    }
  }

  // Send Note On
  noteOn(outputId: string, channel: number, note: number, velocity: number): void {
    this.send(outputId, [MIDI_COMMANDS.NOTE_ON | channel, note, velocity]);
  }

  // Send Note Off
  noteOff(outputId: string, channel: number, note: number): void {
    this.send(outputId, [MIDI_COMMANDS.NOTE_OFF | channel, note, 0]);
  }

  // Send Control Change
  controlChange(outputId: string, channel: number, controller: number, value: number): void {
    this.send(outputId, [MIDI_COMMANDS.CONTROL_CHANGE | channel, controller, value]);
  }

  // Check if initialized
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const midiManager = new MIDIManager();

// ========================================
// Utility Functions
// ========================================

/**
 * Convert MIDI note number to note name
 */
export function midiNoteToName(note: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(note / 12) - 1;
  const noteName = noteNames[note % 12];
  return `${noteName}${octave}`;
}

/**
 * Convert note name to MIDI note number
 */
export function noteNameToMidi(name: string): number {
  const noteNames: Record<string, number> = {
    C: 0,
    'C#': 1,
    Db: 1,
    D: 2,
    'D#': 3,
    Eb: 3,
    E: 4,
    F: 5,
    'F#': 6,
    Gb: 6,
    G: 7,
    'G#': 8,
    Ab: 8,
    A: 9,
    'A#': 10,
    Bb: 10,
    B: 11,
  };

  const match = name.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
  if (!match) return -1;

  const matchedNote = match[1];
  const matchedOctave = match[2];
  if (!matchedNote || !matchedOctave) return -1;

  const noteName = matchedNote.charAt(0).toUpperCase() + matchedNote.slice(1);
  const octave = parseInt(matchedOctave, 10);
  const noteNum = noteNames[noteName];

  if (noteNum === undefined) return -1;
  return (octave + 1) * 12 + noteNum;
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number, a4: number = 440): number {
  return Math.round(12 * Math.log2(frequency / a4) + 69);
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(note: number, a4: number = 440): number {
  return a4 * 2 ** ((note - 69) / 12);
}

// SolidJS hook for MIDI
import { type Accessor, createSignal, onCleanup, onMount } from 'solid-js';

/** Return type for useMIDI hook */
export interface UseMIDIReturn {
  /** List of connected MIDI devices */
  devices: Accessor<MIDIDevice[]>;
  /** Whether WebMIDI API is supported */
  isSupported: Accessor<boolean>;
  /** Subscribe to MIDI messages */
  onMessage: (callback: MIDIMessageCallback) => () => void;
  /** Send raw MIDI data to an output device */
  send: (outputId: string, data: number[]) => void;
  /** Send Note On message */
  noteOn: (outputId: string, channel: number, note: number, velocity: number) => void;
  /** Send Note Off message */
  noteOff: (outputId: string, channel: number, note: number) => void;
  /** Send Control Change message */
  controlChange: (outputId: string, channel: number, controller: number, value: number) => void;
}

export function useMIDI(): UseMIDIReturn {
  const [devices, setDevices] = createSignal<MIDIDevice[]>([]);
  const [isSupported, setIsSupported] = createSignal(false);

  onMount(() => {
    setIsSupported(typeof navigator.requestMIDIAccess === 'function');

    midiManager.initialize().then((success) => {
      if (success) {
        setDevices(midiManager.getDevices());
      }
    });

    const unsubscribe = midiManager.onDeviceChange(setDevices);
    onCleanup(unsubscribe);
  });

  return {
    devices,
    isSupported,
    onMessage: midiManager.onMessage.bind(midiManager),
    send: midiManager.send.bind(midiManager),
    noteOn: midiManager.noteOn.bind(midiManager),
    noteOff: midiManager.noteOff.bind(midiManager),
    controlChange: midiManager.controlChange.bind(midiManager),
  };
}
