/**
 * Color Palette Generator Types
 * 색상 조합 도구 타입 정의
 */

export type PaletteSize = 2 | 3 | 4 | 5;

export interface ColorPaletteSettings {
  /** Number of colors in the palette */
  size: PaletteSize;
  /** Array of HEX colors */
  colors: string[];
}

export interface ColorPaletteProps {
  settings?: Partial<ColorPaletteSettings>;
  onSettingsChange?: (settings: Partial<ColorPaletteSettings>) => void;
}

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}
