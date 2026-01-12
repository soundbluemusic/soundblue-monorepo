/**
 * @fileoverview Unified NLU Analysis Pipeline
 *
 * Integrates all NLU components into a single analysis pipeline.
 * This is the main entry point for complete NLU analysis.
 *
 * @module nlu/analyze
 */

import { getRecentEntity } from './dialogue/context-manager';
import { type Entity, extractEntities } from './entity/extractor';
import { classifyIntent, type IntentResult } from './intent/classifier';
import type { ImplicitMeaning, ReferenceResolution } from './response/advanced-analysis';
import {
  analyzeSpeechAct,
  detectImplicitMeaning,
  resolveReferences,
  type SpeechActResult,
} from './response/advanced-analysis';
import { analyzeSentiment, type SentimentResult } from './sentiment/analyzer';

/**
 * Complete NLU analysis result
 */
export interface NLUResult {
  /** Original input text */
  text: string;
  /** Locale of the input (e.g., 'en', 'ko') */
  locale: string;

  /** Intent classification result */
  intent: IntentResult;
  /** Sentiment analysis result */
  sentiment: SentimentResult;
  /** Speech act analysis result */
  speechAct: SpeechActResult;

  /** Extracted entities from the input */
  entities: Entity[];

  /** Reference resolution result */
  references: ReferenceResolution;
  /** Implicit meaning detection result */
  implicitMeaning: ImplicitMeaning;

  /** Timestamp when analysis was performed */
  timestamp: number;
}

/**
 * Complete NLU analysis of user input
 *
 * Performs all NLU analysis steps in sequence:
 * 1. Intent classification
 * 2. Sentiment analysis
 * 3. Speech act analysis
 * 4. Entity extraction
 * 5. Reference resolution
 * 6. Implicit meaning detection
 *
 * @param text - User input text to analyze
 * @param locale - Locale of the input ('en' or 'ko')
 * @returns Complete NLU analysis result
 *
 * @example
 * ```typescript
 * const result = analyzeInput('안녕하세요!', 'ko');
 * console.log(result.intent); // { intent: 'greeting', confidence: 0.95 }
 * console.log(result.sentiment); // { sentiment: 'positive', polarity: 0.8, ... }
 * ```
 */
export function analyzeInput(text: string, locale: string): NLUResult {
  // 1. Intent classification
  const intent = classifyIntent(text, locale);

  // 2. Sentiment analysis
  const sentiment = analyzeSentiment(text, locale);

  // 3. Speech act analysis
  const speechAct = analyzeSpeechAct(text, locale);

  // 4. Entity extraction
  const entities = extractEntities(text);

  // 5. Reference resolution
  const recentEntity = getRecentEntity();
  const references = resolveReferences(text, locale, recentEntity?.value);

  // 6. Implicit meaning detection
  const implicitMeaning = detectImplicitMeaning(text, sentiment.polarity);

  return {
    text,
    locale,
    intent,
    sentiment,
    speechAct,
    entities,
    references,
    implicitMeaning,
    timestamp: Date.now(),
  };
}
