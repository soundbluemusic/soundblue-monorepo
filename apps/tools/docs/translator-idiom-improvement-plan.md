# 관용어/숙어 번역 구현 문서

작성일: 2025-12-15

**상태: ✅ 구현 완료**

> **구현 파일:**
> - `src/tools/translator/dictionary/idioms.ts` - 관용어 사전 (200+ 항목)
> - `src/tools/translator/dictionary/proverbs.ts` - 속담 사전
> - `src/tools/translator/dictionary/slang.ts` - 신조어/은어 사전
>
> **포함된 기능:**
> - IdiomEntry 인터페이스 (ko, en, literal, category, variants)
> - IdiomCategory 타입 (body, animal, food, nature, emotion, action, proverb, idiom, slang)
> - 신체 관용어 50+ (눈, 귀, 입, 손, 발, 머리 등)
> - 음식/자연 관용어 30+
> - 속담 30+
> - 사자성어 20+

---

## 1. 구현 상태 분석

### 1.1 번역 파이프라인

```
입력 텍스트
    ↓
[1단계] 문장 완전 일치 (sentences.ts) - 67개
    ↓ (매칭 실패 시)
[2단계] 정규식 패턴 매칭 (patterns.ts) - 48개
    ↓ (매칭 실패 시)
[3단계] 형태소 분해 + 단어 조합
    ↓
번역 결과
```

### 1.2 관용어 처리 현황

| 항목 | 현재 상태 |
|-----|---------|
| 관용어 사전 | ✅ 구현됨 (`idioms.ts`) |
| 숙어 인식 | ✅ 구현됨 |
| 속담 번역 | ✅ 구현됨 (`proverbs.ts`) |
| 비유적 표현 | ✅ 구현됨 |
| **커버리지** | **200+ 항목** |

### 1.3 현재 문제점

```
입력: "발 벗고 나서다"
현재 출력: "foot take off come out" ← 직역 오류
기대 출력: "roll up one's sleeves" 또는 "get actively involved"
```

```
입력: "식은 죽 먹기"
현재 출력: "cold porridge eat" ← 직역 오류
기대 출력: "a piece of cake"
```

---

## 2. 관용어 유형 분류

### 2.1 한국어 관용어 유형

| 유형 | 설명 | 예시 | 처리 난이도 |
|-----|-----|------|-----------|
| **신체 관용어** | 신체 부위 활용 | 발이 넓다, 손이 크다, 눈이 높다 | 중 |
| **동물 관용어** | 동물 비유 | 쥐도 새도 모르게, 개미 허리 | 중 |
| **음식 관용어** | 음식 비유 | 식은 죽 먹기, 누워서 떡 먹기 | 중 |
| **자연 관용어** | 자연 현상 비유 | 눈 깜짝할 사이, 바람 맞다 | 중 |
| **속담** | 교훈적 표현 | 가는 말이 고와야 오는 말이 곱다 | 상 |
| **사자성어** | 한자 4글자 | 일석이조, 오매불망 | 하 |
| **신조 관용어** | 현대 표현 | 멘붕, 갑분싸, 빼박 | 상 |

### 2.2 번역 전략별 분류

| 전략 | 설명 | 예시 |
|-----|-----|------|
| **등가 관용어** | 영어에 동등한 표현 존재 | 식은 죽 먹기 → a piece of cake |
| **유사 관용어** | 비슷한 의미의 영어 표현 | 발 벗고 나서다 → roll up one's sleeves |
| **설명적 번역** | 의미를 풀어서 설명 | 눈치가 빠르다 → quick to read situations |
| **직역 + 설명** | 문화 맥락 보존 | 밥 먹었어요? → Have you eaten? (Korean greeting) |

---

## 3. 제안 아키텍처

### 3.1 새로운 번역 파이프라인

```
입력 텍스트
    ↓
[0단계] 전처리 (정규화)
    ↓
[1단계] 문장 완전 일치 (sentences.ts)
    ↓ (매칭 실패 시)
[2단계] ★ 관용어/숙어 매칭 (idioms.ts) ← 신규
    ↓ (매칭 실패 시)
[3단계] 정규식 패턴 매칭 (patterns.ts)
    ↓ (매칭 실패 시)
[4단계] ★ 부분 관용어 치환 후 형태소 분해 ← 개선
    ↓
번역 결과
```

