/**
 * @hyperscape/plugin-toon
 *
 * TOON-encoded providers for token-efficient LLM context in ElizaOS.
 *
 * TOON (Token-Oriented Object Notation) reduces token usage by 30-60%
 * for structured data, especially uniform arrays of objects.
 *
 * @example
 * ```typescript
 * import { toonPlugin } from '@hyperscape/plugin-toon';
 *
 * const agent = {
 *   plugins: [
 *     bootstrapPlugin,  // Core functionality
 *     toonPlugin,       // TOON providers (override bootstrap)
 *   ],
 * };
 * ```
 */

import type { Plugin } from "@elizaos/core";

// Providers
import {
  toonRecentMessagesProvider,
  toonFactsProvider,
  toonEntitiesProvider,
  toonActionsProvider,
} from "./providers";

// Utilities
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

// Individual provider exports
export {
  toonRecentMessagesProvider,
  toonFactsProvider,
  toonEntitiesProvider,
  toonActionsProvider,
};

/**
 * TOON Plugin
 *
 * Provides TOON-encoded versions of common ElizaOS providers
 * for token-efficient LLM context.
 *
 * Providers have higher position numbers than bootstrap defaults,
 * so they override bootstrap providers when both are loaded.
 */
export const toonPlugin: Plugin = {
  name: "@hyperscape/plugin-toon",
  description: "TOON-encoded providers for token-efficient LLM context",

  providers: [
    toonRecentMessagesProvider,
    toonFactsProvider,
    toonEntitiesProvider,
    toonActionsProvider,
  ],

  // No actions - this is a context optimization plugin
  actions: [],

  // No evaluators
  evaluators: [],

  // No services
  services: [],

  // No events
  events: {},
};

// Default export
export default toonPlugin;
