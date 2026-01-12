# Tools 앱 개발 규칙

> **적용 대상**: `apps/tools/` 내 모든 도구 개발

## ToolGuide 필수 규칙 (CRITICAL)

**모든 도구는 반드시 사용 안내(ToolGuide)를 포함해야 한다.**

```
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

## 관련 파일

| 파일 | 역할 |
|------|------|
| `lib/toolGuides.ts` | 모든 도구 가이드 데이터 (ko/en) |
| `components/tools/ToolGuide.tsx` | 가이드 렌더링 컴포넌트 |
| `components/tools/ToolContainer.tsx` | 도구 컨테이너 (설정 관리) |
| `lib/toolCategories.ts` | 도구 메타데이터 & 카테고리 |
