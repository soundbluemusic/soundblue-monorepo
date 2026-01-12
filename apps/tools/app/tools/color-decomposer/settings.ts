/**
 * Color Decomposer Settings
 */

import type { ColorDecomposerSettings, ComponentColor, DecomposeSize } from './types';

// Default component colors for initial state
const DEFAULT_COMPONENTS: ComponentColor[] = [
  { hex: '#ef4444', ratio: 33 }, // Red
  { hex: '#22c55e', ratio: 34 }, // Green
  { hex: '#3b82f6', ratio: 33 }, // Blue
];

export const defaultColorDecomposerSettings: ColorDecomposerSettings = {
  targetColor: '#8b5cf6', // Purple
  size: 3,
  components: DEFAULT_COMPONENTS,
};

export const colorDecomposerTexts = {
  ko: {
    title: '색상 분해',
    targetColor: '목표 색상',
    componentCount: '구성 색상 개수',
    components: '구성 색상',
    ratio: '비율',
    mixedResult: '혼합 결과',
    preview: '미리보기',
    reset: '초기화',
    randomize: '랜덤',
    colorN: '색상 {n}',
    hex: 'HEX',
    rgb: 'RGB',
    copied: '복사됨!',
  },
  en: {
    title: 'Color Decomposer',
    targetColor: 'Target Color',
    componentCount: 'Component Count',
    components: 'Components',
    ratio: 'Ratio',
    mixedResult: 'Mixed Result',
    preview: 'Preview',
    reset: 'Reset',
    randomize: 'Random',
    colorN: 'Color {n}',
    hex: 'HEX',
    rgb: 'RGB',
    copied: 'Copied!',
  },
} as const;

// Generate initial component colors for a given size
export function generateInitialComponents(size: DecomposeSize): ComponentColor[] {
  const baseColors = [
    '#ef4444', // Red
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
  ];

  const ratio = Math.floor(100 / size);
  const remainder = 100 - ratio * size;

  return baseColors.slice(0, size).map((hex, index) => ({
    hex,
    ratio: index === 0 ? ratio + remainder : ratio,
  }));
}

export type { ColorDecomposerSettings };
