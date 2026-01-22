/**
 * @fileoverview Tool Categories Registry & Utilities
 *
 * Central registry for all available tools in the Tools app.
 * Provides type-safe tool definitions, category groupings, and
 * lookup utilities for routing and UI rendering.
 *
 * This module is the single source of truth for:
 * - Available tools and their metadata
 * - Tool categories for navigation/grouping
 * - Localized names and descriptions (Korean/English)
 * - Lazy-loaded component loaders for code splitting
 *
 * @module lib/toolCategories
 *
 * @example
 * ```tsx
 * // Render a tool navigation menu
 * import { TOOL_CATEGORIES, getToolName } from '~/lib/toolCategories';
 *
 * function ToolNav({ locale }: { locale: 'ko' | 'en' }) {
 *   return (
 *     <nav>
 *       {TOOL_CATEGORIES.map((category) => (
 *         <div key={category.id}>
 *           <h3>{category.name[locale]}</h3>
 *           {category.tools.map((tool) => (
 *             <a key={tool.id} href={`/${tool.slug}`}>
 *               {tool.icon} {tool.name[locale]}
 *             </a>
 *           ))}
 *         </div>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */

import { type ComponentType, lazy } from 'react';
import type { ToolType } from '~/stores/tool-store';

// biome-ignore lint/suspicious/noExplicitAny: Dynamic tool components have varying props that cannot be unified
type AnyToolComponent = ComponentType<any>;
type LazyToolComponent = React.LazyExoticComponent<AnyToolComponent>;

/**
 * Metadata for an individual tool.
 *
 * Contains all information needed to display and route to a tool,
 * including localized text for Korean and English.
 *
 * @interface ToolInfo
 *
 * @property {ToolType} id - Unique identifier matching the store's ToolType union
 * @property {string} slug - URL-safe slug for routing (e.g., 'drum-machine')
 * @property {{ ko: string; en: string }} name - Localized display name
 * @property {string} icon - Emoji icon for visual identification
 * @property {{ ko: string; en: string }} description - Localized tool description
 *
 * @example
 * ```ts
 * const tool: ToolInfo = {
 *   id: 'metronome',
 *   slug: 'metronome',
 *   name: { ko: '메트로놈', en: 'Metronome' },
 *   icon: '⏱️',
 *   description: {
 *     ko: '정확한 템포 연습을 위한 메트로놈',
 *     en: 'Precision metronome for tempo practice',
 *   },
 * };
 * ```
 */
export interface ToolInfo {
  id: ToolType;
  slug: string;
  name: {
    ko: string;
    en: string;
  };
  icon: string;
  description: {
    ko: string;
    en: string;
  };
}

/**
 * A category grouping related tools together.
 *
 * Used for navigation menus and organizing tools by functionality.
 *
 * @interface ToolCategory
 *
 * @property {string} id - Unique category identifier (e.g., 'rhythm', 'utility')
 * @property {{ ko: string; en: string }} name - Localized category name
 * @property {ToolInfo[]} tools - Array of tools in this category
 *
 * @example
 * ```ts
 * const rhythmCategory: ToolCategory = {
 *   id: 'rhythm',
 *   name: { ko: '리듬', en: 'Rhythm' },
 *   tools: [metronome, drumMachine],
 * };
 * ```
 */
export interface ToolCategory {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  tools: ToolInfo[];
}

/**
 * Complete list of tool categories with their tools.
 *
 * This is the primary data source for tool navigation and discovery.
 * Categories are ordered for display in the sidebar/navigation.
 *
 * @constant
 * @type {ToolCategory[]}
 *
 * @example
 * ```tsx
 * // Count total tools
 * const totalTools = TOOL_CATEGORIES.reduce(
 *   (sum, cat) => sum + cat.tools.length,
 *   0
 * );
 *
 * // Find a category
 * const rhythmCategory = TOOL_CATEGORIES.find(c => c.id === 'rhythm');
 * ```
 */
