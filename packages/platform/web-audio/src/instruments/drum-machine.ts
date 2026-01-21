/**
 * @fileoverview Drum Machine using Tone.js
 * @module @soundblue/web-audio/instruments/drum-machine
 *
 * A pattern-based drum machine with step sequencer and multiple synthesized drum sounds.
 * Uses Tone.js for audio synthesis and scheduling with high precision timing.
 *
 * ## Architecture
 *
 * The drum machine uses three types of Tone.js synthesizers:
 * - **MembraneSynth**: For tonal percussion (kick, tom) - simulates drum membrane vibration
 * - **NoiseSynth**: For non-tonal sounds (snare, clap) - uses white/pink noise generators
 * - **MetalSynth**: For metallic sounds (hihat, cymbal) - uses FM synthesis with harmonics
 *
 * ## Audio Routing
 *
 * ```
 * DrumMachine
 *   ├── kick   (MembraneSynth, C1, -6dB)  ──┐
 *   ├── snare  (NoiseSynth, white, -10dB) ─┤
 *   ├── hihat  (MetalSynth, 200Hz, -20dB) ─┼── toDestination()
 *   ├── clap   (NoiseSynth, pink, -12dB)  ─┤
 *   ├── tom    (MembraneSynth, G2, -8dB)  ─┤
 *   └── cymbal (MetalSynth, 300Hz, -18dB) ─┘
 * ```
 *
 * ## Timing System
 *
 * Uses Tone.js Transport for sample-accurate timing:
 * - BPM range: 20-300
 * - Default subdivision: 16th notes ('16n')
 * - Optional swing timing with configurable subdivision
 *
 * @example
 * ```typescript
 * import { drumMachine } from '@soundblue/web-audio';
 *
 * // Initialize with options
 * await drumMachine.initialize({ bpm: 120, steps: 16, swing: 0.3 });
 *
 * // Set up a basic pattern
 * drumMachine.setStep('kick', 0, true);   // Kick on beat 1
 * drumMachine.setStep('kick', 8, true);   // Kick on beat 3
 * drumMachine.setStep('snare', 4, true);  // Snare on beat 2
 * drumMachine.setStep('snare', 12, true); // Snare on beat 4
 * drumMachine.setStep('hihat', 0, true);  // Hi-hat pattern
 * drumMachine.setStep('hihat', 2, true);
 * drumMachine.setStep('hihat', 4, true);
 *
 * // Listen for step changes
 * drumMachine.setCallbacks({
 *   onStep: (step) => console.log(`Step: ${step}`),
 *   onPatternEnd: () => console.log('Pattern looped'),
 * });
 *
 * // Play the pattern
 * drumMachine.start();
 *
 * // Clean up when done
 * drumMachine.dispose();
 * ```
 */

import * as Tone from 'tone';

/**
 * Available drum sound types.
 *
 * Each sound uses a specific synthesizer type optimized for its characteristics:
 * | Sound   | Synth Type      | Description                              |
 * |---------|-----------------|------------------------------------------|
 * | kick    | MembraneSynth   | Deep bass drum with pitch decay          |
 * | snare   | NoiseSynth      | White noise with sharp envelope          |
 * | hihat   | MetalSynth      | High-frequency metallic sound            |
 * | clap    | NoiseSynth      | Pink noise with double attack            |
 * | tom     | MembraneSynth   | Mid-range tonal percussion               |
 * | cymbal  | MetalSynth      | Sustained metallic resonance             |
 *
 * @example
 * ```typescript
 * const sound: DrumSound = 'kick';
 * drumMachine.triggerSound(sound);
 * ```
 */
export type DrumSound = 'kick' | 'snare' | 'hihat' | 'clap' | 'tom' | 'cymbal';

/**
 * Complete pattern data structure with all drum sounds required.
 *
 * Use this type when you need a fully populated pattern with all drum sounds.
 */
export type CompleteDrumPattern = {
  [K in DrumSound]: boolean[];
};

/**
 * Pattern data structure for the step sequencer.
 *
 * Maps each drum sound to an array of boolean values representing active steps.
 * Array length equals the number of steps (default: 16).
 *
 * Uses Record<DrumSound, boolean[]> for type safety while allowing
 * partial initialization during runtime.
 *
 * @example
 * ```typescript
 * const pattern: DrumPattern = {
 *   kick:   [true, false, false, false, true, false, false, false, ...],
 *   snare:  [false, false, false, false, true, false, false, false, ...],
 *   hihat:  [true, false, true, false, true, false, true, false, ...],
 *   clap:   [false, false, false, false, false, false, false, false, ...],
 *   tom:    [false, false, false, false, false, false, false, false, ...],
 *   cymbal: [false, false, false, false, false, false, false, false, ...],
 * };
 *
 * drumMachine.setPattern(pattern);
 * ```
 */
