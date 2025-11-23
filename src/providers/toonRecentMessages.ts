/**
 * TOON-encoded Recent Messages Provider
 *
 * Replaces bootstrap's recentMessagesProvider with token-efficient TOON format.
 * Uses the same name and position as bootstrap to override it.
 */

import type {
  Provider,
  IAgentRuntime,
  Memory,
  Entity,
} from "@elizaos/core";
import {
  addHeader,
  ChannelType,
  formatMessages,
  formatPosts,
  getEntityDetails,
  logger,
} from "@elizaos/core";
import { encodeToon } from "../utils/toon";

/**
 * Get recent interactions between two entities in different rooms
 */
const getRecentInteractions = async (
  runtime: IAgentRuntime,
  sourceEntityId: string,
  targetEntityId: string,
  excludeRoomId: string
): Promise<Memory[]> => {
  const rooms = await runtime.getRoomsForParticipants([
    sourceEntityId as `${string}-${string}-${string}-${string}-${string}`,
    targetEntityId as `${string}-${string}-${string}-${string}-${string}`,
  ]);
  return runtime.getMemoriesByRoomIds({
    tableName: "messages",
    roomIds: rooms.filter((room) => room !== excludeRoomId),
    limit: 20,
  });
};

/**
 * Format messages as TOON for token efficiency
 */
function formatMessagesAsToon(
  messages: Memory[],
  entities: Entity[],
  agentId: string,
  agentName: string
): string {
  if (!messages || messages.length === 0) return "";

  // Create entity lookup map
  const entityMap = new Map<string, string>();
  entities.forEach((e) => {
    if (e.id) entityMap.set(e.id, e.names?.[0] || "Unknown");
  });

  // Transform to compact format for TOON
  const compact = messages.map((msg) => {
    const isAgent = msg.entityId === agentId;
    const sender = isAgent
      ? agentName
      : (msg.entityId ? entityMap.get(msg.entityId) : undefined) || "Unknown";
    const text = (msg.content?.text as string) || "";
    const time = new Date(msg.createdAt || Date.now())
      .toISOString()
      .slice(11, 19);

    return {
      from: sender,
      text: text.slice(0, 500), // Truncate long messages
      time,
    };
  });

  return encodeToon(compact, { delimiter: "\t" });
}

/**
 * TOON-encoded recent messages provider
 * Uses same name "RECENT_MESSAGES" and position 100 to replace bootstrap version
 */
