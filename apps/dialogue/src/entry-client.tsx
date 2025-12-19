// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';

// Mount the app first - critical for rendering to work
mount(() => <StartClient />, document.getElementById('app')!);

// Register service worker after mount completes
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener(
    'load',
    async () => {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({
          immediate: true,
          onRegisteredSW(swUrl, _registration) {
            if (import.meta.env.DEV) {
              console.log('SW registered:', swUrl);
            }
          },
          onOfflineReady() {
            if (import.meta.env.DEV) {
              console.log('App ready to work offline');
            }
          },
        });
      } catch (error: unknown) {
        console.error('Service Worker registration failed:', error);
        // Dispatch custom event for app to handle offline unavailability
        window.dispatchEvent(new CustomEvent('sw-registration-failed', { detail: { error } }));
      }
    },
    { once: true },
  );
}