### 3.2 파일 구조 변경

```
src/tools/translator/
├── dictionary/
│   ├── index.ts
│   ├── words.ts           # 기존
│   ├── sentences.ts       # 기존
│   ├── patterns.ts        # 기존
│   ├── compound-words.ts  # 기존
│   ├── idioms.ts          # ★ 신규: 관용어 사전
│   ├── proverbs.ts        # ★ 신규: 속담 사전
│   └── slang.ts           # ★ 신규: 은어/신조어 사전
└── translator-service.ts  # 수정 필요
```

---

## 4. 구현 상세 계획

### 4.1 Phase 1: 관용어 사전 구축 (idioms.ts)

```typescript
// 제안 구조
export interface IdiomEntry {
  ko: string;                    // 한국어 관용어
  en: string;                    // 영어 번역
  literal?: string;              // 직역 (참고용)
  category: IdiomCategory;       // 분류
  formality: 'formal' | 'casual' | 'neutral';
  frequency: 'high' | 'medium' | 'low';  // 사용 빈도
  variants?: string[];           // 변형 표현
}

export type IdiomCategory =
  | 'body'      // 신체 관용어
  | 'animal'    // 동물 관용어
  | 'food'      // 음식 관용어
  | 'nature'    // 자연 관용어
  | 'emotion'   // 감정 관용어
  | 'action'    // 행동 관용어
  | 'proverb'   // 속담
  | 'idiom';    // 일반 관용어

// 예시 데이터
export const idioms: IdiomEntry[] = [
  {
    ko: '식은 죽 먹기',
    en: 'a piece of cake',
    literal: 'eating cold porridge',
    category: 'food',
    formality: 'casual',
    frequency: 'high',
    variants: ['누워서 떡 먹기']
  },
  {
    ko: '발 벗고 나서다',
    en: 'roll up one\'s sleeves',
    literal: 'take off shoes and step forward',
    category: 'body',
    formality: 'neutral',
    frequency: 'medium'
  },
  // ... 200+ 관용어
];
```

### 4.2 Phase 2: 매칭 알고리즘 구현

```typescript
// translator-service.ts에 추가

/**
 * 관용어 매칭 (문장 내 부분 매칭 지원)
 */
function matchIdioms(text: string): {
  found: boolean;
  result: string;
  matched: string[];
} {
  let result = text;
  const matched: string[] = [];

  // 1. 긴 관용어부터 매칭 (greedy matching)
  const sortedIdioms = [...idioms].sort(
    (a, b) => b.ko.length - a.ko.length
  );

  for (const idiom of sortedIdioms) {
    // 변형 표현 포함 검사
    const patterns = [idiom.ko, ...(idiom.variants || [])];

    for (const pattern of patterns) {
      if (result.includes(pattern)) {
        result = result.replace(pattern, `[[${idiom.en}]]`);
        matched.push(pattern);
      }
    }
  }

  return {
    found: matched.length > 0,
    result,
    matched
  };
}
```

### 4.3 Phase 3: 문맥 인식 개선

```typescript
// 동일 관용어의 다른 의미 처리
export interface ContextualIdiom extends IdiomEntry {
  context?: {
    before?: RegExp;   // 앞에 오는 패턴
    after?: RegExp;    // 뒤에 오는 패턴
    subject?: string;  // 주어 제한
  };
}

// 예: "눈이 높다" - 문맥에 따라 다른 번역
const contextualIdioms: ContextualIdiom[] = [
  {
    ko: '눈이 높다',
    en: 'have high standards',        // 기본
    context: { before: /사람|남자|여자/ },
    // "사람 눈이 높다" → "have high standards in people"
  },
  {
    ko: '눈이 높다',
    en: 'have expensive taste',       // 물건 관련
    context: { before: /물건|옷|음식/ },
  }
];
```

### 4.4 Phase 4: 역방향 (영→한) 지원

```typescript
// 영어 관용어 → 한국어 번역
export const enToKoIdioms: Record<string, string> = {
  'a piece of cake': '식은 죽 먹기',
  'break a leg': '행운을 빌어',
  'hit the nail on the head': '정곡을 찌르다',
  'kill two birds with one stone': '일석이조',
  'spill the beans': '비밀을 누설하다',
  'cost an arm and a leg': '엄청 비싸다',
  'under the weather': '몸이 안 좋다',
  'break the ice': '어색함을 깨다',
  // ... 200+ 영어 관용어
};
```

