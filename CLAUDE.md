# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**@dexploarer/plugin-toon** is a drop-in replacement for `@elizaos/plugin-bootstrap` with TOON-encoded providers for token-efficient LLM context. TOON (Token-Oriented Object Notation) reduces token usage by 30-60% for structured data.

## Commands

```bash
bun install       # Install dependencies
bun run build     # Build (tsc)
bun run dev       # Watch mode
bun run clean     # Remove dist/
bun run lint      # ESLint
```

## Usage

Replace bootstrap with toon in your character config:

```typescript
// Before
import { bootstrapPlugin } from '@elizaos/plugin-bootstrap';

// After
import { toonPlugin } from '@dexploarer/plugin-toon';
// Or for max compatibility:
import { bootstrapPlugin } from '@dexploarer/plugin-toon';

const agent = { plugins: [toonPlugin] };
```

In Hyperscape's `character-selection.ts`:
```typescript
plugins: [
  "@hyperscape/plugin-hyperscape",
  "@elizaos/plugin-sql",
  "@dexploarer/plugin-toon",  // Replaces @elizaos/plugin-bootstrap
],
```

## Architecture

### Drop-in Bootstrap Replacement

This plugin re-exports everything from `@elizaos/plugin-bootstrap` and replaces 4 data-heavy providers with TOON-encoded versions:

| Provider | Name | Position | What it replaces |
|----------|------|----------|------------------|
| `toonRecentMessagesProvider` | RECENT_MESSAGES | 100 | recentMessagesProvider |
| `toonFactsProvider` | FACTS | (dynamic) | factsProvider |
| `toonEntitiesProvider` | ENTITIES | (dynamic) | entitiesProvider |
| `toonActionsProvider` | ACTIONS | -1 | actionsProvider |

All other bootstrap components (actions, evaluators, services, events, other providers) are re-exported unchanged.

### Key Files

- `src/index.ts` - Plugin entry point, re-exports bootstrap + TOON providers
- `src/utils/toon.ts` - Core TOON utilities wrapping `@toon-format/toon`
- `src/providers/*.ts` - TOON-wrapped provider implementations
- `src/types.ts` - TypeScript interfaces

### Provider Implementation Pattern

TOON providers use the same names as bootstrap (e.g., "RECENT_MESSAGES") to override them:

```typescript
export const toonRecentMessagesProvider: Provider = {
  name: "RECENT_MESSAGES",  // Same name as bootstrap = override
  description: "TOON-encoded recent messages",
  position: 100,  // Same position as bootstrap

  get: async (runtime, message, state) => {
    // 1. Fetch data using runtime APIs
    // 2. Transform to compact arrays
    // 3. TOON-encode with encodeToon()
    // 4. Return { data, values, text }
  },
};
```

### Core Utilities (`src/utils/toon.ts`)

- `encodeToon(data, options?)` - Encode to TOON format (tab-delimited by default)
- `decodeToon<T>(toonString)` - Decode back to objects
- `formatForLLM(label, data, options?)` - Format with header, returns `{ text, itemCount }`
- `smartEncode(data, options?)` - Auto-detect optimal format
- `isToonOptimal(data)` - Check if TOON is beneficial

### When TOON Helps

TOON is optimal for: arrays of 3+ uniform objects with primitive values (message histories, entity lists, action catalogs).

Use JSON for: single objects, deeply nested structures, irregular data.

## Dependencies

- `@elizaos/core` ^1.0.0 - ElizaOS runtime types
- `@elizaos/plugin-bootstrap` ^1.0.0 - Base bootstrap functionality
- `@toon-format/toon` ^1.0.0 - TOON encoding library

## Deepwiki Repos

Use these exact repo names for Deepwiki research:

- ElizaOS: `elizaOS/eliza`
- TOON format: `toon-format/toon`