export type DrumPattern = Partial<Record<DrumSound, boolean[]>>;

/**
 * Configuration options for initializing the drum machine.
 *
 * @property bpm - Tempo in beats per minute (20-300). Default: Transport default (120)
 * @property steps - Number of steps in the pattern (typically 8, 16, or 32). Default: 16
 * @property swing - Swing amount from 0 (straight) to 1 (heavy swing). Default: 0
 *
 * @example
 * ```typescript
 * // Hip-hop style: slower tempo with swing
 * const options: DrumMachineOptions = {
 *   bpm: 90,
 *   steps: 16,
 *   swing: 0.5,
 * };
 *
 * // EDM style: fast tempo, straight timing
 * const edmOptions: DrumMachineOptions = {
 *   bpm: 140,
 *   steps: 32,
 *   swing: 0,
 * };
 * ```
 */
export interface DrumMachineOptions {
  bpm?: number;
  steps?: number;
  swing?: number;
}

/**
 * Callback functions for drum machine events.
 *
 * These callbacks are synchronized with the audio timing using Tone.Draw,
 * ensuring visual updates align with audio playback.
 *
 * @property onStep - Called on each step with the current step index (0-based)
 * @property onPatternEnd - Called when the pattern loops back to step 0
 *
 * @example
 * ```typescript
 * const callbacks: DrumMachineCallbacks = {
 *   onStep: (step) => {
 *     // Update UI - highlight current step
 *     document.querySelectorAll('.step').forEach((el, i) => {
 *       el.classList.toggle('active', i === step);
 *     });
 *   },
 *   onPatternEnd: () => {
 *     console.log('Pattern completed one loop');
 *   },
 * };
 *
 * drumMachine.setCallbacks(callbacks);
 * ```
 */
export interface DrumMachineCallbacks {
  onStep?: (step: number) => void;
  onPatternEnd?: () => void;
}

/**
 * Pattern-based drum machine with step sequencer and multiple synthesized drum sounds.
 *
 * Uses Tone.js for high-precision audio scheduling and synthesis.
 * Supports 6 drum sounds, swing timing, and real-time pattern editing.
 *
 * ## Lifecycle
 *
 * 1. **initialize()** - Set up audio context and synthesizers
 * 2. **setPattern()** or **setStep()** - Configure the pattern
 * 3. **start()** / **stop()** / **toggle()** - Control playback
 * 4. **dispose()** - Clean up resources
 *
 * ## Thread Safety
 *
 * The drum machine uses Tone.js Transport for timing, which operates on the
 * Web Audio API's dedicated audio thread. Pattern modifications are safe to
 * make during playback - changes take effect on the next step.
 *
 * ## Memory Management
 *
 * Always call `dispose()` when finished to release audio resources.
 * Failing to dispose will cause memory leaks from retained synthesizers.
 *
 * @example
 * ```typescript
 * import { drumMachine } from '@soundblue/web-audio';
 *
 * async function playDrumPattern() {
 *   // Must initialize before use (sets up audio context)
 *   await drumMachine.initialize({ bpm: 120 });
 *
 *   // Create a basic rock beat
 *   drumMachine.setStep('kick', 0, true);
 *   drumMachine.setStep('kick', 8, true);
 *   drumMachine.setStep('snare', 4, true);
 *   drumMachine.setStep('snare', 12, true);
 *
 *   // Start playback
 *   drumMachine.start();
 *
 *   // Stop after 4 bars (4 seconds at 120 BPM)
 *   setTimeout(() => {
 *     drumMachine.stop();
 *     drumMachine.dispose();
 *   }, 4000);
 * }
 * ```
 */
class DrumMachine {
  private synths: Map<DrumSound, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth> =
    new Map();
  private sequence: Tone.Sequence | null = null;
  private initialized = false;
  private callbacks: DrumMachineCallbacks = {};
  private pattern: DrumPattern = {};
  private steps = 16;
  private currentStep = 0;

