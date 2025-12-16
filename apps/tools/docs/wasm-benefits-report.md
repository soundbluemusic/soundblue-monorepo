# 🚀 WASM 모듈 인스턴스화 구현 시 장점 분석

**작성일**: 2025-12-15 | **대상**: SoundBlueMusic Tools

---

## 📊 현재 상태 비교

### JavaScript 폴백 (현재)

```typescript
// wasm-loader.ts - 현재 구현
calculateRMS, calculatePeak, applyGain, processBuffer (패스스루)
```

**제공 기능: 4개 (기본 유틸리티만)**

### Rust WASM 모듈 (구현 시 활성화)

| 모듈 | 기능 |
|------|------|
| `effects.rs` | 3-Band EQ, Compressor, Delay |
| `oscillator.rs` | Sine, Saw, Square, Triangle, Noise, ADSR |
| `analyzer.rs` | FFT Spectrum Analyzer, Beat Detector |
| `lib.rs` | Zero-copy 처리, SharedArrayBuffer 지원 |

**제공 기능: 15개+ (프로급 오디오 처리)**

---

## ✅ 구현 시 장점

### 1. 🎛️ 실시간 이펙트 체인

현재 불가능 → **WASM 구현 시 가능**

```
오디오 입력 → EQ(Low/Mid/High) → Compressor → Delay → 출력
```

| 이펙트 | 파라미터 | 용도 |
|--------|----------|------|
| **3-Band EQ** | Low(200Hz), Mid(1kHz), High(4kHz) | 톤 컨트롤 |
| **Compressor** | Threshold, Ratio, Attack, Release, Makeup | 다이나믹 제어 |
| **Delay** | Time(최대 2초), Feedback, Mix | 공간감 |

**적용 가능 도구:**
- Metronome: 클릭 사운드에 EQ/Compressor
- Drum Machine: 드럼에 Compressor로 펀치감
- 향후 오디오 레코더/플레이어

---

### 2. 🎹 신디사이저 기능

현재 불가능 → **WASM 구현 시 가능**

```rust
// 5가지 파형 생성
SINE, SAW, SQUARE, TRIANGLE, NOISE
```

| 기능 | 설명 |
|------|------|
| **Oscillator** | 실시간 파형 생성 |
| **ADSR Envelope** | Attack/Decay/Sustain/Release |
| **Frequency Control** | 음높이 제어 |

**적용 가능 도구:**
- Metronome: 커스텀 클릭 사운드 (현재 샘플 의존)
- 향후 신디사이저/키보드 도구
- 테스트 톤 생성기

---

### 3. 📈 스펙트럼 분석

현재 불가능 → **WASM 구현 시 가능**

```rust
// FFT 기반 실시간 분석
SpectrumAnalyzer::analyze(input, magnitudes) // dB 출력
PeakDetector::process(input) // 비트 감지
```

| 기능 | 알고리즘 | 용도 |
|------|----------|------|
| **Spectrum Analyzer** | FFT + Hann Window | 주파수 시각화 |
| **Peak Detector** | Adaptive Threshold | 비트 감지 |

**적용 가능 도구:**
- 스펙트럼 시각화 도구
- 튜너 (피치 검출)
- BPM 감지기
- 오디오 미터 (현재 JS로 구현됨)

---

### 4. ⚡ 성능 향상

| 항목 | JavaScript | WASM (Rust) | 개선율 |
|------|-----------|-------------|--------|
| **실행 속도** | ~1x | ~10-20x | 10-20배 |
| **메모리 효율** | GC 오버헤드 | 직접 관리 | 안정적 |
| **레이턴시** | 변동 있음 | 일관됨 | 예측 가능 |
| **CPU 사용** | 높음 | 낮음 | ~50% 절감 |

#### 실시간 오디오에서 중요한 이유

```
샘플레이트: 48000 Hz
버퍼 크기: 128 샘플
처리 시간 예산: 128 / 48000 = 2.67ms

JavaScript: 처리 시간 변동 → 글리치 발생 가능
WASM:      처리 시간 일정 → 안정적 재생
```

---

### 5. 🔄 Zero-Copy 처리

```rust
// SharedArrayBuffer로 메모리 복사 없이 처리
pub fn process_shared(&mut self, buffer_ptr: *mut f32, length: usize) {
    let buffer = unsafe { std::slice::from_raw_parts_mut(buffer_ptr, length) };
    self.effects.process(buffer);
}
```

| 방식 | 메모리 복사 | 지연 |
|------|-----------|------|
| 기존 (JS) | 입력→복사→처리→복사→출력 | 높음 |
| WASM | 입력→**직접처리**→출력 | 최소 |

---

## 📱 도구별 활용 시나리오

### Metronome 개선

| 현재 | WASM 구현 후 |
|------|-------------|
| 고정 클릭 사운드 | 커스텀 신디사이저 사운드 |
| EQ 없음 | 3-Band EQ로 클릭 톤 조절 |
| - | Compressor로 일관된 볼륨 |

### Drum Machine 개선

| 현재 | WASM 구현 후 |
|------|-------------|
| 샘플 재생만 | 샘플 + 실시간 이펙트 |
| 이펙트 없음 | EQ, Compressor, Delay |
| - | 비트별 독립 이펙트 체인 |

### 향후 도구 가능성

| 도구 | WASM 필요 기능 |
|------|---------------|
| **신디사이저** | Oscillator, ADSR, Effects |
| **튜너** | FFT Spectrum Analysis |
| **스펙트럼 분석기** | Real-time FFT |
| **BPM 탭퍼** | Peak Detection |
| **오디오 레코더** | Effects Chain |

---

## 📉 구현하지 않을 경우 영향

| 항목 | 영향 |
|------|------|
| **기능 제한** | 패스스루만 가능, 이펙트/분석 불가 |
| **성능** | CPU 집약적 작업 시 글리치 |
| **확장성** | 새 오디오 도구 추가 어려움 |
| **경쟁력** | 타 웹 DAW 대비 기능 부족 |
| **코드 활용** | 작성된 Rust 코드(~500줄) 미사용 |

---

## 🎯 결론

### 구현 권장도: ⭐⭐⭐⭐⭐ (강력 권장)

| 측면 | 평가 |
|------|------|
| **기능 확장** | 4개 → 15개+ 기능 활성화 |
| **성능** | 10-20배 속도 향상 |
| **코드 활용** | 이미 완성된 Rust 코드 활용 |
| **구현 난이도** | 중간 (인프라 완성됨) |
| **ROI** | 높음 (최소 작업으로 최대 효과) |

### 예상 구현 범위

```
필요 작업:
1. initWasm() 메서드에 WebAssembly.instantiate() 추가 (~20줄)
2. process()에서 WASM 호출 연결 (~10줄)
3. 에러 핸들링 및 폴백 로직 (~20줄)

총 예상: ~50줄 추가
활성화되는 기능: 프로급 오디오 DSP 전체
```

---

## 📊 요약 테이블

| 카테고리 | 현재 (JS 폴백) | WASM 구현 후 |
|----------|--------------|-------------|
| **이펙트** | ❌ 없음 | ✅ EQ, Compressor, Delay |
| **신스** | ❌ 없음 | ✅ 5종 파형, ADSR |
| **분석** | ❌ 없음 | ✅ FFT, Peak Detection |
| **속도** | 1x | 10-20x |
| **안정성** | 변동 | 일관됨 |
| **확장성** | 제한적 | 무한 |
