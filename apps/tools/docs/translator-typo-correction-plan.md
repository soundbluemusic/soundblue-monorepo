# 한국어 오타 및 띄어쓰기 교정 파이프라인

작성일: 2025-12-15 (확장판)
**상태: ✅ 구현 완료**

> **참고:** 이 문서는 원래 계획서로 작성되었으나, 현재 대부분의 기능이 구현되어 있습니다.
>
> **구현 파일:**
> - `src/tools/translator/typo/typo-corrector.ts` - 통합 교정
> - `src/tools/translator/typo/spacing-rules.ts` - 띄어쓰기 규칙
> - `src/tools/translator/typo/jamo-edit-distance.ts` - 자모 편집 거리
> - `src/tools/translator/typo/common-typos.ts` - 빈번한 오타 사전

---

## 1. 문제 정의

### 1.1 오타 유형 분류

#### A. 자모 오타 (Jamo Typos)
```
원문: "맥락 분석하기"
오타 예시:
  - "맥락 뷴석하기" → ㅜ+ㄴ→ㅠ 오타 (인접 키)
  - "맥락 분셕하기" → ㅓ+ㄱ→ㅕ 오타 (인접 키)
  - "맥락 분식하기" → ㅅ→ㅅ, ㅓ→ㅣ 오타 (유사 발음)
```

#### B. 띄어쓰기 오타 (Spacing Typos)
```
원문: "나는 학교에 간다"
오타 예시:
  - "나는학교에간다"     → 띄어쓰기 누락 (붙여쓰기)
  - "나 는 학교 에 간다" → 과도한 띄어쓰기
  - "나는 학교에간다"    → 부분 누락
  - "아버지가방에들어가신다" → 의미 모호 (아버지가 방에 / 아버지 가방에)
```

#### C. 복합 오타 (Combined Typos)
```
원문: "할 수 있다"
복합 오타:
  - "할수잇다"  → 띄어쓰기 + 자모 오타 (있→잇)
  - "핧 수있다" → 자모 오타 (할→핧) + 띄어쓰기
```

### 1.2 한국어 띄어쓰기 규칙

| 규칙 | 설명 | 예시 |
|-----|-----|------|
| **조사 붙여쓰기** | 체언 + 조사 | 학교에, 나는, 책을 |
| **어미 붙여쓰기** | 용언 + 어미 | 먹었다, 갔어요 |
| **의존명사 띄어쓰기** | 용언 + 의존명사 | 할 수, 먹을 것, 갈 때 |
| **보조용언 띄어쓰기** | 본용언 + 보조용언 | 먹어 보다, 해 주다 |
| **단위명사 띄어쓰기** | 수 + 단위 | 한 개, 세 명 (허용: 한개, 세명) |
| **복합어 붙여쓰기** | 합성어/파생어 | 손목시계, 첫사랑 |
| **고유명사 붙여쓰기** | 이름, 지명 | 대한민국, 김철수 |

### 1.3 띄어쓰기 오류의 특수성

```
문제: "아버지가방에들어가신다"
해석 1: "아버지가 방에 들어가신다" (Father enters the room)
해석 2: "아버지 가방에 들어가신다" (Goes into father's bag)

→ 문맥 분석 필수!
```

---

## 2. 제안 아키텍처

### 2.1 통합 교정 파이프라인

```
입력 텍스트
    ↓
[1단계] 전처리 (정규화)
    ↓
[2단계] 한영 전환 오류 복원
    ↓
[3단계] ★ 띄어쓰기 교정 (신규)
    │
    ├─ [3-1] 의존명사/보조용언 규칙 적용
    ├─ [3-2] 조사/어미 규칙 적용
    ├─ [3-3] 어절 경계 예측 (N-gram)
    └─ [3-4] 복합어 사전 확인
    ↓
[4단계] 자모 오타 교정
    │
    ├─ [4-1] 후보 생성 (Edit Distance)
    ├─ [4-2] 키보드 거리 가중치
    └─ [4-3] N-gram 문맥 점수
    ↓
[5단계] 최종 검증 및 선택
    ↓
교정된 텍스트 → 번역 파이프라인
```

### 2.2 파일 구조

```
src/tools/translator/
├── typo/
│   ├── index.ts               # 메인 export
│   ├── typo-corrector.ts      # 통합 오타 교정
│   │
│   ├── spacing/               # ★ 띄어쓰기 교정 (신규)
│   │   ├── index.ts
│   │   ├── spacing-corrector.ts    # 띄어쓰기 교정 메인
│   │   ├── spacing-rules.ts        # 띄어쓰기 규칙
│   │   ├── dependency-nouns.ts     # 의존명사 사전
│   │   ├── auxiliary-verbs.ts      # 보조용언 사전
│   │   └── compound-detector.ts    # 복합어 감지
│   │
│   ├── jamo/                  # 자모 오타 교정
│   │   ├── index.ts
│   │   ├── keyboard-distance.ts
│   │   ├── jamo-edit-distance.ts
│   │   └── candidate-generator.ts
│   │
│   ├── context/               # 문맥 분석
│   │   ├── index.ts
│   │   ├── ngram-model.ts
│   │   └── context-scorer.ts
│   │
│   ├── hangul-english.ts      # 한영 전환
│   └── common-typos.ts        # 빈도 높은 오타 사전
│
└── translator-service.ts      # 수정 필요
```

