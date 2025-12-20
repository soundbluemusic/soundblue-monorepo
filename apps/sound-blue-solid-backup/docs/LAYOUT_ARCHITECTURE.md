# Sound Blue 레이아웃 아키텍처 (완전판)

다른 프로젝트에 그대로 복사해서 사용할 수 있는 완전한 레이아웃 시스템입니다.

---

## 목차

1. [전체 구조 개요](#1-전체-구조-개요)
2. [CSS 변수 정의](#2-css-변수-정의)
3. [App 진입점](#3-app-진입점)
4. [NavigationLayout (메인 래퍼)](#4-navigationlayout-메인-래퍼)
5. [Header 컴포넌트](#5-header-컴포넌트)
6. [Sidebar 컴포넌트 (데스크톱)](#6-sidebar-컴포넌트-데스크톱)
7. [BottomNav 컴포넌트 (모바일)](#7-bottomnav-컴포넌트-모바일)
8. [BottomSheet 컴포넌트](#8-bottomsheet-컴포넌트)
9. [Footer 컴포넌트](#9-footer-컴포넌트)
10. [네비게이션 설정](#10-네비게이션-설정)
11. [글로벌 CSS](#11-글로벌-css)
12. [유틸리티 함수](#12-유틸리티-함수)

---

## 1. 전체 구조 개요

### 시각적 구조도

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            HEADER                                       │
│   [☰ 토글]  [Logo]  [SearchBox ────────]  [spacer]  [Tools] [🌙] [EN]  │
│   height: 56px | z-index: 100 | position: fixed                        │
├────────────────┬────────────────────────────────────────────────────────┤
│                │                                                        │
│   SIDEBAR      │              MAIN CONTENT                              │
│   width: 240px │                                                        │
│   z-index: 200 │   ┌──────────────────────────────────────────────┐    │
│   fixed left   │   │                                              │    │
│                │   │         PAGE CONTENT                         │    │
│  ┌───────────┐ │   │                                              │    │
│  │ 🏠 Home   │ │   │   max-width: 980px                          │    │
│  │ 👤 About  │ │   │   padding: 32px 16px                        │    │
│  │ 📰 News   │ │   │                                              │    │
│  │ 📝 Blog   │ │   └──────────────────────────────────────────────┘    │
│  │ ─────────── │   │                                                        │
│  │ 🔧 Tools  │ │   ┌──────────────────────────────────────────────┐    │
│  └───────────┘ │   │              FOOTER                          │    │
│                │   │   Privacy | Terms | License | Sitemap        │    │
│  토글로        │   │   © 2024 Brand. All rights reserved.         │    │
│  열기/닫기     │   └──────────────────────────────────────────────┘    │
├────────────────┴────────────────────────────────────────────────────────┤
│                         BOTTOM NAV (모바일 only)                        │
│            [🏠 Home] [👤 About] [📰 News] [💬 Chat] [⋮ More]           │
│            height: 56px | z-index: 300 | position: fixed               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 반응형 동작

| 화면 크기 | Sidebar | BottomNav | Main margin-left |
|----------|---------|-----------|------------------|
| < 768px (모바일) | 숨김 | 표시 | 0 |
| ≥ 768px (데스크톱) | 표시 | 숨김 | 240px (열림) / 0 (닫힘) |

---

## 2. CSS 변수 정의

### `src/styles/variables.css` 또는 `:root`에 정의

```css
:root {
  /* ========================================
     레이아웃 치수
     ======================================== */
  --header-height: 56px;
  --header-height-mobile: 52px;
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 72px;
  --bottom-nav-height: 56px;
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
  --content-max-width: 980px;
  --content-wide-width: 1200px;

  /* ========================================
     Z-Index 계층 (중요!)
     ======================================== */
  --z-header: 100;
  --z-sidebar: 200;
  --z-bottom-nav: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;

  /* ========================================
     색상 (라이트 모드)
     ======================================== */
  --color-bg-primary: #F7FAFA;
  --color-bg-secondary: #EFF5F4;
  --color-bg-tertiary: #E5EFEC;
  --color-bg-overlay: rgba(42, 56, 54, 0.4);

  --color-text-primary: #2A3836;
  --color-text-secondary: #4A5E5A;
  --color-text-tertiary: #6B807A;

  --color-border-primary: #D5E0DD;
  --color-border-focus: #4A9E95;

  --color-accent-primary: #4A9E95;
  --color-accent-hover: #3D8880;

  --color-interactive-hover: rgba(74, 158, 149, 0.08);
  --color-interactive-active: rgba(74, 158, 149, 0.15);

  /* ========================================
     트랜지션
     ======================================== */
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ========================================
     그림자
     ======================================== */
  --shadow-sm: 0 1px 3px rgba(42, 70, 65, 0.05);
  --shadow-md: 0 2px 6px rgba(42, 70, 65, 0.05);
  --shadow-lg: 0 4px 12px rgba(42, 70, 65, 0.08);
  --shadow-xl: 0 8px 24px rgba(42, 70, 65, 0.10);

  /* ========================================
     테두리 반경
     ======================================== */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;
}

/* ========================================
   다크 모드
   ======================================== */
[data-theme="dark"] {
  --color-bg-primary: #0F1716;
  --color-bg-secondary: #161F1E;
  --color-bg-tertiary: #1E2928;
  --color-bg-overlay: rgba(0, 0, 0, 0.55);

  --color-text-primary: #E5F0EE;
  --color-text-secondary: #B0C5C2;
  --color-text-tertiary: #8AA5A0;

  --color-border-primary: #2E3E3C;
  --color-border-focus: #6ECEC5;

  --color-accent-primary: #6ECEC5;
  --color-accent-hover: #85D8D0;

  --color-interactive-hover: rgba(110, 206, 197, 0.10);
  --color-interactive-active: rgba(110, 206, 197, 0.18);
}
```

---

## 3. App 진입점

### `src/app.tsx`

```tsx
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { ThemeProvider } from '~/components/providers/ThemeProvider';
import { I18nProvider } from '~/components/providers/I18nProvider';
import './global.css';

export default function App() {
  return (
    <Router
      root={(props) => (
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<PageLoader />}>
              {props.children}
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

function PageLoader() {
  return (
    <div class="page-loader">
      <div class="loader-spinner" />
    </div>
  );
}
```

---

## 4. NavigationLayout (메인 래퍼)

### `src/components/NavigationLayout.tsx`

**핵심 포인트:**
- `createSignal`로 사이드바 열림/닫힘 상태 관리
- 상태를 Header와 Sidebar에 props로 전달
- main 영역의 `margin-left`를 상태에 따라 동적으로 조절

```tsx
import { createSignal, type ParentComponent } from 'solid-js';
import { cn } from '~/lib/utils';
import { Header } from './Header';
import { Sidebar } from './navigation/Sidebar';
import { BottomNav } from './navigation/BottomNav';
import { Footer } from './Footer';

export const NavigationLayout: ParentComponent = (props) => {
  // ⭐ 사이드바 상태 관리 (핵심!)
  const [isSidebarOpen, setSidebarOpen] = createSignal(true);

  return (
    <div class="app-layout">
      {/* 접근성: Skip to content 링크 */}
      <a href="#main-content" class="skip-to-content">
        Skip to main content
      </a>

      {/* 헤더: 토글 함수와 현재 상태 전달 */}
      <Header
        onSidebarToggle={() => setSidebarOpen(!isSidebarOpen())}
        isSidebarOpen={isSidebarOpen()}
      />

      {/* 사이드바: 열림 상태 전달 */}
      <Sidebar isOpen={isSidebarOpen()} />

      {/* 메인 콘텐츠: 사이드바 상태에 따라 margin 조절 */}
      <main
        id="main-content"
        class={cn(
          'main-content',
          'transition-[margin-left] duration-150 ease-[var(--ease-default)]',
          'max-md:ml-0',  // 모바일: 항상 margin 0
          isSidebarOpen() ? 'ml-[var(--sidebar-width)]' : 'ml-0'
        )}
        aria-label="Main content"
      >
        {props.children}
        <Footer />
      </main>

      {/* 하단 네비게이션: 모바일 only */}
      <BottomNav />
    </div>
  );
};
```

---

## 5. Header 컴포넌트

### `src/components/Header.tsx`

**핵심 포인트:**
- `onSidebarToggle` props로 부모에서 상태 변경 함수 받음
- `isSidebarOpen` props로 현재 상태 받아서 아이콘 변경
- 토글 버튼은 데스크톱에서만 표시 (`hidden md:inline-flex`)

```tsx
import { A } from '@solidjs/router';
import type { JSX } from 'solid-js';

interface HeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header(props: HeaderProps): JSX.Element {
  // 기본값 처리
  const isSidebarOpen = () => props.isSidebarOpen ?? true;

  return (
    <header class="fixed top-0 left-0 right-0 z-[100] h-14 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)] supports-[padding:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)] supports-[padding:env(safe-area-inset-top)]:h-[calc(56px+env(safe-area-inset-top))] max-sm:h-13">

      <div class="flex items-center gap-4 w-full h-full px-4 md:pl-[calc(var(--sidebar-width)+16px)] max-sm:px-3 max-sm:gap-2">

        {/* ⭐ 사이드바 토글 버튼 - 데스크톱만 표시 */}
        {props.onSidebarToggle && (
          <button
            type="button"
            onClick={props.onSidebarToggle}
            class="hidden md:inline-flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] active:scale-95 transition-all duration-150"
            title={isSidebarOpen() ? 'Close sidebar' : 'Open sidebar'}
            aria-label={isSidebarOpen() ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={isSidebarOpen()}
          >
            {/* 아이콘: 상태에 따라 다른 아이콘 표시 */}
            <svg
              class="w-[18px] h-[18px] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              {isSidebarOpen() ? (
                <>
                  {/* 사이드바 닫기 아이콘 (화살표 없음) */}
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
                  <path stroke-width="2" d="M9 3v18" />
                </>
              ) : (
                <>
                  {/* 사이드바 열기 아이콘 (화살표 있음) */}
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="2" />
                  <path stroke-width="2" d="M9 3v18" />
                  <path stroke-width="2" stroke-linecap="round" d="M14 9l3 3-3 3" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* 로고 */}
        <A
          href="/"
          class="flex items-center gap-1.5 no-underline shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
        >
          <span class="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight max-sm:text-lg">
            Your Logo
          </span>
        </A>

        {/* 검색창 (선택사항) */}
        {/* <SearchBox /> */}

        {/* Spacer: 나머지 공간 차지 */}
        <div class="flex-1" />

        {/* 오른쪽 컨트롤 버튼들 */}
        <div class="flex items-center gap-2 shrink-0">
          {/* 테마 토글 버튼 */}
          <button
            type="button"
            onClick={() => {/* toggleTheme() */}}
            class="inline-flex items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] active:scale-95 transition-all duration-150 max-sm:w-9 max-sm:h-9"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {/* 테마 아이콘 */}
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" stroke-width="2" />
              <path stroke-width="2" stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>

          {/* 언어 토글 버튼 */}
          <button
            type="button"
            onClick={() => {/* toggleLanguage() */}}
            class="inline-flex items-center justify-center gap-1 w-auto h-10 px-3 bg-transparent rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] active:scale-95 transition-all duration-150 max-sm:h-9 max-sm:px-2"
            title="Switch language"
            aria-label="Switch language"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span class="text-xs font-semibold tracking-wide">EN</span>
          </button>
        </div>
      </div>
    </header>
  );
}
```

---

## 6. Sidebar 컴포넌트 (데스크톱)

### `src/components/navigation/Sidebar.tsx`

**핵심 포인트:**
- `isOpen` props로 열림/닫힘 상태 받음
- `translate-x-0` (열림) vs `-translate-x-full` (닫힘) 으로 슬라이드
- `max-md:hidden`으로 모바일에서 완전히 숨김

```tsx
import { A, useLocation } from '@solidjs/router';
import { For, type JSX } from 'solid-js';
import { NAV_ITEMS, EXTERNAL_NAV_ITEMS, isNavActive } from '~/constants/navigation';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar(props: SidebarProps): JSX.Element {
  const location = useLocation();

  return (
    <aside
      class={`
        fixed top-14 left-0 bottom-0
        w-[var(--sidebar-width)]
        bg-[var(--color-bg-secondary)]
        border-r border-[var(--color-border-primary)]
        overflow-y-auto overflow-x-hidden
        z-[200]
        transition-transform duration-150 ease-[var(--ease-default)]
        max-md:hidden
        ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <nav class="py-4" aria-label="Main navigation">
        <ul class="list-none m-0 p-0">
          {/* 내부 네비게이션 */}
          <For each={NAV_ITEMS}>
            {(item) => {
              const isActive = () => isNavActive(item.path, location.pathname, (p) => p);

              return (
                <li class="mb-1 px-3">
                  <A
                    href={item.path}
                    class={`
                      flex items-center gap-3 py-2.5 px-3
                      rounded-md text-sm font-medium no-underline
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]
                      ${isActive()
                        ? 'bg-[var(--color-accent-primary)]/12 text-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)]'
                      }
                    `}
                  >
                    {/* 아이콘 */}
                    <span class="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                      {item.icon()}
                    </span>
                    {/* 레이블 */}
                    <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  </A>
                </li>
              );
            }}
          </For>

          {/* 구분선 */}
          <li class="my-2 mx-3" aria-hidden="true">
            <div class="h-px bg-[var(--color-border-primary)]" />
          </li>

          {/* 외부 링크 */}
          <For each={EXTERNAL_NAV_ITEMS}>
            {(item) => (
              <li class="mb-1 px-3">
                <a
                  href={item.url}
                  class="flex items-center gap-3 py-2.5 px-3 rounded-md text-[var(--color-text-secondary)] text-sm font-medium no-underline transition-colors duration-150 hover:bg-[var(--color-interactive-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="flex items-center justify-center w-5 h-5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                    {item.icon()}
                  </span>
                  <span class="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </aside>
  );
}
```

---

## 7. BottomNav 컴포넌트 (모바일)

### `src/components/navigation/BottomNav.tsx`

**핵심 포인트:**
- `hidden max-md:block`으로 모바일에서만 표시
- PRIMARY_NAV_ITEMS (4개) 직접 표시
- SECONDARY_NAV_ITEMS는 "More" 버튼 → BottomSheet로 표시
- `createSignal`로 BottomSheet 열림/닫힘 상태 관리

```tsx
import { A, useLocation, useNavigate } from '@solidjs/router';
import { createSignal, For, type JSX } from 'solid-js';
import { BottomSheetClient } from '~/components/ui';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, isNavActive } from '~/constants/navigation';

// More 아이콘 (점 3개)
function MoreIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

export function BottomNav(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  // ⭐ BottomSheet 상태 관리
  const [isMoreOpen, setIsMoreOpen] = createSignal(false);

  // SECONDARY 항목 중 하나가 활성화되었는지 확인
  const isSecondaryActive = (): boolean => {
    return SECONDARY_NAV_ITEMS.some((item) =>
      isNavActive(item.path, location.pathname, (p) => p)
    );
  };

  // BottomSheet 내 항목 클릭 시
  const handleSecondaryClick = (path: string): void => {
    navigate(path);
    setIsMoreOpen(false);  // 시트 닫기
  };

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <nav
        class="hidden max-md:block fixed bottom-0 left-0 right-0 h-14 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-primary)] z-[300] pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <ul class="flex items-center justify-around h-full m-0 p-0 list-none">

          {/* Primary 네비게이션 (4개) */}
          <For each={PRIMARY_NAV_ITEMS}>
            {(item) => {
              const isActive = () => isNavActive(item.path, location.pathname, (p) => p);

              return (
                <li class="flex-1 h-full">
                  <A
                    href={item.path}
                    class={`
                      flex flex-col items-center justify-center gap-1 h-full p-2
                      no-underline transition-all duration-150
                      focus-visible:outline-none focus-visible:bg-[var(--color-interactive-hover)]
                      active:scale-95
                      ${isActive()
                        ? 'text-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }
                    `}
                  >
                    <span class="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                      {item.icon()}
                    </span>
                    <span class="text-[11px] font-medium">{item.label}</span>
                  </A>
                </li>
              );
            }}
          </For>

          {/* More 버튼 */}
          <li class="flex-1 h-full">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              class={`
                flex flex-col items-center justify-center gap-1 w-full h-full p-2
                bg-transparent transition-all duration-150
                focus-visible:outline-none focus-visible:bg-[var(--color-interactive-hover)]
                active:scale-95
                ${isSecondaryActive() || isMoreOpen()
                  ? 'text-[var(--color-accent-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }
              `}
              aria-label="More"
              aria-expanded={isMoreOpen()}
              aria-haspopup="dialog"
            >
              <span class="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                <MoreIcon />
              </span>
              <span class="text-[11px] font-medium">More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* ⭐ BottomSheet: More 메뉴 내용 */}
      <BottomSheetClient
        isOpen={isMoreOpen()}
        onClose={() => setIsMoreOpen(false)}
        title="More"
      >
        <ul class="m-0 p-0 list-none">
          <For each={SECONDARY_NAV_ITEMS}>
            {(item) => {
              const isActive = () => isNavActive(item.path, location.pathname, (p) => p);

              return (
                <li>
                  <button
                    type="button"
                    onClick={() => handleSecondaryClick(item.path)}
                    class={`
                      flex items-center gap-4 w-full p-4
                      bg-transparent rounded-xl
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]
                      active:scale-[0.98]
                      ${isActive()
                        ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)]'
                      }
                    `}
                  >
                    <span class="flex items-center justify-center w-6 h-6 [&>svg]:w-full [&>svg]:h-full">
                      {item.icon()}
                    </span>
                    <span class="text-base font-medium">{item.label}</span>
                  </button>
                </li>
              );
            }}
          </For>
        </ul>
      </BottomSheetClient>
    </>
  );
}
```

---

## 8. BottomSheet 컴포넌트

### `src/components/ui/BottomSheet.tsx`

**핵심 포인트:**
- Portal로 body 끝에 렌더링
- Backdrop 클릭 또는 ESC 키로 닫기
- body 스크롤 잠금
- 슬라이드 업 애니메이션

```tsx
import { createSignal, type ParentProps, Show, onMount, onCleanup } from 'solid-js';
import { Portal } from 'solid-js/web';

interface BottomSheetProps extends ParentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function BottomSheet(props: BottomSheetProps) {
  const [isAnimating, setIsAnimating] = createSignal(false);

  // ESC 키로 닫기
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && props.isOpen) {
      props.onClose();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
  });

  // body 스크롤 잠금
  const updateBodyScroll = (open: boolean): void => {
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const isVisible = () => props.isOpen || isAnimating();

  return (
    <Show when={isVisible()}>
      <Portal>
        {/* 배경 오버레이 */}
        <div
          class={`
            fixed inset-0 z-[400]
            bg-[var(--color-bg-overlay)]
            transition-opacity duration-200
            ${props.isOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={props.onClose}
          onTransitionEnd={() => {
            if (!props.isOpen) setIsAnimating(false);
            updateBodyScroll(props.isOpen);
          }}
          aria-hidden="true"
        />

        {/* 시트 본체 */}
        <div
          class={`
            fixed bottom-0 left-0 right-0 z-[401]
            bg-[var(--color-bg-secondary)]
            rounded-t-2xl shadow-xl
            transition-transform duration-300 ease-out
            pb-[env(safe-area-inset-bottom)]
            ${props.isOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
          onTransitionStart={() => {
            if (props.isOpen) {
              setIsAnimating(true);
              updateBodyScroll(true);
            }
          }}
        >
          {/* 드래그 핸들 */}
          <div class="flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-[var(--color-border-primary)] rounded-full" />
          </div>

          {/* 제목 */}
          <Show when={props.title}>
            <div class="px-4 pb-2">
              <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
                {props.title}
              </h2>
            </div>
          </Show>

          {/* 콘텐츠 */}
          <div class="px-2 pb-4">
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  );
}
```

### SSR-Safe 래퍼 (SSG/SSR 사용 시 필수)

### `src/components/ui/BottomSheet.client.tsx`

```tsx
import { clientOnly } from '@solidjs/start';

export const BottomSheetClient = clientOnly(() => import('./BottomSheet'));
```

---

## 9. Footer 컴포넌트

### `src/components/Footer.tsx`

```tsx
import { A } from '@solidjs/router';
import { For, type JSX } from 'solid-js';

interface FooterLink {
  path: string;
  label: string;
}

const FOOTER_LINKS: FooterLink[] = [
  { path: '/privacy', label: 'Privacy' },
  { path: '/terms', label: 'Terms' },
  { path: '/license', label: 'License' },
  { path: '/sitemap', label: 'Sitemap' },
];

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="flex flex-col items-center justify-center py-8 px-4 mt-auto border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] relative z-10">

      {/* 링크 네비게이션 */}
      <nav class="flex flex-wrap gap-1 justify-center items-center mb-4" aria-label="Footer navigation">
        <For each={FOOTER_LINKS}>
          {(link) => (
            <A
              href={link.path}
              class="inline-flex items-center justify-center text-[var(--color-text-secondary)] no-underline text-sm py-2 px-3 rounded-lg cursor-pointer transition-all duration-150 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] active:scale-95"
            >
              {link.label}
            </A>
          )}
        </For>
      </nav>

      {/* 태그라인 */}
      <p class="text-[var(--color-text-secondary)] text-[13px] text-center mb-2">
        Your tagline here.{' '}
        <A
          href="/built-with"
          class="text-[var(--color-accent-primary)] underline decoration-[var(--color-accent-primary)]/50 underline-offset-2 transition-colors duration-150 hover:text-[var(--color-accent-hover)] hover:decoration-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 rounded"
        >
          Built with...
        </A>
      </p>

      {/* 저작권 */}
      <p class="text-[var(--color-text-tertiary)] text-xs text-center">
        © {currentYear} Your Brand. All rights reserved.
      </p>
    </footer>
  );
}
```

---

## 10. 네비게이션 설정

### `src/constants/navigation.tsx`

```tsx
import type { JSX } from 'solid-js';

// 아이콘 컴포넌트들
function HomeIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function AboutIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
    </svg>
  );
}

function NewsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 7h10M7 12h10M7 17h6" />
    </svg>
  );
}

function ChatIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BlogIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    </svg>
  );
}

function SettingsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ToolsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// 네비게이션 아이템 타입
export interface NavItem {
  path: string;
  label: string;
  icon: () => JSX.Element;
}

export interface ExternalNavItem {
  url: string;
  label: string;
  icon: () => JSX.Element;
}

// ⭐ 전체 네비게이션 아이템 (사이드바용)
export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: () => <HomeIcon /> },
  { path: '/about', label: 'About', icon: () => <AboutIcon /> },
  { path: '/news', label: 'News', icon: () => <NewsIcon /> },
  { path: '/blog', label: 'Blog', icon: () => <BlogIcon /> },
  { path: '/chat', label: 'Chat', icon: () => <ChatIcon /> },
  { path: '/settings', label: 'Settings', icon: () => <SettingsIcon /> },
];

