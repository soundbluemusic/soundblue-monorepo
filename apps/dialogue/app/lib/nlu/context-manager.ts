/**
 * @fileoverview Context Management System
 *
 * Manages conversation history and context tracking for the dialogue system.
 * Provides a global state manager for maintaining conversation continuity
 * across multiple user-assistant exchanges.
 *
 * ## Architecture Overview
 *
 * The context manager maintains a global `ConversationContext` that tracks:
 *
 * 1. **History**: Last N conversation turns (user input + assistant response)
 * 2. **Recent Entities**: Extracted entities from recent turns (deduplicated)
 * 3. **Last Intent/Sentiment**: Most recent NLU analysis results
 * 4. **Session Timing**: When the conversation started
 *
 * ## Memory Management
 *
 * To prevent unbounded memory growth, the manager enforces limits:
 *
 * - **MAX_HISTORY (10)**: Maximum conversation turns to keep
 *   - Oldest turns are removed when limit is exceeded (FIFO)
 *   - Provides ~5-10 minutes of context at typical conversation pace
 *
 * - **MAX_ENTITIES (20)**: Maximum entities to track
 *   - Oldest entities are removed when limit is exceeded
 *   - Enables referencing recently mentioned items (dates, URLs, etc.)
 *
 * ## Lifecycle
 *
 * ```
 * Session Start           During Conversation         Session End
 * ─────────────           ───────────────────         ───────────
 *
 * clearContext()  ──►  addToContext(turn)  ──►  clearContext()
 *      │                      │                       │
 *      ▼                      ▼                       ▼
 * Initialize          Update history,           Reset to initial
 * global context      entities, last*           state
 * ```
 *
 * ## Usage Example
 *
 * ```typescript
 * import {
 *   addToContext,
 *   getContext,
 *   getRecentEntity,
 *   clearContext,
 * } from './context-manager';
 *
 * // Process user turn
 * const turn: ConversationTurn = {
 *   userInput: 'Check https://example.com',
 *   assistantResponse: 'I found that URL for you.',
 *   intent: classifyIntent(userInput, locale),
 *   sentiment: analyzeSentiment(userInput, locale),
 *   entities: extractEntities(userInput),
 *   timestamp: Date.now(),
 * };
 *
 * addToContext(turn);
 *
 * // Later, reference previous context
 * const url = getRecentEntity('url');
 * console.log(url?.value); // 'https://example.com'
 * ```
 *
 * @module nlu/context-manager
 * @see {@link classifyIntent} for intent analysis
 * @see {@link analyzeSentiment} for sentiment analysis
 * @see {@link extractEntities} for entity extraction
 */

import type { Entity } from './entity-extractor';
import type { IntentResult } from './intent-classifier';
import type { SentimentResult } from './sentiment-analyzer';

/**
 * A single conversation turn containing user input, assistant response,
 * and NLU analysis results.
 *
 * @property userInput - The original user message
 * @property assistantResponse - The assistant's reply
 * @property intent - Intent classification result
 * @property sentiment - Sentiment analysis result
 * @property entities - Extracted entities from user input
 * @property timestamp - Unix timestamp when turn was created
 *
 * @example
 * ```typescript
 * const turn: ConversationTurn = {
 *   userInput: 'Hello!',
 *   assistantResponse: 'Hi there! How can I help?',
 *   intent: { intent: 'greeting', confidence: 0.95 },
 *   sentiment: { sentiment: 'positive', polarity: 0.8, emotion: 'joy', intensity: 0.7 },
 *   entities: [],
 *   timestamp: 1704067200000,
 * };
 * ```
 */
export interface ConversationTurn {
  userInput: string;
  assistantResponse: string;
  intent: IntentResult;
  sentiment: SentimentResult;
  entities: Entity[];
  timestamp: number;
}

/**
 * Global conversation context state.
 *
 * @property history - Array of recent conversation turns (max MAX_HISTORY)
 * @property recentEntities - Deduplicated entities from recent turns (max MAX_ENTITIES)
 * @property lastIntent - Intent from the most recent turn (null if no turns yet)
 * @property lastSentiment - Sentiment from the most recent turn (null if no turns yet)
 * @property sessionStart - Unix timestamp when session began
 *
 * @example
 * ```typescript
 * const context: ConversationContext = {
 *   history: [turn1, turn2, turn3],
 *   recentEntities: [emailEntity, dateEntity],
 *   lastIntent: { intent: 'question', confidence: 0.8 },
 *   lastSentiment: { sentiment: 'neutral', polarity: 0.1, emotion: 'calm', intensity: 0.5 },
 *   sessionStart: 1704067200000,
 * };
 * ```
 */
