# 규칙 기반 번역기 고도화 - NLP 파이프라인 구현 문서

**상태: ✅ 핵심 기능 구현 완료**

> **참고:** 이 문서는 계획서로 작성되었으나, 대부분의 기능이 구현되었습니다.
>
> **구현된 기능:**
> - WSD (중의성 해소): `nlp/wsd/` - 50+ 다의어 지원
> - 연어 사전: `nlp/collocation/` - 200+ 연어
> - 주제 탐지: `nlp/topic/topic-detector.ts`
> - 형태소 분석: `grammar/morpheme-analyzer.ts`
> - 어순 변환: `grammar/english-generator.ts`

## 개요

현재 번역기 상태와 고도화 목표를 정리하고, 단계별 구현 전략을 수립한다.

---

## 1. 현재 상태 분석

### 1.1 구현 완료된 기능

| 기능 | 파일 | 상태 |
|------|------|------|
| 기본 단어 사전 | `dictionary/words.ts` | ~1000 단어 |
| 문장 패턴 매칭 | `dictionary/patterns.ts` | 기본 패턴 |
| 관용어/숙어 | `dictionary/idioms.ts` | 200+ 항목 |
| 형태소 분해 | `hangul/*.ts` | 자모, 어미, 조사 |
| 오타 교정 | `typo/*.ts` | 띄어쓰기, 자모 거리 |
| 불규칙 활용 | `hangul/irregulars.ts` | ㄷ,ㅂ,ㅅ,ㅎ,르 불규칙 |

### 1.2 현재 한계점

```
1. 중의성 미해소: "배" → 항상 첫 번째 뜻만 선택
2. 문맥 무시: 앞뒤 단어 관계 미고려
3. 어순 변환 한계: 복잡한 문장 구조 처리 불가
4. 유창성 검증 없음: 생성된 영어 문장의 자연스러움 미검증
5. 연어 미지원: "make decision" vs "do decision" 구분 불가
```

---

## 2. 고도화 아키텍처

### 2.1 전체 파이프라인

```
입력 텍스트
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ [Phase 1: 전처리 - Preprocessing]                           │
│   ├── 오타 교정 (typo/)                    ✅ 완료           │
│   ├── 정규화 (normalize)                   ✅ 완료           │
│   └── 토큰화 (tokenize)                    🔄 개선 필요      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ [Phase 2: 분석 - Analysis]                                  │
│   ├── 형태소 분석 (morpheme)               ✅ 기본 완료      │
│   ├── 품사 태깅 (POS tagging)              ⭕ 신규 필요      │
│   ├── 구문 분석 (chunking)                 ⭕ 신규 필요      │
│   └── 주제 탐지 (topic detection)          ⭕ 신규 필요      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ [Phase 3: 매칭 - Matching]                                  │
│   ├── 문장 완전 일치                       ✅ 완료           │
│   ├── 관용어 매칭 (idioms)                 ✅ 완료           │
│   ├── 패턴 매칭 (patterns)                 ✅ 기본 완료      │
│   └── 연어 매칭 (collocations)             ⭕ 신규 필요      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ [Phase 4: 해소 - Resolution]                                │
│   ├── 중의성 해소 (WSD)                    ⭕ 신규 필요      │
│   ├── 대명사 해소 (coreference)            ⭕ 신규 필요      │
│   └── 문맥 점수 계산 (context scoring)     ⭕ 신규 필요      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ [Phase 5: 변환 - Transformation]                            │
│   ├── 어순 변환 (reordering)               🔄 개선 필요      │
│   ├── 시제/수 일치 (agreement)             🔄 개선 필요      │
│   └── 조사→전치사 (particle→preposition)   ✅ 기본 완료      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ [Phase 6: 생성 - Generation]                                │
│   ├── 후보 생성 (candidate generation)     ⭕ 신규 필요      │
│   ├── 유창성 점수 (fluency scoring)        ⭕ 신규 필요      │
│   └── 최종 선택 (final selection)          ⭕ 신규 필요      │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
출력 텍스트
```

