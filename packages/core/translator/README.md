# @soundblue/translator

> **v2 Core Translation Engine** - 순수 번역 로직 패키지
>
> ⚠️ UI/앱 레벨 번역기는 `packages/ui/components/src/composite/tool/translator/` 참조

## 패키지 역할

| 구분 | 이 패키지 (core/translator) | UI translator (ui/translator) |
|------|---------------------------|------------------------------|
| 버전 | v2 | v2.1 |
| 역할 | 핵심 번역 엔진 & 알고리즘 | UI 통합 & 확장 기능 |
| 의존성 | 없음 (순수 로직) | core/translator 사용 |
| 사용처 | 라이브러리, 서버사이드 | Tools 앱 번역기 도구 |

## 구조

```
src/
├── analysis/              # 텍스트 분석
│   ├── context/          # 문맥 분석기
│   ├── morpheme/         # 형태소 분석 (한글 자모)
│   └── syntax/           # 구문 분석 (파서, 생성기, 검증기)
│
├── correction/           # 오류 교정
│   ├── typo-corrector.ts # 오타 교정
│   ├── spacing-*.ts      # 띄어쓰기 교정
│   └── jamo-edit-distance.ts # 자모 편집 거리
│
├── dictionary/           # 사전 데이터
│   ├── entries/          # 단어/문장/어간 사전
│   ├── exceptions/       # 예외 처리 (관용어, 불규칙)
│   └── morphology/       # 형태소 데이터 (조사, 어미)
│
├── engine/               # 번역 엔진
│   ├── ko-to-en.ts       # 한→영 번역
│   ├── en-to-ko.ts       # 영→한 번역
│   ├── trie/             # Trie 자료구조 (접두사/접미사)
│   ├── cache/            # LRU 캐시
│   └── loader/           # 청크 로딩
│
├── nlp/                  # 자연어 처리
│   ├── collocation/      # 연어 사전
│   ├── topic/            # 주제 감지
│   └── wsd/              # 단어 의미 중의성 해소
│
└── types.ts              # 타입 정의
```

## 사용법

```typescript
import { translate, TranslationDirection } from '@soundblue/translator';

// 한→영 번역
const result = translate('안녕하세요', TranslationDirection.KO_TO_EN);

// 영→한 번역
const result = translate('Hello', TranslationDirection.EN_TO_KO);
```

## 핵심 원칙

### 1. 알고리즘 기반 일반화
```
❌ 특정 문장 하드코딩
❌ 테스트 통과용 조건문
✅ 일반화된 문법 패턴
✅ 언어학적 규칙
```

### 2. 사전 정책 (삭제 금지)
```
❌ 기존 단어 매핑 삭제
✅ 동의어 추가 (배열)
✅ 문맥별 변형 추가
```

### 3. 레이어 규칙
```
core/translator → 브라우저 API 사용 금지
               → 외부 패키지 의존성 최소화
               → React/UI 코드 금지
```

## 테스트

```bash
pnpm test           # 단위 테스트
pnpm typecheck      # 타입 체크
```

## 관련 문서

- [번역기 개발 규칙](/.claude/rules/translator.md)
- [품질 규칙](/.claude/rules/quality.md)
- [아키텍처](docs/ARCHITECTURE.md#language-tools-dictionary-policy)

## v2 vs v2.1 차이점

| 기능 | v2 (여기) | v2.1 (ui/translator) |
|------|----------|---------------------|
| 도메인 사전 | 기본 | 확장 (의료, IT, 스포츠 등) |
| 벤치마크 | 단위 테스트 | UI 통합 벤치마크 |
| 외부 사전 동기화 | ❌ | ✅ (Context 앱) |
| 토크나이저 | 기본 | 확장 (v3) |
| 생성기 | 기본 | 확장 (~10K 줄) |
