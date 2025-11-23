/**
 * TOON-encoded Actions Provider
 *
 * Replaces bootstrap's actionsProvider with token-efficient TOON format.
 */

import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { formatForLLM } from "../utils/toon";

interface ActionSummary {
  name: string;
  desc: string;
  similes?: string;
}

export const toonActionsProvider: Provider = {
  name: "toonActions",
  description: "TOON-encoded available actions for token efficiency",
  dynamic: false, // Actions don't change frequently
  position: 13,

  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // Get registered actions from runtime
      const actions = runtime.actions || [];

      if (actions.length === 0) {
        return {
          text: "",
          values: { actionCount: 0 },
          data: { actions: [] },
        };
      }

      // Transform to compact format
      const actionSummaries: ActionSummary[] = actions.map((action) => ({
        name: action.name,
        desc: action.description?.slice(0, 80) || "No description", // Truncate long descriptions
        ...(action.similes?.length && {
          similes: action.similes.slice(0, 3).join("|"), // First 3 similes, pipe-separated
        }),
      }));

      // Format with TOON
      const { text, itemCount } = formatForLLM(
        "Available Actions",
        actionSummaries,
      );

      return {
        text,
        values: {
          actionCount: itemCount,
          hasActions: itemCount > 0,
          actionNames: actions.map((a) => a.name),
        },
        data: {
          actions: actionSummaries,
          raw: actions,
        },
      };
    } catch (error) {
      console.error("[toonActions] Error:", error);
      return {
        text: "",
        values: { actionCount: 0, error: true },
        data: { actions: [], error },
      };
    }
  },
};
