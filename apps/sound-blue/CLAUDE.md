# CLAUDE.md - AI Assistant Guide for Sound Blue (AI 어시스턴트 가이드)

## Project Overview (프로젝트 개요)

**Sound Blue** is the official website for music artist SoundBlueMusic. Built with **SolidStart 1.2 + SolidJS 1.9 + TypeScript + Tailwind CSS**, deployed on Cloudflare Pages as a static site.
(음악 아티스트 SoundBlueMusic의 공식 웹사이트. SolidStart 1.2 + SolidJS 1.9 + TypeScript + Tailwind CSS로 구축, Cloudflare Pages에 정적 사이트로 배포.)

**Live Site (라이브 사이트):** https://soundbluemusic.com
**Version (버전):** 3.0.18-베타

### Architecture (아키텍처)

**100% Static Client-Side Site** - No backend server required.
(**100% 정적 클라이언트 사이드 사이트** - 백엔드 서버 없음.)

- All pages are pre-rendered at build time using Vinxi static adapter
  (Vinxi 정적 어댑터로 빌드 시 모든 페이지 사전 렌더링)
- Deployed as static files to Cloudflare Pages
  (Cloudflare Pages에 정적 파일로 배포)
- Client-side routing with SolidJS Router (SPA navigation)
  (SolidJS Router로 클라이언트 사이드 라우팅, SPA 네비게이션)
- No API endpoints, no database, no server-side logic
  (API 엔드포인트 없음, 데이터베이스 없음, 서버 사이드 로직 없음)

### Visual Effects (시각 효과)

**Pure CSS Particles** - lightweight visual effects with no JavaScript.
(**순수 CSS 파티클** - JavaScript 없는 가벼운 시각 효과.)

- Component: `CSSParticles` - floating particle animation on home page
  (컴포넌트: `CSSParticles` - 홈 페이지의 부유 파티클 애니메이션)
- Location: `src/components/background/CSSParticles.tsx`
- CSS: `src/global.css` (.css-particles, .particle classes)
- Benefits: ~0KB JS, no click blocking, works with SSR
  (장점: ~0KB JS, 클릭 차단 없음, SSR 호환)

## Technology Stack (기술 스택)

| Category (카테고리) | Technology (기술) | Version (버전) |
| ------------------ | ----------------- | -------------- |
| Framework          | SolidStart        | 1.2.x          |
| Bundler            | Vinxi             | 0.5.x          |
| UI Library         | SolidJS           | 1.9.x          |
| Visual Effects     | Pure CSS Particles| -              |
| Language           | TypeScript        | 5.9            |
| Styling            | Tailwind CSS      | 4.x            |
| Linter/Format      | Biome             | 2.x            |
| i18n               | @solid-primitives/i18n | 2.x       |
| PWA                | vite-plugin-pwa   | 1.2.x          |
| Unit Tests         | Vitest            | 4.x            |
| E2E Tests          | Playwright        | 1.57+          |
| Deployment         | Cloudflare Pages  | -              |
| Analytics          | Cloudflare Web Analytics | -        |
| Security           | COOP/COEP/CSP     | -              |

**Node.js:** >=20.0.0
**Package Manager (패키지 매니저):** pnpm@10.25.0

## Directory Structure (디렉토리 구조)

