# CLAUDE.md

SoundBlueMusic Web Tools Platform - SolidJS + Vinxi
(SoundBlueMusic 웹 도구 플랫폼 - SolidJS + Vinxi)

## Quick Reference (빠른 참조)

```bash
pnpm dev          # Dev server (개발 서버)
pnpm build        # Production build - Static Export (프로덕션 빌드)
pnpm check:fix    # Biome lint/format auto-fix (린트/포맷 자동 수정)
pnpm typecheck    # TypeScript check (타입 검사)
pnpm test:run     # Run tests (테스트 실행)
pnpm wasm:build   # Rust WASM build (WASM 빌드)
```

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

## Tech Stack (기술 스택)

- **Framework**: SolidJS 1.9, Vinxi 0.5, @solidjs/start 1.2
- **Routing**: @solidjs/router 0.15 (file-based routing)
- **Styling**: Tailwind CSS 4, Class Variance Authority
- **UI Components**: Kobalte (accessible primitives), custom components
- **Icons**: lucide-solid
- **State**: solid-js/store (createStore, createSignal)
- **Rendering**: Canvas 2D
- **Audio**: Web Audio API, AudioWorklet, Rust/WASM
- **MIDI**: WebMIDI API
- **Linter**: Biome 2.3
- **Test**: Vitest 4
- **PWA**: vite-plugin-pwa (Workbox)
- **i18n**: @solid-primitives/i18n
- **Storage**: Dexie (IndexedDB), FileSystem Access API
- **Deploy**: Cloudflare Pages (Static Export)
- **Build**: Vite 7 (via Vinxi)

## Directory Structure (디렉토리 구조)

```
src/
├── app.tsx                 # Root app component (Router, MetaProvider)
├── entry-client.tsx        # Client entry point
├── entry-server.tsx        # Server entry point
├── globals.css             # Global styles (Tailwind base, design tokens)
│
├── routes/                 # File-based routing (@solidjs/router)
│   ├── index.tsx           # Home (/) - Chat interface
│   ├── [tool].tsx          # Dynamic tool page (/[tool])
│   ├── built-with.tsx      # /built-with - Tech stack page
│   └── ko/                 # Korean routes (/ko/*)
│       ├── index.tsx
│       ├── [tool].tsx
│       └── built-with.tsx
│
├── components/
│   ├── ui/                 # UI components
│   │   ├── index.ts        # Barrel export
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   └── tooltip.tsx
│   ├── layout/             # Layout components (Header, Footer, MainLayout)
│   ├── sidebar/            # Tool sidebar (ToolSidebar, ToolCategory, ToolItem)
│   ├── chat/               # Chat interface (ChatContainer, ChatInput, ChatMessage)
│   ├── tools/              # Tool container (ToolContainer)
│   ├── canvas/             # Canvas 2D utilities
│   │   ├── index.ts        # Barrel export
│   │   ├── canvas-2d.tsx   # Canvas2D component
│   │   └── waveform.tsx    # Waveform, LevelMeter
│   ├── visualizations/     # Audio visualizations (Canvas 2D based)
│   │   ├── index.ts        # Barrel export
│   │   ├── spectrum.tsx
│   │   ├── vu-meter.tsx
│   │   └── waveform.tsx
│   ├── providers/          # Context providers
│   │   ├── index.ts        # Barrel export
│   │   └── theme-provider.tsx
│   └── error-boundary.tsx  # Error boundary component
│
├── tools/                  # Tool definitions (도구 정의)
│   ├── index.ts            # Exports & auto-registration
│   ├── registry.ts         # registerTool(), getTool(), searchTools()
│   ├── types.ts            # ToolDefinition, ToolMeta, ToolProps
│   ├── metronome/          # Metronome tool
│   ├── drum-machine/       # Drum machine tool
│   └── qr-generator/       # QR code generator tool
│
├── stores/                 # SolidJS stores (상태 저장소)
│   ├── index.ts            # Store exports
│   ├── audio-store.ts      # Transport, BPM, meters (solid-js/store)
│   ├── chat-store.ts       # Chat state
│   └── tool-store.ts       # Tool state
│
├── hooks/                  # Custom hooks (커스텀 훅)
│   ├── index.ts            # Hook exports
│   ├── use-audio-context.ts
│   ├── use-event-bus.ts
│   └── use-tempo.ts
│
├── lib/                    # Utilities (유틸리티)
│   ├── index.ts            # Barrel export
│   ├── utils.ts            # cn() (clsx + tailwind-merge)
│   ├── audio-context.ts    # AudioContext singleton
│   ├── event-bus.ts        # Inter-tool event system
│   ├── commands.ts         # Chat commands
│   └── toolCategories.ts   # Tool category definitions
│
├── engine/                 # Audio engine (오디오 엔진)
│   ├── index.ts
│   ├── audio-engine.ts
│   ├── wasm-loader.ts
│   ├── storage.ts
│   ├── midi.ts
│   └── worklet/
│       └── audio-processor.ts
│
├── types/                  # TypeScript type definitions (타입 정의)
│   └── browser-apis.d.ts   # Browser API type declarations
│
├── test/                   # Test configuration (테스트 설정)
│   └── setup.ts            # Vitest setup file
│
└── i18n/                   # Internationalization ko/en (국제화)
    ├── index.ts
    ├── context.tsx         # LanguageProvider (@solid-primitives/i18n)
    └── request.ts

messages/                   # Translation files (번역 파일)
├── ko.json
└── en.json

scripts/
├── generate-icons.ts       # Icon generation (아이콘 생성)
└── generate-sitemaps.ts    # Sitemap generation - postbuild (사이트맵 생성)
```