### 2.2 신규 디렉토리 구조

```
src/tools/translator/
├── dictionary/          # 기존 사전
│   ├── words.ts
│   ├── patterns.ts
│   ├── idioms.ts
│   └── index.ts
│
├── hangul/              # 기존 한글 처리
│   ├── jamo.ts
│   ├── irregulars.ts
│   └── index.ts
│
├── typo/                # 기존 오타 교정
│   ├── common-typos.ts
│   ├── spacing-rules.ts
│   └── index.ts
│
├── nlp/                 # 🆕 신규 NLP 모듈
│   ├── index.ts
│   │
│   ├── analysis/        # Phase 2: 분석
│   │   ├── pos-tagger.ts       # 품사 태깅
│   │   ├── chunker.ts          # 구문 분석
│   │   └── topic-detector.ts   # 주제 탐지
│   │
│   ├── matching/        # Phase 3: 매칭
│   │   ├── collocation.ts      # 연어 매칭
│   │   └── ngram-db.ts         # N-gram 데이터베이스
│   │
│   ├── resolution/      # Phase 4: 해소
│   │   ├── wsd.ts              # 중의성 해소
│   │   ├── context-scorer.ts   # 문맥 점수
│   │   └── semantic-field.ts   # 의미장
│   │
│   ├── transformation/  # Phase 5: 변환
│   │   ├── reorderer.ts        # 어순 변환
│   │   └── agreement.ts        # 일치 규칙
│   │
│   └── generation/      # Phase 6: 생성
│       ├── candidate.ts        # 후보 생성
│       ├── fluency.ts          # 유창성 점수
│       └── selector.ts         # 최종 선택
│
└── translator-service.ts  # 메인 서비스 (파이프라인 통합)
```

---

## 3. 단계별 구현 계획

### Phase 1: 품사 태깅 (POS Tagging)

#### 3.1.1 목적
- 단어의 품사를 식별하여 중의성 해소 및 어순 변환에 활용
- 규칙 기반 + 어미/조사 패턴 기반 구현

#### 3.1.2 품사 체계 (간소화)

```typescript
type POSTag =
  | 'NNG'   // 일반명사 (General Noun)
  | 'NNP'   // 고유명사 (Proper Noun)
  | 'NP'    // 대명사 (Pronoun)
  | 'VV'    // 동사 (Verb)
  | 'VA'    // 형용사 (Adjective)
  | 'VX'    // 보조용언 (Auxiliary Verb)
  | 'MM'    // 관형사 (Determiner)
  | 'MAG'   // 일반부사 (Adverb)
  | 'JKS'   // 주격조사 (Subject Particle)
  | 'JKO'   // 목적격조사 (Object Particle)
  | 'JKB'   // 부사격조사 (Adverbial Particle)
  | 'JX'    // 보조사 (Auxiliary Particle)
  | 'EC'    // 연결어미 (Connective Ending)
  | 'EF'    // 종결어미 (Final Ending)
  | 'XSV'   // 동사파생접미사
  | 'XSA'   // 형용사파생접미사
  | 'SF'    // 마침표, 물음표, 느낌표
  | 'UNK';  // 미상
```

#### 3.1.3 구현 전략

```typescript
// nlp/analysis/pos-tagger.ts

interface POSToken {
  text: string;
  pos: POSTag;
  lemma?: string;      // 원형
  features?: {
    tense?: 'past' | 'present' | 'future';
    honorific?: boolean;
    negative?: boolean;
  };
}

// 규칙 기반 태깅
// 1. 사전 기반: 단어 사전에 품사 정보 추가
// 2. 어미 기반: 어미로 동사/형용사 구분
// 3. 조사 기반: 조사로 명사 확인
// 4. 위치 기반: 문장 내 위치로 품사 추정

const posRules = {
  // 어미 패턴 → 품사
  endings: {
    '다': 'EF',      // 종결어미
    '요': 'EF',
    '니다': 'EF',
    '고': 'EC',      // 연결어미
    '서': 'EC',
    '면': 'EC',
  },

  // 조사 패턴 → 앞 단어는 명사
  particles: {
    '이': 'JKS',
    '가': 'JKS',
    '을': 'JKO',
    '를': 'JKO',
    '에': 'JKB',
    '에서': 'JKB',
  }
};
```

