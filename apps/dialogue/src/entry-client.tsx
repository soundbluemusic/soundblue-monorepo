// @refresh reload
import { mount, StartClient } from '@solidjs/start/client';

// Mount the app - critical for rendering to work
// VitePWA handles service worker registration automatically (injectRegister: 'auto')
mount(() => <StartClient />, document.getElementById('app')!);
