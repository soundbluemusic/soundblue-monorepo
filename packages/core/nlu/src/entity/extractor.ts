/**
 * @fileoverview Entity Extraction System
 *
 * Extracts named entities from user input using regex-based pattern matching.
 * Supports multiple entity types including emails, URLs, dates, times, and
 * technology/product names.
 *
 * ## Architecture Overview
 *
 * The extraction system uses a pattern-based approach:
 *
 * 1. **Pattern Matching**: Each entity type has associated regex patterns
 * 2. **Position Tracking**: Start and end positions are recorded for each match
 * 3. **Deduplication**: Duplicate entities at the same position are filtered
 * 4. **Sorting**: Results are sorted by start position for consistent ordering
 *
 * ## Entity Type Priority
 *
 * When the same text could match multiple entity types, patterns are evaluated
 * in the order they appear in ENTITY_PATTERNS:
 *
 * | Priority | Type | Example |
 * |----------|------|---------|
 * | 1 | email | user@example.com |
 * | 2 | url | https://example.com |
 * | 3 | number | 42, 3.14 |
 * | 4 | time | 2:30 PM, 오후 3시 |
 * | 5 | date | 2024-01-15, 2024년 1월 15일 |
 * | 6 | tech | React, TypeScript |
 * | 7 | product | iPhone, MacBook |
 * | 8 | person | (Reserved for future NER) |
 * | 9 | place | (Reserved for future NER) |
 *
 * ## Usage Example
 *
 * ```typescript
 * import { extractEntities, type Entity } from './entity-extractor';
 *
 * const text = 'Contact me at user@example.com before 2024-12-31';
 * const entities = extractEntities(text);
 *
 * // [
 * //   { type: 'email', value: 'user@example.com', start: 14, end: 30 },
 * //   { type: 'date', value: '2024-12-31', start: 38, end: 48 }
 * // ]
 * ```
 *
 * @module nlu/entity-extractor
 * @see {@link classifyIntent} for intent classification
 * @see {@link analyzeSentiment} for sentiment analysis
 */

/**
 * Supported entity types for extraction.
 *
 * | Type | Description | Example Patterns |
 * |------|-------------|------------------|
 * | person | Personal names | (Reserved - no patterns yet) |
 * | place | Location names | (Reserved - no patterns yet) |
 * | time | Time expressions | 2:30 PM, 오후 3시 |
 * | date | Date expressions | 2024-01-15, 2024년 1월 |
 * | number | Numeric values | 42, 3.14, 1000 |
 * | url | Web URLs | https://example.com |
 * | email | Email addresses | user@example.com |
 * | product | Consumer products | iPhone, MacBook, Windows |
 * | tech | Technology terms | React, TypeScript, Docker |
 *
 * @remarks
 * 'person' and 'place' types are reserved for future Named Entity Recognition
 * (NER) implementation. Currently they have no patterns defined.
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

/**
 * Extracted entity with position information.
 *
 * @property type - The entity type classification
 * @property value - The extracted text value
 * @property start - Start index in the original text (0-based)
 * @property end - End index in the original text (exclusive)
 *
 * @example
 * ```typescript
 * const entity: Entity = {
 *   type: 'email',
 *   value: 'user@example.com',
 *   start: 14,
 *   end: 30,
 * };
 *
 * // Verify extraction
 * const text = 'Contact me at user@example.com';
 * console.log(text.slice(entity.start, entity.end)); // 'user@example.com'
 * ```
 */
export interface Entity {
  type: EntityType;
  value: string;
  start: number;
  end: number;
}

/**
 * Regex patterns for each entity type.
 *
 * All patterns use the global flag (g) to find all matches.
 * Patterns are designed to be:
 * - **Precise**: Minimize false positives
 * - **Bilingual**: Support both English and Korean where applicable
 * - **Non-overlapping**: Patterns for different types should not conflict
 *
 * @remarks
 * - 'person' and 'place' have empty arrays - reserved for future NER
 * - Tech and product lists are curated for common terms in software development
 * - Time/date patterns support both English and Korean formats
 *
 * @internal
 */
