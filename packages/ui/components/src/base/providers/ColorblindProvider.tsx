/**
 * @fileoverview Shared Colorblind Mode Provider for SoundBlue React apps
 *
 * Provides application-wide colorblind accessibility mode with support for:
 * - Protanopia (red-blind, ~1% of males)
 * - Deuteranopia (green-blind, ~6% of males, most common)
 * - Tritanopia (blue-blind, rare)
 * - Persistent mode storage via localStorage
 * - SSG compatibility (safe for static site generation)
 *
 * Uses SVG filters for accurate color simulation that works on ALL elements,
 * including inline styles, Tailwind classes, and images.
 *
 * @module @soundblue/ui-components/base/providers/ColorblindProvider
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Available colorblind modes.
 * - `'none'` - No colorblind adjustments (default)
 * - `'protanopia'` - Red-blind mode (red appears as dark gray/black)
 * - `'deuteranopia'` - Green-blind mode (most common, green appears different)
 * - `'tritanopia'` - Blue-blind mode (blue-yellow confusion)
 */
export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

/**
 * Colorblind mode labels for UI display
 */
export const COLORBLIND_MODE_LABELS: Record<ColorblindMode, { ko: string; en: string }> = {
  none: { ko: '기본', en: 'Default' },
  protanopia: { ko: '적색맹 (P)', en: 'Protanopia' },
  deuteranopia: { ko: '녹색맹 (D)', en: 'Deuteranopia' },
  tritanopia: { ko: '청색맹 (T)', en: 'Tritanopia' },
};

/**
 * All available colorblind modes as array
 */
export const COLORBLIND_MODES: ColorblindMode[] = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
];

/**
 * SVG filter color matrices for colorblind simulation.
 * Based on research by Machado, Oliveira, and Fernandes (2009).
 * @see https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
 */
const COLORBLIND_MATRICES: Record<Exclude<ColorblindMode, 'none'>, string> = {
  // Protanopia: Red-blind (affects ~1% of males)
  // Red appears as dark brown/black, green and blue are distinguishable
  protanopia: `
    0.567, 0.433, 0.000, 0, 0
    0.558, 0.442, 0.000, 0, 0
    0.000, 0.242, 0.758, 0, 0
    0,     0,     0,     1, 0
  `,
  // Deuteranopia: Green-blind (affects ~6% of males, most common)
  // Green appears as brownish-yellow, red and blue are distinguishable
  deuteranopia: `
    0.625, 0.375, 0.000, 0, 0
    0.700, 0.300, 0.000, 0, 0
    0.000, 0.300, 0.700, 0, 0
    0,     0,     0,     1, 0
  `,
  // Tritanopia: Blue-blind (rare, ~0.01%)
  // Blue appears as green, yellow appears as pink/violet
  tritanopia: `
    0.950, 0.050, 0.000, 0, 0
    0.000, 0.433, 0.567, 0, 0
    0.000, 0.475, 0.525, 0, 0
    0,     0,     0,     1, 0
  `,
};

/**
 * Context value provided by ColorblindProvider.
 */
export interface ColorblindContextValue {
  /** Current colorblind mode setting */
  mode: ColorblindMode;
  /** Sets the colorblind mode */
  setMode: (mode: ColorblindMode) => void;
  /** Whether colorblind mode is active (not 'none') */
  isActive: boolean;
}

/**
 * Props for ColorblindProvider component.
 */
export interface ColorblindProviderProps {
  children: ReactNode;
  /** localStorage key for persisting mode (default: 'colorblind-mode') */
  storageKey?: string;
  /** Default mode when no preference is stored (default: 'none') */
  defaultMode?: ColorblindMode;
}

// Default context for SSG or when outside provider
const defaultColorblindContext: ColorblindContextValue = {
  mode: 'none',
  setMode: () => {},
  isActive: false,
};

const ColorblindContext = createContext<ColorblindContextValue>(defaultColorblindContext);

// SVG filter container ID
const SVG_FILTER_CONTAINER_ID = 'colorblind-svg-filters';

/**
 * Creates SVG filter definitions for all colorblind modes.
 */
