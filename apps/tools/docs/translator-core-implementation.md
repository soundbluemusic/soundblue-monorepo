# 번역기 핵심 구현 기능 보고서

**상태: ✅ 구현 완료**

> **참고:** 이 문서의 WSD, 연어, 주제 탐지 기능은 모두 구현되었습니다.
> - WSD: `src/tools/translator/nlp/wsd/polysemy-dict.ts` (50+ 다의어)
> - 연어: `src/tools/translator/nlp/collocation/` (200+ 연어)
> - 주제: `src/tools/translator/nlp/topic/topic-detector.ts`

> **환경**: 100% SSG, 클라이언트(브라우저) 실행, 서버/Workers 없음

---

## 1. 구현 우선순위 (Impact vs Effort)

```
높은 임팩트 + 낮은 노력  ←  먼저 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1] 다의어 사전 + WSD     ★★★★★  (번역 정확도 핵심)
[2] 연어 사전             ★★★★☆  (자연스러운 영어)
[3] 주제 탐지             ★★★☆☆  (WSD 보조)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[4] 어순 변환 강화        ★★★☆☆  (복잡한 문장)
[5] N-gram 유창성         ★★☆☆☆  (다중 후보 시)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         낮은 임팩트 + 높은 노력
```

---

## 2. [핵심 1] 중의성 해소 (WSD)

### 2.1 파일 구조

```
src/tools/translator/nlp/
├── index.ts
├── wsd/
│   ├── index.ts
│   ├── polysemy-dict.ts    # 다의어 사전
│   ├── context-scorer.ts   # 문맥 점수 계산
│   └── wsd.test.ts
```

### 2.2 다의어 사전 구조

```typescript
// nlp/wsd/polysemy-dict.ts

export interface Sense {
  id: string;           // 의미 ID
  en: string;           // 영어 번역
  domain: string;       // 도메인 (body, food, transport...)
  triggers: string[];   // 문맥 단서 단어
  weight: number;       // 기본 빈도 가중치 (0-1)
}

export interface Polysemy {
  word: string;
  senses: Sense[];
}

// 다의어 사전 (번들 크기 고려: 핵심 50개)
export const polysemyDict: Polysemy[] = [
  {
    word: '배',
    senses: [
      {
        id: 'belly',
        en: 'stomach',
        domain: 'body',
        triggers: ['아프다', '고프다', '부르다', '배탈', '소화', '병원', '먹다'],
        weight: 0.4,  // 가장 흔한 의미
      },
      {
        id: 'boat',
        en: 'boat',
        domain: 'transport',
        triggers: ['타다', '항구', '바다', '강', '선장', '출항', '닻'],
        weight: 0.3,
      },
      {
        id: 'pear',
        en: 'pear',
        domain: 'food',
        triggers: ['과일', '달다', '깎다', '사과', '맛있다', '포도'],
        weight: 0.2,
      },
      {
        id: 'times',
        en: 'times',
        domain: 'math',
        triggers: ['두', '세', '열', '몇', '배로', '증가', '감소'],
        weight: 0.1,
      },
    ],
  },
  {
    word: '눈',
    senses: [
      {
        id: 'eye',
        en: 'eye',
        domain: 'body',
        triggers: ['보다', '감다', '뜨다', '시력', '안과', '눈물', '눈썹'],
        weight: 0.5,
      },
      {
        id: 'snow',
        en: 'snow',
        domain: 'weather',
        triggers: ['오다', '내리다', '쌓이다', '녹다', '겨울', '눈사람', '하얗다'],
        weight: 0.4,
      },
      {
        id: 'bud',
        en: 'bud',
        domain: 'plant',
        triggers: ['새', '트다', '봄', '싹', '나무'],
        weight: 0.1,
      },
    ],
  },
  // ... 48개 더 추가
];

// 빠른 조회용 Map
export const polysemyMap = new Map(
  polysemyDict.map(p => [p.word, p])
);
```

### 2.3 문맥 점수 계산

