---
description: Knowledge about TOON plugin architecture and patterns
globs:
  - src/**/*.ts
---

# TOON Plugin Knowledge

## Overview

plugin-toon provides TOON-encoded providers for ElizaOS that reduce token usage by 30-60% for structured data, especially uniform arrays of objects.

## What is TOON?

TOON (Token-Oriented Object Notation) is a compact data format optimized for LLM token efficiency:

```
# JSON (high tokens)
[{"name":"Alice","age":30},{"name":"Bob","age":25}]

# TOON (low tokens)
name|age
Alice|30
Bob|25
```

TOON works best when:
- Data is an array of objects
- Objects have the same keys (uniform structure)
- Values are simple (strings, numbers, booleans)

## Architecture

```
src/
├── providers/           # TOON-encoded ElizaOS providers
│   ├── toonRecentMessages.ts  # Recent conversation messages
│   ├── toonFacts.ts           # Known facts about entities
│   ├── toonEntities.ts        # Entities in the room
│   ├── toonActions.ts         # Available actions
│   └── index.ts               # Re-exports all providers
├── utils/
│   └── toon.ts          # TOON encoding/decoding utilities
├── types.ts             # TypeScript type definitions
└── index.ts             # Plugin export
```

## Provider Pattern

All TOON providers follow this structure:

```typescript
export const toonXxxProvider: Provider = {
  name: "toonXxx",
  description: "TOON-encoded xxx for token efficiency",
  dynamic: true,
  position: 10,  // Higher than bootstrap defaults to override

  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // 1. Get raw data from runtime
      const data = await runtime.getSomething(...);

      // 2. Transform to compact format
      const compact = data.map(item => ({
        key1: item.value1,
        key2: item.value2,
      }));

      // 3. Format with TOON
      const { text, itemCount } = formatForLLM("Label", compact);

      // 4. Return ProviderResult
      return {
        text,
        values: { count: itemCount },
        data: { items: compact, raw: data },
      };
    } catch (error) {
      console.error("[toonXxx] Error:", error);
      return {
        text: "",
        values: { count: 0, error: true },
        data: { error },
      };
    }
  },
};
```

## Key Utilities

### `encodeToon(data: unknown[]): string`
Encode an array of objects to TOON format.

```typescript
const toon = encodeToon([
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
]);
// "name|age\nAlice|30\nBob|25"
```

### `decodeToon(text: string): Record<string, string>[]`
Decode TOON format back to objects.

```typescript
const data = decodeToon("name|age\nAlice|30\nBob|25");
// [{ name: "Alice", age: "30" }, { name: "Bob", age: "25" }]
```

### `formatForLLM(label: string, data: unknown[]): { text: string, itemCount: number }`
Format data with a label header for LLM context.

```typescript
const { text, itemCount } = formatForLLM("Users", users);
// "## Users (2 items)\nname|age\nAlice|30\nBob|25"
```

### `isToonOptimal(data: unknown[]): boolean`
Check if TOON encoding is optimal for this data (vs JSON).

```typescript
isToonOptimal([{ a: 1 }, { a: 2 }]); // true - uniform
isToonOptimal([{ a: 1 }, { b: 2 }]); // false - different keys
```

### `smartEncode(data: unknown[]): string`
Automatically choose best format (TOON or JSON).

```typescript
smartEncode(uniformArray);    // Returns TOON
smartEncode(nonUniformArray); // Returns JSON
```

## Position Numbers

Providers use position to determine order. TOON providers use higher positions to override bootstrap defaults:

| Provider | Bootstrap Position | TOON Position |
|----------|-------------------|---------------|
| recentMessages | ~5 | 10 |
| facts | ~5 | 11 |
| entities | ~5 | 12 |
| actions | ~5 | 13 |

## Error Handling

All providers should:
1. Wrap get() in try/catch
2. Return empty text on error
3. Set error flag in values
4. Include error in data for debugging

```typescript
catch (error) {
  console.error("[providerName] Error:", error);
  return {
    text: "",
    values: { count: 0, error: true },
    data: { error },
  };
}
```

## Testing

Test TOON providers for:
1. **Correctness** - Output matches expected format
2. **Round-trip** - encode -> decode preserves data
3. **Empty handling** - Empty arrays return empty text
4. **Token efficiency** - TOON uses fewer tokens than JSON

```typescript
describe('toonProvider', () => {
  it('should return TOON format', async () => {
    const result = await provider.get(runtime, message, state);
    expect(result.text).toContain('|'); // Pipe delimiter
  });

  it('should handle empty data', async () => {
    const result = await provider.get(emptyRuntime, message, state);
    expect(result.text).toBe('');
  });
});
```

## Integration

To use TOON providers in an ElizaOS agent:

```typescript
import { toonPlugin } from '@hyperscape/plugin-toon';

const agent = {
  plugins: [
    bootstrapPlugin,  // Core functionality
    toonPlugin,       // TOON providers (override bootstrap)
  ],
};
```

The higher position numbers ensure TOON providers take precedence over bootstrap defaults.
