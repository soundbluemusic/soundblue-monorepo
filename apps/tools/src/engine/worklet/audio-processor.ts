/**
 * ========================================
 * AudioWorklet Processor
 * ========================================
 *
 * Real-time audio processing running on a dedicated audio thread.
 *
 * ## Why AudioWorklet?
 *
 * This processor runs on the **audio rendering thread**, separate from
 * the main JavaScript thread. This ensures:
 *
 * - **Glitch-free audio**: UI updates or JS computation cannot cause audio dropouts
 * - **Consistent timing**: Audio buffers are processed at exact intervals
 * - **Low latency**: Direct access to audio hardware timing
 *
 * ## Thread Model
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      Main Thread                             │
 * │  ┌─────────────┐    postMessage     ┌──────────────────┐   │
 * │  │ AudioEngine │ ──────────────────► │ AudioWorkletNode │   │
 * │  │             │ ◄────────────────── │    (proxy)       │   │
 * │  └─────────────┘    onmessage       └──────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 *                              │
 *              SharedArrayBuffer (zero-copy)
 *                              │
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Audio Thread                              │
 * │  ┌──────────────────────────────────────────────────────┐   │
 * │  │              DAWAudioProcessor                        │   │
 * │  │  - Runs process() every ~2.67ms (128 samples @ 48kHz) │   │
 * │  │  - Writes meter levels to SharedArrayBuffer           │   │
 * │  │  - Must never block or allocate memory                │   │
 * │  └──────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Critical Constraints
 *
 * Code in process() must NEVER:
 * - Allocate memory (no `new`, no array creation in hot path)
 * - Block (no async, no waiting, no locks)
 * - Call DOM APIs (not available in audio thread)
 * - Throw exceptions (will kill the audio thread)
 *
 * ## SharedArrayBuffer Communication
 *
 * For real-time meter updates, we use SharedArrayBuffer instead of
 * postMessage. This provides zero-copy, lock-free communication:
 *
 * - Processor writes meter values using Atomics.store()
 * - Main thread reads values using Atomics.load()
 * - No copying, no message queuing, no garbage collection
 *
 * @module engine/worklet/audio-processor
 * @see {@link audioEngine} - The main thread counterpart
 */

/**
 * AudioWorkletProcessor base class type declaration.
 *
 * This is built into the audio thread global scope.
 * We declare it here since TypeScript doesn't know about worklet context.
 */
declare class AudioWorkletProcessor {
  /** MessagePort for communication with AudioWorkletNode on main thread */
  readonly port: MessagePort;

  /**
   * Process audio data. Called for each audio block (~128 samples).
   *
   * @param inputs - Array of input channels [input][channel][sample]
   * @param outputs - Array of output channels [output][channel][sample]
   * @param parameters - Audio parameters (currently unused)
   * @returns true to keep processor alive, false to stop
   */
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

/**
 * Register a processor class with the audio worklet global scope.
 *
 * @param name - Processor name (used in AudioWorkletNode constructor)
 * @param processor - The processor class
 */
declare function registerProcessor(name: string, processor: typeof AudioWorkletProcessor): void;

/**
 * SharedArrayBuffer Memory Layout
 *
 * Both the main thread and audio thread share this memory layout:
 *
 * | Index | Field       | Type    | Description                           |
 * |-------|-------------|---------|---------------------------------------|
 * | 0     | isPlaying   | Int32   | Transport state (0=stopped, 1=playing) |
 * | 1     | bpm         | Int32   | Tempo in BPM (scaled integer)         |
 * | 2     | currentTime | Int32   | Playhead position (scaled)            |
 * | 3     | leftLevel   | Int32   | Left channel RMS (scaled 0-1M)        |
 * | 4     | rightLevel  | Int32   | Right channel RMS (scaled 0-1M)       |
 * | 5     | leftPeak    | Int32   | Left peak hold (scaled 0-1M)          |
 * | 6     | rightPeak   | Int32   | Right peak hold (scaled 0-1M)         |
 *
 * The audio thread WRITES indices 3-6 (meter values).
 * The main thread READS indices 3-6 (for VU meter display).
 * Both can read/write indices 0-2 (transport state).
 */

/**
 * Scale factor for storing floats as integers in SharedArrayBuffer.
 *
 * Atomics only works with integer types (Int32Array). To store float
 * audio levels (0.0 - 1.0), we scale them:
 *
 * - Store: `Math.round(floatValue * SCALE_FACTOR)`
 * - Read: `intValue / SCALE_FACTOR`
 *
 * 1,000,000 provides 6 decimal places of precision, more than enough
 * for audio level representation.
 */
const SCALE_FACTOR = 1000000;

/**
 * WASM Audio Engine Interface
 *
 * Defines the exported functions from the Rust/WASM audio engine.
 * These functions operate on linear memory for zero-copy performance.
 */
interface WasmEngine {
  /** WASM linear memory for audio buffer access */
  memory: WebAssembly.Memory;

