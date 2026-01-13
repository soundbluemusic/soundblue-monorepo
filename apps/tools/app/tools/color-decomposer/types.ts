/**
 * Color Decomposer Types
 */

export type DecomposeSize = 2 | 3 | 4 | 5;

export interface ComponentColor {
  hex: string;
  ratio: number; // 0-100
  opacity: number; // 0-100, affects how much this color contributes to the mix
  locked?: boolean; // If true, this color won't be auto-adjusted
}

export interface ColorDecomposerSettings {
  targetColor: string; // Target color HEX
  size: DecomposeSize; // Number of component colors
  components: ComponentColor[]; // Component colors with ratios
}

export interface ColorDecomposerProps {
  settings?: Partial<ColorDecomposerSettings>;
  onSettingsChange?: (settings: Partial<ColorDecomposerSettings>) => void;
}
