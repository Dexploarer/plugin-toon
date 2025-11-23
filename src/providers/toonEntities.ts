/**
 * TOON-encoded Entities Provider
 *
 * Replaces bootstrap's entitiesProvider with token-efficient TOON format.
 * Uses the same name "ENTITIES" to override bootstrap version.
 */

import type { Entity, IAgentRuntime, Memory, Provider } from "@elizaos/core";
import { addHeader, formatEntities, getEntityDetails } from "@elizaos/core";
import { encodeToon } from "../utils/toon";

/**
 * Format entities as TOON for token efficiency
 */
function formatEntitiesAsToon(entities: Entity[]): string {
  if (!entities || entities.length === 0) return "";

  // Transform to compact format for TOON
  const compact = entities.map((entity) => ({
    name: entity.names?.[0] || "Unknown",
    id: (entity.id || "unknown").slice(0, 8), // Truncated UUID
    role: (entity.metadata?.role as string) || "user",
  }));

  return encodeToon(compact, { delimiter: "\t" });
}

/**
 * TOON-encoded entities provider
 * Uses same name "ENTITIES" to replace bootstrap version
 */
export const toonEntitiesProvider: Provider = {
  name: "ENTITIES",
  description: "TOON-encoded people in the current conversation for token efficiency",
  dynamic: true,

  get: async (runtime: IAgentRuntime, message: Memory) => {
    const { roomId, entityId } = message;

    // Get entity details
    const entitiesData = await getEntityDetails({ runtime, roomId });

    // Format as TOON
    const toonEntities = formatEntitiesAsToon(entitiesData ?? []);

    // Also get original format for templates
    const formattedEntities = formatEntities({ entities: entitiesData ?? [] });

    // Find sender name
    const senderName = entitiesData?.find(
      (entity: Entity) => entity.id === entityId
    )?.names[0];

    // Create formatted text with header
    const entities =
      toonEntities && toonEntities.length > 0
        ? addHeader("# People in Room (TOON)", toonEntities)
        : "";

    const data = {
      entitiesData,
      senderName,
    };

    const values = {
      entities: formattedEntities, // Keep original for templates
    };

    return {
      data,
      values,
      text: entities,
    };
  },
};