  /**
   * Initializes the drum machine, creating synthesizers and setting up the audio context.
   *
   * Must be called before any other methods. This method:
   * 1. Starts the Tone.js audio context (requires user interaction in browsers)
   * 2. Creates all 6 drum synthesizers with optimized settings
   * 3. Initializes an empty pattern with the specified number of steps
   *
   * @param options - Configuration options for the drum machine
   * @returns Promise that resolves when initialization is complete
   *
   * @example
   * ```typescript
   * // Basic initialization
   * await drumMachine.initialize();
   *
   * // With custom settings
   * await drumMachine.initialize({
   *   bpm: 90,
   *   steps: 32,
   *   swing: 0.3,
   * });
   * ```
   *
   * @remarks
   * - Safe to call multiple times (subsequent calls are no-ops if already initialized)
   * - Must be triggered by user interaction (click/touch) due to browser autoplay policies
   * - Call `dispose()` before re-initializing with different settings
   */
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

  /**
   * Sets the tempo in beats per minute (BPM).
   *
   * Values are clamped to the valid range of 20-300 BPM.
   * Can be called during playback for smooth tempo changes.
   *
   * @param bpm - Tempo in beats per minute (clamped to 20-300)
   *
   * @example
   * ```typescript
   * drumMachine.setBpm(120);  // Standard tempo
   * drumMachine.setBpm(90);   // Hip-hop tempo
   * drumMachine.setBpm(140);  // EDM tempo
   * drumMachine.setBpm(1000); // Clamped to 300
   * ```
   */
  setBpm(bpm: number): void {
    const clampedBpm = Math.max(20, Math.min(300, bpm));
    Tone.getTransport().bpm.value = clampedBpm;
  }

  /**
   * Gets the current tempo in beats per minute.
   *
   * @returns Current BPM value
   *
   * @example
   * ```typescript
   * const currentBpm = drumMachine.getBpm();
   * console.log(`Current tempo: ${currentBpm} BPM`);
   * ```
   */
  getBpm(): number {
    return Tone.getTransport().bpm.value;
  }

  /**
   * Sets the swing amount for shuffle/groove feel.
   *
   * Swing delays every other 16th note to create a triplet-like feel.
   * Values are clamped to 0-1 range.
   *
   * @param swing - Swing amount from 0 (straight) to 1 (heavy swing)
   *
   * @example
   * ```typescript
   * drumMachine.setSwing(0);    // Straight timing (electronic)
   * drumMachine.setSwing(0.3);  // Light swing (funk)
   * drumMachine.setSwing(0.5);  // Medium swing (jazz)
   * drumMachine.setSwing(0.7);  // Heavy swing (shuffle)
   * ```
   */
  setSwing(swing: number): void {
    Tone.getTransport().swing = Math.max(0, Math.min(1, swing));
  }

  /**
   * Sets a specific step in the pattern to active or inactive.
   *
   * Changes take effect on the next occurrence of that step during playback.
   * No-op if the step index is out of bounds.
   *
   * @param sound - The drum sound to modify
   * @param step - Step index (0-based, must be less than total steps)
   * @param active - Whether the step should trigger the sound
   *
   * @example
   * ```typescript
   * // Create a four-on-the-floor kick pattern
   * drumMachine.setStep('kick', 0, true);   // Beat 1
   * drumMachine.setStep('kick', 4, true);   // Beat 2
   * drumMachine.setStep('kick', 8, true);   // Beat 3
   * drumMachine.setStep('kick', 12, true);  // Beat 4
   *
   * // Remove a step
   * drumMachine.setStep('kick', 8, false);
   * ```
   */
  setStep(sound: DrumSound, step: number, active: boolean): void {
    if (this.pattern[sound] && step >= 0 && step < this.steps) {
      this.pattern[sound][step] = active;
    }
  }

  /**
   * Toggles a step between active and inactive states.
   *
   * Convenience method for UI interactions where clicking a step
   * should toggle its state.
   *
   * @param sound - The drum sound to modify
   * @param step - Step index (0-based)
   *
   * @example
   * ```typescript
   * // In a click handler for step buttons
   * stepButton.addEventListener('click', () => {
   *   drumMachine.toggleStep('snare', stepIndex);
   * });
   * ```
   */
  toggleStep(sound: DrumSound, step: number): void {
    if (this.pattern[sound] && step >= 0 && step < this.steps) {
      this.pattern[sound][step] = !this.pattern[sound][step];
    }
  }

