/**
 * TOON Embedding Event Handlers
 *
 * Listens for RUN_ENDED events (emitted after each message is processed)
 * and queues embedding generation for TOON-encoded context.
 * This enables semantic search over the token-efficient TOON representations.
 *
 * Why RUN_ENDED instead of MESSAGE_RECEIVED?
 * - MESSAGE_RECEIVED is emitted by platform plugins (Discord, Telegram, etc.)
 *   when they receive messages from external sources
 * - RUN_ENDED is emitted by the core DefaultMessageService after every message
 *   is processed, making it more reliable for all message types
 *
 * Flow:
 * 1. RUN_ENDED event triggers after message processing completes
 * 2. Message is fetched from database using messageId
 * 3. TOON context is encoded from the message
 * 4. Memory is created with TOON content
 * 5. Embedding generation is queued (handled by EmbeddingGenerationService)
 * 6. TEXT_EMBEDDING model handler (from plugin-gateway) generates the embedding
 */

import {
  type IAgentRuntime,
  type Memory,
  type UUID,
  EventType,
  logger,
} from "@elizaos/core";
import { encodeToon } from "../utils/toon";

/** Configuration for TOON embedding behavior */
export interface ToonEmbeddingConfig {
  /** Whether to embed TOON context (default: true) */
  enabled: boolean;
  /** Minimum message length to trigger embedding (default: 10) */
  minMessageLength: number;
  /** Maximum messages to include in context embedding (default: 5) */
  maxContextMessages: number;
  /** Priority for embedding requests (default: 'normal') */
  priority: "high" | "normal" | "low";
}

const DEFAULT_CONFIG: ToonEmbeddingConfig = {
  enabled: true,
  minMessageLength: 10,
  maxContextMessages: 5,
  priority: "normal",
};

/**
 * Get TOON embedding config from runtime settings
 */
function getConfig(runtime: IAgentRuntime): ToonEmbeddingConfig {
  const customConfig = runtime.getSetting("TOON_EMBEDDING_CONFIG");
  if (customConfig && typeof customConfig === "object") {
    return { ...DEFAULT_CONFIG, ...(customConfig as Partial<ToonEmbeddingConfig>) };
  }
  return DEFAULT_CONFIG;
}

/**
 * Create a TOON-encoded context memory for embedding
 */
async function createToonContextMemory(
  runtime: IAgentRuntime,
  sourceMemory: Memory,
  config: ToonEmbeddingConfig
): Promise<Memory | null> {
  try {
    // Get recent messages for context
    const recentMessages = await runtime.getMemories({
      tableName: "messages",
      roomId: sourceMemory.roomId,
      count: config.maxContextMessages,
    });

    if (!recentMessages || recentMessages.length === 0) {
      return null;
    }

    // Encode messages to TOON format for efficient embedding
    const messagesForToon = recentMessages.map((m) => ({
      sender: m.entityId,
      text: m.content?.text || "",
      timestamp: m.createdAt,
    }));

    const toonContent = encodeToon(messagesForToon);

    // Create a context memory with TOON-encoded content
    const contextMemory: Memory = {
      id: crypto.randomUUID() as UUID,
      entityId: sourceMemory.entityId,
      agentId: runtime.agentId,
      roomId: sourceMemory.roomId,
      content: {
        text: toonContent,
        source: "toon-context",
        metadata: {
          messageCount: recentMessages.length,
          sourceMessageId: sourceMemory.id,
          toonEncoded: true,
        },
      },
      createdAt: Date.now(),
    };

    return contextMemory;
  } catch (error) {
    logger.error("[TOON] Error creating context memory:", String(error));
    return null;
  }
}

