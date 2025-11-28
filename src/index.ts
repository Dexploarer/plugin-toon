/**
 * @dexploarer/plugin-toon
 *
 * Token-efficient LLM context providers using TOON encoding.
 *
 * TOON (Token-Oriented Object Notation) reduces token usage by 30-60%
 * for structured data, especially uniform arrays of objects.
 *
 * @example
 * ```typescript
 * import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
 * import { toonPlugin } from '@dexploarer/plugin-toon';
 *
 * const agent = {
 *   plugins: [
 *     bootstrapPlugin,  // Your choice of bootstrap
 *     toonPlugin,       // Add TOON-encoded providers
 *   ],
 * };
 * ```
 */

import { type Plugin, EventType } from "@elizaos/core";

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
 * TOON Plugin - Token-efficient context providers
 *
 * Provides TOON-encoded providers that replace standard bootstrap providers
 * for more efficient LLM token usage.
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
 * Use alongside your choice of bootstrap plugin:
 * - @elizaos/plugin-bootstrap (original)
 * - @hyperscape/plugin-hyperscape-bootstrap (game-focused)
 */
export const toonPlugin: Plugin = {
  name: "toon",
  description:
    "Token-efficient TOON-encoded providers and context embeddings for reduced LLM token usage",

  // No actions - provided by bootstrap plugin
  actions: [],

  // No evaluators - provided by bootstrap plugin
  evaluators: [],

  // TOON-encoded providers (override bootstrap versions by matching names)
  providers: [
    toonRecentMessagesProvider, // Replaces recentMessagesProvider
    toonFactsProvider, // Replaces factsProvider
    toonEntitiesProvider, // Replaces entitiesProvider
    toonActionsProvider, // Replaces actionsProvider
  ],

  // No services needed
  services: [],

  // TOON embedding event handlers
  // RUN_ENDED is emitted by DefaultMessageService after each message is processed
  // This is more reliable than MESSAGE_RECEIVED which is only emitted by platform plugins
  events: {
    [EventType.RUN_ENDED]: [handleRunEnded],
    [EventType.EMBEDDING_GENERATION_COMPLETED]: [handleEmbeddingCompleted],
  },
};

// Default export
export default toonPlugin;