export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'rhythm',
    name: {
      ko: '리듬',
      en: 'Rhythm',
    },
    tools: [
      {
        id: 'metronome',
        slug: 'metronome',
        name: { ko: '메트로놈', en: 'Metronome' },
        icon: '◴',
        description: {
          ko: '정확한 템포 연습을 위한 메트로놈',
          en: 'Precision metronome for tempo practice',
        },
      },
      {
        id: 'drumMachine',
        slug: 'drum-machine',
        name: { ko: '드럼머신', en: 'Drum Machine' },
        icon: '⬢',
        description: { ko: '16스텝 드럼 패턴 시퀀서', en: '16-step drum pattern sequencer' },
      },
      {
        id: 'delayCalculator',
        slug: 'delay-calculator',
        name: { ko: '딜레이 계산기', en: 'Delay Calculator' },
        icon: '⧗',
        description: {
          ko: 'BPM 기반 딜레이 타임 계산',
          en: 'Calculate delay times based on BPM',
        },
      },
      {
        id: 'tapTempo',
        slug: 'tap-tempo',
        name: { ko: '탭 템포', en: 'TAP Tempo' },
        icon: '◉',
        description: {
          ko: '박자에 맞춰 탭하여 BPM 감지',
          en: 'Tap to detect BPM',
        },
      },
    ],
  },
  {
    id: 'utility',
    name: {
      ko: '유틸',
      en: 'Utility',
    },
    tools: [
      {
        id: 'qr',
        slug: 'qr',
        name: { ko: 'QR 생성기', en: 'QR Generator' },
        icon: '⬚',
        description: {
          ko: 'URL이나 텍스트를 QR 코드로 변환',
          en: 'Convert URL or text to QR code',
        },
      },
      {
        id: 'translator',
        slug: 'translator',
        name: { ko: '번역기', en: 'Translator' },
        icon: '⇄',
        description: {
          ko: '한국어 ↔ 영어 알고리즘 기반 번역',
          en: 'Korean ↔ English algorithm-based translation',
        },
      },
      {
        id: 'spellChecker',
        slug: 'spell-checker',
        name: { ko: '한국어 맞춤법 검사기', en: 'Korean Spell Checker' },
        icon: '✎',
        description: {
          ko: '한국어 맞춤법, 띄어쓰기, 문법 검사',
          en: 'Check Korean spelling, spacing, and grammar',
        },
      },
      {
        id: 'englishSpellChecker',
        slug: 'english-spell-checker',
        name: { ko: '영어 맞춤법 검사기', en: 'English Spell Checker' },
        icon: '✏',
        description: {
          ko: '영어 철자 검사 및 수정 제안',
          en: 'Check English spelling with suggestions',
        },
      },
      {
        id: 'colorHarmony',
        slug: 'color-harmony',
        name: { ko: '컬러 하모니', en: 'Color Harmony' },
        icon: '🎨',
        description: {
          ko: '색상환 기반 조화로운 배색 생성',
          en: 'Generate harmonious color schemes based on color wheel',
        },
      },
      {
        id: 'colorPalette',
        slug: 'color-palette',
        name: { ko: '컬러 팔레트', en: 'Color Palette' },
        icon: '🌈',
        description: {
          ko: '2~5개 색상 조합 팔레트 생성',
          en: 'Create custom color palettes with 2-5 colors',
        },
      },
      {
        id: 'colorDecomposer',
        slug: 'color-decomposer',
        name: { ko: '색상 분해', en: 'Color Decomposer' },
        icon: '💠',
        description: {
          ko: '색상 혼합 원리를 배우는 분해 도구',
          en: 'Learn color mixing by decomposing colors into components',
        },
      },
    ],
  },
];

/**
 * Flat array of all available tools across all categories.
 *
 * Useful for search, iteration, and when category grouping isn't needed.
 *
 * @constant
 * @type {ToolInfo[]}
 *
 * @example
 * ```tsx
 * // Search tools by name
 * const searchResults = ALL_TOOLS.filter(tool =>
 *   tool.name.en.toLowerCase().includes(query.toLowerCase())
 * );
 * ```
 */
export const ALL_TOOLS: ToolInfo[] = TOOL_CATEGORIES.flatMap((cat) => cat.tools);

// Internal lookup maps for O(1) access
const toolById = new Map<ToolType, ToolInfo>(ALL_TOOLS.map((t) => [t.id, t]));
const toolBySlug = new Map<string, ToolInfo>(ALL_TOOLS.map((t) => [t.slug, t]));

