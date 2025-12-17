/**
 * ========================================
 * Audio Engine Manager
 * ========================================
 *
 * Core audio infrastructure for the SoundBlueMusic platform.
 * Manages AudioContext, AudioWorklet, and WASM integration.
 *
 * ## Architecture Overview
 *
 * The Audio Engine uses a **multi-threaded architecture** to ensure
 * glitch-free audio processing:
 *
 * ```
 * ┌─────────────────┐    SharedArrayBuffer    ┌─────────────────┐
 * │   Main Thread   │ ◄──────────────────────► │  Audio Thread   │
 * │  (UI, SolidJS)  │     (lock-free comms)    │  (AudioWorklet) │
 * └─────────────────┘                          └─────────────────┘
 *        │                                             │
 *        ▼                                             ▼
 * ┌─────────────────┐                          ┌─────────────────┐
 * │  AudioContext   │ ─────connects to──────── │ AudioWorkletNode│
 * │  (sample rate,  │                          │ (real-time DSP) │
 * │   scheduling)   │                          └─────────────────┘
 * └─────────────────┘
 * ```
 *
 * ## Why SharedArrayBuffer + Atomics?
 *
 * Audio processing runs on a separate thread (AudioWorklet) that must
 * NEVER be blocked - any delay causes audible glitches. Traditional
 * message passing (postMessage) is too slow for real-time meter updates.
 *
 * SharedArrayBuffer allows **zero-copy** communication:
 * - The AudioWorklet writes meter levels directly to shared memory
 * - The main thread reads values without any copying or blocking
 * - Atomics ensure thread-safe reads/writes without locks
 *
 * ## Float Storage Strategy
 *
 * Atomics only works with integer types (Int32Array, etc.). To store
 * floating-point audio levels (0.0 - 1.0), we scale them to integers:
 *
 * ```typescript
 * // Writing (AudioWorklet thread)
 * const scaledValue = Math.round(floatValue * 1000000);
 * Atomics.store(sharedState, index, scaledValue);
 *
 * // Reading (Main thread)
 * const floatValue = Atomics.load(sharedState, index) / 1000000;
 * ```
 *
 * SCALE_FACTOR of 1,000,000 provides 6 decimal places of precision,
 * more than sufficient for audio levels.
 *
 * ## Node Graph
 *
 * ```
 * [AudioWorkletNode] → [AnalyserNode] → [GainNode (master)] → [destination]
 *                           │
 *                           ▼
 *                    (FFT for visualizations)
 * ```
 *
 * @module engine/audio-engine
 * @see {@link DAWAudioProcessor} - The AudioWorklet processor implementation
 * @see {@link audioStore} - SolidJS store for UI reactivity
 */

/**
 * Configuration options for the audio engine.
 *
 * @example
 * ```typescript
 * await audioEngine.initialize({
 *   sampleRate: 48000,  // Professional audio quality
 *   bufferSize: 256     // Low latency (~5ms)
 * });
 * ```
 */
export interface AudioEngineOptions {
  /**
   * Sample rate in Hz. Default: 48000 (DVD quality)
   * Common values: 44100 (CD), 48000 (professional), 96000 (high-res)
   */
  sampleRate?: number;

  /**
   * Buffer size in samples. Smaller = lower latency but higher CPU.
   * Note: Actual buffer size is determined by the AudioContext.
   * Common values: 128 (ultra-low), 256 (low), 512 (balanced), 1024 (safe)
   */
  bufferSize?: number;
}

/**
 * Messages received from the AudioWorklet processor.
 *
 * The AudioWorklet communicates back to the main thread via MessagePort.
 * While meter updates use SharedArrayBuffer for performance, other
 * messages (ready, error) use the message channel.
 *
 * @internal
 */
interface WorkletMessage {
  /** Message type identifier */
  type: 'ready' | 'error' | 'meter';
  /** Error message when type is 'error' */
  error?: string;
  /** Left channel meter level (0-1) when type is 'meter' */
  left?: number;
  /** Right channel meter level (0-1) when type is 'meter' */
  right?: number;
}

