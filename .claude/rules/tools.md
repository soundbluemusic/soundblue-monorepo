# Tools 앱 개발 규칙

> **적용 대상**: `apps/tools/` 내 모든 도구 개발

## ToolGuide 필수 규칙 (CRITICAL)

**모든 도구는 반드시 사용 안내(ToolGuide)를 포함해야 한다.**

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ⚠️ ToolGuide 필수 - 절대 규칙 ⚠️                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 절대 금지 (NEVER):                                                        ║
║  • 사용 안내 없이 도구 배포                                                    ║
║  • ToolGuide 컴포넌트 미포함                                                  ║
║  • toolGuides.ts에 해당 도구 가이드 미등록                                     ║
║                                                                              ║
║  ✅ 필수 (REQUIRED):                                                         ║
║  • 모든 도구 하단에 ToolGuide 컴포넌트 렌더링                                   ║
║  • toolGuides.ts에 ko/en 양쪽 가이드 등록                                     ║
║  • 3개 섹션 구조 준수 (이 도구는/사용 방법/버튼 설명)                            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## ToolGuide 구조

### 필수 섹션 (3개)

| 섹션 | 한글 | 영어 | 내용 |
|------|------|------|------|
| 1 | 이 도구는 | About this tool | 도구의 목적, 용도 설명 (2줄) |
| 2 | 사용 방법 | How to use | 단계별 사용 지침 (3줄) |
| 3 | 버튼 설명 | Button guide | 각 버튼/기능 설명 (3줄) |

### 코드 예시

```typescript
// apps/tools/app/lib/toolGuides.ts

toolName: {
  ko: {
    title: '사용 안내',
    sections: [
      {
        title: '이 도구는',
        items: [
          '도구의 주요 기능 설명',
          '어떤 상황에서 유용한지',
        ],
      },
      {
        title: '사용 방법',
        items: [
          '1단계: 무엇을 하는지',
          '2단계: 무엇을 하는지',
          '3단계: 무엇을 하는지',
        ],
      },
      {
        title: '버튼 설명',
        items: [
          '버튼1: 기능 설명',
          '버튼2: 기능 설명',
          '버튼3: 기능 설명',
        ],
      },
    ],
  },
  en: {
    title: 'How to Use',
    sections: [
      // ... 영어 버전 (동일 구조)
    ],
  },
},
```

### 컴포넌트 사용

```tsx
// apps/tools/app/tools/[tool-name]/index.tsx

import { ToolGuide } from '~/components/tools/ToolGuide';
import { getToolGuide } from '~/lib/toolGuides';

export function ToolName({ ... }: ToolNameProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const guide = getToolGuide('toolName', currentLocale);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {/* 도구 UI */}

      {/* ToolGuide는 항상 마지막에 배치 */}
      <ToolGuide title={guide.title} sections={guide.sections} />
    </div>
  );
}
```

## 새 도구 추가 체크리스트

새 도구를 추가할 때 반드시 확인:

- [ ] `tools/[tool-name]/types.ts` - 타입 정의
- [ ] `tools/[tool-name]/settings.ts` - 기본 설정 & i18n 텍스트
- [ ] `tools/[tool-name]/index.tsx` - 메인 컴포넌트 (**ToolGuide 포함**)
- [ ] `routes/($locale)/[tool-name].tsx` - 라우트 페이지
- [ ] `stores/tool-store.ts` - 타입 & 설정 추가
- [ ] `lib/toolCategories.ts` - 도구 정보 & lazy loader
- [ ] `lib/toolGuides.ts` - **ko/en 가이드 등록** ⚠️
- [ ] `components/tools/ToolContainer.tsx` - 설정 핸들러
- [ ] `routes.ts` - TOOL_PAGES 배열
- [ ] `react-router.config.ts` - BASE_PATHS 배열

## 레이아웃 트랜지션 규칙 (CRITICAL)

> **사이드바/메인 콘텐츠 애니메이션은 반드시 CSS 클래스 사용**

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║              ⚠️ Tailwind 임의값 대신 CSS 클래스 사용 ⚠️                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 금지 (Tailwind 임의값 - 애니메이션 작동 안 함):                              ║
║  • transition-transform duration-150 ease-[var(--ease-default)]              ║
║  • transition-[margin-left] duration-150                                     ║
║                                                                              ║
║  ✅ 필수 (CSS 클래스 - 안정적 작동):                                            ║
║  • .sidebar-transition (사이드바용)                                           ║
║  • .main-content-transition (메인 콘텐츠용)                                   ║
║                                                                              ║
║  📍 원인:                                                                     ║
║  • Tailwind 임의값이 복잡한 앱에서 CSS 변수와 함께 사용 시 불안정                  ║
║  • 실제 CSS 클래스가 브라우저에서 더 안정적으로 트랜지션 처리                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### CSS 클래스 정의 (app.css)

```css
/* apps/tools/app/app.css */

.sidebar-transition {
  transition: transform var(--transition-fast) var(--ease-default);
}

.main-content-transition {
  transition: margin-left var(--transition-fast) var(--ease-default);
}
```

### 사용 예시

```tsx
// ToolSidebar.tsx - 사이드바
<aside className={`sidebar-transition ... ${collapsed ? '-translate-x-full' : 'translate-x-0'}`}>

// MainLayout.tsx - 메인 콘텐츠
<main className={`main-content-transition ... ${collapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'}`}>
```

### 추가 주의사항

| 항목 | 설명 |
|------|------|
| `hidden` vs `max-md:hidden` | `hidden`은 `display: none`으로 애니메이션 차단. `max-md:hidden` 사용 |
| 헤더 패딩 | 동적 패딩 대신 고정 패딩 사용 (Sound Blue와 동일하게) |

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `lib/toolGuides.ts` | 모든 도구 가이드 데이터 (ko/en) |
| `components/tools/ToolGuide.tsx` | 가이드 렌더링 컴포넌트 |
| `components/tools/ToolContainer.tsx` | 도구 컨테이너 (설정 관리) |
| `lib/toolCategories.ts` | 도구 메타데이터 & 카테고리 |
| `app.css` | 레이아웃 트랜지션 CSS 클래스 |
| `components/sidebar/ToolSidebar.tsx` | 사이드바 컴포넌트 |
| `components/layout/MainLayout.tsx` | 메인 레이아웃 |
| `components/layout/HomeLayout.tsx` | 홈 레이아웃 |

## 관련 규칙

- **SEO 렌더링**: `seo-rendering.md` - SPA 금지, SSG/SSR만 허용
- **품질**: `quality.md` - 코드 품질 규칙