---

## 3. 띄어쓰기 교정 알고리즘

### 3.1 의존명사 띄어쓰기 규칙

```typescript
// 의존명사 목록 (반드시 앞 단어와 띄어쓰기)
export const dependencyNouns: Record<string, DependencyNounInfo> = {
  // 것 류
  '것': { precedingPattern: /[ㄹ을]$/, example: '먹을 것' },
  '거': { precedingPattern: /[ㄹ을]$/, example: '할 거야' },
  '게': { precedingPattern: /[ㄹ을]$/, example: '먹을 게' },

  // 수 류
  '수': { precedingPattern: /[ㄹ을]$/, example: '할 수 있다' },

  // 때 류
  '때': { precedingPattern: /[ㄹ을는]$/, example: '갈 때' },
  '적': { precedingPattern: /[ㄴ은]$/, example: '본 적' },

  // 줄 류
  '줄': { precedingPattern: /[ㄹ을는]$/, example: '알 줄' },

  // 리 류
  '리': { precedingPattern: /[ㄹ을]$/, example: '갈 리가 없다' },

  // 뿐 류
  '뿐': { precedingPattern: /[ㄹ을ㄴ은]$/, example: '할 뿐' },

  // 만큼/대로/처럼 류
  '만큼': { precedingPattern: /[ㄴ은ㄹ을]$/, example: '할 만큼' },
  '대로': { precedingPattern: /[ㄴ은ㄹ을]$/, example: '하는 대로' },

  // 데 류
  '데': { precedingPattern: /[ㄴ는]$/, example: '가는 데' },

  // 바 류
  '바': { precedingPattern: /[ㄴ은]$/, example: '아는 바' },

  // 지 류
  '지': { precedingPattern: /[ㄴ은]$/, example: '온 지' },

  // 등 류
  '등': { precedingPattern: /./, example: '사과 등' },
};

/**
 * 의존명사 띄어쓰기 교정
 */
function correctDependencyNounSpacing(text: string): string {
  let result = text;

  for (const [noun, info] of Object.entries(dependencyNouns)) {
    // 붙어있는 패턴 찾기: "할수" → "할 수"
    const attachedPattern = new RegExp(
      `(${info.precedingPattern.source.replace('$', '')})${noun}`,
      'g'
    );

    result = result.replace(attachedPattern, `$1 ${noun}`);
  }

  return result;
}
```

### 3.2 보조용언 띄어쓰기 규칙

```typescript
// 보조용언 목록 (본용언과 띄어쓰기)
export const auxiliaryVerbs = [
  // 보다 류
  { pattern: '아/어 보다', example: '먹어 보다', attached: '먹어보다' },
  { pattern: '아/어 보이다', example: '좋아 보이다' },

  // 주다 류
  { pattern: '아/어 주다', example: '해 주다', attached: '해주다' },
  { pattern: '아/어 드리다', example: '도와 드리다' },

  // 가다/오다 류
  { pattern: '아/어 가다', example: '살아 가다' },
  { pattern: '아/어 오다', example: '걸어 오다' },

  // 버리다/내다 류
  { pattern: '아/어 버리다', example: '잊어 버리다', attached: '잊어버리다' },
  { pattern: '아/어 내다', example: '해 내다' },

  // 있다/없다 류
  { pattern: '고 있다', example: '하고 있다', attached: '하고있다' },
  { pattern: '아/어 있다', example: '앉아 있다' },

  // 싶다 류
  { pattern: '고 싶다', example: '가고 싶다', attached: '가고싶다' },

  // 하다 류
  { pattern: '지 않다', example: '가지 않다', attached: '가지않다' },
  { pattern: '지 못하다', example: '하지 못하다' },
];

/**
 * 보조용언 띄어쓰기 교정
 * 허용: 붙여쓰기도 맞음 (단, 본용언이 합성동사가 아닐 때)
 */
function correctAuxiliaryVerbSpacing(text: string): {
  corrected: string;
  confidence: number;
} {
  let result = text;
  let corrections = 0;

  // "할수있다" → "할 수 있다"
  // 의존명사 '수' + 보조용언 '있다' 복합 패턴
  result = result.replace(/([ㄹ을])수있/g, '$1 수 있');
  result = result.replace(/([ㄹ을])수없/g, '$1 수 없');

  // "하고있다" → "하고 있다"
  result = result.replace(/고있다/g, '고 있다');
  result = result.replace(/고싶다/g, '고 싶다');

  // "지않다" → "지 않다"
  result = result.replace(/지않/g, '지 않');
  result = result.replace(/지못하/g, '지 못하');

  return { corrected: result, confidence: 0.9 };
}
```