// ⭐ Primary 네비게이션 (하단 바에 직접 표시, 최대 4개 권장)
const PRIMARY_NAV_KEYS = ['/', '/about', '/news', '/chat'];

export const PRIMARY_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter(
  (item) => PRIMARY_NAV_KEYS.includes(item.path)
);

// ⭐ Secondary 네비게이션 (More 버튼 → BottomSheet)
export const SECONDARY_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter(
  (item) => !PRIMARY_NAV_KEYS.includes(item.path)
);

// ⭐ 외부 링크
export const EXTERNAL_NAV_ITEMS: ExternalNavItem[] = [
  { url: 'https://tools.example.com', label: 'Tools', icon: () => <ToolsIcon /> },
];

// 현재 경로 활성화 확인 함수
export function isNavActive(
  path: string,
  pathname: string,
  localizedPath: (p: string) => string
): boolean {
  const localPath = localizedPath(path);
  if (path === '/') {
    return pathname === '/' || pathname === '/ko' || pathname === '/ko/';
  }
  return pathname === localPath || pathname.startsWith(`${localPath}/`);
}
```

---

## 11. 글로벌 CSS

### `src/global.css`

```css
/* Tailwind CSS 또는 기본 스타일 import */
@import './styles/tailwind.css';

/* ========================================
   레이아웃 컴포넌트
   ======================================== */

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: var(--header-height, 56px);
  padding-bottom: 56px;
  min-height: 100vh;
  transition: margin-left var(--transition-normal, 250ms) var(--ease-default, ease);
}

