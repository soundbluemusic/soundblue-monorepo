# Sound Blue - Claude Guide

@./README.md
@../../.claude/rules/common.md

## Quick Commands (빠른 명령어)

```bash
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm check:fix        # 린트/포맷 자동 수정
pnpm typecheck        # 타입 검사
pnpm test:run         # 유닛 테스트
pnpm test:e2e         # E2E 테스트
pnpm pages:deploy     # Cloudflare Pages 배포
```

## App-Specific Rules (앱 특화 규칙)

### 다국어 페이지 패턴 (i18n Page Pattern)
영어 페이지 작성 → 한국어 페이지에서 재내보내기:
```tsx
// src/routes/ko/privacy.tsx
export { default } from '../privacy';
```

### 레이아웃 필수 (Required Layout)
모든 페이지는 NavigationLayout으로 감싸기:
```tsx
import { NavigationLayout } from '~/components';
export default function Page() {
  return <NavigationLayout>{/* content */}</NavigationLayout>;
}
```

### 클라이언트 전용 컴포넌트 (Client-Only)
브라우저 API 사용 시 React lazy + Suspense 사용:
```tsx
import { lazy, Suspense } from 'react';
const MyClient = lazy(() => import('./MyComponent'));
// 사용: <Suspense fallback={<Loading />}><MyClient /></Suspense>
```

### i18n 사용 (Using i18n)
```tsx
import { useLanguage } from '~/components/providers';
const { t, isKorean, localizedPath } = useLanguage();
```

### 보호된 파일 (Protected Files)
- `public/` - 빌드 자동 생성

### 자동 생성 파일 (Auto-generated)
- sitemap_index.xml, sitemap-pages.xml, robots.txt - 빌드 시 생성