### 3.3 조사 붙여쓰기 규칙

```typescript
// 조사 목록 (반드시 앞 단어에 붙여쓰기)
export const particles = [
  // 격조사
  '이', '가', '을', '를', '은', '는', '의', '에', '에서', '로', '으로',
  '와', '과', '랑', '이랑', '에게', '한테', '께',

  // 보조사
  '도', '만', '까지', '부터', '마저', '조차', '밖에',
  '요', '든지', '든가', '나', '이나',
];

/**
 * 조사 띄어쓰기 교정 (잘못 띄어진 조사를 붙임)
 */
function correctParticleSpacing(text: string): string {
  let result = text;

  for (const particle of particles) {
    // "학교 에" → "학교에"
    // 단, 조사가 다른 단어의 시작이 아닌 경우만
    const spacedPattern = new RegExp(`(\\S) (${particle})(?=\\s|$)`, 'g');
    result = result.replace(spacedPattern, `$1$2`);
  }

  return result;
}
```

### 3.4 어절 경계 예측 (N-gram 기반)

```typescript
interface SpacingPrediction {
  position: number;      // 문자 위치
  shouldSpace: boolean;  // 띄어쓰기 여부
  confidence: number;    // 확신도
}

/**
 * 문자 단위 띄어쓰기 예측
 * 각 문자 사이에 띄어쓰기가 있어야 하는지 예측
 */
function predictSpacing(
  text: string,
  model: SpacingModel
): SpacingPrediction[] {
  const predictions: SpacingPrediction[] = [];
  const chars = [...text.replace(/\s/g, '')]; // 공백 제거

  for (let i = 0; i < chars.length - 1; i++) {
    // 앞뒤 문맥 추출
    const leftContext = chars.slice(Math.max(0, i - 2), i + 1).join('');
    const rightContext = chars.slice(i + 1, Math.min(chars.length, i + 4)).join('');

    // Bigram/Trigram 확률 계산
    const spacingProb = model.getSpacingProbability(leftContext, rightContext);

    predictions.push({
      position: i,
      shouldSpace: spacingProb > 0.5,
      confidence: Math.abs(spacingProb - 0.5) * 2, // 0~1 정규화
    });
  }

  return predictions;
}

/**
 * 띄어쓰기 모델 (규칙 + 통계 하이브리드)
 */
class SpacingModel {
  private bigramSpacing: Map<string, number>; // "을수" → 0.95 (띄어쓰기 확률)
  private charTypeTransition: Map<string, number>;

  getSpacingProbability(left: string, right: string): number {
    // 1. 규칙 기반 체크
    const ruleProb = this.checkRules(left, right);
    if (ruleProb !== null) return ruleProb;

    // 2. 품사 전이 확률
    const posProb = this.getPOSTransitionProb(left, right);

    // 3. Bigram 통계
    const bigramKey = left.slice(-2) + right.slice(0, 2);
    const bigramProb = this.bigramSpacing.get(bigramKey) || 0.5;

    // 가중 평균
    return posProb * 0.4 + bigramProb * 0.6;
  }

  private checkRules(left: string, right: string): number | null {
    const lastChar = left.slice(-1);
    const firstChar = right.slice(0, 1);

    // 규칙 1: 의존명사 앞은 띄어쓰기
    if (dependencyNouns[firstChar]) {
      return 0.95;
    }

    // 규칙 2: 조사 앞은 붙여쓰기
    if (particles.includes(firstChar)) {
      return 0.05;
    }

    // 규칙 3: 숫자+단위 (허용)
    if (/\d/.test(lastChar) && /[개명원년월일시분초]/.test(firstChar)) {
      return 0.5; // 둘 다 허용
    }

    return null; // 규칙 해당 없음
  }
}
```

### 3.5 모호한 띄어쓰기 해결 (문맥 분석)