/* 모바일: 사이드바 margin 제거, 하단 네비 padding 추가 */
@media (max-width: 767px) {
  .main-content {
    margin-left: 0 !important;
    padding-bottom: calc(
      var(--bottom-nav-height, 56px) + 56px + env(safe-area-inset-bottom, 0px)
    );
  }
}

/* ========================================
   Skip to Content (접근성)
   ======================================== */

.skip-to-content {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 1rem 2rem;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-md, 8px);
  font-weight: 600;
  text-decoration: none;
  transition: top var(--transition-fast, 150ms) var(--ease-default, ease);
}

.skip-to-content:focus {
  top: 1rem;
}

/* ========================================
   로딩 상태
   ======================================== */

.page-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loader-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========================================
   View Transitions (선택사항)
   ======================================== */

.view-transition-header { view-transition-name: header; }
.view-transition-sidebar { view-transition-name: sidebar; }
.view-transition-content { view-transition-name: content; }

/* 헤더/사이드바는 전환 중 유지 */
::view-transition-old(header),
::view-transition-new(header),
::view-transition-old(sidebar),
::view-transition-new(sidebar) {
  animation: none;
}

/* 콘텐츠 슬라이드 전환 */
::view-transition-old(content) {
  animation: vt-slide-out 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

::view-transition-new(content) {
  animation: vt-slide-in 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes vt-slide-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-16px); }
}

