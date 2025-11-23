/**
 * TOON-encoded Actions Provider
 *
 * Replaces bootstrap's actionsProvider with token-efficient TOON format.
 * Uses the same name "ACTIONS" and position -1 to override bootstrap version.
 */

import type {
  Action,
  IAgentRuntime,
  Memory,
  Provider,
  State,
} from "@elizaos/core";
import {
  addHeader,
  composeActionExamples,
  formatActionNames,
  formatActions,
} from "@elizaos/core";
import { encodeToon } from "../utils/toon";

/**
 * Format actions as TOON for token efficiency
 */
function formatActionsAsToon(actions: Action[]): string {
  if (!actions || actions.length === 0) return "";

  // Transform to compact format for TOON
  const compact = actions.map((action) => ({
    name: action.name,
    desc: (action.description || "").slice(0, 60), // Truncate descriptions
  }));

  return encodeToon(compact, { delimiter: "\t" });
}

/**
 * TOON-encoded actions provider
 * Uses same name "ACTIONS" and position -1 to replace bootstrap version
 */
export const toonActionsProvider: Provider = {
  name: "ACTIONS",
  description: "TOON-encoded possible response actions for token efficiency",
  position: -1,

  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    // Get actions that validate for this message
    const actionPromises = runtime.actions.map(async (action: Action) => {
      try {
        const result = await action.validate(runtime, message, state);
        if (result) return action;
      } catch (e) {
        console.error("ACTIONS GET -> validate err", action.name, e);
      }
      return null;
    });

    const resolvedActions = await Promise.all(actionPromises);
    const actionsData = resolvedActions.filter(Boolean) as Action[];

    // TOON-encode actions
    const toonActions = formatActionsAsToon(actionsData);

    // Format action-related texts (keep original for templates)
    const actionNames = `Possible response actions: ${formatActionNames(actionsData)}`;

    const actionsWithDescriptions =
      actionsData.length > 0
        ? addHeader("# Available Actions", formatActions(actionsData))
        : "";

    const actionExamples =
      actionsData.length > 0
        ? addHeader("# Action Examples", composeActionExamples(actionsData, 10))
        : "";

    // TOON version
    const toonActionsText =
      toonActions.length > 0
        ? addHeader("# Actions (TOON)", toonActions)
        : "";

    const data = { actionsData };

    const values = {
      actionNames,
      actionExamples,
      actionsWithDescriptions,
    };

    // Combine text sections - use TOON for actions list, keep examples
    const text = [toonActionsText, actionExamples].filter(Boolean).join("\n\n");

    return { data, values, text };
  },
};
