# 기여 가이드

Tools 프로젝트에 기여해 주셔서 감사합니다!

## 아키텍처

**100% 정적 사이트 생성 (SSG)** - 백엔드 서버 없음.

- **React Router v7 SSG 모드** - 빌드 시 모든 페이지 사전 렌더링
- **Cloudflare Pages에 정적 파일로 배포**
- **초기 로드 후 클라이언트 사이드 라우팅** (SPA 네비게이션)
- **API 엔드포인트 없음, 데이터베이스 없음**
- **SEO 최적화** - 빌드 시 HTML에 메타 태그와 콘텐츠 포함

## 기여 방법

### 이슈 리포트

버그를 발견하셨거나 새 기능을 제안하고 싶으시다면:

1. [GitHub Issues](https://github.com/soundbluemusic/tools/issues)에서 기존 이슈 확인
2. 중복이 없다면 새 이슈 생성
3. 이슈 템플릿에 맞춰 상세히 작성

### Pull Request

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 개발 환경

### 요구사항

- **Node.js:** >=20.0.0
- **Package Manager:** pnpm
- **Rust:** wasm-pack (WASM 빌드용)

### 설치

```bash
pnpm install
```

### 개발 서버

```bash
pnpm dev
```

## 개발 가이드라인

### 코드 스타일

- **TypeScript**: 엄격 모드 사용
- **React**: `useState`, `useEffect`, Zustand stores 사용 (SolidJS 패턴 사용 금지)
- **Tailwind CSS**: `className` 속성 사용
- **Biome**: 린트 + 포맷팅 통합 도구

PR 전 반드시 실행:

```bash
pnpm check:fix
pnpm typecheck
pnpm test:run
```

### 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 규칙 준수:

| 타입       | 설명                      |
| :--------- | :------------------------ |
| `feat`     | 새 기능                   |
| `fix`      | 버그 수정                 |
| `docs`     | 문서 변경                 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `perf`     | 성능 개선                 |
| `test`     | 테스트 추가/수정          |
| `chore`    | 빌드/설정 변경            |

**예시:**

```
feat: Add metronome tap tempo feature
fix: Resolve audio timing issue in drum machine
docs: Update installation instructions
```

### 테스트

```bash
# 유닛 테스트
pnpm test:run

# 테스트 (watch 모드)
pnpm test

# 커버리지
pnpm test:coverage

# E2E 테스트 (Playwright)
pnpm test:e2e

# E2E 테스트 (UI 모드)
pnpm test:e2e:ui
```

## 새 도구 추가하기

### 1. 도구 정의 생성

`app/tools/[tool-name]/index.tsx`:

```typescript
import type { FC } from 'react';
import type { ToolDefinition, ToolProps } from '../types';
import { registerTool } from '../registry';

export interface MyToolSettings {
  value: number;
  [key: string]: unknown;
}

const MyToolComponent: FC<ToolProps<MyToolSettings>> = ({ settings }) => {
  return <div className="p-4">My Tool - Value: {settings.value}</div>;
};

export const myTool: ToolDefinition<MyToolSettings> = {
  meta: {
    id: 'my-tool',
    name: { ko: '내 도구', en: 'My Tool' },
    description: { ko: '설명', en: 'Description' },
    icon: '🔧',
    category: 'utility',
    defaultSize: 'md',
  },
  defaultSettings: { value: 0 },
  component: MyToolComponent,
};

registerTool(myTool);
```

### 2. 도구 내보내기

`app/tools/index.ts`에 추가:

```typescript
export * from './my-tool';
```

### 3. 번역 추가

`project.inlang/messages/ko.json` 및 `project.inlang/messages/en.json`에 번역 추가.

## Rust WASM 개발

오디오 DSP 등 계산 집약적 작업에 Rust WASM을 활용합니다.

### WASM 모듈 빌드

```bash
pnpm wasm:build
```

### 새 WASM 함수 추가

1. `rust/src/lib.rs`에 함수 구현:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn my_function(data: &[f32]) -> Vec<f32> {
    // Rust 구현
    data.to_vec()
}
```

2. `src/engine/wasm/`에 TypeScript 래퍼 추가

3. JS 폴백 구현 (WASM 미지원 환경용)

### 주의사항

- 빌드된 WASM 파일은 `src/engine/wasm/pkg/`에 생성
- 모든 WASM 함수에 JS 폴백 필수
- 메모리 관리 주의

## AudioWorklet 개발

오디오 처리는 AudioWorklet을 사용하여 별도 스레드에서 실행됩니다.

### 프로세서 추가

`public/audio-worklet/dsp-processor.js`에 새 프로세서 클래스 추가:

```javascript
class MyProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // 오디오 처리 로직
    return true;
  }
}

registerProcessor('my-processor', MyProcessor);
```

### SharedArrayBuffer 사용

`Cross-Origin-Embedder-Policy: require-corp` 헤더가 설정되어 있어 SharedArrayBuffer 사용 가능.

## 의존성 업데이트 시 문서 동기화

`package.json`의 의존성을 업데이트할 때 아래 파일들도 함께 수정해야 합니다:

### 체크리스트

| 변경 항목 | 수정 파일 |
|-----------|-----------|
| Node.js 버전 (`engines.node`) | `README.md`, `CONTRIBUTING.md` |
| 주요 프레임워크 버전 (React, React Router 등) | `README.md`, `CLAUDE.md` |
| 새 의존성 추가 | `README.md` (Tech Stack), `CLAUDE.md` (Tech Stack) |
| 라우트 추가/삭제 | `README.md`, `CLAUDE.md` (Directory Structure) |
| 새 도구 추가 | `README.md` (Key Features), `CHANGELOG.md` |

### 권장 워크플로우

1. `package.json` 수정
2. `pnpm install` 실행
3. 위 체크리스트에 따라 문서 업데이트
4. `pnpm check:fix` 실행
5. `pnpm-lock.yaml`과 문서를 함께 커밋

## 라이선스

이 프로젝트는 비공개 저장소입니다.

## 행동 강령

- 존중과 배려로 소통합니다
- 건설적인 피드백을 제공합니다
- 다양성을 존중합니다

자세한 내용은 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)를 참조하세요.