```
sound-blue/
├── src/                          # SolidStart source (소스 코드)
│   ├── app.tsx                   # Root app component (루트 앱 컴포넌트)
│   ├── entry-client.tsx          # Client entry (클라이언트 진입점)
│   ├── entry-server.tsx          # Server entry (서버 진입점)
│   ├── global.css                # Global styles (전역 스타일)
│   ├── vite-env.d.ts             # Vite environment types
│   │
│   ├── components/               # SolidJS components (SolidJS 컴포넌트)
│   │   ├── Header.tsx            # Header with theme/language toggles (헤더)
│   │   ├── Footer.tsx            # Footer with legal links (푸터)
│   │   ├── NavigationLayout.tsx  # Layout wrapper (레이아웃 래퍼)
│   │   ├── ErrorBoundary.tsx     # App error boundary (에러 바운더리)
│   │   ├── ClientOnly.tsx        # Client-only wrapper (클라이언트 전용 래퍼)
│   │   ├── index.ts              # Barrel export (배럴 익스포트)
│   │   ├── background/           # Visual effects (시각 효과)
│   │   │   ├── CSSParticles.tsx  # Pure CSS particles (순수 CSS 파티클)
│   │   │   └── index.ts
│   │   ├── chat/                 # Chat components (채팅 컴포넌트)
│   │   │   ├── ChatContainer.tsx # Chat container with NLP (채팅 컨테이너)
│   │   │   ├── ChatInput.tsx     # Chat input field (채팅 입력)
│   │   │   ├── ChatMessage.tsx   # Chat message bubble (채팅 메시지)
│   │   │   ├── InfoPanel.tsx     # Topic info panel (주제 정보 패널)
│   │   │   └── index.ts
│   │   ├── home/                 # Home page components (홈 컴포넌트)
│   │   │   ├── HomeContent.tsx
│   │   │   └── index.ts
│   │   ├── navigation/           # Navigation components (네비게이션)
│   │   │   ├── Sidebar.tsx       # Desktop sidebar (데스크톱 사이드바)
│   │   │   ├── BottomNav.tsx     # Mobile bottom nav (모바일 하단 네비)
│   │   │   └── index.ts
│   │   ├── seo/                  # SEO components (SEO 컴포넌트)
│   │   │   ├── PageSeo.tsx       # Page meta tags (페이지 메타 태그)
│   │   │   └── index.ts
│   │   ├── ui/                   # UI primitives (UI 기본 요소)
│   │   │   ├── BottomSheet.tsx   # Bottom sheet modal (바텀 시트)
│   │   │   ├── BottomSheet.client.tsx # Client-only export (클라이언트 전용)
│   │   │   ├── Button.tsx        # Button component with cva (버튼 컴포넌트)
│   │   │   ├── OptimizedImage.tsx # Optimized image component (최적화된 이미지)
│   │   │   ├── SearchBox.tsx     # Search input (검색 입력)
│   │   │   ├── ThemeIcon.tsx     # Theme toggle icon (테마 토글)
│   │   │   └── index.ts
│   │   └── providers/            # Context providers (컨텍스트 제공자)
│   │       ├── ThemeProvider.tsx # Theme context (테마 컨텍스트)
│   │       ├── I18nProvider.tsx  # i18n context (다국어 컨텍스트)
│   │       ├── KeyboardShortcutsProvider.tsx  # Keyboard shortcuts (키보드 단축키)
│   │       └── index.ts
│   │
│   ├── lib/                      # Library utilities (라이브러리 유틸)
│   │   └── utils.ts              # cn() - class name merge
│   │
│   ├── styles/                   # Design system (디자인 시스템)
│   │   └── tailwind.css          # Tailwind + CSS variables
│   │
│   ├── utils/                    # Utilities (유틸리티)
│   │   ├── storage.ts            # LocalStorage helpers
│   │   └── index.ts
│   │
│   ├── constants/                # Constants (상수)
│   │   ├── brand.ts              # Brand config (브랜드 설정)
│   │   ├── icons.tsx             # Icon components (아이콘)
│   │   ├── navigation.tsx        # Navigation config (네비게이션 설정)
│   │   └── index.ts
│   │
│   ├── hooks/                    # Custom hooks (커스텀 훅)
│   │   ├── useViewTransitionNavigate.ts  # View transition hook
│   │   └── index.ts
│   │
│   ├── test/
│   │   └── setup.ts              # Vitest setup (테스트 설정)
│   │
│   └── routes/                   # File-based routing (파일 기반 라우팅)
│       ├── index.tsx             # Home page (홈, /)
│       ├── about.tsx             # About page (/about)
│       ├── news.tsx              # News page (/news)
│       ├── blog.tsx              # Blog page (/blog)
│       ├── built-with.tsx        # Built with page (/built-with)
│       ├── chat.tsx              # Chat assistant (/chat)
│       ├── privacy.tsx           # Privacy policy (/privacy)
│       ├── terms.tsx             # Terms of service (/terms)
│       ├── license.tsx           # License info (/license)
│       ├── sitemap.tsx           # Sitemap page (/sitemap)
│       ├── sound-recording.tsx   # Sound recording (/sound-recording)
│       ├── offline.tsx           # PWA offline fallback (/offline)
│       ├── [...404].tsx          # 404 error page (404 에러 페이지)
│       └── ko/                   # Korean routes (한국어 라우트)
│           ├── index.tsx         # /ko (Home)
│           ├── about.tsx         # /ko/about
│           ├── news.tsx          # /ko/news
│           ├── blog.tsx          # /ko/blog
│           ├── built-with.tsx    # /ko/built-with
│           ├── chat.tsx          # /ko/chat
│           ├── privacy.tsx       # /ko/privacy
│           ├── terms.tsx         # /ko/terms
│           ├── license.tsx       # /ko/license
│           ├── sitemap.tsx       # /ko/sitemap
│           └── sound-recording.tsx
│
├── e2e/                          # Playwright E2E tests (E2E 테스트)
│   ├── accessibility.spec.ts     # Accessibility tests (접근성 테스트)
│   ├── i18n.spec.ts              # i18n tests (다국어 테스트)
│   ├── navigation.spec.ts        # Navigation tests (네비게이션 테스트)
│   ├── pages.spec.ts             # Page content tests (페이지 테스트)
│   ├── pwa.spec.ts               # PWA tests (PWA 테스트)
│   └── seo.spec.ts               # SEO tests (SEO 테스트)
│
├── public/                       # Static assets (정적 자산)
│   ├── icons/                    # PWA icons (PWA 아이콘)
│   ├── llms.txt                  # LLM context file for AI crawlers
│   ├── og-image.png              # OG image (PNG)
│   ├── og-image.webp             # OG image (WebP)
│   ├── favicon.ico               # Favicon
│   ├── browserconfig.xml         # Windows tile config
│   ├── sitemap.xsl               # Sitemap stylesheet
│   ├── manifest.webmanifest      # PWA manifest
│   ├── _headers                  # Cloudflare security headers
│   └── _redirects                # Cloudflare redirects
│
├── scripts/                      # Build scripts (빌드 스크립트)
│   ├── add-sitemap-stylesheet.mjs # Add XSL to sitemap (사이트맵 스타일시트)
│   ├── generate-icons.mjs        # PWA icon generation (PWA 아이콘 생성)
│   ├── generate-sitemap.mjs      # Sitemap generation (사이트맵 생성)
│   └── optimize-images.mjs       # Image optimization (이미지 최적화)
│
├── app.config.ts                 # SolidStart config (SolidStart 설정)
├── biome.json                    # Biome config
├── playwright.config.ts          # Playwright config
├── vitest.config.ts              # Vitest config
└── wrangler.jsonc                # Cloudflare Wrangler config
```