export const toonRecentMessagesProvider: Provider = {
  name: "RECENT_MESSAGES",
  description:
    "TOON-encoded recent messages, interactions and other memories for token efficiency",
  position: 100,

  get: async (runtime: IAgentRuntime, message: Memory) => {
    try {
      const { roomId } = message;
      const conversationLength = runtime.getConversationLength();

      // Parallelize initial data fetching
      const [entitiesData, room, recentMessagesData, recentInteractionsData] =
        await Promise.all([
          getEntityDetails({ runtime, roomId }),
          runtime.getRoom(roomId),
          runtime.getMemories({
            tableName: "messages",
            roomId,
            count: conversationLength,
            unique: false,
          }),
          message.entityId !== runtime.agentId
            ? getRecentInteractions(
                runtime,
                message.entityId,
                runtime.agentId,
                roomId
              )
            : Promise.resolve([]),
        ]);

      // Separate action results from dialogue
      const actionResultMessages = recentMessagesData.filter(
        (msg) =>
          msg.content?.type === "action_result" &&
          msg.metadata?.type === "action_result"
      );

      const dialogueMessages = recentMessagesData.filter(
        (msg) =>
          !(
            msg.content?.type === "action_result" &&
            msg.metadata?.type === "action_result"
          )
      );

      const isPostFormat = room?.type
        ? room.type === ChannelType.FEED || room.type === ChannelType.THREAD
        : false;

      // TOON-encode the messages
      const toonMessages = formatMessagesAsToon(
        dialogueMessages,
        entitiesData,
        runtime.agentId,
        runtime.character.name
      );

      // Format for bootstrap compatibility (still needed for some templates)
      const [formattedRecentMessages, formattedRecentPosts] = await Promise.all(
        [
          formatMessages({ messages: dialogueMessages, entities: entitiesData }),
          formatPosts({
            messages: dialogueMessages,
            entities: entitiesData,
            conversationHeader: false,
          }),
        ]
      );

      // Format action results (keep original format - not array-heavy)
      let actionResultsText = "";
      if (actionResultMessages.length > 0) {
        const groupedByRun = new Map<string, Memory[]>();
        for (const mem of actionResultMessages) {
          const runId = String(mem.content?.runId || "unknown");
          if (!groupedByRun.has(runId)) groupedByRun.set(runId, []);
          groupedByRun.get(runId)?.push(mem);
        }

        const formattedActionResults = Array.from(groupedByRun.entries())
          .slice(-3)
          .map(([runId, memories]) => {
            const sortedMemories = memories.sort(
              (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
            );
            const thought = sortedMemories[0]?.content?.planThought || "";
            const runText = sortedMemories
              .map((mem) => {
                const actionName = mem.content?.actionName || "Unknown";
                const status = mem.content?.actionStatus || "unknown";
                return `  - ${actionName} (${status})`;
              })
              .join("\n");
            return `**Run ${runId.slice(0, 8)}**${thought ? ` - "${thought}"` : ""}\n${runText}`;
          })
          .join("\n\n");

        actionResultsText = formattedActionResults
          ? addHeader("# Recent Actions", formattedActionResults)
          : "";
      }

      // Build text output with TOON-encoded messages
      const recentPosts =
        formattedRecentPosts && formattedRecentPosts.length > 0
          ? addHeader("# Posts in Thread", formattedRecentPosts)
          : "";

      // Use TOON format for conversation messages
      const recentMessages = toonMessages
        ? addHeader("# Conversation (TOON)", toonMessages)
        : "";

      // Handle empty state
      if (
        !recentPosts &&
        !recentMessages &&
        dialogueMessages.length === 0 &&
        !message.content.text
      ) {
        return {
          data: {
            recentMessages: dialogueMessages,
            recentInteractions: [],
            actionResults: actionResultMessages,
          },
          values: {
            recentPosts: "",
            recentMessages: "",
            recentMessageInteractions: "",
            recentPostInteractions: "",
            recentInteractions: "",
            recentActionResults: actionResultsText,
          },
          text: "No recent messages available",
        };
      }

      // Get most recent message for templates
      let recentMessage = "No recent message available.";
      if (dialogueMessages.length > 0) {
        const mostRecent = [...dialogueMessages].sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        )[0];
        const formattedSingle = formatMessages({
          messages: [mostRecent],
          entities: entitiesData,
        });
        if (formattedSingle) recentMessage = formattedSingle;
      }

      // Sender info for focus header
      const senderName =
        entitiesData.find((e: Entity) => e.id === message.entityId)?.names[0] ||
        (message.metadata as any)?.entityName ||
        "Unknown User";
      const receivedMessageContent = message.content.text;
      const hasReceivedMessage = !!receivedMessageContent?.trim();

      const receivedMessageHeader = hasReceivedMessage
        ? addHeader("# Received Message", `${senderName}: ${receivedMessageContent}`)
        : "";

      const focusHeader = hasReceivedMessage
        ? addHeader(
            "# Focus",
            `Reply to the above message from **${senderName}**. Keep response relevant.`
          )
        : "";

      // Format interactions (keep original for compatibility)
      const recentMessageInteractions = recentInteractionsData
        .map((m) => {
          const isSelf = m.entityId === runtime.agentId;
          const sender = isSelf
            ? runtime.character.name
            : entitiesData.find((e: Entity) => e.id === m.entityId)?.names[0] ||
              "unknown";
          return `${sender}: ${m.content.text}`;
        })
        .join("\n");

      const data = {
        recentMessages: dialogueMessages,
        recentInteractions: recentInteractionsData,
        actionResults: actionResultMessages,
      };

      const values = {
        recentPosts,
        recentMessages: formattedRecentMessages, // Keep original for templates
        recentMessageInteractions,
        recentPostInteractions: recentMessageInteractions,
        recentInteractions: recentMessageInteractions,
        recentActionResults: actionResultsText,
        recentMessage,
      };

      // Combine text sections - use TOON version for main content
      const text = [
        isPostFormat ? recentPosts : recentMessages,
        actionResultsText,
        recentMessages || recentPosts || message.content.text
          ? receivedMessageHeader
          : "",
        recentMessages || recentPosts || message.content.text
          ? focusHeader
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      return { data, values, text };
    } catch (error) {
      logger.error({ error }, "Error in toonRecentMessagesProvider:");
      return {
        data: {
          recentMessages: [],
          recentInteractions: [],
          actionResults: [],
        },
        values: {
          recentPosts: "",
          recentMessages: "",
          recentMessageInteractions: "",
          recentPostInteractions: "",
          recentInteractions: "",
          recentActionResults: "",
        },
        text: "Error retrieving recent messages.",
      };
    }
  },
};
