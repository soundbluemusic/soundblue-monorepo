// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';
import { setupGlobalErrorHandlers } from '~/components/error-boundary';

// 전역 에러 핸들러 설정
setupGlobalErrorHandlers();

mount(() => <StartClient />, document.getElementById('app')!);
