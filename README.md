# 🎵 SoundBlue Monorepo

**A creative platform for musicians**
**(뮤지션을 위한 크리에이티브 플랫폼)**

---

## 🎯 App List (앱 리스트)

|  | 🎵 Sound Blue | 🎛️ Tools | 💬 Dialogue |
|--|---------------|----------|-------------|
| **What** | Artist Website (아티스트 웹사이트) | Music Tools (음악 도구) | Learning Tool (학습 도구) |
| **URL** | soundbluemusic.com | tools.soundbluemusic.com | dialogue.soundbluemusic.com |

<br>

### 🎵 Sound Blue

> Official website for SoundBlue
> (SoundBlue 공식 웹사이트)

- 🎧 Music & Albums (음악 & 앨범)
- 📰 News & Blog (뉴스 & 블로그)
- 🤖 AI Chat Assistant (AI 채팅 어시스턴트)

<br>

### 🎛️ Tools

> Free music tools for everyone
> (누구나 무료로 쓰는 음악 도구)

- 🥁 Drum Machine (드럼 머신)
- ⏱️ Metronome (메트로놈)
- 📱 QR Code Generator (QR 코드 생성기)
- 🌐 Translator (번역기) - Ko↔En bidirectional (한영 양방향)

<br>

### 💬 Dialogue

> Offline Q&A learning tool
> (오프라인 Q&A 학습 도구)

- 🔌 Works offline (오프라인 작동)
- 🌏 2 Languages: EN / KO (2개 언어 지원)
- ⚡ Instant answers (즉시 답변)

---

## 🛠️ Tech Stack (기술 스택)

### Frontend (프론트엔드)

| Tech | Description (설명) |
|------|-------------------|
| **React 19** | Fast reactive framework (빠른 반응형 프레임워크) |
| **React Router 7** | SSG mode routing (SSG 모드 라우팅) |
| **TypeScript** | Type-safe JavaScript (타입 안전한 자바스크립트) |
| **Tailwind CSS** | Utility-first styling (유틸리티 기반 스타일링) |

### Build & Deploy (빌드 & 배포)

| Tech | Description (설명) |
|------|-------------------|
| **Vite** | Fast build tool (빠른 빌드 도구) |
| **pnpm** | Fast package manager (빠른 패키지 매니저) |
| **Cloudflare** | Static hosting (정적 호스팅) |

### Quality (코드 품질)

| Tech | Description (설명) |
|------|-------------------|
| **Biome** | Linting & formatting (린팅 & 포맷팅) |
| **Vitest** | Unit testing (유닛 테스트) |
| **Playwright** | E2E testing (E2E 테스트) |

---

## 📁 Project Structure (폴더 구조)

```
soundblue-monorepo/
│
├── 📱 apps/
│   ├── sound-blue/         → Artist website (아티스트 웹사이트)
│   ├── tools/              → Music tools (음악 도구)
│   └── dialogue/           → Learning tool (학습 도구)
│
├── 📦 packages/
│   │
│   ├── 🧠 core/            → Pure logic, no browser APIs (순수 로직, 브라우저 API 없음)
│   │   ├── hangul/         → Korean text processing (한글 처리)
│   │   ├── translator/     → Translation engine (번역 엔진)
│   │   ├── nlu/            → Natural language understanding (자연어 이해)
│   │   └── audio-engine/   → Audio timing & sequencing (오디오 타이밍 & 시퀀싱)
│   │
│   ├── 🖥️ platform/        → Browser API adapters with dual implementation (브라우저 API 어댑터)
│   │   ├── web-audio/      → Web Audio API (웹 오디오 API)
│   │   ├── storage/        → IndexedDB & localStorage (스토리지)
│   │   └── worker/         → Web Worker RPC (웹 워커 RPC)
│   │
│   ├── 🎨 ui/              → React components (리액트 컴포넌트)
│   │   ├── primitives/     → Base components: Button, Input, etc. (기본 컴포넌트)
│   │   ├── patterns/       → Composite patterns: Chat, Tool layouts (복합 패턴)
│   │   └── icons/          → Icon components (아이콘 컴포넌트)
│   │
│   ├── 🌐 i18n/            → Internationalization (국제화)
│   ├── 🔍 seo/             → SEO utilities & structured data (SEO 유틸리티)
│   ├── 📱 pwa/             → PWA configuration & hooks (PWA 설정 & 훅)
│   ├── ⚙️ config/          → Shared configs: TypeScript, Tailwind, Biome (공유 설정)
│   │
│   └── 🗄️ shared-react/    → [DEPRECATED] Legacy shared code (레거시 공용 코드)
│
└── 📜 scripts/             → Build & automation scripts (빌드 & 자동화 스크립트)
```