---

## 5. 관용어 데이터베이스 계획

### 5.1 우선순위별 추가 목록

#### Priority 1: 일상 필수 관용어 (50개)

| 한국어 | 영어 | 카테고리 |
|-------|------|---------|
| 식은 죽 먹기 | a piece of cake | food |
| 발 벗고 나서다 | roll up one's sleeves | body |
| 눈이 높다 | have high standards | body |
| 손이 크다 | be generous | body |
| 발이 넓다 | know many people | body |
| 귀가 얇다 | be easily influenced | body |
| 입이 가볍다 | have a loose tongue | body |
| 눈 깜짝할 사이 | in the blink of an eye | body |
| 손에 땀을 쥐다 | be on the edge of one's seat | body |
| 배가 아프다 | be jealous | body |
| 머리가 좋다 | be smart | body |
| 눈치가 빠르다 | be quick to read situations | body |
| 마음을 먹다 | make up one's mind | emotion |
| 화가 나다 | get angry | emotion |
| 기가 막히다 | be dumbfounded | emotion |
| ... | ... | ... |

#### Priority 2: 빈번 사용 속담 (30개)

| 한국어 | 영어 |
|-------|------|
| 가는 말이 고와야 오는 말이 곱다 | You reap what you sow |
| 고래 싸움에 새우 등 터진다 | Caught between two fires |
| 낫 놓고 기역자도 모른다 | Can't see the forest for the trees |
| 뛰는 놈 위에 나는 놈 있다 | There's always a bigger fish |
| 원숭이도 나무에서 떨어진다 | Even Homer nods |
| ... | ... |

#### Priority 3: 사자성어 (30개)

| 한국어 | 영어 |
|-------|------|
| 일석이조 | Kill two birds with one stone |
| 오매불망 | Can't stop thinking about |
| 일취월장 | Improve day by day |
| 동고동락 | Share joys and sorrows |
| ... | ... |

#### Priority 4: 현대 신조어/은어 (20개)

| 한국어 | 영어 | 설명 |
|-------|------|------|
| 멘붕 | mental breakdown | 멘탈붕괴 |
| 갑분싸 | sudden awkward silence | 갑자기 분위기 싸해짐 |
| 빼박 | undeniable | 빼도 박도 못함 |
| 극혐 | extremely disgusting | 극도로 혐오 |
| JMT | super delicious | 존맛탱 |
| ... | ... | ... |

### 5.2 데이터 수집 계획

| 출처 | 예상 수량 | 품질 |
|-----|----------|-----|
| 국립국어원 관용어 사전 | 300+ | 높음 |
| 한국어 교재 관용어 목록 | 100+ | 높음 |
| 웹 크롤링 (신조어) | 50+ | 중간 |
| 수동 큐레이션 | 50+ | 높음 |
| **총계** | **500+** | - |

---

## 6. 기술적 고려사항

### 6.1 매칭 성능 최적화

```typescript
// 방법 1: Trie 자료구조 활용
class IdiomTrie {
  private root: TrieNode = new TrieNode();

  insert(idiom: string, translation: string): void { /* ... */ }
  search(text: string): { idiom: string; translation: string; start: number; end: number }[] { /* ... */ }
}

// 방법 2: Aho-Corasick 알고리즘 (다중 패턴 매칭)
// - 긴 텍스트에서 여러 관용어를 한 번에 찾을 때 효율적
// - O(n + m + z) 시간 복잡도 (n: 텍스트 길이, m: 패턴 총 길이, z: 매칭 수)
```

### 6.2 변형 처리

```typescript
// 관용어 변형 패턴
const idiomVariants = {
  '식은 죽 먹기': [
    '식은 죽 먹기야',
    '식은 죽 먹기지',
    '식은 죽 먹기네',
    '식은 죽 먹기다',
  ],
  '발 벗고 나서다': [
    '발 벗고 나섰다',
    '발 벗고 나서서',
    '발 벗고 나설',
  ]
};

// 정규식 기반 변형 생성
function generateVariants(idiom: string): RegExp {
  // 어미 변형 패턴 자동 생성
  const endings = ['다', '야', '지', '네', '니', '어', '아'];
  return new RegExp(
    idiom.replace(/다$/, `(${endings.join('|')})`)
  );
}
```