/**
 * Runtime information about the audio engine state.
 *
 * Use `audioEngine.getInfo()` to retrieve current engine status,
 * useful for debugging and displaying audio diagnostics.
 *
 * @example
 * ```typescript
 * const info = audioEngine.getInfo();
 * console.log(`Sample rate: ${info.sampleRate}Hz`);
 * console.log(`Latency: ${(info.baseLatency + info.outputLatency) * 1000}ms`);
 * console.log(`State: ${info.state}`);
 * ```
 */
export interface AudioEngineInfo {
  /** Whether initialize() has completed successfully */
  isInitialized: boolean;
  /** Whether the AudioWorklet has loaded and signaled ready */
  isWorkletReady: boolean;
  /** Current sample rate in Hz */
  sampleRate: number;
  /** Base latency from AudioContext (inherent processing delay) */
  baseLatency: number;
  /** Output latency to speakers/headphones */
  outputLatency: number;
  /** AudioContext state: 'running', 'suspended', 'closed' */
  state: AudioContextState | 'closed';
}

/**
 * SharedArrayBuffer Memory Layout
 *
 * The shared state uses a fixed layout for thread-safe communication:
 *
 * | Index | Field       | Type    | Description                    |
 * |-------|-------------|---------|--------------------------------|
 * | 0     | isPlaying   | Int32   | Transport state (0=stopped, 1=playing) |
 * | 1     | bpm         | Int32   | Tempo in BPM (scaled integer)  |
 * | 2     | currentTime | Int32   | Playhead position (scaled)     |
 * | 3     | leftLevel   | Int32   | Left meter RMS (scaled 0-1M)   |
 * | 4     | rightLevel  | Int32   | Right meter RMS (scaled 0-1M)  |
 * | 5     | leftPeak    | Int32   | Left peak hold (scaled 0-1M)   |
 * | 6     | rightPeak   | Int32   | Right peak hold (scaled 0-1M)  |
 *
 * Total size: 7 × 4 bytes = 28 bytes
 */
const SHARED_STATE_SIZE = 7 * Int32Array.BYTES_PER_ELEMENT;

/**
 * Scale factor for storing floats as integers in SharedArrayBuffer.
 *
 * Since Atomics only works with integer types, we multiply floats
 * by this factor before storing, and divide when reading.
 *
 * Value of 1,000,000 provides 6 decimal places of precision:
 * - 0.123456 → stored as 123456
 * - Precision: ±0.000001 (more than enough for audio)
 *
 * @see Module documentation for full explanation of float storage strategy
 */
const SCALE_FACTOR = 1000000;

/**
 * Main audio engine class managing the Web Audio API infrastructure.
 *
 * This is a singleton class - use the exported `audioEngine` instance.
 * Do not instantiate directly.
 *
 * ## Lifecycle
 *
 * 1. Call `initialize()` on first user interaction (browser policy)
 * 2. Use `play()` / `stop()` for transport control
 * 3. Call `dispose()` when completely done (rarely needed)
 *
 * ## Usage Example
 *
 * ```typescript
 * import { audioEngine } from '@/engine/audio-engine';
 *
 * // Initialize on user gesture (required by browsers)
 * button.onclick = async () => {
 *   await audioEngine.initialize({ sampleRate: 48000 });
 *
 *   // Subscribe to meter updates
 *   audioEngine.onMeter((left, right) => {
 *     console.log(`Levels: L=${left.toFixed(2)} R=${right.toFixed(2)}`);
 *   });
 *
 *   // Start playback
 *   audioEngine.play();
 * };
 * ```
 *
 * ## Thread Safety
 *
 * The engine uses SharedArrayBuffer for communication with the AudioWorklet.
 * All shared state access uses Atomics for thread-safe operations.
 *
 * @see audioEngine - The singleton instance to use
 */
class AudioEngine {
  /** Web Audio API context - the foundation of all audio operations */
  private audioContext: AudioContext | null = null;

  /** AudioWorklet node running DSP on the audio thread */
  private workletNode: AudioWorkletNode | null = null;

  /** Master volume control node */
  private masterGain: GainNode | null = null;