**Codebase Structure Note (코드베이스 구조 참고):**
- `src/` - **Active** SolidStart code (활성 SolidStart 코드)

**Note (참고):** `sitemap.xml`, `robots.txt`, and service worker are auto-generated during build.
(sitemap.xml, robots.txt, 서비스 워커는 빌드 시 자동 생성됨.)

## Pages (페이지)

| Path (경로)       | Korean (한국어)      | Description (설명)       |
| ----------------- | -------------------- | ------------------------ |
| `/`               | `/ko`                | Home (홈)                |
| `/about`          | `/ko/about`          | About (소개)             |
| `/news`           | `/ko/news`           | News (뉴스)              |
| `/blog`           | `/ko/blog`           | Blog (블로그)            |
| `/built-with`     | `/ko/built-with`     | Built with (제작 도구)    |
| `/sitemap`        | `/ko/sitemap`        | Site navigation (사이트맵)|
| `/sound-recording`| `/ko/sound-recording`| Sound recording (녹음물)  |
| `/chat`           | `/ko/chat`           | Chat assistant (채팅)     |
| `/privacy`        | `/ko/privacy`        | Privacy policy (개인정보) |
| `/terms`          | `/ko/terms`          | Terms of service (이용약관)|
| `/license`        | `/ko/license`        | License info (라이선스)   |
| `/offline`        | -                    | PWA offline (오프라인)    |

## Chat System (채팅 시스템)

Natural language interface for site Q&A and navigation.
(사이트 Q&A 및 탐색을 위한 자연어 인터페이스.)

### Chat Components (채팅 컴포넌트)

| Component | File | Description |
|-----------|------|-------------|
| `ChatContainer` | `src/components/chat/ChatContainer.tsx` | Main chat interface with NLP parsing (메인 채팅 인터페이스, NLP 파싱) |
| `ChatInput` | `src/components/chat/ChatInput.tsx` | Message input field with IME support (메시지 입력 필드, IME 지원) |
| `ChatMessage` | `src/components/chat/ChatMessage.tsx` | Message bubble component (메시지 버블 컴포넌트) |
| `InfoPanel` | `src/components/chat/InfoPanel.tsx` | Topic info panel with page links (주제별 정보 패널) |

### Topic Detection (주제 감지)

Keywords are matched to detect user intent:
(키워드 매칭으로 사용자 의도 감지:)

```tsx
// Topic keyword mapping (주제 키워드 매핑)
const TOPIC_KEYWORDS = {
  about: ['sound blue', 'who', 'artist', '사운드블루', '누구'],
  music: ['music', 'song', 'genre', '음악', '노래', '장르'],
  license: ['license', 'copyright', 'use', '라이선스', '저작권'],
  contact: ['youtube', 'contact', 'link', '유튜브', '연락'],
  builtWith: ['tech', 'stack', 'built', '기술', '스택'],
  // ... more topics
};
```

### Korean Auto-Redirect (한국어 자동 리다이렉트)

When Korean text ratio exceeds 70%, auto-redirects to `/ko/chat/`:
(한국어 비율이 70% 초과 시 `/ko/chat/`으로 자동 리다이렉트:)

```tsx
// Chat state is saved before redirect (리다이렉트 전 채팅 상태 저장)
setStorageItem('sb-chat-state', {
  pendingMessage: message,
  history: messages,
});
navigate('/ko/chat/');
```

### Usage Example (사용 예시)

```tsx
import { ChatContainer } from '~/components/chat';
import { InfoPanel } from '~/components/chat';

function ChatPage() {
  const [selectedTopic, setSelectedTopic] = createSignal<TopicType>(null);

  return (
    <div class="flex">
      <ChatContainer onTopicSelect={setSelectedTopic} />
      <InfoPanel selectedTopic={selectedTopic()} />
    </div>
  );
}
```

## Sitemap Structure Template (사이트맵 구조 템플릿)

XML Sitemap architecture for SEO with multi-language (hreflang) support.
(SEO를 위한 다국어 hreflang 지원 XML 사이트맵 구조.)

```
[SITEMAP STRUCTURE TEMPLATE]
TARGET_DOMAIN: soundbluemusic.com
DEFAULT_LANG: en (Root)
SECONDARY_LANG: ko (Sub-path)
X-DEFAULT: en (fallback for unspecified language users)

ROOT: https://soundbluemusic.com/sitemap_index.xml
 ┃
 ┣━━ sitemap-pages.xml (Static Pages)
 ┃    ┠── Homepage: / + /ko/
 ┃    ┠── About: /about/ + /ko/about/
 ┃    ┠── Sitemap: /sitemap/ + /ko/sitemap/
 ┃    ┠── News: /news/ + /ko/news/
 ┃    ┠── Blog: /blog/ + /ko/blog/
 ┃    ┠── Built With: /built-with/ + /ko/built-with/
 ┃    ┠── Privacy: /privacy/ + /ko/privacy/
 ┃    ┠── Terms: /terms/ + /ko/terms/
 ┃    ┠── License: /license/ + /ko/license/
 ┃    ┠── Sound Recording: /sound-recording/ + /ko/sound-recording/
 ┃    ┗── Chat: /chat/ + /ko/chat/
 ┃
 ┣━━ sitemap-blog.xml (Future: Blog Posts)
 ┗━━ sitemap-tracks.xml (Future: Sound Recordings)
```

