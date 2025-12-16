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

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Accessor<Theme>;
  resolvedTheme: Accessor<'light' | 'dark'>;
  setTheme: (theme: Theme) => void;
}

// Default context for SSR or when outside provider
const defaultThemeContext: ThemeContextValue = {
  theme: () => 'system',
  resolvedTheme: () => 'dark',
  setTheme: () => {},
};

// Initialize context with default value to prevent undefined during hydration
const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);

export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setThemeState] = createSignal<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = createSignal<'light' | 'dark'>('dark');
  const [isMounted, setIsMounted] = createSignal(false);

  const getSystemTheme = (): 'light' | 'dark' => {
    if (isServer || typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (themeValue: Theme) => {
    if (isServer || typeof document === 'undefined') return;

    const resolved = themeValue === 'system' ? getSystemTheme() : themeValue;
    setResolvedTheme(resolved);

    // Apply both class and data-theme for CSS compatibility
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  };

  const setTheme = (newTheme: Theme) => {
    if (isServer || typeof window === 'undefined') return;
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  onMount(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored || 'system';
    setThemeState(initial);
    applyTheme(initial);
    setIsMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme() === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup event listener on unmount
    onCleanup(() => {
      mediaQuery.removeEventListener('change', handleChange);
    });
  });

  // Re-apply theme only after mounting and when theme changes
  createEffect(() => {
    const currentTheme = theme();
    if (isMounted()) {
      applyTheme(currentTheme);
    }
  });

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  // Explicit fallback for hydration safety - useContext can return undefined during SSR/hydration
  return context ?? defaultThemeContext;
}
