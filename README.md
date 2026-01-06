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
│   │   ├── audio-engine/   → Audio timing & sequencing (오디오 타이밍 & 시퀀싱)
│   │   └── locale/         → Pure locale utilities (순수 로케일 유틸)
│   │
│   ├── 🖥️ platform/        → Browser API adapters with dual implementation (브라우저 API 어댑터)
│   │   ├── web-audio/      → Web Audio API (웹 오디오 API)
│   │   ├── storage/        → IndexedDB & localStorage (스토리지)
│   │   ├── worker/         → Web Worker RPC (웹 워커 RPC)
│   │   ├── i18n/           → Internationalization (국제화)
│   │   ├── seo/            → SEO utilities (SEO 유틸리티)
│   │   └── pwa/            → PWA configuration (PWA 설정)
│   │
│   └── 🎨 ui/              → React components (리액트 컴포넌트)
│       └── components/     → Unified UI library (통합 UI 라이브러리)
│           ├── base/       → Base components: Button, Input (기본 컴포넌트)
│           ├── composite/  → Composite patterns: Chat, Tool (복합 패턴)
│           └── icons/      → Icon components (아이콘)
│
├── 🔧 tooling/             → Shared configs (공유 설정)
│   ├── tsconfig/           → TypeScript config
│   ├── tailwind/           → Tailwind preset
│   └── biome/              → Biome config
│
└── 📜 scripts/             → Build & automation scripts (빌드 & 자동화 스크립트)
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
│         (hangul, translator, nlu, audio-engine, locale)         │
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
| `@soundblue/locale` | Pure locale utilities (순수 로케일 유틸) | `getLocaleFromPath`, `isValidLocale`, `Locale` |

### Platform Layer (플랫폼 레이어)

