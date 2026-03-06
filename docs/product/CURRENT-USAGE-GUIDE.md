# Memory OS Current Usage Guide

## Purpose

This guide explains how to use Memory OS in daily work today.

The current product is best understood as:

A local-first personal AI context hub.

Its main job is to reduce repeated context explanation across AI tools.

## What Memory OS Is Good At Right Now

Use Memory OS when you need to carry the same personal and project context across:

- Codex
- terminal scripts
- future MCP clients
- manual AI chat sessions

Right now, the strongest use cases are:

- reusable profile context
- reusable project context
- reusable insight bundles
- Codex task startup with injected context

## Core Workflow

Think of the daily workflow in four steps:

1. Maintain stable context
2. Update project context
3. Capture reusable insights
4. Inject the right context into the next AI task

## Step 1: Maintain Stable Context

Use this when your personal description, style, or preferences change.

```bash
npm run dev -- edit profile
```

What to keep updated:

- who you are
- what languages you use
- how you prefer AI to write and reason
- what styles or patterns to avoid

Use this rarely, but keep it accurate.

## Step 2: Maintain Project Context

Create a new project:

```bash
npm run dev -- add project
```

Edit an existing project:

```bash
npm run dev -- edit project <project-id>
```

Use projects to track:

- what you are building
- who it is for
- what success looks like
- what matters this week

This is the most important operational layer in day-to-day usage.

## Step 3: Capture Reusable Insights

When an AI collaboration pattern, prompt, or idea is genuinely reusable, store it.

Create a new insight:

```bash
npm run dev -- add insight
```

Edit an insight:

```bash
npm run dev -- edit insight <insight-id>
```

Good candidates:

- prompt structures that repeatedly work
- product or writing heuristics
- decision patterns worth reusing
- lessons from previous AI sessions

Do not dump every chat into Memory OS.
Only keep assets with repeat value.

## Step 4: Inject Context Into AI Work

### Option A: Manual export for any AI tool

Profile:

```bash
npm run dev -- export profile --target claude
```

Project context:

```bash
npm run dev -- export context --project <project-id> --target claude
```

Insights:

```bash
npm run dev -- export insights --project <project-id>
```

Use this when working in:

- Claude web
- ChatGPT
- any chat interface without a custom integration

### Option B: Local API for scripts and tools

Start the API:

```bash
npm run dev -- serve --port 3322
```

Useful endpoints:

```bash
curl http://127.0.0.1:3322/profile
curl http://127.0.0.1:3322/projects
curl http://127.0.0.1:3322/projects/<project-id>/context?target=claude
curl "http://127.0.0.1:3322/insights?project=<project-id>"
```

Use this when another script or tool needs Memory OS as a local data source.

### Option C: MCP for compatible clients

Start the MCP server:

```bash
npm run dev -- mcp
```

Current MCP tools:

- `get_profile`
- `get_project_context`
- `get_insights`

Use this when a host tool can talk to MCP directly.

### Option D: Codex integration

Register Memory OS once:

```bash
node scripts/install-codex-mcp.mjs
```

Check registration:

```bash
codex mcp list
codex mcp get memory-os --json
```

#### Codex path 1: Let Codex call Memory OS via MCP

This is useful when you want Codex to pull context on demand during a task.

Example:

```bash
codex exec -c 'user_instructions=""' "Use the memory-os MCP tool get_project_context with projectId demo_001. Respond with only the project name."
```

#### Codex path 2: Start Codex with a full Memory OS brief

Print the assembled brief:

```bash
node scripts/codex-memory.mjs --project demo_001 --print
```

Run Codex with injected Memory OS context:

```bash
node scripts/codex-memory.mjs --project demo_001 --exec "Plan the next implementation step."
```

Use this when you want Codex aligned before it starts the task.

## Recommended Daily Routine

### Morning

- confirm the main project you are working on
- update project focus if priorities changed

### During work

- when switching AI tools, export or inject the relevant project context
- when a collaboration pattern proves reusable, save it as an insight

### End of day

- only capture durable insights
- update the project if the week's focus or status changed

## Recommended Operating Rule

Use Memory OS for:

- stable identity
- stable style
- project context
- reusable assets

Do not use Memory OS for:

- raw chat dumping
- temporary scratch notes
- everything you might want someday

If a piece of information will not help a future AI session, it probably does not belong here.

## Best Current Entry Points

If you only use three things, use these:

1. `mem edit project <id>`
2. `mem export context --project <id>`
3. `node scripts/codex-memory.mjs --project <id> --exec "<task>"`

## Current Product Boundary

Memory OS today is not:

- a full self-growth system
- a conversation archive
- a general PKM app

It is a practical personal context layer for AI work.

## Next Personal Validation

Use this guide for one week and observe:

- whether you repeat less context
- whether Codex or other AI tools align faster
- whether you actually reuse saved insights
- whether maintaining the context feels worth the effort