#### 3.1.4 우선순위
- **높음**: 중의성 해소와 어순 변환의 기반
- **예상 작업량**: 3-4시간

---

### Phase 2: 중의성 해소 (Word Sense Disambiguation)

#### 3.2.1 목적
- 다의어의 올바른 의미 선택
- 문맥 기반 점수 계산으로 최적 번역어 선택

#### 3.2.2 중의어 사전 구조

```typescript
// nlp/resolution/wsd.ts

interface WordSense {
  word: string;           // 한국어 단어
  senses: SenseEntry[];   // 의미 목록
}

interface SenseEntry {
  id: string;             // 의미 ID
  en: string;             // 영어 번역
  definition: string;     // 정의
  pos: POSTag;            // 품사
  domain?: string;        // 도메인 (의료, 음식, 교통 등)
  triggers: string[];     // 트리거 단어 (문맥 단서)
  collocations: string[]; // 자주 함께 쓰이는 단어
  examples: string[];     // 예문
}

// 예시: "배" 다의어
const polysemy_배: WordSense = {
  word: '배',
  senses: [
    {
      id: 'belly',
      en: 'stomach',
      definition: '신체 부위, 복부',
      pos: 'NNG',
      domain: 'body',
      triggers: ['아프다', '고프다', '부르다', '병원', '소화', '먹다', '배탈'],
      collocations: ['가', '를', '이'],
      examples: ['배가 아프다', '배가 고프다']
    },
    {
      id: 'boat',
      en: 'boat',
      definition: '수상 이동수단',
      pos: 'NNG',
      domain: 'transport',
      triggers: ['타다', '항구', '바다', '강', '노', '닻', '선장', '여객선'],
      collocations: ['를', '에서'],
      examples: ['배를 타다', '배가 출항하다']
    },
    {
      id: 'pear',
      en: 'pear',
      definition: '과일의 일종',
      pos: 'NNG',
      domain: 'food',
      triggers: ['과일', '맛있다', '달다', '깎다', '먹다', '사과', '포도'],
      collocations: ['를', '하나'],
      examples: ['배를 깎다', '배가 달다']
    },
    {
      id: 'times',
      en: 'times',
      definition: '배수를 나타내는 단위',
      pos: 'NNG',
      domain: 'math',
      triggers: ['두', '세', '열', '배로', '증가', '감소', '몇'],
      collocations: ['의', '로'],
      examples: ['두 배', '세 배로 증가']
    }
  ]
};
```

#### 3.2.3 문맥 점수 계산 알고리즘

```typescript
interface ContextWindow {
  before: string[];  // 앞 N개 단어
  after: string[];   // 뒤 N개 단어
  sentence: string;  // 전체 문장
}

function calculateSenseScore(
  sense: SenseEntry,
  context: ContextWindow
): number {
  let score = 0;
  const contextWords = [...context.before, ...context.after];

  // 1. 트리거 단어 매칭 (가중치: 3)
  for (const trigger of sense.triggers) {
    if (contextWords.some(w => w.includes(trigger))) {
      score += 3;
    }
  }

  // 2. 도메인 일치 (가중치: 2)
  // 문장 전체에서 같은 도메인 단어가 있으면 가산
  const domainWords = getDomainWords(sense.domain);
  for (const dw of domainWords) {
    if (context.sentence.includes(dw)) {
      score += 2;
    }
  }

  // 3. 연어 패턴 매칭 (가중치: 1.5)
  for (const colloc of sense.collocations) {
    // 바로 뒤에 조사가 오는지 확인
    if (context.after[0] === colloc) {
      score += 1.5;
    }
  }

  // 4. 빈도 기반 기본 점수 (가중치: 0.5)
  score += sense.frequency * 0.5;

  return score;
}

function disambiguate(
  word: string,
  context: ContextWindow
): SenseEntry | null {
  const wordSenses = polysemyDB.get(word);
  if (!wordSenses) return null;

  let bestSense: SenseEntry | null = null;
  let bestScore = -Infinity;

  for (const sense of wordSenses.senses) {
    const score = calculateSenseScore(sense, context);
    if (score > bestScore) {
      bestScore = score;
      bestSense = sense;
    }
  }

  return bestSense;
}
```

