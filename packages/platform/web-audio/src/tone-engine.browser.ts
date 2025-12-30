/**
 * @fileoverview Tone.js Audio Engine
 *
 * Provides a unified audio engine using Tone.js for precise timing,
 * transport control, and cross-browser compatibility.
 */

import * as Tone from 'tone';

export interface ToneEngineState {
  isInitialized: boolean;
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  currentBar: number;
}

export interface ToneEngineCallbacks {
  onBeat?: (beat: number, bar: number) => void;
  onStateChange?: (state: ToneEngineState) => void;
}

class ToneEngine {
  private initialized = false;
  private callbacks: ToneEngineCallbacks = {};
  private beatCount = 0;
  private barCount = 0;
  private beatLoop: Tone.Loop | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();
    this.initialized = true;
    this.notifyStateChange();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  setBpm(bpm: number): void {
    const clampedBpm = Math.max(20, Math.min(300, bpm));
    Tone.getTransport().bpm.value = clampedBpm;
    this.notifyStateChange();
  }

  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  play(): void {
    if (!this.initialized) return;
    Tone.getTransport().start();
    this.notifyStateChange();
  }

  pause(): void {
    Tone.getTransport().pause();
    this.notifyStateChange();
  }

  stop(): void {
    Tone.getTransport().stop();
    this.beatCount = 0;
    this.barCount = 0;
    this.notifyStateChange();
  }

  isPlaying(): boolean {
    return Tone.getTransport().state === 'started';
  }

  startBeatLoop(beatsPerBar = 4): Tone.Loop {
    if (this.beatLoop) {
      this.beatLoop.dispose();
    }

    this.beatLoop = new Tone.Loop((_time) => {
      this.beatCount = (this.beatCount + 1) % beatsPerBar;
      if (this.beatCount === 0) {
        this.barCount++;
      }

      this.callbacks.onBeat?.(this.beatCount, this.barCount);
      this.notifyStateChange();
    }, '4n');

    this.beatLoop.start(0);
    return this.beatLoop;
  }

  stopBeatLoop(): void {
    if (this.beatLoop) {
      this.beatLoop.stop();
      this.beatLoop.dispose();
      this.beatLoop = null;
    }
  }

  setCallbacks(callbacks: ToneEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.({
      isInitialized: this.initialized,
      isPlaying: this.isPlaying(),
      bpm: this.getBpm(),
      currentBeat: this.beatCount,
      currentBar: this.barCount,
    });
  }

  getState(): ToneEngineState {
    return {
      isInitialized: this.initialized,
      isPlaying: this.isPlaying(),
      bpm: this.getBpm(),
      currentBeat: this.beatCount,
      currentBar: this.barCount,
    };
  }

  dispose(): void {
    this.stopBeatLoop();
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }
}

export const toneEngine = new ToneEngine();

export { Tone };