```typescript
/**
 * 모호한 띄어쓰기 해결
 * "아버지가방에" → "아버지가 방에" vs "아버지 가방에"
 */
interface AmbiguousSpacing {
  text: string;
  candidates: {
    spaced: string;
    meaning: string;
    probability: number;
  }[];
}

function resolveAmbiguousSpacing(
  text: string,
  context: { before: string; after: string },
  model: NGramModel
): string {
  // 가능한 모든 띄어쓰기 조합 생성
  const candidates = generateSpacingCandidates(text);

  let bestCandidate = text;
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    // 각 후보의 문맥 점수 계산
    const score = calculateContextScore(candidate, context, model);

    // 문법 규칙 점수 추가
    const grammarScore = evaluateGrammar(candidate);

    const totalScore = score * 0.6 + grammarScore * 0.4;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

/**
 * 가능한 띄어쓰기 조합 생성 (Exponential → 가지치기 필요)
 */
function generateSpacingCandidates(text: string, maxCandidates: number = 10): string[] {
  const chars = [...text.replace(/\s/g, '')];
  const candidates: string[] = [];

  // Dynamic Programming으로 유효한 어절 조합만 탐색
  function backtrack(pos: number, current: string[]): void {
    if (pos >= chars.length) {
      candidates.push(current.join(' '));
      return;
    }

    if (candidates.length >= maxCandidates) return;

    // 1~5글자 어절 시도 (한국어 평균 어절 길이)
    for (let len = 1; len <= Math.min(5, chars.length - pos); len++) {
      const word = chars.slice(pos, pos + len).join('');

      // 유효한 어절인지 확인 (사전 또는 패턴)
      if (isValidWord(word)) {
        current.push(word);
        backtrack(pos + len, current);
        current.pop();
      }
    }
  }

  backtrack(0, []);
  return candidates;
}

/**
 * 문법 규칙 기반 점수
 */
function evaluateGrammar(text: string): number {
  const words = text.split(' ');
  let score = 1.0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // 조사로 시작하는 단어는 감점
    if (particles.includes(word[0]) && word.length === 1) {
      score *= 0.3;
    }

    // 의존명사로 시작하는 단어는 앞에 용언이 있어야 함
    if (dependencyNouns[word] && i > 0) {
      const prevWord = words[i - 1];
      if (!endsWithVerbStem(prevWord)) {
        score *= 0.5;
      }
    }

    // 단어가 사전에 있으면 가점
    if (isInDictionary(word)) {
      score *= 1.2;
    }
  }

  return Math.min(score, 1.0);
}
```

---

## 4. 자모 오타 교정 알고리즘

### 4.1 키보드 거리 기반 오타 감지

```typescript
// 한글 두벌식 키보드 레이아웃
const KEYBOARD_LAYOUT: Record<string, { row: number; col: number }> = {
  // 1행 (숫자행 아래)
  'ㅂ': { row: 0, col: 0 }, 'ㅃ': { row: 0, col: 0 },
  'ㅈ': { row: 0, col: 1 }, 'ㅉ': { row: 0, col: 1 },
  'ㄷ': { row: 0, col: 2 }, 'ㄸ': { row: 0, col: 2 },
  'ㄱ': { row: 0, col: 3 }, 'ㄲ': { row: 0, col: 3 },
  'ㅅ': { row: 0, col: 4 }, 'ㅆ': { row: 0, col: 4 },
  'ㅛ': { row: 0, col: 5 },
  'ㅕ': { row: 0, col: 6 },
  'ㅑ': { row: 0, col: 7 },
  'ㅐ': { row: 0, col: 8 }, 'ㅒ': { row: 0, col: 8 },
  'ㅔ': { row: 0, col: 9 }, 'ㅖ': { row: 0, col: 9 },

  // 2행
  'ㅁ': { row: 1, col: 0 },
  'ㄴ': { row: 1, col: 1 },
  'ㅇ': { row: 1, col: 2 },
  'ㄹ': { row: 1, col: 3 },
  'ㅎ': { row: 1, col: 4 },
  'ㅗ': { row: 1, col: 5 },
  'ㅓ': { row: 1, col: 6 },
  'ㅏ': { row: 1, col: 7 },
  'ㅣ': { row: 1, col: 8 },

  // 3행
  'ㅋ': { row: 2, col: 0 },
  'ㅌ': { row: 2, col: 1 },
  'ㅊ': { row: 2, col: 2 },
  'ㅍ': { row: 2, col: 3 },
  'ㅠ': { row: 2, col: 4 },
  'ㅜ': { row: 2, col: 5 },
  'ㅡ': { row: 2, col: 6 },
};

// 키보드 거리 계산
function keyboardDistance(jamo1: string, jamo2: string): number {
  const pos1 = KEYBOARD_LAYOUT[jamo1];
  const pos2 = KEYBOARD_LAYOUT[jamo2];

  if (!pos1 || !pos2) return Infinity;

  return Math.sqrt(
    Math.pow(pos1.row - pos2.row, 2) +
    Math.pow(pos1.col - pos2.col, 2)
  );
}

// 인접 키 매핑 (빠른 조회용)
const ADJACENT_KEYS: Record<string, string[]> = {
  'ㅂ': ['ㅈ', 'ㅁ'],
  'ㅈ': ['ㅂ', 'ㄷ', 'ㅁ', 'ㄴ'],
  'ㄷ': ['ㅈ', 'ㄱ', 'ㄴ', 'ㅇ'],
  'ㄱ': ['ㄷ', 'ㅅ', 'ㅇ', 'ㄹ'],
  'ㅅ': ['ㄱ', 'ㅛ', 'ㄹ', 'ㅎ'],
  'ㅛ': ['ㅅ', 'ㅕ', 'ㅎ', 'ㅗ'],
  'ㅕ': ['ㅛ', 'ㅑ', 'ㅗ', 'ㅓ'],
  'ㅑ': ['ㅕ', 'ㅐ', 'ㅓ', 'ㅏ'],
  'ㅐ': ['ㅑ', 'ㅔ', 'ㅏ', 'ㅣ'],
  'ㅔ': ['ㅐ', 'ㅣ'],
  // ... 전체 매핑
  'ㅜ': ['ㅠ', 'ㅡ', 'ㅗ', 'ㅓ'],
  'ㅠ': ['ㅍ', 'ㅜ', 'ㅎ', 'ㅗ'],
};
```