```typescript
// nlp/wsd/context-scorer.ts

interface ContextWindow {
  before: string[];  // 앞 3단어
  after: string[];   // 뒤 3단어
  full: string;      // 전체 문장
}

/**
 * 문맥 윈도우 추출
 */
export function extractContext(
  tokens: string[],
  targetIndex: number,
  windowSize = 3
): ContextWindow {
  return {
    before: tokens.slice(Math.max(0, targetIndex - windowSize), targetIndex),
    after: tokens.slice(targetIndex + 1, targetIndex + 1 + windowSize),
    full: tokens.join(' '),
  };
}

/**
 * 의미별 점수 계산
 */
export function scoreSense(sense: Sense, context: ContextWindow): number {
  let score = sense.weight;  // 기본 빈도 점수

  const contextWords = [...context.before, ...context.after];

  // 트리거 단어 매칭 (가중치: 2.0)
  for (const trigger of sense.triggers) {
    // 부분 매칭 허용 (예: "아프다" in "아파서")
    if (contextWords.some(w => w.includes(trigger) || trigger.includes(w))) {
      score += 2.0;
    }
    // 전체 문장에서도 찾기 (가중치: 0.5)
    if (context.full.includes(trigger)) {
      score += 0.5;
    }
  }

  return score;
}

/**
 * 최적 의미 선택
 */
export function disambiguate(
  word: string,
  context: ContextWindow
): Sense | null {
  const polysemy = polysemyMap.get(word);
  if (!polysemy) return null;

  let bestSense: Sense | null = null;
  let bestScore = -1;

  for (const sense of polysemy.senses) {
    const score = scoreSense(sense, context);
    if (score > bestScore) {
      bestScore = score;
      bestSense = sense;
    }
  }

  return bestSense;
}
```

### 2.4 번역 서비스 통합

```typescript
// translator-service.ts 수정

import { disambiguate, extractContext, polysemyMap } from './nlp/wsd';

function translateWord(
  word: string,
  tokens: string[],
  index: number
): string {
  // 다의어인지 확인
  if (polysemyMap.has(word)) {
    const context = extractContext(tokens, index);
    const sense = disambiguate(word, context);
    if (sense) {
      return sense.en;
    }
  }

  // 기본 사전 조회
  return koToEnWords[word] || word;
}
```

### 2.5 초기 다의어 목록 (50개)

| 단어 | 의미 수 | 주요 뜻 |
|------|--------|---------|
| 배 | 4 | stomach, boat, pear, times |
| 눈 | 3 | eye, snow, bud |
| 밤 | 2 | night, chestnut |
| 차 | 3 | car, tea, difference |
| 말 | 3 | word, horse, end |
| 손 | 2 | hand, guest |
| 발 | 2 | foot, departure |
| 길 | 2 | road, method |
| 병 | 2 | bottle, illness |
| 달 | 2 | moon, month |
| 쓰다 | 3 | write, wear, bitter |
| 타다 | 3 | ride, burn, receive |
| 걸다 | 3 | hang, call, bet |
| 차다 | 3 | kick, cold, full |
| 빠지다 | 3 | fall, be missing, be absorbed |
| 들다 | 4 | hold, enter, cost, like |
| 나다 | 3 | occur, grow, exit |
| 보다 | 3 | see, than, try |
| 풀다 | 2 | solve, untie |
| 떨어지다 | 2 | fall, run out |
| ... | ... | ... (30개 더) |

---

## 3. [핵심 2] 연어 사전

### 3.1 파일 구조

```
src/tools/translator/nlp/
├── collocation/
│   ├── index.ts
│   ├── collocation-dict.ts  # 연어 사전
│   ├── matcher.ts           # 연어 매칭
│   └── collocation.test.ts
```

### 3.2 연어 사전 구조

