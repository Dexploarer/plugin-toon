# @hyperscape/plugin-toon

TOON-encoded providers for token-efficient LLM context in ElizaOS.

## What is TOON?

TOON (Token-Oriented Object Notation) is a compact serialization format designed to reduce token usage when passing structured data to LLMs. It achieves **30-60% token savings** compared to JSON, especially for uniform arrays of objects.

```
// JSON (15 tokens)
{"items":[{"id":1,"name":"Ada"},{"id":2,"name":"Bob"}]}

// TOON (8 tokens)
items[2]{id,name}:
  1,Ada
  2,Bob
```

## Installation

```bash
bun add @hyperscape/plugin-toon @toon-format/toon
```

## Usage

### As ElizaOS Plugin

```typescript
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';
import { toonPlugin } from '@hyperscape/plugin-toon';
import { hyperscapePlugin } from '@hyperscape/plugin-hyperscape';

const agent = {
  plugins: [
    bootstrapPlugin,    // Core functionality
    toonPlugin,         // TOON providers (override bootstrap)
    hyperscapePlugin,   // Your game logic
  ],
};
```

### Using Utilities Directly

```typescript
import { encodeToon, formatForLLM, smartEncode } from '@hyperscape/plugin-toon';

// Encode data to TOON
const toon = encodeToon({
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
  ],
});
// Output:
// users[2]{id,name,role}:
//   1,Alice,admin
//   2,Bob,user

// Format for LLM context with header
const { text, itemCount } = formatForLLM('Active Users', users);
// Output:
// ## Active Users
// [2]{id,name,role}:
//   1,Alice,admin
//   2,Bob,user

// Smart encode - uses TOON for optimal cases, JSON otherwise
const encoded = smartEncode(data);
```

## Providers

This plugin provides TOON-encoded versions of common bootstrap providers:

| Provider | Position | Replaces |
|----------|----------|----------|
| `toonRecentMessagesProvider` | 10 | `recentMessagesProvider` |
| `toonFactsProvider` | 11 | `factsProvider` |
| `toonEntitiesProvider` | 12 | `entitiesProvider` |
| `toonActionsProvider` | 13 | `actionsProvider` |

Providers have higher position numbers, so they take precedence over bootstrap providers when both plugins are loaded.

## Token Savings

Based on TOON benchmarks:

| Data Type | JSON Tokens | TOON Tokens | Savings |
|-----------|-------------|-------------|---------|
| 100 entities | ~15,000 | ~8,700 | 42% |
| 180 day metrics | ~11,000 | ~4,500 | 59% |
| Nested order | ~260 | ~170 | 35% |

## API Reference

### Functions

#### `encodeToon(data, options?)`
Encode any data to TOON format.

#### `decodeToon(toonString)`
Decode TOON string back to data.

#### `formatForLLM(label, data, options?)`
Format data for LLM context with a markdown header.

#### `smartEncode(data, options?)`
Automatically choose TOON or JSON based on data structure.

#### `isToonOptimal(data)`
Check if data is suitable for TOON's tabular format.

### Options

```typescript
interface ToonEncodeOptions {
  delimiter?: string;      // Default: ","
  lengthMarker?: string;   // Default: none
  maxArrayLength?: number; // Truncate long arrays
  maxStringLength?: number; // Truncate long strings
}
```

## When to Use TOON

**Good for:**
- Uniform arrays of objects (entity lists, inventory, logs)
- Tabular data (DB results, API responses)
- High-volume LLM interactions

**Not ideal for:**
- Deeply nested structures
- Non-uniform data
- Single objects
- Natural language text

## License

MIT