const ENTITY_PATTERNS: Record<EntityType, RegExp[]> = {
  // RFC 5321 compliant email pattern
  email: [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],

  // URL pattern supporting http/https with query strings
  url: [
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
  ],

  // Integer and decimal numbers
  number: [/\b\d+(?:\.\d+)?\b/g],

  // Time patterns: "2:30 PM", "14:30:00", "오후 3시 30분"
  time: [
    /\b(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\b/gi,
    /\b(?:오전|오후)\s?\d{1,2}시\s?\d{1,2}분?\b/g,
  ],

  // Date patterns: "2024-01-15", "01/15/2024", "2024년 1월 15일"
  date: [
    /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g,
    /\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g,
    /\b\d{4}년\s?\d{1,2}월\s?\d{1,2}일?\b/g,
  ],

  // Common technology terms (case-insensitive)
  tech: [
    /\b(React|TypeScript|JavaScript|Python|Java|Node\.js|Vue|Angular|Docker|Kubernetes|AWS|Azure|GCP)\b/gi,
  ],

  // Consumer product names (case-insensitive)
  product: [/\b(iPhone|iPad|MacBook|Windows|Linux|Android|Chrome|Firefox|Safari)\b/gi],

  // Reserved for future Named Entity Recognition (NER)
  person: [],

  // Reserved for future Named Entity Recognition (NER)
  place: [],
};

/**
 * Extended technology keywords for context detection.
 *
 * This set includes additional tech terms that may not warrant entity extraction
 * but are useful for context analysis (e.g., detecting technical discussions).
 *
 * @remarks
 * Currently unused but reserved for future context-aware entity extraction.
 *
 * @internal
 */
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

/**
 * Extracts named entities from text input.
 *
 * This function scans the input text for recognizable entities such as
 * emails, URLs, dates, times, numbers, and technology/product names.
 *
 * ## Algorithm Steps
 *
 * 1. **Iterate Pattern Types**: Loop through each entity type in ENTITY_PATTERNS
 * 2. **Match Patterns**: Use `matchAll()` to find all occurrences
 * 3. **Track Position**: Record start/end indices for each match
 * 4. **Deduplicate**: Skip if same type+value+position already found
 * 5. **Sort Results**: Order entities by start position (left to right)
 *
 * ## Deduplication Logic
 *
 * Entities are deduplicated using a composite key: `${type}:${value}:${index}`
 *
 * This means:
 * - Same value at different positions → both included
 * - Same value at same position from different patterns → only first included
 * - Different types matching same text → both included (if patterns overlap)
 *
 * @param text - The input text to extract entities from
 * @returns Array of extracted entities sorted by start position
 *
 * @example Basic extraction
 * ```typescript
 * const text = 'Email me at test@example.com';
 * const entities = extractEntities(text);
 *
 * console.log(entities);
 * // [{ type: 'email', value: 'test@example.com', start: 12, end: 28 }]
 * ```
 *
 * @example Multiple entity types
 * ```typescript
 * const text = 'Meeting at 2024-01-15 14:30 about React project';
 * const entities = extractEntities(text);
 *
 * // [
 * //   { type: 'number', value: '2024', start: 11, end: 15 },
 * //   { type: 'date', value: '2024-01-15', start: 11, end: 21 },
 * //   { type: 'number', value: '01', start: 16, end: 18 },
 * //   { type: 'number', value: '15', start: 19, end: 21 },
 * //   { type: 'time', value: '14:30', start: 22, end: 27 },
 * //   { type: 'tech', value: 'React', start: 34, end: 39 }
 * // ]
 * ```
 *
 * @example Using with context manager
 * ```typescript
 * import { extractEntities } from './entity-extractor';
 * import { addToContext } from './context-manager';
 *
 * const userInput = 'Check https://example.com for details';
 * const entities = extractEntities(userInput);
 *
 * // Store in conversation context
 * addToContext({
 *   userInput,
 *   entities,
 *   // ... other turn data
 * });
 *
 * // Later, retrieve the URL
 * const url = getRecentEntity('url');
 * console.log(url?.value); // 'https://example.com'
 * ```
 *
 * @remarks
 * - Numbers within dates/times may also be extracted as 'number' entities
 * - 'person' and 'place' types return empty results (not yet implemented)
 * - The function is stateless and processes each input independently
 *
 * @see {@link Entity} for the entity structure
 * @see {@link addToContext} for storing entities in conversation context
 */
export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  const seen = new Set<string>(); // Prevent duplicates using type:value:index key

  for (const [type, patterns] of Object.entries(ENTITY_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          const value = match[0];
          // Composite key for deduplication: type + value + position
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

  // Sort by start position for consistent left-to-right ordering
  entities.sort((a, b) => a.start - b.start);

  return entities;
}