function createSvgFilters(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', SVG_FILTER_CONTAINER_ID);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  for (const [mode, matrix] of Object.entries(COLORBLIND_MATRICES)) {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `colorblind-${mode}`);
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix.setAttribute('type', 'matrix');
    feColorMatrix.setAttribute('values', matrix.trim().replace(/\s+/g, ' '));

    filter.appendChild(feColorMatrix);
    defs.appendChild(filter);
  }

  svg.appendChild(defs);
  return svg;
}

/**
 * Colorblind mode context provider component.
 *
 * Uses SVG filters for accurate color simulation that applies to ALL rendered
 * pixels, including inline styles, Tailwind classes, images, and canvas.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ColorblindProvider>
 *   <App />
 * </ColorblindProvider>
 *
 * // With custom storage key
 * <ColorblindProvider storageKey="my-app-colorblind" defaultMode="deuteranopia">
 *   <App />
 * </ColorblindProvider>
 * ```
 */
export function ColorblindProvider({
  children,
  storageKey = 'colorblind-mode',
  defaultMode = 'none',
}: ColorblindProviderProps) {
  const [mode, setModeState] = useState<ColorblindMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  /**
   * Ensures SVG filters are present in DOM.
   */
  const ensureSvgFilters = useCallback((): void => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(SVG_FILTER_CONTAINER_ID)) return;

    const svg = createSvgFilters();
    document.body.insertBefore(svg, document.body.firstChild);
  }, []);

  /**
   * Applies colorblind mode using SVG filter.
   */
  const applyMode = useCallback(
    (modeValue: ColorblindMode): void => {
      if (typeof document === 'undefined') return;

      // Ensure SVG filters exist
      ensureSvgFilters();

      // Update data attribute for CSS fallback/debugging
      if (modeValue !== 'none') {
        document.documentElement.setAttribute('data-colorblind', modeValue);
      } else {
        document.documentElement.removeAttribute('data-colorblind');
      }

      // Apply SVG filter to html element
      if (modeValue !== 'none') {
        document.documentElement.style.filter = `url(#colorblind-${modeValue})`;
      } else {
        document.documentElement.style.filter = '';
      }
    },
    [ensureSvgFilters],
  );

  /**
   * Sets colorblind mode and persists to localStorage.
   */
  const setMode = useCallback(
    (newMode: ColorblindMode): void => {
      if (typeof window === 'undefined') return;
      setModeState(newMode);
      // Persist to localStorage (sync)
      try {
        if (newMode === 'none') {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, newMode);
        }
      } catch {
        // localStorage unavailable
      }
      applyMode(newMode);
    },
    [storageKey, applyMode],
  );

  // Initialize mode on mount
  useEffect(() => {
    // Get stored preference from localStorage (sync)
    let stored: ColorblindMode | null = null;
    try {
      stored = localStorage.getItem(storageKey) as ColorblindMode | null;
    } catch {
      // localStorage not available
    }

    const initial = stored && COLORBLIND_MODES.includes(stored) ? stored : defaultMode;

    setModeState(initial);
    applyMode(initial);
    setMounted(true);
  }, [storageKey, defaultMode, applyMode]);

  // Re-apply mode when mode state changes (after mount)
  useEffect(() => {
    if (mounted) {
      applyMode(mode);
    }
  }, [mode, mounted, applyMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof document === 'undefined') return;
      document.documentElement.style.filter = '';
      document.documentElement.removeAttribute('data-colorblind');
    };
  }, []);

  const value = useMemo<ColorblindContextValue>(
    () => ({
      mode,
      setMode,
      isActive: mode !== 'none',
    }),
    [mode, setMode],
  );

  return <ColorblindContext.Provider value={value}>{children}</ColorblindContext.Provider>;
}

/**
 * Hook to access the colorblind mode context.
 *
 * @returns Colorblind context value with mode state and control function
 *
 * @example
 * ```tsx
 * function ColorblindToggle() {
 *   const { mode, setMode, isActive } = useColorblind();
 *
 *   return (
 *     <div>
 *       <p>Current: {mode}</p>
 *       <p>Active: {isActive ? 'Yes' : 'No'}</p>
 *       <select value={mode} onChange={(e) => setMode(e.target.value as ColorblindMode)}>
 *         <option value="none">Default</option>
 *         <option value="protanopia">Protanopia</option>
 *         <option value="deuteranopia">Deuteranopia</option>
 *         <option value="tritanopia">Tritanopia</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useColorblind(): ColorblindContextValue {
  return useContext(ColorblindContext) ?? defaultColorblindContext;
}