### 4.2 자모 기반 편집 거리

```typescript
/**
 * 한글을 자모 단위로 분해
 * "분석" → ['ㅂ','ㅜ','ㄴ','ㅅ','ㅓ','ㄱ']
 */
function decomposeToJamos(text: string): string[] {
  const jamos: string[] = [];

  for (const char of text) {
    if (isHangulSyllable(char)) {
      const code = char.charCodeAt(0) - 0xAC00;
      const cho = Math.floor(code / 588);
      const jung = Math.floor((code % 588) / 28);
      const jong = code % 28;

      jamos.push(CHOSEONG[cho]);
      jamos.push(JUNGSEONG[jung]);
      if (jong > 0) jamos.push(JONGSEONG[jong]);
    } else {
      jamos.push(char);
    }
  }

  return jamos;
}

/**
 * 자모 편집 거리 (키보드 가중치 적용)
 */
function jamoEditDistance(word1: string, word2: string): number {
  const jamos1 = decomposeToJamos(word1);
  const jamos2 = decomposeToJamos(word2);

  const m = jamos1.length;
  const n = jamos2.length;

  const dp: number[][] = Array(m + 1).fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (jamos1[i-1] === jamos2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        // 인접 키 오타는 비용 0.5
        const isAdjacent = ADJACENT_KEYS[jamos1[i-1]]?.includes(jamos2[j-1]);
        const substituteCost = isAdjacent ? 0.5 : 1;

        // 쌍자음 실수는 비용 0.3
        const isDoubleConso = isDoubleConsonantMistake(jamos1[i-1], jamos2[j-1]);
        const actualCost = isDoubleConso ? 0.3 : substituteCost;

        dp[i][j] = Math.min(
          dp[i-1][j] + 1,           // 삭제
          dp[i][j-1] + 1,           // 삽입
          dp[i-1][j-1] + actualCost // 대체
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 쌍자음 실수 확인
 */
function isDoubleConsonantMistake(jamo1: string, jamo2: string): boolean {
  const pairs: [string, string][] = [
    ['ㄱ', 'ㄲ'], ['ㄷ', 'ㄸ'], ['ㅂ', 'ㅃ'],
    ['ㅅ', 'ㅆ'], ['ㅈ', 'ㅉ'],
  ];

  return pairs.some(([a, b]) =>
    (jamo1 === a && jamo2 === b) || (jamo1 === b && jamo2 === a)
  );
}
```

### 4.3 후보 생성 및 점수 계산

```typescript
interface TypoCandidate {
  word: string;
  distance: number;
  keyboardScore: number;
  frequency: number;
  contextScore: number;
  totalScore: number;
}

/**
 * 오타 교정 후보 생성
 */
function generateCandidates(
  typo: string,
  dictionary: Set<string>,
  maxDistance: number = 2
): TypoCandidate[] {
  const candidates: TypoCandidate[] = [];

  for (const word of dictionary) {
    // 길이 필터 (최적화)
    if (Math.abs(word.length - typo.length) > maxDistance) continue;

    const distance = jamoEditDistance(typo, word);

    if (distance <= maxDistance) {
      candidates.push({
        word,
        distance,
        keyboardScore: calculateKeyboardSimilarity(typo, word),
        frequency: getWordFrequency(word),
        contextScore: 0,
        totalScore: 0,
      });
    }
  }

  return candidates;
}

/**
 * 종합 점수 계산
 */
function calculateTotalScore(candidate: TypoCandidate): number {
  const distanceScore = 1 / (1 + candidate.distance);
  const keyboardScore = candidate.keyboardScore;
  const freqScore = Math.log(candidate.frequency + 1) / 10;
  const contextScore = (candidate.contextScore + 20) / 40;

  return (
    distanceScore * 0.35 +
    keyboardScore * 0.20 +
    freqScore * 0.15 +
    contextScore * 0.30
  );
}
```

---