#### 3.2.4 다의어 사전 초기 목록

| 단어 | 의미 개수 | 주요 뜻 |
|------|----------|---------|
| 배 | 4 | stomach, boat, pear, times |
| 눈 | 3 | eye, snow, bud |
| 밤 | 2 | night, chestnut |
| 차 | 3 | car, tea, difference |
| 말 | 3 | horse, word, end |
| 손 | 2 | hand, guest |
| 발 | 2 | foot, departure |
| 물 | 2 | water, goods |
| 바람 | 2 | wind, wish |
| 길 | 2 | road, way/method |
| 자리 | 3 | seat, position, place |
| 사람 | 2 | person, people |
| 가지 | 3 | branch, eggplant, kind |
| 벌 | 3 | bee, set, punishment |
| 달 | 2 | moon, month |
| 병 | 2 | bottle, illness |
| 잎 | 1 | leaf |
| 쓰다 | 3 | write, wear, bitter |
| 타다 | 3 | ride, burn, receive |
| 걸다 | 3 | hang, call, bet |

#### 3.2.5 우선순위
- **매우 높음**: 번역 정확도의 핵심
- **예상 작업량**: 5-6시간 (사전 구축 포함)

---

### Phase 3: 연어 (Collocation) 데이터베이스

#### 3.3.1 목적
- 자연스러운 단어 조합 식별
- 부자연스러운 번역 방지

#### 3.3.2 연어 구조

```typescript
// nlp/matching/collocation.ts

interface Collocation {
  pattern: string[];      // 단어 조합 패턴
  en: string;             // 영어 번역
  strength: number;       // 연어 강도 (PMI 점수)
  type: CollocationType;
}

type CollocationType =
  | 'V+N'      // 동사 + 명사 (밥을 먹다)
  | 'N+V'      // 명사 + 동사 (비가 오다)
  | 'ADJ+N'    // 형용사 + 명사 (큰 집)
  | 'N+N'      // 명사 + 명사 (학교 친구)
  | 'ADV+V'    // 부사 + 동사 (빨리 가다)
  | 'V+V';     // 동사 + 동사 (가고 싶다)

// 한국어 연어 → 영어 연어 매핑
const collocations: Collocation[] = [
  // 동사 + 명사
  { pattern: ['결정', '내리다'], en: 'make a decision', strength: 0.9, type: 'V+N' },
  { pattern: ['실수', '하다'], en: 'make a mistake', strength: 0.9, type: 'V+N' },
  { pattern: ['약속', '지키다'], en: 'keep a promise', strength: 0.85, type: 'V+N' },
  { pattern: ['숙제', '하다'], en: 'do homework', strength: 0.9, type: 'V+N' },
  { pattern: ['운동', '하다'], en: 'do exercise', strength: 0.85, type: 'V+N' },
  { pattern: ['전화', '걸다'], en: 'make a call', strength: 0.9, type: 'V+N' },
  { pattern: ['사진', '찍다'], en: 'take a photo', strength: 0.95, type: 'V+N' },
  { pattern: ['샤워', '하다'], en: 'take a shower', strength: 0.9, type: 'V+N' },
  { pattern: ['낮잠', '자다'], en: 'take a nap', strength: 0.9, type: 'V+N' },
  { pattern: ['주의', '기울이다'], en: 'pay attention', strength: 0.85, type: 'V+N' },

  // 명사 + 동사
  { pattern: ['비', '오다'], en: 'rain falls', strength: 0.95, type: 'N+V' },
  { pattern: ['눈', '오다'], en: 'snow falls', strength: 0.95, type: 'N+V' },
  { pattern: ['바람', '불다'], en: 'wind blows', strength: 0.95, type: 'N+V' },
  { pattern: ['해', '뜨다'], en: 'sun rises', strength: 0.9, type: 'N+V' },
  { pattern: ['해', '지다'], en: 'sun sets', strength: 0.9, type: 'N+V' },

  // 형용사 + 명사
  { pattern: ['강한', '바람'], en: 'strong wind', strength: 0.85, type: 'ADJ+N' },
  { pattern: ['심한', '비'], en: 'heavy rain', strength: 0.9, type: 'ADJ+N' },
  { pattern: ['빠른', '속도'], en: 'fast speed', strength: 0.8, type: 'ADJ+N' },
];
```

