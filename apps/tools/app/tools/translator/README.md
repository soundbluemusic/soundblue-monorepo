# Translator (번역기)

**Korean ↔ English Bidirectional Translation Engine**
**(한영 양방향 번역 엔진)**

---

## Core Principle (핵심 원칙)

> **Rule-based Generalization (규칙 기반 일반화)**
>
> 각 Level의 **문법 규칙을 알고리즘으로 구현**하여,
> 해당 난이도의 **어떤 문장이든 번역 가능**하게 만드는 것

### What This Means (의미)

```
Level = 난이도 수준 (특정 테스트 문장이 아님)

예시: Level 1 의문문 규칙
  규칙: "Did + S + V + O?" → "S는 O를 V했니?"

적용 가능한 모든 문장:
  - Did you eat breakfast?    → 너는 아침을 먹었니?
  - Did she read the book?    → 그녀는 책을 읽었니?
  - Did they visit Seoul?     → 그들은 서울을 방문했니?
  - Did he buy a car?         → 그는 차를 샀니?
  - (... 무한히 많은 문장들)

테스트 문장 = 규칙이 제대로 동작하는지 확인하는 샘플
```

### Key Distinction (핵심 구분)

| ❌ 잘못된 방식 | ✅ 올바른 방식 |
|--------------|---------------|
| 테스트 문장 하드코딩 | 문법 패턴 알고리즘 |
| `/^Did you go to the museum/` | `Did + S + V + O?` 구조 인식 |
| 해당 문장만 통과 | 모든 동일 패턴 문장 통과 |
| 사전 기반 | 규칙 기반 |

### Why This Matters (중요한 이유)

1. **확장성**: 새 단어만 추가하면 무한한 문장 처리 가능
2. **유지보수성**: 패턴 규칙 하나 수정으로 모든 관련 문장 개선
3. **검증 가능성**: 테스트 문장 외의 문장으로도 검증 가능

---

## Absolute Rules (절대 규칙)

> **100% Algorithm-Based Testing**
> **(100% 알고리즘 기반 테스트)**

All translation tests must pass through **algorithm and logic improvements only**.
(모든 번역 테스트는 **알고리즘과 로직 개선만으로** 통과해야 합니다.)

### 🎯 하드코딩 정책 (Hardcoding Policy)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║              하드코딩은 좋은 로직 설계일 경우에만 허용                             ║
║              (Hardcoding allowed ONLY with excellent logic design)            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ✅ 허용되는 하드코딩 (Good Logic Design):                                    ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ • 일반화된 문법 패턴                                                   │    ║
║  │   예: "Did + S + V + O?" → 모든 의문문 처리                            │    ║
║  │   예: "-지 않았어" 패턴 → 모든 부정문 처리                               │    ║
║  │                                                                      │    ║
║  │ • 언어학적 규칙                                                       │    ║
║  │   예: 받침 유무 → 조사 선택 (을/를, 은/는)                              │    ║
║  │   예: 모음조화 → 어미 선택 (아/어)                                      │    ║
║  │                                                                      │    ║
║  │ • 재사용 가능한 구조 패턴                                              │    ║
║  │   예: SVO → SOV 어순 변환 알고리즘                                     │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  ❌ 금지되는 하드코딩 (Bad Logic Design):                                     ║
║  ┌──────────────────────────────────────────────────────────────────────┐    ║
║  │ • 특정 테스트 문장만 매칭하는 정규식                                     │    ║
║  │   예: /^Did you go to the museum yesterday/                          │    ║
║  │                                                                      │    ║
║  │ • 테스트 문장을 사전에 직접 추가                                        │    ║
║  │   예: sentences['I visited the museum'] = '...'                      │    ║
║  │                                                                      │    ║
║  │ • 특정 문장만 처리하는 마커 패턴                                        │    ║
║  │   예: if (text.includes('SPECIFIC_SENTENCE')) return '...';          │    ║
║  └──────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║  판단 기준: 비슷한 다른 문장도 통과하는가?                                       ║
║  → Yes면 좋은 로직 (허용), No면 나쁜 로직 (금지)                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Prohibited (금지 사항)

