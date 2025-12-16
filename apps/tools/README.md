# Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.9-4F88C6.svg)](https://www.solidjs.com/)
[![Vinxi](https://img.shields.io/badge/Vinxi-0.5-green.svg)](https://vinxi.vercel.app/)

**A free web tools platform for all creators**
(**모든 창작자를 위한 무료 웹 도구 플랫폼**)

Professional online tools for musicians, designers, and developers.
(음악가, 디자이너, 개발자를 위한 프로급 온라인 도구.)

No sign-up required. No ads. Completely free.
(회원가입 없이, 광고 없이, 완전히 무료.)

🌐 **Live Site**: [tools.soundbluemusic.com](https://tools.soundbluemusic.com)
(🌐 **라이브 사이트**: [tools.soundbluemusic.com](https://tools.soundbluemusic.com))

---

## Architecture (아키텍처)

**100% Static Site - No backend server required.**
(**100% 정적 사이트 - 백엔드 서버 없음.**)

- **Static Site Generation (SSG)** - All pages pre-rendered at build time
  (정적 사이트 생성 - 빌드 시 모든 페이지 사전 렌더링)
- **Deployed as static files** to Cloudflare Pages
  (Cloudflare Pages에 정적 파일로 배포)
- **Client-side routing** with SolidJS Router (SPA navigation after initial load)
  (SolidJS Router로 클라이언트 사이드 라우팅, 초기 로드 후 SPA 네비게이션)
- **No API endpoints, no database**
  (API 엔드포인트 없음, 데이터베이스 없음)
- **SEO optimized** - HTML includes meta tags and content at build time
  (SEO 최적화 - 빌드 시 HTML에 메타 태그와 콘텐츠 포함)

---

## Key Features
(## 주요 기능)

| Tool | Description |
|------|-------------|
| Metronome | BPM, time signature, pendulum metronome |
| Drum Machine | Drum pattern sequencer |
| QR Generator | QR code generator |

| 도구 | 설명 |
|------|------|
| Metronome | BPM, 박자, 펜듈럼 메트로놈 |
| Drum Machine | 드럼 패턴 시퀀서 |
| QR Generator | QR 코드 생성기 |

### Routes (라우트)

| Path | Description |
|------|-------------|
| `/` | Home - Chat interface with tool sidebar |
| `/[tool]` | Dynamic tool page |
| `/built-with` | Technology stack page |
| `/ko` | Korean home |
| `/ko/[tool]` | Korean dynamic tool page |
| `/ko/built-with` | Korean technology stack page |

---

## Getting Started
(## 시작하기)

### Prerequisites
(### 필수 조건)

- **Node.js** >= 24.0.0
- **pnpm** (recommended package manager / 권장 패키지 매니저)

### Installation and Running
(### 설치 및 실행)

```bash
# Clone the repository (저장소 클론)
git clone https://github.com/soundbluemusic/tools.git
cd tools

# Install dependencies (의존성 설치)
pnpm install

# Run development server (개발 서버 실행)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view.
(브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.)

### Key Commands
(### 주요 명령어)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run development server |
| `pnpm build` | Production build (Static Export) |
| `pnpm check:fix` | Auto-fix lint + format |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test:run` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests (Playwright) |
| `pnpm wasm:build` | Build Rust WASM modules |

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 (정적 내보내기) |
| `pnpm check:fix` | 린트 + 포맷 자동 수정 |
| `pnpm typecheck` | TypeScript 타입 검사 |
| `pnpm test:run` | 유닛 테스트 실행 |
| `pnpm test:e2e` | E2E 테스트 실행 (Playwright) |
| `pnpm wasm:build` | Rust WASM 모듈 빌드 |

---

## Tech Stack
(## 기술 스택)

| Category | Technology |
|----------|------------|
| **Framework** | SolidStart 1.2, SolidJS 1.9, Vinxi 0.5 |
| **Routing** | @solidjs/router 0.15 (file-based) |
| **Styling** | Tailwind CSS 4, Class Variance Authority |
| **UI Components** | Kobalte (accessible primitives), custom components |
| **State Management** | solid-js/store (createStore, createSignal) |
| **Rendering** | Canvas 2D (WebGPU planned) |
| **Audio** | Web Audio API, AudioWorklet, Rust/WASM |
| **MIDI** | WebMIDI API |
| **i18n** | @solid-primitives/i18n |
| **Storage** | Dexie (IndexedDB), FileSystem Access API |
| **Linter/Formatter** | Biome 2.3 |
| **Testing** | Vitest 4, Playwright |
| **PWA** | vite-plugin-pwa (Workbox) |
| **Deployment** | Cloudflare Pages (Static Export) |

| 카테고리 | 기술 |
|----------|------|
| **프레임워크** | SolidStart 1.2, SolidJS 1.9, Vinxi 0.5 |
| **라우팅** | @solidjs/router 0.15 (파일 기반) |
| **스타일링** | Tailwind CSS 4, Class Variance Authority |
| **UI 컴포넌트** | Kobalte (접근성 프리미티브), 커스텀 컴포넌트 |
| **상태관리** | solid-js/store (createStore, createSignal) |
| **렌더링** | Canvas 2D (WebGPU 예정) |
| **오디오** | Web Audio API, AudioWorklet, Rust/WASM |
| **MIDI** | WebMIDI API |
| **다국어** | @solid-primitives/i18n |
| **저장소** | Dexie (IndexedDB), FileSystem Access API |
| **린터/포매터** | Biome 2.3 |
| **테스트** | Vitest 4, Playwright |
| **PWA** | vite-plugin-pwa (Workbox) |
| **배포** | Cloudflare Pages (정적 내보내기) |

---

## Project Structure
(## 프로젝트 구조)

```
src/
├── app.tsx             # Root app component (Router, MetaProvider)
├── entry-client.tsx    # Client entry point
├── entry-server.tsx    # Server entry point
├── globals.css         # Global styles (Tailwind base, design tokens)
│
├── routes/             # File-based routing (@solidjs/router)
│   ├── index.tsx       # Home (/) - Chat interface
│   ├── [tool].tsx      # Dynamic tool page (/[tool])
│   ├── built-with.tsx  # /built-with - Tech stack page
│   └── ko/             # Korean routes (/ko/*)
│       ├── index.tsx
│       ├── [tool].tsx
│       └── built-with.tsx
│
├── components/
│   ├── ui/             # UI components (button, slider, dialog, tabs, etc.)
│   ├── layout/         # Layout components (Header, Footer, MainLayout)
│   ├── sidebar/        # Tool sidebar (ToolSidebar, ToolCategory, ToolItem)
│   ├── chat/           # Chat interface (ChatContainer, ChatInput, ChatMessage)
│   ├── tools/          # Tool container components
│   ├── canvas/         # Canvas 2D utilities
│   ├── visualizations/ # VU meter, spectrum, waveform
│   └── providers/      # ThemeProvider
│
├── tools/              # Tool definitions (도구 정의)
│   ├── index.ts        # Exports & auto-registration
│   ├── registry.ts     # registerTool(), getTool(), searchTools()
│   ├── types.ts        # ToolDefinition, ToolMeta, ToolProps
│   ├── metronome/      # Metronome tool
│   ├── drum-machine/   # Drum machine tool
│   └── qr-generator/   # QR code generator tool
│
├── stores/             # SolidJS stores (상태 저장소)
│   ├── audio-store.ts  # Transport, BPM, meters
│   ├── chat-store.ts   # Chat state
│   └── tool-store.ts   # Tool state
│
├── hooks/              # Custom hooks (커스텀 훅)
│   ├── use-audio-context.ts
│   ├── use-event-bus.ts
│   └── use-tempo.ts
│
├── lib/                # Utilities (유틸리티)
│   ├── utils.ts        # cn() (clsx + tailwind-merge)
│   ├── audio-context.ts # AudioContext singleton
│   ├── event-bus.ts    # Inter-tool event system
│   └── toolCategories.ts # Tool category definitions
│
├── engine/             # Audio engine (오디오 엔진)
│   ├── audio-engine.ts
│   ├── wasm-loader.ts
│   ├── storage.ts
│   ├── midi.ts
│   └── worklet/
│
├── types/              # TypeScript type definitions
│   └── browser-apis.d.ts
│
├── test/               # Test configuration
│   └── setup.ts
│
└── i18n/               # Internationalization ko/en (국제화)
    ├── context.tsx     # LanguageProvider (@solid-primitives/i18n)
    └── request.ts

messages/               # Translation files (번역 파일)
├── ko.json
└── en.json
```

---

## Contributing
(## 기여하기)

Contributions are welcome! Before submitting a PR:
(기여를 환영합니다! PR을 제출하기 전에:)

```bash
pnpm check:fix    # Auto-fix lint/format (린트/포맷 자동 수정)
pnpm typecheck    # Type check (타입 검사)
pnpm test:run     # Run tests (테스트 실행)
```

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).
(자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.)

---

## License
(## 라이선스)

This project is released under the [MIT License](./LICENSE).
(이 프로젝트는 [MIT 라이선스](./LICENSE)로 공개됩니다.)

---

## Links
(## 링크)

- 🌐 [Live Site](https://tools.soundbluemusic.com) ([라이브 사이트](https://tools.soundbluemusic.com))
- 📖 [Development Guide (CLAUDE.md)](./CLAUDE.md) ([개발 가이드](./CLAUDE.md))
- 🐛 [Issue Reports](https://github.com/soundbluemusic/tools/issues) ([이슈 리포트](https://github.com/soundbluemusic/tools/issues))

---

Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) by [SoundBlueMusic](https://soundbluemusic.com)