## Key Patterns (주요 패턴)

### Tool Definition (도구 정의)

```typescript
// src/tools/[name]/index.tsx
import type { Component } from 'solid-js';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';

export interface MyToolSettings {
  value: number;
  [key: string]: unknown;  // Required for ToolSettings compatibility
}

const MyToolComponent: Component<ToolProps<MyToolSettings>> = (props) => {
  const settings = () => props.settings;

  return (
    <div class="p-4">
      {/* Component implementation (컴포넌트 구현) */}
    </div>
  );
};

export const myTool: ToolDefinition<MyToolSettings> = {
  meta: {
    id: 'my-tool',
    name: { ko: '도구', en: 'Tool' },
    description: { ko: '설명', en: 'Description' },
    icon: '🔧',
    category: 'utility',  // 'music' | 'utility' | 'visual' | 'productivity'
    defaultSize: 'md',    // 'sm' | 'md' | 'lg' | 'xl' | 'full'
    minSize: { width: 320, height: 240 },  // optional (선택사항)
    tags: ['keyword1', 'keyword2'],        // optional, for search (검색용)
  },
  defaultSettings: { value: 0 },
  component: MyToolComponent,
};

// Auto-register at module load (모듈 로드 시 자동 등록)
registerTool(myTool);
```

### SolidJS Store (상태 저장소)

```typescript
// src/stores/[name]-store.ts
import { createStore } from 'solid-js/store';

interface MyState {
  value: number;
}

const initialState: MyState = {
  value: 0,
};

// Create the store
const [myStore, setMyStore] = createStore<MyState>(initialState);

// Actions
export const myActions = {
  setValue: (v: number) => {
    setMyStore('value', v);
  },
};

// Export store and selectors
export { myStore, setMyStore };

// Selector functions for fine-grained reactivity (성능을 위한 선택자 함수)
export const useValue = () => myStore.value;
```

### SolidJS Signals (로컬 상태)

```typescript
import { createSignal, createEffect, onCleanup, onMount } from 'solid-js';

const MyComponent: Component = () => {
  const [count, setCount] = createSignal(0);

  // Effect (runs on dependency change)
  createEffect(() => {
    console.log('Count changed:', count());
  });

  // Lifecycle
  onMount(() => {
    // Component mounted
  });

  onCleanup(() => {
    // Cleanup on unmount
  });

  return <div>{count()}</div>;
};
```

