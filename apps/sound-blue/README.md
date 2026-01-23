# Sound Blue

**SoundBlueMusic Official Website** | [soundbluemusic.com](https://soundbluemusic.com)
(**SoundBlueMusic 공식 홈페이지**)

> _"hi, im sound blue, i make music."_

[![Version](https://img.shields.io/badge/version-3.0.18--베타-blue)](https://github.com/soundbluemusic/sound-blue)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-orange)](https://pages.cloudflare.com/)

---

## Architecture (아키텍처)

**SEO 호환 렌더링 (SSG/SSR)** - SPA 금지, 서버에서 HTML 생성
(**SEO 호환 렌더링 (SSG/SSR)** - SPA 금지)

- **TanStack Start SSR mode** - Server-side rendering on Cloudflare Workers
  (TanStack Start SSR 모드 - Cloudflare Workers에서 서버 렌더링)
- Deployed to Cloudflare Workers (Cloudflare Workers에 배포)
- Client-side routing after initial load (초기 로드 후 클라이언트 사이드 라우팅)
- No API endpoints, no database (API 엔드포인트 없음, 데이터베이스 없음)

---

## Quick Start
(빠른 시작)

```bash
# Requirements: Node.js >=20.0.0, pnpm 10.25.0
# (요구사항: Node.js >=20.0.0, pnpm 10.25.0)

pnpm install          # Install dependencies (의존성 설치)
pnpm dev              # Dev server with Vite (개발 서버, localhost:3000)
pnpm build            # Production build (프로덕션 빌드)
pnpm pages:deploy     # Deploy to Cloudflare Pages (Cloudflare Pages 배포)
```

---

## Tech Stack
(기술 스택)

| Category | Technology |
| (분류) | (기술) |
|------|------|
| Framework (프레임워크) | React 19.1 + TanStack Start + TypeScript 5.9 |
| Bundler (번들러) | Vite 6.3 |
| Styling (스타일링) | Tailwind CSS 4.x |
| Visual Effects (시각 효과) | Pure CSS Particles (lightweight, no JS) |
| i18n (다국어) | @inlang/paraglide-js (Korean/English) |
| PWA | vite-plugin-pwa + Workbox |
| Code Quality (코드 품질) | Biome 2.x (Lint/Format) + Husky |
| Testing (테스트) | Vitest 4.x + Playwright 1.57+ |
| Deployment (배포) | Cloudflare Pages (Static Build) |

---

## Chat Assistant
(채팅 어시스턴트)

Natural language interface for site Q&A and navigation:
(사이트 Q&A 및 탐색을 위한 자연어 인터페이스:)

**Supported Topics (지원 주제):**

| Topic | Keywords (EN) | Keywords (KO) |
| (주제) | (영어 키워드) | (한국어 키워드) |
|-------|--------------|---------------|
| About | sound blue, who, artist | 사운드블루, 누구 |
| Music | music, song, genre | 음악, 노래, 장르 |
| License | license, copyright, use | 라이선스, 저작권, 사용 |
| Contact | youtube, contact, link | 유튜브, 연락, 링크 |
| Built With | tech, stack, built | 기술, 스택 |

**Features (기능):**
- Bilingual keyword detection (EN/KO) (이중 언어 키워드 감지)
- Auto-redirect to Korean page when Korean is detected (한국어 감지 시 자동 리다이렉트)
- Topic-based info panel with page links (주제별 정보 패널)
- Time/date queries (Seoul timezone) (시간/날짜 쿼리)

**Usage (사용법):**
```
User: "who is sound blue"
Bot: "Sound Blue is a South Korean indie artist..."
→ Info panel shows About page link

User: "라이선스 정보"
→ Auto-redirects to /ko/chat/ for Korean response
```

---

## Project Structure
(프로젝트 구조)

```
sound-blue/
├── src/                    # TanStack Start source (소스 코드)
│   ├── routes/__root.tsx   # Root layout (루트 레이아웃)
│   ├── app.css             # Global styles (전역 스타일)
│   ├── components/         # React components (React 컴포넌트)
│   │   ├── ui/             # UI components (SearchBox, ThemeIcon)
│   │   ├── navigation/     # Sidebar, BottomNav
│   │   ├── providers/      # Theme & i18n Providers
│   │   ├── seo/            # PageSeo component
│   │   └── background/     # CSS Particles & GPU Particles
│   ├── routes/             # File-based routing (파일 기반 라우팅)
│   │   └── ko/             # Korean routes (한국어 라우트)
│   ├── utils/              # Utility functions (유틸리티 함수)
│   ├── constants/          # Brand config (브랜드 설정)
│   ├── lib/                # Library utilities (라이브러리 유틸)
│   └── styles/             # CSS variables (CSS 변수)
├── e2e/                    # Playwright E2E tests (E2E 테스트)
├── scripts/                # Build scripts (빌드 스크립트)
└── public/                 # Static files, PWA icons (정적 파일, PWA 아이콘)
```

---

## Sitemap Structure
(사이트맵 구조)

XML sitemap architecture for SEO with multi-language (hreflang) support:
(SEO를 위한 다국어(hreflang) 지원 XML 사이트맵 구조:)

```
[SITEMAP STRUCTURE TEMPLATE]
TARGET_DOMAIN: soundbluemusic.com
DEFAULT_LANG: en (Root)
SECONDARY_LANG: ko (Sub-path)
X-DEFAULT: en (Fallback for users with undetected language)

ROOT: https://soundbluemusic.com/sitemap_index.xml
 ┃
 ┣━━ sitemap-pages.xml (Static Pages)
 ┃    ┠── Homepage: / + /ko/
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

**Key Fields:**
(**주요 필드:**)
- **X-DEFAULT**: Fallback URL for users with undetected language preference (usually English version)
  (언어 감지 안 되는 사용자용 기본 URL, 보통 영어 버전)
- **LASTMOD**: Last modification date (YYYY-MM-DD format, auto-generated during build)
  (마지막 수정일, YYYY-MM-DD 형식, 빌드 시 자동 생성)

**Configuration:** `scripts/generate-sitemap.mjs`
(**설정 파일:** `scripts/generate-sitemap.mjs`)

**Auto-generated files:** `sitemap_index.xml`, `sitemap-pages.xml`, `robots.txt`
(**자동 생성 파일:** `sitemap_index.xml`, `sitemap-pages.xml`, `robots.txt`)

---

## AI Crawler Optimization
(AI 크롤러 최적화)

Optimized for AI chatbots (ChatGPT, Claude, Perplexity, Gemini) web search:
(AI 챗봇 웹 검색에 최적화:)

| File | Description |
| (파일) | (설명) |
|------|------|
| `public/llms.txt` | LLM context file - site summary for AI assistants ([llmstxt.org](https://llmstxt.org/)) |
| `robots.txt` | Explicitly allows AI crawlers (GPTBot, Claude-Web, PerplexityBot, etc.) |

**Allowed AI Crawlers (허용된 AI 크롤러):**
- OpenAI: `GPTBot`, `ChatGPT-User`
- Anthropic: `Claude-Web`, `anthropic-ai`
- Google: `Google-Extended`
- Perplexity: `PerplexityBot`
- Amazon: `Amazonbot`
- Microsoft: `Bingbot`
- Apple: `Applebot`
- Meta: `FacebookBot`

**Configuration (설정):** `scripts/generate-sitemap.mjs`

---

## Main Commands
(주요 명령어)

| Command | Description |
| (명령어) | (설명) |
|--------|------|
| `pnpm dev` | Vite dev server (Vite 개발 서버) |
| `pnpm build` | Production build with auto sitemap generation (프로덕션 빌드, 사이트맵 자동 생성) |
| `pnpm check:fix` | Biome lint + format auto-fix (Biome 린트 + 포맷 자동 수정) |
| `pnpm typecheck` | TypeScript check (TypeScript 검사) |
| `pnpm validate` | Full validation: typecheck + check + test (전체 검증) |
| `pnpm test:run` | Unit tests (유닛 테스트) |
| `pnpm test:e2e` | E2E tests (E2E 테스트) |
| `pnpm pages:deploy` | Deploy to Cloudflare Pages (Cloudflare Pages 배포) |

---

## Development Guide
(개발 가이드)

### Core Patterns
(핵심 패턴)

**1. Multilingual Pages**: Write English page → Re-export in Korean page
(**1. 다국어 페이지**: 영어 페이지 작성 → 한국어 페이지에서 재내보내기)

```tsx
// app/routes/ko/privacy.tsx
export { default } from '../privacy';
```

**2. i18n**: Use Paraglide for translations
(**2. 다국어**: Paraglide로 번역 사용)

```tsx
import * as m from '~/paraglide/messages';
const title = m.home_title();
```

**3. Layout**: Wrap all pages with `NavigationLayout`
(**3. 레이아웃**: 모든 페이지는 `NavigationLayout`으로 감싸기)

```tsx
import { NavigationLayout } from '~/components';
```

**4. CSS Classes**: Use `cn()` utility
(**4. CSS 클래스**: `cn()` 유틸리티 사용)

```tsx
import { cn } from '~/lib/utils';
```

### Theme System (테마 시스템)

- Two modes: `light`, `dark` (두 가지 모드: 라이트, 다크)
- System preference + manual override (시스템 설정 + 수동 전환)
- `data-theme` attribute on `<html>` (html 태그의 data-theme 속성)
- LocalStorage key: `sb-theme` (로컬스토리지 키)

```tsx
import { useTheme } from '~/components/providers/ThemeProvider';
const { theme, toggleTheme, setTheme } = useTheme();
```

### UI Components (UI 컴포넌트)

**From `~/components/ui`:**
- `BottomSheetClient` - Bottom sheet modal (client-only)
- `Button`, `buttonVariants`, `LinkButton` - Action buttons
- `OptimizedImage` - Lazy loading image
- `SearchBox` - Search input
- `ThemeIcon` - Theme toggle icon

**From `~/components`:**
- `ClientOnly` - Client-only rendering wrapper
- `Header`, `Footer` - Site header/footer
- `NavigationLayout` - Full layout wrapper
- `AppErrorBoundary` - Error boundary
- `CSSParticles` - Pure CSS particles
- `ChatContainer`, `ChatInput`, `ChatMessage` - Chat components
- `Sidebar`, `BottomNav` - Navigation
- `PageSeo` - SEO meta tags
- `I18nProvider`, `useLanguage` - i18n context

### Client-Only Components (클라이언트 전용 컴포넌트)

SSG에서 브라우저 API 사용 컴포넌트는 lazy import 사용:

```tsx
// ComponentName.client.tsx
import { lazy } from 'react';
export const ComponentNameClient = lazy(() => import('./ComponentName'));
```

### CSS Variables (CSS 변수)

Eye-friendly design system in `src/styles/tailwind.css`:
- **Light Mode**: "Warm Ivory" - cream-colored paper
- **Dark Mode**: "Midnight Forest" - cool charcoal with blue-green undertones

Key variables:
```css
--color-bg-primary, --color-bg-secondary, --color-bg-elevated
--color-text-primary, --color-text-secondary
--color-accent-primary: #C9553D (Muted Terracotta)
--header-height: 56px
--sidebar-width: 240px
--bottom-nav-height: 56px
```

### Security Headers (보안 헤더)

Defined in `public/_headers`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Cross-Origin-Opener-Policy: same-origin` (COOP)
- `Cross-Origin-Embedder-Policy: credentialless` (COEP)
- `Content-Security-Policy` (CSP)

### Protected Files (건드리지 않을 파일)

- `public/` folder - auto-generated build files

---

## Links
(링크)

- [Website](https://soundbluemusic.com) (웹사이트)
- [YouTube](https://www.youtube.com/@SoundBlueMusic) (유튜브)
- [GitHub](https://github.com/soundbluemusic/soundblue-monorepo/tree/main/apps/sound-blue) (깃허브)

---

## Copyright
(저작권)

© 2025 SoundBlueMusic. All rights reserved.

See [License](https://soundbluemusic.com/license) page for details.
(자세한 내용은 [라이선스](https://soundbluemusic.com/license) 페이지 참조.)

---

Made by [SoundBlueMusic](https://soundbluemusic.com)
