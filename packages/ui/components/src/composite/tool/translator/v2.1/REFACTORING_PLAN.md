# v2.1 리팩토링 계획서

> 영→한 로직을 안전하게 분리하기 위한 단계별 계획

---

## 현재 상태 분석

| 파일 | 라인 수 | 역할 |
|------|---------|------|
| index.ts | 5,744줄 | 라우팅 + 영→한 로직 혼합 |
| generator.ts | 10,563줄 | 한→영 전용 |
| tokenizer.ts | 4,012줄 | 양방향 토크나이저 |
| data.ts | 1,833줄 | 사전/매핑 데이터 |
| clause-parser.ts | 586줄 | 절 분리 |
| validator.ts | 342줄 | 검증 |
| types.ts | 439줄 | 타입 정의 |

**문제:** index.ts에 영→한 함수 50+개가 혼재, 순환 의존성 존재

---

## 리팩토링 원칙

1. **테스트 먼저** - 각 단계 후 `pnpm --filter tools test` 통과 필수
2. **한 번에 하나** - 함수 그룹 단위로 이동
3. **import 먼저** - 이동 전에 re-export로 경로 유지
4. **롤백 가능** - 커밋 단위로 진행

---

## 단계별 계획

### Phase 1: 데이터 분리 (안전도: ★★★★★)

**목표:** index.ts 내 지역 상수들을 data.ts로 이동

**대상 (index.ts에서 추출):**
```typescript
// 라인 2350~2575 부근
const EN_ADJECTIVES: Record<string, string> = { ... };  // ~50줄
const EN_NOUNS: Record<string, string> = { ... };       // ~70줄
const EN_VERBS: Record<string, string> = { ... };       // ~55줄
const KO_VERBS: Record<string, string> = { ... };       // ~50줄
const KO_NOUNS: Record<string, string> = { ... };       // ~50줄
```

**작업:**
1. data.ts에 위 상수들 추가 (export)
2. index.ts에서 import로 교체
3. 테스트 실행

**예상 효과:** index.ts -275줄

---

### Phase 2: 유틸리티 분리 (안전도: ★★★★☆)

**목표:** 한글 조작 유틸리티를 별도 파일로

**대상 (index.ts에서 추출):**
```typescript
// 라인 700~820, 4060~4250 부근
function removeKoDa(ko: string): string { ... }
function attachKoNieun(stem: string): string { ... }
function attachKoRieul(stem: string): string { ... }
function attachKoPast(stem: string): string { ... }
function removeKoreanFinal(char: string): string { ... }
function addKoreanRieul(char: string): string { ... }
function addKoreanNieun(char: string): string { ... }
function hasRieulBatchim(word: string): boolean { ... }
function removeRieulBatchim(word: string): string { ... }
function hasNieunBatchim(word: string): boolean { ... }
function removeNieunBatchim(word: string): string { ... }
function attachKoreanPastParticiple(stem: string): string { ... }
function attachAoEo(stem: string): string { ... }
function attachKoreanRieul(stem: string): string { ... }
function attachNda(stem: string): string { ... }
```

**새 파일:** `korean-utils.ts`

**작업:**
1. korean-utils.ts 생성, 함수 복사
2. index.ts에서 import로 교체
3. 테스트 실행

**예상 효과:** index.ts -200줄

---

### Phase 3: 영어 유틸리티 분리 (안전도: ★★★★☆)

**목표:** 영어 조작 유틸리티를 별도 파일로

**대상 (index.ts에서 추출):**
```typescript
// 라인 32~150, 2050~2210 부근
function toPhrasePastTense(phrase: string): string { ... }
function isPastTense(phrase: string): boolean { ... }
function addSubjectIfNeeded(phrase: string): string { ... }
function toGerund(verb: string): string { ... }
function toInfinitive(verb: string): string { ... }
function toThirdPersonSingular(verb: string): string { ... }
function toPastParticiple(verb: string): string { ... }
function toPastTense(verb: string): string { ... }
function ppToBase(pp: string): string { ... }
```

**새 파일:** `english-utils.ts`

**작업:**
1. english-utils.ts 생성, 함수 복사
2. index.ts에서 import로 교체
3. 테스트 실행

**예상 효과:** index.ts -250줄

---

### Phase 4: 조건문 생성기 분리 (안전도: ★★★☆☆)

**목표:** g6 조건문 관련 함수를 별도 파일로

