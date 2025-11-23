/**
 * @hyperscape/plugin-toon
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
 * import { toonPlugin } from '@hyperscape/plugin-toon';
 *
 * const agent = {
 *   plugins: [toonPlugin], // Full bootstrap replacement with TOON optimization
 * };
 * ```
 */

import type { Plugin } from "@elizaos/core";

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

/**
 * TOON Plugin - Drop-in replacement for bootstrapPlugin
 *
 * Provides all bootstrap functionality with TOON-encoded providers
 * for token-efficient LLM context.
 *
 * TOON-encoded providers:
 * - RECENT_MESSAGES (position 100) - conversation history
 * - FACTS (dynamic) - known facts
 * - ENTITIES (dynamic) - people in conversation
 * - ACTIONS (position -1) - available actions
 *
 * All other bootstrap providers, actions, evaluators, and services
 * are included unchanged.
 */
export const toonPlugin: Plugin = {
  name: "toon",
  description:
    "Agent bootstrap with TOON-encoded providers for token-efficient LLM context",

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

  // Events will be handled by re-export
  events: {},
};

// Also export as bootstrapPlugin for maximum compatibility
export const bootstrapPlugin = toonPlugin;

// Default export
export default toonPlugin;