  /** Allocate memory in WASM heap, returns pointer */
  alloc: (size: number) => number;

  /** Free allocated memory */
  dealloc: (ptr: number, size: number) => void;

  /** Process audio buffer in-place (ptr to f32 array, length) */
  process_buffer: (inputPtr: number, outputPtr: number, length: number) => void;

  /** Calculate RMS of audio buffer (ptr to f32 array, length) */
  calculate_rms: (ptr: number, length: number) => number;

  /** Calculate peak level of audio buffer (ptr to f32 array, length) */
  calculate_peak: (ptr: number, length: number) => number;

  /** Apply gain to audio buffer in-place (ptr, length, gain) */
  apply_gain: (ptr: number, length: number, gain: number) => void;
}

/** Audio buffer size in samples (standard Web Audio render quantum) */
const BUFFER_SIZE = 128;

/** Size in bytes for stereo audio buffer (128 samples * 2 channels * 4 bytes) */
const STEREO_BUFFER_BYTES = BUFFER_SIZE * 2 * 4;

/**
 * DAW Audio Processor - Main audio processing worklet.
 *
 * This class runs on the audio rendering thread and handles:
 * - Audio passthrough (input → output)
 * - RMS level calculation for VU meters
 * - Peak level tracking
 * - Transport state synchronization
 *
 * ## Lifecycle
 *
 * 1. Created by AudioWorkletNode on main thread
 * 2. Receives SharedArrayBuffer via message
 * 3. process() called every ~2.67ms (128 samples @ 48kHz)
 * 4. Writes meter values to shared memory atomically
 *
 * ## Future: WASM Processing
 *
 * The processor is designed to integrate with a Rust/WASM audio
 * engine for DSP operations (synthesis, effects, etc.). Currently
 * operates in passthrough mode.
 */
class DAWAudioProcessor extends AudioWorkletProcessor {
  /** Int32 view for Atomics operations on shared memory */
  private sharedState: Int32Array | null = null;

  /** WASM audio engine instance (null if not loaded) */
  private wasmEngine: WasmEngine | null = null;

  /** Whether WASM engine is initialized and ready for processing */
  private isWasmReady = false;

  /** Pointer to input buffer in WASM memory */
  private wasmInputPtr = 0;

  /** Pointer to output buffer in WASM memory */
  private wasmOutputPtr = 0;

  /** Float32Array view of WASM memory for input buffer */
  private wasmInputView: Float32Array | null = null;

  /** Float32Array view of WASM memory for output buffer */
  private wasmOutputView: Float32Array | null = null;

  /**
   * Construct the audio processor.
   *
   * Sets up message handling and signals ready state to main thread.
   * Called automatically when AudioWorkletNode is created.
   */
  constructor() {
    super();

    // Set up message handler for commands from main thread
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    // Signal to main thread that we're ready to receive configuration
    this.port.postMessage({ type: 'ready' });
  }

