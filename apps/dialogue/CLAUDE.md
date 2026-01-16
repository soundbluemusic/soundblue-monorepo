# Dialogue - Development Guide

**Offline Q&A Learning Tool**
(**오프라인 Q&A 학습 도구**)

프로젝트 개요, 기술 스택, 구조, 명령어: @README.md
SEO 렌더링 규칙: @../../.claude/rules/seo-rendering.md (⚠️ SPA 금지)

---

## 절대 규칙 (CRITICAL RULES)

> **이 규칙들은 절대 위반하지 말 것. 부모 CLAUDE.md의 모든 규칙 적용.**

1. **SPA 금지** - SSG 또는 SSR 사용. 클라이언트 렌더링만으로 동작하는 SPA 금지 (SEO 치명적).

2. **Offline-First** - 모든 데이터는 빌드 시 정적 파일에 포함.
   - 외부 API 호출 금지
   - 모든 Q&A 데이터는 `app/data/` 디렉토리에 저장
   - 런타임 네트워크 요청 절대 금지

3. **Bilingual Support** - 모든 콘텐츠는 영어/한국어 버전 필수.
   - UI 텍스트는 `app/i18n/` 또는 컴포넌트 내 하드코딩
   - Q&A 데이터는 EN/KO 필드 모두 포함

---

## Code Quality Rules (코드 품질 규칙)

부모 CLAUDE.md의 모든 규칙 적용:

### Absolute Prohibitions (절대 금지)
- Never delete/comment out code to hide errors
- Never hardcode values or mock data to pass tests
- Never disable tests, validation, or security checks
- Never use `// ... existing code ...` - always provide complete code

### Required Process (필수 프로세스)
Before any fix:
1. Identify root cause (WHY, not just WHAT)
2. Explain why naive fixes are wrong
3. Verify existing functionality is preserved

---

## Architecture Guidelines (아키텍처 가이드라인)

### Data Structure (데이터 구조)

```typescript
// app/data/questions.ts
export interface QAPair {
  id: string;
  question: {
    en: string;
    ko: string;
  };
  answer: {
    en: string;
    ko: string;
  };
  keywords: string[];
  category?: string;
}

export const qaData: QAPair[] = [
  {
    id: 'q1',
    question: {
      en: 'What is Dialogue?',
      ko: 'Dialogue가 무엇인가요?',
    },
    answer: {
      en: 'Dialogue is an offline Q&A learning tool...',
      ko: 'Dialogue는 오프라인 Q&A 학습 도구입니다...',
    },
    keywords: ['dialogue', 'about', '다이얼로그', '소개'],
  },
  // ... more Q&A pairs
];
```

### State Management (상태 관리)

Use Zustand for global state:

```typescript
// app/stores/chat-store.ts
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatStore {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));
```

### Language Switching (언어 전환)

```typescript
// app/stores/language-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageStore {
  locale: 'en' | 'ko';
  setLocale: (locale: 'en' | 'ko') => void;
  toggleLocale: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({ locale: state.locale === 'en' ? 'ko' : 'en' })),
    }),
    {
      name: 'dialogue-language',
    }
  )
);
```

---

## Component Patterns (컴포넌트 패턴)

### Chat Components (채팅 컴포넌트)

```tsx
// app/components/chat/ChatContainer.tsx
import { type FC } from 'react';
import { useChatStore } from '~/stores/chat-store';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export const ChatContainer: FC = () => {
  const messages = useChatStore((state) => state.messages);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <ChatInput />
    </div>
  );
};
```

### Layout Components (레이아웃 컴포넌트)

```tsx
// app/components/layout/MainLayout.tsx
import { type FC, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};
```

---

## Routing Structure (라우팅 구조)

### File-based Routing (파일 기반 라우팅)

```
app/routes/
├── home.tsx          # / (English home)
├── about.tsx         # /about (English about)
└── ko/
    ├── home.tsx      # /ko (Korean home)
    └── about.tsx     # /ko/about (Korean about)
```

### Route Configuration (라우트 설정)

```typescript
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
  async prerender() {
    return [
      '/',
      '/ko',
      '/about',
      '/ko/about',
      // Add more routes as needed
    ];
  },
} satisfies Config;
```

---

## Testing Guidelines (테스트 가이드라인)

### Unit Tests (유닛 테스트)

```tsx
// app/components/chat/__tests__/ChatMessage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: Date.now(),
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## Performance Optimization (성능 최적화)

### Code Splitting (코드 분할)

```tsx
import { lazy } from 'react';

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const MyRoute = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
};
```

### Memoization (메모이제이션)

```tsx
import { useMemo } from 'react';

const MyComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);

  return <div>{/* Use processedData */}</div>;
};
```

---

## PWA Configuration (PWA 설정)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Dialogue - Offline Learning Tool',
        short_name: 'Dialogue',
        description: 'Offline Q&A learning tool',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## Accessibility (접근성)

### Keyboard Navigation (키보드 내비게이션)

```tsx
const ChatInput = () => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <textarea
      onKeyDown={handleKeyDown}
      aria-label="Type your question"
      placeholder="Ask a question..."
    />
  );
};
```

### ARIA Labels (ARIA 레이블)

```tsx
<button aria-label="Clear conversation" onClick={clearMessages}>
  <TrashIcon />
</button>
```

---

## Deployment Checklist (배포 체크리스트)

Before deploying:

- [ ] Run `pnpm typecheck` - No type errors
- [ ] Run `pnpm check` - Biome lint/format passes
- [ ] Run `pnpm test:run` - All tests pass
- [ ] Run `pnpm build` - Build succeeds
- [ ] Check PWA manifest is valid
- [ ] Test offline functionality in dev tools
- [ ] Verify both EN and KO routes work
- [ ] Check accessibility with screen reader

---

## Common Patterns (일반 패턴)

### Error Boundaries (에러 경계)

```tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

---

## File Naming Conventions (파일 명명 규칙)

- Components: `PascalCase.tsx` (e.g., `ChatMessage.tsx`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- Stores: `kebab-case-store.ts` (e.g., `chat-store.ts`)
- Tests: `*.test.tsx` or `*.spec.tsx`
- Types: `types.ts` or `*.types.ts`

---

## Security Considerations (보안 고려사항)

### Content Security Policy (콘텐츠 보안 정책)

```
# public/_headers
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
```

### Input Sanitization (입력 살균)

Always sanitize user input before displaying:

```tsx
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);
```

---

## References (참고 자료)

- Parent: `/home/user/soundblue-monorepo/CLAUDE.md`
- README: `/home/user/soundblue-monorepo/apps/dialogue/README.md`
- React Router Docs: https://reactrouter.com/
- Tailwind CSS: https://tailwindcss.com/
- Zustand: https://docs.pmnd.rs/zustand/

---

Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
