/**
 * @fileoverview 도구 카테고리 정의 및 유틸리티 (Tool Categories & Utilities)
 *
 * 앱에서 제공하는 모든 도구의 메타데이터를 정의하고 조회 유틸리티를 제공합니다.
 * Defines metadata for all tools and provides lookup utilities.
 *
 * @module toolCategories
 */

import type { ToolType } from '~/stores/tool-store';

// ========================================
// Tool Categories - 도구 카테고리 정의
// ========================================

export interface ToolInfo {
  id: ToolType;
  slug: string; // URL path (e.g., 'metronome', 'drum-machine', 'qr')
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

export interface ToolCategory {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  tools: ToolInfo[];
}

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
        icon: '⏱️',
        description: {
          ko: '정확한 템포 연습을 위한 메트로놈',
          en: 'Precision metronome for tempo practice',
        },
      },
      {
        id: 'drumMachine',
        slug: 'drum-machine',
        name: { ko: '드럼머신', en: 'Drum Machine' },
        icon: '🥁',
        description: { ko: '16스텝 드럼 패턴 시퀀서', en: '16-step drum pattern sequencer' },
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
        icon: '📱',
        description: {
          ko: 'URL이나 텍스트를 QR 코드로 변환',
          en: 'Convert URL or text to QR code',
        },
      },
      {
        id: 'translator',
        slug: 'translator',
        name: { ko: '번역기', en: 'Translator' },
        icon: '🌐',
        description: {
          ko: '한국어 ↔ 영어 사전 기반 번역',
          en: 'Korean ↔ English dictionary-based translation',
        },
      },
    ],
  },
];

// Flat list of all tools
export const ALL_TOOLS: ToolInfo[] = TOOL_CATEGORIES.flatMap((cat) => cat.tools);

// Map caches for O(1) lookup instead of O(n) find()
const toolById = new Map<ToolType, ToolInfo>(ALL_TOOLS.map((t) => [t.id, t]));
const toolBySlug = new Map<string, ToolInfo>(ALL_TOOLS.map((t) => [t.slug, t]));

/**
 * 도구 ID로 도구 정보를 조회합니다. O(1) 시간 복잡도.
 * Gets tool info by ID. O(1) time complexity.
 *
 * @param {ToolType} id - 도구 ID (예: 'metronome', 'drumMachine')
 * @returns {ToolInfo | undefined} 도구 정보 객체 또는 undefined
 *
 * @example
 * const metronome = getToolInfo('metronome');
 * // {
 * //   id: 'metronome',
 * //   slug: 'metronome',
 * //   name: { ko: '메트로놈', en: 'Metronome' },
 * //   icon: '⏱️',
 * //   description: { ko: '정확한 템포 연습을 위한 메트로놈', en: '...' }
 * // }
 *
 * @example
 * const unknown = getToolInfo('invalid' as ToolType);
 * // undefined
 */
export const getToolInfo = (id: ToolType): ToolInfo | undefined => {
  return toolById.get(id);
};

/**
 * URL slug로 도구 정보를 조회합니다. O(1) 시간 복잡도.
 * Gets tool info by URL slug. O(1) time complexity.
 *
 * @param {string} slug - URL 경로용 슬러그 (예: 'metronome', 'drum-machine')
 * @returns {ToolInfo | undefined} 도구 정보 객체 또는 undefined
 *
 * @example
 * const drum = getToolBySlug('drum-machine');
 * // {
 * //   id: 'drumMachine',
 * //   slug: 'drum-machine',
 * //   name: { ko: '드럼머신', en: 'Drum Machine' },
 * //   ...
 * // }
 *
 * @example
 * // URL 라우팅에서 사용
 * const tool = getToolBySlug(params.slug);
 * if (!tool) return <NotFound />;
 */
export const getToolBySlug = (slug: string): ToolInfo | undefined => {
  return toolBySlug.get(slug);
};

/**
 * 도구의 표시 이름을 로케일에 맞게 반환합니다.
 * Returns the tool's display name for the specified locale.
 *
 * @param {ToolType} id - 도구 ID
 * @param {'ko' | 'en'} [locale='ko'] - 언어 코드 (기본값: 'ko')
 * @returns {string} 도구 표시 이름. 도구를 찾을 수 없으면 ID를 그대로 반환.
 *
 * @example
 * getToolName('metronome');        // '메트로놈'
 * getToolName('metronome', 'en');  // 'Metronome'
 * getToolName('metronome', 'ko');  // '메트로놈'
 *
 * @example
 * // 봇 응답에서 사용
 * const name = getToolName(intent.tool, userLocale);
 * return `${name}을(를) 열게요!`;
 */
export const getToolName = (id: ToolType, locale: 'ko' | 'en' = 'ko'): string => {
  const tool = toolById.get(id);
  return tool?.name[locale] ?? id;
};
