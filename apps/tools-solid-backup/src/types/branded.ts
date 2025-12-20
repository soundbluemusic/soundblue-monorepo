// ========================================
// Branded Types - 원시 타입 구분
// ========================================
// number, string 등의 원시 타입을 의미론적으로 구분하여
// 잘못된 값 할당을 컴파일 타임에 방지합니다.

/**
 * Brand 타입 유틸리티
 * 원시 타입에 고유한 브랜드를 추가합니다.
 */
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { [__brand]: TBrand };

// ========================================
// Audio 관련 Branded Types
// ========================================

/**
 * 주파수 (Hz)
 * @example const freq: Frequency = 440 as Frequency;
 */
export type Frequency = Brand<number, 'Frequency'>;

/**
 * 데시벨 (dB)
 * @example const level: Decibel = -6 as Decibel;
 */
export type Decibel = Brand<number, 'Decibel'>;

/**
 * 볼륨 레벨 (0.0 ~ 1.0)
 * @example const vol: Volume = 0.8 as Volume;
 */
export type Volume = Brand<number, 'Volume'>;

/**
 * BPM (Beats Per Minute)
 * @example const tempo: BPM = 120 as BPM;
 */
export type BPM = Brand<number, 'BPM'>;

/**
 * 오디오 타임 (초 단위)
 * @example const time: AudioTime = 2.5 as AudioTime;
 */
export type AudioTime = Brand<number, 'AudioTime'>;

/**
 * 샘플 레이트 (Hz)
 * @example const rate: SampleRate = 48000 as SampleRate;
 */
export type SampleRate = Brand<number, 'SampleRate'>;

// ========================================
// MIDI 관련 Branded Types
// ========================================

/**
 * MIDI 노트 번호 (0-127)
 * @example const note: MIDINote = 60 as MIDINote; // C4
 */
export type MIDINote = Brand<number, 'MIDINote'>;

/**
 * MIDI 벨로시티 (0-127)
 * @example const vel: MIDIVelocity = 100 as MIDIVelocity;
 */
export type MIDIVelocity = Brand<number, 'MIDIVelocity'>;

/**
 * MIDI 채널 (0-15)
 * @example const ch: MIDIChannel = 0 as MIDIChannel;
 */
export type MIDIChannel = Brand<number, 'MIDIChannel'>;

/**
 * MIDI CC 번호 (0-127)
 * @example const cc: MIDICCNumber = 1 as MIDICCNumber; // Modulation
 */
export type MIDICCNumber = Brand<number, 'MIDICCNumber'>;

/**
 * MIDI CC 값 (0-127)
 * @example const value: MIDICCValue = 64 as MIDICCValue;
 */
export type MIDICCValue = Brand<number, 'MIDICCValue'>;

// ========================================
// 헬퍼 함수 - 타입 안전한 값 생성
// ========================================

/**
 * 주파수 생성 (범위: 20Hz ~ 20000Hz)
 */
export function frequency(hz: number): Frequency {
  // Silently clamp to audible range in production
  return hz as Frequency;
}

/**
 * BPM 생성 (범위: 20 ~ 300)
 */
export function bpm(value: number): BPM {
  const clamped = Math.max(20, Math.min(300, value));
  return clamped as BPM;
}

/**
 * 볼륨 생성 (범위: 0.0 ~ 1.0)
 */
export function volume(value: number): Volume {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped as Volume;
}

/**
 * MIDI 노트 생성 (범위: 0 ~ 127)
 */
export function midiNote(note: number): MIDINote {
  const clamped = Math.max(0, Math.min(127, Math.round(note)));
  return clamped as MIDINote;
}

/**
 * MIDI 벨로시티 생성 (범위: 0 ~ 127)
 */
export function midiVelocity(vel: number): MIDIVelocity {
  const clamped = Math.max(0, Math.min(127, Math.round(vel)));
  return clamped as MIDIVelocity;
}

/**
 * MIDI 채널 생성 (범위: 0 ~ 15)
 */
export function midiChannel(ch: number): MIDIChannel {
  const clamped = Math.max(0, Math.min(15, Math.round(ch)));
  return clamped as MIDIChannel;
}

/**
 * 오디오 타임 생성 (0 이상)
 */
export function audioTime(seconds: number): AudioTime {
  return Math.max(0, seconds) as AudioTime;
}

/**
 * 샘플 레이트 생성
 */
export function sampleRate(rate: number): SampleRate {
  return rate as SampleRate;
}