  /** Analyser node for FFT/waveform visualization */
  private analyser: AnalyserNode | null = null;

  /** Shared memory buffer for lock-free thread communication */
  private sharedBuffer: SharedArrayBuffer | null = null;

  /** Int32 view into sharedBuffer for Atomics operations */
  private sharedState: Int32Array | null = null;

  /** Whether initialize() has completed successfully */
  private isInitialized = false;

  /** Whether the AudioWorklet has loaded and signaled ready */
  private isWorkletReady = false;

  /** Callback for meter level updates */
  private onMeterUpdate?: (left: number, right: number) => void;

  /** requestAnimationFrame ID for meter polling */
  private meterAnimationId?: number;

  /**
   * Initialize the audio engine.
   *
   * Must be called on a user gesture (click, touch) due to browser autoplay
   * policies. Safe to call multiple times - subsequent calls are no-ops.
   *
   * ## Initialization Steps
   *
   * 1. Creates AudioContext with specified sample rate
   * 2. Sets up audio node graph (worklet → analyser → gain → output)
   * 3. Allocates SharedArrayBuffer for thread communication
   * 4. Loads and connects the AudioWorklet processor
   *
   * @param options - Configuration options
   * @returns Promise that resolves when fully initialized
   * @throws Error if AudioContext or Worklet creation fails
   *
   * @example
   * ```typescript
   * // Call on button click (user gesture required)
   * await audioEngine.initialize({ sampleRate: 48000 });
   * ```
   */
  async initialize(options: AudioEngineOptions = {}): Promise<void> {
    if (this.isInitialized) return;

    const { sampleRate = 48000 } = options;

    try {
      // Create AudioContext
      this.audioContext = new AudioContext({
        sampleRate,
        latencyHint: 'interactive',
      });

      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // Create analyser for visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.connect(this.masterGain);

      // Setup SharedArrayBuffer for zero-copy communication
      if (typeof SharedArrayBuffer !== 'undefined') {
        this.sharedBuffer = new SharedArrayBuffer(SHARED_STATE_SIZE);
        this.sharedState = new Int32Array(this.sharedBuffer);
      }

      // Load AudioWorklet
      await this.loadWorklet();

      this.isInitialized = true;
    } catch (error: unknown) {
      console.error('Failed to initialize Audio Engine:', error);
      throw error;
    }
  }

