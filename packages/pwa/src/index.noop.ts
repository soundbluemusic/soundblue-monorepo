// ========================================
// @soundblue/pwa - Noop Entry
// For SSR/build time
// ========================================

// Config presets (pure functions, safe for SSR)
export * from './config';
// Noop hooks
export { type UsePWAResult, usePWA } from './hooks/index.noop';
// Noop SW registration
export { registerSW, skipWaiting, unregisterSW } from './register/register.noop';
// Types
export * from './types';
