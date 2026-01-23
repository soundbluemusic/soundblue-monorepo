/**
 * @fileoverview Tool Component Loaders
 *
 * Lazy-loaded tool components registry.
 * Separated from toolCategories.ts to enable proper code splitting.
 *
 * IMPORTANT: This file should only be imported by ToolContainer.
 * Do NOT import this file elsewhere to prevent bundle pollution.
 *
 * @module lib/tool-loaders
 */

import { type ComponentType, lazy } from 'react';
import type { ToolType } from '~/stores/tool-store';

// biome-ignore lint/suspicious/noExplicitAny: Dynamic tool components have varying props
type AnyToolComponent = ComponentType<any>;
type LazyToolComponent = React.LazyExoticComponent<AnyToolComponent>;

/**
 * Registry of lazy-loaded tool components.
 *
 * Each tool is loaded on-demand when first accessed.
 */
/**
 * Tool types handled by ToolContainer (via MainLayout).
 * Translator is excluded as it uses its own TranslatorLayout.
 */
type LoadableToolType = Exclude<ToolType, 'translator'>;

export const TOOL_COMPONENTS: Record<LoadableToolType, LazyToolComponent> = {
  metronome: lazy(() => import('~/tools/metronome').then((m) => ({ default: m.Metronome }))),
  drumMachine: lazy(() => import('~/tools/drum-machine').then((m) => ({ default: m.DrumMachine }))),
  delayCalculator: lazy(() =>
    import('~/tools/delay-calculator').then((m) => ({ default: m.DelayCalculator })),
  ),
  tapTempo: lazy(() => import('~/tools/tap-tempo').then((m) => ({ default: m.TapTempo }))),
  qr: lazy(() =>
    import('@soundblue/ui-components/composite/tool/qr-generator').then((m) => ({
      default: m.QRGenerator,
    })),
  ),
  spellChecker: lazy(() =>
    import('~/tools/spell-checker').then((m) => ({ default: m.SpellChecker })),
  ),
  englishSpellChecker: lazy(() =>
    import('~/tools/english-spell-checker').then((m) => ({ default: m.EnglishSpellChecker })),
  ),
  colorHarmony: lazy(() =>
    import('~/tools/color-harmony').then((m) => ({ default: m.ColorHarmony })),
  ),
  colorPalette: lazy(() =>
    import('~/tools/color-palette').then((m) => ({ default: m.ColorPalette })),
  ),
  colorDecomposer: lazy(() =>
    import('~/tools/color-decomposer').then((m) => ({ default: m.ColorDecomposer })),
  ),
};

/**
 * Get a lazy-loaded tool component by its ID.
 * Returns undefined for translator (which uses TranslatorLayout directly).
 */
export const getToolComponent = (id: ToolType): LazyToolComponent | undefined => {
  if (id === 'translator') return undefined;
  return TOOL_COMPONENTS[id as LoadableToolType];
};
