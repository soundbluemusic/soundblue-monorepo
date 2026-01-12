/**
 * Color Palette Generator Settings
 */

import type { ColorPaletteSettings } from './types';

// Default colors for each palette size
const DEFAULT_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
];

export const defaultColorPaletteSettings: ColorPaletteSettings = {
  size: 3,
  colors: DEFAULT_COLORS.slice(0, 3),
};

export const colorPaletteTexts = {
  ko: {
    title: '컬러 팔레트',
    paletteSize: '색상 개수',
    colors: '색상',
    colorN: '색상 {n}',
    copied: '복사됨!',
    clickToCopy: '클릭하여 복사',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    reset: '초기화',
    randomize: '랜덤',
    palette: '색상 설정',
    preview: '팔레트 미리보기',
  },
  en: {
    title: 'Color Palette',
    paletteSize: 'Palette Size',
    colors: 'Colors',
    colorN: 'Color {n}',
    copied: 'Copied!',
    clickToCopy: 'Click to copy',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    reset: 'Reset',
    randomize: 'Random',
    palette: 'Color Settings',
    preview: 'Palette Preview',
  },
} as const;

export { DEFAULT_COLORS };
export type { ColorPaletteSettings };
