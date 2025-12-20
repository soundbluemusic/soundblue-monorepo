/**
 * @fileoverview Theme Provider for Sound Blue
 * Re-exports shared ThemeProvider with app-specific configuration.
 * @module ThemeProvider
 */

import {
  ThemeProvider as SharedThemeProvider,
  useTheme as sharedUseTheme,
} from '@soundblue/shared/providers';
import type { JSX, ParentComponent } from 'solid-js';

/**
 * Available theme options for the application.
 * Note: 'system' is also available from shared provider.
 */
export type Theme = 'light' | 'dark';

/**
 * Context value provided by ThemeProvider.
 */
interface ThemeContextValue {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme context provider component for Sound Blue.
 * Uses shared provider with 'sb-theme' storage key.
 */
export const ThemeProvider: ParentComponent = (props): JSX.Element => {
  return (
    <SharedThemeProvider storageKey="sb-theme" defaultTheme="light" ssrDefault="light">
      {props.children}
    </SharedThemeProvider>
  );
};

/**
 * Hook to access the theme context.
 */
export function useTheme(): ThemeContextValue {
  const shared = sharedUseTheme();
  return {
    theme: shared.resolvedTheme as () => Theme,
    setTheme: (t: Theme) => shared.setTheme(t),
    toggleTheme: shared.toggleTheme,
  };
}