@keyframes vt-slide-in {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 모션 감소 설정 존중 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(content),
  ::view-transition-new(content) {
    animation-duration: 0.01ms !important;
  }
}
```

---

## 12. 유틸리티 함수

### `src/lib/utils.ts`

Tailwind CSS 클래스 병합 유틸리티:

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스 병합
 * 조건부 클래스와 충돌하는 클래스를 올바르게 처리
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**설치 필요:**
```bash
pnpm add clsx tailwind-merge
```

---

## 체크리스트

### 필수 파일

- [ ] `src/app.tsx` - 앱 진입점
- [ ] `src/global.css` - 글로벌 스타일
- [ ] `src/lib/utils.ts` - cn() 유틸리티
- [ ] `src/components/NavigationLayout.tsx` - 메인 래퍼
- [ ] `src/components/Header.tsx` - 헤더
- [ ] `src/components/Footer.tsx` - 푸터
- [ ] `src/components/navigation/Sidebar.tsx` - 사이드바
- [ ] `src/components/navigation/BottomNav.tsx` - 하단 네비
- [ ] `src/components/ui/BottomSheet.tsx` - 바텀 시트
- [ ] `src/constants/navigation.tsx` - 네비게이션 설정

### 핵심 원리

1. **상태 관리**: `NavigationLayout`에서 `createSignal`로 사이드바 상태 관리
2. **Props 전달**: 상태와 토글 함수를 Header, Sidebar에 props로 전달
3. **반응형**: `max-md:hidden` / `hidden max-md:block`으로 데스크톱/모바일 구분
4. **슬라이드 애니메이션**: `translate-x-0` ↔ `-translate-x-full`
5. **마진 조절**: main의 `margin-left`를 사이드바 상태에 따라 동적 변경
6. **Z-Index 계층**: Header(100) < Sidebar(200) < BottomNav(300) < Modal(400+)

---

## 사용 예시

### 페이지 컴포넌트

```tsx
// src/routes/index.tsx
import { NavigationLayout } from '~/components/NavigationLayout';

export default function HomePage() {
  return (
    <NavigationLayout>
      <div class="px-4 py-8 max-w-[var(--content-max-width)] mx-auto">
        <h1 class="text-3xl font-bold mb-4">Welcome</h1>
        <p>Your content here...</p>
      </div>
    </NavigationLayout>
  );
}
```
