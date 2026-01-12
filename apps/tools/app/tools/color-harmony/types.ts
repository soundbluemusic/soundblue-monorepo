/**
 * Color Harmony Generator Types
 */

export type HarmonyMode = 'complementary' | 'analogous' | 'triadic' | 'monochromatic';

export interface ColorHarmonySettings {
  /** Base color in HEX format */
  baseColor: string;
  /** Harmony generation mode */
  mode: HarmonyMode;
}

export interface ColorHarmonyProps {
  settings?: Partial<ColorHarmonySettings>;
  onSettingsChange?: (settings: Partial<ColorHarmonySettings>) => void;
}

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}
