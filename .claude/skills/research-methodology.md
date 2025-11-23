---
description: How to research before coding - Deepwiki patterns and official docs lookup
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.md"
alwaysApply: true
---

# Research Methodology

## Core Principle

**YOU DON'T KNOW ANYTHING. YOUR KNOWLEDGE IS OUTDATED.**

- Training data cutoff: January 2025
- Libraries change constantly
- APIs deprecate and update
- Documentation changes

## The Research-First Rule

Before writing ANY code:

1. **STOP** - Don't assume you know
2. **IDENTIFY** - What libraries/APIs are involved?
3. **QUERY** - Use Deepwiki for GitHub repos
4. **VERIFY** - Cross-reference with official docs
5. **THEN CODE** - Only after research

## Deepwiki Usage

### Query Format
```
mcp__deepwiki__ask_question
  repoName: "owner/repo"
  question: "How do I [specific thing]?"
```

### Common Repositories

| Library | Repo Name |
|---------|-----------|
| ElizaOS | elizaOS/eliza |
| Claude Code | anthropics/claude-code |
| Anthropic Cookbook | anthropics/anthropic-cookbook |
| Drizzle ORM | drizzle-team/drizzle-orm |
| Three.js | mrdoob/three.js |
| React Three Fiber | pmndrs/react-three-fiber |
| Elysia | elysiajs/elysia |
| Playwright | microsoft/playwright |
| Vite | vitejs/vite |
| Bun | oven-sh/bun |

### If Deepwiki Fails
1. The repo name is probably wrong
2. Go to GitHub and find correct owner/repo
3. Try deepwiki again with correct name
4. If repo not indexed, use WebFetch on official docs

## Official Docs Lookup

### WebFetch Pattern
```
WebFetch
  url: "https://docs.example.com/api/thing"
  prompt: "How do I use [thing]? Show me current API and examples."
```

### Key Documentation URLs

| Library | Docs URL |
|---------|----------|
| ElizaOS | https://docs.elizaos.ai |
| Claude | https://docs.anthropic.com |
| Drizzle | https://orm.drizzle.team |
| Three.js | https://threejs.org/docs |
| Bun | https://bun.sh/docs |
| Playwright | https://playwright.dev/docs |

## Validation Checklist

Before implementing, confirm:

- [ ] Found current API (not deprecated)
- [ ] Have working code example from source
- [ ] Know the gotchas/edge cases
- [ ] Can cite where info came from
- [ ] Cross-referenced multiple sources (if possible)

## Banned Phrases

NEVER use these without research:
- "Based on my knowledge..."
- "Typically you would..."
- "I believe the API is..."
- "It should be..."
- "Probably..."

ALWAYS use these:
- "According to Deepwiki..."
- "The official docs show..."
- "I need to research this first..."
- "Let me verify with Deepwiki..."

## Research Workflow

```
┌─────────────────┐
│ Task Received   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ What libraries? │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Deepwiki  │──── If not found ───▶ Find correct repo name
└────────┬────────┘                              │
         │                                       │
         ▼                                       │
┌─────────────────┐                              │
│ Verify w/ Docs  │◀─────────────────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NOW Code        │
└─────────────────┘
```

## Anti-Pattern Detection

If you catch yourself about to:
- Write code without checking Deepwiki
- Assume you know the current API
- Use syntax from memory instead of docs
- Skip verification "because it's simple"

**STOP** and research first.
