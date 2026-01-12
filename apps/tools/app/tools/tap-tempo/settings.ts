/**
 * TAP Tempo Tool Settings
 */

import type { TapTempoSettings } from './types';

export const defaultTapTempoSettings: TapTempoSettings = {
  soundEnabled: false,
  volume: 80,
};

export const BPM_RANGE = {
  min: 20,
  max: 300,
} as const;

export const tapTempoTexts = {
  ko: {
    bpm: 'BPM',
    tap: 'TAP',
    tapCount: '탭 횟수',
    avgInterval: '평균 간격',
    reset: '초기화',
    sound: '소리',
    volume: '볼륨',
    on: 'ON',
    off: 'OFF',
    tipTitle: '사용법',
    tipContent: '박자에 맞춰 TAP 버튼을 누르거나 스페이스바를 누르세요',
    accuracy: '정확도',
    listening: '탭하세요...',
    detected: '감지됨!',
  },
  en: {
    bpm: 'BPM',
    tap: 'TAP',
    tapCount: 'Tap count',
    avgInterval: 'Avg. interval',
    reset: 'Reset',
    sound: 'Sound',
    volume: 'Volume',
    on: 'ON',
    off: 'OFF',
    tipTitle: 'How to use',
    tipContent: 'Tap the button or press spacebar to the beat',
    accuracy: 'Accuracy',
    listening: 'Tap to start...',
    detected: 'Detected!',
  },
} as const;

export type { TapTempoSettings };