### Event Bus - Inter-tool Communication (도구 간 통신)

```typescript
import {
  eventBus,
  emitTempoChange,
  onTempoChange,
  emitBeatTick,
  onBeatTick,
  type TempoChangeEvent,
  type BeatTickEvent,
} from '@/lib/event-bus';

// Subscribe to tempo changes (템포 변경 구독)
onMount(() => {
  const unsubscribe = onTempoChange((event: TempoChangeEvent) => {
    if (event.source !== instanceId) {
      setLocalBpm(event.bpm);
    }
  });

  onCleanup(unsubscribe);
});

// Emit tempo change (템포 변경 발행)
emitTempoChange(newBpm, instanceId);

// Available events (사용 가능한 이벤트):
// - TEMPO_CHANGE: { bpm: number, source: string }
// - BEAT_TICK: { beat: number, measure: number, time: number }
// - MIDI_NOTE_ON/OFF: { note, velocity, channel }
// - MIDI_CC: { controller, value, channel }
```

### AudioContext - Shared Singleton (공유 싱글톤)

```typescript
import { getAudioContext, resumeAudioContext } from '@/lib/audio-context';

// Get AudioContext - creates if needed (필요시 생성)
const ctx = getAudioContext();

// Resume on user interaction - required by browsers (브라우저 정책상 필수)
await resumeAudioContext();
```

### i18n - Internationalization (국제화)

```typescript
import { useLanguage, useTranslations } from '@/i18n';

const MyComponent: Component = () => {
  // Full translations object
  const t = useTranslations();

  // Language control
  const { locale, setLocale, toggleLocale } = useLanguage();

  return (
    <div>
      <p>{t.common.title}</p>
      <button onClick={toggleLocale}>
        {locale() === 'ko' ? 'EN' : 'KO'}
      </button>
    </div>
  );
};
```

### Path Aliases (경로 별칭)

```typescript
import { cn } from '@/lib/utils';
import { audioStore, audioActions } from '@/stores/audio-store';
import { Button } from '@/components/ui/button';
import { LanguageProvider, useTranslations } from '@/i18n';
```

## Adding a New Tool (새 도구 추가)

1. Create `src/tools/[name]/index.tsx` with ToolDefinition
   (ToolDefinition으로 파일 생성)
2. Import in `src/tools/index.ts` to trigger auto-registration
   (자동 등록을 위해 import)
3. Add export: `export { myTool } from './[name]';`
   (export 추가)

## Configuration Files (설정 파일)

| File | Purpose (용도) |
|------|----------------|
| `app.config.ts` | Vinxi/SolidStart config (SSG, Vite plugins, PWA) |
| `biome.json` | Linter/formatter rules (린터/포맷터 규칙) |
| `tsconfig.json` | TypeScript config with path aliases (경로 별칭 포함) |
| `vitest.config.ts` | Unit test configuration (유닛 테스트 설정) |
| `playwright.config.ts` | E2E test configuration (E2E 테스트 설정) |

## Pre-commit Hooks (커밋 전 훅)

Husky + lint-staged automatically runs on commit (커밋 시 자동 실행):
```json
{
  "*.{ts,tsx,js,jsx,json}": ["biome check --write --no-errors-on-unmatched"]
}
```

## Project Rules (프로젝트 규칙)

### Required Technologies (필수 사용 기술)

#### 1. Package Manager - pnpm (패키지 매니저)
- Use pnpm only (pnpm만 사용)
- npm, yarn prohibited (npm, yarn 사용 금지)
- Use pnpm dlx instead of npx (npx 대신 pnpm dlx 사용)

#### 2. Language - TypeScript (언어)
- All files must be .ts or .tsx (모든 파일은 .ts 또는 .tsx로 작성)
- .js, .jsx, .mjs files prohibited (.js, .jsx, .mjs 파일 생성 금지)
- Define types explicitly (타입 명시적으로 정의)
- Minimize any type usage (any 타입 최소화)

