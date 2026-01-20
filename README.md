# 🎵 SoundBlue Monorepo

**A creative platform for musicians**
**(뮤지션을 위한 크리에이티브 플랫폼)**

---

## 🎯 App List (앱 리스트)

|  | 🎵 Sound Blue | 🎛️ Tools | 💬 Dialogue |
|--|---------------|----------|-------------|
| **What** | Artist Website | Music Tools | Learning Tool |
| **URL** | [soundbluemusic.com](https://soundbluemusic.com) | [tools.soundbluemusic.com](https://tools.soundbluemusic.com) | [dialogue.soundbluemusic.com](https://dialogue.soundbluemusic.com) |
| **Code** | [apps/sound-blue/](apps/sound-blue/) | [apps/tools/](apps/tools/) | [apps/dialogue/](apps/dialogue/) |

<details>
<summary><b>🎵 Sound Blue</b> - Official website (아티스트 웹사이트)</summary>

- 🎧 Music & Albums (음악 & 앨범)
- 📰 News & Blog (뉴스 & 블로그)
- 🤖 AI Chat Assistant (AI 채팅 어시스턴트)
</details>

<details>
<summary><b>🎛️ Tools</b> - Free music tools (누구나 무료로 쓰는 음악 도구)</summary>

- 🥁 Drum Machine (드럼 머신)
- ⏱️ Metronome (메트로놈)
- 📱 QR Code Generator (QR 코드 생성기)
- 🌐 Translator (번역기) - Ko↔En bidirectional
- 🎨 Color Harmony (컬러 하모니) - Color wheel theory
- 🌈 Color Palette (컬러 팔레트) - Custom color combinations

> ⚠️ **ToolGuide 필수** - [tools.md](.claude/rules/tools.md) 참조
</details>

<details>
<summary><b>💬 Dialogue</b> - Offline Q&A learning tool (오프라인 Q&A 학습 도구)</summary>

- 🔌 Works offline (오프라인 작동)
- 🌏 2 Languages: EN / KO (2개 언어 지원)
- ⚡ Instant answers (즉시 답변)
</details>

---

## 🚀 Quick Start (빠른 시작)

```bash
# 1. Clone
git clone https://github.com/soundbluemusic/soundblue-monorepo.git
cd soundblue-monorepo

# 2. Install
pnpm install

# 3. Run
pnpm dev:main      # Sound Blue
pnpm dev:tools     # Tools
pnpm dev:dialogue  # Dialogue
```

| Command | Description |
|---------|-------------|
| `pnpm dev:main` | Run Sound Blue |
| `pnpm dev:tools` | Run Tools |
| `pnpm dev:dialogue` | Run Dialogue |
| `pnpm build` | Build all apps |
| `pnpm prebuild:all` | Sync dictionaries + generate types |
| `pnpm test` | Run tests |
| `pnpm check:fix` | Lint & format |

---

## 🛠️ Tech Stack (기술 스택)

### Frontend

| Tech | Description | Docs |
|------|-------------|------|
| [**React 19**](https://react.dev/) | Fast reactive framework | [react.dev](https://react.dev/) |
| [**React Router 7**](https://reactrouter.com/) | SSR mode routing | [reactrouter.com](https://reactrouter.com/) |
| [**TypeScript**](https://www.typescriptlang.org/) | Type-safe JavaScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) |
| [**Tailwind CSS v4**](https://tailwindcss.com/) | Utility-first styling | [tailwindcss.com](https://tailwindcss.com/docs/) |

### Build & Deploy

| Tech | Description | Docs |
|------|-------------|------|
| [**Vite**](https://vite.dev/) | Fast build tool | [vite.dev](https://vite.dev/guide/) |
| [**pnpm**](https://pnpm.io/) | Fast package manager | [pnpm.io](https://pnpm.io/motivation) |
| [**Cloudflare**](https://developers.cloudflare.com/pages/) | Static hosting | [cloudflare.com](https://developers.cloudflare.com/pages/) |

### Quality

| Tech | Description | Docs |
|------|-------------|------|
| [**Biome**](https://biomejs.dev/) | Linting & formatting | [biomejs.dev](https://biomejs.dev/guides/getting-started/) |
| [**Vitest**](https://vitest.dev/) | Unit testing | [vitest.dev](https://vitest.dev/guide/) |
| [**Playwright**](https://playwright.dev/) | E2E testing | [playwright.dev](https://playwright.dev/docs/intro) |

---

## 📁 Project Structure (폴더 구조)

> 📄 **Full documentation:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

```
soundblue-monorepo/
├── 📱 apps/                    → Applications
│   ├── sound-blue/             → Artist website
│   ├── tools/                  → Music tools
│   └── dialogue/               → Learning tool
│
├── 📦 packages/
│   ├── 🧠 core/                → Pure logic (no browser APIs)
│   │   ├── hangul/             → Korean text processing
│   │   ├── translator/         → Translation engine
│   │   ├── nlu/                → Natural language understanding
│   │   ├── audio-engine/       → Audio timing & sequencing
│   │   ├── locale/             → Pure locale utilities
│   │   └── text-processor/     → Text processing utilities
│   │
│   ├── 🖥️ platform/            → Browser API adapters (dual implementation)
│   │   ├── web-audio/          → Web Audio API
│   │   ├── storage/            → IndexedDB & localStorage
│   │   ├── worker/             → Web Worker RPC
│   │   ├── i18n/               → Internationalization
│   │   ├── seo/                → SEO utilities
│   │   └── pwa/                → PWA configuration
│   │
│   └── 🎨 ui/                  → React components
│       └── components/         → Unified UI library
│           ├── base/           → Button, Input
│           ├── composite/      → Chat, Tool
│           └── icons/          → Icon components
│
├── 🔧 tooling/                 → Shared configs
└── 📜 scripts/                 → Build & automation scripts
```

### Package Layer Rules (패키지 레이어 규칙)

```
┌─────────────────────────────────────────────────────────────────┐
│                           apps/                                 │
│                    (sound-blue, tools, dialogue)                │
├─────────────────────────────────────────────────────────────────┤
│                            ui/                                  │
│                       (components)                              │
├─────────────────────────────────────────────────────────────────┤
│                        platform/                                │
│        (web-audio, storage, worker, i18n, seo, pwa)             │
│           .browser.ts (실제) / .noop.ts (빈 구현)                │
├─────────────────────────────────────────────────────────────────┤
│                          core/                                  │
│    (hangul, translator, nlu, audio-engine, locale, text-processor) │
│                 No browser APIs allowed!                        │
└─────────────────────────────────────────────────────────────────┘

↑ Upper layers can import from lower layers
↓ Lower layers CANNOT import from upper layers
```

---

## 📦 Package Reference (패키지 참조)

### Core Layer (코어 레이어)

> Pure TypeScript logic. No browser APIs, no React.

| Package | Description | Code |
|---------|-------------|------|
| `@soundblue/hangul` | Korean text processing | [packages/core/hangul/](packages/core/hangul/) |
| `@soundblue/translator` | Ko↔En translation engine | [packages/core/translator/](packages/core/translator/) |
| `@soundblue/nlu` | Intent & entity recognition | [packages/core/nlu/](packages/core/nlu/) |
| `@soundblue/audio-engine` | Audio timing & sequencing | [packages/core/audio-engine/](packages/core/audio-engine/) |
| `@soundblue/locale` | Pure locale utilities | [packages/core/locale/](packages/core/locale/) |
| `@soundblue/text-processor` | Text processing utilities | [packages/core/text-processor/](packages/core/text-processor/) |

### Platform Layer (플랫폼 레이어)

> Browser API adapters with `.browser.ts` + `.noop.ts` dual implementation.

| Package | Description | Code |
|---------|-------------|------|
| `@soundblue/web-audio` | Web Audio API wrapper | [packages/platform/web-audio/](packages/platform/web-audio/) |
| `@soundblue/storage` | IndexedDB & localStorage | [packages/platform/storage/](packages/platform/storage/) |
| `@soundblue/worker` | Web Worker RPC | [packages/platform/worker/](packages/platform/worker/) |
| `@soundblue/i18n` | Internationalization | [packages/platform/i18n/](packages/platform/i18n/) |
| `@soundblue/seo` | SEO & meta tags | [packages/platform/seo/](packages/platform/seo/) |
| `@soundblue/pwa` | PWA configuration | [packages/platform/pwa/](packages/platform/pwa/) |

### UI Layer (UI 레이어)

> React components and hooks.

| Package | Description | Code |
|---------|-------------|------|
| `@soundblue/ui-components/base` | Base components | [packages/ui/components/src/base/](packages/ui/components/src/base/) |
| `@soundblue/ui-components/composite` | Composite layouts | [packages/ui/components/src/composite/](packages/ui/components/src/composite/) |
| `@soundblue/ui-components/icons` | Icon components | [packages/ui/components/src/icons/](packages/ui/components/src/icons/) |

---

## 🎯 Development Philosophy (개발 철학)

> 📄 **Full documentation:** [CLAUDE.md](CLAUDE.md)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🎯 핵심: "테스트 통과"가 아니라 "제품 개선"이 목표                                ║
║     Goal: "Making the product better", NOT "making tests pass"              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 금지 (Anti-Patterns):              🟢 권장 (Best Practices):             ║
║  ┌────────────────────────────┐       ┌────────────────────────────┐        ║
║  │ • 하드코딩 (Hardcoding)      │       │ • 일반화 (Generalization)   │        ║
║  │ • 과적합 (Overfitting)       │       │ • 확장 (Extension)          │        ║
║  │ • 임시 해결 (Quick Fix)      │       │ • 구조적 해결 (Structural)   │        ║
║  │ • 삭제/교체 (Delete/Replace) │       │ • 명시적 처리 (Explicit)     │        ║
║  │ • 에러 숨기기 (Error Hiding) │       │ • 근본 원인 수정 (Root Cause)│        ║
║  └────────────────────────────┘       └────────────────────────────┘        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🚫 No Downgrade Policy (다운그레이드 금지 정책)

> 📄 **Full documentation:** [quality.md](.claude/rules/quality.md)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚫 다운그레이드 금지 - Forward Only 🚫                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ NEVER (절대 금지):                                                        ║
║     • Package version downgrade (패키지 버전 다운그레이드)                      ║
║     • Feature removal to avoid problems (기능 제거로 문제 회피)                ║
║     • Dependency rollback (의존성 롤백)                                       ║
║                                                                              ║
║  ✅ ALWAYS (항상 해야 할 것):                                                  ║
║     • Root cause analysis (근본 원인 분석)                                    ║
║     • New solution implementation (새로운 해결책 구현)                         ║
║     • Compatibility layer addition (호환성 레이어 추가)                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## ⚠️ SEO 렌더링 정책 - SPA 금지

> 📄 **Full documentation:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 SPA 금지 - SEO 치명적 영향 🚨                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  SPA 모드는 SEO에 치명적:                                                      ║
║  • 초기 HTML이 비어있어 크롤러가 콘텐츠를 인식 못함                               ║
║  • Google도 JS 렌더링 큐를 별도로 거쳐 색인이 지연됨                             ║
║  • Bing, Naver 등은 JS 렌더링 지원이 제한적/불가                                ║
║                                                                              ║
║  ✅ 허용 (ALLOWED):                                                          ║
║     • SSG (정적 생성) - 빌드 시 HTML 생성                                       ║
║     • SSR (서버 렌더링) - 요청 시 HTML 생성                                     ║
║                                                                              ║
║  ❌ 금지 (FORBIDDEN):                                                        ║
║     • SPA (클라이언트 렌더링) - 빈 HTML + JS로 렌더링                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🌐 Translator & Language Tools (번역기 & 언어 도구)

> 📄 **Full documentation:** [translator.md](.claude/rules/translator.md)

**핵심 원칙 (Core Principles):**
- 100% Algorithm-Based Generalization (알고리즘 기반 일반화)
- Never Delete, Only Add (삭제 금지, 추가만 허용)
- Context-Based Selection (문맥 기반 선택)

| Topic | Documentation |
|-------|---------------|
| Translator Development Rules | [.claude/rules/translator.md](.claude/rules/translator.md) |
| Dictionary Policy | [ARCHITECTURE.md#language-tools-dictionary-policy](docs/ARCHITECTURE.md#language-tools-dictionary-policy-언어-도구-사전-정책) |
| External Dictionary Sync | [ARCHITECTURE.md#external-dictionary-sync](docs/ARCHITECTURE.md#external-dictionary-sync-외부-사전-동기화) |
| Data/Logic Separation | [ARCHITECTURE.md#datalogic-separation](docs/ARCHITECTURE.md#datalogic-separation-architecture-데이터로직-분리-아키텍처) |

---

## ⚠️ Known Issues & Workarounds (알려진 이슈)

### SSG Hydration Bug (React Router v7 + React 19)

| Item | Description |
|------|-------------|
| **증상** | SSG 빌드 후 버튼 클릭이 작동하지 않음 |
| **원인** | Hydration 실패 시 DOM 중복 발생 |
| **해결** | `entry.client.tsx`에서 orphan DOM 제거 |
| **위치** | `apps/*/app/entry.client.tsx` |

**Related Issues:**
- [react-router#12893](https://github.com/remix-run/react-router/issues/12893)
- [react-router#12360](https://github.com/remix-run/react-router/issues/12360)

> ⚠️ **DO NOT DELETE** the workaround in `entry.client.tsx`

---

## ✨ Features (특징)

- 🌐 **Bilingual** - English & Korean (영어 & 한국어 지원)
- 📱 **PWA** - Install as app (앱으로 설치 가능)
- 🔌 **Offline** - Works without internet (인터넷 없이 작동)
- ⚡ **Fast** - 100% static sites (100% 정적 사이트)
- ♿ **Accessible** - WCAG compliant (웹 접근성 준수)

---

## 📚 Documentation Index (문서 인덱스)

| Category | Document | Description |
|----------|----------|-------------|
| **Architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 전체 아키텍처, 패키지 구조, SSR 원칙 |
| **Development Rules** | [CLAUDE.md](CLAUDE.md) | 개발 규칙, 코드 품질, 응답 규칙 |
| **Quality** | [.claude/rules/quality.md](.claude/rules/quality.md) | 품질 지표, 안티패턴, 12가지 품질 지표 |
| **Translator** | [.claude/rules/translator.md](.claude/rules/translator.md) | 번역기 개발 규칙, 하드코딩 정책 |
| **Tools** | [.claude/rules/tools.md](.claude/rules/tools.md) | 도구 개발 규칙, ToolGuide 필수 |

### Quick Links (빠른 링크)

| Topic | Link |
|-------|------|
| Package Layer Rules | [ARCHITECTURE.md#layer-dependency-rule](docs/ARCHITECTURE.md#2-layer-dependency-rule-레이어-의존성-규칙) |
| Dual Implementation Pattern | [ARCHITECTURE.md#dual-implementation](docs/ARCHITECTURE.md#3-dual-implementation-pattern-이중-구현-패턴) |
| Dictionary Policy | [ARCHITECTURE.md#dictionary-policy](docs/ARCHITECTURE.md#language-tools-dictionary-policy-언어-도구-사전-정책) |
| External Dictionary Sync | [ARCHITECTURE.md#external-dict](docs/ARCHITECTURE.md#external-dictionary-sync-외부-사전-동기화) |
| Data/Logic Separation | [ARCHITECTURE.md#data-logic](docs/ARCHITECTURE.md#datalogic-separation-architecture-데이터로직-분리-아키텍처) |
| SSG Hydration Workaround | [ARCHITECTURE.md#ssg-hydration](docs/ARCHITECTURE.md#ssg-hydration-workaround-자체-해결책) |
| Quality Principles | [ARCHITECTURE.md#quality](docs/ARCHITECTURE.md#4-quality-principles-품질-원칙) |
| No Downgrade Policy | [ARCHITECTURE.md#no-downgrade](docs/ARCHITECTURE.md#5-no-downgrade-policy-다운그레이드-금지-정책) |

---

<p align="center">
  Made with ❤️ by <a href="https://soundbluemusic.com">SoundBlue</a>
</p>