## 5. 한영 전환 오류 처리

```typescript
// 영문 → 한글 변환 테이블
const EN_TO_KO: Record<string, string> = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
  'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
  'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ',
  'n': 'ㅜ', 'm': 'ㅡ',
  'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ',
  'O': 'ㅒ', 'P': 'ㅖ',
};

/**
 * 영문을 한글로 변환
 * "dkssud" → "안녕"
 */
function convertEnglishToKorean(text: string): string | null {
  if (!/^[a-zA-Z]+$/.test(text)) return null;

  const jamos: string[] = [];
  for (const char of text) {
    const jamo = EN_TO_KO[char];
    if (!jamo) return null;
    jamos.push(jamo);
  }

  return composeJamos(jamos);
}
```

---

## 6. 빈번한 오타 사전

```typescript
export const commonTypos: Record<string, string> = {
  // === 띄어쓰기 오류 ===
  '할수있다': '할 수 있다',
  '할수없다': '할 수 없다',
  '할수있는': '할 수 있는',
  '할수있게': '할 수 있게',
  '할수있어': '할 수 있어',
  '할수있을': '할 수 있을',

  '하고있다': '하고 있다',
  '하고있는': '하고 있는',
  '하고있어': '하고 있어',
  '먹고있다': '먹고 있다',
  '보고있다': '보고 있다',

  '가고싶다': '가고 싶다',
  '하고싶다': '하고 싶다',
  '먹고싶다': '먹고 싶다',
  '보고싶다': '보고 싶다',

  '하지않다': '하지 않다',
  '가지않다': '가지 않다',
  '먹지않다': '먹지 않다',
  '하지못하다': '하지 못하다',

  '해야한다': '해야 한다',
  '가야한다': '가야 한다',
  '먹어야한다': '먹어야 한다',

  '하는것': '하는 것',
  '먹는것': '먹는 것',
  '가는것': '가는 것',
  '할것': '할 것',
  '먹을것': '먹을 것',

  '할때': '할 때',
  '갈때': '갈 때',
  '먹을때': '먹을 때',
  '올때': '올 때',

  '그리고나서': '그리고 나서',
  '하면서도': '하면서도',  // 이건 맞음

  // === 발음 혼동 ===
  '되요': '돼요',
  '되서': '돼서',
  '됬다': '됐다',
  '됬어': '됐어',
  '되었다': '됐다', // 축약 권장

  '않해': '안 해',
  '않된다': '안 된다',

  '몰겠다': '모르겠다',
  '모르겟다': '모르겠다',

  '같애': '같아',
  '틀리다': '다르다', // 문맥에 따라

  // === 받침 실수 ===
  '먹엇다': '먹었다',
  '갔엇다': '갔었다',
  '했엇다': '했었다',
  '봤엇다': '봤었다',

  '읽엇다': '읽었다',
  '없엇다': '없었다',
  '있엇다': '있었다',

  // === 자모 오타 ===
  '않녕': '안녕',
  '갑사합니다': '감사합니다',
  '수곻합니다': '수고합니다',

  // === 쌍자음 실수 ===
  '빠르게': '빠르게',  // 맞음
  '빨리': '빨리',      // 맞음
  '발리': '빨리',      // 오타
  '바리': '빨리',      // 오타
};

// 혼동 쌍 (문맥으로 판단 필요)
export const confusablePairs: { pair: [string, string]; rule: string }[] = [
  { pair: ['되', '돼'], rule: '"하여"로 바꿔서 자연스러우면 "돼"' },
  { pair: ['로서', '로써'], rule: '자격=로서, 수단=로써' },
  { pair: ['로', '으로'], rule: '받침 없음=로, 받침 있음(ㄹ제외)=으로' },
  { pair: ['든지', '던지'], rule: '선택=든지, 과거회상=던지' },
  { pair: ['데', '대'], rule: '장소/상황=데, 말하기=대' },
  { pair: ['애', '에'], rule: '표준어 구분 필요' },
  { pair: ['왠', '웬'], rule: '왠지(왜인지), 웬(어찌된)' },
];
```

---

## 7. 통합 교정 함수

