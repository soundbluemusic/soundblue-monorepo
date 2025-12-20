# Layout Architecture - SoundBlueMusic Tools

다른 프로젝트에 적용할 수 있도록 상세히 정리한 레이아웃 아키텍처 문서입니다.

---

## 목차

1. [전체 구조 개요](#1-전체-구조-개요)
2. [상태 관리 (Store)](#2-상태-관리-store)
3. [MainLayout 컴포넌트](#3-mainlayout-컴포넌트)
4. [Header 컴포넌트](#4-header-컴포넌트)
5. [Sidebar 컴포넌트](#5-sidebar-컴포넌트)
6. [Chat Panel (리사이즈 가능)](#6-chat-panel-리사이즈-가능)
7. [Tool Container](#7-tool-container)
8. [Footer 컴포넌트](#8-footer-컴포넌트)
9. [반응형 처리](#9-반응형-처리)
10. [CSS 변수 및 유틸리티](#10-css-변수-및-유틸리티)
11. [적용 체크리스트](#11-적용-체크리스트)

---

## 1. 전체 구조 개요

### 레이아웃 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            HEADER (h-14, 56px)                          │
│  ┌─────────────────────────────┐     ┌─────────────────────────────────┐│
│  │ [Menu☰] Logo               │     │ [Nav] [Theme🌙] [Lang🌐]        ││
│  └─────────────────────────────┘     └─────────────────────────────────┘│
├─────────┬───────────────────────────────────────────────────────────────┤
│         │                                                               │
│ SIDEBAR │              MAIN CONTENT AREA                                │
│ (w-52   │  ┌─────────────────────┬─────────────────────────────────────┐│
│  또는    │  │   CHAT PANEL        │      TOOL CONTAINER                 ││
│  w-14)  │  │   (240~600px)       │         (flex-1)                    ││
│         │  │   리사이즈 가능       │                                     ││
│┌───────┐│  │                     ┃                                     ││
││ Tools ││  │                     ┃ ← resize handle                     ││
││ 제목   ││  │   ChatContainer     │                                     ││
││[◀ ▶]  ││  │                     │      ToolContainer                  ││
│├───────┤│  │                     │      또는                            ││
││Category││  │                     │      WorldClockWidget               ││
││ └ Item││  │                     │      (도구 미선택시)                   ││
││ └ Item││  │                     │                                     ││
│├───────┤│  │                     │                                     ││
││Category││  │                     │                                     ││
││ └ Item││  │                     │                                     ││
│├───────┤│  └─────────────────────┴─────────────────────────────────────┘│
││[More⋯]││                                                               │
│└───────┘│                                                               │
├─────────┴───────────────────────────────────────────────────────────────┤
│                            FOOTER (py-2)                                │
│                     텍스트 + 링크 (text-xs)                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 파일 구조

```
src/
├── components/
│   ├── layout/
│   │   ├── index.ts           # export { Header, Footer, MainLayout }
│   │   ├── MainLayout.tsx     # 루트 레이아웃 (핵심)
│   │   ├── Header.tsx         # 상단 헤더
│   │   └── Footer.tsx         # 하단 푸터
│   ├── sidebar/
│   │   ├── index.ts           # export { ToolSidebar, ToolCategory, ToolItem }
│   │   ├── ToolSidebar.tsx    # 사이드바 컨테이너
│   │   ├── ToolCategory.tsx   # 카테고리 (접이식)
│   │   └── ToolItem.tsx       # 개별 도구 버튼
│   ├── chat/
│   │   ├── index.ts
│   │   ├── ChatContainer.tsx  # 채팅 영역
│   │   ├── ChatInput.tsx      # 입력창
│   │   └── ChatMessage.tsx    # 메시지 컴포넌트
│   └── tools/
│       ├── index.ts
│       └── ToolContainer.tsx  # 도구 렌더링 영역
├── stores/
│   └── tool-store.ts          # 사이드바/도구 상태 관리
├── lib/
│   └── utils.ts               # cn() 함수 (clsx + tailwind-merge)
└── globals.css                # CSS 변수, 테마
```

---

## 2. 상태 관리 (Store)

### tool-store.ts - 전체 코드

```typescript
import { createStore } from 'solid-js/store';

// ========================================
// 타입 정의
// ========================================

export type ToolType = 'metronome' | 'qr' | 'drumMachine' | 'translator';

export interface ToolState {
  currentTool: ToolType | null;      // 현재 열린 도구
  toolSettings: {                     // 각 도구별 설정
    metronome: Partial<MetronomeSettings>;
    qr: Partial<QRSettings>;
    drumMachine: Partial<DrumMachineSettings>;
    translator: Partial<TranslatorSettings>;
  };
  sidebarOpen: boolean;              // 모바일: 사이드바 열림 여부
  sidebarCollapsed: boolean;         // 데스크탑: 사이드바 접힘 여부
}

// ========================================
// 초기 상태
// ========================================

const initialState: ToolState = {
  currentTool: null,
  toolSettings: {
    metronome: {},
    qr: {},
    drumMachine: {},
    translator: {},
  },
  sidebarOpen: true,      // 모바일 기본값: 닫힘 상태로 시작하려면 false
  sidebarCollapsed: false, // 데스크탑 기본값: 펼침
};

// ========================================
// Store 생성
// ========================================

const [toolStore, setToolStore] = createStore<ToolState>(initialState);

// ========================================
// Actions (상태 변경 함수들)
// ========================================

export const toolActions = {
  // 도구 열기
  openTool: (tool: ToolType): void => {
    setToolStore('currentTool', tool);
  },

  // 도구 닫기
  closeTool: (): void => {
    setToolStore('currentTool', null);
  },

  // 도구 설정 업데이트
  updateToolSettings: <T extends ToolType>(
    tool: T,
    settings: Partial<ToolState['toolSettings'][T]>
  ): void => {
    setToolStore('toolSettings', tool, (prev) => ({ ...prev, ...settings }));
  },

  // 모바일 사이드바 토글 (열기/닫기)
  toggleSidebar: (): void => {
    setToolStore('sidebarOpen', (prev) => !prev);
  },

  // 모바일 사이드바 상태 직접 설정
  setSidebarOpen: (open: boolean): void => {
    setToolStore('sidebarOpen', open);
  },

  // 데스크탑 사이드바 접기/펼치기 토글
  toggleSidebarCollapse: (): void => {
    setToolStore('sidebarCollapsed', (prev) => !prev);
  },

  // 데스크탑 사이드바 접힘 상태 직접 설정
  setSidebarCollapsed: (collapsed: boolean): void => {
    setToolStore('sidebarCollapsed', collapsed);
  },
};

// ========================================
// Export
// ========================================

export { toolStore, setToolStore };

// Selector 함수들 (선택적)
export const useCurrentTool = (): ToolType | null => toolStore.currentTool;
export const useSidebarOpen = (): boolean => toolStore.sidebarOpen;
export const useSidebarCollapsed = (): boolean => toolStore.sidebarCollapsed;
```

### 사이드바 상태 2가지 구분

| 상태 | 용도 | 기본값 |
|-----|------|-------|
| `sidebarOpen` | **모바일**: 슬라이드 오버레이 열림/닫힘 | `true` |
| `sidebarCollapsed` | **데스크탑**: 아이콘만 보이는 접힌 상태 | `false` |

---

## 3. MainLayout 컴포넌트

### 전체 코드

```tsx
import { type Component, createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { isServer } from 'solid-js/web';
import { ChatContainer } from '@/components/chat';
import { ToolSidebar } from '@/components/sidebar';
import { ToolContainer } from '@/components/tools';
import { cn } from '@/lib/utils';
import { toolActions, toolStore } from '@/stores/tool-store';
import { Footer } from './Footer';
import { Header } from './Header';

// ========================================
// 상수 정의
// ========================================

// 반응형 브레이크포인트
const BREAKPOINTS = {
  mobile: 768, // md breakpoint
} as const;

// Chat 패널 리사이즈 제한 (px)
const CHAT_WIDTH = {
  min: 240,
  max: 600,
  default: 320,
} as const;

// 사이드바 너비 (Tailwind 클래스와 일치해야 함)
const SIDEBAR_WIDTH = {
  collapsed: 56,  // w-14 = 3.5rem = 56px
  expanded: 208,  // w-52 = 13rem = 208px
} as const;

// 탭 버튼 스타일 (모바일용)
const TAB_BASE_CLASS = 'flex-1 py-3 text-sm font-medium transition-colors text-center';
const TAB_ACTIVE_CLASS = 'border-b-2 border-primary text-primary';
const TAB_INACTIVE_CLASS = 'text-muted-foreground';

// ========================================
// MainLayout Component
// ========================================

export const MainLayout: Component = () => {
  // ---- 반응형 상태 ----
  const [isMobile, setIsMobile] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal<'chat' | 'tool'>('chat');

  // ---- 리사이즈 상태 ----
  const [chatWidth, setChatWidth] = createSignal(CHAT_WIDTH.default);
  const [isResizing, setIsResizing] = createSignal(false);

  // ========================================
  // 화면 크기 감지
  // ========================================

  const checkScreenSize = () => {
    if (isServer) return;
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
  };

  onMount(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
  });

  onCleanup(() => {
    if (!isServer) {
      window.removeEventListener('resize', checkScreenSize);
    }
  });

  // 모바일로 전환시 사이드바 자동 닫기
  createEffect(() => {
    if (isMobile()) {
      toolActions.setSidebarOpen(false);
    }
  });

  // ========================================
  // Chat 패널 리사이즈 핸들러
  // ========================================

  const handleResizeStart = (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing()) return;

    // 사이드바 너비를 고려한 새 너비 계산
    const sidebarWidth = toolStore.sidebarCollapsed
      ? SIDEBAR_WIDTH.collapsed
      : SIDEBAR_WIDTH.expanded;
    const newWidth = e.clientX - sidebarWidth;

    // min/max 범위 제한
    const clampedWidth = Math.max(CHAT_WIDTH.min, Math.min(CHAT_WIDTH.max, newWidth));
    setChatWidth(clampedWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // 리사이즈 중 전역 마우스 이벤트
  createEffect(() => {
    if (isServer || !isResizing()) return;

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);

    onCleanup(() => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    });
  });

  // ========================================
  // 모바일 도구 선택시 탭 자동 전환
  // ========================================

  createEffect(() => {
    if (isMobile() && toolStore.currentTool) {
      toolActions.setSidebarOpen(false);
      setActiveTab('tool');
    }
  });

  // 모바일 오버레이 표시 조건
  const showMobileOverlay = () => isMobile() && toolStore.sidebarOpen;

  // ========================================
  // 렌더링
  // ========================================

  return (
    <div class="flex h-screen flex-col bg-background">
      {/* ======== HEADER ======== */}
      <Header />

      {/* ======== MAIN CONTENT ======== */}
      <main class="flex flex-1 overflow-hidden">

        {/* ---- 모바일 오버레이 (사이드바 뒤 배경) ---- */}
        <Show when={showMobileOverlay()}>
          <div
            class="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => toolActions.setSidebarOpen(false)}
          />
        </Show>

        {/* ---- SIDEBAR ---- */}
        <div
          class={cn(
            'z-50',
            // 모바일: fixed 오버레이
            isMobile() && 'fixed inset-y-0 left-0 pt-14 transition-transform duration-200',
            isMobile() && !toolStore.sidebarOpen && '-translate-x-full',
            // 데스크탑: static
            !isMobile() && 'relative'
          )}
        >
          <ToolSidebar />
        </div>

        {/* ---- MAIN AREA (Chat + Tool) ---- */}
        <div class="flex flex-1 overflow-hidden">

          {/* ======== 모바일: 탭 기반 뷰 ======== */}
          <Show when={isMobile()}>
            <div class="flex flex-1 flex-col min-h-[200px]">
              {/* Tab Switcher */}
              <div class="flex shrink-0 border-b">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  class={cn(
                    TAB_BASE_CLASS,
                    activeTab() === 'chat' ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS
                  )}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tool')}
                  class={cn(
                    TAB_BASE_CLASS,
                    activeTab() === 'tool' ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS
                  )}
                >
                  Tools
                </button>
              </div>

              {/* Tab Content */}
              <div class="flex-1 overflow-auto min-h-[150px]">
                <Show when={activeTab() === 'chat'}>
                  <ChatContainer />
                </Show>
                <Show when={activeTab() === 'tool'}>
                  <ToolContainer />
                </Show>
              </div>
            </div>
          </Show>

          {/* ======== 데스크탑: 2열 레이아웃 ======== */}
          <Show when={!isMobile()}>
            {/* Chat Area (리사이즈 가능) */}
            <div
              class="relative flex-shrink-0 border-r min-h-[200px]"
              style={{ width: `${chatWidth()}px` }}
            >
              <ChatContainer />

              {/* Resize Handle */}
              <div
                onMouseDown={handleResizeStart}
                class={cn(
                  'absolute -right-1 top-0 h-full w-3 cursor-col-resize',
                  'flex items-center justify-center',
                  'group'
                )}
              >
                <div
                  class={cn(
                    'h-full w-1 transition-colors duration-150',
                    'group-hover:bg-primary/30 group-active:bg-primary/50',
                    isResizing() && 'bg-primary/50'
                  )}
                />
              </div>
            </div>

            {/* Tool Area */}
            <div class="flex-1">
              <ToolContainer />
            </div>
          </Show>
        </div>
      </main>

      {/* ======== FOOTER ======== */}
      <Footer />
    </div>
  );
};
```

### 핵심 CSS 클래스 설명

| 클래스 | 용도 |
|-------|------|
| `flex h-screen flex-col` | 전체 화면 높이, 세로 방향 flex |
| `flex flex-1 overflow-hidden` | main 영역, 남은 공간 채움, 오버플로우 숨김 |
| `fixed inset-0 z-40` | 모바일 오버레이 (전체 화면 덮음) |
| `fixed inset-y-0 left-0` | 모바일 사이드바 (좌측 고정) |
| `-translate-x-full` | 모바일 사이드바 숨김 (왼쪽으로 이동) |
| `transition-transform duration-200` | 사이드바 슬라이드 애니메이션 |

---

## 4. Header 컴포넌트

### 전체 코드

```tsx
import { A, useIsRouting } from '@solidjs/router';
import { Menu, Moon, Sun, Globe, Loader2 } from 'lucide-solid';
import { type Component, Show } from 'solid-js';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { toolActions, toolStore } from '@/stores/tool-store';

export const Header: Component = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isRouting = useIsRouting();

  // 모바일 사이드바 토글
  const toggleMobileSidebar = () => {
    toolActions.setSidebarOpen(!toolStore.sidebarOpen);
  };

  return (
    <header class="relative z-30 flex h-14 items-center justify-between border-b bg-background px-4 pt-[env(safe-area-inset-top)]">

      {/* ======== LEFT: 모바일 메뉴 + 로고 ======== */}
      <div class="flex items-center gap-3">

        {/* 모바일 메뉴 토글 버튼 */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobileSidebar}
          class="md:hidden text-muted-foreground hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12]"
          aria-label="메뉴"
        >
          <Menu class="h-5 w-5" />
        </Button>

        {/* 로고 */}
        <A
          href="/"
          class="text-lg font-semibold tracking-tight text-brand transition-all duration-200 hover:opacity-80"
        >
          SoundBlue Tools
        </A>

        {/* 라우트 로딩 인디케이터 */}
        <Show when={isRouting()}>
          <Loader2 class="h-4 w-4 animate-spin text-primary" />
        </Show>
      </div>

      {/* ======== RIGHT: 컨트롤 버튼들 ======== */}
      <div class="flex items-center gap-1">

        {/* 네비게이션 링크 */}
        <A
          href="/built-with"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.08] dark:hover:bg-white/[0.12]"
        >
          Built With
        </A>

        {/* 테마 토글 */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark')}
          class="relative text-muted-foreground hover:text-foreground"
        >
          <Sun class="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon class="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* 언어 토글 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          class="gap-1.5 px-3"
        >
          <Globe class="h-4 w-4" />
          <span class="text-xs font-semibold">KO</span>
        </Button>
      </div>
    </header>
  );
};
```

### Header 핵심 스타일

```css
/* 헤더 기본 */
.header {
  position: relative;
  z-index: 30;                              /* z-30 */
  display: flex;
  height: 3.5rem;                           /* h-14 = 56px */
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  padding: 0 1rem;                          /* px-4 */
  padding-top: env(safe-area-inset-top);    /* 노치 대응 */
}

/* 모바일 메뉴 버튼: md 이상에서 숨김 */
.mobile-menu-btn {
  display: block;
}
@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;  /* md:hidden */
  }
}
```

---

## 5. Sidebar 컴포넌트

### ToolSidebar.tsx - 전체 코드

```tsx
import { useNavigate } from '@solidjs/router';
import { PanelLeftClose, PanelLeftOpen, MoreHorizontal } from 'lucide-solid';
import { type Component, createSignal, For, Show } from 'solid-js';
import { cn } from '@/lib/utils';
import { type ToolType, toolActions, toolStore } from '@/stores/tool-store';
import { ToolCategory } from './ToolCategory';

// ========================================
// 스타일 상수
// ========================================

const HOVER_STYLES = 'hover:bg-black/[0.08] dark:hover:bg-white/[0.12] hover:text-foreground';
const ACTIVE_STYLES = 'active:scale-95 active:bg-black/[0.12] dark:active:bg-white/[0.18]';
const FOCUS_STYLES = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export const ToolSidebar: Component = () => {
  const navigate = useNavigate();

  // 사이드바 접힘 상태 (store에서 가져옴)
  const isCollapsed = () => toolStore.sidebarCollapsed;

  // More 메뉴 열림 상태
  const [moreMenuOpen, setMoreMenuOpen] = createSignal(false);

  // 도구 클릭 핸들러
  const handleToolClick = (toolId: ToolType) => {
    navigate(`/${toolId}`);
    toolActions.openTool(toolId);
  };

  // ★ 사이드바 접기/펼치기 토글
  const toggleCollapse = () => {
    toolActions.toggleSidebarCollapse();
  };

  return (
    <aside
      class={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-200',
        isCollapsed() ? 'w-14' : 'w-52'  // ★ 접힘 상태에 따라 너비 변경
      )}
    >
      {/* ======== HEADER ======== */}
      <div
        class={cn(
          'flex items-center border-b px-3 py-3',
          isCollapsed() ? 'justify-center' : 'justify-between'
        )}
      >
        {/* 제목 (펼침 상태에서만 표시) */}
        <Show when={!isCollapsed()}>
          <h2 class="font-semibold text-sm">Tools</h2>
        </Show>

        {/* ★ 접기/펼치기 버튼 */}
        <button
          type="button"
          onClick={toggleCollapse}
          class={cn(
            'p-1.5 rounded-lg transition-all duration-200 ease-out',
            HOVER_STYLES,
            ACTIVE_STYLES,
            FOCUS_STYLES
          )}
          aria-label={isCollapsed() ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <Show
            when={isCollapsed()}
            fallback={<PanelLeftClose class="h-4 w-4" />}
          >
            <PanelLeftOpen class="h-4 w-4" />
          </Show>
        </button>
      </div>

      {/* ======== TOOL CATEGORIES (스크롤 영역) ======== */}
      <div class="flex-1 overflow-y-auto p-2 space-y-4">
        <For each={TOOL_CATEGORIES}>
          {(category) => (
            <ToolCategory
              category={category}
              onToolClick={handleToolClick}
              collapsed={isCollapsed()}
            />
          )}
        </For>
      </div>

      {/* ======== MORE MENU (하단 고정) ======== */}
      <div class="relative border-t p-2">
        {/* Popup Menu */}
        <Show when={moreMenuOpen()}>
          <div
            class={cn(
              'absolute bottom-full left-2 right-2 mb-1 z-50',
              'rounded-lg border bg-popover p-1 shadow-lg',
              isCollapsed() && 'left-0 right-auto w-48'
            )}
          >
            <a href="/about" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm">
              About
            </a>
            <a href="/sitemap.xml" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm">
              Sitemap
            </a>
          </div>
        </Show>

        {/* More 버튼 */}
        <button
          type="button"
          onClick={() => setMoreMenuOpen(!moreMenuOpen())}
          class={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground',
            HOVER_STYLES,
            FOCUS_STYLES,
            moreMenuOpen() && 'bg-black/[0.05] dark:bg-white/[0.08]',
            isCollapsed() && 'justify-center px-2'
          )}
        >
          <MoreHorizontal class="h-5 w-5" />
          <Show when={!isCollapsed()}>
            <span>More</span>
          </Show>
        </button>
      </div>
    </aside>
  );
};
```

### ToolCategory.tsx

```tsx
import { ChevronDown } from 'lucide-solid';
import { type Component, createSignal, For, Show } from 'solid-js';
import { cn } from '@/lib/utils';
import { ToolItem } from './ToolItem';

interface ToolCategoryProps {
  category: ToolCategory;
  onToolClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export const ToolCategory: Component<ToolCategoryProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true);

  return (
    <div class="space-y-1">
      {/* Category Header (접힘 상태에서는 숨김) */}
      <Show when={!props.collapsed}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen())}
          class={cn(
            'flex w-full items-center justify-between px-3 py-2 rounded-md',
            'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
            'hover:text-foreground transition-colors'
          )}
        >
          <span>{props.category.name}</span>
          <ChevronDown class={cn(
            'h-4 w-4 transition-transform',
            isOpen() && 'rotate-180'
          )} />
        </button>
      </Show>

      {/* Tool List */}
      <Show when={isOpen() || props.collapsed}>
        <div class={cn('space-y-0.5', !props.collapsed && 'pl-1')}>
          <For each={props.category.tools}>
            {(tool) => (
              <ToolItem
                tool={tool}
                onClick={props.onToolClick}
                collapsed={props.collapsed}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
```

### ToolItem.tsx

```tsx
import type { Component } from 'solid-js';
import { cn } from '@/lib/utils';
import { toolStore } from '@/stores/tool-store';

interface ToolItemProps {
  tool: ToolInfo;
  onClick: (toolId: ToolType) => void;
  collapsed?: boolean;
}

export const ToolItem: Component<ToolItemProps> = (props) => {
  const isActive = () => toolStore.currentTool === props.tool.id;

  return (
    <button
      type="button"
      onClick={() => props.onClick(props.tool.id)}
      class={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm',
        'transition-all duration-200 ease-out',
        // Hover 효과
        'hover:bg-black/[0.08] dark:hover:bg-white/[0.12]',
        'hover:text-foreground',
        // Active (클릭) 효과
        'active:scale-[0.98] active:bg-black/[0.12] dark:active:bg-white/[0.18]',
        // Focus 효과 (키보드 네비게이션)
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        // 현재 선택된 도구 강조
        isActive() && 'bg-brand/15 text-brand font-medium shadow-sm',
        // 접힘 상태
        props.collapsed && 'justify-center px-2'
      )}
      title={props.collapsed ? props.tool.name : undefined}
    >
      <span class="text-lg">{props.tool.icon}</span>
      {!props.collapsed && <span class="truncate">{props.tool.name}</span>}
    </button>
  );
};
```

### 사이드바 너비 요약

| 상태 | Tailwind | 픽셀 |
|-----|----------|-----|
| 펼침 (expanded) | `w-52` | 208px |
| 접힘 (collapsed) | `w-14` | 56px |

---

## 6. Chat Panel (리사이즈 가능)

### 리사이즈 로직 상세

```tsx
// 상수
const CHAT_WIDTH = {
  min: 240,     // 최소 너비
  max: 600,     // 최대 너비
  default: 320, // 기본 너비
};

const SIDEBAR_WIDTH = {
  collapsed: 56,
  expanded: 208,
};

// 상태
const [chatWidth, setChatWidth] = createSignal(CHAT_WIDTH.default);
const [isResizing, setIsResizing] = createSignal(false);

// 리사이즈 시작 (mousedown)
const handleResizeStart = (e: MouseEvent) => {
  e.preventDefault();
  setIsResizing(true);
  document.body.style.cursor = 'col-resize';    // 커서 변경
  document.body.style.userSelect = 'none';      // 텍스트 선택 방지
};

// 리사이즈 중 (mousemove)
const handleResizeMove = (e: MouseEvent) => {
  if (!isResizing()) return;

  // 사이드바 너비를 제외한 위치 계산
  const sidebarWidth = toolStore.sidebarCollapsed
    ? SIDEBAR_WIDTH.collapsed
    : SIDEBAR_WIDTH.expanded;

  const newWidth = e.clientX - sidebarWidth;

  // 범위 제한
  const clampedWidth = Math.max(
    CHAT_WIDTH.min,
    Math.min(CHAT_WIDTH.max, newWidth)
  );

  setChatWidth(clampedWidth);
};

// 리사이즈 종료 (mouseup)
const handleResizeEnd = () => {
  setIsResizing(false);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
};

// 전역 이벤트 리스너 (리사이즈 중에만)
createEffect(() => {
  if (!isResizing()) return;

  window.addEventListener('mousemove', handleResizeMove);
  window.addEventListener('mouseup', handleResizeEnd);

  onCleanup(() => {
    window.removeEventListener('mousemove', handleResizeMove);
    window.removeEventListener('mouseup', handleResizeEnd);
  });
});
```

### 리사이즈 핸들 마크업

```tsx
{/* Chat Area */}
<div
  class="relative flex-shrink-0 border-r"
  style={{ width: `${chatWidth()}px` }}
>
  <ChatContainer />

  {/* ★ Resize Handle */}
  <div
    onMouseDown={handleResizeStart}
    class={cn(
      'absolute -right-1 top-0 h-full w-3 cursor-col-resize',
      'flex items-center justify-center',
      'group'
    )}
  >
    {/* 시각적 표시 (hover/active 시 표시) */}
    <div
      class={cn(
        'h-full w-1 transition-colors duration-150',
        'group-hover:bg-primary/30',
        'group-active:bg-primary/50',
        isResizing() && 'bg-primary/50'
      )}
    />
  </div>
</div>
```

---

## 7. Tool Container

### ToolContainer.tsx 구조

```tsx
export const ToolContainer: Component = () => {
  const currentTool = () => toolStore.currentTool;
  const [containerSize, setContainerSize] = createSignal({ width: 320, height: 400 });
  let containerRef: HTMLDivElement | undefined;

  // 컨테이너 크기 측정 (ResizeObserver)
  onMount(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef) {
        const rect = containerRef.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    });
    if (containerRef) resizeObserver.observe(containerRef);
    onCleanup(() => resizeObserver.disconnect());
  });

  return (
    <div class="flex h-full flex-col bg-background">
      <Show
        when={currentTool()}
        fallback={
          // 도구 미선택시 위젯 표시
          <div class="hidden h-full md:block">
            <WorldClockWidget />
          </div>
        }
      >
        {/* ======== Tool Header ======== */}
        <div class="flex items-center justify-between border-b px-4 py-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{toolInfo()?.icon}</span>
            <h2 class="font-semibold text-sm">{toolInfo()?.name}</h2>
          </div>
          <div class="flex items-center gap-1">
            <button>Share URL</button>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>

        {/* ======== Tool Content ======== */}
        <div ref={containerRef} class="flex-1 overflow-auto">
          <Suspense fallback={<ToolLoading />}>
            <Switch>
              <Match when={currentTool() === 'metronome'}>
                <LazyMetronome settings={...} />
              </Match>
              {/* ... 다른 도구들 ... */}
            </Switch>
          </Suspense>
        </div>
      </Show>
    </div>
  );
};
```

---

## 8. Footer 컴포넌트

```tsx
export const Footer: Component = () => {
  return (
    <footer class="border-t bg-background px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <p class="text-center text-xs text-muted-foreground">
        UI/UX based on web standards
      </p>
      <p class="text-center text-xs text-muted-foreground">
        Tools by{' '}
        <a
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          YourBrand
        </a>
      </p>
    </footer>
  );
};
```

### Footer Safe Area

```css
/* 노치/홈바가 있는 기기 대응 */
padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
```

---

## 9. 반응형 처리

### 브레이크포인트

```typescript
const BREAKPOINTS = {
  mobile: 768, // md (Tailwind 기본값)
};
```

### 동작 비교

| 기능 | Mobile (<768px) | Desktop (≥768px) |
|-----|-----------------|------------------|
| **사이드바 위치** | `fixed` 오버레이 | `relative` 고정 |
| **사이드바 열기** | 슬라이드 인 | 항상 표시 |
| **사이드바 닫기** | 배경 클릭 또는 X | 접기 버튼 |
| **메인 영역** | 탭 전환 (Chat/Tool) | 2열 (Chat + Tool) |
| **Chat 리사이즈** | 불가 | 드래그로 조절 |

### 화면 크기 감지

```tsx
const [isMobile, setIsMobile] = createSignal(false);

const checkScreenSize = () => {
  if (typeof window === 'undefined') return;
  setIsMobile(window.innerWidth < 768);
};

onMount(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onCleanup(() => {
  window.removeEventListener('resize', checkScreenSize);
});
```

### 모바일 사이드바 CSS

```tsx
<div
  class={cn(
    'z-50',
    // 모바일
    isMobile() && [
      'fixed inset-y-0 left-0',           // 좌측 고정
      'pt-14',                             // 헤더 높이만큼 패딩
      'transition-transform duration-200', // 슬라이드 애니메이션
    ],
    isMobile() && !toolStore.sidebarOpen && '-translate-x-full', // 숨김
    // 데스크탑
    !isMobile() && 'relative'
  )}
>
  <ToolSidebar />
</div>
```

---

## 10. CSS 변수 및 유틸리티

### 핵심 CSS 변수 (globals.css)

```css
:root {
  /* ======== 색상 ======== */
  --background: 40 25% 95%;        /* 배경 */
  --foreground: 30 15% 18%;        /* 텍스트 */
  --card: 38 20% 91%;              /* 카드 배경 */
  --popover: 40 30% 98%;           /* 팝오버 배경 */
  --primary: 262 45% 52%;          /* 주요 색상 (버튼 등) */
  --secondary: 38 18% 88%;         /* 보조 색상 */
  --muted: 36 15% 86%;             /* 약한 배경 */
  --muted-foreground: 28 10% 38%;  /* 약한 텍스트 */
  --accent: 262 45% 52%;           /* 강조 색상 */
  --destructive: 0 50% 50%;        /* 위험/삭제 */
  --border: 35 15% 80%;            /* 테두리 */
  --input: 35 15% 80%;             /* 입력 필드 테두리 */
  --ring: 262 45% 52%;             /* 포커스 링 */
  --brand: 262 52% 58%;            /* 브랜드 색상 */

  /* ======== 기타 ======== */
  --radius: 0.75rem;               /* 기본 라운딩 */
  --font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', ...;
}

/* 다크 모드 */
.dark {
  --background: 220 15% 13%;
  --foreground: 38 20% 88%;
  --card: 215 12% 17%;
  --border: 215 10% 28%;
  /* ... */
}
```

### cn() 유틸리티 함수

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**사용 예:**

```tsx
<div class={cn(
  'flex items-center',              // 기본 클래스
  isActive && 'bg-primary',         // 조건부 클래스
  className                         // props로 받은 클래스
)} />
```

### Z-Index 계층

| 요소 | z-index | 설명 |
|-----|---------|-----|
| Header | `z-30` | 헤더 |
| Mobile Overlay | `z-40` | 사이드바 뒤 어두운 배경 |
| Mobile Sidebar | `z-50` | 모바일 슬라이드 사이드바 |
| More Menu Popup | `z-50` | 사이드바 내 팝업 메뉴 |

---

## 11. 적용 체크리스트

### 필수 파일

- [ ] `stores/tool-store.ts` - 상태 관리
- [ ] `lib/utils.ts` - cn() 함수
- [ ] `globals.css` - CSS 변수
- [ ] `components/layout/MainLayout.tsx`
- [ ] `components/layout/Header.tsx`
- [ ] `components/layout/Footer.tsx`
- [ ] `components/sidebar/ToolSidebar.tsx`
- [ ] `components/sidebar/ToolCategory.tsx`
- [ ] `components/sidebar/ToolItem.tsx`

### 의존성

```json
{
  "dependencies": {
    "solid-js": "^1.9.x",
    "@solidjs/router": "^0.15.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-solid": "^0.x"
  }
}
```

### CSS 필수 설정

```css
/* Tailwind v4 다크 모드 활성화 */
@variant dark (&:where(.dark, .dark *));

/* 기본 스타일 */
* {
  border-color: hsl(var(--border));
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### 반응형 테스트 항목

- [ ] 768px 이하에서 탭 UI로 전환
- [ ] 모바일 사이드바 슬라이드 애니메이션
- [ ] 모바일 오버레이 클릭시 사이드바 닫힘
- [ ] 데스크탑 사이드바 접기/펼치기 동작
- [ ] Chat 패널 리사이즈 (min/max 범위)
- [ ] 노치 디바이스 Safe Area 적용

---

## 빠른 참조 - 핵심 액션

```typescript
import { toolActions, toolStore } from '@/stores/tool-store';

// 모바일 사이드바 열기/닫기
toolActions.setSidebarOpen(true);   // 열기
toolActions.setSidebarOpen(false);  // 닫기
toolActions.toggleSidebar();        // 토글

// 데스크탑 사이드바 접기/펼치기
toolActions.setSidebarCollapsed(true);   // 접기 (아이콘만)
toolActions.setSidebarCollapsed(false);  // 펼치기 (전체)
toolActions.toggleSidebarCollapse();     // 토글

// 현재 상태 읽기
toolStore.sidebarOpen      // boolean: 모바일 열림 여부
toolStore.sidebarCollapsed // boolean: 데스크탑 접힘 여부
toolStore.currentTool      // ToolType | null: 현재 도구
```
