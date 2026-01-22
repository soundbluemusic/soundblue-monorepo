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

/**
 * Colorblind mode context provider component.
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
   * Applies colorblind mode to DOM.
   */
  const applyMode = useCallback((modeValue: ColorblindMode): void => {
    if (typeof document === 'undefined') return;

    // Remove all colorblind mode attributes first
    document.documentElement.removeAttribute('data-colorblind');

    // Apply new mode if not 'none'
    if (modeValue !== 'none') {
      document.documentElement.setAttribute('data-colorblind', modeValue);
    }
  }, []);

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