export interface ConversationContext {
  history: ConversationTurn[];
  recentEntities: Entity[];
  lastIntent: IntentResult | null;
  lastSentiment: SentimentResult | null;
  sessionStart: number;
}

/**
 * Maximum number of conversation turns to keep in history.
 *
 * When exceeded, oldest turns are removed (FIFO).
 * Value of 10 provides ~5-10 minutes of context at typical pace.
 *
 * @internal
 */
const MAX_HISTORY = 10;

/**
 * Maximum number of entities to track across turns.
 *
 * When exceeded, oldest entities are removed.
 * Value of 20 allows referencing items from several turns back.
 *
 * @internal
 */
const MAX_ENTITIES = 20;

/**
 * Global conversation context singleton.
 *
 * This is the central state store for conversation tracking.
 * Initialized with empty history and current timestamp.
 *
 * @remarks
 * This is a module-level singleton. All functions in this module
 * operate on this shared state. For multi-conversation scenarios,
 * consider wrapping in a class or using React context.
 *
 * @internal
 */
let globalContext: ConversationContext = {
  history: [],
  recentEntities: [],
  lastIntent: null,
  lastSentiment: null,
  sessionStart: Date.now(),
};

/**
 * Retrieves the current conversation context.
 *
 * Returns a reference to the global context object. Modifications
 * to the returned object will affect the global state.
 *
 * @returns The current conversation context
 *
 * @example
 * ```typescript
 * const context = getContext();
 *
 * console.log(`Session started: ${new Date(context.sessionStart)}`);
 * console.log(`Turns so far: ${context.history.length}`);
 * console.log(`Last intent: ${context.lastIntent?.intent}`);
 * ```
 *
 * @example Checking conversation history
 * ```typescript
 * const context = getContext();
 *
 * if (context.history.length > 0) {
 *   const lastTurn = context.history[context.history.length - 1];
 *   console.log(`User said: ${lastTurn.userInput}`);
 *   console.log(`We replied: ${lastTurn.assistantResponse}`);
 * }
 * ```
 */
export function getContext(): ConversationContext {
  return globalContext;
}

/**
 * Adds a conversation turn to the context.
 *
 * This function performs several operations:
 *
 * 1. **Append Turn**: Add the turn to history array
 * 2. **Trim History**: Remove oldest turn if > MAX_HISTORY (10)
 * 3. **Merge Entities**: Add new entities (deduplicated by type+value)
 * 4. **Trim Entities**: Keep only last MAX_ENTITIES (20)
 * 5. **Update Last***: Store latest intent and sentiment
 *
 * ## Entity Deduplication
 *
 * Entities are deduplicated by type AND value. This means:
 * - Same email appearing twice → stored once
 * - Different emails → both stored
 * - Same value as different types → both stored (rare edge case)
 *
 * @param turn - The conversation turn to add
 *
 * @example Basic usage
 * ```typescript
 * const turn: ConversationTurn = {
 *   userInput: 'What time is it?',
 *   assistantResponse: 'It is 3:30 PM.',
 *   intent: classifyIntent(userInput, 'en'),
 *   sentiment: analyzeSentiment(userInput, 'en'),
 *   entities: extractEntities(userInput),
 *   timestamp: Date.now(),
 * };
 *
 * addToContext(turn);
 * ```
 *
 * @example In a chat handler
 * ```typescript
 * async function handleMessage(userInput: string): Promise<string> {
 *   // Analyze input
 *   const intent = classifyIntent(userInput, locale);
 *   const sentiment = analyzeSentiment(userInput, locale);
 *   const entities = extractEntities(userInput);
 *
 *   // Generate response
 *   const response = generateResponse(userInput, intent, sentiment);
 *
 *   // Store in context for future reference
 *   addToContext({
 *     userInput,
 *     assistantResponse: response,
 *     intent,
 *     sentiment,
 *     entities,
 *     timestamp: Date.now(),
 *   });
 *
 *   return response;
 * }
 * ```
 *
 * @see {@link getContext} to retrieve the updated context
 * @see {@link clearContext} to reset the context
 */