**Key fields (주요 필드):**
- **X-DEFAULT**: Fallback URL for undetected language (언어 미감지 시 대체 URL)
- **LASTMOD**: Last modification date, auto-generated (마지막 수정일, 자동 생성)

**Configuration (설정):** `scripts/generate-sitemap.mjs`
**Generated files (생성 파일):** `sitemap_index.xml`, `sitemap-pages.xml`, `robots.txt`

## Internationalization (국제화)

This project uses `@solid-primitives/i18n` with URL-based language detection via `I18nProvider`.
(URL 기반 언어 감지를 사용하는 `@solid-primitives/i18n` + `I18nProvider` 구현.)

### Language Detection (언어 감지)

Language is detected from URL path:
(URL 경로에서 언어 감지:)
- `/ko/*` routes → Korean (한국어)
- All other routes → English (영어)

### I18nProvider Usage (I18nProvider 사용)

```tsx
import { useLanguage } from '~/components/providers';

// In component (컴포넌트 내에서)
const { t, lang, isKorean, localizedPath } = useLanguage();

// Access translations (번역 접근)
t().nav.home      // "Home" or "홈"
t().nav.sitemap   // "Sitemap" or "사이트맵"

// Check language (언어 확인)
isKorean()        // true/false

// Get localized path (로컬라이즈된 경로 가져오기)
localizedPath('/privacy')  // "/privacy" or "/ko/privacy"
```

### Pattern: Re-export (재익스포트 패턴)

Korean pages re-export the English component. Language is detected from URL.
(한국어 페이지는 영어 컴포넌트를 재익스포트. 언어는 URL에서 감지.)

```tsx
// src/routes/privacy.tsx - Main component (메인 컴포넌트)
import { useLanguage } from '~/components/providers';

export default function PrivacyPage() {
  const { t, isKorean } = useLanguage();
  return (
    <div>
      <h1>{isKorean() ? '개인정보처리방침' : 'Privacy Policy'}</h1>
    </div>
  );
}

// src/routes/ko/privacy.tsx - Just re-export! (재익스포트만!)
export { default } from '../privacy';
```

## Theme System (테마 시스템)

- Two modes: `light`, `dark` (두 가지 모드: 라이트, 다크)
- System preference + manual override (시스템 설정 + 수동 전환)
- `data-theme` attribute on `<html>` (html 태그의 data-theme 속성)
- LocalStorage key: `sb-theme` (로컬스토리지 키)
- FOUC prevention in `app.tsx` (FOUC 방지)

```tsx
import { useTheme } from '~/components/providers/ThemeProvider';

const { theme, toggleTheme, setTheme } = useTheme();
```

## Navigation Layout (네비게이션 레이아웃)

All pages must use `NavigationLayout`.
(모든 페이지는 NavigationLayout을 사용해야 함.)

```tsx
import { NavigationLayout } from '~/components';

export default function MyPage() {
  return <NavigationLayout>{/* Page content (페이지 내용) */}</NavigationLayout>;
}
```

Includes (포함): Header, Sidebar (desktop), BottomNav (mobile), Footer

## UI Components (UI 컴포넌트)

The project uses custom UI components with class-variance-authority.
(class-variance-authority를 사용한 커스텀 UI 컴포넌트.)

```tsx
import { Button, SearchBox, ThemeIcon } from '~/components/ui';

// Button variants (버튼 변형)
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With A tag (A 태그와 함께)
import { A } from '@solidjs/router';
<Button as={A} href="/path">Link Button</Button>
```

**Available UI components (사용 가능한 UI 컴포넌트)** - `~/components/ui`:
- `BottomSheetClient` - Bottom sheet modal, client-only (바텀 시트, 클라이언트 전용)
- `Button`, `buttonVariants`, `LinkButton` - Action buttons (액션 버튼)
- `OptimizedImage` - Optimized image with lazy loading (지연 로딩 최적화 이미지)
- `SearchBox` - Search input (검색 입력)
- `ThemeIcon` - Theme toggle icon (테마 토글 아이콘)

**Available main components (메인 컴포넌트)** - `~/components`:
- `ClientOnly` - Wrapper for client-only rendering (클라이언트 전용 렌더링 래퍼)
- `Header` - Site header (사이트 헤더)
- `Footer` - Site footer (사이트 푸터)
- `NavigationLayout` - Full layout wrapper (전체 레이아웃 래퍼)
- `AppErrorBoundary` - Error boundary wrapper (에러 바운더리 래퍼)
- `CSSParticles` - Pure CSS particles (순수 CSS 파티클)
- `ChatContainer`, `ChatInput`, `ChatMessage`, `ToolLinkPanel` - Chat components (채팅 컴포넌트)
- `HomeContent` - Home page content (홈 페이지 콘텐츠)
- `Sidebar` - Desktop navigation (데스크톱 네비게이션)
- `BottomNav` - Mobile navigation (모바일 네비게이션)
- `PageSeo` - Page SEO meta tags (페이지 SEO 메타 태그)
- `I18nProvider`, `useLanguage` - i18n context and hook (다국어 컨텍스트와 훅)
- `KeyboardShortcutsProvider`, `useKeyboardShortcuts` - Keyboard shortcuts (키보드 단축키)

