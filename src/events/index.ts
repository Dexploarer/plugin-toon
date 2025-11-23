/**
 * TOON Plugin Event Handlers
 *
 * Provides handlers for:
 * - RUN_ENDED: Create TOON context embeddings after message processing
 * - EMBEDDING_GENERATION_COMPLETED: Log TOON embedding metrics
 */

export {
  handleRunEnded,
  handleEmbeddingCompleted,
  type ToonEmbeddingConfig,
} from "./embeddingEvents";
