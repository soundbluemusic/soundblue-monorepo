/**
 * @fileoverview Theme Provider for Sound Blue
 *
 * Provides application-wide theme management with support for:
 * - Light and dark themes
 * - System color scheme preference detection
 * - Persistent theme storage via localStorage
 * - SSR/SSG compatibility (safe for server-side rendering)
 *
 * The theme is applied via the `data-theme` attribute on the `<html>` element,
 * which is used by CSS custom properties in `src/styles/tailwind.css`.
 *
 * @example
 * ```tsx
 * // In app.tsx - wrap your app with ThemeProvider
 * import { ThemeProvider } from '~/components/providers';
 *
 * export default function App() {
 *   return (
 *     <ThemeProvider>
 *       <Router />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In any component - access theme via useTheme hook
 * import { useTheme } from '~/components/providers';
 *
 * function ThemeToggle() {
 *   const { theme, toggleTheme } = useTheme();
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current: {theme()}
 *     </button>
 *   );
 * }
 * ```
 *
 * @module ThemeProvider
 */

import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  type JSX,
  onMount,
  type ParentComponent,
  useContext,
} from 'solid-js';
import { isServer } from 'solid-js/web';
import { getRawStorageItem, setRawStorageItem } from '~/utils/storage';

/**
 * Available theme options for the application.
 *
 * - `'light'` - Light theme with warm ivory colors (see CSS: "Warm Ivory")
 * - `'dark'` - Dark theme with midnight forest colors (see CSS: "Midnight Forest")
 *
 * @see {@link file://src/styles/tailwind.css} for CSS custom properties
 */
export type Theme = 'light' | 'dark';

/**
 * Context value provided by ThemeProvider.
 *
 * @property {Accessor<Theme>} theme - Reactive signal returning the current theme.
 *   Call as `theme()` to get the value and trigger reactivity.
 * @property {function(Theme): void} setTheme - Sets the theme to a specific value.
 * @property {function(): void} toggleTheme - Toggles between 'light' and 'dark' themes.
 *
 * @example
 * ```tsx
 * const { theme, setTheme, toggleTheme } = useTheme();
 *
 * // Read current theme (reactive)
 * console.log(theme()); // 'light' or 'dark'
 *
 * // Set specific theme
 * setTheme('dark');
 *
 * // Toggle between themes
 * toggleTheme();
 * ```
 */
interface ThemeContextValue {
  /** Reactive signal returning the current theme ('light' or 'dark') */
  theme: Accessor<Theme>;
  /** Sets the theme to a specific value */
  setTheme: (theme: Theme) => void;
  /** Toggles between light and dark themes */
  toggleTheme: () => void;
}

/**
 * React context for theme state.
 * @internal
 */
const ThemeContext = createContext<ThemeContextValue>();

/** localStorage key for persisting the user's theme preference */
const STORAGE_KEY = 'sb-theme';

/**
 * Determines the initial theme based on user preference.
 *
 * Resolution order:
 * 1. Returns 'light' on server (SSR safety)
 * 2. User's previously saved preference from localStorage ('sb-theme')
 * 3. System color scheme preference via `prefers-color-scheme` media query
 * 4. Falls back to 'light' if no preference is detected
 *
 * @returns {Theme} The initial theme to use
 *
 * @remarks
 * This function is SSR-safe. During server-side rendering or static generation,
 * it always returns 'light' to prevent hydration mismatches. The actual theme
 * is determined on the client after mount via `onMount`.
 *
 * @example
 * ```ts
 * // On server: always returns 'light'
 * // On client with localStorage 'sb-theme' = 'dark': returns 'dark'
 * // On client with system dark mode: returns 'dark'
 * // On client with no preference: returns 'light'
 * const theme = getInitialTheme();
 * ```
 *
 * @internal
 */
function getInitialTheme(): Theme {
  // SSR safety: return default theme on server to avoid hydration mismatch
  if (isServer) return 'light';

  // Priority 1: Check user's stored preference
  const stored = getRawStorageItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  // Priority 2: Check system color scheme preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  // Default: light theme
  return 'light';
}

