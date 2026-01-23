/**
 * Color Decomposer Types
 */

export type DecomposeSize = 2 | 3 | 4 | 5;
export type PreviewMode = 'strip' | 'blend';

export interface ComponentColor {
  hex: string;
  ratio: number; // 0-100
  opacity: number; // 0-100, affects how much this color contributes to the mix
  lockedHex?: boolean; // If true, hex color won't be auto-adjusted
  lockedRatio?: boolean; // If true, ratio won't be auto-adjusted
  lockedOpacity?: boolean; // If true, opacity won't be auto-adjusted
}

export interface ColorDecomposerSettings {
  targetColor: string; // Target color HEX
  size: DecomposeSize; // Number of component colors
  components: ComponentColor[]; // Component colors with ratios
  previewMode: PreviewMode; // Preview display mode
}

export interface ColorDecomposerProps {
  settings?: Partial<ColorDecomposerSettings>;
  onSettingsChange?: (settings: Partial<ColorDecomposerSettings>) => void;
}