```typescript
// nlp/collocation/collocation-dict.ts

export interface Collocation {
  ko: string[];       // 한국어 패턴 (어간 기준)
  en: string;         // 영어 번역
  type: 'V+N' | 'N+V' | 'ADJ+N' | 'ADV+V';
}

// 핵심 연어 200개
export const collocations: Collocation[] = [
  // === 동사 + 명사 (make/do/take/have 구분) ===
  { ko: ['결정', '내리'], en: 'make a decision', type: 'V+N' },
  { ko: ['결정', '하'], en: 'make a decision', type: 'V+N' },
  { ko: ['실수', '하'], en: 'make a mistake', type: 'V+N' },
  { ko: ['약속', '하'], en: 'make a promise', type: 'V+N' },
  { ko: ['약속', '지키'], en: 'keep a promise', type: 'V+N' },
  { ko: ['전화', '하'], en: 'make a call', type: 'V+N' },
  { ko: ['전화', '걸'], en: 'make a call', type: 'V+N' },

  { ko: ['숙제', '하'], en: 'do homework', type: 'V+N' },
  { ko: ['운동', '하'], en: 'do exercise', type: 'V+N' },
  { ko: ['요리', '하'], en: 'do the cooking', type: 'V+N' },
  { ko: ['빨래', '하'], en: 'do the laundry', type: 'V+N' },
  { ko: ['설거지', '하'], en: 'do the dishes', type: 'V+N' },

  { ko: ['사진', '찍'], en: 'take a photo', type: 'V+N' },
  { ko: ['샤워', '하'], en: 'take a shower', type: 'V+N' },
  { ko: ['낮잠', '자'], en: 'take a nap', type: 'V+N' },
  { ko: ['휴식', '취하'], en: 'take a rest', type: 'V+N' },
  { ko: ['시험', '보'], en: 'take an exam', type: 'V+N' },

  { ko: ['식사', '하'], en: 'have a meal', type: 'V+N' },
  { ko: ['대화', '나누'], en: 'have a conversation', type: 'V+N' },
  { ko: ['회의', '하'], en: 'have a meeting', type: 'V+N' },

  // === 명사 + 동사 (자연 현상) ===
  { ko: ['비', '오'], en: 'rain falls', type: 'N+V' },
  { ko: ['비', '내리'], en: 'rain falls', type: 'N+V' },
  { ko: ['눈', '오'], en: 'snow falls', type: 'N+V' },
  { ko: ['눈', '내리'], en: 'snow falls', type: 'N+V' },
  { ko: ['바람', '불'], en: 'wind blows', type: 'N+V' },
  { ko: ['해', '뜨'], en: 'sun rises', type: 'N+V' },
  { ko: ['해', '지'], en: 'sun sets', type: 'N+V' },
  { ko: ['달', '뜨'], en: 'moon rises', type: 'N+V' },

  // === 형용사 + 명사 ===
  { ko: ['심한', '비'], en: 'heavy rain', type: 'ADJ+N' },
  { ko: ['강한', '바람'], en: 'strong wind', type: 'ADJ+N' },
  { ko: ['빠른', '속도'], en: 'high speed', type: 'ADJ+N' },
  { ko: ['깊은', '잠'], en: 'deep sleep', type: 'ADJ+N' },
  { ko: ['높은', '온도'], en: 'high temperature', type: 'ADJ+N' },

  // === 주의 + 기울이다 류 ===
  { ko: ['주의', '기울이'], en: 'pay attention', type: 'V+N' },
  { ko: ['관심', '기울이'], en: 'pay attention', type: 'V+N' },
  { ko: ['관심', '갖'], en: 'take interest', type: 'V+N' },
  { ko: ['눈길', '끌'], en: 'catch attention', type: 'V+N' },

  // ... 160개 더
];

// 빠른 조회용 (첫 단어 기준)
export const collocationIndex = new Map<string, Collocation[]>();
for (const c of collocations) {
  const key = c.ko[0];
  if (!collocationIndex.has(key)) {
    collocationIndex.set(key, []);
  }
  collocationIndex.get(key)!.push(c);
}
```

### 3.3 연어 매칭 로직

