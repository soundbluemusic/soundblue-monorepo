// ========================================
// Audio Utilities (JS Implementation)
// ========================================
// WASM support is optional - build with `pnpm wasm:build`
// Fallback to pure JS implementations when WASM is not available

export interface AudioUtils {
  calculateRMS: (buffer: Float32Array) => number;
  calculatePeak: (buffer: Float32Array) => number;
  applyGain: (buffer: Float32Array, gain: number) => void;
  processBuffer: (input: Float32Array, output: Float32Array) => void;
}

/**
 * Calculate RMS (Root Mean Square) of audio buffer
 */
function calculateRMS(buffer: Float32Array): number {
  if (buffer.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    const sample = buffer[i] ?? 0;
    sum += sample * sample;
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Calculate peak amplitude of audio buffer
 */
function calculatePeak(buffer: Float32Array): number {
  if (buffer.length === 0) return 0;

  let peak = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i] ?? 0);
    if (abs > peak) peak = abs;
  }
  return peak;
}

/**
 * Apply gain to audio buffer (in-place)
 */
function applyGain(buffer: Float32Array, gain: number): void {
  for (let i = 0; i < buffer.length; i++) {
    const sample = buffer[i];
    if (sample !== undefined) {
      buffer[i] = sample * gain;
    }
  }
}

/**
 * Copy input buffer to output buffer
 */
function processBuffer(input: Float32Array, output: Float32Array): void {
  output.set(input);
}

// Export audio utilities
export const audioUtils: AudioUtils = {
  calculateRMS,
  calculatePeak,
  applyGain,
  processBuffer,
};

/**
 * Legacy WASM loader interface for backwards compatibility.
 * WASM support is optional - this provides JS fallbacks.
 */
export interface WasmLoader {
  /** Whether WASM module is loaded */
  loaded: boolean;
  /** Load WASM module (no-op in JS fallback mode) */
  load: () => Promise<void>;
  /** Get WASM exports (null in JS fallback mode) */
  getExports: () => WebAssembly.Exports | null;
  /** Get WASM module (null in JS fallback mode) */
  getModule: () => WebAssembly.Module | null;
  /** Get WASM memory (null in JS fallback mode) */
  getMemory: () => WebAssembly.Memory | null;
  /** Calculate RMS of audio buffer */
  calculateRMS: (buffer: Float32Array) => number;
  /** Process audio buffer */
  processBuffer: (input: Float32Array, output: Float32Array) => void;
}

// Legacy export for backwards compatibility
export const wasmLoader: WasmLoader = {
  loaded: false,
  load: async (): Promise<void> => {
    // No-op: WASM is not available
  },
  getExports: (): WebAssembly.Exports | null => null,
  getModule: (): WebAssembly.Module | null => null,
  getMemory: (): WebAssembly.Memory | null => null,
  calculateRMS,
  processBuffer,
};
