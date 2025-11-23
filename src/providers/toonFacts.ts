/**
 * TOON-encoded Facts Provider
 *
 * Replaces bootstrap's factsProvider with token-efficient TOON format.
 * Uses the same name "FACTS" to override bootstrap version.
 */

import type { IAgentRuntime, Memory, Provider, State } from "@elizaos/core";
import { ModelType, logger } from "@elizaos/core";
import { encodeToon } from "../utils/toon";

/**
 * Format facts as TOON for token efficiency
 */
function formatFactsAsToon(facts: Memory[]): string {
  if (!facts || facts.length === 0) return "";

  // Transform to compact format for TOON
  const compact = facts.reverse().map((fact) => ({
    fact: (fact.content?.text as string) || "",
    conf: Math.round(((fact.content?.confidence as number) || 1) * 100), // confidence as %
  }));

  return encodeToon(compact, { delimiter: "\t" });
}

/**
 * TOON-encoded facts provider
 * Uses same name "FACTS" to replace bootstrap version
 */
export const toonFactsProvider: Provider = {
  name: "FACTS",
  description: "TOON-encoded key facts that the agent knows for token efficiency",
  dynamic: true,

  get: async (runtime: IAgentRuntime, message: Memory, _state?: State) => {
    try {
      // Get recent messages for context
      const recentMessages = await runtime.getMemories({
        tableName: "messages",
        roomId: message.roomId,
        count: 10,
        unique: false,
      });

      // Join last 5 messages for embedding search
      const last5Messages = recentMessages
        .slice(-5)
        .map((m) => m.content.text)
        .join("\n");

      const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
        text: last5Messages,
      });

      // Search for relevant and recent facts in parallel
      const [relevantFacts, recentFactsData] = await Promise.all([
        runtime.searchMemories({
          tableName: "facts",
          embedding,
          roomId: message.roomId,
          worldId: message.worldId,
          count: 6,
          query: message.content.text,
        }),
        runtime.searchMemories({
          embedding,
          query: message.content.text,
          tableName: "facts",
          roomId: message.roomId,
          entityId: message.entityId,
          count: 6,
        }),
      ]);

      // Deduplicate facts
      const allFacts = [...relevantFacts, ...recentFactsData].filter(
        (fact, index, self) => index === self.findIndex((t) => t.id === fact.id)
      );

      if (allFacts.length === 0) {
        return {
          values: { facts: "" },
          data: { facts: allFacts },
          text: "No facts available.",
        };
      }

      // TOON-encode facts
      const toonFacts = formatFactsAsToon(allFacts);

      // Also provide original format for templates
      const formattedFacts = allFacts
        .reverse()
        .map((fact) => fact.content.text)
        .join("\n");

      const text = `# Known Facts (TOON)\n${toonFacts}`;

      return {
        values: { facts: formattedFacts },
        data: { facts: allFacts },
        text,
      };
    } catch (error) {
      logger.error({ error }, "Error in toonFactsProvider:");
      return {
        values: { facts: "" },
        data: { facts: [] },
        text: "Error retrieving facts.",
      };
    }
  },
};
