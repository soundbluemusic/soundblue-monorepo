/**
 * @fileoverview Metronome using Tone.js
 *
 * High-precision metronome with Transport-synchronized timing.
 */

import * as Tone from 'tone';

export interface MetronomeOptions {
  bpm?: number;
  beatsPerBar?: number;
  accentFirst?: boolean;
  volume?: number;
}

export interface MetronomeCallbacks {
  onBeat?: (beat: number, bar: number) => void;
  onStart?: () => void;
  onStop?: () => void;
}

class Metronome {
  private synth: Tone.MembraneSynth | null = null;
  private loop: Tone.Loop | null = null;
  private initialized = false;
  private callbacks: MetronomeCallbacks = {};
  private beatsPerBar = 4;
  private accentFirst = true;
  private currentBeat = 0;
  private currentBar = 0;

  async initialize(options: MetronomeOptions = {}): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    this.beatsPerBar = options.beatsPerBar ?? 4;
    this.accentFirst = options.accentFirst ?? true;

    this.synth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.1,
      },
    }).toDestination();

    if (options.volume !== undefined) {
      this.synth.volume.value = options.volume;
    }

    if (options.bpm) {
      Tone.getTransport().bpm.value = options.bpm;
    }

    this.initialized = true;
  }

  setBpm(bpm: number): void {
    const clampedBpm = Math.max(20, Math.min(300, bpm));
    Tone.getTransport().bpm.value = clampedBpm;
  }

  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  setVolume(volume: number): void {
    if (this.synth) {
      this.synth.volume.value = volume;
    }
  }

  setBeatsPerBar(beats: number): void {
    this.beatsPerBar = beats;
  }

  setAccentFirst(accent: boolean): void {
    this.accentFirst = accent;
  }

  start(): void {
    if (!this.initialized || !this.synth) return;

    this.currentBeat = 0;
    this.currentBar = 0;

    this.loop = new Tone.Loop((time) => {
      const isAccent = this.accentFirst && this.currentBeat === 0;
      const note = isAccent ? 'C3' : 'C2';
      const velocity = isAccent ? 1 : 0.7;

      this.synth?.triggerAttackRelease(note, '16n', time, velocity);

      Tone.getDraw().schedule(() => {
        this.callbacks.onBeat?.(this.currentBeat, this.currentBar);
      }, time);

      this.currentBeat++;
      if (this.currentBeat >= this.beatsPerBar) {
        this.currentBeat = 0;
        this.currentBar++;
      }
    }, '4n');

    this.loop.start(0);
    Tone.getTransport().start();
    this.callbacks.onStart?.();
  }

  stop(): void {
    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }

    Tone.getTransport().stop();
    this.currentBeat = 0;
    this.currentBar = 0;
    this.callbacks.onStop?.();
  }

  toggle(): void {
    if (Tone.getTransport().state === 'started') {
      this.stop();
    } else {
      this.start();
    }
  }

  isPlaying(): boolean {
    return Tone.getTransport().state === 'started';
  }

  setCallbacks(callbacks: MetronomeCallbacks): void {
    this.callbacks = callbacks;
  }

  getCurrentBeat(): number {
    return this.currentBeat;
  }

  getCurrentBar(): number {
    return this.currentBar;
  }

  dispose(): void {
    this.stop();
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.initialized = false;
  }
}

export const metronome = new Metronome();