  /**
   * Load and register the AudioWorklet processor.
   *
   * The AudioWorklet runs on a separate real-time audio thread,
   * ensuring glitch-free audio even when the main thread is busy.
   *
   * ## Process
   *
   * 1. Register the processor module with the AudioContext
   * 2. Create an AudioWorkletNode using the registered processor
   * 3. Connect the node to the audio graph
   * 4. Set up MessagePort for bidirectional communication
   * 5. Send the SharedArrayBuffer reference to the worklet
   *
   * ## Fallback
   *
   * If AudioWorklet is not supported, the engine continues without
   * real-time processing. A ScriptProcessorNode fallback could be
   * implemented but is deprecated.
   *
   * @private
   * @throws Logs error but does not throw - allows graceful degradation
   */
  private async loadWorklet(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Register worklet processor from bundled TypeScript file
      // Vite handles the URL resolution and bundling
      const workletUrl = new URL('./worklet/audio-processor.ts', import.meta.url);

      await this.audioContext.audioWorklet.addModule(workletUrl);

      // Create worklet node with stereo I/O configuration
      this.workletNode = new AudioWorkletNode(this.audioContext, 'daw-audio-processor', {
        numberOfInputs: 1, // Single stereo input
        numberOfOutputs: 1, // Single stereo output
        outputChannelCount: [2], // Force stereo output
      });

      // Connect: workletNode → analyser (→ masterGain → destination)
      this.workletNode.connect(this.analyser!);

      // Set up MessagePort for non-realtime communication
      this.workletNode.port.onmessage = (event) => {
        this.handleWorkletMessage(event.data);
      };

      // Send SharedArrayBuffer reference to the worklet thread
      // This enables zero-copy communication for meter updates
      if (this.sharedBuffer) {
        this.workletNode.port.postMessage({
          type: 'shared-buffer',
          sharedBuffer: this.sharedBuffer,
        });
      }

      this.isWorkletReady = true;
    } catch (error: unknown) {
      console.error('Failed to load AudioWorklet:', error);
      // Graceful degradation: engine works without worklet
      // Consider ScriptProcessorNode fallback (deprecated)
    }
  }

  /**
   * Handle messages from the AudioWorklet processor.
   *
   * Most real-time data (meter levels) comes through SharedArrayBuffer.
   * The message channel is used for:
   * - 'ready': Worklet has initialized
   * - 'error': An error occurred in the audio thread
   * - 'meter': Fallback meter data (when SharedArrayBuffer unavailable)
   *
   * @private
   * @param data - Message from the worklet
   */
  private handleWorkletMessage(data: WorkletMessage): void {
    // 'ready' messages are silently acknowledged
    if (data.type === 'error') {
      console.error('Worklet error:', data.error);
    }
    // 'meter' messages would be handled here if SharedArrayBuffer
    // is not available, but we currently rely on SharedArrayBuffer
  }

  /**
   * Start audio playback and transport.
   *
   * Resumes the AudioContext if suspended (browser autoplay policy),
   * sends play command to the worklet, and starts meter polling.
   *
   * @example
   * ```typescript
   * // After user gesture
   * audioEngine.play();
   * ```
   */
  play(): void {
    if (!this.audioContext || !this.workletNode) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.workletNode.port.postMessage({ type: 'play' });
    this.startMeterUpdates();
  }

  /**
   * Stop audio playback and reset transport.
   *
   * Sends stop command to the worklet and stops meter polling.
   * Does not close the AudioContext - use `dispose()` for that.
   *
   * @example
   * ```typescript
   * audioEngine.stop();
   * ```
   */
  stop(): void {
    if (!this.workletNode) return;

    this.workletNode.port.postMessage({ type: 'stop' });
    this.stopMeterUpdates();
  }

  /**
   * Set the master output volume.
   *
   * Uses Web Audio API's built-in parameter smoothing for
   * click-free volume changes.
   *
   * @param volume - Volume level (0.0 = silent, 1.0 = full volume)
   *
   * @example
   * ```typescript
   * audioEngine.setMasterVolume(0.8); // 80% volume
   * audioEngine.setMasterVolume(0);   // Mute
   * ```
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      // Clamp to valid range and schedule immediate change
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext!.currentTime
      );
    }
  }

  /**
   * Register a callback for meter level updates.
   *
   * The callback fires on each animation frame when playing,
   * receiving the current RMS levels for both channels.
   *
   * ## Performance
   *
   * Meter values are read from SharedArrayBuffer using Atomics,
   * providing zero-copy access to the latest values from the
   * audio thread.
   *
   * @param callback - Function called with (leftLevel, rightLevel)
   *                   Values are 0.0 - 1.0 RMS levels
   *
   * @example
   * ```typescript
   * audioEngine.onMeter((left, right) => {
   *   // Update VU meter visualization
   *   leftMeter.style.height = `${left * 100}%`;
   *   rightMeter.style.height = `${right * 100}%`;
   * });
   * ```
   */
  onMeter(callback: (left: number, right: number) => void): void {
    this.onMeterUpdate = callback;
  }

  /**
   * Start polling meter levels from SharedArrayBuffer.
   *
   * Uses requestAnimationFrame for smooth, display-synced updates.
   * Reads atomically from shared memory to get the latest values
   * written by the audio thread.
   *
   * ## Memory Layout Access
   *
   * - Index 3: Left channel RMS level (scaled integer)
   * - Index 4: Right channel RMS level (scaled integer)
   *
   * Values are divided by SCALE_FACTOR to convert back to floats.
   *
   * @private
   */
  private startMeterUpdates(): void {
    const updateMeter = () => {
      if (this.sharedState && this.onMeterUpdate) {
        // Read meter values atomically (thread-safe)
        // Convert scaled integers back to floats (0.0 - 1.0)
        const left = Atomics.load(this.sharedState, 3) / SCALE_FACTOR;
        const right = Atomics.load(this.sharedState, 4) / SCALE_FACTOR;
        this.onMeterUpdate(left, right);
      }
      // Schedule next frame
      this.meterAnimationId = requestAnimationFrame(updateMeter);
    };
    updateMeter();
  }

  /**
   * Stop polling meter levels.
   *
   * Cancels the requestAnimationFrame loop started by startMeterUpdates().
   *
   * @private
   */
  private stopMeterUpdates(): void {
    if (this.meterAnimationId) {
      cancelAnimationFrame(this.meterAnimationId);
    }
  }

  /**
   * Get frequency domain data for spectrum visualization.
   *
   * Returns FFT data from the AnalyserNode as unsigned bytes (0-255).
   * Call this each animation frame for real-time spectrum display.
   *
   * ## Array Size
   *
   * Returns `analyser.frequencyBinCount` values, which is half the
   * FFT size (1024 bins for default FFT size of 2048).
   *
   * @returns Uint8Array of frequency magnitudes (0-255), or empty array if not initialized
   *
   * @example
   * ```typescript
   * const data = audioEngine.getFrequencyData();
   * // Draw spectrum bars
   * for (let i = 0; i < data.length; i++) {
   *   const magnitude = data[i] / 255;
   *   drawBar(i, magnitude);
   * }
   * ```
   */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Get time domain data for waveform visualization.
   *
   * Returns raw audio samples as unsigned bytes (128 = zero crossing).
   * Call this each animation frame for real-time waveform display.
   *
   * ## Array Size
   *
   * Returns `analyser.fftSize` values (default 2048 samples).
   *
   * @returns Uint8Array of sample values (0-255, 128=center), or empty array if not initialized
   *
   * @example
   * ```typescript
   * const data = audioEngine.getTimeDomainData();
   * // Draw waveform
   * ctx.beginPath();
   * for (let i = 0; i < data.length; i++) {
   *   const y = (data[i] / 255) * height;
   *   i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i, y);
   * }
   * ctx.stroke();
   * ```
   */
  getTimeDomainData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);

    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  /**
   * Get current engine status and diagnostics.
   *
   * Useful for debugging, status displays, and latency monitoring.
   *
   * @returns Current engine state information
   *
   * @example
   * ```typescript
   * const info = audioEngine.getInfo();
   *
   * // Display status
   * console.log(`Initialized: ${info.isInitialized}`);
   * console.log(`Sample Rate: ${info.sampleRate}Hz`);
   *
   * // Calculate total latency in ms
   * const latencyMs = (info.baseLatency + info.outputLatency) * 1000;
   * console.log(`Total Latency: ${latencyMs.toFixed(1)}ms`);
   * ```
   */
  getInfo(): AudioEngineInfo {
    return {
      isInitialized: this.isInitialized,
      isWorkletReady: this.isWorkletReady,
      sampleRate: this.audioContext?.sampleRate ?? 0,
      baseLatency: this.audioContext?.baseLatency ?? 0,
      outputLatency: this.audioContext?.outputLatency ?? 0,
      state: this.audioContext?.state ?? 'closed',
    };
  }

  /**
   * Clean up all audio resources.
   *
   * Disconnects all nodes, closes the AudioContext, and releases
   * SharedArrayBuffer references. Call this when completely done
   * with audio (e.g., on page unload).
   *
   * After calling dispose(), you must call initialize() again
   * to use the engine.
   *
   * @example
   * ```typescript
   * // On component unmount or page unload
   * window.addEventListener('beforeunload', () => {
   *   audioEngine.dispose();
   * });
   * ```
   */
  dispose(): void {
    this.stopMeterUpdates();

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
    this.isWorkletReady = false;
  }
}

/**
 * Singleton audio engine instance.
 *
 * Use this exported instance throughout the application.
 * Do not create new AudioEngine instances directly.
 *
 * @example
 * ```typescript
 * import { audioEngine } from '@/engine/audio-engine';
 *
 * await audioEngine.initialize();
 * audioEngine.play();
 * ```
 */
export const audioEngine = new AudioEngine();
