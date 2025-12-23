/**
 * @fileoverview Context Management System
 *
 * Manages conversation history and context tracking
 */

import type { Entity } from './entity-extractor';
import type { IntentResult } from './intent-classifier';
import type { SentimentResult } from './sentiment-analyzer';

export interface ConversationTurn {
  userInput: string;
  assistantResponse: string;
  intent: IntentResult;
  sentiment: SentimentResult;
  entities: Entity[];
  timestamp: number;
}

export interface ConversationContext {
  history: ConversationTurn[];
  recentEntities: Entity[];
  lastIntent: IntentResult | null;
  lastSentiment: SentimentResult | null;
  sessionStart: number;
}

const MAX_HISTORY = 10;
const MAX_ENTITIES = 20;

let globalContext: ConversationContext = {
  history: [],
  recentEntities: [],
  lastIntent: null,
  lastSentiment: null,
  sessionStart: Date.now(),
};

export function getContext(): ConversationContext {
  return globalContext;
}

export function addToContext(turn: ConversationTurn): void {
  // Add to history
  globalContext.history.push(turn);

  // Keep only recent history
  if (globalContext.history.length > MAX_HISTORY) {
    globalContext.history.shift();
  }

  // Update recent entities
  for (const entity of turn.entities) {
    // Add if not duplicate
    const exists = globalContext.recentEntities.some(
      (e) => e.type === entity.type && e.value === entity.value,
    );

    if (!exists) {
      globalContext.recentEntities.push(entity);
    }
  }

  // Keep only recent entities
  if (globalContext.recentEntities.length > MAX_ENTITIES) {
    globalContext.recentEntities = globalContext.recentEntities.slice(-MAX_ENTITIES);
  }

  // Update last intent and sentiment
  globalContext.lastIntent = turn.intent;
  globalContext.lastSentiment = turn.sentiment;
}

export function clearContext(): void {
  globalContext = {
    history: [],
    recentEntities: [],
    lastIntent: null,
    lastSentiment: null,
    sessionStart: Date.now(),
  };
}

export function getRecentEntity(type?: Entity['type']): Entity | null {
  const entities = type
    ? globalContext.recentEntities.filter((e) => e.type === type)
    : globalContext.recentEntities;

  return entities[entities.length - 1] || null;
}

export function getLastUserInput(): string | null {
  const last = globalContext.history[globalContext.history.length - 1];
  return last?.userInput || null;
}