## Accessibility (접근성)

Built-in accessibility features.
(내장된 접근성 기능.)

- **Skip to content**: Keyboard-accessible skip link (키보드 접근 가능한 스킵 링크)
- **ARIA labels**: All interactive elements have proper labels (모든 인터랙티브 요소에 적절한 레이블)
- **Focus visible**: Clear focus indicators (명확한 포커스 표시)
- **Semantic HTML**: Proper heading hierarchy and landmarks (적절한 헤딩 구조와 랜드마크)

```tsx
// Skip to content (콘텐츠로 건너뛰기)
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>

// Main content landmark (메인 콘텐츠 랜드마크)
<main id="main-content" role="main" aria-label="Main content">
  {children}
</main>
```

## Brand Configuration (브랜드 설정)

Centralized in `src/constants/brand.ts`.
(src/constants/brand.ts에 중앙 집중화.)

```typescript
export const BRAND = {
  name: 'Sound Blue',
  subtitle: 'SoundBlueMusic',
  tagline: 'SoundBlueMusic',
  copyrightHolder: 'SoundBlueMusic',
  siteUrl: 'https://soundbluemusic.com',
  githubUrl: 'https://github.com/soundbluemusic/sound-blue',
  description: { ko: '...', en: '...' },
  shareTitle: { ko: '...', en: '...' },
};
```

**Note (참고):** This file is designed for easy forking - modify these values to apply your branding site-wide.
(포크하기 쉽게 설계됨 - 이 값들을 수정하여 사이트 전체에 브랜딩 적용.)

## Navigation Configuration (네비게이션 설정)

Centralized navigation in `src/constants/navigation.tsx`.
(src/constants/navigation.tsx에 네비게이션 중앙 집중화.)

```typescript
import { NAV_ITEMS, EXTERNAL_NAV_ITEMS, isNavActive } from '~/constants';
import { useLanguage } from '~/components/providers';

const { t, localizedPath } = useLanguage();

// NAV_ITEMS - Main navigation (메인 네비게이션)
// Includes: home, about, news, blog, soundRecording, builtWith, sitemap
NAV_ITEMS.map(item => ({
  path: item.path,           // Internal route path (내부 라우트 경로)
  labelKey: item.labelKey,   // Translation key (번역 키: 'home', 'about', 'news', etc.)
  icon: item.icon,           // SolidJS icon component (아이콘 컴포넌트)
}));

// Access label via translation (번역으로 레이블 접근)
t().nav[item.labelKey]       // "Home", "About" or "홈", "소개"

// EXTERNAL_NAV_ITEMS - External links (외부 링크: tools)
// isNavActive(path, pathname, localizedPath) - Check if path is active (경로 활성화 확인)
```

**Usage (사용):** Navigation items are shared between `Sidebar.tsx` and `BottomNav.tsx`.
(네비게이션 항목은 Sidebar.tsx와 BottomNav.tsx에서 공유.)

## CSS Variables (CSS 변수) - Eye-Friendly Aesthetic Design System

Design tokens defined in `src/styles/tailwind.css` with eye-friendly colors.
(눈에 편안한 색상의 디자인 토큰, src/styles/tailwind.css에 정의.)

- **Light Mode**: "Warm Ivory" - cream-colored paper inspired (크림색 종이 영감)
- **Dark Mode**: "Midnight Forest" - cool charcoal with blue-green undertones (차분한 청록 톤)

