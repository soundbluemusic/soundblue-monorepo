# SoundBlue Monorepo Architecture

> SSG Edition - Domain-Based Package Structure
> (SSG 에디션 - 도메인 기반 패키지 구조)

---

## Overview (개요)

This document describes the architectural redesign of the SoundBlue monorepo, transitioning from a monolithic shared package to a domain-based multi-package structure optimized for Static Site Generation (SSG).

이 문서는 SoundBlue 모노레포의 아키텍처 재설계를 설명합니다. 모놀리식 공유 패키지에서 정적 사이트 생성(SSG)에 최적화된 도메인 기반 멀티 패키지 구조로 전환했습니다.

---

## Architecture Principles (아키텍처 원칙)

### 1. 100% SSG Compatibility (100% SSG 호환성)

All packages must support Static Site Generation build without errors.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ⚠️ SSG ONLY - CRITICAL RULE ⚠️                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  이 프로젝트는 100% SSG (Static Site Generation) 모드만 사용합니다.            ║
║  This project uses 100% SSG mode ONLY.                                       ║
║                                                                              ║
║  ❌ 절대 금지 (NEVER):                                                        ║
║  • SPA 모드 활성화 (SPA mode - removing prerender)                           ║
║  • SSR 모드 활성화 (SSR mode - ssr: true)                                    ║
║  • 서버 사이드 로직 (Server-side logic / API routes)                          ║
║  • 서버 컴포넌트 (Server components)                                          ║
║                                                                              ║
║  ✅ 필수 설정 (REQUIRED):                                                     ║
║  • ssr: false (항상 / always)                                                ║
║  • prerender() 함수에 모든 라우트 명시 (all routes listed)                    ║
║  • 브라우저 API는 이중 구현 사용 (dual implementation)                         ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

```
빌드 시 (Build Time)     →  .noop.ts (빈 구현)
브라우저 런타임 (Runtime) →  .browser.ts (실제 구현)
```

### 2. Layer Dependency Rule (레이어 의존성 규칙)

```
┌─────────────────────────────────────────┐
│              apps/                      │  ← Can import from all layers below
├─────────────────────────────────────────┤
│   ui/   │  i18n/  │  seo/  │  pwa/     │  ← Can import from platform/, core/
├─────────────────────────────────────────┤
│              platform/                  │  ← Can import from core/ only
├─────────────────────────────────────────┤
│               core/                     │  ← Cannot import from any layer
└─────────────────────────────────────────┘
```

**Rules:**
- `core/` packages have ZERO external dependencies on browser APIs
- `platform/` packages abstract browser APIs with dual implementation
- `ui/` packages can use React but must not directly call browser APIs
- `apps/` can import from any package

### 3. Dual Implementation Pattern (이중 구현 패턴)

All `platform/` packages MUST provide two implementations:

| File Pattern | Purpose | When Used |
|--------------|---------|-----------|
| `*.browser.ts` | Real browser API implementation | Browser runtime |
| `*.noop.ts` | Empty stub that throws or returns defaults | SSG build time |

```typescript
// package.json exports configuration
{
  "exports": {
    ".": {
      "types": "./src/types.ts",
      "browser": "./src/index.browser.ts",
      "default": "./src/index.noop.ts"
    }
  }
}
```

---

## Package Structure (패키지 구조)

### Before (이전 구조)

```
packages/
└── shared-react/           # Monolithic: everything mixed
    ├── components/
    ├── hooks/
    ├── storage/
    ├── i18n/
    └── ...
```

**Problems:**
- Mixed concerns (UI, storage, i18n in one package)
- SSG build failures due to browser API calls
- Circular dependencies
- Hard to test individual domains

### After (현재 구조)

```
packages/
├── core/                   # Pure logic (순수 로직)
│   ├── hangul/            # Korean text processing
│   ├── translator/        # Translation engine
│   ├── nlu/               # Natural language understanding
│   └── audio-engine/      # Audio timing & sequencing
│
├── platform/              # Browser API adapters (브라우저 API 어댑터)
│   ├── web-audio/         # Web Audio API
│   ├── storage/           # IndexedDB & localStorage
│   └── worker/            # Web Worker RPC
│
├── ui/                    # React components (리액트 컴포넌트)
│   ├── primitives/        # Base components
│   ├── patterns/          # Composite patterns
│   └── icons/             # Icon components
│
├── i18n/                  # Internationalization (국제화)
├── seo/                   # SEO utilities (SEO 유틸리티)
├── pwa/                   # PWA configuration (PWA 설정)
└── config/                # Shared configs (공유 설정)
```

---

## Package Details (패키지 상세)

### Core Layer

#### @soundblue/hangul

Korean text processing with Jamo decomposition/composition.

```typescript
import { decompose, compose, isKoreanText, jamoEditDistance } from '@soundblue/hangul';

decompose('한글');        // → ['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ']
compose(['ㅎ', 'ㅏ', 'ㄴ']); // → '한'
isKoreanText('안녕');     // → true
jamoEditDistance('한글', '한국'); // → 2
```

#### @soundblue/translator

Bidirectional Korean-English translation engine.

```typescript
import { translate } from '@soundblue/translator';

translate('안녕하세요', 'ko-en'); // → 'Hello'
translate('Hello', 'en-ko');      // → '안녕하세요'
```

#### @soundblue/nlu

Natural Language Understanding for intent/entity extraction.

```typescript
import { parseIntent, extractEntities } from '@soundblue/nlu';

parseIntent('Play some jazz music');
// → { intent: 'play_music', confidence: 0.95 }

extractEntities('Set alarm for 7am tomorrow');
// → [{ type: 'time', value: '7am' }, { type: 'date', value: 'tomorrow' }]
```

