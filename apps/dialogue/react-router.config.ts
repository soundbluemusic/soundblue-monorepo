import type { Config } from '@react-router/dev/config';

export default {
  // SSR 모드 - Workers에서 요청 시 HTML 생성
  ssr: true,
  // Cloudflare Vite Plugin 호환성
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
