# SoundBlueMusic 문제점 해결 우선순위 계획서

**작성일:** 2025년 12월 15일
**버전:** 2.0 (문서 불일치 분석 반영)

> ⚠️ **중요:** 초기 분석 보고서가 **코드가 아닌 문서만 참조**하여 작성되었기 때문에
> 실제 구현 상태와 큰 차이가 있습니다. 상세 내용은 `docs/document-discrepancy-report.md` 참조.

---

## 1. 실태 재분석 결과

코드베이스 탐색 결과, 초기 분석 보고서와 실제 구현 상태에 **심각한 차이**가 있습니다.

### 1.1 번역기 - 예상보다 양호

| 기능 | 보고서 평가 | 실제 상태 |
|------|------------|----------|
| 복합어 분석 | ❌ 없음 | ✅ `compound-words.ts` 구현됨 |
| SOV→SVO 변환 | ❌ 없음 | ✅ `english-generator.ts`에 구현됨 |
| 서술격 조사 | ❌ 없음 | ✅ `copulas.ts` + 문법 파서 존재 |
| 불규칙 동사 | ❌ 없음 | ✅ 60+ 영어 불규칙 + 한국어 불규칙 |
| 주어 생략 처리 | ❌ 없음 | ✅ `subjectOmitted` 플래그로 처리 |
| WSD (다의어) | - | ✅ 50개 핵심 다의어 지원 |

**실제 문제:** 사전 커버리지 부족 (현재 ~1,000단어, 필요량 5,000-10,000단어)

### 1.2 WASM 엔진 - 예상보다 완성도 높음

| 컴포넌트 | 보고서 평가 | 실제 상태 |
|----------|------------|----------|
| Rust DSP 엔진 | ❌ TODO | ✅ 완전 구현 (`lib.rs` 등) |
| Oscillator | ❌ 없음 | ✅ 5가지 파형 + ADSR |
| Effects Chain | ❌ 없음 | ✅ EQ, 컴프레서, 딜레이 |
| FFT Analyzer | ❌ 없음 | ✅ RustFFT 기반 구현 |
| TypeScript 연동 | - | ⚠️ 주석 처리 상태 |

**실제 문제:** WASM 빌드 후 AudioWorklet 연동만 필요

### 1.3 "Coming Soon" 기능 - 대부분 이미 구현됨

`src/routes/built-with.tsx`에서 "Coming Soon"으로 표시되었지만 **실제로 구현된 기능들:**

| 기능 | 문서 상태 | 실제 상태 | 구현 파일 |
|------|----------|----------|-----------|
| IndexedDB | Coming Soon | ✅ 완전 구현 | `src/engine/storage.ts` |
| AudioWorklet | Coming Soon | ✅ 완전 구현 | `src/engine/worklet/audio-processor.ts` |
| WebMIDI API | Coming Soon | ✅ 완전 구현 | `src/engine/midi.ts` |
| Rust/WASM | Coming Soon | ⚠️ 코드 완성 | `rust/src/*.rs` |

**진짜 "Coming Soon"은 단 2개:**
- Pixi.js / WebGL
- TensorFlow.js

### 1.3 테스트 커버리지 - 부분적 우수

| 영역 | 테스트 파일 | 커버리지 |
|------|------------|----------|
| 번역기 | 6개 (150+ 테스트) | ~80-90% |
| 오디오 시스템 | 3개 | ~95% |
| UI 컴포넌트 | 0개 | 0% |
| 개별 도구 | 0개 | 0% |

---

## 2. 수정된 우선순위 매트릭스

### 2.1 평가 기준

| 기준 | 가중치 | 설명 |
|------|--------|------|
| 사용자 영향도 | 40% | 사용자가 직접 겪는 문제인가? |
| 구현 복잡도 | 30% | 얼마나 빨리 해결할 수 있는가? |
| 의존성 | 20% | 다른 기능이 이것에 의존하는가? |
| 기술 부채 | 10% | 장기적 유지보수에 영향이 있는가? |

### 2.2 우선순위 스코어링

