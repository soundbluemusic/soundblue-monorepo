# 번역기 자모/음절 분석 구현 문서

**상태: ✅ 구현 완료**

> **구현 파일:**
> - `src/tools/translator/hangul/jamo.ts` - 자모 분해/조합 ✅
> - `src/tools/translator/hangul/syllable.ts` - 음절 분석 ✅
> - `src/tools/translator/hangul/phonetics.ts` - 음운 규칙 ✅
> - `src/tools/translator/hangul/irregulars.ts` - 불규칙 활용 사전 ✅
> - `src/tools/translator/hangul/index.ts` - 배럴 export ✅
> - `src/tools/translator/hangul/jamo.test.ts` - 테스트 ✅

## 구현된 파일 구조

```
src/tools/translator/
├── hangul/
│   ├── index.ts         # 배럴 export
│   ├── jamo.ts          # 자모 분해/조합 ✅
│   ├── jamo.test.ts     # 테스트 ✅
│   ├── syllable.ts      # 음절 분석 ✅
│   ├── phonetics.ts     # 음운 규칙 ✅
│   └── irregulars.ts    # 불규칙 활용 사전 ✅
└── translator-service.ts # 통합 완료 ✅
```

---

## 1단계: 자모 분해/조합 (`hangul/jamo.ts`)

```typescript
// 유니코드 상수
const HANGUL_START = 0xAC00;  // '가'
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

// 분해: '한' → { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' }
export function decompose(char: string): Jamo | null

// 조합: { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' } → '한'
export function compose(jamo: Jamo): string

// 받침 유무: '집' → true, '나' → false
export function hasBatchim(char: string): boolean
```

---

## 2단계: 조사 자동 선택

```typescript
// hasBatchim() 활용
function selectParticle(word: string, type: 'subject' | 'object' | 'topic') {
  const last = word[word.length - 1];
  const hasFinal = hasBatchim(last);

  switch (type) {
    case 'subject': return hasFinal ? '이' : '가';
    case 'object':  return hasFinal ? '을' : '를';
    case 'topic':   return hasFinal ? '은' : '는';
  }
}
```

---

## 3단계: 불규칙 활용 (`dictionary/irregulars.ts`)

```typescript
export const irregulars = {
  // ㄷ불규칙: 받침 ㄷ → ㄹ (모음 어미 앞)
  ㄷ: ['듣', '걷', '묻', '싣', '깨닫'],

  // ㅂ불규칙: 받침 ㅂ → 우 (모음 어미 앞)
  ㅂ: ['돕', '곱', '덥', '춥', '아름답', '어렵'],

  // ㅎ불규칙: ㅎ 탈락 (모음 어미 앞)
  ㅎ: ['파랗', '노랗', '빨갛', '하얗'],

  // 르불규칙: 르 → ㄹㄹ
  르: ['빠르', '다르', '모르', '부르'],
};
```

---

## 4단계: 음운 규칙 (`hangul/phonetics.ts`)

```typescript
// 연음화: 받침이 다음 음절 초성으로
// '음악을' → 발음 [으마글]
export function applyLiaison(text: string): string

// 경음화: ㄱㄷㅂ + ㄱㄷㅂㅅㅈ → 된소리
// '학교' → [학꾜]
export function applyFortition(text: string): string

// 비음화: ㄱㄷㅂ + ㄴㅁ → ㅇㄴㅁ
// '국물' → [궁물]
export function applyNasalization(text: string): string
```

---

## 5단계: translator-service.ts 수정

```typescript
// 기존: 단순 문자열 슬라이싱
const stem = word.slice(0, -p.length);

// 개선: 자모 분석 + 불규칙 처리
function extractStem(word: string, ending: string): string {
  const stem = word.slice(0, -ending.length);
  const lastChar = stem[stem.length - 1];
  const jamo = decompose(lastChar);

  // 불규칙 확인 및 원형 복원
  if (isIrregular(stem, 'ㄷ') && startsWithVowel(ending)) {
    return restoreIrregular(stem, 'ㄷ');  // 들 → 듣
  }
  return stem;
}
```

---

## 구현 순서 (권장)

| 순서 | 작업 | 효과 |
|-----|------|-----|
| 1 | `jamo.ts` 자모 분해/조합 | 모든 기능의 기반 |
| 2 | `hasBatchim()` + 조사 선택 | 즉시 번역 품질 향상 |
| 3 | `irregulars.ts` 불규칙 사전 | 동사/형용사 활용 정확도 |
| 4 | `phonetics.ts` 음운 규칙 | 발음/음차 번역 지원 |

---

## 예상 효과

```
Before: '학교에서 공부를 했어요' → 형태소 분리 실패
After:  '학교에서 공부를 했어요'
        → 학교 + 에서 / 공부 + 를 / 하 + 았어요
        → 'I studied at school'
```

*작성일: 2025-12-14*