#### 3.3.3 연어 매칭 알고리즘

```typescript
function findCollocations(tokens: string[]): CollocationMatch[] {
  const matches: CollocationMatch[] = [];

  // 2-gram, 3-gram 윈도우로 스캔
  for (let windowSize = 3; windowSize >= 2; windowSize--) {
    for (let i = 0; i <= tokens.length - windowSize; i++) {
      const window = tokens.slice(i, i + windowSize);

      // 조사 제거 후 매칭
      const stemmed = window.map(t => removeSuffix(t));

      for (const colloc of collocations) {
        if (matchesPattern(stemmed, colloc.pattern)) {
          matches.push({
            start: i,
            end: i + windowSize,
            collocation: colloc,
            original: window
          });
        }
      }
    }
  }

  // 겹치는 매칭 중 긴 것 우선
  return resolveOverlaps(matches);
}
```

#### 3.3.4 우선순위
- **높음**: 자연스러운 영어 생성의 핵심
- **예상 작업량**: 4-5시간

---

### Phase 4: N-gram 기반 유창성 점수

#### 3.4.1 목적
- 생성된 영어 문장의 자연스러움 평가
- 여러 번역 후보 중 최적 선택

#### 3.4.2 N-gram 데이터베이스

```typescript
// nlp/matching/ngram-db.ts

// 영어 N-gram 빈도 (정규화된 확률)
interface NgramDB {
  unigrams: Map<string, number>;  // 단어 빈도
  bigrams: Map<string, number>;   // 2-gram 빈도
  trigrams: Map<string, number>;  // 3-gram 빈도
}

// 빈도 데이터 (상위 빈도 위주로 수동 구축)
const englishBigrams: [string, number][] = [
  // 관사 + 명사
  ['the_house', 0.8], ['a_book', 0.7], ['the_school', 0.75],

  // 주어 + 동사
  ['I_am', 0.95], ['I_have', 0.9], ['I_want', 0.85],
  ['you_are', 0.9], ['he_is', 0.85], ['she_is', 0.85],
  ['we_are', 0.8], ['they_are', 0.8],

  // 동사 + 목적어
  ['have_a', 0.8], ['make_a', 0.75], ['take_a', 0.7],
  ['do_the', 0.6], ['go_to', 0.85], ['want_to', 0.9],

  // 전치사구
  ['to_the', 0.85], ['in_the', 0.9], ['at_the', 0.8],
  ['on_the', 0.75], ['for_the', 0.7],

  // 부자연스러운 조합 (낮은 점수)
  ['do_a_decision', 0.01],  // make a decision이 맞음
  ['strong_rain', 0.05],     // heavy rain이 맞음
];
```

#### 3.4.3 유창성 점수 계산

```typescript
// nlp/generation/fluency.ts

function calculateFluencyScore(sentence: string, ngramDB: NgramDB): number {
  const words = sentence.toLowerCase().split(' ');

  if (words.length === 0) return 0;
  if (words.length === 1) return ngramDB.unigrams.get(words[0]) || 0.1;

  let score = 0;
  let count = 0;

  // Bigram 점수 계산
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]}_${words[i + 1]}`;
    const prob = ngramDB.bigrams.get(bigram) || 0.001; // 미등록은 매우 낮은 확률
    score += Math.log(prob);  // 로그 확률 합
    count++;
  }

  // Trigram 보너스 (있으면)
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]}_${words[i + 1]}_${words[i + 2]}`;
    if (ngramDB.trigrams.has(trigram)) {
      score += 0.5;  // 보너스
    }
  }

  // 평균 정규화
  return Math.exp(score / count);
}

// 여러 후보 중 최적 선택
function selectBestCandidate(
  candidates: string[],
  ngramDB: NgramDB
): string {
  let best = candidates[0];
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    const score = calculateFluencyScore(candidate, ngramDB);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}
```