/**
 * Look up tool metadata by its unique ID.
 *
 * Uses an internal Map for O(1) lookup performance.
 *
 * @param {ToolType} id - The tool's unique identifier
 * @returns {ToolInfo | undefined} Tool metadata, or undefined if not found
 *
 * @example
 * ```tsx
 * const metronome = getToolInfo('metronome');
 * if (metronome) {
 *   console.log(metronome.name.en); // 'Metronome'
 * }
 * ```
 */
export const getToolInfo = (id: ToolType): ToolInfo | undefined => {
  return toolById.get(id);
};

/**
 * Look up tool metadata by its URL slug.
 *
 * Primary use case is route matching - converting URL slugs
 * (e.g., 'drum-machine') back to tool metadata.
 *
 * @param {string} slug - URL-safe slug (e.g., 'drum-machine')
 * @returns {ToolInfo | undefined} Tool metadata, or undefined if not found
 *
 * @example
 * ```tsx
 * // In a route loader
 * export function loader({ params }: Route.LoaderArgs) {
 *   const tool = getToolBySlug(params.toolSlug);
 *   if (!tool) {
 *     throw new Response('Not Found', { status: 404 });
 *   }
 *   return { tool };
 * }
 * ```
 */
export const getToolBySlug = (slug: string): ToolInfo | undefined => {
  return toolBySlug.get(slug);
};

/**
 * Get a tool's localized display name.
 *
 * Convenience function that handles the common pattern of
 * looking up a tool and extracting its name for a specific locale.
 *
 * @param {ToolType} id - The tool's unique identifier
 * @param {'ko' | 'en'} locale - Target locale (defaults to 'ko')
 * @returns {string} Localized name, or the ID as fallback if tool not found
 *
 * @example
 * ```tsx
 * // Get English name
 * const name = getToolName('drumMachine', 'en');
 * // Returns: 'Drum Machine'
 *
 * // Get Korean name (default)
 * const koreanName = getToolName('metronome');
 * // Returns: '메트로놈'
 *
 * // Unknown tool returns ID as fallback
 * const unknown = getToolName('unknown' as ToolType, 'en');
 * // Returns: 'unknown'
 * ```
 */
export const getToolName = (id: ToolType, locale: 'ko' | 'en' = 'ko'): string => {
  const tool = toolById.get(id);
  return tool?.name[locale] ?? id;
};

// ========================================
// Tool Component Registry (Lazy Loading)
// ========================================

/**
 * Registry of lazy-loaded tool components.
 *
 * Each tool is loaded on-demand when first accessed, enabling
 * optimal code splitting. Adding a new tool only requires:
 * 1. Adding the tool to TOOL_CATEGORIES
 * 2. Adding the lazy component loader here
 *
 * @constant
 * @type {Record<ToolType, LazyToolComponent>}
 *
 * @example
 * ```tsx
 * // In ToolContainer
 * const LazyComponent = TOOL_COMPONENTS[currentTool];
 * return <LazyComponent settings={settings} onSettingsChange={onChange} />;
 * ```
 */
export const TOOL_COMPONENTS: Record<ToolType, LazyToolComponent> = {
  metronome: lazy(() => import('~/tools/metronome').then((m) => ({ default: m.Metronome }))),
  drumMachine: lazy(() => import('~/tools/drum-machine').then((m) => ({ default: m.DrumMachine }))),
  delayCalculator: lazy(() =>
    import('~/tools/delay-calculator').then((m) => ({ default: m.DelayCalculator })),
  ),
  tapTempo: lazy(() => import('~/tools/tap-tempo').then((m) => ({ default: m.TapTempo }))),
  // Use individual entry points to avoid loading entire ui-components bundle
  qr: lazy(() =>
    import('@soundblue/ui-components/composite/tool/qr-generator').then((m) => ({
      default: m.QRGenerator,
    })),
  ),
  translator: lazy(() =>
    import('@soundblue/ui-components/composite/tool/translator').then((m) => ({
      default: m.Translator,
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
 *
 * @param {ToolType} id - The tool's unique identifier
 * @returns {LazyToolComponent | undefined} Lazy component, or undefined if not found
 *
 * @example
 * ```tsx
 * const Component = getToolComponent('metronome');
 * if (Component) {
 *   return <Component settings={settings} onSettingsChange={onChange} />;
 * }
 * ```
 */
export const getToolComponent = (id: ToolType): LazyToolComponent | undefined => {
  return TOOL_COMPONENTS[id];
};
