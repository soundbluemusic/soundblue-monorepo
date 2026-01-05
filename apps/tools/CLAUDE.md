# Tools - Claude Guide

@./README.md
@../../.claude/rules/common.md

## Quick Commands (빠른 명령어)

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm check:fix    # 린트/포맷 자동 수정
pnpm typecheck    # 타입 검사
pnpm test:run     # 테스트 실행
pnpm wasm:build   # WASM 빌드
```

## App-Specific Rules (앱 특화 규칙)

### 새 도구 추가 시 (When Adding New Tool)
1. `src/tools/[name]/index.tsx` 생성 (ToolDefinition 포함)
2. `src/tools/index.ts`에서 import (자동 등록)
3. README.md의 도구 목록 업데이트

### 오디오 관련 (Audio Related)
- AudioContext는 공유 싱글톤 사용 (`@/lib/audio-context`)
- 직접 `new AudioContext()` 금지
- Event Bus로 도구 간 통신 (`@/lib/event-bus`)

### 보호된 파일 (Protected Files)
- `public/` - 빌드 자동 생성
- `public/audio-worklet/*.js` - AudioWorklet 기술적 제약

## 번역기 벤치마크 정책 (Translator Benchmark Policy)

> **단일 소스: `benchmarkTestGroups` (14개 그룹, 1,105개 테스트)**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    벤치마크 단일 소스 정책 (Single Source Policy)                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📁 3개 파일이 완벽하게 동기화되어야 함:                                          ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ 1. benchmark-data.ts      - 테스트 데이터 (benchmarkTestGroups)       │    ║
║  │ 2. benchmark-data.test.ts - vitest 테스트 실행                        │    ║
║  │ 3. benchmark.tsx          - UI 벤치마크 페이지                         │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  ⚠️ 핵심 규칙:                                                               ║
║  • vitest와 UI의 테스트 개수가 완벽히 일치해야 함                                ║
║  • vitest와 UI의 통과 기준이 완벽히 일치해야 함                                  ║
║  • benchmark-data.ts 외의 다른 vitest 테스트 파일 생성 금지                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 통과 기준 (Pass Criteria) - 반드시 동일하게 유지

```typescript
// 영어 정규화 (English Normalization)
const normalizeEnglish = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\b(a|an|the)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// 한국어 정규화 (Korean Normalization)
const normalizeKorean = (text: string): string => {
  return text
    .replace(/은|는|이|가/g, '가')
    .replace(/을|를/g, '를')
    .replace(/\s+/g, ' ')
    .trim();
};

// 비교 로직 (Comparison Logic)
if (test.direction === 'ko-en') {
  passed = normalizeEnglish(actual) === normalizeEnglish(expected);
} else {
  passed = normalizeKorean(actual) === normalizeKorean(expected);
}
```

**상세 문서:** `app/tools/translator/CLAUDE.md`
