// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';
import { setupGlobalErrorHandlers } from '~/components/error-boundary';

// 전역 에러 핸들러 설정
setupGlobalErrorHandlers();

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
        if (import.meta.env.DEV) {
          console.warn('PWA registration failed:', error);
        }
      }
    },
    { once: true },
  );
}
