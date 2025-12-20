# Dialogue - Claude Guide

@./README.md
@../../.claude/rules/common.md

## Quick Commands (빠른 명령어)

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드 (SSG)
pnpm preview      # 빌드 후 미리보기
pnpm check:fix    # 린트/포맷 자동 수정
pnpm typecheck    # 타입 검사
pnpm test:run     # 테스트 실행
```

## App-Specific Rules (앱 특화 규칙)

### 오프라인 우선 (Offline First)
- 100% 정적 사이트 (SSG)
- 서버 사이드 로직 없음
- PWA로 오프라인 동작

### 다국어 URL 구조 (i18n URL Structure)
| URL | Language |
|-----|----------|
| `/` | English (default) |
| `/ko` | Korean (한국어) |

### 지식 추가 (Adding Knowledge)
`src/data/knowledge.ts` 수정:
```typescript
{
  id: "unique-id",
  keywords: ["keyword1", "keyword2"],
  question: "Question text",
  answer: "Answer text",
  category: "category-name",
  locale: "ko" // or "en", "all"
}
```

### 경로 별칭 (Path Alias)
- `~/` → `./src/`

### Shared Package
- `@soundblue/shared` 사용 (workspace dependency)
