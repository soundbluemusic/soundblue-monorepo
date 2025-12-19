// ========================================
// Audio Context - 싱글톤 AudioContext 관리
// ========================================
// 모든 도구가 공유하여 DAW 통합 시 충돌 방지

let audioContext: AudioContext | null = null;
const stateChangeCallbacks = new Set<(state: AudioContextState) => void>();

/**
 * Get the singleton AudioContext instance
 * Creates a new one if it doesn't exist
 * Returns null during SSR
 */
export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext is not available during SSR');
  }
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext is not supported in this browser');
    }
    audioContext = new AudioContextClass();

    // Setup native state change listener
    const ctx = audioContext;
    ctx.onstatechange = () => {
      stateChangeCallbacks.forEach((cb) => cb(ctx.state));
    };
  }
  return audioContext;
}

/**
 * Resume the AudioContext if it's suspended
 * Required after user interaction for browsers' autoplay policy
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/**
 * Get the current state of the AudioContext
 */
export function getAudioContextState(): AudioContextState | null {
  return audioContext?.state ?? null;
}

/**
 * Subscribe to AudioContext state changes
 * Returns unsubscribe function
 */
export function onAudioContextStateChange(
  callback: (state: AudioContextState) => void,
): () => void {
  stateChangeCallbacks.add(callback);
  return () => stateChangeCallbacks.delete(callback);
}

/**
 * Close the AudioContext
 * Should be called when the application is unmounting
 */
export async function closeAudioContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
  }
}

/**
 * Create an oscillator with common settings
 */
export function createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = frequency;
  osc.type = type;
  return osc;
}

/**
 * Create a gain node with initial value
 */
export function createGain(initialValue: number = 1): GainNode {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = initialValue;
  return gain;
}

/**
 * Get current audio time
 */
export function getCurrentTime(): number {
  return getAudioContext().currentTime;
}

/**
 * Get audio sample rate
 */
export function getSampleRate(): number {
  return getAudioContext().sampleRate;
}