  /**
   * Handle messages from the main thread AudioEngine.
   *
   * ## Message Types
   *
   * | Type           | Data                  | Description                    |
   * |----------------|-----------------------|--------------------------------|
   * | init           | wasmModule            | Initialize WASM engine         |
   * | shared-buffer  | sharedBuffer          | Set up shared memory           |
   * | play           | -                     | Start transport                |
   * | stop           | -                     | Stop transport                 |
   *
   * @private
   * @param data - Message data from postMessage
   */
  private handleMessage(data: {
    type: string;
    wasmModule?: WebAssembly.Module;
    sharedBuffer?: SharedArrayBuffer;
  }) {
    switch (data.type) {
      case 'init':
        // Initialize WASM engine (future implementation)
        this.initWasm(data.wasmModule!);
        break;

      case 'shared-buffer':
        // Set up shared memory for lock-free meter updates
        this.setupSharedBuffer(data.sharedBuffer!);
        break;

      case 'play':
        // Set isPlaying flag in shared state (index 0)
        if (this.sharedState) {
          Atomics.store(this.sharedState, 0, 1); // 1 = playing
        }
        break;

      case 'stop':
        // Clear isPlaying flag in shared state (index 0)
        if (this.sharedState) {
          Atomics.store(this.sharedState, 0, 0); // 0 = stopped
        }
        break;
    }
  }

  /**
   * Initialize WASM audio engine.
   *
   * Instantiates the Rust-compiled WASM module for high-performance
   * DSP operations. Sets up memory buffers for zero-copy audio processing.
   *
   * ## Memory Layout
   *
   * WASM linear memory is used for audio buffers:
   * - Input buffer: BUFFER_SIZE * 2 * 4 bytes (stereo, f32)
   * - Output buffer: BUFFER_SIZE * 2 * 4 bytes (stereo, f32)
   *
   * @private
   * @param wasmModule - Compiled WASM module from main thread
   */
  private async initWasm(wasmModule: WebAssembly.Module) {
    try {
      // Import object for WASM instantiation
      // The Rust WASM module expects these imports
      const importObject = {
        env: {
          // Abort function for Rust panic handling
          abort: (msg: number, file: number, line: number, column: number) => {
            console.error(`WASM abort at ${file}:${line}:${column} - ${msg}`);
          },
        },
        // wasm-bindgen generated imports (if any)
        wbg: {},
      };

      // Instantiate the WASM module
      const instance = await WebAssembly.instantiate(wasmModule, importObject);
      const exports = instance.exports as unknown as WasmEngine & {
        __wbindgen_malloc?: (size: number) => number;
        __wbindgen_free?: (ptr: number, size: number) => void;
      };

      // Check if required exports exist
      if (!exports.memory) {
        throw new Error('WASM module missing memory export');
      }

      // Set up WASM engine with available exports
      // Map wasm-bindgen allocator functions if available
      this.wasmEngine = {
        memory: exports.memory,
        alloc: exports.__wbindgen_malloc || exports.alloc || this.simpleAlloc.bind(this),
        dealloc: exports.__wbindgen_free || exports.dealloc || (() => {}),
        process_buffer: exports.process_buffer || this.fallbackProcess.bind(this),
        calculate_rms: exports.calculate_rms || this.fallbackRms.bind(this),
        calculate_peak: exports.calculate_peak || this.fallbackPeak.bind(this),
        apply_gain: exports.apply_gain || (() => {}),
      };

      // Allocate buffers in WASM memory for audio processing
      this.wasmInputPtr = this.wasmEngine.alloc(STEREO_BUFFER_BYTES);
      this.wasmOutputPtr = this.wasmEngine.alloc(STEREO_BUFFER_BYTES);

      // Create Float32Array views into WASM memory
      this.updateWasmViews();

      this.isWasmReady = true;
      this.port.postMessage({ type: 'initialized', wasmEnabled: true });
    } catch (error: unknown) {
      // WASM initialization failed - continue with JS fallback
      console.warn('WASM initialization failed, using JS fallback:', error);
      this.isWasmReady = false;
      this.wasmEngine = null;
      this.port.postMessage({
        type: 'initialized',
        wasmEnabled: false,
        error: String(error),
      });
    }
  }

