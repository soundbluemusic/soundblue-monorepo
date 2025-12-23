/**
 * @fileoverview Unified NLU System
 *
 * Integrates all NLU components into a single analysis pipeline
 */

import type { ImplicitMeaning, ReferenceResolution, SpeechActResult } from './advanced-analysis';
import { analyzeSpeechAct, detectImplicitMeaning, resolveReferences } from './advanced-analysis';
import { getRecentEntity } from './context-manager';
import type { Entity } from './entity-extractor';

import { extractEntities } from './entity-extractor';
import type { IntentResult } from './intent-classifier';
import { classifyIntent } from './intent-classifier';
import type { SentimentResult } from './sentiment-analyzer';
import { analyzeSentiment } from './sentiment-analyzer';

export interface NLUResult {
  // Original input
  text: string;
  locale: string;

  // Core analysis
  intent: IntentResult;
  sentiment: SentimentResult;
  speechAct: SpeechActResult;

  // Entity extraction
  entities: Entity[];

  // Advanced analysis
  references: ReferenceResolution;
  implicitMeaning: ImplicitMeaning;

  // Metadata
  timestamp: number;
}

/**
 * Complete NLU analysis of user input
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

  const result: NLUResult = {
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

  return result;
}

export * from './advanced-analysis';
export * from './context-manager';
export * from './entity-extractor';
// Re-export types and functions
export * from './intent-classifier';
export * from './sentiment-analyzer';