| 문제 | 영향도 | 복잡도 | 의존성 | 부채 | **총점** |
|------|--------|--------|--------|------|----------|
| 번역기 사전 확장 | 40 | 24 | 16 | 8 | **88** |
| WASM 연동 활성화 | 32 | 27 | 12 | 6 | **77** |
| UI 테스트 추가 | 24 | 21 | 8 | 10 | **63** |
| 에러 추적 통합 | 28 | 18 | 8 | 8 | **62** |
| 문서 자동 동기화 | 16 | 24 | 4 | 10 | **54** |

---

## 3. 단계별 실행 계획

### Phase 0: 문서 정리 (즉시 - 1일) 🆕

**가장 먼저 실행해야 할 작업:** 잘못된 문서 수정

#### 0.1 built-with.tsx "Coming Soon" 섹션 수정

**파일:** `src/routes/built-with.tsx`

```typescript
// 변경 전
{
  titleKey: 'comingSoon',
  items: [
    { name: 'Pixi.js / WebGL', ... },
    { name: 'Rust + WebAssembly', ... },
    { name: 'AudioWorklet', ... },        // 실제로 구현됨!
    { name: 'WebMIDI API', ... },         // 실제로 구현됨!
    { name: 'TensorFlow.js', ... },
    { name: 'IndexedDB', ... },           // 실제로 구현됨!
  ],
}

// 변경 후: 구현된 기능을 별도 섹션으로 이동
```

#### 0.2 잘못된 문서 삭제/수정

| 파일 | 조치 |
|------|------|
| `docs/translator-improvement-needed.md` | 삭제 (잘못된 정보) |
| `docs/translator-typo-correction-plan.md` | "구현 완료" 표시 추가 |

#### 0.3 README.md, CLAUDE.md Tech Stack 업데이트

누락된 기술 추가:
- IndexedDB (Dexie)
- AudioWorklet
- WebMIDI API

---

### Phase 1: 번역기 품질 개선 (1-2주)

번역기는 아키텍처가 완성되어 있으므로, 데이터 확장에 집중합니다.

#### 1.1 사전 확장 (Day 1-5)

**목표:** 1,000 → 3,000 단어

| 카테고리 | 현재 | 목표 | 우선 추가 |
|----------|------|------|----------|
| 일상 명사 | ~400 | 1,200 | 가족, 음식, 장소, 시간 |
| 동사 | ~200 | 600 | 일상 동작, 감정 동사 |
| 형용사/부사 | ~150 | 450 | 상태, 정도 표현 |
| 전문 용어 | ~100 | 400 | IT, 음악, 비즈니스 |
| 관용표현 | ~150 | 350 | 일상 회화 표현 |

**작업 파일:**
```
src/tools/translator/dictionary/
├── words.ts          # 핵심 단어 확장
├── idioms.ts         # 관용표현 추가
└── sentences.ts      # 예문 패턴 추가
```

**완료 기준:**
- [ ] 벤치마크 A1-A2 테스트 90% 통과
- [ ] 기본 일상 대화 번역 가능

#### 1.2 문법 패턴 보강 (Day 6-10)

**목표:** 누락된 패턴 추가

| 패턴 | 현재 상태 | 작업 내용 |
|------|----------|----------|
| 연결어미 | 일부 구현 | -아서/-어서, -고, -면서 확장 |
| 종결어미 | 기본 구현 | -네요, -군요, -ㄹ게요 추가 |
| 보조용언 | 일부 구현 | -아/어 주다, -고 있다 패턴 |
| 존칭 시스템 | 기본 구현 | 더 세분화된 레벨 |

**완료 기준:**
- [ ] 벤치마크 A3 테스트 85% 통과
- [ ] 복문 번역 정확도 향상

---

### Phase 2: WASM 오디오 엔진 활성화 (1주)

Rust 코드는 완성되어 있으므로, 빌드 및 연동만 진행합니다.

#### 2.1 WASM 빌드 및 테스트 (Day 1-3)

```bash
# 1. WASM 빌드
pnpm wasm:build

# 2. 빌드 산출물 확인
ls src/engine/wasm/pkg/
```