/**
 * Theme context provider component.
 *
 * Manages the application's color theme state and provides it to all child components
 * via the `useTheme` hook. This provider handles:
 *
 * - **SSR/SSG Safety**: Uses a mounted signal pattern to defer theme initialization
 *   to the client, preventing hydration mismatches during static site generation.
 * - **Persistence**: Automatically saves the user's theme preference to localStorage.
 * - **DOM Updates**: Applies the theme by setting `data-theme` attribute on `<html>`.
 * - **System Preference**: Respects the user's OS color scheme preference on first visit.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components that will have access to theme context
 * @returns {JSX.Element} Provider component wrapping children
 *
 * @remarks
 * ## Mounted Signal Pattern
 *
 * This provider uses a "mounted" signal to handle SSR/SSG safely:
 *
 * 1. **Initial render (server)**: Theme signal is 'light' (safe default)
 * 2. **onMount (client only)**: Actual theme is determined and signal updated
 * 3. **createEffect**: Only runs after mounted, applies theme to DOM and localStorage
 *
 * This pattern prevents:
 * - Accessing `window`/`localStorage` during SSR (would crash)
 * - Hydration mismatch between server HTML and client state
 * - Flash of wrong theme (FOUC) on page load
 *
 * ## FOUC Prevention
 *
 * To fully prevent FOUC, add this inline script in `app.tsx` before the provider:
 * ```tsx
 * <script>{`
 *   (function() {
 *     var theme = localStorage.getItem('sb-theme');
 *     if (theme === 'dark' || theme === 'light') {
 *       document.documentElement.setAttribute('data-theme', theme);
 *     } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
 *       document.documentElement.setAttribute('data-theme', 'dark');
 *     }
 *   })();
 * `}</script>
 * ```
 *
 * @example
 * ```tsx
 * // Wrap your app at the root level
 * import { ThemeProvider } from '~/components/providers';
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <Header />
 *       <Main />
 *       <Footer />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * @see {@link useTheme} - Hook to consume theme context
 * @see {@link Theme} - Available theme values
 */
export const ThemeProvider: ParentComponent = (props): JSX.Element => {
  // Theme signal - starts with 'light' as safe SSR default
  const [theme, setThemeSignal] = createSignal<Theme>('light');

  // Mounted signal - tracks if component has mounted on client
  // This prevents effects from running during SSR/SSG
  const [mounted, setMounted] = createSignal(false);

  // Initialize theme on client mount
  onMount(() => {
    setThemeSignal(getInitialTheme());
    setMounted(true);
  });

  // Sync theme to DOM and localStorage when theme changes
  // Only runs after component is mounted (client-side)
  createEffect(() => {
    if (!mounted()) return;

    const currentTheme = theme();
    // Apply theme via data attribute (CSS uses [data-theme='dark'] selectors)
    document.documentElement.setAttribute('data-theme', currentTheme);
    // Persist preference for future visits
    setRawStorageItem(STORAGE_KEY, currentTheme);
  });

  /**
   * Sets the theme to a specific value.
   * @param newTheme - The theme to set ('light' or 'dark')
   */
  const setTheme = (newTheme: Theme): void => {
    setThemeSignal(newTheme);
  };

  /**
   * Toggles between light and dark themes.
   * If current theme is 'light', switches to 'dark' and vice versa.
   */
  const toggleTheme = (): void => {
    setThemeSignal((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
};

/**
 * Hook to access the theme context.
 *
 * Provides access to the current theme state and functions to modify it.
 * Must be called within a component that is a descendant of `ThemeProvider`.
 *
 * @returns {ThemeContextValue} Object containing theme state and control functions
 * @throws {Error} If called outside of a ThemeProvider
 *
 * @example
 * ```tsx
 * import { useTheme } from '~/components/providers';
 *
 * function MyComponent() {
 *   const { theme, setTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {theme()}</p>
 *       <button onClick={() => setTheme('light')}>Light</button>
 *       <button onClick={() => setTheme('dark')}>Dark</button>
 *       <button onClick={toggleTheme}>Toggle</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Conditional styling based on theme
 * function ThemedIcon() {
 *   const { theme } = useTheme();
 *
 *   return (
 *     <img
 *       src={theme() === 'dark' ? '/icons/moon.svg' : '/icons/sun.svg'}
 *       alt="Theme icon"
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Reactive theme-based class names
 * import { cn } from '~/lib/utils';
 *
 * function Card() {
 *   const { theme } = useTheme();
 *
 *   return (
 *     <div class={cn(
 *       'p-4 rounded-lg',
 *       theme() === 'dark' ? 'bg-gray-800' : 'bg-white'
 *     )}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link ThemeProvider} - Provider component that must wrap consumers
 * @see {@link ThemeContextValue} - Shape of the returned context value
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