**대상 (index.ts에서 추출):**
```typescript
// 라인 588~1015 부근
function generateConditionalKorean(parsed, formality): string { ... }
function generateType1ConditionKorean(parts): string { ... }
function generateType2ConditionKorean(parts): string { ... }
function parseEnglishConditionClause(clause): EnglishClauseParts { ... }
function getKoreanSubject(en: string): string { ... }
function parseEnglishResultClause(clause, condType): EnglishClauseParts { ... }
interface EnglishClauseParts { ... }
```

**새 파일:** `en-to-ko/conditionals.ts`

**작업:**
1. en-to-ko/ 폴더 생성
2. conditionals.ts 생성, 함수 복사
3. index.ts에서 import로 교체
4. 테스트 실행

**예상 효과:** index.ts -430줄

---

### Phase 5: 명사절/관계절 생성기 분리 (안전도: ★★★☆☆)

**목표:** g8, g9 관련 함수를 별도 파일로

**대상:**
```typescript
// 라인 1030~1380 부근 (g8 명사절)
function generateNounClauseKorean(parsed, formality): string { ... }
function parseEnglishNounClauseContent(content): ... { ... }
function getEnglishToKoreanSubject(subject): string { ... }
function getEnglishToKoreanAdjective(adj): string { ... }
function getEnglishToKoreanVerb(verb): string { ... }
function getKoreanWhWord(whWord): string { ... }

// 라인 1219~1520 부근 (g9 관계절)
function generateRelativeClauseKorean(parsed): string { ... }
function translateAntecedentToKorean(en): string { ... }
function getEnglishToKoreanSubjectRel(en): string { ... }
function getEnglishToKoreanObject(en): string { ... }
function translateVerbToKorean(verb, tense): string { ... }
```

**새 파일:** `en-to-ko/clauses.ts`

**예상 효과:** index.ts -500줄

---

### Phase 6: 특수 패턴 분리 (안전도: ★★☆☆☆)

**목표:** handleSpecialEnglishPatterns를 별도 파일로

**대상:**
```typescript
// 라인 4245~5744 부근 (파일 끝까지)
function handleSpecialEnglishPatterns(text): string | null { ... }
// 내부에 수십 개의 패턴 매칭 로직
```

**새 파일:** `en-to-ko/special-patterns.ts`

**주의:** 이 함수가 가장 크고 복잡함 (~1500줄)

**예상 효과:** index.ts -1500줄

---

### Phase 7: 메인 번역 함수 분리 (안전도: ★★☆☆☆)

**목표:** translateEnglishSentence를 en-to-ko/index.ts로

**대상:**
```typescript
// 라인 507~583 부근
function translateEnglishSentence(sentence, formality): string { ... }
```

**새 파일:** `en-to-ko/index.ts`

**작업:**
1. Phase 4-6에서 분리한 함수들 import
2. translateEnglishSentence 이동
3. 기존 index.ts에서 re-export

---

### Phase 8: 최종 정리 (안전도: ★★★★★)

**목표:** index.ts를 라우팅 전용으로

**최종 구조:**
```
v2.1/
├── index.ts (~500줄) ← 라우팅만
├── generator.ts (한→영, 기존 유지)
├── en-to-ko/
│   ├── index.ts (translateEnglishSentence)
│   ├── conditionals.ts (g6)
│   ├── clauses.ts (g8, g9)
│   └── special-patterns.ts (g7, g10, g13 등)
├── shared/
│   ├── korean-utils.ts
│   ├── english-utils.ts
│   └── data.ts (확장)
├── tokenizer.ts
├── clause-parser.ts
├── validator.ts
└── types.ts
```

---

## 실행 순서 (권장)

| 순서 | Phase | 예상 시간 | 위험도 |
|------|-------|----------|--------|
| 1 | Phase 1 (데이터) | 15분 | 낮음 |
| 2 | Phase 2 (한글 유틸) | 20분 | 낮음 |
| 3 | Phase 3 (영어 유틸) | 20분 | 낮음 |
| 4 | Phase 4 (조건문) | 30분 | 중간 |
| 5 | Phase 5 (절) | 30분 | 중간 |
| 6 | Phase 6 (특수패턴) | 45분 | 높음 |
| 7 | Phase 7 (메인함수) | 30분 | 중간 |
| 8 | Phase 8 (정리) | 15분 | 낮음 |

**총 예상 시간:** 3-4시간

---

## 롤백 전략

각 Phase 완료 후:
1. `pnpm --filter tools test` 실행
2. 통과하면 커밋
3. 실패하면 `git checkout -- .` 후 재시도

---

## 다음 단계

Phase 1부터 시작하시겠습니까?
