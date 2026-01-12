/**
 * Color Palette Generator Settings
 */

import type { ColorPaletteSettings } from './types';

export const defaultColorPaletteSettings: ColorPaletteSettings = {
  baseColor: '#3b82f6',
  mode: 'complementary',
};

export const colorPaletteTexts = {
  ko: {
    title: '컬러 팔레트',
    baseColor: '기준 색상',
    mode: '모드',
    complementary: '보색',
    analogous: '유사색',
    triadic: '삼원색',
    monochromatic: '단색 계열',
    copied: '복사됨!',
    clickToCopy: '클릭하여 복사',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    palette: '팔레트',
    reset: '초기화',
    randomize: '랜덤',
  },
  en: {
    title: 'Color Palette',
    baseColor: 'Base Color',
    mode: 'Mode',
    complementary: 'Complementary',
    analogous: 'Analogous',
    triadic: 'Triadic',
    monochromatic: 'Monochromatic',
    copied: 'Copied!',
    clickToCopy: 'Click to copy',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    palette: 'Palette',
    reset: 'Reset',
    randomize: 'Random',
  },
} as const;

export type { ColorPaletteSettings };
