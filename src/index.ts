/**
 * @dexploarer/plugin-toon
 *
 * Drop-in replacement for @elizaos/plugin-bootstrap with TOON-encoded providers
 * for token-efficient LLM context.
 *
 * TOON (Token-Oriented Object Notation) reduces token usage by 30-60%
 * for structured data, especially uniform arrays of objects.
 *
 * @example
 * ```typescript
 * // Replace this:
 * import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
 *
 * // With this:
 * import { toonPlugin } from '@dexploarer/plugin-toon';
 *
 * const agent = {
 *   plugins: [toonPlugin], // Full bootstrap replacement with TOON optimization
 * };
 * ```
 */

import { type Plugin, EventType } from "@elizaos/core";

// Re-export everything from bootstrap for compatibility
export * from "@elizaos/plugin-bootstrap";

// Import bootstrap components we'll use in our plugin
import {
  // Actions
  replyAction,
  followRoomAction,
  unfollowRoomAction,
  ignoreAction,
  noneAction,
  muteRoomAction,
  unmuteRoomAction,
  sendMessageAction,
  updateEntityAction,
  choiceAction,
  updateRoleAction,
  updateSettingsAction,
  generateImageAction,
  // Evaluators
  reflectionEvaluator,
  // Providers we're NOT replacing (keep original)
  evaluatorsProvider,
  anxietyProvider,
  timeProvider,
  relationshipsProvider,
  choiceProvider,
  roleProvider,
  settingsProvider,
  attachmentsProvider,
  providersProvider,
  actionStateProvider,
  characterProvider,
  worldProvider,
} from "@elizaos/plugin-bootstrap";

// TOON-wrapped providers (replace bootstrap versions)
import {
  toonRecentMessagesProvider,
  toonFactsProvider,
  toonEntitiesProvider,
  toonActionsProvider,
} from "./providers";

// TOON embedding event handlers
import {
  handleRunEnded,
  handleEmbeddingCompleted,
} from "./events";

// TOON utilities
export {
  encodeToon,
  decodeToon,
  formatForLLM,
  smartEncode,
  isToonOptimal,
} from "./utils/toon";

// Types
export type {
  ToonEncodeOptions,
  ToonProviderConfig,
  FormattedContext,
} from "./types";

// Export TOON providers individually for advanced usage
export {
  toonRecentMessagesProvider,
  toonFactsProvider,
  toonEntitiesProvider,
  toonActionsProvider,
};

// Export TOON embedding event handlers
export {
  handleRunEnded,
  handleEmbeddingCompleted,
} from "./events";
export type { ToonEmbeddingConfig } from "./events";

/**
 * TOON Plugin - Drop-in replacement for bootstrapPlugin
 *
 * Provides all bootstrap functionality with TOON-encoded providers
 * for token-efficient LLM context, plus automatic embedding of
 * TOON-encoded context for semantic search.
 *
 * TOON-encoded providers:
 * - RECENT_MESSAGES (position 100) - conversation history
 * - FACTS (dynamic) - known facts
 * - ENTITIES (dynamic) - people in conversation
 * - ACTIONS (position -1) - available actions
 *
 * Embedding events:
 * - RUN_ENDED: Creates TOON context memory after message processing and queues embedding
 *   (RUN_ENDED is reliably emitted by DefaultMessageService, unlike MESSAGE_RECEIVED
 *    which is only emitted by platform plugins like Discord/Telegram)
 * - EMBEDDING_GENERATION_COMPLETED: Logs TOON embedding metrics
 *
 * Requires plugin-gateway (or similar) to provide TEXT_EMBEDDING model handler.
 *
 * All other bootstrap providers, actions, evaluators, and services
 * are included unchanged.
 */
export const toonPlugin: Plugin = {
  name: "toon",
  description:
    "Agent bootstrap with TOON-encoded providers and context embeddings for token-efficient LLM context",

  actions: [
    replyAction,
    followRoomAction,
    unfollowRoomAction,
    ignoreAction,
    noneAction,
    muteRoomAction,
    unmuteRoomAction,
    sendMessageAction,
    updateEntityAction,
    choiceAction,
    updateRoleAction,
    updateSettingsAction,
    generateImageAction,
  ],

  evaluators: [reflectionEvaluator],

  providers: [
    // Unchanged bootstrap providers
    evaluatorsProvider,
    anxietyProvider,
    timeProvider,
    relationshipsProvider,
    choiceProvider,
    roleProvider,
    settingsProvider,
    attachmentsProvider,
    providersProvider,
    actionStateProvider,
    characterProvider,
    worldProvider,
    // TOON-encoded providers (replace bootstrap versions)
    toonRecentMessagesProvider, // replaces recentMessagesProvider
    toonFactsProvider, // replaces factsProvider
    toonEntitiesProvider, // replaces entitiesProvider
    toonActionsProvider, // replaces actionsProvider
  ],

  // Services imported dynamically to avoid circular deps
  services: [],

  // TOON embedding event handlers
  // RUN_ENDED is emitted by DefaultMessageService after each message is processed
  // This is more reliable than MESSAGE_RECEIVED which is only emitted by platform plugins
  events: {
    [EventType.RUN_ENDED]: [handleRunEnded],
    [EventType.EMBEDDING_GENERATION_COMPLETED]: [handleEmbeddingCompleted],
  },
};

// Also export as bootstrapPlugin for maximum compatibility
export const bootstrapPlugin = toonPlugin;

// Default export
export default toonPlugin;
