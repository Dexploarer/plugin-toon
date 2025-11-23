/**
 * TOON Encoding Utilities
 *
 * Wrapper around @toon-format/toon with ElizaOS-specific helpers.
 */

import { encode, decode } from "@toon-format/toon";
import type { ToonEncodeOptions, FormattedContext } from "../types";

/**
 * Encode data to TOON format
 */
export function encodeToon(data: unknown, options?: ToonEncodeOptions): string {
  try {
    return encode(data, {
      delimiter: options?.delimiter ?? ",",
      lengthMarker: options?.lengthMarker,
    });
  } catch (error) {
    // Fallback to JSON if TOON encoding fails
    console.warn(
      "[plugin-toon] TOON encoding failed, falling back to JSON:",
      error,
    );
    return JSON.stringify(data, null, 2);
  }
}

/**
 * Decode TOON format back to data
 */
export function decodeToon<T = unknown>(toonString: string): T {
  try {
    return decode(toonString) as T;
  } catch (error) {
    console.warn("[plugin-toon] TOON decoding failed:", error);
    throw error;
  }
}

/**
 * Format data for LLM context with a header
 */
export function formatForLLM(
  label: string,
  data: unknown,
  options?: ToonEncodeOptions,
): FormattedContext {
  if (data === null || data === undefined) {
    return { text: "", itemCount: 0 };
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { text: "", itemCount: 0 };
    }

    // Truncate if needed
    const maxLength = options?.maxArrayLength ?? 100;
    const truncated = data.length > maxLength;
    const items = truncated ? data.slice(0, maxLength) : data;

    const encoded = encodeToon(items, options);
    const suffix = truncated
      ? `\n(${data.length - maxLength} more items...)`
      : "";

    return {
      text: `## ${label}\n${encoded}${suffix}`,
      itemCount: data.length,
    };
  }

  // Handle objects
  if (typeof data === "object") {
    const encoded = encodeToon(data, options);
    return {
      text: `## ${label}\n${encoded}`,
      itemCount: 1,
    };
  }

  // Handle primitives
  return {
    text: `## ${label}\n${String(data)}`,
    itemCount: 1,
  };
}

/**
 * Check if data is suitable for TOON tabular format
 * (uniform array of objects with primitive values)
 */
export function isToonOptimal(data: unknown): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  // Check if all items are objects with same keys
  const firstItem = data[0];
  if (typeof firstItem !== "object" || firstItem === null) {
    return false;
  }

  const keys = Object.keys(firstItem);
  if (keys.length === 0) {
    return false;
  }

  // Check all items have same structure with primitive values
  return data.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const itemKeys = Object.keys(item);
    if (itemKeys.length !== keys.length) {
      return false;
    }
    return keys.every((key) => {
      const value = (item as Record<string, unknown>)[key];
      return (
        itemKeys.includes(key) &&
        (typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null)
      );
    });
  });
}

/**
 * Smart encode - uses TOON for optimal cases, JSON otherwise
 */
export function smartEncode(
  data: unknown,
  options?: ToonEncodeOptions,
): string {
  if (isToonOptimal(data)) {
    return encodeToon(data, options);
  }
  return JSON.stringify(data, null, 2);
}