#### 3.4.4 우선순위
- **중간**: 여러 후보가 있을 때만 필요
- **예상 작업량**: 3-4시간

---

### Phase 5: 어순 변환 규칙 (Reordering)

#### 3.5.1 목적
- 한국어 SOV → 영어 SVO 변환
- 복잡한 문장 구조 처리

#### 3.5.2 어순 변환 규칙

```typescript
// nlp/transformation/reorderer.ts

interface ReorderRule {
  name: string;
  pattern: POSTag[];           // 입력 패턴
  output: number[];            // 출력 순서 (인덱스)
  condition?: (tokens: POSToken[]) => boolean;
}

const reorderRules: ReorderRule[] = [
  // 기본 SOV → SVO
  {
    name: 'basic_sov_to_svo',
    pattern: ['NNG', 'JKS', 'NNG', 'JKO', 'VV'],  // 주어+조사, 목적어+조사, 동사
    output: [0, 4, 2],  // 주어, 동사, 목적어
  },

  // 장소 + 동사 → 동사 + 전치사 + 장소
  {
    name: 'location_postposition',
    pattern: ['NNG', 'JKB', 'VV'],  // 명사 + 에/에서 + 동사
    output: [2, 0],  // 동사 + to/at + 명사
  },

  // 시간 표현은 문장 앞으로
  {
    name: 'time_fronting',
    pattern: ['MAG', 'NNG', 'VV'],  // 부사 + 명사 + 동사
    output: [0, 1, 2],  // 순서 유지 (시간 부사는 앞에)
    condition: (tokens) => isTimeExpression(tokens[0].text),
  },

  // 관형절 + 명사 → 명사 + 관계절
  {
    name: 'relative_clause',
    pattern: ['VV', 'ETM', 'NNG'],  // 동사 + 관형형어미 + 명사
    output: [2, 0],  // 명사 + that + 동사
  },
];

function applyReordering(tokens: POSToken[]): POSToken[] {
  for (const rule of reorderRules) {
    const match = matchPattern(tokens, rule.pattern);
    if (match && (!rule.condition || rule.condition(tokens))) {
      return reorderByIndices(tokens, rule.output);
    }
  }
  return tokens;  // 매칭 없으면 원본 반환
}
```

#### 3.5.3 복잡한 어순 처리

```typescript
// 내포절 처리
// "내가 어제 산 책" → "the book that I bought yesterday"

interface ClauseStructure {
  main: POSToken[];      // 주절
  embedded: POSToken[];  // 내포절
  type: 'relative' | 'complement' | 'adverbial';
}

function extractClauses(tokens: POSToken[]): ClauseStructure | null {
  // 관형형 어미(-은/-는/-ㄴ/-ㄹ)를 찾아 내포절 경계 식별
  const etmIndex = tokens.findIndex(t => t.pos === 'ETM');

  if (etmIndex > 0) {
    return {
      embedded: tokens.slice(0, etmIndex + 1),
      main: tokens.slice(etmIndex + 1),
      type: 'relative'
    };
  }

  return null;
}
```

#### 3.5.4 우선순위
- **높음**: 문장 수준 번역의 핵심
- **예상 작업량**: 4-5시간

---

### Phase 6: 주제 탐지 (Topic Detection)

#### 3.6.1 목적
- 문장/문서의 주제 파악
- 중의성 해소에 도메인 정보 제공

#### 3.6.2 도메인 키워드

