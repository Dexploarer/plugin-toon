/**
 * TOON-encoded Recent Messages Provider
 *
 * Replaces bootstrap's recentMessagesProvider with token-efficient TOON format.
 */

import type { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";
import { formatForLLM } from "../utils/toon";

interface MessageSummary {
  from: string;
  text: string;
  time: string;
  action?: string;
}

export const toonRecentMessagesProvider: Provider = {
  name: "toonRecentMessages",
  description: "TOON-encoded recent conversation messages for token efficiency",
  dynamic: true,
  position: 10, // Higher than bootstrap's recentMessagesProvider (usually ~5)

  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // Get recent messages from runtime
      const memories = await runtime.getMemories({
        roomId: message.roomId,
        count: 20,
        unique: false,
      });

      if (!memories || memories.length === 0) {
        return {
          text: "",
          values: { messageCount: 0 },
          data: { messages: [] },
        };
      }

      // Transform to compact format
      const messages: MessageSummary[] = memories.map((mem) => {
        const content = mem.content as Record<string, unknown>;
        const result: MessageSummary = {
          from:
            (content.name as string) ||
            (mem.entityId === runtime.agentId
              ? runtime.character.name
              : "User"),
          text: (content.text as string) || "",
          time: new Date(mem.createdAt || Date.now())
            .toISOString()
            .slice(11, 19),
        };
        if (content.action) {
          result.action = content.action as string;
        }
        return result;
      });

      // Format with TOON
      const { text, itemCount } = formatForLLM("Recent Messages", messages);

      return {
        text,
        values: {
          messageCount: itemCount,
          hasRecentMessages: itemCount > 0,
        },
        data: {
          messages,
          raw: memories,
        },
      };
    } catch (error) {
      console.error("[toonRecentMessages] Error:", error);
      return {
        text: "",
        values: { messageCount: 0, error: true },
        data: { messages: [], error },
      };
    }
  },
};