| File | What NOT to do (하지 말 것) |
|------|---------------------------|
| `dictionary/i18n-sentences.ts` | Adding test sentences (테스트 문장 추가 금지) |
| `dictionary/idioms.ts` | Adding regular sentences as idioms (일반 문장을 관용어로 추가 금지) |
| `dictionary/cultural-expressions.ts` | Adding test sentences (테스트 문장 추가 금지) |
| `translator-service.ts` | Regex patterns for specific test sentences (특정 테스트 문장 정규식 패턴) |
| `core/en-to-ko.ts` | MARKER patterns, hardcoded sentence handling (마커 패턴, 하드코딩 문장 처리) |
| `core/ko-to-en.ts` | MARKER patterns, hardcoded sentence handling (마커 패턴, 하드코딩 문장 처리) |

### Allowed (허용 사항)

| File | What you CAN do (허용되는 작업) |
|------|------------------------------|
| `dictionary/words.ts` | Individual word pairs (개별 단어 쌍 추가) |
| `grammar/morpheme-analyzer.ts` | Morpheme patterns, verb conjugation rules (형태소 패턴, 동사 활용 규칙) |
| `grammar/sentence-parser.ts` | Sentence structure parsing logic (문장 구조 파싱 로직) |
| `grammar/english-generator.ts` | English generation rules (영어 생성 규칙) |
| `core/en-to-ko.ts` | En→Ko translation algorithm (영한 번역 알고리즘) |
| `core/ko-to-en.ts` | Ko→En translation algorithm (한영 번역 알고리즘) |
| `nlp/wsd/` | Word sense disambiguation (다의어 처리) |

---

## Architecture (아키텍처)

```
translator/
├── __tests__/           # Test files (테스트 파일)
│   ├── level1.test.ts   # Level 1: Basic sentences (기본 문장)
│   ├── level2.test.ts   # Level 2: Complex sentences (복합 문장)
│   └── ...
│
├── core/                # Core translation engines (핵심 번역 엔진)
│   ├── en-to-ko.ts      # English → Korean (SVO→SOV 변환)
│   └── ko-to-en.ts      # Korean → English (SOV→SVO 변환)
│
├── grammar/             # Grammar processing (문법 처리)
│   ├── morpheme-analyzer.ts  # 형태소 분석 (어간/어미/조사 분리)
│   ├── sentence-parser.ts    # 문장 구조 파싱 (주어/목적어/서술어)
│   └── english-generator.ts  # 영어 생성 (관사, 동사 활용)
│
├── dictionary/          # Dictionaries (사전)
│   ├── words.ts         # Word pairs (단어 사전) ✅ 단어 추가 OK
│   ├── idioms.ts        # Idioms only (관용어만) ⚠️ 일반 문장 금지
│   ├── i18n-words.ts    # Auto-generated from i18n (자동 생성)
│   └── i18n-sentences.ts # Auto-generated (자동 생성) ❌ 수동 편집 금지
│
├── nlp/                 # NLP modules (자연어 처리)
│   ├── wsd/             # Word Sense Disambiguation (다의어 처리)
│   └── collocation/     # Collocation detection (연어 탐지)
│
└── translator-service.ts # Main service (메인 서비스)
```

---

## Translation Pipeline (번역 파이프라인)

### Ko→En (한→영)

```
Input: "그는 음악을 듣는다"
  ↓
1. Cultural expressions check (문화 표현 체크)
  ↓
2. Idiom detection (관용어 감지)
  ↓
3. Pattern matching (패턴 매칭)
  ↓
4. Morpheme analysis (형태소 분석)
   - 그 + 는 (topic marker)
   - 음악 + 을 (object marker)
   - 듣 + 는다 (present tense)
  ↓
5. Sentence parsing (문장 파싱)
   - Subject: 그는
   - Object: 음악을
   - Predicate: 듣는다
  ↓
6. English generation (영어 생성)
   - SOV → SVO reordering
   - Article selection (a/an/the)
   - Verb conjugation (3rd person singular)
  ↓
Output: "He listens to music"
```

### En→Ko (영→한)

```
Input: "He listens to music"
  ↓
1. English parsing (영어 파싱)
   - Subject: He
   - Verb: listens
   - Object: music
  ↓
2. SVO → SOV reordering
  ↓
3. Particle selection (조사 선택)
   - 받침 detection (hasFinalConsonant)
   - 은/는, 이/가, 을/를 selection
  ↓
4. Verb conjugation (동사 활용)
   - Tense (시제)
   - Formality (높임)
  ↓
Output: "그는 음악을 듣는다"
```

