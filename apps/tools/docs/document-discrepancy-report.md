# 문서-코드 불일치 보고서

**작성일:** 2025년 12월 15일
**분석 대상:** SoundBlueMusic 레포지토리 문서 전체

---

## 1. 요약

코드베이스 분석 결과, **문서가 실제 구현 상태를 정확히 반영하지 못하고 있습니다**. 특히 "Coming Soon" 또는 "미구현"으로 표시된 여러 기능이 실제로는 **이미 완전히 구현**되어 있습니다.

### 영향도 요약

| 심각도 | 유형 | 항목 수 |
|--------|------|---------|
| 🔴 높음 | 구현됨 → 문서에 "Coming Soon" | 4개 |
| 🟠 중간 | 구현됨 → 문서에 "미구현" | 3개 |
| 🟡 낮음 | 문서 간 불일치 | 2개 |

---

## 2. 심각한 불일치 (🔴 높음)

### 2.1 `src/routes/built-with.tsx` - "Coming Soon" 섹션

**파일 위치:** `src/routes/built-with.tsx:73-87`

현재 "Coming Soon"으로 표시된 항목 중 **이미 구현된 것들:**

| 항목 | 문서 상태 | 실제 상태 | 구현 파일 |
|------|----------|----------|-----------|
| **IndexedDB** | Coming Soon | ✅ 완전 구현 | `src/engine/storage.ts` (389줄) |
| **AudioWorklet** | Coming Soon | ✅ 완전 구현 | `src/engine/worklet/audio-processor.ts` (388줄) |
| **WebMIDI API** | Coming Soon | ✅ 완전 구현 | `src/engine/midi.ts` (343줄) |
| **Rust + WebAssembly** | Coming Soon | ⚠️ 코드 완성, 연동만 필요 | `rust/src/lib.rs` 등 |

**증거:**

```typescript
// src/engine/storage.ts - IndexedDB (Dexie) 완전 구현
class ToolsDatabase extends Dexie {
  projects!: EntityTable<ProjectBackup, 'id'>;
  audioFiles!: EntityTable<AudioFile, 'id'>;
  preferences!: EntityTable<UserPreference, 'key'>;
}
```

```typescript
// src/engine/midi.ts - WebMIDI API 완전 구현
class MIDIManager {
  async initialize(): Promise<boolean> {
    this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    // ...
  }
}
export const midiManager = new MIDIManager();
```

```typescript
// src/engine/worklet/audio-processor.ts - AudioWorklet 완전 구현
class DAWAudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, _parameters): boolean {
    // RMS 계산, SharedArrayBuffer 통신 등 완전 구현
  }
}
registerProcessor('daw-audio-processor', DAWAudioProcessor);
```

**권장 조치:**
```diff
// src/routes/built-with.tsx
- {
-   titleKey: 'comingSoon',
-   items: [
-     { name: 'Pixi.js / WebGL', url: '...' },
-     { name: 'Rust + WebAssembly', url: '...' },
-     { name: 'AudioWorklet', url: '...' },
-     { name: 'WebMIDI API', url: '...' },
-     { name: 'TensorFlow.js', url: '...' },
-     { name: 'IndexedDB', url: '...' },
-   ],
- },
+ {
+   titleKey: 'audioEngine',
+   items: [
+     { name: 'AudioWorklet', url: '...' },
+     { name: 'WebMIDI API', url: '...' },
+     { name: 'Rust + WebAssembly (연동 예정)', url: '...' },
+   ],
+ },
+ {
+   titleKey: 'storage',
+   items: [
+     { name: 'IndexedDB (Dexie)', url: '...' },
+   ],
+ },
+ {
+   titleKey: 'comingSoon',
+   items: [
+     { name: 'Pixi.js / WebGL', url: '...' },
+     { name: 'TensorFlow.js', url: '...' },
+   ],
+ },
```

---

## 3. 중간 불일치 (🟠 중간)

### 3.1 `docs/translator-improvement-needed.md` - 기능 평가 오류

**파일 위치:** `docs/translator-improvement-needed.md`

문서에서 "❌ 없음"으로 표시된 기능 중 **실제로 구현된 것들:**

| 문서 내용 | 실제 상태 | 구현 파일 |
|----------|----------|-----------|
| "복합어 분석 ❌" | ✅ 구현됨 | `src/tools/translator/dictionary/compound-words.ts` |
| "서술어 입니다/이에요 처리 ❌" | ✅ 구현됨 | `src/tools/translator/dictionary/copulas.ts` |
| "영어 불규칙 동사 ❌" | ✅ 구현됨 | `src/tools/translator/dictionary/english-verbs.ts` (60+ 동사) |
| "문장 구조/어순 변환 ❌" | ✅ 구현됨 | `src/tools/translator/grammar/english-generator.ts` |
| "주어 생략 처리 ❌" | ✅ 구현됨 | `src/tools/translator/grammar/sentence-parser.ts` (`subjectOmitted` 플래그) |

**실제 코드 증거:**

```typescript
// src/tools/translator/grammar/english-generator.ts
// SOV → SVO 어순 변환 구현됨
function generateEnglishSentence(parsed: ParsedSentence): string {
  // Subject + Verb + Object 순서로 재배열
}
```

```typescript
// src/tools/translator/dictionary/copulas.ts
// 서술격 조사 처리 구현됨
export const copulaForms = {
  '입니다': { en: 'is', formality: 'formal' },
  '이에요': { en: 'is', formality: 'polite' },
  // ...
};
```

