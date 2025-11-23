---
description: Build the plugin-toon project
allowed-tools: Bash(bun:*), Bash(bun run:*), Read
---

# Build Plugin

<task>
Build the plugin-toon package.
</task>

<constraints>
- No clarifications will be given. Use your best judgment.
- Do not ask the user questions. Take action.
- If a build fails, diagnose and fix automatically.
</constraints>

<context>
Current git status:
!`git status --short`

Package.json scripts:
!`cat package.json | grep -A 10 '"scripts"'`
</context>

## Commands

### Build
```bash
bun run build
```

### Clean Build
```bash
bun run clean && bun run build
```

### Watch Mode
```bash
bun run dev
```

### Type Check Only
```bash
bun run build --noEmit
```

## Input: $ARGUMENTS

If argument provided:
- empty or `build` -> `bun run build`
- `clean` -> `bun run clean && bun run build`
- `dev` -> `bun run dev`
- `check` -> TypeScript check only

<output>
Execute the appropriate build command(s).
Report success or diagnose failures.
Do not ask for confirmation - just build.
</output>
