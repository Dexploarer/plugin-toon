/**
 * TOON-encoded Facts Provider
 *
 * Replaces bootstrap's factsProvider with token-efficient TOON format.
 */

import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { formatForLLM } from "../utils/toon";

interface FactSummary {
  fact: string;
  source?: string;
  confidence?: number;
}

export const toonFactsProvider: Provider = {
  name: "toonFacts",
  description: "TOON-encoded known facts for token efficiency",
  dynamic: true,
  position: 11,

  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // Get facts from runtime's fact memory
      const facts = await runtime.getMemories({
        roomId: message.roomId,
        tableName: "facts",
        count: 50,
      });

      if (!facts || facts.length === 0) {
        return {
          text: "",
          values: { factCount: 0 },
          data: { facts: [] },
        };
      }

      // Transform to compact format
      const factSummaries: FactSummary[] = facts.map((mem) => {
        const content = mem.content as Record<string, unknown>;
        return {
          fact: (content.text as string) || String(content),
          ...(content.source && { source: content.source as string }),
          ...(content.confidence && {
            confidence: content.confidence as number,
          }),
        };
      });

      // Format with TOON
      const { text, itemCount } = formatForLLM("Known Facts", factSummaries);

      return {
        text,
        values: {
          factCount: itemCount,
          hasFacts: itemCount > 0,
        },
        data: {
          facts: factSummaries,
          raw: facts,
        },
      };
    } catch (error) {
      console.error("[toonFacts] Error:", error);
      return {
        text: "",
        values: { factCount: 0, error: true },
        data: { facts: [], error },
      };
    }
  },
};