### 6.3 우선순위 규칙

```typescript
// 매칭 우선순위
const matchingPriority = [
  'exact_sentence',    // 1. 문장 완전 일치
  'proverb',           // 2. 속담 (긴 표현)
  'idiom_long',        // 3. 긴 관용어 (4단어 이상)
  'idiom_short',       // 4. 짧은 관용어 (2-3단어)
  'pattern',           // 5. 문법 패턴
  'compound_word',     // 6. 복합어
  'morpheme',          // 7. 형태소 분해
];
```

---

## 7. 테스트 계획

### 7.1 테스트 케이스

```typescript
describe('Idiom Translation', () => {
  // 기본 매칭
  test('식은 죽 먹기 → a piece of cake', () => {
    expect(translate('식은 죽 먹기', 'ko-en')).toBe('a piece of cake');
  });

  // 문장 내 관용어
  test('이 일은 식은 죽 먹기야', () => {
    expect(translate('이 일은 식은 죽 먹기야', 'ko-en'))
      .toBe('This task is a piece of cake');
  });

  // 변형 처리
  test('발 벗고 나섰다', () => {
    expect(translate('그가 발 벗고 나섰다', 'ko-en'))
      .toContain('rolled up his sleeves');
  });

  // 역방향
  test('a piece of cake → 식은 죽 먹기', () => {
    expect(translate('a piece of cake', 'en-ko')).toBe('식은 죽 먹기');
  });
});
```

### 7.2 품질 지표

| 지표 | 목표 |
|-----|-----|
| 관용어 인식률 | 90%+ |
| 번역 정확도 | 85%+ |
| 변형 처리율 | 80%+ |
| 문맥 정확도 | 75%+ |

---

## 8. 구현 로드맵

### 8.1 단계별 계획

| 단계 | 작업 | 예상 단어 수 | 우선순위 |
|-----|-----|------------|---------|
| **Phase 1** | idioms.ts 기본 구조 생성 | - | 높음 |
| **Phase 2** | 신체 관용어 추가 | 30개 | 높음 |
| **Phase 3** | 음식/자연 관용어 추가 | 25개 | 높음 |
| **Phase 4** | 속담 추가 | 30개 | 중간 |
| **Phase 5** | 사자성어 추가 | 30개 | 중간 |
| **Phase 6** | 번역 서비스 통합 | - | 높음 |
| **Phase 7** | 변형 처리 구현 | - | 중간 |
| **Phase 8** | 문맥 인식 구현 | - | 낮음 |
| **Phase 9** | 신조어/은어 추가 | 20개 | 낮음 |
| **Phase 10** | 영→한 관용어 | 50개 | 중간 |

### 8.2 예상 결과

| 지표 | 현재 | Phase 6 후 | Phase 10 후 |
|-----|-----|-----------|------------|
| 관용어 커버리지 | 0% | 40% | 70%+ |
| 관용어 사전 크기 | 0개 | 115개 | 200+개 |
| 문장 번역 품질 | 60% | 70% | 80%+ |

---

## 9. 결론 및 권장사항

### 9.1 즉시 실행 가능한 작업

1. **idioms.ts 파일 생성** - 기본 구조 및 50개 핵심 관용어
2. **translator-service.ts 수정** - 관용어 매칭 단계 삽입
3. **테스트 케이스 추가** - 관용어 번역 검증

### 9.2 핵심 성공 요인

- **데이터 품질**: 정확한 등가 표현 선정
- **매칭 순서**: 긴 관용어 우선 매칭
- **변형 처리**: 어미 변화 대응
- **점진적 확장**: 빈도 높은 관용어부터 추가

### 9.3 위험 요소

| 위험 | 영향 | 대응 |
|-----|-----|-----|
| 오매칭 (부분 문자열) | 중 | 단어 경계 검사 추가 |
| 문맥 오인식 | 중 | 문맥 힌트 패턴 추가 |
| 성능 저하 | 낮 | Trie 구조 최적화 |
| 번역 품질 저하 | 높 | 수동 큐레이션 강화 |

---

*본 보고서는 관용어/숙어 번역 기능 개선을 위한 기술 계획서입니다.*