#### 3. Styling - Tailwind CSS (스타일링)
- Use Tailwind utility classes in class attribute (class에 Tailwind 유틸리티 클래스 사용)
- Note: SolidJS uses `class` not `className`
- Inline style only for dynamic values (동적 값이 필요한 경우에만 인라인 style 허용)
- External library CSS imports allowed (외부 라이브러리 CSS import 허용)

### Code Quality (코드 품질)

- Use absolute path imports with `@/` (절대 경로 import 사용)
- Remove unused imports/variables (미사용 import/변수 제거)
- Remove console.log after debugging (console.log 디버깅 후 제거)
- Error handling required with try-catch (에러 처리 필수)
- Consider accessibility - alt, aria-label (접근성 고려)
- Run `pnpm check:fix` before commit (커밋 전 실행)
- **After modifying `package.json`, run `pnpm install` and commit `pnpm-lock.yaml` together**
  (package.json 수정 후 pnpm install 실행하고 pnpm-lock.yaml도 함께 커밋)

### Protected Files - Do Not Modify (건드리지 않을 파일)

- `public/` folder - auto-generated build files (빌드 자동 생성 파일들)
- `public/audio-worklet/*.js` - AudioWorklet technical constraint (기술적 제약)

### DO (권장사항)

- **SolidJS** primitives (createSignal, createEffect, onMount, onCleanup, Show, For)
- **solid-js/store** for shared state (createStore)
- **Kobalte** for accessible UI components (@kobalte/core)
- **Custom UI** components (from `@/components/ui/`)
- **Tailwind CSS** for styling with `class` attribute
- **Path Aliases** using `@/` prefix
- **TypeScript** strict mode - explicit types
- **Event Bus** for inter-tool communication
- **Shared AudioContext** via `@/lib/audio-context`

### DON'T (금지사항)

- ❌ npm, yarn → Use pnpm
- ❌ npx → Use pnpm dlx
- ❌ .js, .jsx, .mjs files → Use .ts, .tsx
- ❌ React patterns (useState, useEffect) → Use SolidJS (createSignal, createEffect)
- ❌ `className` attribute → Use `class` (SolidJS)
- ❌ CSS-in-JS → Use Tailwind
- ❌ `any` type → Define explicit types
- ❌ Direct AudioContext creation → Use shared singleton
- ❌ Commit without `pnpm check:fix`

## SolidJS vs React Cheatsheet (SolidJS vs React 비교)

| React | SolidJS |
|-------|---------|
| `useState` | `createSignal` |
| `useEffect` | `createEffect` |
| `useRef` | `let ref` or `createSignal` |
| `useMemo` | `createMemo` |
| `useCallback` | Regular function (no need) |
| `useContext` | `useContext` |
| `React.memo` | Not needed (fine-grained reactivity) |
| `className` | `class` |
| `{condition && <Comp/>}` | `<Show when={condition}><Comp/></Show>` |
| `{arr.map(x => ...)}` | `<For each={arr}>{(x) => ...}</For>` |
| `onClick={() => fn()}` | `onClick={fn}` or `onClick={() => fn()}` |

## SEO & PWA

### PWA (vite-plugin-pwa)
- Config in `app.config.ts` (VitePWA plugin)
- Workbox for service worker
- Manifest auto-generated
- Icons at `public/icons/`

## Environment Variables (환경 변수)

| Variable | Purpose (용도) |
|----------|----------------|
| `VITE_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics |

## Testing (테스트)

### Unit Tests (유닛 테스트)

```bash
pnpm test          # Watch mode (감시 모드)
pnpm test:run      # Single run (단일 실행)
pnpm test:coverage # With coverage (커버리지 포함)
```

Test files: `*.test.ts` alongside source files (소스 파일 옆에 테스트 파일 배치)

### E2E Tests (E2E 테스트)

```bash
pnpm test:e2e         # Run E2E tests (E2E 테스트 실행)
pnpm test:e2e:ui      # Run with Playwright UI (Playwright UI로 실행)
pnpm test:e2e:headed  # Run in headed mode (헤드 모드로 실행)
```
