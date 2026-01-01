/**
 * @fileoverview Drum Machine using Tone.js
 *
 * Pattern-based drum machine with sequencer and multiple drum sounds.
 */

import * as Tone from 'tone';

export type DrumSound = 'kick' | 'snare' | 'hihat' | 'clap' | 'tom' | 'cymbal';

export interface DrumPattern {
  [key: string]: boolean[];
}

export interface DrumMachineOptions {
  bpm?: number;
  steps?: number;
  swing?: number;
}

export interface DrumMachineCallbacks {
  onStep?: (step: number) => void;
  onPatternEnd?: () => void;
}

class DrumMachine {
  private synths: Map<DrumSound, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth> =
    new Map();
  private sequence: Tone.Sequence | null = null;
  private initialized = false;
  private callbacks: DrumMachineCallbacks = {};
  private pattern: DrumPattern = {};
  private steps = 16;
  private currentStep = 0;

  async initialize(options: DrumMachineOptions = {}): Promise<void> {
    if (this.initialized) return;

    await Tone.start();

    this.steps = options.steps ?? 16;
    if (options.bpm) {
      Tone.getTransport().bpm.value = options.bpm;
    }
    if (options.swing !== undefined) {
      Tone.getTransport().swing = options.swing;
      Tone.getTransport().swingSubdivision = '16n';
    }

    this.createSynths();
    this.initializePattern();
    this.initialized = true;
  }

  private createSynths(): void {
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).toDestination();
    kick.volume.value = -6;

    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination();
    snare.volume.value = -10;

    const hihat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    hihat.frequency.value = 200;
    hihat.volume.value = -20;

    const clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination();
    clap.volume.value = -12;

    const tom = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.4 },
    }).toDestination();
    tom.volume.value = -8;

    const cymbal = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
      harmonicity: 8.1,
      modulationIndex: 40,
      resonance: 5000,
      octaves: 2,
    }).toDestination();
    cymbal.frequency.value = 300;
    cymbal.volume.value = -18;

    this.synths.set('kick', kick);
    this.synths.set('snare', snare);
    this.synths.set('hihat', hihat);
    this.synths.set('clap', clap);
    this.synths.set('tom', tom);
    this.synths.set('cymbal', cymbal);
  }

  private initializePattern(): void {
    const sounds: DrumSound[] = ['kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal'];
    for (const sound of sounds) {
      this.pattern[sound] = new Array(this.steps).fill(false);
    }
  }

  setBpm(bpm: number): void {
    const clampedBpm = Math.max(20, Math.min(300, bpm));
    Tone.getTransport().bpm.value = clampedBpm;
  }

  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  setSwing(swing: number): void {
    Tone.getTransport().swing = Math.max(0, Math.min(1, swing));
  }

  setStep(sound: DrumSound, step: number, active: boolean): void {
    if (this.pattern[sound] && step >= 0 && step < this.steps) {
      this.pattern[sound][step] = active;
    }
  }

  toggleStep(sound: DrumSound, step: number): void {
    if (this.pattern[sound] && step >= 0 && step < this.steps) {
      this.pattern[sound][step] = !this.pattern[sound][step];
    }
  }

  getPattern(): DrumPattern {
    return { ...this.pattern };
  }

  setPattern(pattern: DrumPattern): void {
    this.pattern = { ...pattern };
  }

  clearPattern(): void {
    this.initializePattern();
  }

  triggerSound(sound: DrumSound, time?: Tone.Unit.Time): void {
    const synth = this.synths.get(sound);
    if (!synth) return;

    const triggerTime = time ?? Tone.now();

    if (synth instanceof Tone.MembraneSynth) {
      const note = sound === 'kick' ? 'C1' : 'G2';
      synth.triggerAttackRelease(note, '8n', triggerTime);
    } else if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease('16n', triggerTime);
    } else if (synth instanceof Tone.MetalSynth) {
      synth.triggerAttackRelease('16n', triggerTime);
    }
  }

  start(): void {
    if (!this.initialized) return;

    // 성능: 기존 sequence가 있으면 dispose하여 메모리 누수 방지
    if (this.sequence) {
      this.sequence.stop();
      this.sequence.dispose();
      this.sequence = null;
    }

    this.currentStep = 0;

    const stepIndices = Array.from({ length: this.steps }, (_, i) => i);

    this.sequence = new Tone.Sequence(
      (time, step) => {
        this.currentStep = step;

        for (const [sound, steps] of Object.entries(this.pattern)) {
          if (steps[step]) {
            this.triggerSound(sound as DrumSound, time);
          }
        }

        Tone.getDraw().schedule(() => {
          this.callbacks.onStep?.(step);
          if (step === this.steps - 1) {
            this.callbacks.onPatternEnd?.();
          }
        }, time);
      },
      stepIndices,
      '16n',
    );

    this.sequence.start(0);
    Tone.getTransport().start();
  }

  stop(): void {
    if (this.sequence) {
      this.sequence.stop();
      this.sequence.dispose();
      this.sequence = null;
    }
    Tone.getTransport().stop();
    this.currentStep = 0;
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

  getCurrentStep(): number {
    return this.currentStep;
  }

  setCallbacks(callbacks: DrumMachineCallbacks): void {
    this.callbacks = callbacks;
  }

  setVolume(sound: DrumSound, volume: number): void {
    const synth = this.synths.get(sound);
    if (synth) {
      synth.volume.value = volume;
    }
  }

  dispose(): void {
    this.stop();
    for (const synth of this.synths.values()) {
      synth.dispose();
    }
    this.synths.clear();
    this.initialized = false;
  }
}

export const drumMachine = new DrumMachine();