```typescript
export interface CorrectionResult {
  original: string;
  corrected: string;
  corrections: {
    type: 'spacing' | 'jamo' | 'hangul-english' | 'common';
    position: number;
    original: string;
    corrected: string;
    confidence: number;
  }[];
  overallConfidence: number;
}

/**
 * 통합 오타/띄어쓰기 교정
 */
export function correctAll(
  text: string,
  options: {
    dictionary: Set<string>;
    ngramModel: NGramModel;
    spacingModel: SpacingModel;
  }
): CorrectionResult {
  const corrections: CorrectionResult['corrections'] = [];
  let result = text;

  // 1. 빈번한 오타 먼저 처리
  for (const [typo, correct] of Object.entries(commonTypos)) {
    if (result.includes(typo)) {
      const pos = result.indexOf(typo);
      corrections.push({
        type: 'common',
        position: pos,
        original: typo,
        corrected: correct,
        confidence: 0.95,
      });
      result = result.replace(typo, correct);
    }
  }

  // 2. 한영 전환 오류 처리
  const words = result.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/^[a-zA-Z]+$/.test(word)) {
      const converted = convertEnglishToKorean(word);
      if (converted && options.dictionary.has(converted)) {
        corrections.push({
          type: 'hangul-english',
          position: i,
          original: word,
          corrected: converted,
          confidence: 0.9,
        });
        words[i] = converted;
      }
    }
  }
  result = words.join(' ');

  // 3. 띄어쓰기 교정
  const spacingResult = correctSpacing(result, options.spacingModel);
  if (spacingResult.corrected !== result) {
    corrections.push({
      type: 'spacing',
      position: 0,
      original: result,
      corrected: spacingResult.corrected,
      confidence: spacingResult.confidence,
    });
    result = spacingResult.corrected;
  }

  // 4. 자모 오타 교정 (단어별)
  const correctedWords = result.split(/\s+/);
  for (let i = 0; i < correctedWords.length; i++) {
    const word = correctedWords[i];

    if (!options.dictionary.has(word)) {
      const candidates = generateCandidates(word, options.dictionary, 2);

      if (candidates.length > 0) {
        // 문맥 점수 계산
        const prevWord = i > 0 ? correctedWords[i-1] : null;
        const nextWord = i < correctedWords.length - 1 ? correctedWords[i+1] : null;
        calculateContextScore(candidates, prevWord, nextWord, options.ngramModel);

        // 최적 후보 선택
        const best = selectBestCandidate(candidates);
        if (best && best.totalScore >= 0.6) {
          corrections.push({
            type: 'jamo',
            position: i,
            original: word,
            corrected: best.word,
            confidence: best.totalScore,
          });
          correctedWords[i] = best.word;
        }
      }
    }
  }

  result = correctedWords.join(' ');

  // 전체 확신도 계산
  const avgConfidence = corrections.length > 0
    ? corrections.reduce((sum, c) => sum + c.confidence, 0) / corrections.length
    : 1.0;

  return {
    original: text,
    corrected: result,
    corrections,
    overallConfidence: avgConfidence,
  };
}

/**
 * 띄어쓰기 교정 메인 함수
 */
function correctSpacing(
  text: string,
  model: SpacingModel
): { corrected: string; confidence: number } {
  let result = text;
  let confidence = 1.0;

  // 1. 의존명사 규칙 적용
  result = correctDependencyNounSpacing(result);

  // 2. 보조용언 규칙 적용
  const auxResult = correctAuxiliaryVerbSpacing(result);
  result = auxResult.corrected;
  confidence *= auxResult.confidence;

  // 3. 조사 붙여쓰기 규칙 적용
  result = correctParticleSpacing(result);

  // 4. N-gram 기반 추가 교정
  const predictions = predictSpacing(result, model);
  result = applySpacingPredictions(result, predictions);

  return { corrected: result, confidence };
}
```

---

## 8. 번역 파이프라인 통합

### 8.1 수정된 translator-service.ts

```typescript
import { correctAll } from './typo';

export function translate(input: string, direction: TranslationDirection): string {
  let normalized = normalize(input);

  // 0. 오타 및 띄어쓰기 교정 (한→영만)
  if (direction === 'ko-en') {
    const correctionResult = correctAll(normalized, {
      dictionary: koreanDictionary,
      ngramModel,
      spacingModel,
    });

    if (correctionResult.overallConfidence >= 0.7) {
      normalized = correctionResult.corrected;
      // 디버깅용 로그
      if (correctionResult.corrections.length > 0) {
        console.log('[교정]', correctionResult.corrections);
      }
    }
  }

  // 기존 번역 로직...
  if (direction === 'ko-en') {
    return translateKoToEn(normalized);
  }
  return translateEnToKo(normalized);
}
```

---

## 9. 테스트 계획

### 9.1 테스트 케이스

