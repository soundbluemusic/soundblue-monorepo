/**
 * Color Palette Generator Types
 */

export type PaletteMode = 'complementary' | 'analogous' | 'triadic' | 'monochromatic';

export interface ColorPaletteSettings {
  /** Base color in HEX format */
  baseColor: string;
  /** Palette generation mode */
  mode: PaletteMode;
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
