/**
 * @fileoverview Shared Theme Provider for SoundBlue apps
 *
 * Provides application-wide theme management with support for:
 * - Light, dark, and system themes
 * - System color scheme preference detection with live updates
 * - Persistent theme storage via localStorage
 * - SSR/SSG compatibility (safe for server-side rendering)
 *
 * @module @soundblue/shared/providers/ThemeProvider
 */

import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type ParentComponent,
  useContext,
} from 'solid-js';
import { isServer } from 'solid-js/web';

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
  theme: Accessor<Theme>;
  /** Resolved theme (actual visual: 'light' or 'dark') */
  resolvedTheme: Accessor<ResolvedTheme>;
  /** Sets the theme to a specific value */
  setTheme: (theme: Theme) => void;
  /** Toggles between light and dark themes */
  toggleTheme: () => void;
}

/**
 * Props for ThemeProvider component.
 */
export interface ThemeProviderProps {
  /** localStorage key for persisting theme (default: 'theme') */
  storageKey?: string;
  /** Default theme when no preference is stored (default: 'system') */
  defaultTheme?: Theme;
  /** Default resolved theme for SSR (default: 'light') */
  ssrDefault?: ResolvedTheme;
}

// Default context for SSR or when outside provider
const defaultThemeContext: ThemeContextValue = {
  theme: () => 'system',
  resolvedTheme: () => 'light',
  setTheme: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);

/**
 * Gets the system color scheme preference.
 */
function getSystemTheme(): ResolvedTheme {
  if (isServer || typeof window === 'undefined') return 'light';
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
export const ThemeProvider: ParentComponent<ThemeProviderProps> = (props) => {
  const storageKey = () => props.storageKey ?? 'theme';
  const defaultTheme = () => props.defaultTheme ?? 'system';
  const ssrDefault = () => props.ssrDefault ?? 'light';

  const [theme, setThemeState] = createSignal<Theme>(defaultTheme());
  const [resolvedTheme, setResolvedTheme] = createSignal<ResolvedTheme>(ssrDefault());
  const [mounted, setMounted] = createSignal(false);

  /**
   * Applies theme to DOM.
   */
  const applyTheme = (themeValue: Theme): void => {
    if (isServer || typeof document === 'undefined') return;

    const resolved: ResolvedTheme = themeValue === 'system' ? getSystemTheme() : themeValue;
    setResolvedTheme(resolved);

    // Apply via multiple methods for CSS compatibility
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  };

  /**
   * Sets theme and persists to storage.
   */
  const setTheme = (newTheme: Theme): void => {
    if (isServer || typeof window === 'undefined') return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey(), newTheme);
    } catch {
      // Silently fail if localStorage is not available
    }
    applyTheme(newTheme);
  };

  /**
   * Toggles between light and dark themes.
   * If current theme is 'system', switches to opposite of resolved theme.
   */
  const toggleTheme = (): void => {
    const current = theme();
    if (current === 'system') {
      // When toggling from system, go to opposite of current resolved theme
      setTheme(resolvedTheme() === 'light' ? 'dark' : 'light');
    } else {
      setTheme(current === 'light' ? 'dark' : 'light');
    }
  };

  onMount(() => {
    // Get stored preference or use default
    let stored: Theme | null = null;
    try {
      stored = localStorage.getItem(storageKey()) as Theme | null;
    } catch {
      // localStorage not available
    }

    const initial = stored && ['light', 'dark', 'system'].includes(stored)
      ? stored
      : defaultTheme();

    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => {
      if (theme() === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    onCleanup(() => {
      mediaQuery.removeEventListener('change', handleChange);
    });
  });

  // Re-apply theme when theme signal changes (after mount)
  createEffect(() => {
    const currentTheme = theme();
    if (mounted()) {
      applyTheme(currentTheme);
    }
  });

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
};

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
 *       <p>Setting: {theme()}</p>
 *       <p>Actual: {resolvedTheme()}</p>
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
