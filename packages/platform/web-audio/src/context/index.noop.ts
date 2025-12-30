// ========================================
// @soundblue/web-audio - Context (Noop)
// Public API for SSR/build time
// ========================================

export {
  closeAudioContext,
  createGain,
  createOscillator,
  getAudioContext,
  getAudioContextState,
  getCurrentTime,
  getSampleRate,
  onAudioContextStateChange,
  resumeAudioContext,
} from './manager.noop';
