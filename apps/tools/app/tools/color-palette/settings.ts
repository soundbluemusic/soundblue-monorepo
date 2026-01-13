/**
 * Color Palette Generator Settings
 */

import type { BlockPosition, ColorPaletteSettings } from './types';

// Default colors for each palette size
const DEFAULT_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
];

// Generate default block positions (horizontal layout)
function generateDefaultBlockPositions(count: number): BlockPosition[] {
  const blockWidth = 80;
  const blockHeight = 80;
  const gap = 4;
  return Array.from({ length: count }, (_, i) => ({
    x: i * (blockWidth + gap),
    y: 0,
    width: blockWidth,
    height: blockHeight,
  }));
}

export const defaultColorPaletteSettings: ColorPaletteSettings = {
  size: 3,
  colors: DEFAULT_COLORS.slice(0, 3),
  blockPositions: generateDefaultBlockPositions(3),
};

export { generateDefaultBlockPositions };

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
    resetLayout: '배치 초기화',
    dragHint: '블록을 드래그하여 자유롭게 배치하세요',
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
    resetLayout: 'Reset Layout',
    dragHint: 'Drag blocks to arrange freely',
  },
} as const;

export { DEFAULT_COLORS };
export type { ColorPaletteSettings };