### Package Layer Rules (패키지 레이어 규칙)

```
┌─────────────────────────────────────────────────────────────────┐
│                           apps/                                 │
│                    (sound-blue, tools, dialogue)                │
├─────────────────────────────────────────────────────────────────┤
│         ui/          │    i18n/    │    seo/    │    pwa/       │
│  (primitives, patterns, icons)                                  │
├─────────────────────────────────────────────────────────────────┤
│                        platform/                                │
│              (web-audio, storage, worker)                       │
│           .browser.ts (실제) / .noop.ts (빈 구현)                │
├─────────────────────────────────────────────────────────────────┤
│                          core/                                  │
│            (hangul, translator, nlu, audio-engine)              │
│                 No browser APIs allowed!                        │
└─────────────────────────────────────────────────────────────────┘

↑ Upper layers can import from lower layers (상위 → 하위 import 가능)
↓ Lower layers CANNOT import from upper layers (하위 → 상위 import 금지)
```

### Dual Implementation Pattern (이중 구현 패턴)

All `platform/` packages use dual implementation for SSG compatibility:
(모든 `platform/` 패키지는 SSG 호환을 위해 이중 구현 사용)

| File | Purpose (용도) | Environment (환경) |
|------|---------------|-------------------|
| `*.browser.ts` | Real implementation (실제 구현) | Browser runtime (브라우저 런타임) |
| `*.noop.ts` | Empty/stub implementation (빈 구현) | SSG build time (SSG 빌드 시) |

```typescript
// package.json exports 예시
{
  "exports": {
    ".": {
      "browser": "./src/index.browser.ts",  // 브라우저에서 사용
      "default": "./src/index.noop.ts"      // SSG 빌드에서 사용
    }
  }
}
```

---

## 📦 Package Reference (패키지 참조)

### Core Layer (코어 레이어)

> Pure TypeScript logic. No browser APIs, no React.
> (순수 TypeScript 로직. 브라우저 API 없음, React 없음)

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@soundblue/hangul` | Korean text processing (한글 처리) | `decompose`, `compose`, `isKoreanText`, `jamoEditDistance` |
| `@soundblue/translator` | Ko↔En translation engine (번역 엔진) | `translate`, `TranslatorEngine` |
| `@soundblue/nlu` | Intent & entity recognition (의도/엔티티 인식) | `parseIntent`, `extractEntities` |
| `@soundblue/audio-engine` | Audio timing & sequencing (오디오 타이밍) | `Clock`, `Scheduler`, `Pattern` |

### Platform Layer (플랫폼 레이어)

> Browser API adapters. All have `.browser.ts` + `.noop.ts` dual implementation.
> (브라우저 API 어댑터. 모두 `.browser.ts` + `.noop.ts` 이중 구현)

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@soundblue/web-audio` | Web Audio API wrapper (웹 오디오 래퍼) | `toneEngine`, `DrumMachine`, `Metronome` |
| `@soundblue/storage` | IndexedDB & localStorage (스토리지) | `db`, `createStore` |
| `@soundblue/worker` | Web Worker RPC (웹 워커 RPC) | `WorkerRPC`, `createWorkerRPC` |

### UI Layer (UI 레이어)

> React components and hooks.
> (리액트 컴포넌트 및 훅)

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@soundblue/ui-primitives` | Base components (기본 컴포넌트) | `Button`, `Input`, `ThemeProvider`, `useTheme`, `cn` |
| `@soundblue/ui-patterns` | Composite layouts (복합 레이아웃) | `ChatContainer`, `ChatMessage`, `ToolSidebar` |
| `@soundblue/icons` | Icon components (아이콘) | `PlayIcon`, `PauseIcon`, etc. |

### Cross-Cutting Layer (횡단 관심사 레이어)

> Shared concerns across all apps.
> (모든 앱에서 공유되는 관심사)

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@soundblue/i18n` | Internationalization (국제화) | `LocaleProvider`, `useLocale`, `getLocaleFromPath` |
| `@soundblue/seo` | SEO & meta tags (SEO & 메타태그) | `StructuredData`, `createMeta` |
| `@soundblue/pwa` | PWA configuration (PWA 설정) | `usePWA`, `pwaConfig` |
| `@soundblue/config` | Shared configs (공유 설정) | TypeScript, Tailwind, Biome presets |

> **Full Architecture Documentation:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🚀 Getting Started (시작하기)

### 1️⃣ Clone (클론)

```bash
git clone https://github.com/soundbluemusic/soundblue-monorepo.git
cd soundblue-monorepo
```

### 2️⃣ Install (설치)

```bash
pnpm install
```

### 3️⃣ Run (실행)