```css
/* ============================================
 * Colors - Light Mode (Warm Ivory)
 * ============================================ */
--color-bg-primary: #F7F5F0;
--color-bg-secondary: #EFEDE8;
--color-bg-tertiary: #E5E3DE;
--color-bg-elevated: #FFFFFF;
--color-bg-glass: rgba(247, 245, 240, 0.72);

--color-text-primary: #2D2A26;
--color-text-secondary: #6B6560;
--color-text-tertiary: #9A9590;

--color-border-primary: #D9D5CE;
--color-border-focus: #C9553D;

--color-interactive-hover: rgba(45, 42, 38, 0.04);
--color-interactive-active: rgba(45, 42, 38, 0.08);

/* Brand/Accent - Muted Terracotta */
--color-accent-primary: #C9553D;
--color-accent-hover: #B34832;

/* Semantic Colors */
--color-error: #B54A4A;
--color-success: #5A8A6E;
--color-warning: #B8923E;
--color-info: #4A7C8B;

/* ============================================
 * Layout
 * ============================================ */
--header-height: 56px;
--header-height-mobile: 52px;
--sidebar-width: 240px;
--sidebar-collapsed-width: 72px;
--bottom-nav-height: 56px;
--touch-target-min: 44px;
--content-max-width: 980px;

/* ============================================
 * Border Radius
 * ============================================ */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* ============================================
 * Shadows - Warm charcoal tones
 * ============================================ */
--shadow-sm: 0 1px 2px rgba(45, 42, 38, 0.04);
--shadow-md: 0 2px 4px rgba(45, 42, 38, 0.04), 0 1px 2px rgba(45, 42, 38, 0.02);
--shadow-lg: 0 4px 12px rgba(45, 42, 38, 0.06);
--shadow-card: 0 1px 2px rgba(45, 42, 38, 0.02);

/* ============================================
 * Blur - Frosted glass effects
 * ============================================ */
--blur-sm: 8px;
--blur-md: 16px;
--blur-lg: 24px;

/* ============================================
 * Transitions
 * ============================================ */
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 350ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

Dark mode (다크 모드): `[data-theme='dark']` selector overrides with "Midnight Forest" theme.

## Path Aliases (경로 별칭)

```json
{
  "~/*": ["./src/*"]
}
```

**Notes (참고):**
- `~/*` - SolidStart src folder (SolidStart src 폴더)
- Example: `~/components`, `~/utils`, `~/constants`

## Commands (명령어)

```bash
# Development (개발)
pnpm dev                # Vinxi dev server (Vinxi 개발 서버)
pnpm build              # Production build with sitemap (프로덕션 빌드, 사이트맵 포함)
pnpm start              # Start production server (프로덕션 서버 시작)

# Cloudflare Pages (클라우드플레어 페이지)
pnpm pages:dev          # Local Wrangler dev server (로컬 래글러 서버)
pnpm pages:deploy       # Build and deploy (빌드 및 배포)

# Quality (품질 검사) - Biome
pnpm lint               # Biome lint (린트)
pnpm lint:fix           # Biome lint with auto-fix (린트 자동 수정)
pnpm format             # Biome format (포맷)
pnpm check              # Biome check (lint + format) (체크)
pnpm check:fix          # Biome check with auto-fix (체크 자동 수정)
pnpm typecheck          # TypeScript check (타입 체크)
pnpm validate           # Full validation (전체 검증)

# Testing (테스트)
pnpm test               # Vitest watch mode (Vitest 워치 모드)
pnpm test:run           # Vitest single run (단일 실행)
pnpm test:coverage      # Coverage report (커버리지 리포트)
pnpm test:e2e           # Playwright tests (Playwright 테스트)
pnpm test:e2e:ui        # Playwright UI mode (UI 모드)

# Utilities (유틸리티)
pnpm optimize:images    # Optimize images with Sharp (이미지 최적화)
pnpm clean              # Clean build artifacts (빌드 아티팩트 정리)
```

## Code Conventions (코드 컨벤션)

### TypeScript (타입스크립트)

- Strict mode enabled (엄격 모드 활성화)
- `import type { X }` for types - enforced by Biome (타입은 import type 사용)
- No unused variables/imports - enforced by Biome (미사용 변수/임포트 금지)

### SolidJS (솔리드JS)

- Functional components only (함수형 컴포넌트만 사용)
- Use signals for reactive state (반응형 상태에 시그널 사용)
- Prefer `createSignal`, `createMemo`, `createEffect` (createSignal, createMemo, createEffect 사용 권장)

### Biome Configuration (Biome 설정)

Key rules - see `biome.json` for full config.
(주요 규칙 - 전체 설정은 biome.json 참고.)

- **Linting (린팅)**: `noUnusedImports: error`, `useImportType: error`, `noExplicitAny: warn`
- **Formatting (포맷팅)**: 2 spaces, 100 line width, single quotes, trailing commas, semicolons
- **A11y (접근성)**: Recommended rules enabled (권장 규칙 활성화)
- **Pre-commit**: Husky + lint-staged runs `biome check --write` automatically (자동 실행)

### File Naming (파일 명명)

- Components (컴포넌트): `PascalCase.tsx`
- Utilities (유틸리티): `camelCase.ts`
- Tests (테스트): `*.test.ts` or `*.spec.ts`

### Imports (임포트)

Always use barrel exports.
(항상 배럴 익스포트 사용.)

```tsx
// Good (좋음)
import { Header, Footer, CSSParticles } from '~/components';
import { cn } from '~/lib/utils';

// Bad (나쁨)
import { Header } from '~/components/Header';
```

## Class Name Utility (클래스명 유틸리티)

Use `cn()` from `~/lib/utils` for conditional classes.
(조건부 클래스에 cn() 사용.)

```tsx
import { cn } from '~/lib/utils';

<div class={cn(
  'base-class',
  isActive() && 'active-class',
  variant() === 'primary' ? 'primary' : 'secondary'
)} />
```

---

## Project Rules (프로젝트 규칙)

### Required Technologies (필수 사용 기술)

#### 1. Package Manager - pnpm (패키지 매니저)
- Use pnpm only (pnpm만 사용)
- Do NOT use npm, yarn (npm, yarn 사용 금지)
- Use `pnpm dlx` instead of `npx` (npx 대신 pnpm dlx 사용)

#### 2. Language - TypeScript (언어 - 타입스크립트)
- All files must be .ts or .tsx (모든 파일은 .ts 또는 .tsx로 작성)
- Do NOT create .js, .jsx, .mjs files (.js, .jsx, .mjs 파일 생성 금지)
- Define types explicitly (타입 명시적으로 정의)
- Minimize use of `any` type (any 타입 최소화)

#### 3. Styling - Tailwind CSS (스타일링 - 테일윈드)
- Use Tailwind utility classes in className (className에 Tailwind 유틸리티 클래스 사용)
- Inline style only for dynamic values (동적 값이 필요한 경우에만 인라인 style 허용)
- External library CSS import allowed (외부 라이브러리 CSS import 허용)

### Code Quality (코드 품질)

- Use absolute path imports (`~/`) (절대 경로 import 사용)
- Remove unused imports/variables (미사용 import/변수 제거)
- Remove console.log after debugging (console.log 디버깅 후 제거)
- Error handling required (try-catch) (에러 처리 필수)
- Consider accessibility (alt, aria-label) (접근성 고려)

### Protected Files - Do NOT Modify (건드리지 않을 파일)

- `public/` folder - auto-generated build files (빌드 자동 생성 파일들)

---

## Client-Only Components (클라이언트 전용 컴포넌트)

This project uses SSG (Static Site Generation) which prerenders pages at build time in Node.js.
Components using browser APIs (`document`, `window`, `localStorage`) must be client-only.
(이 프로젝트는 빌드 시 Node.js에서 페이지를 프리렌더링하는 SSG 사용.
브라우저 API를 사용하는 컴포넌트는 클라이언트 전용이어야 함.)

### Why SSR/SSG affects "100% client-side" sites (왜 SSR/SSG가 영향을 미치는가)

```
[Build Process (빌드 과정)]
Component.tsx → Node.js에서 렌더링 → 정적 HTML 생성 → 배포

[Runtime (런타임)]
정적 HTML → 브라우저에서 hydration → 100% 클라이언트
```

Even though the deployed site is fully client-side, **the build process runs in Node.js**
where `document` and `window` don't exist.
(배포된 사이트는 완전 클라이언트지만, **빌드는 Node.js에서 실행**되어 document/window가 없음.)

### Solution: clientOnly HOC (해결책: clientOnly HOC)

Use SolidStart's `clientOnly` for components that access browser APIs:
(브라우저 API에 접근하는 컴포넌트는 SolidStart의 clientOnly 사용:)

```tsx
// ComponentName.client.tsx
import { clientOnly } from '@solidjs/start';

export const ComponentNameClient = clientOnly(() => import('./ComponentName'));
```

### Available Client-Only Components (사용 가능한 클라이언트 전용 컴포넌트)

| Component | Client Export | Browser APIs Used |
|-----------|--------------|-------------------|
| `BottomSheet` | `BottomSheetClient` | `document`, `Portal` |

```tsx
// ✅ Correct - SSR safe (올바름 - SSR 안전)
import { BottomSheetClient } from '~/components/ui';
<BottomSheetClient isOpen={isOpen()} onClose={handleClose} />

// ❌ Wrong - will break build (잘못됨 - 빌드 실패)
import { BottomSheet } from '~/components/ui/BottomSheet';
```

### ClientOnly Wrapper (ClientOnly 래퍼)

For simple cases, use the `ClientOnly` wrapper component:
(간단한 경우 ClientOnly 래퍼 컴포넌트 사용:)

```tsx
import { ClientOnly } from '~/components';

<ClientOnly fallback={<div>Loading...</div>}>
  <ComponentWithBrowserAPIs />
</ClientOnly>
```

---

## Important Rules (중요 규칙)

1. **File-based Routing**: SolidStart uses file-based routing in `src/routes/` (파일 기반 라우팅 사용)
2. **Static Export**: Using Vinxi static adapter for Cloudflare Pages (정적 어댑터로 Cloudflare Pages 배포)
3. **Development**: Use `pnpm dev` for development (개발에는 pnpm dev 사용)
4. **i18n**: Use `useLanguage()` hook from `I18nProvider` for translations (`I18nProvider`의 `useLanguage()` 훅으로 번역 사용)
5. **NavigationLayout**: Always wrap pages (모든 페이지는 NavigationLayout으로 감싸기)
6. **CSS Variables**: Use Eye-Friendly design tokens, don't hardcode colors (눈에 편안한 디자인 토큰 사용, 색상 하드코딩 금지)
7. **Re-export Pattern**: Korean pages re-export English pages (한국어 페이지는 영어 페이지 재익스포트)
8. **Legacy Code**: Ignore `src-legacy/` (src-legacy/ 무시)
9. **Pre-commit**: Husky + lint-staged + Biome runs automatically (자동 실행)
10. **Auto-generated**: sitemap_index.xml, sitemap-pages.xml, robots.txt are built automatically (자동 생성)
11. **PWA**: Service worker configured with vite-plugin-pwa
12. **Class Names**: Use `cn()` from `~/lib/utils` for conditional classes (조건부 클래스에 cn() 사용)
13. **SolidJS Syntax**: Use `class` instead of `className`, signals with `()` accessor (class 속성 사용, 시그널은 () 접근자)
14. **AI Crawlers**: llms.txt + robots.txt optimized for AI chatbots (ChatGPT, Claude, Perplexity, Gemini) (AI 챗봇 최적화)
15. **Client-Only Components**: Use `clientOnly` HOC for components with browser APIs - prevents SSR/prerender failures (브라우저 API 사용 컴포넌트는 clientOnly HOC 사용)

## Security Headers (보안 헤더)

Cloudflare Pages security headers in `public/_headers`.
(Cloudflare Pages 보안 헤더는 public/_headers에 정의.)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin` (COOP)
- `Cross-Origin-Embedder-Policy: credentialless` (COEP - allows external iframes)
- `Permissions-Policy` (disables unused APIs)
- `Content-Security-Policy` (CSP - allows Cloudflare Analytics)

**Note (참고):** Using `credentialless` instead of `require-corp` for COEP allows embedding external content like YouTube videos.
(COEP에 credentialless를 사용하면 YouTube 같은 외부 콘텐츠 임베딩 가능.)

## AI Crawler Optimization (AI 크롤러 최적화)

Optimized for AI chatbot web search (ChatGPT, Claude, Perplexity, Gemini).
(AI 챗봇 웹 검색에 최적화.)

### llms.txt

LLM context file for AI assistants - provides site summary.
(AI 어시스턴트용 LLM 컨텍스트 파일 - 사이트 요약 제공.)

- **Location (위치):** `public/llms.txt`
- **Standard (표준):** [llmstxt.org](https://llmstxt.org/)
- **URL:** `https://soundbluemusic.com/llms.txt`

### robots.txt AI Crawlers

Explicitly allows major AI crawlers in `robots.txt` (generated at build time).
(빌드 시 생성되는 robots.txt에 주요 AI 크롤러 명시적 허용.)

| Service (서비스) | User-agent |
| ---------------- | ---------- |
| OpenAI (ChatGPT) | `GPTBot`, `ChatGPT-User` |
| Anthropic (Claude) | `Claude-Web`, `anthropic-ai` |
| Google (Gemini) | `Google-Extended` |
| Perplexity | `PerplexityBot` |
| Amazon | `Amazonbot` |
| Microsoft (Bing) | `Bingbot` |
| Apple | `Applebot` |
| Meta | `FacebookBot` |

**Configuration (설정):** `scripts/generate-sitemap.mjs`

## Caching Strategy (캐싱 전략)

Defined in `public/_headers`.
(public/_headers에 정의.)

| Resource Type (리소스 타입) | Cache Duration (캐시 기간)  |
| --------------------------- | --------------------------- |
| HTML pages                  | no-cache, revalidate        |
| `/assets/*`                 | 1 year, immutable           |
| Images                      | 1 year, immutable           |
| Fonts                       | 1 year, immutable           |
| PWA manifest                | 1 day, stale-revalidate     |
| Service worker              | no-cache, revalidate        |
| JSON files                  | 1 hour, stale-revalidate    |
| SEO files (robots, llms)    | 1 day, stale-revalidate     |

## Testing (테스트)

### Unit Tests - Vitest (유닛 테스트)

```bash
pnpm test           # Watch mode (워치 모드)
pnpm test:run       # Single run (단일 실행)
pnpm test:coverage  # With coverage (커버리지 포함)
```

Test files are located alongside source files.
(테스트 파일은 소스 파일과 같은 위치에.)

**SolidStart Tests (src/ folder):**
- `src/utils/*.test.ts` - Utility tests
- `src/lib/utils.test.ts` - cn() utility tests
- `src/components/*.test.tsx` - Component tests
- `src/constants/*.test.ts` - Constants tests

Vitest configuration - `vitest.config.ts`:
- Environment: jsdom
- Coverage: v8 provider
- Globals: enabled
- Pattern: `src/**/*.{test,spec}.{ts,tsx}`
- Aliases: `~` → `./src`

### E2E Tests - Playwright (E2E 테스트)

```bash
pnpm test:e2e         # Run all E2E tests (모든 E2E 테스트 실행)
pnpm test:e2e:ui      # Interactive UI mode (인터랙티브 UI 모드)
pnpm test:e2e:headed  # Headed browser mode (헤드 브라우저 모드)
```

Tests in `e2e/` directory (e2e/ 디렉토리의 테스트):
- `accessibility.spec.ts` - A11y compliance (접근성 준수)
- `i18n.spec.ts` - i18n functionality (다국어 기능)
- `navigation.spec.ts` - Route transitions (라우트 전환)
- `pages.spec.ts` - Page content verification (페이지 콘텐츠 검증)
- `pwa.spec.ts` - PWA functionality (PWA 기능)
- `seo.spec.ts` - SEO verification (SEO 검증)

Playwright configuration:
- Base URL: `http://localhost:3000` (Vinxi/SolidStart port)
- Browsers: Chromium, Firefox, WebKit
- Mobile: Pixel 5, iPhone 12
- Auto-starts dev server for tests (테스트용 개발 서버 자동 시작)

## Sound Recording License (녹음물 라이선스)

**© SoundBlueMusic. All rights reserved.**
(모든 권리 보유.)

Sound recordings (field recordings) may only be used for creating original works.
(녹음물(필드 레코딩)은 원본 저작물 제작에만 사용 가능.)

**Permitted (허용):**
- Use in creative works (videos, music, games, etc.) (창작물에 사용)
- Modify, transform, and create derivative works (수정, 변환, 2차 창작물 제작)
- Use in personal and commercial creative projects (개인 및 상업적 창작 프로젝트에 사용)

**Prohibited (금지):**
- Redistribution of original or modified sound files (원본 또는 수정된 음원 파일 재배포)
- Standalone sale or distribution of sound files (음원 파일 단독 판매 또는 배포)
- Resale as sound libraries or packs (사운드 라이브러리나 팩으로 재판매)
- Standalone sharing without incorporation into creative works (창작물에 통합하지 않은 단독 공유)
