---
description: Force Deepwiki/docs research before any implementation
allowed-tools: WebFetch, mcp__deepwiki__ask_question, Read, Grep, Glob
---

# Research First

<task>
Research the topic thoroughly using Deepwiki and official docs before any implementation.
Topic: $ARGUMENTS
</task>

<constraints>
- No clarifications will be given. Use your best judgment.
- Do not ask the user questions. Take action immediately.
- NO CODING until research is complete.
- CITE SOURCES for every claim.
- If Deepwiki fails, find correct repo name on GitHub first.
</constraints>

## Workflow

### Step 1: Identify What Needs Research

<thinking>
- What libraries/APIs are involved?
- What patterns are needed?
- What could I be wrong about?
- What has changed since my training data?
</thinking>

### Step 2: Query Deepwiki

For each library/framework involved:

```
mcp__deepwiki__ask_question
  repoName: "owner/repo"
  question: "How do I [specific question]?"
```

Common repos:
- ElizaOS: `elizaOS/eliza`
- Claude Code: `anthropics/claude-code`
- Anthropic patterns: `anthropics/anthropic-cookbook`
- Drizzle ORM: `drizzle-team/drizzle-orm`
- Three.js: `mrdoob/three.js`

### Step 3: Check Official Docs

If Deepwiki doesn't have the answer:

```
WebFetch
  url: "[official docs URL]"
  prompt: "How do I [specific question]?"
```

### Step 4: Validate Understanding

Before proceeding, confirm:

- [ ] I found the current API (not outdated)
- [ ] I have working code examples
- [ ] I know the gotchas/edge cases
- [ ] I can cite my sources

### Step 5: Document Sources

Output your research findings:

```markdown
## Research Complete

### Sources
1. [Source 1] - What I learned
2. [Source 2] - What I learned

### Key Findings
- Finding 1
- Finding 2

### Gotchas to Avoid
- Gotcha 1
- Gotcha 2

### Ready to Implement
- [ ] Confirmed current API
- [ ] Have working examples
- [ ] Know edge cases
```

## Rules

1. **NO CODING** until research is complete
2. **NO ASSUMPTIONS** - verify everything
3. **CITE SOURCES** - document where info came from
4. **ADMIT UNCERTAINTY** - say "I need to research this" when unsure

## Anti-Patterns (DO NOT DO)

- "Based on my knowledge..." - WRONG, check Deepwiki
- "Typically you would..." - WRONG, verify first
- "I believe the API is..." - WRONG, look it up
- Writing code before research - BLOCKED

<output>
After research, output in this exact format:

```
RESEARCH COMPLETE

Topic: [what was researched]
Sources: [numbered list with URLs]
Confidence: HIGH | MEDIUM | LOW
Ready to implement: YES | NO

Key findings:
- [bullet points]

Gotchas:
- [bullet points]
```

Do not ask if the user wants to proceed. Just output the research results.
</output>
