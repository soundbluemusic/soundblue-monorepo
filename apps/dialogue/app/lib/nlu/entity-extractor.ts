/**
 * @fileoverview Entity Extraction System
 *
 * Extracts named entities from user input
 */

export type EntityType =
  | 'person'
  | 'place'
  | 'time'
  | 'date'
  | 'number'
  | 'url'
  | 'email'
  | 'product'
  | 'tech';

export interface Entity {
  type: EntityType;
  value: string;
  start: number;
  end: number;
}

const ENTITY_PATTERNS: Record<EntityType, RegExp[]> = {
  email: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],
  url: [
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
  ],
  number: [/\b\d+(?:\.\d+)?\b/g],
  time: [
    /\b(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\b/gi,
    /\b(?:오전|오후)\s?\d{1,2}시\s?\d{1,2}분?\b/g,
  ],
  date: [
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g,
    /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g,
    /\b\d{4}년\s?\d{1,2}월\s?\d{1,2}일?\b/g,
  ],
  tech: [
    /\b(React|TypeScript|JavaScript|Python|Java|Node\.js|Vue|Angular|Docker|Kubernetes|AWS|Azure|GCP)\b/gi,
  ],
  product: [/\b(iPhone|iPad|MacBook|Windows|Linux|Android|Chrome|Firefox|Safari)\b/gi],
  person: [], // Will be enhanced with more patterns
  place: [], // Will be enhanced with more patterns
};

const _TECH_KEYWORDS = new Set([
  'react',
  'typescript',
  'javascript',
  'python',
  'java',
  'node',
  'vue',
  'angular',
  'docker',
  'kubernetes',
  'pwa',
  'api',
  'db',
  'database',
]);

export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  const seen = new Set<string>(); // Prevent duplicates

  for (const [type, patterns] of Object.entries(ENTITY_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          const value = match[0];
          const key = `${type}:${value}:${match.index}`;

          if (!seen.has(key)) {
            seen.add(key);
            entities.push({
              type: type as EntityType,
              value,
              start: match.index,
              end: match.index + value.length,
            });
          }
        }
      }
    }
  }

  // Sort by start position
  entities.sort((a, b) => a.start - b.start);

  return entities;
}
