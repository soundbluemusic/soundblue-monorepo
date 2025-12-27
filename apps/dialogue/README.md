# Dialogue

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-green.svg)](https://vitejs.dev/)

**A Q&A tool that works 100% offline**
(**100% 오프라인으로 작동하는 Q&A 도구**)

Dialogue is an offline Q&A tool that provides instant answers without internet connectivity.
(Dialogue는 인터넷 연결 없이 즉시 답변을 제공하는 오프라인 Q&A 도구입니다.)

🌐 **Live Site**: [dialogue.soundbluemusic.com](https://dialogue.soundbluemusic.com)
(🌐 **라이브 사이트**: [dialogue.soundbluemusic.com](https://dialogue.soundbluemusic.com))

---

## Architecture (아키텍처)

**100% Static Site Generation (SSG)** - No backend server required.
(**100% 정적 사이트 생성 (SSG)** - 백엔드 서버 없음.)

- **React Router v7 SSG mode** - All pages pre-rendered at build time
  (React Router v7 SSG 모드 - 빌드 시 모든 페이지 사전 렌더링)
- **Deployed as static files** to Cloudflare Pages
  (Cloudflare Pages에 정적 파일로 배포)
- **Client-side routing** after initial load (SPA navigation)
  (초기 로드 후 클라이언트 사이드 라우팅, SPA 네비게이션)
- **No API endpoints, no database**
  (API 엔드포인트 없음, 데이터베이스 없음)
- **Offline-first** - All data embedded in static files
  (오프라인 우선 - 모든 데이터가 정적 파일에 포함)

---

## Key Features (주요 기능)

| Feature | Description |
|---------|-------------|
| 🔌 Offline | Works completely offline, no internet required |
| 🌏 Bilingual | Supports English and Korean (2 languages) |
| ⚡ Instant | Instant answers with zero latency |
| 📱 PWA | Install as Progressive Web App |
| ♿ Accessible | WCAG compliant, keyboard navigation |

| 기능 | 설명 |
|------|------|
| 🔌 오프라인 | 인터넷 연결 없이 완전히 작동 |
| 🌏 이중언어 | 영어와 한국어 지원 (2개 언어) |
| ⚡ 즉시 답변 | 지연 시간 없이 즉시 답변 제공 |
| 📱 PWA | 프로그레시브 웹 앱으로 설치 가능 |
| ♿ 접근성 | WCAG 준수, 키보드 내비게이션 |

---

## Getting Started (시작하기)

### Prerequisites (필수 조건)

- **Node.js** >= 20.0.0
- **pnpm** (recommended package manager / 권장 패키지 매니저)

### Installation and Running (설치 및 실행)

```bash
# Clone the repository (저장소 클론)
git clone https://github.com/soundbluemusic/soundblue-monorepo.git
cd soundblue-monorepo/apps/dialogue

# Install dependencies (의존성 설치)
pnpm install

# Run development server (개발 서버 실행)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view.
(브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.)

### Key Commands (주요 명령어)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run development server |
| `pnpm build` | Production build (Static Export) |
| `pnpm check:fix` | Auto-fix lint + format |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test:run` | Run unit tests |

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 (정적 내보내기) |
| `pnpm check:fix` | 린트 + 포맷 자동 수정 |
| `pnpm typecheck` | TypeScript 타입 검사 |
| `pnpm test:run` | 유닛 테스트 실행 |

---

## Tech Stack (기술 스택)

| Category | Technology |
|----------|------------|
| **Framework** | React 19.1, React Router 7.6, Vite 6.3 |
| **Routing** | React Router 7 (file-based) |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Zustand, React hooks (useState, useReducer) |
| **i18n** | Built-in language switching (EN/KO) |
| **Linter/Formatter** | Biome 2.3 |
| **Testing** | Vitest 4 |
| **PWA** | vite-plugin-pwa (Workbox) |
| **Deployment** | Cloudflare Pages (Static Export) |

| 카테고리 | 기술 |
|----------|------|
| **프레임워크** | React 19.1, React Router 7.6, Vite 6.3 |
| **라우팅** | React Router 7 (파일 기반) |
| **스타일링** | Tailwind CSS 4 |
| **상태관리** | Zustand, React hooks (useState, useReducer) |
| **다국어** | 내장 언어 전환 (EN/KO) |
| **린터/포매터** | Biome 2.3 |
| **테스트** | Vitest 4 |
| **PWA** | vite-plugin-pwa (Workbox) |
| **배포** | Cloudflare Pages (정적 내보내기) |

---

## Project Structure (프로젝트 구조)

```
dialogue/
├── app/
│   ├── root.tsx            # Root app component
│   ├── entry.client.tsx    # Client entry point
│   ├── entry.server.tsx    # Server entry point
│   ├── global.css          # Global styles (Tailwind)
│   │
│   ├── routes/             # File-based routing (React Router)
│   │   ├── home.tsx        # Home route (/)
│   │   ├── about.tsx       # About page
│   │   └── ko/             # Korean routes (/ko/*)
│   │       ├── home.tsx
│   │       └── about.tsx
│   │
│   ├── components/         # React components
│   │   ├── layout/         # Layout components (Header, Sidebar, MainLayout)
│   │   ├── chat/           # Chat components (ChatContainer, ChatInput, ChatMessage)
│   │   └── About.tsx       # About component
│   │
│   ├── lib/                # Utilities
│   │   └── utils.ts        # cn() (clsx + tailwind-merge)
│   │
│   ├── stores/             # Zustand stores
│   │   └── chat-store.ts   # Chat state management
│   │
│   └── data/               # Static data (Q&A pairs, translations)
│
├── public/                 # Static files
│   ├── manifest.json       # PWA manifest
│   └── llms.txt            # AI crawler optimization
│
├── react-router.config.ts  # React Router configuration (SSG)
├── vite.config.ts          # Vite configuration
├── biome.json              # Linter/formatter rules
└── tsconfig.json           # TypeScript configuration
```

---

## Key Patterns (주요 패턴)

### Multilingual Routes (다국어 라우트)

```tsx
// app/routes/ko/about.tsx
export { default } from '../about';
```

All Korean routes re-export their English counterparts for consistency.
(모든 한국어 라우트는 일관성을 위해 영어 버전을 재내보내기합니다.)

### State Management (상태 관리)

```tsx
import { useChatStore } from '~/stores/chat-store';

const MyComponent = () => {
  const { messages, addMessage } = useChatStore();

  return <div>{/* ... */}</div>;
};
```

### Styling (스타일링)

```tsx
import { cn } from '~/lib/utils';

<div className={cn('base-class', conditionalClass && 'active')}>
  {/* ... */}
</div>
```

---

## Configuration Files (설정 파일)

| File | Purpose |
|------|---------|
| `react-router.config.ts` | React Router config (SSG, prerendering) |
| `vite.config.ts` | Vite config (plugins, PWA) |
| `biome.json` | Linter/formatter rules |
| `tsconfig.json` | TypeScript config with path aliases |

---

## Development Guide (개발 가이드)

### Adding New Q&A Content (새 Q&A 콘텐츠 추가)

1. Add data to `app/data/questions.ts` (or similar)
2. Ensure both EN and KO versions are provided
3. Update search/matching logic if needed

### Theme System (테마 시스템)

- Two modes: `light`, `dark` (두 가지 모드: 라이트, 다크)
- System preference + manual override (시스템 설정 + 수동 전환)
- CSS variables defined in `app/global.css`

---

## Deployment (배포)

Deployed to Cloudflare Pages as a static site:
(정적 사이트로 Cloudflare Pages에 배포:)

```bash
pnpm build        # Generates static files in build/client
```

All routes are pre-rendered at build time for instant loading.
(모든 라우트는 빌드 시 사전 렌더링되어 즉시 로드됩니다.)

---

## License (라이선스)

See root repository LICENSE for details.
(자세한 내용은 루트 저장소 LICENSE를 참조하세요.)

---

## Links (링크)

- 🌐 [Live Site](https://dialogue.soundbluemusic.com) ([라이브 사이트](https://dialogue.soundbluemusic.com))
- 📖 [Development Guide (CLAUDE.md)](./CLAUDE.md) ([개발 가이드](./CLAUDE.md))
- 🏠 [Main Repository](https://github.com/soundbluemusic/soundblue-monorepo) ([메인 저장소](https://github.com/soundbluemusic/soundblue-monorepo))

---

Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) by [SoundBlueMusic](https://soundbluemusic.com)