---

## Key Algorithms (핵심 알고리즘)

### 1. 받침 (Final Consonant) Detection

```typescript
function hasFinalConsonant(word: string): boolean {
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const jongseong = (code - 0xAC00) % 28;
    return jongseong !== 0;
  }
  return false;
}
```

**Usage (용도):**
- `selectTopicParticle`: 은/는 선택
- `selectSubjectParticle`: 이/가 선택
- `selectObjectParticle`: 을/를 선택

### 2. Location Expression Parsing (위치 표현 파싱)

```typescript
// "책상 위에" → "on the desk"
const LOCATION_NOUNS = new Set(['위', '아래', '앞', '뒤', '안', '밖', ...]);
const LOCATION_TO_PREPOSITION = {
  위: 'on',
  아래: 'under',
  앞: 'in front of',
  뒤: 'behind',
  안: 'in',
  ...
};
```

### 3. Morpheme Analysis (형태소 분석)

| Pattern | Example | Stem | Ending | Tense |
|---------|---------|------|--------|-------|
| `-ㄴ다/는다` | 먹는다 | 먹 | 는다 | present |
| `-았/었다` | 먹었다 | 먹 | 었다 | past |
| `-ㄹ/을 것이다` | 먹을 것이다 | 먹 | 을 것이다 | future |

---

## 📊 Performance Benchmark (성능 벤치마크)

### 유일한 정답지 (Single Source of Truth)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   📁 benchmark-data.ts (12개 테스트 그룹)                                      ║
║                                                                              ║
║   번역기 성능 측정의 유일한 정답지                                               ║
║   The ONLY source of truth for translator performance                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 12개 테스트 그룹 (12 Test Groups)

| # | 변수명 | 설명 |
|---|--------|------|
| 1 | `levelTests` | 레벨별 기본 번역 테스트 |
| 2 | `categoryTests` | 카테고리별 테스트 |
| 3 | `contextTests` | 문맥 기반 번역 테스트 |
| 4 | `typoTests` | 오타 처리 테스트 |
| 5 | `uniqueTests` | 고유 표현 테스트 |
| 6 | `polysemyTests` | 다의어 처리 테스트 |
| 7 | `wordOrderTests` | SVO↔SOV 어순 변환 테스트 |
| 8 | `spacingErrorTests` | 띄어쓰기 오류 처리 테스트 |
| 9 | `finalTests` | 종합 테스트 |
| 10 | `professionalTranslatorTests` | 전문 번역 품질 테스트 |
| 11 | `localizationTests` | 현지화 테스트 |
| 12 | `antiHardcodingTests` | 하드코딩 방지 테스트 **(22개 레벨)** |

### 12번 antiHardcodingTests - 22개 레벨 상세

> 암기/하드코딩으로는 절대 통과 불가능한 22가지 핵심 알고리즘 규칙

| Level | 규칙명 | 설명 |
|-------|--------|------|
| 1 | 숫자 + 복수형 | three apples → 사과 세 개 |
| 2 | 관사 a/an | a university, an hour |
| 3 | 서수 생성 | 1st, 2nd, 3rd, 4th... |
| 4 | 시제 자동 판단 | 문맥에서 시제 추론 |
| 5 | 주어-동사 수 일치 | He runs / They run |
| 6 | 부정문 자동 생성 | don't / doesn't / didn't |
| 7 | 비교급/최상급 | bigger, the biggest |
| 8 | 가산/불가산 명사 | water, informations(X) |
| 9 | 수동태/능동태 | was written / wrote |
| 10 | 전치사 (시간) | at 3pm, on Monday, in June |
| 11 | 전치사 (장소) | at school, in Seoul, on the table |
| 12 | 의문사 자동 선택 | who, what, where, when, why |
| 13 | 형용사 순서 | big red ball (O), red big ball (X) |
| 14 | 관계대명사 삽입 | the book that I read |
| 15 | 대명사 자동 결정 | he, she, it, they |
| 16 | 생략 주어 복원 | (I) went to school |
| 17 | 동명사/to부정사 | enjoy doing / want to do |
| 18 | 수량사 자동 선택 | many, much, few, little |
| 19 | 재귀 대명사 | myself, himself |
| 20 | 중의적 표현 해소 | 문맥으로 의미 파악 |
| 21 | 동사 불규칙 변화 | go→went, eat→ate |
| 22 | 조합 폭발 처리 | 여러 규칙 동시 적용 |