  /**
   * Gets a copy of the current pattern.
   *
   * Returns a shallow copy to prevent external mutations.
   * Use this for saving patterns or UI state synchronization.
   *
   * @returns Copy of the current drum pattern
   *
   * @example
   * ```typescript
   * // Save pattern to localStorage
   * const pattern = drumMachine.getPattern();
   * localStorage.setItem('savedPattern', JSON.stringify(pattern));
   *
   * // Later, restore it
   * const saved = JSON.parse(localStorage.getItem('savedPattern'));
   * drumMachine.setPattern(saved);
   * ```
   */
  getPattern(): DrumPattern {
    return { ...this.pattern };
  }

  /**
   * Replaces the entire pattern with a new one.
   *
   * Use this for loading saved patterns or applying presets.
   * The pattern object is copied to prevent external mutations.
   *
   * @param pattern - New pattern to apply
   *
   * @example
   * ```typescript
   * // Load a preset pattern
   * const rockBeat: DrumPattern = {
   *   kick: [true, false, false, false, true, false, false, false, ...],
   *   snare: [false, false, false, false, true, false, false, false, ...],
   *   hihat: [true, false, true, false, true, false, true, false, ...],
   *   clap: new Array(16).fill(false),
   *   tom: new Array(16).fill(false),
   *   cymbal: new Array(16).fill(false),
   * };
   * drumMachine.setPattern(rockBeat);
   * ```
   */
  setPattern(pattern: DrumPattern): void {
    this.pattern = { ...pattern };
  }

  /**
   * Clears all steps in the pattern (sets all to false).
   *
   * Useful for starting fresh or implementing a "clear" button.
   *
   * @example
   * ```typescript
   * // Clear button handler
   * clearButton.addEventListener('click', () => {
   *   drumMachine.clearPattern();
   * });
   * ```
   */
  clearPattern(): void {
    this.initializePattern();
  }

  /**
   * Triggers a single drum sound immediately or at a scheduled time.
   *
   * Useful for:
   * - Preview sounds when selecting drums
   * - Manual triggering via pads/keys
   * - Custom sequencing logic
   *
   * @param sound - The drum sound to trigger
   * @param time - Optional scheduled time (Tone.js time format). Defaults to now.
   *
   * @example
   * ```typescript
   * // Immediate trigger (for pad hits)
   * drumMachine.triggerSound('kick');
   *
   * // Scheduled trigger (for custom sequencing)
   * const time = Tone.now() + 0.5;  // 500ms from now
   * drumMachine.triggerSound('snare', time);
   *
   * // Preview all sounds
   * const sounds: DrumSound[] = ['kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal'];
   * sounds.forEach((sound, i) => {
   *   drumMachine.triggerSound(sound, Tone.now() + i * 0.3);
   * });
   * ```
   */
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

  /**
   * Starts playback of the pattern from the beginning.
   *
   * Creates a new Tone.js Sequence and starts the Transport.
   * The pattern loops continuously until `stop()` is called.
   *
   * @remarks
   * - No-op if not initialized
   * - Automatically disposes previous sequence to prevent memory leaks
   * - Resets current step to 0
   * - Callbacks are synchronized with audio timing via Tone.Draw
   *
   * @example
   * ```typescript
   * // Basic usage
   * drumMachine.start();
   *
   * // With UI feedback
   * drumMachine.setCallbacks({
   *   onStep: (step) => highlightStep(step),
   * });
   * drumMachine.start();
   * ```
   */
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

  /**
   * Stops playback and resets to step 0.
   *
   * Disposes the current sequence and stops the Transport.
   * Safe to call even if not currently playing.
   *
   * @example
   * ```typescript
   * // Stop playback
   * drumMachine.stop();
   *
   * // In a stop button handler
   * stopButton.addEventListener('click', () => {
   *   drumMachine.stop();
   *   updatePlayButtonIcon('play');
   * });
   * ```
   */
  stop(): void {
    if (this.sequence) {
      this.sequence.stop();
      this.sequence.dispose();
      this.sequence = null;
    }
    Tone.getTransport().stop();
    this.currentStep = 0;
  }