> Browser API adapters. All have `.browser.ts` + `.noop.ts` dual implementation.
> (브라우저 API 어댑터. 모두 `.browser.ts` + `.noop.ts` 이중 구현)

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@soundblue/web-audio` | Web Audio API wrapper (웹 오디오 래퍼) | `toneEngine`, `DrumMachine`, `Metronome` |
| `@soundblue/storage` | IndexedDB & localStorage (스토리지) | `db`, `createStore` |
| `@soundblue/worker` | Web Worker RPC (웹 워커 RPC) | `WorkerRPC`, `createWorkerRPC` |
| `@soundblue/i18n` | Internationalization (국제화) | `LocaleProvider`, `useLocale`, `getBrowserLocale` |
| `@soundblue/seo` | SEO & meta tags (SEO & 메타태그) | `StructuredData`, `createMeta` |
| `@soundblue/pwa` | PWA configuration (PWA 설정) | `usePWA`, `pwaConfig` |

### UI Layer (UI 레이어)

> React components and hooks.
> (리액트 컴포넌트 및 훅)

| Package | Description | Key Exports |
|---------|-------------|-------------|
| `@soundblue/ui-components/base` | Base components (기본 컴포넌트) | `Button`, `Input`, `ThemeProvider`, `useTheme`, `cn` |
| `@soundblue/ui-components/composite` | Composite layouts (복합 레이아웃) | `ChatContainer`, `ChatMessage`, `ToolSidebar` |
| `@soundblue/ui-components/icons` | Icon components (아이콘) | `PlayIcon`, `PauseIcon`, etc. |

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
| `pnpm build:all` | Build with prebuild hooks (prebuild 훅 포함 빌드) |
| `pnpm test` | Run tests (테스트 실행) |
| `pnpm check:fix` | Lint & format (린트 & 포맷) |
| `pnpm sync:context-dict` | Sync external dictionary (외부 사전 동기화) |

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

## 🎯 Development Philosophy (개발 철학)

> **Quality/Performance First, NOT Test Passing First**
> **(품질/성능 우선, 테스트 통과 우선 아님)**

This principle applies to **ALL apps and packages** in this monorepo.

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

**Quick Check (자가 검증):**
- [ ] 비슷한 다른 케이스에서도 작동하는가?
- [ ] 기존 기능을 삭제하지 않고 확장하는가?
- [ ] 테스트 통과가 아닌 제품 개선이 목적인가?
- [ ] **vitest와 UI 양쪽에서 모두 검증했는가?**

📄 **Full documentation:** `CLAUDE.md`

---

## ⚠️ UI-vitest Synchronization (UI-vitest 동기화)

> **UI and vitest MUST be 100% identical**
> **(UI와 vitest는 반드시 100% 동일해야 한다)**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              UI와 vitest는 반드시 100% 동일해야 한다                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 절대 금지:                                                                ║
║  • vitest에서만 통과하고 UI에서 실패하는 변경                                    ║
║  • UI에서만 통과하고 vitest에서 실패하는 변경                                    ║
║  • "코드상으로는 통과" 같은 애매한 표현                                          ║
║  • "엄격한 테스트" vs "관대한 테스트" 구분                                       ║
║                                                                              ║
║  ✅ 필수:                                                                     ║
║  • 테스트 파일과 UI 컴포넌트가 완전히 동일한 로직 사용                             ║
║  • 변경 후 반드시 양쪽에서 테스트 실행                                           ║
║  • 결과 보고 시 vitest와 UI 모두 확인 후 보고                                   ║
║                                                                              ║
║  ⚠️ 위반 시: "해결되었습니다" 같은 보고는 무효                                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

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

📄 **Full documentation:** `apps/tools/app/tools/translator/CLAUDE.md`

---

## 🔒 Language Tools: Dictionary Policy (언어 도구: 사전 수정 정책)

> **Never Delete, Only Add, Context-Based Selection**
> **(삭제 금지, 추가만 허용, 문맥 기반 선택)**

This policy applies to **ALL language-related tools** (translator, hangul, nlu, and future tools).

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            삭제 금지, 추가만 허용, 문맥 기반 선택                                  ║
║            (Never Delete, Only Add, Context-Based Selection)                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  🔴 절대 금지 (NEVER):                                                        ║
║     • 기존 단어 매핑 삭제                                                      ║
║       예: 대단하다: 'wonderful' → 'amazing' (삭제 후 교체 ❌)                   ║
║     • 테스트 통과를 위한 기존 의미 변경/삭제                                      ║
║                                                                              ║
║  🟢 허용 (ALLOWED):                                                          ║
║     • 동의어/대체 표현 추가                                                    ║
║       예: 대단하다: ['wonderful', 'amazing', 'remarkable']                    ║
║     • 문맥별 변형 추가                                                        ║
║       예: { default: 'wonderful', casual: 'amazing' }                        ║
║     • 새로운 단어 쌍 추가                                                     ║
║                                                                              ║
║  🔵 선택 로직:                                                               ║
║     문맥 분석기가 문장 분위기, 주변 단어, 화자 유형을 고려하여 적절한 의미 선택      ║
║                                                                              ║
║  ⚠️ 핵심: 도구 성능이 우선, 테스트 통과가 우선 아님                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Applies to (적용 범위):**
- `apps/tools/app/tools/translator/` - Translator (번역기)
- `packages/core/translator/` - Translation engine core (번역 엔진)
- `packages/core/hangul/` - Hangul processing (한글 처리)
- `packages/core/nlu/` - Natural language understanding (자연어 이해)
- All future Korean-English language tools (향후 모든 한영 언어 도구)

---

## 📡 External Dictionary Sync (외부 사전 동기화)

> **Build-time vocabulary sync from public-monorepo**
> **(빌드 시 public-monorepo에서 어휘 자동 동기화)**

The translator automatically syncs vocabulary from [public-monorepo](https://github.com/soundbluemusic/public-monorepo) at build time.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  public-monorepo (GitHub)                                                   │
│  └── data/context/                                                          │
│      ├── meta.json (dynamic file list)                                      │
│      ├── entries/*.json (word data)                                         │
│      └── conversations.json (dialogue examples)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                          │
                          ▼ pnpm build:all (prebuild hook)
┌─────────────────────────────────────────────────────────────────────────────┐
│  translator/dictionary/external/                                            │
│  ├── words.ts (1,185+ ko→en, 1,177+ en→ko words)                           │
│  └── sentences.ts (211+ sentence pairs)                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Command | Description |
|---------|-------------|
| `pnpm sync:context-dict` | Manual sync (수동 동기화) |
| `pnpm build:all` | Auto sync + build (자동 동기화 + 빌드) |

**Key points:**
- ✅ External dict = lowest priority (no conflict with manual dict)
- ✅ Sentence dict = highest priority (exact match)
- ❌ Never edit `external/` folder directly (auto-generated)

---

## 📦 Data/Logic Separation (데이터/로직 분리)

> **Logic stays here, Data goes to Context app**
> **(로직은 여기에, 데이터는 Context 앱으로)**

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│  soundblue-monorepo (여기)       │     │  public-monorepo (Context 앱)   │
├─────────────────────────────────┤     ├─────────────────────────────────┤
│ ✅ Architecture (아키텍처)       │     │ ✅ Vocabulary (어휘)            │
│ ✅ Algorithms (알고리즘)         │     │    • Word pairs (단어 쌍)       │
│ ✅ Grammar Patterns (문법 패턴)  │     │    • Stems (어간)               │
│ ✅ Translation Pipeline (로직)   │     │    • Idioms (관용어)            │
│ ✅ Morpheme Rules (형태소 규칙)  │     │                                 │
│ ✅ Code Structure (설계)         │     │ ✅ Particles/Endings (조사/어미) │
│                                 │     │ ✅ Domain Terms (도메인 어휘)    │
│ Examples:                       │     │    • Colors, Countries          │
│ • SVO↔SOV conversion            │     │    • Professional terms         │
│ • Morpheme analyzer             │     │                                 │
│ • Context analyzer              │     │                                 │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

### Data Flow (데이터 흐름)

```
public-monorepo/data/context/
        │
        ▼ pnpm sync:context-dict
        │