### 벤치마크 실행 방법

```bash
# 브라우저에서 벤치마크 페이지 열기
# http://localhost:5173/benchmark

# 또는 개발 서버 시작 후
pnpm dev:tools
```

### 중요 규칙

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  ⚠️  benchmark-data.ts 외의 다른 vitest 테스트 파일은 만들지 않는다             ║
║                                                                              ║
║  ✅  성능 측정 = benchmark-data.ts (12개 그룹)                                 ║
║  ❌  중복 테스트 파일 생성 금지                                                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Test Levels (테스트 레벨)

| Level | Description | Examples |
|-------|-------------|----------|
| **1** | Basic SVO/SOV (기본 문장) | 나는 밥을 먹는다 / I eat rice |
| **2** | Tense variations (시제 변화) | 먹었다, 먹을 것이다 |
| **3** | Negation (부정문) | 안 먹는다, 먹지 않는다 |
| **4** | Questions (의문문) | 먹니? 먹었어? |
| **5** | Complex sentences (복합문) | 연결어미, 종속절 |

---

## Development Guidelines (개발 가이드)

### When Adding New Test Cases (새 테스트 케이스 추가 시)

1. **DO NOT** add the test sentence to any dictionary file
   (사전 파일에 테스트 문장 추가 금지)

2. **DO** improve the algorithm to handle the pattern
   (패턴을 처리할 수 있도록 알고리즘 개선)

3. Check which component needs improvement:
   (어떤 컴포넌트를 개선해야 하는지 확인)
   - Morpheme analysis? → `morpheme-analyzer.ts`
   - Sentence structure? → `sentence-parser.ts`
   - English generation? → `english-generator.ts`
   - Particle selection? → `en-to-ko.ts`

### Example: Fixing a Test Case (테스트 케이스 수정 예시)

```
Problem: "책이 책상 위에 있다" → "Book desk is at on"
Expected: "The book is on the desk"

Analysis:
- "책상" was grouped with subject instead of location
- "위에" was not recognized as location preposition

Solution:
1. Add LOCATION_NOUNS set in sentence-parser.ts
2. Add look-ahead logic to group "책상" with "위에"
3. Add LOCATION_TO_PREPOSITION mapping in english-generator.ts

Result: ✅ Test passes through algorithm improvement
```

---

## Commands (명령어)

```bash
# Run all translator tests (모든 번역기 테스트 실행)
pnpm --filter tools test -- --grep "translator"

# Run specific level (특정 레벨 실행)
pnpm --filter tools test -- --grep "Level 1"

# Run with watch mode (감시 모드)
pnpm --filter tools test -- --grep "translator" --watch
```

---

## Contributing (기여하기)

1. **Understand the principle**: Algorithm-only improvements
   (원칙 이해: 알고리즘으로만 개선)

2. **Run tests first**: Understand what's failing
   (먼저 테스트 실행: 무엇이 실패하는지 파악)

3. **Identify the component**: Which file needs changes?
   (컴포넌트 식별: 어떤 파일을 수정해야 하는가?)

4. **Make structural changes**: Not dictionary shortcuts
   (구조적 변경: 사전 지름길 사용 금지)

5. **Verify all tests pass**: Don't break existing functionality
   (모든 테스트 통과 확인: 기존 기능 손상 금지)

---

## Changelog (변경 이력)

### 2024-12-24: Level 1 Complete (Level 1 완료)

**Ko→En:**
- Location expression parsing (`책상 위에` → `on the desk`)
- LOCATION_NOUNS set and look-ahead grouping

**En→Ko:**
- SVO→SOV conversion engine connection
- 받침-based particle selection (hasFinalConsonant)
- Fixed particle errors (밥를→밥을, 음악를→음악을)

---

Built with [Claude Code](https://claude.com/claude-code) by [SoundBlue](https://soundbluemusic.com)
