/**
 * @fileoverview Theme Provider for Tools
 * Re-exports shared ThemeProvider with app-specific configuration.
 */

import {
  ThemeProvider as SharedThemeProvider,
  useTheme as sharedUseTheme,
  type Theme,
  type ResolvedTheme,
  type ThemeContextValue,
} from '@soundblue/shared/providers';
import type { ParentComponent } from 'solid-js';

export type { Theme, ResolvedTheme, ThemeContextValue };

/**
 * Theme context provider component for Tools.
 * Uses shared provider with 'theme' storage key and 'light' as default.
 * Theme preference is persisted to IndexedDB.
 */
export const ThemeProvider: ParentComponent = (props) => {
  return (
    <SharedThemeProvider storageKey="theme" defaultTheme="light" ssrDefault="light">
      {props.children}
    </SharedThemeProvider>
  );
};

/**
 * Hook to access the theme context.
 */
export function useTheme(): ThemeContextValue {
  return sharedUseTheme();
}