**검증 항목:**
- [ ] `audio_engine.js` 생성 확인
- [ ] `audio_engine_bg.wasm` 생성 확인
- [ ] TypeScript 타입 정의 생성 확인

#### 2.2 AudioWorklet 연동 (Day 4-5)

**작업 파일:** `src/engine/worklet/audio-processor.ts`

```typescript
// 현재 (주석 처리됨)
// if (this.wasmEngine && this.isInitialized) {
//   this.wasmEngine.process(outputL, outputR);
// }

// 변경 후 (활성화)
if (this.wasmEngine && this.isInitialized) {
  this.wasmEngine.process(outputL, outputR);
}
```

**완료 기준:**
- [ ] WASM 모듈 워크렛에서 로드 성공
- [ ] 오디오 처리 정상 동작
- [ ] 메터링 데이터 정상 수신

#### 2.3 성능 비교 테스트 (Day 6-7)

| 메트릭 | JavaScript | WASM | 목표 |
|--------|-----------|------|------|
| FFT 처리 시간 | 측정 필요 | 측정 필요 | 50% 개선 |
| 버퍼 처리 지연 | 측정 필요 | 측정 필요 | 30% 개선 |
| CPU 사용률 | 측정 필요 | 측정 필요 | 20% 감소 |

---

### Phase 3: 테스트 & 품질 인프라 (1-2주)

#### 3.1 UI 컴포넌트 테스트 추가 (Day 1-5)

**우선순위 컴포넌트:**

| 컴포넌트 | 중요도 | 이유 |
|----------|--------|------|
| Button | 높음 | 가장 많이 사용 |
| Dialog | 높음 | 사용자 상호작용 핵심 |
| Slider | 중간 | 오디오 도구 필수 |
| Tabs | 중간 | 레이아웃 핵심 |

**테스트 파일 생성:**
```
src/components/ui/
├── button.test.tsx     # 신규
├── dialog.test.tsx     # 신규
├── slider.test.tsx     # 신규
└── tabs.test.tsx       # 신규
```

#### 3.2 개별 도구 테스트 추가 (Day 6-10)

| 도구 | 테스트 범위 |
|------|------------|
| Metronome | BPM 계산, 클릭 타이밍, UI 상태 |
| Drum Machine | 패턴 재생, 시퀀서 로직 |
| QR Generator | QR 인코딩, 에러 수정 레벨 |

#### 3.3 에러 추적 통합 (Day 11-14)

**선택 옵션:**

| 서비스 | 장점 | 단점 |
|--------|------|------|
| Sentry | 업계 표준, 풍부한 기능 | 유료 (무료 티어 있음) |
| LogRocket | 세션 리플레이 | 무거움 |
| 자체 구현 | 무료, 커스텀 | 개발 필요 |

**권장:** Sentry 무료 티어 (10K 이벤트/월)

**작업 파일:**
```typescript
// src/components/error-boundary.tsx
const reportError = (error: Error, info: ErrorInfo) => {
  // 현재: console.error만 호출
  // 변경: Sentry.captureException(error, { extra: info });
};
```

---

### Phase 4: 장기 개선 (2-3개월)

#### 4.1 번역기 고급 기능

| 기능 | 설명 | 복잡도 |
|------|------|--------|
| 다의어 확장 | 50 → 200개 | 중간 |
| NER | 고유명사 인식 | 높음 |
| 문맥 학습 | 이전 문장 참조 | 높음 |

#### 4.2 WebGL/Pixi.js 전환

현재 Canvas 2D → WebGL 렌더링으로 성능 개선

**영향 컴포넌트:**
- `src/components/visualizations/spectrum.tsx`
- `src/components/visualizations/waveform.tsx`
- `src/components/visualizations/vu-meter.tsx`

#### 4.3 WebMIDI 통합

`src/engine/midi.ts`는 이미 구현되어 있으므로, UI 통합만 필요

---

## 4. 리소스 요구사항

### 4.1 Phase 1 (번역기)
- **필요 시간:** 40-60시간
- **필요 기술:** 한국어 언어학, TypeScript
- **외부 의존성:** 없음

