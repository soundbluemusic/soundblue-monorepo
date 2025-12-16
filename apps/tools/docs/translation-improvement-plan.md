# 번역기 품질 향상 계획서
## Translation Quality Improvement Plan

**작성일:** 2025-12-15
**현재 버전:** 1.0.0
**상태:** ⚠️ 일부 항목 구현 완료

> **구현 완료 항목:**
> - 의성어/의태어: `dictionary/onomatopoeia.ts` (50+ 항목)
> - 문화 특수 표현: `dictionary/cultural.ts` (50+ 항목)
> - 구동사: `dictionary/phrasal-verbs.ts` (100+ 항목)
> - WSD/다의어: `nlp/wsd/polysemy-dict.ts` (50+ 항목)

---

## 1. 현재 상태 (Current Status)

### 최종 점수

| 항목 | 값 |
|------|-----|
| **총점** | **1.84 / 5.00** |
| **백분율** | **36.8%** |
| **등급** | **미흡 (Poor)** |
| **테스트 수** | 63개 |

### 카테고리별 현황

| 카테고리 | 점수 | 상태 | 개선 우선순위 |
|----------|------|------|---------------|
| 1.3 관용구/속담 | 3.75/5 | ✅ 우수 | - |
| 1.2.4 시제 | 2.67/5 | ⚠️ 보통 | 중 |
| 1.1.2 다의어 | 2.50/5 | ⚠️ 미흡 | 중 |
| 1.2.3 어순 차이 | 2.50/5 | ⚠️ 미흡 | 중 |
| 1.1.4 신조어 | 2.00/5 | ⚠️ 미흡 | 중 |
| 1.2.1 존칭 체계 | 1.67/5 | ❌ 불량 | 낮 |
| 2.1.3 영어 관용구 | 3.00/5 | ⚠️ 보통 | 낮 |
| 1.1.3 의성어/의태어 | 1.33/5 | ❌ 불량 | **높** |
| 1.2.2 주어 생략 | 1.25/5 | ❌ 불량 | 중 |
| 1.1.1 동음이의어 | 1.17/5 | ❌ 불량 | **높** |
| 2.1.1 영어 다의어 | 1.00/5 | ❌ 불량 | **높** |
| 2.1.2 구동사 | 1.00/5 | ❌ 불량 | **높** |
| 2.2.1 관계대명사 | 1.00/5 | ❌ 불량 | 중 |
| 2.2.2 가정법 | 1.00/5 | ❌ 불량 | 중 |
| 2.2.3 수동태 | 1.00/5 | ❌ 불량 | 중 |
| 3.2 문화 특수 표현 | 1.00/5 | ❌ 불량 | **높** |

---

## 2. 목표 점수 (Target Score)

| 단계 | 목표 점수 | 등급 | 예상 완료 |
|------|-----------|------|-----------|
| Phase 1 | 2.50/5 (50%) | 보통 | 1차 개선 |
| Phase 2 | 3.50/5 (70%) | 우수 | 2차 개선 |
| Phase 3 | 4.00/5 (80%) | 우수+ | 3차 개선 |

---

## 3. 개선 계획 (Improvement Plan)

### Phase 1: 빠른 개선 (Quick Wins) - 목표 2.50점

사전 추가만으로 즉시 개선 가능한 항목들

#### 3.1.1 의성어/의태어 사전 추가
**현재:** 1.33/5 → **목표:** 4.00/5

```typescript
// 추가할 파일: src/tools/translator/dictionary/onomatopoeia.ts
export const onomatopoeia: Record<string, string> = {
  // 의성어
  '보글보글': 'bubbling',
  '쨍그랑': 'clatter/shatter',
  '덜컹덜컹': 'rattling',
  '빵빵': 'honking',
  '쿵쾅쿵쾅': 'thumping',

  // 의태어
  '아장아장': 'toddling',
  '싱글벙글': 'grinning',
  '두근두근': 'pounding',
  '반짝반짝': 'twinkling',
  '주렁주렁': 'in clusters',
  '살금살금': 'stealthily',
  '흔들흔들': 'swaying',
};
```

**예상 점수 상승:** +0.15

#### 3.1.2 문화 특수 표현 사전 추가
**현재:** 1.00/5 → **목표:** 5.00/5

```typescript
// 추가할 파일: src/tools/translator/dictionary/cultural.ts
export const culturalExpressions: Record<string, string> = {
  '수고하셨습니다': 'Thank you for your hard work',
  '수고하세요': 'Keep up the good work',
  '잘 먹겠습니다': 'Thank you for the meal',
  '잘 먹었습니다': 'Thank you for the meal',
  '화이팅': 'Fighting / You can do it',
  '아이고': 'Oh my / Oh dear',
  '어머': 'Oh my',
  '대박': 'Awesome / Amazing',
};
```

