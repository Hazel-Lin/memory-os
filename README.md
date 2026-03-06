# Memory OS

Memory OS is a local-first context system for AI-native work.

It helps you maintain three kinds of context in one place:

- `Profile`: who you are, how you think, and how you like AI to respond
- `Projects`: what you are building, who it is for, and what matters this week
- `Insights`: reusable judgments, lessons, and patterns from past AI collaboration

The goal is not to store more notes. The goal is to help AI enter your context faster and more consistently.

## Why

AI tools are powerful, but they do not retain your working context well.

You keep repeating:

- who you are
- what project you are working on
- what your audience, goals, and constraints are
- how you prefer ideas to be structured and written

Memory OS gives you a persistent personal context layer that stays local, structured, and ready to export into AI conversations.

## What It Does

- Store your personal profile locally
- Track project context in a structured format
- Capture reusable insights tied to a project or kept standalone
- Export profile, project context, and insights as AI-ready text
- Support both CLI workflows and a local GUI codebase

## Core Model

### Profile

Use `Profile` to define:

- name
- languages
- short bio
- writing style preferences
- self-assessed capabilities

This helps AI adapt tone, structure, and depth to you.

### Projects

Use `Projects` to track:

- project name and description
- goals
- target audience
- current status
- focus for this week

This helps AI understand what you are building right now.

### Insights

Use `Insights` to save:

- observations
- decisions
- reusable prompts or frameworks
- lessons from previous work

This helps AI inherit your previous thinking instead of starting from zero every time.

## Who It Is For

Memory OS is most useful for people who work with AI frequently, especially:

- indie hackers
- developers using multiple AI tools
- writers and creators with a distinct style
- solo builders managing several projects
- product thinkers who want reusable project context

It is less useful for people who only use AI occasionally or only need a general note-taking app.

## Local-First

All data is stored locally in:

```bash
~/.memory-os/memory.json
```

This keeps the workflow lightweight and privacy-friendly. You can inspect, back up, or version the file yourself.

## Quick Start

### Install dependencies

```bash
npm install
```

### Initialize memory storage

```bash
npm run dev -- init
```

### Edit your profile

```bash
npm run dev -- edit profile
```

### Add a project

```bash
npm run dev -- add project
```

### Add an insight

```bash
npm run dev -- add insight
```

### List projects

```bash
npm run dev -- list
```

### Export profile for AI

```bash
npm run dev -- export profile --target claude
```

### Export project context

```bash
npm run dev -- export context --project <project-id> --target claude
```

### Export insights

```bash
npm run dev -- export insights
```

### Start the local API

```bash
npm run dev -- serve --port 3322
```

Example endpoints:

```bash
curl http://127.0.0.1:3322/profile
curl http://127.0.0.1:3322/projects
curl http://127.0.0.1:3322/projects/<project-id>/context?target=claude
curl "http://127.0.0.1:3322/insights?project=<project-id>"
```

Example external workflow:

```bash
node scripts/fetch-project-context.mjs --project <project-id> --target claude
```

This script fetches `GET /projects/:id/context` and prints the prompt-ready export so another local tool or agent can consume it.

### Generate agent-ready context packs

```bash
node scripts/prepare-claude-code-context.mjs --project <project-id>
node scripts/prepare-codex-context.mjs --project <project-id>
node scripts/prepare-terminal-agent-context.mjs --project <project-id>
```

These scripts fetch the local API and assemble a combined user + project context pack tailored for the target workflow.

### Start the MCP-compatible server

```bash
npm run dev -- mcp
```

The MCP server runs over stdio and exposes Memory OS through:

- resources
- prompts
- tools

Current MCP tools:

- `get_profile`
- `get_project_context`
- `get_insights`

### Register Memory OS in Codex CLI

```bash
node scripts/install-codex-mcp.mjs
codex mcp list
codex mcp get memory-os --json
```

This registers Memory OS as a stdio MCP server inside Codex CLI using:

```text
node /Users/linhuizi/Desktop/memory-os/scripts/run-memory-os-mcp.mjs
```

Example validation:

```bash
codex exec -c 'user_instructions=""' "Use the memory-os MCP tool get_project_context with projectId demo_001. Respond with only the project name."
```

In the current environment, Codex successfully called `memory-os -> get_project_context` and returned `Memory OS`.

### Start a Codex task with Memory OS context

```bash
node scripts/codex-memory.mjs --project demo_001 --print
node scripts/codex-memory.mjs --project demo_001 --exec "Using the provided Memory OS brief, respond with only the project name."
```

Optional:

```bash
node scripts/codex-memory.mjs --base-url http://127.0.0.1:3322 --project demo_001 --exec "Plan the next implementation step." -- --skip-git-repo-check --json
```

This wrapper:

- fetches profile and project context from the local API
- assembles a single Codex briefing
- forwards the briefing into `codex exec`

## CLI Commands

The CLI entrypoint is `mem`.

Available commands:

- `mem init`
- `mem edit profile`
- `mem add project`
- `mem add insight`
- `mem export profile --target <claude|generic>`
- `mem export context --project <id> --target <claude|generic>`
- `mem export insights [--project <id>]`
- `mem list`
- `mem serve [--host <host>] [--port <port>]`
- `mem mcp`

For local development, run them through:

```bash
npm run dev -- <command>
```

## Example Use Cases

- Before starting a new Claude or Codex session, export your profile so the model understands your background and writing preferences
- When switching between projects, export project context instead of rewriting the same background again
- When writing, planning, or reviewing, export relevant insights so AI can reuse your existing judgments
- When using multiple AI tools, keep one local memory layer instead of rebuilding context in each product
- When integrating terminal agents or scripts, query the local API instead of manually copying CLI output
- When integrating MCP-capable clients, expose Memory OS as prompts, resources, and tools instead of building one-off adapters every time
- When using Codex CLI, register Memory OS once as an MCP server and let Codex pull project context on demand
- When starting a focused Codex task, use `scripts/codex-memory.mjs` to inject Memory OS context in one command

## Repository Structure

```text
core/       Shared data models, storage, migration, exporters
src/        CLI entrypoint and commands
gui/        React UI
electron/   Electron main/preload code
tests/      Core tests and smoke tests
```

## Development

### Build TypeScript

```bash
npm run build
```

### Run core tests

```bash
npm run test:core
```

### Run smoke tests

```bash
npm run test:smoke
```

### GUI

The repository also includes a GUI and Electron codepath under `gui/` and `electron/`.

Current scripts in `package.json`:

```bash
npm run dev:gui
npm run build:gui
npm run preview:gui
```

If you are positioning the product publicly, the clearest message today is:

> Memory OS is a local-first personal context layer for AI work.

## Positioning

Memory OS is not trying to be a general PKM tool.

It is closer to:

- a personal context layer for AI conversations
- a structured memory file for your work with AI
- a reusable bridge between your projects and the models you use

In one sentence:

**Memory OS helps AI understand who you are, what you are building, and what you have already learned.**
