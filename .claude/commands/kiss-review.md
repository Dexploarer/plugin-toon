---
description: KISS (Keep It Simple Stupid) code review
allowed-tools: Read, Grep, Glob
---

# KISS Review

Review code for unnecessary complexity. Suggest simplifications.

## Input

File or directory to review: `$ARGUMENTS`

If no argument, review recent changes or current working file.

## Complexity Indicators

### Code Smells to Flag

1. **Over-Abstraction**
   - Abstract class with only one implementation
   - Interface for single-use types
   - Factory for simple object creation

2. **Premature Optimization**
   - Caching before profiling
   - Complex algorithms for small data
   - Performance hacks without benchmarks

3. **Unnecessary Indirection**
   - Wrapper classes that just delegate
   - Multiple files for simple logic
   - Service -> Manager -> Handler chains

4. **Type Gymnastics**
   - Complex generic constraints
   - Union types with 5+ variants
   - Conditional types that could be simpler

5. **Callback Hell / Promise Chains**
   - Nested callbacks > 2 levels
   - `.then().then().then()` chains
   - Missing async/await simplification

## Review Process

### Step 1: Count Complexity

```
Lines of code: [N]
Number of files: [N]
Nesting depth (max): [N]
Function count: [N]
Class count: [N]
Import count: [N]
```

### Step 2: Ask "Why?" for Each Abstraction

For each class/interface/abstraction:

<thinking>
- Could this be a function instead of a class?
- Could this be inline instead of extracted?
- Is this abstraction used more than once?
- What problem does this solve?
</thinking>

### Step 3: Identify KISS Violations

```markdown
## KISS Violations Found

### 1. [Location]
**What:** [Description]
**Why it's complex:** [Explanation]
**Simpler alternative:** [Suggestion]
**Effort to fix:** LOW | MEDIUM | HIGH

### 2. [Location]
...
```

### Step 4: Suggest Simplifications

For each violation, provide:
- Before/after code comparison
- Why simpler is better
- Any tradeoffs

## KISS Principles

### Do
- Write functions, not classes (when possible)
- Inline simple logic
- Use built-in types
- Prefer flat over nested
- Delete code you don't need
- Use standard library

### Don't
- Create abstractions "for later"
- Add layers "for flexibility"
- Optimize without measuring
- Follow patterns blindly
- Keep dead code "just in case"

## Scoring

Rate the code:

| Score | Meaning |
|-------|---------|
| A | Simple, clear, minimal |
| B | Minor unnecessary complexity |
| C | Some over-engineering |
| D | Significant complexity debt |
| F | Needs major simplification |

## Output Format

```markdown
# KISS Review: [file/directory]

**Score:** [A-F]

## Summary
- Total violations: [N]
- High impact: [N]
- Medium impact: [N]
- Low impact: [N]

## Violations

### 1. [Description]
**File:** [path:line]
**Impact:** HIGH | MEDIUM | LOW

Before:
\`\`\`typescript
[complex code]
\`\`\`

After:
\`\`\`typescript
[simplified code]
\`\`\`

**Why simpler:** [reason]

---

## Recommendations
1. [Priority fix 1]
2. [Priority fix 2]
```

## Quick Checks

Ask yourself:
- Can I explain this in one sentence?
- Would a junior dev understand it?
- Is there a standard library function for this?
- Am I solving a problem that doesn't exist?
- Will I remember why this exists in 6 months?

If any answer is "no", simplify.