```typescript
// nlp/collocation/matcher.ts

import { collocationIndex, type Collocation } from './collocation-dict';

interface CollocationMatch {
  collocation: Collocation;
  startIndex: number;
  endIndex: number;
}

/**
 * 어간 추출 (간단 버전)
 */
function getStem(word: string): string {
  // 조사 제거
  const particles = ['을', '를', '이', '가', '은', '는', '에', '에서', '로', '으로'];
  for (const p of particles) {
    if (word.endsWith(p)) {
      return word.slice(0, -p.length);
    }
  }

  // 어미 제거 (기본)
  const endings = ['다', '요', '니다', '습니다', '었', '았', '겠'];
  for (const e of endings) {
    if (word.endsWith(e)) {
      return word.slice(0, -e.length);
    }
  }

  return word;
}

/**
 * 연어 매칭
 */
export function findCollocations(tokens: string[]): CollocationMatch[] {
  const matches: CollocationMatch[] = [];
  const stems = tokens.map(getStem);

  for (let i = 0; i < stems.length; i++) {
    const candidates = collocationIndex.get(stems[i]);
    if (!candidates) continue;

    for (const colloc of candidates) {
      // 2단어 연어 체크
      if (colloc.ko.length === 2 && i + 1 < stems.length) {
        // 인접하거나 1칸 떨어진 경우 (조사가 끼어있을 수 있음)
        for (let j = i + 1; j <= Math.min(i + 2, stems.length - 1); j++) {
          if (stems[j].includes(colloc.ko[1]) || colloc.ko[1].includes(stems[j])) {
            matches.push({
              collocation: colloc,
              startIndex: i,
              endIndex: j,
            });
            break;
          }
        }
      }
    }
  }

  // 겹치는 매칭 제거 (긴 것 우선)
  return resolveOverlaps(matches);
}

function resolveOverlaps(matches: CollocationMatch[]): CollocationMatch[] {
  if (matches.length <= 1) return matches;

  // 시작 위치순 정렬
  matches.sort((a, b) => a.startIndex - b.startIndex);

  const result: CollocationMatch[] = [];
  let lastEnd = -1;

  for (const match of matches) {
    if (match.startIndex > lastEnd) {
      result.push(match);
      lastEnd = match.endIndex;
    }
  }

  return result;
}
```

### 3.4 번역 서비스 통합

```typescript
// translator-service.ts

import { findCollocations } from './nlp/collocation';

function translateKoToEn(text: string): string {
  const tokens = text.split(' ');

  // 1. 연어 매칭 먼저
  const collocMatches = findCollocations(tokens);

  // 매칭된 연어 위치 기록
  const collocRanges = new Set<number>();
  const collocResults: Map<number, string> = new Map();

  for (const match of collocMatches) {
    for (let i = match.startIndex; i <= match.endIndex; i++) {
      collocRanges.add(i);
    }
    collocResults.set(match.startIndex, match.collocation.en);
  }

  // 2. 토큰별 번역
  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (collocResults.has(i)) {
      result.push(collocResults.get(i)!);
    } else if (!collocRanges.has(i)) {
      // 연어에 포함되지 않은 단어만 개별 번역
      result.push(translateWord(tokens[i], tokens, i));
    }
  }

  return result.join(' ');
}
```

---

## 4. [핵심 3] 주제 탐지

### 4.1 구현 (간단 버전)

```typescript
// nlp/topic/topic-detector.ts

interface DomainScore {
  domain: string;
  score: number;
}

// 도메인별 키워드 (번들 크기 최적화: 핵심만)
const domainKeywords: Record<string, string[]> = {
  body: ['아프다', '병원', '의사', '약', '치료', '수술', '증상', '환자'],
  food: ['먹다', '맛있다', '요리', '음식', '식당', '과일', '달다', '짜다'],
  transport: ['타다', '차', '버스', '지하철', '배', '비행기', '역', '운전'],
  weather: ['날씨', '비', '눈', '바람', '춥다', '덥다', '맑다', '흐리다'],
  education: ['학교', '공부', '시험', '수업', '선생님', '학생', '숙제'],
  business: ['회사', '일', '회의', '계약', '거래', '사업', '직장'],
  emotion: ['좋다', '싫다', '슬프다', '기쁘다', '화나다', '걱정', '행복'],
  time: ['오늘', '내일', '어제', '아침', '저녁', '시간', '언제', '항상'],
};

/**
 * 문장의 주요 도메인 탐지
 */
export function detectDomains(text: string): DomainScore[] {
  const scores: DomainScore[] = [];

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores.push({ domain, score });
    }
  }

  // 점수순 정렬
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * WSD에 도메인 정보 활용
 */
export function getTopDomain(text: string): string | null {
  const domains = detectDomains(text);
  return domains.length > 0 ? domains[0].domain : null;
}
```

