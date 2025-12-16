/**
 * @fileoverview Theme Provider for Dialogue
 * Re-exports shared ThemeProvider with app-specific configuration.
 */

import {
  ThemeProvider as SharedThemeProvider,
  useTheme as sharedUseTheme,
} from '@soundblue/shared/providers';
import type { ParentComponent } from 'solid-js';

export type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

/**
 * Theme context provider component for Dialogue.
 * Uses shared provider with 'dialogue-theme' storage key and 'dark' as default.
 */
export const ThemeProvider: ParentComponent = (props) => {
  return (
    <SharedThemeProvider storageKey="dialogue-theme" defaultTheme="dark" ssrDefault="dark">
      {props.children}
    </SharedThemeProvider>
  );
};

/**
 * Hook to access the theme context.
 */
export function useTheme(): ThemeContextType {
  const shared = sharedUseTheme();
  return {
    theme: shared.resolvedTheme as () => Theme,
    setTheme: (t: Theme) => shared.setTheme(t),
    toggleTheme: shared.toggleTheme,
  };
}
