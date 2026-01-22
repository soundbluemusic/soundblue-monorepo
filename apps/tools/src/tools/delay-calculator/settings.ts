/**
 * Delay Calculator Settings and Metadata
 */

import type { DelayCalculatorSettings, DelayCalculatorTexts } from './types';

// Re-export types from types.ts
export type { DelayCalculatorSettings } from './types';

/** Default settings */
export const defaultDelayCalculatorSettings: DelayCalculatorSettings = {
  bpm: 120,
};

/** BPM range constraints */
export const BPM_RANGE = {
  min: 20,
  max: 300,
  step: 1,
} as const;

/** Tool metadata */
export const delayCalculatorMeta = {
  id: 'delayCalculator' as const,
  slug: 'delay-calculator',
  name: {
    en: 'Delay Calculator',
    ko: '딜레이 계산기',
  },
  icon: '⏱️',
  description: {
    en: 'Calculate delay times in milliseconds based on BPM and note values',
    ko: 'BPM과 음표 단위에 따른 딜레이 시간(ms)을 계산합니다',
  },
};

/** Localized UI texts */
export const delayCalculatorTexts: Record<'en' | 'ko', DelayCalculatorTexts> = {
  en: {
    title: 'Delay Time Calculator',
    bpm: 'BPM',
    tap: 'TAP',
    note: 'Note',
    normal: 'Normal',
    dotted: 'Dotted',
    triplet: 'Triplet',
    copyTip: 'Click to copy',
    tapTip: 'Press Space or click TAP',
    copied: 'Copied!',
    reset: 'Reset',
  },
  ko: {
    title: '딜레이 타임 계산기',
    bpm: 'BPM',
    tap: '탭',
    note: '음표',
    normal: '기본',
    dotted: '점음표',
    triplet: '셋잇단',
    copyTip: '클릭해서 복사',
    tapTip: '스페이스바 또는 TAP 클릭',
    copied: '복사됨!',
    reset: '초기화',
  },
};
