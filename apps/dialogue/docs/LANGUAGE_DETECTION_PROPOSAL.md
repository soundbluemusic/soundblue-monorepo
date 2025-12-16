# Dialogue 앱 언어 감지 방식 제안서

## 현재 시스템 분석

### 현재 동작 방식
```
URL 경로 → locale 결정 → 해당 locale 데이터만 검색/응답
```

| URL | locale | 응답 언어 |
|-----|--------|----------|
| `/` | `en` | 영어만 |
| `/ko` | `ko` | 한국어만 |
| `/ja` | `ja` | 일본어만 |

### 현재 문제점
1. 영어 페이지(`/`)에서 한국어 입력 시 → 매칭 실패 → "검색 결과가 없습니다"
2. 사용자가 페이지를 직접 이동해야 함
3. 혼합 언어 입력 처리 불가

---

## 제안 방식: 입력 언어 자동 감지

### 핵심 아이디어
```
입력 텍스트 분석 → 언어 비율 계산 → 50% 기준으로 응답 언어 결정
```

### 언어 감지 알고리즘

#### 1단계: 문자 유형 분류
```typescript
// 한국어 (한글)
const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g;

// 일본어 (히라가나 + 카타카나)
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF]/g;

// 영어 (알파벳)
const ENGLISH_REGEX = /[a-zA-Z]/g;
```

#### 2단계: 비율 계산
```typescript
function detectLanguage(text: string): 'ko' | 'en' | 'ja' {
  const koreanChars = (text.match(KOREAN_REGEX) || []).length;
  const japaneseChars = (text.match(JAPANESE_REGEX) || []).length;
  const englishChars = (text.match(ENGLISH_REGEX) || []).length;
  const totalChars = koreanChars + japaneseChars + englishChars;

  if (totalChars === 0) return 'en'; // 기본값

  const koreanRatio = koreanChars / totalChars;
  const japaneseRatio = japaneseChars / totalChars;
  const englishRatio = englishChars / totalChars;

  // 50% 이상인 언어로 결정
  if (koreanRatio >= 0.5) return 'ko';
  if (japaneseRatio >= 0.5) return 'ja';
  return 'en';
}
```

### 예시 케이스

| 입력 | 한글 비율 | 영어 비율 | 감지 결과 | 응답 언어 |
|------|----------|----------|----------|----------|
| `안녕하세요` | 100% | 0% | `ko` | 한국어 |
| `hi` | 0% | 100% | `en` | 영어 |
| `하이` | 100% | 0% | `ko` | 한국어 |
| `hello 안녕` | 40% | 60% | `en` | 영어 |
| `안녕 hello` | 40% | 60% | `en` | 영어 |
| `오늘 날씨 how` | 67% | 33% | `ko` | 한국어 |
| `what time 지금` | 33% | 67% | `en` | 영어 |

---

## 구현 옵션 비교

### Option A: 입력 언어만 감지 (URL 무시)
```
입력 → 언어 감지 → 해당 언어로 응답
```

**장점:**
- 가장 자연스러운 UX
- 페이지 이동 불필요
- 구현 간단

**단점:**
- URL과 실제 언어가 불일치할 수 있음
- 기존 locale 기반 로직 수정 필요

### Option B: 입력 언어 감지 + 페이지 리다이렉트
```
입력 → 언어 감지 → 해당 언어 페이지로 이동 → 응답
```

**장점:**
- URL과 언어 일관성 유지
- SEO 친화적

**단점:**
- 페이지 전환으로 인한 UX 저하
- 채팅 히스토리 처리 복잡

### Option C: 하이브리드 (입력 우선, URL 폴백)
```
입력 → 언어 감지 시도 →
  감지 성공: 해당 언어로 응답
  감지 실패: URL locale로 응답
```

**장점:**
- 유연한 대응
- 기존 시스템과 호환

**단점:**
- 일관성 부족 가능성

---

## 권장안: Option A (입력 언어만 감지)

### 이유
1. **오프라인 학습 도구**의 특성상 SEO보다 UX가 중요
2. 사용자 의도를 가장 잘 반영
3. 구현 및 유지보수 간단

### 구현 계획

#### 변경 파일
```
apps/dialogue/src/
├── lib/
│   └── language-detector.ts  # 새로 생성
├── components/
│   └── Chat.tsx              # 수정
└── lib/
    ├── handlers.ts           # 수정 (locale 파라미터 변경)
    └── search.ts             # 수정 (locale 파라미터 변경)
```

#### 코드 변경 요약

**1. language-detector.ts (신규)**
```typescript
export type DetectedLocale = 'ko' | 'en' | 'ja';

export function detectLanguage(text: string): DetectedLocale {
  // 위의 알고리즘 구현
}
```

**2. Chat.tsx (수정)**
```typescript
// Before
const dynamicResult = handleDynamicQuery(content, locale());
const results = searchKnowledge(content, locale());

// After
import { detectLanguage } from '~/lib/language-detector';

const detectedLocale = detectLanguage(content);
const dynamicResult = handleDynamicQuery(content, detectedLocale);
const results = searchKnowledge(content, detectedLocale);
```

### 예상 영향

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| 영어 페이지에서 한국어 입력 | 실패 | 한국어로 응답 |
| 한국어 페이지에서 영어 입력 | 실패 | 영어로 응답 |
| 혼합 언어 입력 | 실패 | 다수 언어로 응답 |
| UI 언어 | URL 기반 유지 | URL 기반 유지 (변경 없음) |

---

## 추가 고려사항

### 1. 숫자/특수문자 처리
- 숫자, 공백, 특수문자는 언어 판별에서 제외
- `123`, `!!!` 같은 입력은 기본값(en) 사용

### 2. 외래어/로마자 표기 한국어
| 입력 | 처리 방식 |
|------|----------|
| `하이` | 한글 → 한국어 |
| `annyeong` | 영어 알파벳 → 영어 |
| `ㅎㅇ` | 한글 자모 → 한국어 |

### 3. 한자 처리
- 한자는 한국어/일본어 공통이므로 별도 처리 필요
- 히라가나/카타카나 동반 시 → 일본어
- 한글 동반 시 → 한국어
- 단독 사용 시 → URL locale 폴백

### 4. 임계값 조정
- 현재 제안: 50%
- 더 엄격하게: 60-70% (확실한 경우만 전환)
- 더 느슨하게: 30-40% (적극적 전환)

---

## 결론

**권장 구현:**
- Option A (입력 언어 자동 감지)
- 50% 임계값 사용
- UI 언어는 URL 기반 유지

**예상 작업량:**
- 신규 파일 1개 (`language-detector.ts`)
- 수정 파일 1개 (`Chat.tsx`)
- 예상 코드 변경: ~50줄

**테스트 케이스:**
1. 영어 페이지에서 `안녕하세요` → 한국어 응답
2. 한국어 페이지에서 `hello` → 영어 응답
3. `오늘 weather` → 한국어 응답 (한글 67%)
4. `what 시간` → 영어 응답 (영어 67%)
