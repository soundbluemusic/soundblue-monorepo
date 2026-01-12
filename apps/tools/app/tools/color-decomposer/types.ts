/**
 * Color Decomposer Types
 */

export type DecomposeSize = 2 | 3 | 4 | 5;

export interface ComponentColor {
  hex: string;
  ratio: number; // 0-100
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