**예상 점수 상승:** +0.06

#### 3.1.3 신조어 사전 확장
**현재:** 2.00/5 → **목표:** 4.00/5

```typescript
// 확장: src/tools/translator/dictionary/slang.ts
export const slang: Record<string, string> = {
  '내로남불': 'hypocrisy / double standards',
  '혼밥': 'eating alone',
  '혼술': 'drinking alone',
  '갑분싸': 'sudden awkward silence',
  '꿀잼': 'super fun',
  '핵인싸': 'super popular person',
  '존버': 'holding strong',
  '갑질': 'power harassment',
  '워라밸': 'work-life balance',
};
```

**예상 점수 상승:** +0.05

#### 3.1.4 구동사 사전 추가
**현재:** 1.00/5 → **목표:** 4.00/5

```typescript
// 추가할 파일: src/tools/translator/dictionary/phrasal-verbs.ts
export const phrasalVerbs: Record<string, string> = {
  'look up': '찾아보다',
  'put off': '미루다',
  'turn down': '거절하다',
  'give up': '포기하다',
  'figure out': '이해하다/알아내다',
  'come across': '우연히 만나다',
  'work out': '운동하다/잘 되다',
  'break down': '고장나다/무너지다',
  'pick up': '줍다/데리러 가다',
  'set up': '설치하다/설정하다',
};
```

**예상 점수 상승:** +0.10

---

### Phase 2: 핵심 개선 (Core Improvements) - 목표 3.50점

알고리즘 개선이 필요한 항목들

#### 3.2.1 동음이의어 WSD (Word Sense Disambiguation) 강화
**현재:** 1.17/5 → **목표:** 3.50/5

**구현 계획:**
```typescript
// src/tools/translator/nlp/wsd/homonym-dict.ts
interface HomonymEntry {
  word: string;
  senses: {
    meaning: string;
    en: string;
    contextClues: string[];  // 문맥 단서
    collocations: string[];  // 함께 나오는 단어
  }[];
}

export const homonyms: HomonymEntry[] = [
  {
    word: '배',
    senses: [
      { meaning: '과일', en: 'pear', contextClues: ['먹다', '맛있다'], collocations: ['사과', '과일'] },
      { meaning: '신체', en: 'stomach/belly', contextClues: ['고프다', '아프다'], collocations: ['고프다'] },
      { meaning: '탈것', en: 'boat/ship', contextClues: ['타다', '항구'], collocations: ['타다', '바다'] },
    ]
  },
  {
    word: '눈',
    senses: [
      { meaning: '신체', en: 'eye', contextClues: ['감다', '뜨다', '보다'], collocations: ['감다'] },
      { meaning: '날씨', en: 'snow', contextClues: ['내리다', '오다', '쌓이다'], collocations: ['내리다'] },
    ]
  },
  // ... 밤, 차, 말, 사과 등
];
```

**예상 점수 상승:** +0.15

#### 3.2.2 다의어 문맥 처리 개선
**현재:** 2.50/5 → **목표:** 4.00/5

```typescript
// src/tools/translator/nlp/wsd/polysemy-expansion.ts
// 기존 polysemy-dict.ts 확장

// '먹다' 문맥별 번역
'먹다': {
  default: 'eat',
  contexts: {
    '나이': 'get older',
    '마음': 'make up one\'s mind',
    '겁': 'get scared',
    '욕': 'get scolded',
  }
},

// '타다' 문맥별 번역
'타다': {
  default: 'ride',
  contexts: {
    '피아노': 'play',
    '기타': 'play',
    '햇볕': 'get tanned',
    '월급': 'receive',
  }
},
```

**예상 점수 상승:** +0.08

#### 3.2.3 주어 추론 로직 구현
**현재:** 1.25/5 → **목표:** 3.00/5

```typescript
// src/tools/translator/grammar/subject-inference.ts
export function inferSubject(sentence: string, context?: string[]): string {
  // 의문문 → 'you'
  if (sentence.endsWith('?') || sentence.includes('어디') || sentence.includes('뭐')) {
    return 'you';
  }

  // 감탄/추측 표현 → 'that/it'
  if (sentence.includes('겠다') || sentence.includes('구나')) {
    return 'that';
  }

  // 기본 → 'I'
  return 'I';
}
```

**예상 점수 상승:** +0.05

---

### Phase 3: 고급 개선 (Advanced Improvements) - 목표 4.00점

영→한 문법 구조 처리

