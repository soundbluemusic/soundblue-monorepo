# 번역기 알고리즘 분석 보고서

**상태: ⚠️ 이 문서는 최초 작성 시점(2024-12-14) 기준이며, 이후 구현이 완료되었습니다.**

## 개요

현재 `src/tools/translator/` 번역기 도구의 알고리즘 구조를 분석하고, 자모 수준(ㄱ,ㄴ,ㄷ / a,b,c)까지의 완전 분리 알고리즘 존재 여부를 확인한 보고서입니다.

---

## 현재 구현된 번역 계층 구조

```
Level 1: 문장 (Sentence)        ✅ 구현됨
    ↓
Level 2: 패턴 (Pattern)         ✅ 구현됨
    ↓
Level 3: 형태소 (Morpheme)      ✅ 구현됨 (grammar/morpheme-analyzer.ts)
    ↓
Level 4: 음절 (Syllable)        ✅ 구현됨 (hangul/syllable.ts)
    ↓
Level 5: 자모 (Jamo)            ✅ 구현됨 (hangul/jamo.ts)
         ㄱ,ㄴ,ㄷ / a,b,c
```

---

## 각 계층별 상세 분석

### Level 1: 문장 완전 일치 ✅

**파일**: `dictionary/sentences.ts`

```typescript
// 한→영 67개, 영→한 자동 생성
export const koToEnSentences: Record<string, string> = {
  '안녕하세요': 'Hello',
  '감사합니다': 'Thank you',
  // ...
};
```

**동작**: 입력 문장이 사전에 정확히 일치하면 바로 번역 반환

---

### Level 2: 패턴 매칭 ✅

**파일**: `dictionary/patterns.ts`

```typescript
export const koToEnPatterns: PatternEntry[] = [
  { ko: /^(.+)하고 싶어요$/, en: 'I want to $1' },
  { ko: /^(.+)해 주세요$/, en: 'Please $1' },
  // ...38개 패턴
];
```

**동작**: 정규표현식으로 문장 구조를 매칭하고 캡처 그룹을 단어 사전으로 번역

---

### Level 3: 형태소 분석 ⚠️ 부분 구현

**파일**: `dictionary/morphemes.ts`, `translator-service.ts`

#### 구현된 것:
- **조사(Particles)** 12개: 은/는/이/가/을/를/에/에서/로/으로/와/과/의
- **어미(Endings)** 15개: 아요/어요/습니다/았어요/었어요 등

#### 구현 방식:
```typescript
// translator-service.ts:137-149
function tryExtractParticle(word: string) {
  for (const p of particleList) {
    if (word.endsWith(p) && word.length > p.length) {
      const stem = word.slice(0, -p.length);  // 단순 문자열 슬라이싱
      // ...
    }
  }
}
```

#### 문제점:
1. **단순 문자열 매칭**만 사용 - 음운 변화 미고려
2. **불규칙 활용** 처리 없음 (예: 듣다→들어요, 걷다→걸어요)
3. **받침에 따른 조사 변화** 미처리 (예: 이/가, 은/는, 을/를)

---

### Level 4: 음절 분석 ✅ 구현됨

**파일**: `hangul/syllable.ts`

```typescript
// 구현된 함수들
export function analyzeSyllables(text: string): SyllableInfo[];
export function applyLiaison(syllables: SyllableInfo[]): string;
export function getSyllableType(syllable: string): SyllableType;
```

---

### Level 5: 자모 분리 (ㄱ,ㄴ,ㄷ / a,b,c) ✅ 구현됨

**파일**: `hangul/jamo.ts` (274줄)

**구현된 기능**:

#### 한글 자모 분리:
```typescript
// 구현됨 - hangul/jamo.ts
interface Jamo {
  cho: string;   // 초성 (ㄱ,ㄴ,ㄷ,ㄹ,ㅁ,ㅂ,ㅅ,ㅇ,ㅈ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ + 쌍자음)
  jung: string;  // 중성 (ㅏ,ㅑ,ㅓ,ㅕ,ㅗ,ㅛ,ㅜ,ㅠ,ㅡ,ㅣ + 복합모음)
  jong: string;  // 종성 (받침, 없을 수 있음)
}

export function decompose(char: string): Jamo;  // '한' → { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' }
export function compose(jamo: Jamo): string;    // { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' } → '한'
export function hasBatchim(word: string): boolean;
export function getLastBatchim(word: string): string | null;
  // '글' → { cho: 'ㄱ', jung: 'ㅡ', jong: 'ㄹ' }
}

function composeHangul(jamo: Jamo): string {
  // { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' } → '한'
}
```

#### 영어 알파벳 분석:
```typescript
// 미구현 - 필요한 함수들
interface EnglishPhoneme {
  letters: string[];
  pronunciation: string;  // IPA or similar
}

function analyzeEnglishWord(word: string): EnglishPhoneme[] {
  // 'hello' → [{ letters: ['h'], ... }, { letters: ['e'], ... }, ...]
}
```

---

## 자모 분리가 필요한 이유

### 1. 음운 규칙 적용
```
현재 문제:
'독립' + '을' → '독립을' (단순 연결)

자모 분석 적용시:
'독립' → [ㄷ,ㅗ,ㄱ] [ㄹ,ㅣ,ㅂ]
종성 'ㅂ' 확인 → 조사 '을' 선택 (자동)
```

### 2. 불규칙 활용 처리
```
현재 문제:
'듣' + '어요' → '듣어요' (틀림)

자모 분석 적용시:
'듣' → [ㄷ,ㅡ,ㄷ]
ㄷ불규칙 감지 → 종성 'ㄷ' → 'ㄹ' 변환
'들' + '어요' → '들어요' (맞음)
```

### 3. 연음 처리
```
'음악을' 발음 → [으막글]
자모 분석으로 받침이 다음 음절 초성으로 이동하는 규칙 적용 가능
```

### 4. 외래어/음차 번역
```
'Michael' → '마이클'
알파벳 수준 분석 → 발음 규칙 → 한글 자모 조합
```

---

## 현재 코드의 한계점 요약

| 항목 | 상태 | 설명 |
|------|------|------|
| 자모 분해 함수 | ❌ | `decomposeHangul()` 없음 |
| 자모 조합 함수 | ❌ | `composeHangul()` 없음 |
| 유니코드 자모 처리 | ❌ | U+AC00~U+D7A3 범위 연산 없음 |
| 음운 변화 규칙 | ❌ | 연음, 경음화, 비음화 등 없음 |
| 불규칙 활용표 | ❌ | ㄷ불규칙, ㅂ불규칙, ㅎ불규칙 등 없음 |
| 받침별 조사 선택 | ❌ | 이/가, 은/는, 을/를 자동 선택 없음 |
| 영어 발음 분석 | ❌ | phoneme 분석 없음 |

---

## 결론

**확인 결과**: 번역기 도구에 **자모 수준(ㄱ,ㄴ,ㄷ / a,b,c)의 완전 분리 알고리즘은 구현되어 있지 않습니다.**

현재 구현은:
- 문장 → 패턴 → 단어 수준의 **매칭 기반** 번역
- 조사/어미의 **단순 문자열 분리** (음운 규칙 미적용)

자모 분리 알고리즘 구현시 추가될 기능:
1. 한글 유니코드 자모 분해/조합
2. 음운 변화 규칙 엔진
3. 불규칙 활용 처리
4. 조사 자동 선택 (받침 기반)
5. 외래어 음차 변환

---

*분석일: 2025-12-14*
*분석 대상: `src/tools/translator/`*
