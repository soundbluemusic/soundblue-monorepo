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