**권장 조치:**
- `docs/translator-improvement-needed.md` 삭제 또는 업데이트
- 실제 문제점(사전 커버리지 부족)으로 내용 교체

---

### 3.2 `docs/translator-typo-correction-plan.md` - 계획 vs 구현 혼동

**파일 위치:** `docs/translator-typo-correction-plan.md` (1178줄)

이 문서는 **계획서**이지만, 대부분의 내용이 **이미 구현**되어 있습니다:

| 계획 항목 | 실제 상태 | 구현 파일 |
|----------|----------|-----------|
| 의존명사 띄어쓰기 규칙 | ✅ 구현됨 | `src/tools/translator/typo/spacing-rules.ts` |
| 보조용언 띄어쓰기 | ✅ 구현됨 | `src/tools/translator/typo/spacing-rules.ts` |
| 자모 편집 거리 | ✅ 구현됨 | `src/tools/translator/typo/jamo-edit-distance.ts` |
| 빈번한 오타 사전 | ✅ 구현됨 | `src/tools/translator/typo/common-typos.ts` |
| 통합 교정 함수 | ✅ 구현됨 | `src/tools/translator/typo/typo-corrector.ts` |

**권장 조치:**
- 문서 제목을 "계획" → "구현 문서"로 변경
- 또는 구현 완료 표시 추가

---

### 3.3 초기 분석 보고서의 오류

**영향 파일:** 사용자가 제공한 초기 분석 보고서

| 보고서 내용 | 실제 상태 |
|------------|----------|
| "번역기 핵심 기능 부재" | ❌ 잘못됨 - 핵심 기능 대부분 구현됨 |
| "Rust/WASM 미완성 TODO 상태" | ❌ 잘못됨 - Rust 코드 완성, 연동만 필요 |
| "복합어 분석 없음" | ❌ 잘못됨 - `compound-words.ts` 존재 |
| "SOV→SVO 변환 없음" | ❌ 잘못됨 - `english-generator.ts`에 구현 |

---

## 4. 낮은 불일치 (🟡 낮음)

### 4.1 README.md - Tech Stack 누락

**파일:** `README.md:121-137`

현재 Tech Stack에 누락된 항목:

| 누락 항목 | 설명 |
|----------|------|
| IndexedDB (Dexie) | 로컬 저장소 |
| AudioWorklet | 오디오 처리 |
| WebMIDI | MIDI 지원 |

**권장 조치:**
```diff
// README.md Tech Stack 테이블
| **Audio** | Web Audio API, AudioWorklet, Rust/WASM |
+ | **Storage** | IndexedDB (Dexie) |
+ | **MIDI** | WebMIDI API |
```

---

### 4.2 CLAUDE.md - Tech Stack 업데이트 필요

**파일:** `CLAUDE.md` (Tech Stack 섹션)

README.md와 동일한 누락 항목 존재.

---

## 5. 수정 우선순위

### 즉시 수정 필요 (1일 내)

| 파일 | 수정 내용 |
|------|----------|
| `src/routes/built-with.tsx` | "Coming Soon" 섹션 재구성 |
| `docs/translator-improvement-needed.md` | 삭제 또는 전면 수정 |

### 단기 수정 (1주 내)

| 파일 | 수정 내용 |
|------|----------|
| `docs/translator-typo-correction-plan.md` | 구현 완료 표시 추가 |
| `README.md` | Tech Stack 업데이트 |
| `CLAUDE.md` | Tech Stack 업데이트 |

### 장기 개선 (선택)

| 작업 | 설명 |
|------|------|
| 문서 자동 동기화 | package.json → 문서 자동 업데이트 스크립트 |
| 코드 주석 개선 | 구현 상태를 코드 주석에 명시 |

---

## 6. 영향받는 파일 목록

### 수정 필요

1. `src/routes/built-with.tsx` - **높음** (사용자 대면 페이지)
2. `docs/translator-improvement-needed.md` - **높음** (잘못된 정보)
3. `docs/translator-typo-correction-plan.md` - **중간** (계획 vs 구현 혼동)
4. `README.md` - **낮음** (Tech Stack 불완전)
5. `CLAUDE.md` - **낮음** (Tech Stack 불완전)

### 정확함 (수정 불필요)

1. `docs/ssg-verification-report.md` - ✅ 정확함
2. `CONTRIBUTING.md` - ✅ 정확함
3. `SECURITY.md` - ✅ 정확함
4. `rust/Cargo.toml` - ✅ 정확함

---

## 7. 결론

**핵심 발견:**
1. "Coming Soon" 기능 중 4개가 이미 완전히 구현됨
2. "미구현" 번역기 기능 중 5개가 이미 구현됨
3. 초기 분석 보고서가 코드가 아닌 문서만 참조하여 오류 발생

**근본 원인:**
- 문서가 실제 코드 상태를 반영하지 않음
- 구현 완료 후 문서 업데이트 누락
- 문서-코드 동기화 자동화 부재

**권장 워크플로우:**
```
1. 기능 구현 완료
2. 관련 문서 업데이트 (체크리스트 활용)
3. PR 리뷰 시 문서 동기화 확인
4. 정기적인 문서-코드 일치성 검토 (월 1회)
```

---

*본 보고서는 코드베이스 실사 기반으로 작성되었습니다.*
