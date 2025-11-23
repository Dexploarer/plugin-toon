/**
 * TOON-encoded Entities Provider
 *
 * Replaces bootstrap's entitiesProvider with token-efficient TOON format.
 */

import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { formatForLLM } from "../utils/toon";

interface EntitySummary {
  id: string;
  name: string;
  type?: string;
  role?: string;
}

export const toonEntitiesProvider: Provider = {
  name: "toonEntities",
  description: "TOON-encoded known entities for token efficiency",
  dynamic: true,
  position: 12,

  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // Get entities from runtime
      const entities = await runtime.getEntities?.({
        roomId: message.roomId,
      });

      if (!entities || entities.length === 0) {
        return {
          text: "",
          values: { entityCount: 0 },
          data: { entities: [] },
        };
      }

      // Transform to compact format
      const entitySummaries: EntitySummary[] = entities.map((entity) => ({
        id: String(entity.id).slice(0, 8), // Truncate UUID for context
        name: entity.name || "Unknown",
        ...(entity.type && { type: entity.type }),
        ...(entity.metadata?.role && { role: entity.metadata.role as string }),
      }));

      // Format with TOON
      const { text, itemCount } = formatForLLM(
        "Known Entities",
        entitySummaries,
      );

      return {
        text,
        values: {
          entityCount: itemCount,
          hasEntities: itemCount > 0,
        },
        data: {
          entities: entitySummaries,
          raw: entities,
        },
      };
    } catch (error) {
      console.error("[toonEntities] Error:", error);
      return {
        text: "",
        values: { entityCount: 0, error: true },
        data: { entities: [], error },
      };
    }
  },
};