```typescript
describe('Typo & Spacing Correction', () => {
  // === 띄어쓰기 교정 ===
  describe('띄어쓰기', () => {
    test('할수있다 → 할 수 있다', () => {
      expect(correctSpacing('할수있다')).toBe('할 수 있다');
    });

    test('하고있다 → 하고 있다', () => {
      expect(correctSpacing('하고있다')).toBe('하고 있다');
    });

    test('가고싶다 → 가고 싶다', () => {
      expect(correctSpacing('가고싶다')).toBe('가고 싶다');
    });

    test('하지않다 → 하지 않다', () => {
      expect(correctSpacing('하지않다')).toBe('하지 않다');
    });

    test('먹을것 → 먹을 것', () => {
      expect(correctSpacing('먹을것')).toBe('먹을 것');
    });

    test('갈때 → 갈 때', () => {
      expect(correctSpacing('갈때')).toBe('갈 때');
    });

    // 과도한 띄어쓰기
    test('학교 에 → 학교에', () => {
      expect(correctSpacing('학교 에')).toBe('학교에');
    });
  });

  // === 자모 오타 ===
  describe('자모 오타', () => {
    test('뷴석 → 분석', () => {
      expect(correctTypo('뷴석')).toBe('분석');
    });

    test('분셕 → 분석', () => {
      expect(correctTypo('분셕')).toBe('분석');
    });

    test('맥락 뷴석하기 → 맥락 분석하기', () => {
      expect(correctAll('맥락 뷴석하기')).toBe('맥락 분석하기');
    });
  });

  // === 한영 전환 ===
  describe('한영 전환', () => {
    test('dkssud → 안녕', () => {
      expect(convertEnglishToKorean('dkssud')).toBe('안녕');
    });

    test('rksrmf → 공부', () => {
      expect(convertEnglishToKorean('rhdqn')).toBe('공부');
    });
  });

  // === 복합 오타 ===
  describe('복합 오타', () => {
    test('할수잇다 → 할 수 있다', () => {
      expect(correctAll('할수잇다')).toBe('할 수 있다');
    });

    test('맥락분식하기 → 맥락 분석하기', () => {
      expect(correctAll('맥락분식하기')).toBe('맥락 분석하기');
    });
  });

  // === 되/돼 교정 ===
  describe('되/돼', () => {
    test('안되요 → 안돼요', () => {
      expect(correctTypo('안되요')).toBe('안돼요');
    });

    test('됬다 → 됐다', () => {
      expect(correctTypo('됬다')).toBe('됐다');
    });
  });
});
```

### 9.2 성능 지표

| 지표 | 목표 |
|-----|-----|
| 띄어쓰기 교정 정확도 | 90%+ |
| 자모 오타 감지율 | 85%+ |
| 자모 오타 교정 정확도 | 90%+ |
| 복합 오타 교정 정확도 | 80%+ |
| 오교정율 (False Positive) | 5% 이하 |
| 처리 속도 | < 100ms/문장 |

---

## 10. 구현 로드맵

| 단계 | 작업 | 우선순위 |
|-----|-----|---------|
| **Phase 1** | 빈번한 오타/띄어쓰기 사전 구축 | 높음 |
| **Phase 2** | 의존명사/보조용언 규칙 구현 | 높음 |
| **Phase 3** | 조사 붙여쓰기 규칙 구현 | 높음 |
| **Phase 4** | 키보드 거리 및 자모 편집 거리 | 높음 |
| **Phase 5** | 후보 생성 및 점수 계산 | 높음 |
| **Phase 6** | 한영 전환 오류 처리 | 중간 |
| **Phase 7** | N-gram 띄어쓰기 모델 | 중간 |
| **Phase 8** | 문맥 점수 계산 | 중간 |
| **Phase 9** | 번역 파이프라인 통합 | 높음 |
| **Phase 10** | 테스트 및 튜닝 | 높음 |
| **Phase 11** | 성능 최적화 (BK-Tree) | 낮음 |

---

## 11. 예상 효과

| 입력 | 기존 결과 | 교정 후 |
|-----|---------|--------|
| 맥락 뷴석하기 | 번역 실패 | 맥락 분석하기 → context analysis |
| 맥락분식하기 | 맥락분식하기 (오역) | 맥락 분석하기 → context analysis |
| 할수있다 | 할수있다 (오역) | 할 수 있다 → can do |
| dkssud | 번역 실패 | 안녕 → Hello |
| 안되요 | 안되요 (오역) | 안돼요 → No way |
| 먹을것 | 먹을것 (오역) | 먹을 것 → something to eat |

---

## 12. 결론

### 12.1 핵심 알고리즘

1. **규칙 기반 띄어쓰기** - 의존명사, 보조용언, 조사 규칙
2. **N-gram 띄어쓰기** - 통계 기반 어절 경계 예측
3. **자모 편집 거리** - 키보드 가중치 적용
4. **문맥 점수** - 앞뒤 단어와의 자연스러움 평가
5. **복합 교정** - 띄어쓰기 + 자모 오타 동시 처리

### 12.2 커버리지

| 오류 유형 | 예상 커버리지 |
|---------|-------------|
| 의존명사 띄어쓰기 | 95%+ |
| 보조용언 띄어쓰기 | 90%+ |
| 인접 키 자모 오타 | 85%+ |
| 한영 전환 오류 | 90%+ |
| 복합 오타 | 80%+ |

---

*본 보고서는 한국어 오타 및 띄어쓰기 교정 알고리즘 구현을 위한 확장된 기술 계획서입니다.*
