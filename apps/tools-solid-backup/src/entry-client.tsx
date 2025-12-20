// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';
import { setupGlobalErrorHandlers } from '~/components/error-boundary';

// 전역 에러 핸들러 설정
setupGlobalErrorHandlers();

// Mount the app - critical for rendering to work
// VitePWA handles service worker registration automatically (injectRegister: 'auto')
mount(() => <StartClient />, document.getElementById('app')!);