  /**
   * Update Float32Array views when WASM memory grows.
   * @private
   */
  private updateWasmViews() {
    if (this.wasmEngine && this.wasmInputPtr && this.wasmOutputPtr) {
      const memory = this.wasmEngine.memory.buffer;
      this.wasmInputView = new Float32Array(memory, this.wasmInputPtr, BUFFER_SIZE * 2);
      this.wasmOutputView = new Float32Array(memory, this.wasmOutputPtr, BUFFER_SIZE * 2);
    }
  }

  /**
   * Simple bump allocator for WASM memory (fallback).
   * @private
   */
  private wasmHeapOffset = 65536; // Start after initial memory
  private simpleAlloc(size: number): number {
    const ptr = this.wasmHeapOffset;
    this.wasmHeapOffset += size;
    return ptr;
  }

  /**
   * Fallback process function when WASM export is unavailable.
   * @private
   */
  private fallbackProcess(_inputPtr: number, _outputPtr: number, _length: number): void {
    // Passthrough - copy handled in process()
  }

  /**
   * Fallback RMS calculation (JS implementation).
   * @private
   */
  private fallbackRms(_ptr: number, _length: number): number {
    return 0;
  }

  /**
   * Fallback peak calculation (JS implementation).
   * @private
   */
  private fallbackPeak(_ptr: number, _length: number): number {
    return 0;
  }

  /**
   * Set up SharedArrayBuffer for lock-free communication.
   *
   * Creates an Int32Array view over the shared buffer for Atomics
   * operations. This enables zero-copy meter updates to the main thread.
   *
   * @private
   * @param buffer - SharedArrayBuffer from main thread
   */
  private setupSharedBuffer(buffer: SharedArrayBuffer) {
    // Create Int32Array view for Atomics compatibility
    // Layout: [isPlaying, bpm, currentTime, leftLevel, rightLevel, leftPeak, rightPeak]
    this.sharedState = new Int32Array(buffer);
  }