### 4.2 WSD와 통합

```typescript
// nlp/wsd/context-scorer.ts 수정

import { getTopDomain } from '../topic';

export function scoreSenseWithDomain(
  sense: Sense,
  context: ContextWindow
): number {
  let score = scoreSense(sense, context);

  // 도메인 매칭 보너스
  const topDomain = getTopDomain(context.full);
  if (topDomain && sense.domain === topDomain) {
    score += 1.5;  // 도메인 일치 보너스
  }

  return score;
}
```

---

## 5. 번들 크기 예상

| 모듈 | 데이터 크기 | 코드 크기 | 총합 |
|------|-----------|----------|------|
| 다의어 사전 (50개) | ~15KB | ~3KB | ~18KB |
| 연어 사전 (200개) | ~20KB | ~2KB | ~22KB |
| 주제 탐지 | ~3KB | ~1KB | ~4KB |
| **총합** | | | **~44KB** |

> gzip 압축 후 약 **~15KB** 예상 (허용 범위)

---

## 6. 구현 순서

```
Week 1:
├── [Day 1-2] 다의어 사전 구축 (20개)
├── [Day 3-4] WSD 로직 구현
└── [Day 5] WSD 테스트

Week 2:
├── [Day 1-2] 연어 사전 구축 (100개)
├── [Day 3-4] 연어 매칭 로직
└── [Day 5] 연어 테스트

Week 3:
├── [Day 1] 주제 탐지 구현
├── [Day 2] WSD + 주제 통합
├── [Day 3-4] 전체 통합 테스트
└── [Day 5] 추가 사전 데이터 보강
```

---

## 7. 테스트 케이스

```typescript
// WSD 테스트
describe('WSD - 중의성 해소', () => {
  it('배 + 아프다 → stomach', () => {
    expect(translate('배가 아파요', 'ko-en')).toContain('stomach');
  });

  it('배 + 타다 → boat', () => {
    expect(translate('배를 탔어요', 'ko-en')).toContain('boat');
  });

  it('배 + 맛있다 → pear', () => {
    expect(translate('배가 맛있어요', 'ko-en')).toContain('pear');
  });

  it('두 배 → times', () => {
    expect(translate('두 배로 늘었어요', 'ko-en')).toContain('times');
  });
});

// 연어 테스트
describe('Collocation - 연어', () => {
  it('결정을 내리다 → make a decision', () => {
    expect(translate('결정을 내렸어요', 'ko-en')).toContain('made a decision');
  });

  it('사진을 찍다 → take a photo', () => {
    expect(translate('사진을 찍었어요', 'ko-en')).toContain('took a photo');
  });

  it('비가 오다 → rain falls', () => {
    expect(translate('비가 와요', 'ko-en')).toContain('rain');
  });
});
```

---

## 8. 예상 결과

| 시나리오 | 현재 | 구현 후 |
|----------|------|--------|
| "배가 아파요" | "pear hurts" (❌) | "stomach hurts" (✅) |
| "배를 탔어요" | "rode pear" (❌) | "took a boat" (✅) |
| "결정을 내렸어요" | "lowered decision" (❌) | "made a decision" (✅) |
| "비가 와요" | "rain comes" (△) | "it's raining" (✅) |

**예상 정확도 향상: 50% → 80%+**
