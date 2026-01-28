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

import type { ToolType } from '~/stores/tool-store';

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
 * @property {string} id - Unique category identifier (e.g., 'rhythm', 'language', 'visual', 'utility')
 * @property {{ ko: string; en: string }} name - Localized category name
 * @property {{ ko: string; en: string }} description - Localized category description (target audience)
 * @property {ToolInfo[]} tools - Array of tools in this category
 *
 * @example
 * ```ts
 * const rhythmCategory: ToolCategory = {
 *   id: 'rhythm',
 *   name: { ko: '리듬', en: 'Rhythm' },
 *   description: { ko: '뮤지션을 위한 박자 도구', en: 'Tempo tools for musicians' },
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
  description: {
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
    id: 'musicians',
    name: {
      ko: '🎵 뮤지션용 도구',
      en: '🎵 Musician Tools',
    },
    description: {
      ko: '연주와 작곡을 위한 음악 도구',
      en: 'Music tools for performance and composition',
    },
    tools: [
      {
        id: 'metronome',
        slug: 'metronome',
        name: { ko: '메트로놈', en: 'Metronome' },
        icon: '◴',
        description: {
          ko: '정확한 박자 연습으로 연주 실력 향상',
          en: 'Improve your performance with precise tempo practice',
        },
      },
      {
        id: 'drumMachine',
        slug: 'drum-machine',
        name: { ko: '드럼머신', en: 'Drum Machine' },
        icon: '⬢',
        description: {
          ko: '리듬 패턴 실험과 작곡을 위한 16스텝 시퀀서',
          en: '16-step sequencer for rhythm experimentation and composition',
        },
      },
      {
        id: 'tapTempo',
        slug: 'tap-tempo',
        name: { ko: '탭 템포', en: 'TAP Tempo' },
        icon: '◉',
        description: {
          ko: '곡의 BPM을 빠르게 파악하여 연주에 활용',
          en: 'Quickly detect song BPM for your performance',
        },
      },
      {
        id: 'delayCalculator',
        slug: 'delay-calculator',
        name: { ko: '딜레이 계산기', en: 'Delay Calculator' },
        icon: '⧗',
        description: {
          ko: '프로듀서와 엔지니어를 위한 BPM 기반 딜레이 타임 계산',
          en: 'Calculate delay times based on BPM for producers and engineers',
        },
      },
    ],
  },
  {
    id: 'writers',
    name: {
      ko: '✍️ 작가용 도구',
      en: '✍️ Writer Tools',
    },
    description: {
      ko: '글쓰기와 번역을 위한 언어 도구',
      en: 'Language tools for writing and translation',
    },
    tools: [
      {
        id: 'translator',
        slug: 'translator',
        name: { ko: '번역기', en: 'Translator' },
        icon: '⇄',
        description: {
          ko: '다국어 어휘력 향상과 가사 번역을 위한 한영 번역',
          en: 'Korean ↔ English translation for vocabulary building and lyrics',
        },
      },
      {
        id: 'spellChecker',
        slug: 'spell-checker',
        name: { ko: '한국어 맞춤법 검사기', en: 'Korean Spell Checker' },
        icon: '✎',
        description: {
          ko: '한국어 글쓰기 품질 향상을 위한 맞춤법·띄어쓰기 검사',
          en: 'Improve Korean writing quality with spelling and spacing checks',
        },
      },
      {
        id: 'englishSpellChecker',
        slug: 'english-spell-checker',
        name: { ko: '영어 맞춤법 검사기', en: 'English Spell Checker' },
        icon: '✏',
        description: {
          ko: '영어 글쓰기 품질 향상을 위한 철자 검사',
          en: 'Improve English writing quality with spell checking',
        },
      },
    ],
  },
  {
    id: 'designers',
    name: {
      ko: '🎨 디자이너용 도구',
      en: '🎨 Designer Tools',
    },
    description: {
      ko: '색상과 디자인을 위한 시각 도구',
      en: 'Visual tools for color and design',
    },
    tools: [
      {
        id: 'colorHarmony',
        slug: 'color-harmony',
        name: { ko: '컬러 하모니', en: 'Color Harmony' },
        icon: '🎨',
        description: {
          ko: '배색 이론을 배우고 작품에 적용하는 색상환 도구',
          en: 'Learn color theory and apply harmonious schemes to your work',
        },
      },
      {
        id: 'colorPalette',
        slug: 'color-palette',
        name: { ko: '컬러 팔레트', en: 'Color Palette' },
        icon: '🌈',
        description: {
          ko: '작품의 컬러 스킴을 구성하는 팔레트 생성',
          en: 'Create color palettes for your artwork and designs',
        },
      },
      {
        id: 'colorDecomposer',
        slug: 'color-decomposer',
        name: { ko: '색상 분해', en: 'Color Decomposer' },
        icon: '💠',
        description: {
          ko: '색상 분석 능력 향상을 위한 혼합 원리 학습',
          en: 'Improve color analysis skills by learning mixing principles',
        },
      },
    ],
  },
  {
    id: 'marketers',
    name: {
      ko: '📢 마케터용 도구',
      en: '📢 Marketer Tools',
    },
    description: {
      ko: '홍보와 공유를 위한 마케팅 도구',
      en: 'Marketing tools for promotion and sharing',
    },
    tools: [
      {
        id: 'qr',
        slug: 'qr',
        name: { ko: 'QR 생성기', en: 'QR Generator' },
        icon: '⬚',
        description: {
          ko: '작품과 포트폴리오를 쉽게 공유하는 QR 코드 생성',
          en: 'Create QR codes to easily share your work and portfolio',
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

// Tool Component Registry moved to ~/lib/tool-loaders.ts for code splitting
// Import from there if you need lazy-loaded tool components