data/dictionaries/*.json          ← Single Source of Truth
        │
        ▼ pnpm prebuild
        │
dictionary/generated/*.ts         ← Auto-generated TypeScript
        │
        ▼ import
        │
dictionary/*.ts                   ← Logic only (로직만)
```

### Key Files (주요 파일)

| Location | Content |
|----------|---------|
| `data/dictionaries/*.json` | Pure vocabulary data (JSON) |
| `dictionary/generated/*.ts` | Auto-generated from JSON (don't edit) |
| `dictionary/*.ts` | Logic/algorithms only |
| `dictionary/external/*.ts` | Synced from Context app (don't edit) |

### Commands (명령어)

| Command | Description |
|---------|-------------|
| `pnpm prebuild` | Generate TypeScript from JSON |
| `pnpm sync:context-dict` | Sync vocabulary from Context app |
| `pnpm build:all` | Full build (prebuild + sync + build) |

📄 **Full documentation:** `CLAUDE.md` → "Data/Logic Separation Architecture"

---

## ⚠️ Known Issues & Workarounds (알려진 이슈 & 해결책)

### SSG Hydration Bug (React Router v7 + React 19)

> **자체 해결책 - 공식 수정 미제공**

| Item | Description |
|------|-------------|
| **증상** | SSG 빌드 후 버튼 클릭이 작동하지 않음 (Buttons don't work after SSG build) |
| **원인** | Hydration 실패 시 DOM 중복 발생 (DOM duplication on hydration failure) |
| **해결** | `entry.client.tsx`에서 orphan DOM 제거 (Remove orphan DOM in entry.client.tsx) |
| **위치** | `apps/*/app/entry.client.tsx` |

```typescript
// apps/*/app/entry.client.tsx - DO NOT DELETE!
setTimeout(() => {
  const divs = [...document.body.children].filter(el => el.tagName === 'DIV');
  if (divs.length >= 2 && !Object.keys(divs[0]).some(k => k.startsWith('__react'))) {
    divs[0].remove();
  }
}, 100);
```

**Related Issues:**
- [react-router#12893](https://github.com/remix-run/react-router/issues/12893)
- [react-router#12360](https://github.com/remix-run/react-router/issues/12360)

---

## ⚠️ SSG Only Policy (SSG 전용 정책)

> **This project uses 100% SSG (Static Site Generation) mode ONLY.**
> **(이 프로젝트는 100% SSG 모드만 사용합니다.)**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ⚠️ SSG ONLY - CRITICAL RULE ⚠️                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ NEVER enable these modes:                                                ║
║     • SPA mode (removing prerender)                                          ║
║     • SSR mode (ssr: true)                                                   ║
║     • Server-side logic / API routes                                         ║
║     • Server components                                                      ║
║                                                                              ║
║  ✅ ALWAYS keep these settings:                                              ║
║     • ssr: false                                                             ║
║     • prerender() with all routes listed                                     ║
║     • Dual implementation for browser APIs                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

```typescript
// react-router.config.ts - Required configuration
export default {
  ssr: false,           // NEVER change to true!
  async prerender() {   // NEVER remove this function!
    return [/* all routes */];
  },
} satisfies Config;
```

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