```bash
# Sound Blue (아티스트 웹사이트)
pnpm dev:main

# Tools (음악 도구)
pnpm dev:tools

# Dialogue (학습 도구)
pnpm dev:dialogue
```

---

## 📝 Scripts (스크립트)

| Command (명령어) | Description (설명) |
|-----------------|-------------------|
| `pnpm dev:main` | Run Sound Blue (Sound Blue 실행) |
| `pnpm dev:tools` | Run Tools (Tools 실행) |
| `pnpm dev:dialogue` | Run Dialogue (Dialogue 실행) |
| `pnpm build` | Build all apps (모든 앱 빌드) |
| `pnpm test` | Run tests (테스트 실행) |
| `pnpm check:fix` | Lint & format (린트 & 포맷) |

---

## 🔍 Type Validation Process (타입 검증 프로세스)

> Use this process when finding type errors or code quality issues
> (타입 에러나 코드 품질 문제를 찾을 때 사용)

| Step | Action | Parallel |
|------|--------|----------|
| 1 | `tsc --noEmit` (all apps) | Yes |
| 2 | `tsc --noEmit --strict` (all apps) | Yes |
| 3 | `grep ": any"` | Yes |
| 4 | `grep "as any"` | Yes |
| 5 | `grep "as never"` | Yes |
| 6 | `grep "as unknown"` | Yes |
| 7 | `grep "@ts-ignore"` | Yes |
| 8 | `grep "@ts-expect-error"` | Yes |
| 9 | Collect & fix all issues (수집 후 수정) | - |
| 10 | Verify with `tsc --noEmit --strict` (검증) | - |
| 11 | Commit (커밋) | - |

**Note:** Steps 1-8 can run in parallel. Steps 9-11 must run sequentially.

---

## 🔬 Code Analysis Rules (코드 분석 규칙)

> Rules for AI assistants when analyzing code or suggesting improvements
> (AI 어시스턴트가 코드 분석/개선 제안 시 따라야 하는 규칙)

### Prohibited (금지)

| ❌ Don't | ✅ Do |
|----------|-------|
| Assign severity (HIGH/MEDIUM/LOW) without evidence | Verify actual impact before labeling |
| Suggest improvements without verification | Check usage, tests, and intent first |
| Pass agent results without validation | Manually verify each finding |
| Assert when uncertain | Ask questions instead |

### Required Checklist (필수 체크리스트)

Before suggesting any improvement:

- [ ] Is the code actually used? (실제 사용 여부)
- [ ] Will tests break? (테스트 영향)
- [ ] Could this be intentional? (의도적 설계 여부)
- [ ] Does it cause runtime issues? (런타임 문제 여부)

### Core Principles (핵심 원칙)

1. **"Find issues" ≠ "There are issues"** - Search results aren't automatically problems
2. **Evidence-based severity** - Labels only after verified impact analysis
3. **Respect current code** - May be intentional design choice
4. **Question > Assert** - When uncertain, ask don't tell

📄 **Full documentation:** `.claude/rules/analysis.md`

---

## 🎯 Translator: Hardcoding Policy (번역기: 하드코딩 정책)

> **Hardcoding allowed ONLY with excellent logic design**
> **(좋은 로직 설계일 경우에만 하드코딩 허용)**

The translator at `apps/tools/app/tools/translator/` follows **algorithm-based generalization**.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              하드코딩은 좋은 로직 설계일 경우에만 허용                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ✅ 허용 (Good Logic): 일반화된 패턴, 언어학적 규칙, 재사용 가능한 구조           ║
║     예: "Did + S + V?" → 모든 의문문 처리                                     ║
║     예: 받침 유무 → 조사 선택 (을/를)                                          ║
║                                                                              ║
║  ❌ 금지 (Bad Logic): 특정 문장만 통과하고 비슷한 문장은 실패하는 로직            ║
║     예: /^Did you go to the museum/                                          ║
║     예: if (text === 'test sentence') return 'expected';                     ║
║                                                                              ║
║  판단 기준: 비슷한 다른 문장도 통과하는가? → Yes면 허용, No면 금지               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

📄 **Full documentation:** `apps/tools/app/tools/translator/README.md`

---

## ✨ Features (특징)

- 🌐 **Bilingual** - English & Korean (영어 & 한국어 지원)
- 📱 **PWA** - Install as app (앱으로 설치 가능)
- 🔌 **Offline** - Works without internet (인터넷 없이 작동)
- ⚡ **Fast** - 100% static sites (100% 정적 사이트)
- ♿ **Accessible** - WCAG compliant (웹 접근성 준수)

---

<p align="center">
  Made with ❤️ by <a href="https://soundbluemusic.com">SoundBlue</a>
</p>