#### 3.3.1 영어 문법 파서 구현
**현재:** 1.00/5 (관계대명사, 가정법, 수동태) → **목표:** 3.00/5

```typescript
// src/tools/translator/grammar/english-parser.ts
interface ParsedEnglish {
  type: 'declarative' | 'interrogative' | 'conditional' | 'passive';
  subject: string;
  verb: string;
  object?: string;
  relativeClause?: ParsedEnglish;
  condition?: ParsedEnglish;
}

// 수동태 감지 및 변환
function parsePassive(sentence: string): ParsedEnglish | null {
  const passivePattern = /(.+) (was|were|is|are|been) (.+) by (.+)/i;
  // ...
}

// 관계대명사 처리
function parseRelativeClause(sentence: string): ParsedEnglish | null {
  const relativePattern = /(.+) (who|which|that) (.+)/i;
  // ...
}
```

**예상 점수 상승:** +0.15

#### 3.3.2 존칭 체계 매핑
**현재:** 1.67/5 → **목표:** 3.50/5

```typescript
// src/tools/translator/grammar/honorific-mapper.ts
type FormalityLevel = 'formal' | 'polite' | 'casual' | 'intimate';

const formalityMap: Record<FormalityLevel, { prefix: string; suffix: string }> = {
  formal: { prefix: 'We kindly request', suffix: '' },
  polite: { prefix: 'Please', suffix: '' },
  casual: { prefix: '', suffix: '' },
  intimate: { prefix: '', suffix: '' },
};

function detectFormality(ending: string): FormalityLevel {
  if (ending.includes('주시기 바랍니다')) return 'formal';
  if (ending.includes('주세요') || ending.includes('해요')) return 'polite';
  if (ending.includes('해라') || ending.includes('해')) return 'casual';
  return 'intimate';
}
```

**예상 점수 상승:** +0.05

---

## 4. 예상 점수 변화 (Expected Score Progression)

| 단계 | 개선 항목 | 점수 상승 | 누적 점수 |
|------|-----------|-----------|-----------|
| 현재 | - | - | **1.84** |
| Phase 1.1 | 의성어/의태어 | +0.15 | 1.99 |
| Phase 1.2 | 문화 특수 표현 | +0.06 | 2.05 |
| Phase 1.3 | 신조어 | +0.05 | 2.10 |
| Phase 1.4 | 구동사 | +0.10 | 2.20 |
| **Phase 1 완료** | | | **~2.50** |
| Phase 2.1 | 동음이의어 WSD | +0.15 | 2.65 |
| Phase 2.2 | 다의어 문맥 | +0.08 | 2.73 |
| Phase 2.3 | 주어 추론 | +0.05 | 2.78 |
| **Phase 2 완료** | | | **~3.50** |
| Phase 3.1 | 영어 문법 파서 | +0.15 | 3.65 |
| Phase 3.2 | 존칭 체계 | +0.05 | 3.70 |
| **Phase 3 완료** | | | **~4.00** |

---

## 5. 작업 우선순위 (Task Priority)

### 즉시 실행 (Immediate)
1. ✅ 의성어/의태어 사전 추가
2. ✅ 문화 특수 표현 사전 추가
3. ✅ 구동사 사전 추가

### 단기 (Short-term)
4. 신조어 사전 확장
5. 동음이의어 WSD 강화
6. 다의어 문맥 처리

### 중기 (Mid-term)
7. 주어 추론 로직
8. 영어 문법 파서 (수동태, 관계대명사)

### 장기 (Long-term)
9. 가정법 처리
10. 존칭 체계 매핑

---

## 6. 성공 지표 (Success Metrics)

| 지표 | 현재 | Phase 1 목표 | Phase 2 목표 | Phase 3 목표 |
|------|------|--------------|--------------|--------------|
| 총점 | 1.84/5 | 2.50/5 | 3.50/5 | 4.00/5 |
| 백분율 | 36.8% | 50% | 70% | 80% |
| 등급 | 미흡 | 보통 | 우수 | 우수+ |
| 2점 이하 항목 | 47개 | 30개 | 15개 | 5개 |

---

## 7. 결론 (Conclusion)

현재 번역기는 **1.84점 (미흡)** 수준이며, 체계적인 개선을 통해 **4.00점 (우수)** 달성이 가능합니다.

**핵심 개선 포인트:**
1. **사전 확장** - 의성어, 문화표현, 구동사 (빠른 개선)
2. **WSD 강화** - 동음이의어, 다의어 문맥 처리
3. **문법 파서** - 영어 문장 구조 분석

Phase 1 완료 시 **2.50점 (보통)** 등급 달성 예상됩니다.

---

*Document Version: 1.0*
*Created for SoundBlueMusic Translation Project*
