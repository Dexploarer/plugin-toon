/**
 * TOON Plugin Types
 */

export interface ToonEncodeOptions {
  /** Delimiter for tabular data (default: comma) */
  delimiter?: string;
  /** Length marker prefix (default: none) */
  lengthMarker?: string;
  /** Maximum array length before truncation */
  maxArrayLength?: number;
  /** Maximum string length before truncation */
  maxStringLength?: number;
}

export interface ToonProviderConfig {
  /** Whether to include header comments */
  includeHeaders?: boolean;
  /** Maximum items to include in context */
  maxItems?: number;
  /** Fields to exclude from encoding */
  excludeFields?: string[];
}

export interface FormattedContext {
  /** TOON-encoded text for LLM context */
  text: string;
  /** Token count estimate */
  tokenEstimate?: number;
  /** Original item count */
  itemCount: number;
}
