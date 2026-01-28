import { defineConfig, devices } from '@playwright/test';

/**
 * 루트 레벨 Playwright 설정
 * CI에서 전체 E2E 테스트 실행용
 */

// CI에서는 정적 파일 서버 사용, 로컬에서는 vite preview 사용
const isCI = !!process.env.CI;
const isProduction = !!process.env.PRODUCTION_TEST;

// 프로덕션 URL 매핑
const productionUrls = {
  'sound-blue': 'https://soundbluemusic.com',
  tools: 'https://tools.soundbluemusic.com',
  dialogue: 'https://dialogue.soundbluemusic.com',
};

const projects = [
  // 로컬/CI 테스트 (localhost)
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    grepInvert: /@production|@smoke/,
  },
];

if (isProduction) {
  projects.push(
    // 프로덕션 테스트 (실제 URL)
    {
      name: 'prod-sound-blue',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: productionUrls['sound-blue'],
      },
      testMatch: /.*\.spec\.ts/,
      grep: /@production|@smoke/,
    },
    {
      name: 'prod-tools',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: productionUrls.tools,
      },
      testMatch: /.*\.spec\.ts/,
      grep: /@production|@smoke/,
    },
    {
      name: 'prod-dialogue',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: productionUrls.dialogue,
      },
      testMatch: /.*\.spec\.ts/,
      grep: /@production|@smoke/,
    },
  );
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? 'github' : 'html',
  timeout: isProduction ? 60000 : 30000,

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects,

  // 프로덕션 테스트 시에는 webServer 불필요 (실제 URL 사용)
  // CI: 정적 파일 서버 (빌드 결과물 사용)
  // 로컬: vite preview (개발용)
  webServer: isProduction
    ? undefined
    : [
        {
          command: isCI
            ? 'npx serve apps/sound-blue/dist/client -l 3000 -s'
            : 'pnpm --filter sound-blue preview',
          url: 'http://localhost:3000',
          reuseExistingServer: !isCI,
          timeout: 120000,
        },
        {
          command: isCI
            ? 'npx serve apps/tools/dist/client -l 3001 -s'
            : 'pnpm --filter tools preview',
          url: 'http://localhost:3001',
          reuseExistingServer: !isCI,
          timeout: 120000,
        },
        {
          command: isCI
            ? 'npx serve apps/dialogue/dist/client -l 3002 -s'
            : 'pnpm --filter dialogue preview',
          url: 'http://localhost:3002',
          reuseExistingServer: !isCI,
          timeout: 120000,
        },
      ],
});
