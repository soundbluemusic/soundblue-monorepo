# Sound Blue 기술 보고서 (Technical Report)

**프로젝트명:** Sound Blue
**버전:** 3.0.18-베타
**작성일:** 2025년 12월 15일
**라이브 사이트:** https://soundbluemusic.com

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [아키텍처](#3-아키텍처)
4. [프론트엔드 기술](#4-프론트엔드-기술)
5. [빌드 및 번들링](#5-빌드-및-번들링)
6. [스타일링 시스템](#6-스타일링-시스템)
7. [국제화 (i18n)](#7-국제화-i18n)
8. [PWA (Progressive Web App)](#8-pwa-progressive-web-app)
9. [테스트 전략](#9-테스트-전략)
10. [보안](#10-보안)
11. [배포 인프라](#11-배포-인프라)
12. [SEO 최적화](#12-seo-최적화)
13. [성능 최적화](#13-성능-최적화)
14. [개발 도구 및 코드 품질](#14-개발-도구-및-코드-품질)
15. [의존성 분석](#15-의존성-분석)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 설명

Sound Blue는 음악 아티스트 SoundBlueMusic의 공식 웹사이트입니다. 현대적인 웹 기술을 활용하여 구축된 **100% 정적 클라이언트 사이드 애플리케이션**으로, 백엔드 서버 없이 Cloudflare Pages에 배포됩니다.

### 1.2 핵심 특징

| 특징 | 설명 |
|------|------|
| **정적 사이트 생성 (SSG)** | 빌드 시 모든 페이지 사전 렌더링 |
| **다국어 지원** | 영어(기본) 및 한국어 지원 |
| **PWA 지원** | 오프라인 기능 및 앱 설치 가능 |
| **접근성 준수** | WCAG AAA 기준 충족 (대비율 ~11:1) |
| **다크 모드** | 시스템 설정 연동 + 수동 전환 |

### 1.3 지원 페이지

| 경로 | 한국어 경로 | 설명 |
|------|-------------|------|
| `/` | `/ko` | 홈 |
| `/about` | `/ko/about` | 소개 |
| `/news` | `/ko/news` | 뉴스 |
| `/blog` | `/ko/blog` | 블로그 |
| `/built-with` | `/ko/built-with` | 제작 도구 |
| `/sitemap` | `/ko/sitemap` | 사이트맵 |
| `/sound-recording` | `/ko/sound-recording` | 녹음물 |
| `/chat` | `/ko/chat` | 채팅 어시스턴트 |
| `/privacy` | `/ko/privacy` | 개인정보처리방침 |
| `/terms` | `/ko/terms` | 이용약관 |
| `/license` | `/ko/license` | 라이선스 |
| `/offline` | - | PWA 오프라인 페이지 |

---

## 2. 기술 스택

### 2.1 핵심 프레임워크

| 기술 | 버전 | 역할 |
|------|------|------|
| **SolidStart** | 1.2.x | 메타 프레임워크 (SSG/SSR) |
| **SolidJS** | 1.9.10 | UI 라이브러리 |
| **Vinxi** | 0.5.9 | 빌드 시스템/번들러 |
| **TypeScript** | 5.9.3 | 정적 타입 시스템 |

### 2.2 스타일링

| 기술 | 버전 | 역할 |
|------|------|------|
| **Tailwind CSS** | 4.1.x | 유틸리티 기반 CSS |
| **class-variance-authority** | 0.7.1 | 컴포넌트 변형 관리 |
| **clsx** | 2.1.1 | 조건부 클래스 결합 |
| **tailwind-merge** | 3.4.0 | Tailwind 클래스 충돌 해결 |

### 2.3 라우팅 및 메타데이터

| 기술 | 버전 | 역할 |
|------|------|------|
| **@solidjs/router** | 0.15.4 | 클라이언트 사이드 라우팅 |
| **@solidjs/meta** | 0.29.4 | HTML 메타 태그 관리 |

### 2.4 국제화

| 기술 | 버전 | 역할 |
|------|------|------|
| **@solid-primitives/i18n** | 2.2.1 | 다국어 지원 |

### 2.5 PWA

| 기술 | 버전 | 역할 |
|------|------|------|
| **vite-plugin-pwa** | 1.2.0 | PWA 구성 및 서비스 워커 |
| **workbox-window** | 7.4.0 | 서비스 워커 클라이언트 |

### 2.6 개발 도구

| 기술 | 버전 | 역할 |
|------|------|------|
| **Biome** | 2.3.8 | 린터 + 포매터 |
| **Vitest** | 4.0.15 | 단위 테스트 |
| **Playwright** | 1.57.0 | E2E 테스트 |
| **Husky** | 9.1.7 | Git 훅 |
| **lint-staged** | 16.2.7 | 스테이지된 파일 린팅 |

### 2.7 빌드 최적화

| 기술 | 버전 | 역할 |
|------|------|------|
| **vite-plugin-compression** | 0.5.1 | Gzip/Brotli 압축 |
| **rollup-plugin-visualizer** | 6.0.5 | 번들 분석 |
| **sharp** | 0.34.5 | 이미지 최적화 |

### 2.8 배포

| 기술 | 버전 | 역할 |
|------|------|------|
| **Cloudflare Pages** | - | 정적 사이트 호스팅 |
| **Wrangler** | 4.54.0 | Cloudflare CLI |

---

## 3. 아키텍처

### 3.1 정적 사이트 생성 (SSG) 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      빌드 시점 (Node.js)                      │
├─────────────────────────────────────────────────────────────┤
│  SolidStart + Vinxi                                         │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ src/routes/*.tsx │ → │ 정적 HTML 생성   │                │
│  └─────────────────┘    └─────────────────┘                │
│       │                         │                           │
│       ▼                         ▼                           │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ 사이트맵 생성    │    │ 서비스 워커 생성 │                │
│  └─────────────────┘    └─────────────────┘                │
│                              │                              │
│                              ▼                              │
│                    ┌─────────────────┐                     │
│                    │  .output/public │ (정적 파일)         │
│                    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages (배포)                    │
├─────────────────────────────────────────────────────────────┤
│  • CDN 글로벌 배포                                          │
│  • 커스텀 보안 헤더 (_headers)                              │
│  • 리다이렉트 규칙 (_redirects)                             │
│  • Cloudflare Web Analytics                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    브라우저 (런타임)                          │
├─────────────────────────────────────────────────────────────┤
│  • SolidJS Hydration                                       │
│  • 클라이언트 사이드 라우팅 (SPA)                            │
│  • PWA 서비스 워커                                         │
│  • 테마/언어 상태 관리                                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 디렉토리 구조

```
sound-blue/
├── src/                          # 소스 코드
│   ├── app.tsx                   # 루트 앱 컴포넌트
│   ├── entry-client.tsx          # 클라이언트 진입점
│   ├── entry-server.tsx          # 서버 진입점 (SSG용)
│   │
│   ├── components/               # SolidJS 컴포넌트
│   │   ├── background/           # 시각 효과 (CSSParticles)
│   │   ├── chat/                 # 채팅 컴포넌트
│   │   ├── home/                 # 홈 페이지 컴포넌트
│   │   ├── navigation/           # 네비게이션 (Sidebar, BottomNav)
│   │   ├── providers/            # 컨텍스트 제공자
│   │   ├── seo/                  # SEO 컴포넌트
│   │   └── ui/                   # UI 기본 요소
│   │
│   ├── routes/                   # 파일 기반 라우팅
│   │   ├── *.tsx                 # 영어 페이지
│   │   └── ko/*.tsx              # 한국어 페이지
│   │
│   ├── constants/                # 상수 (브랜드, 네비게이션, 아이콘)
│   ├── hooks/                    # 커스텀 훅
│   ├── lib/                      # 유틸리티 라이브러리
│   ├── styles/                   # 디자인 시스템 (CSS 변수)
│   └── utils/                    # 유틸리티 함수
│
├── e2e/                          # Playwright E2E 테스트
├── public/                       # 정적 자산
├── scripts/                      # 빌드 스크립트
│
├── app.config.ts                 # SolidStart 설정
├── pwa.config.ts                 # PWA 설정
├── biome.json                    # Biome 린터/포매터 설정
├── playwright.config.ts          # Playwright 설정
├── vitest.config.ts              # Vitest 설정
└── tsconfig.json                 # TypeScript 설정
```

### 3.3 컴포넌트 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                          App                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    Providers                           │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │  │ThemeProvider│ │I18nProvider │ │KeyboardShortcuts│  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                              │                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  NavigationLayout                      │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │ │
│  │  │ Header  │ │ Sidebar │ │  Main   │ │BottomNav   │  │ │
│  │  │         │ │(Desktop)│ │ Content │ │ (Mobile)    │  │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │ │
│  │                              │                         │ │
│  │                              ▼                         │ │
│  │                      ┌─────────────┐                   │ │
│  │                      │   Footer    │                   │ │
│  │                      └─────────────┘                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 프론트엔드 기술

### 4.1 SolidJS 특성

SolidJS는 React와 유사한 문법을 가지지만 근본적으로 다른 반응성 모델을 사용합니다.

**주요 특징:**

| 특징 | 설명 |
|------|------|
| **세밀한 반응성** | 컴포넌트 재렌더링 없이 DOM 직접 업데이트 |
| **컴파일 타임 최적화** | 가상 DOM 없이 실제 DOM 조작 |
| **작은 번들 크기** | ~7KB (gzip) |
| **Signals** | 반응형 상태 관리 (`createSignal`) |
| **Memo** | 파생 상태 (`createMemo`) |
| **Effect** | 부수 효과 (`createEffect`) |

**SolidJS vs React 차이점:**

```tsx
// SolidJS - class 속성 사용, 시그널은 함수 호출
<div class={cn("base", isActive() && "active")} />

// React - className 속성 사용, 상태는 직접 참조
<div className={cn("base", isActive && "active")} />
```

### 4.2 SolidStart 메타 프레임워크

SolidStart는 SolidJS의 공식 메타 프레임워크로, 다음 기능을 제공합니다:

| 기능 | 설명 |
|------|------|
| **파일 기반 라우팅** | `src/routes/` 디렉토리 구조 기반 |
| **SSG/SSR 지원** | Vinxi static 프리셋 사용 |
| **Hydration** | 서버 렌더링 HTML의 클라이언트 활성화 |
| **clientOnly** | 브라우저 전용 컴포넌트 래핑 |

### 4.3 라우팅 시스템

```typescript
// 파일 기반 라우팅 예시
src/routes/
├── index.tsx           → /
├── about.tsx           → /about
├── [...404].tsx        → 404 캐치올
└── ko/
    ├── index.tsx       → /ko
    └── about.tsx       → /ko/about
```

**동적 라우팅 패턴:**

| 패턴 | 예시 | 설명 |
|------|------|------|
| `index.tsx` | `/` | 인덱스 라우트 |
| `[param].tsx` | `/posts/[id]` | 동적 파라미터 |
| `[...slug].tsx` | `/docs/[...path]` | 캐치올 라우트 |
| `(group)/` | `/(admin)/` | 라우트 그룹 |

### 4.4 UI 컴포넌트 시스템

**Button 컴포넌트 (CVA 활용):**

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent-hover",
        outline: "border border-line bg-transparent hover:bg-state-hover",
        ghost: "hover:bg-state-hover",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

---

## 5. 빌드 및 번들링

### 5.1 Vinxi 빌드 설정

```typescript
// app.config.ts
export default defineConfig({
  server: {
    preset: 'static',          // 정적 사이트 생성
    prerender: {
      routes: [/* 사전 렌더링할 경로 */],
      crawlLinks: true,        // 링크 자동 크롤링
    },
  },
  vite: {
    build: {
      target: 'esnext',        // 최신 JS 타겟
      minify: 'esbuild',       // esbuild로 압축
      cssMinify: 'esbuild',    // CSS도 esbuild로 압축
    },
  },
});
```

### 5.2 압축 전략

| 압축 방식 | 확장자 | 임계값 | 용도 |
|-----------|--------|--------|------|
| **Gzip** | `.gz` | 1KB | 호환성 (폴백) |
| **Brotli** | `.br` | 1KB | 최적 압축률 |

```typescript
// 압축 플러그인 설정
viteCompression({
  algorithm: 'brotliCompress',
  ext: '.br',
  threshold: 1024,
  deleteOriginFile: false,
});
```

### 5.3 번들 분석

```bash
# 번들 분석 실행
pnpm build:analyze

# 결과: stats.html 생성 (treemap 시각화)
```

### 5.4 빌드 스크립트

| 스크립트 | 파일 | 설명 |
|----------|------|------|
| 사이트맵 생성 | `scripts/generate-sitemap.mjs` | sitemap.xml, robots.txt 생성 |
| 이미지 최적화 | `scripts/optimize-images.mjs` | Sharp로 이미지 최적화 |
| 아이콘 생성 | `scripts/generate-icons.mjs` | PWA 아이콘 생성 |

---

## 6. 스타일링 시스템

### 6.1 Tailwind CSS v4

Tailwind CSS v4는 CSS 기반 설정을 사용하며, JavaScript 설정 파일이 필요 없습니다.

```css
/* src/styles/tailwind.css */
@import "tailwindcss";

@theme inline {
  --color-surface: var(--color-bg-primary);
  --color-content: var(--color-text-primary);
  --color-accent: var(--color-accent-primary);
  /* ... */
}
```

### 6.2 디자인 시스템: "Eye-Friendly Aesthetic"

과학적으로 설계된 눈 피로 최소화 색상 시스템:

**라이트 모드 - "Warm Ivory":**

| 변수 | 값 | 용도 |
|------|-----|------|
| `--color-bg-primary` | `#F7F5F0` | 주 배경 (크림색) |
| `--color-bg-secondary` | `#EFEDE8` | 보조 배경 |
| `--color-text-primary` | `#2D2A26` | 주 텍스트 (따뜻한 차콜) |
| `--color-accent-primary` | `#C9553D` | 브랜드 색상 (테라코타) |

**다크 모드 - "Midnight Forest":**

| 변수 | 값 | 용도 |
|------|-----|------|
| `--color-bg-primary` | `#1A1D21` | 주 배경 (청록 톤 차콜) |
| `--color-bg-secondary` | `#252A2E` | 보조 배경 |
| `--color-text-primary` | `#E8E6E1` | 주 텍스트 (따뜻한 화이트) |
| `--color-accent-primary` | `#E8A87C` | 브랜드 색상 (피치) |

### 6.3 접근성 준수

- **대비율:** ~11:1 (WCAG AAA 초과)
- **포커스 표시:** 명확한 `outline` 스타일
- **터치 타겟:** 최소 44px (모바일 최적화)

### 6.4 레이아웃 토큰

| 변수 | 값 | 설명 |
|------|-----|------|
| `--header-height` | `56px` | 헤더 높이 |
| `--sidebar-width` | `240px` | 사이드바 너비 |
| `--bottom-nav-height` | `56px` | 모바일 하단 네비 높이 |
| `--touch-target-min` | `44px` | 최소 터치 영역 |
| `--content-max-width` | `980px` | 콘텐츠 최대 너비 |

### 6.5 클래스 유틸리티

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 사용 예시
<div class={cn(
  "base-class",
  isActive() && "active-class",
  variant === "primary" ? "primary" : "secondary"
)} />
```

---

## 7. 국제화 (i18n)

### 7.1 구현 방식

URL 경로 기반 언어 감지를 사용하는 `@solid-primitives/i18n` 라이브러리:

```
/about      → 영어 (기본)
/ko/about   → 한국어
```

### 7.2 I18nProvider

```tsx
// 컴포넌트에서 사용
import { useLanguage } from '~/components/providers';

const { t, lang, isKorean, localizedPath } = useLanguage();

// 번역 접근
t().nav.home      // "Home" 또는 "홈"
t().nav.sitemap   // "Sitemap" 또는 "사이트맵"

// 언어 확인
isKorean()        // true/false

// 로컬라이즈된 경로
localizedPath('/privacy')  // "/privacy" 또는 "/ko/privacy"
```

### 7.3 재익스포트 패턴

한국어 페이지는 영어 컴포넌트를 재익스포트하여 코드 중복을 방지:

```tsx
// src/routes/ko/privacy.tsx
export { default } from '../privacy';
```

---

## 8. PWA (Progressive Web App)

### 8.1 PWA 설정

```typescript
// pwa.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    navigateFallback: '/offline/',
    runtimeCaching: [/* 캐싱 전략 */],
  },
  manifest: false, // public/manifest.webmanifest 사용
});
```

### 8.2 캐싱 전략

| 리소스 | 전략 | 만료 기간 |
|--------|------|-----------|
| Google Fonts | CacheFirst | 1년 |
| 이미지 | CacheFirst | 30일 |
| HTML | NetworkFirst | 즉시 재검증 |

### 8.3 오프라인 지원

- **Fallback 페이지:** `/offline/`
- **서비스 워커:** Workbox 기반 자동 생성
- **업데이트:** 자동 업데이트 (`autoUpdate`)

### 8.4 웹 앱 매니페스트

```json
{
  "name": "Sound Blue",
  "short_name": "SoundBlue",
  "display": "standalone",
  "background_color": "#faf9f7",
  "theme_color": "#1c1917",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" },
    { "src": "/icons/icon-maskable-512.png", "purpose": "maskable" }
  ]
}
```

---

## 9. 테스트 전략

### 9.1 유닛 테스트 (Vitest)

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

**테스트 파일:**

| 파일 | 테스트 대상 |
|------|-------------|
| `src/lib/utils.test.ts` | cn() 유틸리티 |
| `src/components/*.test.tsx` | 컴포넌트 |
| `src/utils/*.test.ts` | 유틸리티 함수 |

**테스트 명령어:**

```bash
pnpm test           # 워치 모드
pnpm test:run       # 단일 실행
pnpm test:coverage  # 커버리지 포함
```

### 9.2 E2E 테스트 (Playwright)

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'Mobile Chrome', use: devices['Pixel 5'] },
    { name: 'Mobile Safari', use: devices['iPhone 12'] },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
  },
});
```

**E2E 테스트 스위트:**

| 파일 | 테스트 범위 |
|------|-------------|
| `accessibility.spec.ts` | 접근성 준수 |
| `i18n.spec.ts` | 다국어 기능 |
| `navigation.spec.ts` | 라우트 전환 |
| `pages.spec.ts` | 페이지 콘텐츠 |
| `pwa.spec.ts` | PWA 기능 |
| `seo.spec.ts` | SEO 검증 |

---

## 10. 보안

### 10.1 보안 헤더 (Cloudflare Pages)

```
# public/_headers

/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), ...
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; ...
```

### 10.2 보안 헤더 설명

| 헤더 | 목적 |
|------|------|
| **HSTS** | HTTPS 강제 (1년, 서브도메인 포함) |
| **CSP** | 스크립트/리소스 소스 제한 |
| **COOP/COEP** | 교차 출처 격리 |
| **X-Frame-Options** | 클릭재킹 방지 |
| **Permissions-Policy** | 불필요한 API 비활성화 |

### 10.3 COEP: credentialless

`credentialless`를 사용하여 YouTube 등 외부 콘텐츠 임베딩을 허용하면서 보안 유지.

---

## 11. 배포 인프라

### 11.1 Cloudflare Pages

| 기능 | 설명 |
|------|------|
| **글로벌 CDN** | 전 세계 엣지 서버 배포 |
| **자동 HTTPS** | SSL 인증서 자동 관리 |
| **Git 통합** | GitHub 푸시 시 자동 빌드/배포 |
| **Preview 배포** | PR별 미리보기 URL |
| **Web Analytics** | 프라이버시 친화적 분석 |

### 11.2 배포 명령어

```bash
# 로컬 개발 서버 (Wrangler)
pnpm pages:dev

# 프로덕션 배포
pnpm pages:deploy
```

### 11.3 캐싱 전략

| 리소스 | 캐시 정책 |
|--------|----------|
| HTML | `no-cache, must-revalidate` |
| JS/CSS (hashed) | `1년, immutable` |
| 이미지 | `1년, immutable` |
| 폰트 | `1년, immutable + CORS` |
| PWA 매니페스트 | `1일, stale-while-revalidate` |
| 서비스 워커 | `no-cache, must-revalidate` |
| SEO 파일 | `1일, stale-while-revalidate` |

---

## 12. SEO 최적화

### 12.1 사이트맵 구조

```
sitemap_index.xml (인덱스)
 ├── sitemap-pages.xml (정적 페이지)
 ├── sitemap-blog.xml (향후: 블로그)
 └── sitemap-tracks.xml (향후: 녹음물)
```

### 12.2 다국어 hreflang

```xml
<url>
  <loc>https://soundbluemusic.com/about/</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://soundbluemusic.com/about/"/>
  <xhtml:link rel="alternate" hreflang="ko" href="https://soundbluemusic.com/ko/about/"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://soundbluemusic.com/about/"/>
</url>
```

### 12.3 AI 크롤러 최적화

**llms.txt:**
- AI 어시스턴트용 사이트 요약 파일
- 위치: `/llms.txt`
- 표준: [llmstxt.org](https://llmstxt.org/)

**robots.txt AI 크롤러 허용:**

| 서비스 | User-agent |
|--------|------------|
| OpenAI (ChatGPT) | `GPTBot`, `ChatGPT-User` |
| Anthropic (Claude) | `Claude-Web`, `anthropic-ai` |
| Google (Gemini) | `Google-Extended` |
| Perplexity | `PerplexityBot` |
| Amazon | `Amazonbot` |

### 12.4 PageSeo 컴포넌트

```tsx
<PageSeo
  title="About"
  description="About SoundBlueMusic"
  path="/about"
  type="website"
/>
```

---

## 13. 성능 최적화

### 13.1 번들 최적화

- **코드 스플리팅:** 라우트별 자동 분할
- **트리 쉐이킹:** 미사용 코드 제거
- **압축:** Brotli (우선) + Gzip (폴백)

### 13.2 이미지 최적화

```tsx
<OptimizedImage
  src="/images/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

- **포맷:** WebP 자동 변환 (Sharp)
- **지연 로딩:** `loading="lazy"`
- **반응형:** `srcset` 자동 생성

### 13.3 폰트 최적화

- **시스템 폰트 우선:** `-apple-system, BlinkMacSystemFont, ...`
- **Google Fonts 캐싱:** 1년 CacheFirst

### 13.4 CSS 최적화

- **순수 CSS 파티클:** JavaScript 없는 시각 효과
- **CSS 변수:** 테마 전환 시 리페인트 최소화
- **Tailwind JIT:** 사용된 클래스만 번들에 포함

---

## 14. 개발 도구 및 코드 품질

### 14.1 Biome (린터 + 포매터)

```json
// biome.json
{
  "linter": {
    "rules": {
      "correctness": { "noUnusedImports": "error" },
      "style": { "useImportType": "error" },
      "suspicious": { "noExplicitAny": "error" },
      "a11y": { "recommended": true }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  }
}
```

### 14.2 TypeScript 설정

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 14.3 Git 훅 (Husky + lint-staged)

```bash
# 커밋 전 자동 실행
biome check --write --no-errors-on-unmatched
```

### 14.4 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 시작 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm check` | 린트 + 포맷 검사 |
| `pnpm typecheck` | TypeScript 검사 |
| `pnpm validate` | 전체 검증 (타입 + 린트 + 테스트) |

---

## 15. 의존성 분석

### 15.1 프로덕션 의존성 (8개)

| 패키지 | 버전 | 크기 (approx) | 역할 |
|--------|------|---------------|------|
| `solid-js` | 1.9.10 | ~7KB | UI 라이브러리 |
| `@solidjs/start` | 1.2.0 | - | 메타 프레임워크 |
| `@solidjs/router` | 0.15.4 | ~5KB | 라우팅 |
| `@solidjs/meta` | 0.29.4 | ~1KB | 메타 태그 |
| `@solid-primitives/i18n` | 2.2.1 | ~2KB | 국제화 |
| `vinxi` | 0.5.9 | - | 빌드 시스템 |
| `class-variance-authority` | 0.7.1 | ~2KB | 컴포넌트 변형 |
| `tailwind-merge` + `clsx` | 3.4.0 + 2.1.1 | ~3KB | 클래스 병합 |

### 15.2 개발 의존성 (20개)

| 카테고리 | 패키지 |
|----------|--------|
| **빌드** | tailwindcss, vite-plugin-solid, vite-plugin-compression |
| **테스트** | vitest, @playwright/test, jsdom |
| **품질** | @biomejs/biome, typescript |
| **Git** | husky, lint-staged |
| **최적화** | sharp, rollup-plugin-visualizer |
| **배포** | wrangler |

### 15.3 Node.js 요구사항

```json
{
  "engines": { "node": ">=20.0.0" },
  "packageManager": "pnpm@10.25.0"
}
```

---

## 부록

### A. 명령어 참조

```bash
# 개발
pnpm dev                # Vinxi 개발 서버
pnpm build              # 프로덕션 빌드 + 사이트맵
pnpm start              # 프로덕션 서버

# 품질 검사
pnpm lint               # Biome 린트
pnpm format             # Biome 포맷
pnpm check              # 린트 + 포맷
pnpm typecheck          # TypeScript 검사
pnpm validate           # 전체 검증

# 테스트
pnpm test               # Vitest 워치 모드
pnpm test:run           # Vitest 단일 실행
pnpm test:coverage      # 커버리지 리포트
pnpm test:e2e           # Playwright E2E
pnpm test:e2e:ui        # Playwright UI 모드

# 배포
pnpm pages:dev          # Wrangler 로컬 서버
pnpm pages:deploy       # Cloudflare 배포

# 유틸리티
pnpm optimize:images    # 이미지 최적화
pnpm clean              # 빌드 아티팩트 정리
```

### B. 파일 명명 규칙

| 타입 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase.tsx | `Header.tsx` |
| 유틸리티 | camelCase.ts | `storage.ts` |
| 테스트 | *.test.ts(x) | `Button.test.tsx` |
| 클라이언트 전용 | *.client.tsx | `BottomSheet.client.tsx` |
| 상수 | camelCase.ts | `brand.ts` |
| 훅 | use*.ts | `useViewTransitionNavigate.ts` |

### C. 브라우저 지원

```json
{
  "browserslist": {
    "production": [
      "last 2 chrome versions",
      "last 2 firefox versions",
      "last 2 safari versions",
      "last 2 edge versions",
      "not dead"
    ]
  }
}
```

---

**문서 버전:** 1.0
**최종 수정일:** 2025-12-15
**작성자:** Claude Code (AI Assistant)