#### @soundblue/audio-engine

Pure audio timing and sequencing logic (no Web Audio API).

```typescript
import { Clock, Pattern } from '@soundblue/audio-engine';

const clock = new Clock({ bpm: 120 });
const pattern = new Pattern([1, 0, 1, 0, 1, 0, 1, 0]); // 8-step pattern
```

---

### Platform Layer

#### @soundblue/web-audio

Web Audio API wrapper with Tone.js integration.

```typescript
// Browser runtime
import { toneEngine, DrumMachine } from '@soundblue/web-audio';

await toneEngine.initialize();
const drums = new DrumMachine();
drums.play();
```

**Dual Implementation:**
- `index.browser.ts`: Real Tone.js + Web Audio API
- `index.noop.ts`: Throws "Not available during SSR"

#### @soundblue/storage

IndexedDB and localStorage abstraction.

```typescript
import { db, createStore } from '@soundblue/storage';

// IndexedDB
await db.conversations.add({ id: '1', messages: [] });

// localStorage with Zustand
const useSettings = createStore('settings', { theme: 'dark' });
```

#### @soundblue/worker

Web Worker RPC with timeout and cleanup.

```typescript
import { createWorkerRPC } from '@soundblue/worker';

const rpc = createWorkerRPC(new Worker('./worker.js'));
const result = await rpc.call('translate', { text: '안녕' }, 5000);
```

---

### UI Layer

#### @soundblue/ui-primitives

Base React components with Tailwind styling.

```typescript
import { Button, Input, ThemeProvider, useTheme, cn } from '@soundblue/ui-primitives';

function App() {
  return (
    <ThemeProvider>
      <Button variant="primary">Click me</Button>
      <Input placeholder="Type here..." />
    </ThemeProvider>
  );
}
```

**Exports:**
- Components: `Button`, `Input`, `Modal`, `Toast`
- Providers: `ThemeProvider`, `ToastProvider`
- Hooks: `useTheme`, `useToast`
- Utils: `cn` (classname merger)
- Types: `Message`, `MessageRole`

#### @soundblue/ui-patterns

Composite UI patterns for specific use cases.

```typescript
import { ChatContainer, ChatMessage, ToolSidebar } from '@soundblue/ui-patterns';

function ChatPage() {
  return (
    <ChatContainer>
      <ChatMessage role="user" content="Hello" />
      <ChatMessage role="assistant" content="Hi there!" />
    </ChatContainer>
  );
}
```

#### @soundblue/icons

SVG icon components.

```typescript
import { PlayIcon, PauseIcon, VolumeIcon } from '@soundblue/icons';

<PlayIcon className="w-6 h-6" />
```

---

### Cross-Cutting Layer

#### @soundblue/i18n

Internationalization with locale detection.

```typescript
import { LocaleProvider, useLocale, getLocaleFromPath } from '@soundblue/i18n';

function App() {
  return (
    <LocaleProvider defaultLocale="en">
      <MyComponent />
    </LocaleProvider>
  );
}

function MyComponent() {
  const { locale, setLocale } = useLocale();
  return <p>Current: {locale}</p>;
}
```

#### @soundblue/seo

SEO utilities and structured data.

```typescript
import { StructuredData, createMeta } from '@soundblue/seo';

// In route loader
export function meta() {
  return createMeta({
    title: 'My Page',
    description: 'Page description',
    ogImage: '/og-image.png',
  });
}

// In component
<StructuredData
  type="WebSite"
  data={{ name: 'SoundBlue', url: 'https://soundbluemusic.com' }}
/>
```

#### @soundblue/pwa

PWA configuration and hooks.

```typescript
import { usePWA, pwaConfig } from '@soundblue/pwa';

function InstallButton() {
  const { canInstall, install, isInstalled } = usePWA();

  if (isInstalled) return <p>Already installed!</p>;
  if (!canInstall) return null;

  return <button onClick={install}>Install App</button>;
}
```

---

## SSG Build Safety Checklist (SSG 빌드 안전 체크리스트)

Before deploying, verify:

- [ ] All `core/` packages have zero browser API imports
- [ ] All `platform/` packages have `.noop.ts` implementations
- [ ] `package.json` exports use `browser` + `default` conditions
- [ ] No `window`, `document`, `navigator` in non-platform code
- [ ] `react-router.config.ts` has `ssr: false` **(NEVER change to true!)**
- [ ] All routes are listed in `prerender()` **(NEVER remove this function!)**
- [ ] **NO SPA mode enabled** (prerender must exist and return routes)
- [ ] **NO SSR mode enabled** (ssr must be false)
- [ ] **NO API routes or server-side logic**

---

## Changelog (변경 이력)

### v2.0.0 - SSG Edition (2024-12)

**Breaking Changes:**
- Removed `@soundblue/shared-react` package (completely deleted)
- All browser APIs now behind dual implementation

**New Packages:**
- `@soundblue/storage` - IndexedDB & localStorage abstraction
- `@soundblue/worker` - Web Worker RPC
- `@soundblue/audio-engine` - Pure audio timing logic
- `@soundblue/ui-patterns` - Composite UI patterns
- `@soundblue/icons` - Icon components
- `@soundblue/i18n` - Internationalization
- `@soundblue/seo` - SEO utilities
- `@soundblue/pwa` - PWA configuration
- `@soundblue/config` - Shared configs

**Refactored Packages:**
- `@soundblue/web-audio` - Added dual implementation
- `@soundblue/ui-primitives` - Added Message type, cn utility
