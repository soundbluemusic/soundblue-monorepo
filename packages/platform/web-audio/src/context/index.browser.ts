// ========================================
// @soundblue/web-audio - Context (Browser)
// Public API for browser environment
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
} from './manager.browser';
