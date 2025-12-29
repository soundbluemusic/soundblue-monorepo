/**
 * @fileoverview Shared Theme Provider for SoundBlue React apps
 *
 * Provides application-wide theme management with support for:
 * - Light, dark, and system themes
 * - System color scheme preference detection with live updates
 * - Persistent theme storage via localStorage (lightweight, no IndexedDB)
 * - SSG compatibility (safe for static site generation)
 *
 * @module @soundblue/shared-react/providers/ThemeProvider
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
 * Available theme options.
 * - `'light'` - Light theme
 * - `'dark'` - Dark theme
 * - `'system'` - Follow system preference
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Resolved theme (actual visual theme applied).
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Context value provided by ThemeProvider.
 */
export interface ThemeContextValue {
  /** Current theme setting ('light', 'dark', or 'system') */
  theme: Theme;
  /** Resolved theme (actual visual: 'light' or 'dark') */
  resolvedTheme: ResolvedTheme;
  /** Sets the theme to a specific value */
  setTheme: (theme: Theme) => void;
  /** Toggles between light and dark themes */
  toggleTheme: () => void;
}

/**
 * Props for ThemeProvider component.
 */
export interface ThemeProviderProps {
  children: ReactNode;
  /** localStorage key for persisting theme (default: 'theme') */
  storageKey?: string;
  /** Default theme when no preference is stored (default: 'system') */
  defaultTheme?: Theme;
  /** Default resolved theme for SSR/SSG (default: 'light') */
  ssrDefault?: ResolvedTheme;
}

// Default context for SSG or when outside provider
const defaultThemeContext: ThemeContextValue = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);

/**
 * Gets the system color scheme preference.
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Theme context provider component.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // With custom storage key
 * <ThemeProvider storageKey="my-app-theme" defaultTheme="dark">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  storageKey = 'theme',
  defaultTheme = 'system',
  ssrDefault = 'light',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(ssrDefault);
  const [mounted, setMounted] = useState(false);

  /**
   * Applies theme to DOM.
   */
  const applyTheme = useCallback((themeValue: Theme): void => {
    if (typeof document === 'undefined') return;

    const resolved: ResolvedTheme = themeValue === 'system' ? getSystemTheme() : themeValue;
    setResolvedTheme(resolved);

    // Apply via multiple methods for CSS compatibility
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }, []);

  /**
   * Sets theme and persists to localStorage.
   */
  const setTheme = useCallback(
    (newTheme: Theme): void => {
      if (typeof window === 'undefined') return;
      setThemeState(newTheme);
      // Persist to localStorage (sync)
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // localStorage unavailable
      }
      applyTheme(newTheme);
    },
    [storageKey, applyTheme],
  );

  /**
   * Toggles between light and dark themes.
   * If current theme is 'system', switches to opposite of resolved theme.
   */
  const toggleTheme = useCallback((): void => {
    if (theme === 'system') {
      // When toggling from system, go to opposite of current resolved theme
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  }, [theme, resolvedTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    // Get stored preference from localStorage (sync)
    let stored: Theme | null = null;
    try {
      stored = localStorage.getItem(storageKey) as Theme | null;
    } catch {
      // localStorage not available
    }

    const initial = stored && ['light', 'dark', 'system'].includes(stored) ? stored : defaultTheme;

    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, [storageKey, defaultTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, applyTheme]);

  // Re-apply theme when theme state changes (after mount)
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted, applyTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access the theme context.
 *
 * @returns Theme context value with theme state and control functions
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Setting: {theme}</p>
 *       <p>Actual: {resolvedTheme}</p>
 *       <button onClick={() => setTheme('light')}>Light</button>
 *       <button onClick={() => setTheme('dark')}>Dark</button>
 *       <button onClick={() => setTheme('system')}>System</button>
 *       <button onClick={toggleTheme}>Toggle</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? defaultThemeContext;
}
