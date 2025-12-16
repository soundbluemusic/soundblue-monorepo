import type { ToolType } from '@/stores/tool-store';

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

// Get tool by ID - O(1)
export const getToolInfo = (id: ToolType): ToolInfo | undefined => {
  return toolById.get(id);
};

// Get tool by URL slug - O(1)
export const getToolBySlug = (slug: string): ToolInfo | undefined => {
  return toolBySlug.get(slug);
};

// Get tool display name
export const getToolName = (id: ToolType, locale: 'ko' | 'en' = 'ko'): string => {
  const tool = toolById.get(id);
  return tool?.name[locale] ?? id;
};