### 4.2 Phase 2 (WASM)
- **필요 시간:** 20-30시간
- **필요 기술:** Rust, WebAssembly, AudioWorklet
- **외부 의존성:** wasm-pack CLI

### 4.3 Phase 3 (테스트)
- **필요 시간:** 40-50시간
- **필요 기술:** Vitest, @testing-library, Playwright
- **외부 의존성:** Sentry (선택)

---

## 5. 위험 요소 및 완화 전략

| 위험 | 가능성 | 영향 | 완화 전략 |
|------|--------|------|----------|
| 사전 확장 품질 저하 | 중간 | 높음 | 네이티브 검수 프로세스 |
| WASM 브라우저 호환성 | 낮음 | 중간 | JS 폴백 유지 |
| 테스트 유지보수 비용 | 높음 | 중간 | 스냅샷 테스트 최소화 |

---

## 6. 성공 지표 (KPI)

### Phase 1 완료 조건
- [ ] 벤치마크 전체 통과율 75% → 90%
- [ ] 단어 사전 3,000개 이상
- [ ] 일상 대화 번역 사용자 만족도 4.0/5.0

### Phase 2 완료 조건
- [ ] WASM 빌드 자동화 완료
- [ ] 오디오 처리 지연 50% 개선
- [ ] 모든 주요 브라우저 호환 확인

### Phase 3 완료 조건
- [ ] 테스트 커버리지 60% 이상
- [ ] 에러 추적 시스템 운영 중
- [ ] CI/CD 파이프라인 테스트 통합

---

## 7. 일정 요약

```
Week 1-2:  Phase 1 - 번역기 품질 개선
           ├── Day 1-5: 사전 확장 (3,000단어)
           └── Day 6-10: 문법 패턴 보강

Week 3:    Phase 2 - WASM 활성화
           ├── Day 1-3: 빌드 및 검증
           ├── Day 4-5: AudioWorklet 연동
           └── Day 6-7: 성능 테스트

Week 4-5:  Phase 3 - 테스트 인프라
           ├── Day 1-5: UI 컴포넌트 테스트
           ├── Day 6-10: 도구 테스트
           └── Day 11-14: 에러 추적 통합

Week 6+:   Phase 4 - 장기 개선
           ├── 번역기 고급 기능
           ├── WebGL 전환
           └── WebMIDI UI 통합
```

---

## 8. 결론

### 8.1 핵심 발견

초기 보고서에서 "심각한 기능 미완성"으로 평가된 항목들의 상당수가 **실제로는 구현되어 있습니다:**

| 초기 평가 | 실제 상태 |
|----------|----------|
| "Coming Soon" 6개 | 실제 Coming Soon 2개 |
| 번역기 7개 기능 미구현 | 5개 이미 구현됨 |
| WASM 엔진 TODO | Rust 코드 완성 |

### 8.2 근본 원인

**문서가 코드 상태를 반영하지 않음:**
- 구현 완료 후 문서 업데이트 누락
- 초기 분석이 코드가 아닌 문서만 참조

### 8.3 수정된 핵심 문제

1. **번역기:** 아키텍처는 완성, **사전 데이터만 부족**
2. **WASM:** Rust 코드 완성, **연동 코드만 주석 처리**
3. **문서:** 코드와 **심각하게 불일치** (Phase 0에서 해결)
4. **테스트:** 번역기는 우수, **UI/도구는 미흡**

### 8.4 권장 실행 순서

```
Phase 0 (1일)   → 문서 정리 (즉시 실행)
Phase 1 (1-2주) → 번역기 사전 확장
Phase 2 (1주)   → WASM 연동 활성화
Phase 3 (1-2주) → 테스트 인프라
Phase 4 (장기)  → WebGL, 고급 기능
```

**예상 총 소요 시간:** 5-6주 (Phase 0-3)
**권장 시작점:** Phase 0 문서 정리 (혼란 방지)

---

*본 계획서는 코드베이스 실사 기반으로 작성되었습니다.*
*관련 문서: `docs/document-discrepancy-report.md`*
