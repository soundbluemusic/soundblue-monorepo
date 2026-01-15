# Translator UI Component (v2.1)

> **Tools 앱 번역기 도구** - UI 통합 번역 컴포넌트
>
> 핵심 엔진: `packages/core/translator` (v2)

## 패키지 관계

```
┌─────────────────────────────────────────────────────────────┐
│  apps/tools/app/tools/translator/                           │
│  └── Translator.tsx (도구 페이지)                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ import
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  packages/ui/components/src/composite/tool/translator/      │  ← 여기
│  ├── v2.1/ (확장 번역 로직)                                  │
│  ├── context/ (문맥 분석 확장)                               │
│  ├── dictionary/ (도메인 사전 확장)                          │
│  └── benchmark-tests/ (벤치마크)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ import
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  packages/core/translator/                                  │
│  └── 핵심 번역 엔진 (v2)                                     │
└─────────────────────────────────────────────────────────────┘
```

## 구조

```
translator/
├── v2.1/                    # 확장 번역 엔진
│   ├── generator.ts         # 영어 생성기 (~10K 줄) ⚠️ 분할 필요
│   ├── tokenizer.ts         # 토크나이저 (~4K 줄) ⚠️ 분할 고려
│   └── index.ts
│
├── context/                 # 문맥 분석 확장
│   ├── context-analyzer.ts  # 통합 문맥 분석
│   ├── polysemy-resolver.ts # 다의어 해결
│   ├── domain-voter.ts      # 도메인 투표
│   └── clause-splitter.ts   # 절 분리
│
├── dictionary/              # 사전 데이터
│   ├── domains/            # 도메인별 어휘
│   │   ├── technology/     # IT/개발 용어
│   │   ├── medical.ts      # 의료 용어
│   │   ├── body/           # 신체 부위/계통
│   │   └── ...
│   ├── external/           # 외부 사전 (자동 동기화)
│   │   ├── words.ts        # Context 앱 단어
│   │   └── sentences.ts    # Context 앱 문장
│   ├── generated/          # 자동 생성 (prebuild)
│   │   ├── ko-to-en.ts     # JSON에서 생성
│   │   └── stems.ts
│   └── declension/         # 격변화 (대명사, 조사)
│
├── benchmark-tests/         # 벤치마크 테스트
│   ├── level-tests.ts      # 레벨별 테스트
│   ├── polysemy-tests.ts   # 다의어 테스트
│   └── ...
│
└── benchmark-data.ts        # 벤치마크 데이터 (Single Source)
```

## v2.1 vs v2 (core) 차이점

| 기능 | v2 (core/translator) | v2.1 (여기) |
|------|---------------------|-------------|
| **역할** | 핵심 엔진 | UI 통합 + 확장 |
| **도메인 사전** | 기본 | 확장 (의료, IT, 법률 등) |
| **외부 사전** | ❌ | ✅ Context 앱 동기화 |
| **벤치마크** | 단위 테스트 | UI 통합 벤치마크 |
| **토크나이저** | 기본 | v3 확장 (~4K 줄) |
| **생성기** | 기본 | 확장 (~10K 줄) |

## 외부 사전 동기화

```bash
# Context 앱(public-monorepo)에서 어휘 동기화
pnpm sync:context-dict

# 결과: dictionary/external/ 폴더 자동 생성
```

**⚠️ `external/` 폴더는 자동 생성됩니다. 직접 수정 금지!**

## 자동 생성 파일

```bash
# JSON → TypeScript 변환 (prebuild)
pnpm prebuild

# 결과: dictionary/generated/ 폴더 자동 생성
```

**⚠️ `generated/` 폴더는 자동 생성됩니다. 직접 수정 금지!**

## TODO: 리팩토링 필요

### generator.ts (~10K 줄)
```
제안 구조:
generator/
├── index.ts              # 메인 진입점
├── hangul-utils.ts       # 한글 자모 처리
├── verb-conjugation.ts   # 동사 활용
├── sentence-templates.ts # 문장 템플릿
├── word-order.ts         # 어순 변환
├── articles.ts           # 관사 규칙
└── particles.ts          # 조사 매핑
```

### tokenizer.ts (~4K 줄)
```
제안 구조:
tokenizer/
├── index.ts              # 메인 토크나이저
├── korean.ts             # 한국어 형태소
├── english.ts            # 영어 토큰화
└── particles.ts          # 조사/어미 처리
```

## 벤치마크 테스트

```bash
# vitest로 벤치마크 실행
pnpm test

# 결과: 모든 레벨/카테고리별 통과율 확인
```

**벤치마크 데이터 단일 소스**: `benchmark-data.ts`
- vitest 결과 = UI 벤치마크 결과 (100% 동일)

## 관련 문서

- [번역기 개발 규칙](/.claude/rules/translator.md)
- [데이터/로직 분리](docs/ARCHITECTURE.md#datalogic-separation-architecture)
- [외부 사전 동기화](docs/ARCHITECTURE.md#external-dictionary-sync)