  /**
   * Toggles between playing and stopped states.
   *
   * Convenience method for play/pause button implementations.
   *
   * @example
   * ```typescript
   * // Play/pause button
   * playPauseButton.addEventListener('click', () => {
   *   drumMachine.toggle();
   *   updatePlayButtonIcon(drumMachine.isPlaying() ? 'pause' : 'play');
   * });
   *
   * // Keyboard shortcut
   * document.addEventListener('keydown', (e) => {
   *   if (e.code === 'Space') {
   *     e.preventDefault();
   *     drumMachine.toggle();
   *   }
   * });
   * ```
   */
  toggle(): void {
    if (Tone.getTransport().state === 'started') {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Checks if the drum machine is currently playing.
   *
   * @returns `true` if playing, `false` if stopped
   *
   * @example
   * ```typescript
   * if (drumMachine.isPlaying()) {
   *   console.log('Currently playing');
   * }
   *
   * // Update UI based on state
   * const icon = drumMachine.isPlaying() ? 'pause' : 'play';
   * playButton.innerHTML = icons[icon];
   * ```
   */
  isPlaying(): boolean {
    return Tone.getTransport().state === 'started';
  }

  /**
   * Gets the current step index (0-based).
   *
   * Useful for synchronizing external UI elements with playback.
   * Note: For real-time UI updates, prefer using the `onStep` callback.
   *
   * @returns Current step index (0 to steps-1)
   *
   * @example
   * ```typescript
   * const step = drumMachine.getCurrentStep();
   * console.log(`Currently at step ${step + 1} of ${16}`);
   * ```
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Sets callback functions for playback events.
   *
   * Callbacks are synchronized with audio timing using Tone.Draw,
   * ensuring visual updates align perfectly with sound output.
   *
   * @param callbacks - Object containing callback functions
   *
   * @example
   * ```typescript
   * drumMachine.setCallbacks({
   *   onStep: (step) => {
   *     // Update step indicator
   *     steps.forEach((el, i) => {
   *       el.classList.toggle('current', i === step);
   *     });
   *   },
   *   onPatternEnd: () => {
   *     // Log or update loop counter
   *     loopCount++;
   *     updateLoopDisplay(loopCount);
   *   },
   * });
   * ```
   */
  setCallbacks(callbacks: DrumMachineCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Sets the volume for a specific drum sound.
   *
   * Volume is specified in decibels (dB).
   * Typical range: -60 (silent) to 0 (full volume).
   *
   * @param sound - The drum sound to adjust
   * @param volume - Volume in decibels (dB)
   *
   * @example
   * ```typescript
   * // Set individual volumes
   * drumMachine.setVolume('kick', -6);    // Slightly reduced
   * drumMachine.setVolume('snare', -10);  // Quieter
   * drumMachine.setVolume('hihat', -20);  // Much quieter
   *
   * // Mute a sound
   * drumMachine.setVolume('tom', -Infinity);
   *
   * // Full volume
   * drumMachine.setVolume('cymbal', 0);
   * ```
   */
  setVolume(sound: DrumSound, volume: number): void {
    const synth = this.synths.get(sound);
    if (synth) {
      synth.volume.value = volume;
    }
  }

  /**
   * Releases all audio resources and resets the drum machine.
   *
   * **Must be called when finished** to prevent memory leaks.
   * After calling dispose, you must call `initialize()` again to use.
   *
   * This method:
   * 1. Stops playback
   * 2. Disposes all synthesizers
   * 3. Clears the synth map
   * 4. Resets initialization state
   *
   * @example
   * ```typescript
   * // Clean up when component unmounts (React)
   * useEffect(() => {
   *   drumMachine.initialize();
   *
   *   return () => {
   *     drumMachine.dispose();
   *   };
   * }, []);
   *
   * // Clean up before page unload
   * window.addEventListener('beforeunload', () => {
   *   drumMachine.dispose();
   * });
   * ```
   */
  dispose(): void {
    this.stop();
    for (const synth of this.synths.values()) {
      synth.dispose();
    }
    this.synths.clear();
    this.initialized = false;
  }
}

/**
 * Singleton instance of the DrumMachine.
 *
 * Use this pre-created instance for most use cases.
 * For multiple independent drum machines, create new instances of the class.
 *
 * @example
 * ```typescript
 * import { drumMachine } from '@soundblue/web-audio';
 *
 * // Initialize on user interaction
 * document.getElementById('start')?.addEventListener('click', async () => {
 *   await drumMachine.initialize({ bpm: 120 });
 *   drumMachine.start();
 * });
 * ```
 */
export const drumMachine = new DrumMachine();
