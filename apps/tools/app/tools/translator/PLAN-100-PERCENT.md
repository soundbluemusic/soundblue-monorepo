# 번역기 100% 테스트 통과 계획

## 📊 현재 상태
- **통과**: 265 / 388 (약 68%)
- **실패**: 123개

## 🎯 전략: ROI 기반 우선순위

테스트 유형별로 **1개 알고리즘 개선 → N개 테스트 통과** 효율을 기준으로 정렬.

---

## Phase 1: 사전 기반 (Low Effort, High Return)

### 1-1. localization-test (속담/관용구)
**파일**: `localization-test.test.ts`
**예상 실패**: ~15개
**해결 방법**:
- `idioms.ts`에 누락된 관용구 추가
- `cultural-expressions.ts` 파일 생성 (문화적 표현)

**추가할 표현**:
```typescript
// 한→영 속담
'티끌 모아 태산' → 'Every little bit counts'
'눈 감아주다' → 'let it slide'
'발 뻗고 자다' → 'sleep in peace'

// 영→한 관용구
'raining cats and dogs' → '비가 억수같이 쏟아지다'
'break a leg' → '대박 나라'
'piece of cake' → '누워서 떡 먹기'
```

**알고리즘 변경**: 최소 (사전 lookup 이미 구현됨)

---

### 1-2. professional-translator (키워드 매칭)
**파일**: `professional-translator.test.ts`
**예상 실패**: ~20개
**특징**: 70% 키워드 매칭 방식이라 부분 점수 가능

**해결 방법**:
- 화자 특성별 어휘 확장 (`context-analyzer.ts`)
- 캐릭터 말투 사전 추가

---

## Phase 2: 알고리즘 개선 (Medium Effort)

### 2-1. polysemy-test (다의어)
**파일**: `polysemy-test.test.ts`
**예상 실패**: ~30개
**해결 방법**:
- `nlp/wsd/polysemy-dict.ts` 확장
- 문맥 기반 의미 선택 규칙 추가

**핵심 다의어**:
```typescript
// 배: 신체/과일/배(선박)
// 차: 음료/자동차/차례
// 눈: 신체/날씨
// 말: 언어/동물
```

---

### 2-2. word-order-test (어순 변환)
**파일**: `word-order-test.test.ts`
**예상 실패**: ~40개
**해결 방법**:
- SVO↔SOV 변환 알고리즘 강화
- 부사구 위치 조정 규칙
- 복문 처리 개선

**난이도별**:
- Level 1 (5-7단어): 기본 어순 변환
- Level 2 (10-15단어): 부사구 위치
- Level 3 (20-30단어): 복문 처리
- Level 4 (40+단어): 극단적 복잡성

---

## Phase 3: 고급 알고리즘 (High Effort)

### 3-1. 문화적 맥락 번역
- 회식, 눈치, 세배 등 문화 특수 개념
- 의역 알고리즘 개선

### 3-2. 자막 압축
- 긴 문장 → 핵심만 추출
- 자막 제약 내 번역

---

## 📋 실행 순서

| 순서 | 대상 | 예상 공수 | 예상 통과 증가 |
|------|------|----------|--------------|
| 1 | idioms.ts 확장 | 30분 | +10 |
| 2 | cultural-expressions.ts 생성 | 1시간 | +5 |
| 3 | context-analyzer 확장 | 1시간 | +15 |
| 4 | polysemy-dict 확장 | 2시간 | +20 |
| 5 | word-order 알고리즘 | 3시간 | +30 |
| 6 | 문화적 맥락 | 2시간 | +10 |

---

## ⚠️ 금지 사항 (CLAUDE.md 준수)

1. ❌ 테스트 문장을 사전에 직접 추가 금지
2. ❌ 특정 문장만 통과하는 정규식 금지
3. ❌ 하드코딩 패턴 금지

✅ 일반화된 알고리즘만 사용
✅ 모든 유사 문장에 적용 가능한 규칙만 추가