export function addToContext(turn: ConversationTurn): void {
  // Step 1: Add to history
  globalContext.history.push(turn);

  // Step 2: Enforce history limit (FIFO - oldest first)
  if (globalContext.history.length > MAX_HISTORY) {
    globalContext.history.shift();
  }

  // Step 3: Merge entities with deduplication
  for (const entity of turn.entities) {
    // Check for duplicates by type AND value
    const exists = globalContext.recentEntities.some(
      (e) => e.type === entity.type && e.value === entity.value,
    );

    if (!exists) {
      globalContext.recentEntities.push(entity);
    }
  }

  // Step 4: Enforce entity limit (keep most recent)
  if (globalContext.recentEntities.length > MAX_ENTITIES) {
    globalContext.recentEntities = globalContext.recentEntities.slice(-MAX_ENTITIES);
  }

  // Step 5: Update last intent and sentiment for quick access
  globalContext.lastIntent = turn.intent;
  globalContext.lastSentiment = turn.sentiment;
}

/**
 * Resets the conversation context to initial state.
 *
 * Call this when:
 * - Starting a new conversation session
 * - User explicitly requests to "start over"
 * - Session timeout occurs
 * - User logs out or changes accounts
 *
 * After clearing:
 * - history is empty []
 * - recentEntities is empty []
 * - lastIntent is null
 * - lastSentiment is null
 * - sessionStart is reset to current time
 *
 * @example
 * ```typescript
 * // User clicks "New Conversation" button
 * function handleNewConversation() {
 *   clearContext();
 *   displayWelcomeMessage();
 * }
 * ```
 *
 * @example Session timeout handling
 * ```typescript
 * const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
 *
 * function checkSessionTimeout() {
 *   const context = getContext();
 *   const elapsed = Date.now() - context.sessionStart;
 *
 *   if (elapsed > SESSION_TIMEOUT) {
 *     clearContext();
 *     return true; // Session was reset
 *   }
 *   return false;
 * }
 * ```
 */
export function clearContext(): void {
  globalContext = {
    history: [],
    recentEntities: [],
    lastIntent: null,
    lastSentiment: null,
    sessionStart: Date.now(),
  };
}

/**
 * Retrieves the most recent entity, optionally filtered by type.
 *
 * Useful for resolving references like "that URL" or "the date you mentioned".
 *
 * @param type - Optional entity type to filter by (e.g., 'url', 'date', 'email')
 * @returns The most recent matching entity, or null if none found
 *
 * @example Get any recent entity
 * ```typescript
 * const lastEntity = getRecentEntity();
 * if (lastEntity) {
 *   console.log(`Most recent entity: ${lastEntity.type} = ${lastEntity.value}`);
 * }
 * ```
 *
 * @example Get specific entity type
 * ```typescript
 * // User: "Send it to that email"
 * const email = getRecentEntity('email');
 * if (email) {
 *   sendEmail(email.value, message);
 * } else {
 *   askForEmail();
 * }
 * ```
 *
 * @example Resolving pronoun references
 * ```typescript
 * // User: "What about that date?"
 * const date = getRecentEntity('date');
 * if (date) {
 *   return `You mentioned ${date.value}. Would you like more info?`;
 * }
 * ```
 */
export function getRecentEntity(type?: Entity['type']): Entity | null {
  const entities = type
    ? globalContext.recentEntities.filter((e) => e.type === type)
    : globalContext.recentEntities;

  return entities[entities.length - 1] || null;
}

/**
 * Retrieves the user input from the most recent conversation turn.
 *
 * Useful for:
 * - Clarification handling ("What did you mean by that?")
 * - Error recovery ("I didn't understand. You said: ...")
 * - Logging and analytics
 *
 * @returns The last user input string, or null if no turns in history
 *
 * @example Clarification response
 * ```typescript
 * function handleClarificationRequest(): string {
 *   const lastInput = getLastUserInput();
 *   if (lastInput) {
 *     return `You said: "${lastInput}". Could you rephrase that?`;
 *   }
 *   return "I don't have any previous input to clarify.";
 * }
 * ```
 *
 * @example Error recovery
 * ```typescript
 * function handleParseError(): string {
 *   const lastInput = getLastUserInput();
 *   console.error(`Failed to parse: ${lastInput}`);
 *   return "Sorry, I had trouble understanding. Could you try again?";
 * }
 * ```
 */
export function getLastUserInput(): string | null {
  const last = globalContext.history[globalContext.history.length - 1];
  return last?.userInput || null;
}