```typescript
// nlp/analysis/topic-detector.ts

interface DomainKeywords {
  domain: string;
  keywords: string[];
  weight: number;
}

const domainKeywords: DomainKeywords[] = [
  {
    domain: 'medical',
    keywords: ['병원', '의사', '약', '치료', '수술', '환자', '증상', '진단', '처방', '아프다'],
    weight: 1.0
  },
  {
    domain: 'food',
    keywords: ['맛있다', '먹다', '요리', '음식', '식당', '밥', '과일', '채소', '달다', '짜다'],
    weight: 1.0
  },
  {
    domain: 'transport',
    keywords: ['타다', '차', '버스', '지하철', '비행기', '배', '기차', '역', '공항', '운전'],
    weight: 1.0
  },
  {
    domain: 'education',
    keywords: ['학교', '공부', '시험', '수업', '선생님', '학생', '숙제', '졸업', '대학', '과목'],
    weight: 1.0
  },
  {
    domain: 'business',
    keywords: ['회사', '일', '직장', '회의', '계약', '거래', '사업', '투자', '이익', '매출'],
    weight: 1.0
  },
  {
    domain: 'technology',
    keywords: ['컴퓨터', '인터넷', '앱', '프로그램', '소프트웨어', '하드웨어', '데이터', '서버'],
    weight: 1.0
  },
];

function detectTopic(text: string): string[] {
  const scores: Map<string, number> = new Map();

  for (const domain of domainKeywords) {
    let score = 0;
    for (const keyword of domain.keywords) {
      if (text.includes(keyword)) {
        score += domain.weight;
      }
    }
    if (score > 0) {
      scores.set(domain.domain, score);
    }
  }

  // 점수순 정렬
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)  // 상위 3개
    .map(([domain]) => domain);
}
```

#### 3.6.3 우선순위
- **중간**: WSD 정확도 향상에 도움
- **예상 작업량**: 2-3시간

---

## 4. 데이터 구축 계획

### 4.1 필요 데이터 목록

| 데이터 | 규모 | 우선순위 | 구축 방법 |
|--------|------|----------|-----------|
| 다의어 사전 | 50-100 단어 | 높음 | 수동 구축 |
| 연어 사전 | 200-300 항목 | 높음 | 수동 구축 |
| 영어 Bigram | 500-1000 항목 | 중간 | 빈도 기반 선정 |
| 도메인 키워드 | 10개 도메인 × 20 키워드 | 중간 | 수동 구축 |
| 어순 규칙 | 20-30 패턴 | 높음 | 언어학 규칙 |

### 4.2 데이터 품질 기준

```
1. 다의어 사전
   - 각 의미별 최소 5개 트리거 단어
   - 각 의미별 최소 3개 예문
   - 빈도순 정렬

2. 연어 사전
   - 번역이 1:1 대응되지 않는 것 위주
   - make/do/take/have 등 경동사 조합 우선

3. N-gram
   - 고빈도 패턴 위주
   - 오류 패턴도 낮은 점수로 포함
```

---

## 5. 구현 순서 및 일정

### 5.1 권장 구현 순서

```
Phase 1: 기반 구축 (1주)
├── [1] 품사 태깅 기본
├── [2] 다의어 사전 구축 (상위 20개)
└── [3] WSD 기본 로직

Phase 2: 핵심 기능 (1주)
├── [4] 연어 사전 구축
├── [5] 연어 매칭 로직
└── [6] 어순 변환 규칙

Phase 3: 품질 향상 (1주)
├── [7] N-gram DB 구축
├── [8] 유창성 점수
├── [9] 주제 탐지
└── [10] 파이프라인 통합

Phase 4: 테스트 및 개선 (1주)
├── [11] 단위 테스트
├── [12] 통합 테스트
└── [13] 성능 최적화
```

### 5.2 마일스톤

| 마일스톤 | 목표 | 측정 방법 |
|----------|------|-----------|
| M1 | 다의어 20개 정확 해소 | 테스트 케이스 통과율 |
| M2 | 연어 100개 정확 번역 | 테스트 케이스 통과율 |
| M3 | 복합문 어순 변환 | 예제 문장 5개 정확 번역 |
| M4 | 전체 파이프라인 통합 | 종합 테스트 80% 통과 |

