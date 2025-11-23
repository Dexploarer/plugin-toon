---
description: Review plugin files against ElizaOS canonical patterns
allowed-tools: Read, Grep, Glob, WebFetch
---

# ElizaOS Plugin Review

Review TOON plugin code against ElizaOS v1 provider patterns.

## Review Checklist

### Providers
For each provider file, verify:
- [ ] Has `name` in camelCase
- [ ] Has `description` explaining context provided
- [ ] Has `dynamic` boolean for re-evaluation
- [ ] Has `position` number for ordering
- [ ] Has `get` async function returning `ProviderResult`
- [ ] Returns `{ text, values, data }` structure
- [ ] Has proper error handling

### Plugin Definition
Verify main plugin export has:
- [ ] `name` in @org/plugin-name format
- [ ] `description` string
- [ ] `providers` array
- [ ] `actions` array (can be empty)
- [ ] `evaluators` array (can be empty)
- [ ] `services` array (can be empty)
- [ ] `events` object (can be empty)

## Instructions

1. First, glob for all provider files:
   ```
   Glob src/providers/*.ts
   ```

2. For each provider, check against the Provider Pattern:
   ```typescript
   interface Provider {
     name: string;          // camelCase
     description?: string;  // Context description
     dynamic?: boolean;     // Re-evaluate each request
     position?: number;     // Order in chain
     get: (runtime, message, state) => Promise<ProviderResult>;
   }
   ```

3. Report findings in this format:

```markdown
## Provider Review: [filename]

**Compliance: X/5**

| Check | Status | Notes |
|-------|--------|-------|
| name | OK/MISSING | ... |
| description | OK/MISSING | ... |
| dynamic | OK/MISSING | ... |
| position | OK/MISSING | ... |
| get | OK/MISSING | ... |

**Recommendations:**
- ...
```

4. Check the main plugin definition in `src/index.ts`

5. Generate a final compliance score and priority fixes list

## Output Format

```markdown
# ElizaOS Plugin Compliance Report

## Summary
- **Overall Score:** X%
- **Providers:** X/4 compliant

## Critical Issues
1. ...

## High Priority Fixes
1. ...

## Medium Priority Fixes
1. ...

## Low Priority Fixes
1. ...
```

## TOON-Specific Checks

Additionally verify:
- [ ] Uses `formatForLLM()` for output formatting
- [ ] Handles empty data gracefully
- [ ] Returns empty string for text when no data
- [ ] Sets appropriate values for template substitution
