/**
 * Color Harmony Generator Settings
 */

import type { ColorHarmonySettings } from './types';

export const defaultColorHarmonySettings: ColorHarmonySettings = {
  baseColor: '#3b82f6',
  mode: 'complementary',
};

export const colorHarmonyTexts = {
  ko: {
    title: '컬러 하모니',
    baseColor: '기준 색상',
    mode: '하모니 타입',
    complementary: '보색',
    analogous: '유사색',
    triadic: '삼원색',
    monochromatic: '단색 계열',
    copied: '복사됨!',
    clickToCopy: '클릭하여 복사',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    palette: '배색',
    reset: '초기화',
    randomize: '랜덤',
  },
  en: {
    title: 'Color Harmony',
    baseColor: 'Base Color',
    mode: 'Harmony Type',
    complementary: 'Complementary',
    analogous: 'Analogous',
    triadic: 'Triadic',
    monochromatic: 'Monochromatic',
    copied: 'Copied!',
    clickToCopy: 'Click to copy',
    hex: 'HEX',
    rgb: 'RGB',
    hsl: 'HSL',
    palette: 'Color Scheme',
    reset: 'Reset',
    randomize: 'Random',
  },
} as const;

export type { ColorHarmonySettings };