---

## 6. 테스트 계획

### 6.1 단위 테스트 케이스

```typescript
// WSD 테스트
describe('중의성 해소', () => {
  it('배 + 아프다 → stomach', () => {
    expect(wsd('배', context('배가 아프다'))).toBe('stomach');
  });

  it('배 + 타다 → boat', () => {
    expect(wsd('배', context('배를 타다'))).toBe('boat');
  });

  it('배 + 맛있다 → pear', () => {
    expect(wsd('배', context('배가 맛있다'))).toBe('pear');
  });

  it('두 배 → times', () => {
    expect(wsd('배', context('두 배로 증가'))).toBe('times');
  });
});

// 연어 테스트
describe('연어 번역', () => {
  it('결정을 내리다 → make a decision', () => {
    expect(translate('결정을 내렸다')).toContain('made a decision');
  });

  it('사진을 찍다 → take a photo', () => {
    expect(translate('사진을 찍었다')).toContain('took a photo');
  });
});

// 어순 테스트
describe('어순 변환', () => {
  it('SOV → SVO', () => {
    expect(translate('나는 사과를 먹었다')).toBe('I ate an apple');
  });

  it('장소 + 동사', () => {
    expect(translate('학교에 갔다')).toBe('I went to school');
  });
});
```

### 6.2 통합 테스트

```typescript
describe('복합 문장 번역', () => {
  it('다의어 + 연어 + 어순', () => {
    const input = '배가 아파서 병원에 갔다';
    const expected = 'I went to the hospital because my stomach hurt';
    expect(translate(input)).toBe(expected);
  });

  it('관용어 + 중의성', () => {
    const input = '눈이 높아서 배우자를 못 찾는다';
    const expected = "can't find a spouse because of high standards";
    expect(translate(input)).toContain(expected);
  });
});
```

---

## 7. 예상 결과

### 7.1 품질 향상 예상

| 시나리오 | 현재 | 목표 |
|----------|------|------|
| 다의어 정확도 | ~30% (첫 번째 뜻만) | 85%+ |
| 연어 자연스러움 | ~50% (직역) | 90%+ |
| 복합문 어순 | ~40% | 80%+ |
| 전체 번역 품질 | ~50% | 80%+ |

### 7.2 한계점

```
1. 규칙 기반의 한계
   - 예외 케이스 수동 처리 필요
   - 신조어/은어 대응 어려움

2. 데이터 의존성
   - 사전 품질에 번역 품질 의존
   - 수동 구축 비용

3. 성능
   - 복잡한 파이프라인으로 처리 시간 증가
   - 메모리 사용량 증가
```

---

## 8. 결론

### 8.1 즉시 시작 권장 작업

1. **다의어 사전 구축**: 상위 20개 다의어부터 시작
2. **WSD 기본 로직**: 트리거 단어 기반 점수 계산
3. **연어 사전 구축**: make/do/take 동사 조합 50개

### 8.2 장기 목표

- 규칙 기반으로 80% 품질 달성
- 예외 케이스 지속적 추가
- 사용자 피드백 기반 개선

---

## 부록: 참고 자료

### A. 한국어 품사 태그셋 (세종)

| 태그 | 품사 | 예시 |
|------|------|------|
| NNG | 일반명사 | 사람, 학교 |
| NNP | 고유명사 | 서울, 철수 |
| VV | 동사 | 먹다, 가다 |
| VA | 형용사 | 좋다, 예쁘다 |
| JKS | 주격조사 | 이/가 |
| JKO | 목적격조사 | 을/를 |

### B. 영어 연어 패턴

| 한국어 | 영어 (틀림) | 영어 (맞음) |
|--------|------------|------------|
| 결정하다 | do a decision | make a decision |
| 실수하다 | do a mistake | make a mistake |
| 샤워하다 | do a shower | take a shower |
| 사진찍다 | do a photo | take a photo |
| 전화하다 | do a call | make a call |
