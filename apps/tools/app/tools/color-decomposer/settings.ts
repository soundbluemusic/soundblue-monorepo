/**
 * Color Decomposer Settings
 */

import type { ColorDecomposerSettings, DecomposeSize } from './types';
import { decomposeColor } from './utils';

// Default values
const DEFAULT_TARGET_COLOR = '#8b5cf6'; // Purple
const DEFAULT_SIZE: DecomposeSize = 3;

// Generate initial components that match the target color
export const defaultColorDecomposerSettings: ColorDecomposerSettings = {
  targetColor: DEFAULT_TARGET_COLOR,
  size: DEFAULT_SIZE,
  components: decomposeColor(DEFAULT_TARGET_COLOR, DEFAULT_SIZE),
};

export const colorDecomposerTexts = {
  ko: {
    title: '색상 분해',
    targetColor: '목표 색상',
    componentCount: '구성 색상 개수',
    components: '구성 색상',
    ratio: '비율',
    opacity: '투명도',
    mixedResult: '혼합 결과',
    preview: '미리보기',
    reset: '초기화',
    randomize: '랜덤',
    colorN: '색상 {n}',
    hex: 'HEX',
    rgb: 'RGB',
    copied: '복사됨!',
    lock: '고정',
    unlock: '고정 해제',
    locked: '고정됨',
    mismatchWarning: '고정된 색상으로는 목표 색상을 만들 수 없습니다',
    unlockAll: '모두 해제',
  },
  en: {
    title: 'Color Decomposer',
    targetColor: 'Target Color',
    componentCount: 'Component Count',
    components: 'Components',
    ratio: 'Ratio',
    opacity: 'Opacity',
    mixedResult: 'Mixed Result',
    preview: 'Preview',
    reset: 'Reset',
    randomize: 'Random',
    colorN: 'Color {n}',
    hex: 'HEX',
    rgb: 'RGB',
    copied: 'Copied!',
    lock: 'Lock',
    unlock: 'Unlock',
    locked: 'Locked',
    mismatchWarning: 'Cannot achieve target color with locked colors',
    unlockAll: 'Unlock All',
  },
} as const;

export type { ColorDecomposerSettings };