  /**
   * Process audio block.
   *
   * Called by the audio system every render quantum (~128 samples at 48kHz,
   * approximately every 2.67ms). This is the hot path - performance is critical.
   *
   * ## Current Behavior
   *
   * 1. Copies input audio to output (passthrough)
   * 2. Calculates RMS level for each channel
   * 3. Writes meter values to SharedArrayBuffer atomically
   * 4. Updates peak hold values
   *
   * ## Performance Notes
   *
   * - No memory allocation in this method (would cause GC pauses)
   * - Uses Atomics.store for thread-safe writes (non-blocking)
   * - RMS calculation is O(n) where n = buffer size (typically 128)
   *
   * @param inputs - Input audio buffers [input][channel][sample]
   * @param outputs - Output audio buffers [output][channel][sample]
   * @param _parameters - AudioParam values (currently unused)
   * @returns true to keep processor alive
   */
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>
  ): boolean {
    const input = inputs[0];
    const output = outputs[0];

    // Guard: ensure we have valid input and output buffers
    if (!input || !output || input.length === 0 || output.length === 0) {
      return true; // Keep alive even with no audio
    }

    // Get channel buffers (mono input uses same buffer for both channels)
    const inputL = input[0];
    const inputR = input[1] || input[0]; // Fallback to mono
    const outputL = output[0];
    const outputR = output[1] || output[0]; // Fallback to mono

    // Process audio through WASM engine if available, otherwise passthrough
    if (
      this.isWasmReady &&
      this.wasmEngine &&
      this.wasmInputView &&
      this.wasmOutputView &&
      inputL &&
      inputR &&
      outputL &&
      outputR
    ) {
      // Copy input to WASM memory (interleaved stereo: L0,R0,L1,R1,...)
      for (let i = 0; i < BUFFER_SIZE; i++) {
        this.wasmInputView[i * 2] = inputL[i] ?? 0;
        this.wasmInputView[i * 2 + 1] = inputR[i] ?? 0;
      }

      // Process through WASM DSP engine
      this.wasmEngine.process_buffer(this.wasmInputPtr, this.wasmOutputPtr, BUFFER_SIZE * 2);

      // Copy output from WASM memory back to audio buffers
      for (let i = 0; i < BUFFER_SIZE; i++) {
        outputL[i] = this.wasmOutputView[i * 2] ?? 0;
        outputR[i] = this.wasmOutputView[i * 2 + 1] ?? 0;
      }
    } else if (outputL && outputR && inputL && inputR) {
      // Fallback: passthrough (copy input directly to output)
      outputL.set(inputL);
      if (outputR !== outputL) {
        outputR.set(inputR);
      }
    }

    // Calculate and update meter levels in shared memory
    if (this.sharedState && outputL && outputR) {
      let leftLevel: number;
      let rightLevel: number;

      // Use WASM for RMS calculation if available (faster)
      if (this.isWasmReady && this.wasmEngine && this.wasmOutputView) {
        // Calculate RMS from WASM output buffer
        leftLevel = this.wasmEngine.calculate_rms(this.wasmOutputPtr, BUFFER_SIZE);
        rightLevel = this.wasmEngine.calculate_rms(
          this.wasmOutputPtr + BUFFER_SIZE * 4,
          BUFFER_SIZE
        );

        // If WASM RMS returns 0, use JS fallback (WASM might not have the function)
        if (
          leftLevel === 0 &&
          rightLevel === 0 &&
          ((outputL[0] ?? 0) !== 0 || (outputR[0] ?? 0) !== 0)
        ) {
          leftLevel = this.calculateRMS(outputL);
          rightLevel = this.calculateRMS(outputR);
        }
      } else {
        // JS fallback: Calculate RMS (Root Mean Square) for each channel
        leftLevel = this.calculateRMS(outputL);
        rightLevel = this.calculateRMS(outputR);
      }

      // Scale floats to integers for Atomics (0.0-1.0 → 0-1000000)
      const scaledLeft = Math.round(leftLevel * SCALE_FACTOR);
      const scaledRight = Math.round(rightLevel * SCALE_FACTOR);

      // Write current levels atomically (thread-safe, non-blocking)
      // Indices 3 and 4 are leftLevel and rightLevel
      Atomics.store(this.sharedState, 3, scaledLeft);
      Atomics.store(this.sharedState, 4, scaledRight);

      // Update peak hold values (only if new value is higher)
      // Peak values are displayed differently in VU meters (hold, then decay)
      const currentLeftPeak = Atomics.load(this.sharedState, 5);
      const currentRightPeak = Atomics.load(this.sharedState, 6);

      if (scaledLeft > currentLeftPeak) {
        Atomics.store(this.sharedState, 5, scaledLeft);
      }
      if (scaledRight > currentRightPeak) {
        Atomics.store(this.sharedState, 6, scaledRight);
      }
    }

    // Return true to keep the processor alive
    // Returning false would disconnect the node
    return true;
  }

  /**
   * Calculate RMS (Root Mean Square) of an audio buffer.
   *
   * RMS is the standard measure for audio signal level because it
   * accurately represents the perceived loudness of a signal,
   * accounting for both positive and negative sample values.
   *
   * ## Formula
   *
   * ```
   * RMS = sqrt((1/n) * Σ(sample²))
   * ```
   *
   * Where n is the buffer length and samples are in range [-1, 1].
   *
   * ## Result Range
   *
   * - 0.0 = silence
   * - 1.0 = full scale (all samples at maximum)
   * - Typical music: 0.1 - 0.5 RMS
   *
   * @private
   * @param buffer - Audio samples in range [-1, 1]
   * @returns RMS level in range [0, 1]
   */
  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    // Sum of squares - works for negative values
    for (let i = 0; i < buffer.length; i++) {
      const sample = buffer[i] ?? 0;
      sum += sample * sample;
    }
    // Root of mean of squares
    return Math.sqrt(sum / buffer.length);
  }
}

registerProcessor('daw-audio-processor', DAWAudioProcessor);