/**
 * Handle RUN_ENDED event
 * Creates TOON context memory and queues embedding generation after each message
 * is processed by the DefaultMessageService.
 *
 * RunEventPayload structure:
 * - runId: UUID - unique run identifier
 * - messageId: UUID - the message that triggered this run
 * - roomId: UUID - the room where the message was processed
 * - entityId: UUID - the entity that sent the message
 * - startTime: number
 * - status: 'started' | 'completed' | 'timeout'
 * - endTime?: number
 * - duration?: number
 * - error?: string
 *
 * Event handler signature: (params: any) => Promise<void>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleRunEnded(params: any): Promise<void> {
  const runtime = params?.runtime as IAgentRuntime | undefined;
  const messageId = params?.messageId as UUID | undefined;
  const roomId = params?.roomId as UUID | undefined;
  const status = params?.status as string | undefined;

  // Only process successful runs
  if (status !== "completed") {
    logger.debug(`[TOON] Skipping non-completed run: status=${status}`);
    return;
  }

  if (!runtime || !messageId || !roomId) {
    logger.debug("[TOON] Missing runtime, messageId, or roomId in RUN_ENDED payload");
    return;
  }

  const config = getConfig(runtime);

  if (!config.enabled) {
    return;
  }

  try {
    // Fetch the message from the database
    const memory = await runtime.getMemoryById(messageId);

    if (!memory) {
      logger.debug(`[TOON] Message not found: ${messageId}`);
      return;
    }

    // Skip if message is too short
    const messageText = memory.content?.text || "";
    if (messageText.length < config.minMessageLength) {
      logger.debug(
        `[TOON] Skipping embedding for short message: ${messageText.length} chars`
      );
      return;
    }

    // Skip if this is already a TOON context memory
    if (memory.content?.source === "toon-context") {
      return;
    }

    logger.info(`[TOON] Processing RUN_ENDED for message: ${messageId.slice(0, 8)}...`);

    // Create TOON context memory
    const contextMemory = await createToonContextMemory(
      runtime,
      memory,
      config
    );

    if (!contextMemory) {
      logger.debug("[TOON] No context memory created");
      return;
    }

    // Store the context memory
    await runtime.createMemory(contextMemory, "toon_context");

    // Queue embedding generation
    // This will be handled by EmbeddingGenerationService (from plugin-bootstrap)
    // which calls the TEXT_EMBEDDING model handler (from plugin-gateway)
    runtime.emitEvent(EventType.EMBEDDING_GENERATION_REQUESTED, {
      runtime,
      memory: contextMemory,
      priority: config.priority,
      retryCount: 0,
      maxRetries: 3,
      source: "toon-plugin",
    });

    const metadata = contextMemory.content?.metadata as Record<string, unknown> | undefined;
    logger.info(
      `[TOON] Queued embedding for context: ${metadata?.messageCount || 0} messages, ` +
        `${contextMemory.content?.text?.length || 0} chars`
    );
  } catch (error) {
    logger.error("[TOON] Error in handleRunEnded:", String(error));
  }
}

/**
 * Handle EMBEDDING_GENERATION_COMPLETED event
 * Logs TOON-specific metrics when our context embeddings complete
 *
 * The embedding is stored in memory.embedding after generation,
 * not passed as a separate event parameter.
 *
 * Event handler signature: (params: any) => Promise<void>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleEmbeddingCompleted(params: any): Promise<void> {
  const memory = params?.memory as Memory | undefined;

  if (!memory) {
    return;
  }

  // Only log for TOON context memories
  if (memory.content?.source !== "toon-context") {
    return;
  }

  // Embedding is stored in memory.embedding after EmbeddingGenerationService processes it
  const embedding = memory.embedding as number[] | undefined;

  const metadata = memory.content?.metadata as Record<string, unknown> | undefined;
  const messageCount = (metadata?.messageCount as number) || 0;
  const textLength = memory.content?.text?.length || 0;
  const embeddingDims = embedding?.length || 0;

  logger.info(
    `[TOON] Embedding completed: ${messageCount} messages, ` +
      `${textLength} chars -> ${embeddingDims} dims`
  );
}
