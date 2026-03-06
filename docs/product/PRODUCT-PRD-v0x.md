# Memory OS Product PRD v0.x

## Product Definition

Memory OS is a local-first, cross-tool personal AI context layer used to manage:

- identity traits
- writing and expression style
- long-term preferences
- project context
- high-value reusable collaboration assets

Its near-term job is simple:

Help the user switch between AI tools without repeatedly redefining who they are, how they work, and what they are currently doing.

## Product Vision

In the long run, Memory OS may evolve into the foundation for a richer personal AI operating layer.

In the current stage, it is not a general note-taking app, not a cloud memory service, and not a full self-growth system.

It is a user-owned context layer for AI-native work.

## Current Scope

v0.x is explicitly limited to the personal context layer.

The product goal is:

Reduce context reconstruction cost across AI tools.

The product does not currently aim to solve:

- automatic personality modeling
- growth coaching
- full conversation archival
- autonomous reflection agents
- large-scale memory graphs

## Target Users

Primary users:

- AI-native indie developers
- creators and writers using AI repeatedly
- solo builders running multiple projects
- heavy multi-model or multi-agent users

Secondary users:

- privacy-sensitive local-first users
- users who maintain strong style and workflow preferences

Not a priority:

- casual AI users
- users satisfied with a single platform's built-in memory
- users unwilling to maintain structured context

## Core User Problem

When switching between Claude, ChatGPT, Cursor, Codex, terminal agents, or future tools, users repeatedly need to explain:

- who they are
- how they prefer AI to respond
- what project they are working on
- what constraints and priorities currently matter
- what useful collaboration patterns they already discovered

This repetition is costly, inconsistent, and hard to control.

## Product Principles

1. Local first
All memory defaults to local storage and user ownership.

2. Cross-tool first
The system should be callable from different tools, not locked into one UI.

3. Structured over raw
High-value structured context matters more than dumping raw history.

4. Reusable over exhaustive
The system should prioritize assets that improve repeated AI collaboration.

5. Interface first
CLI and API matter more than a heavy GUI.

## Core Entities

v0.x should freeze around 3-4 core entities.

### 1. Profile

Purpose:
Store stable personal context.

Suggested fields:

- name
- bio
- languages
- writing style
- long-term preferences

### 2. Project

Purpose:
Store project-level working context.

Suggested fields:

- id
- name
- description
- goals
- audience
- status
- current focus

### 3. Insight

Purpose:
Store reusable collaboration assets.

Suggested fields:

- id
- title
- scenario
- content
- related project
- optional tags

### 4. Current Context

Optional in v0.x.

Purpose:
Store short-lived active context without turning the product into a full growth system.

Suggested fields:

- active project
- current priorities
- constraints
- near-term target

## Must-Have Capabilities in v0.x

### CLI

- `mem init`
- `mem edit profile`
- `mem add project`
- `mem edit project <id>`
- `mem add insight`
- `mem edit insight <id>`
- `mem export profile`
- `mem export context --project <id>`
- `mem export insights [--project <id>]`

### Export Layer

The product must output prompt-ready context, not just raw data dumps.

Initial targets:

- `generic`
- `claude`
- optional `chatgpt`

### Local API

Prefer read-only first.

Examples:

- `GET /profile`
- `GET /projects`
- `GET /projects/:id/context`
- `GET /insights`

### Storage

- local-first
- human-readable
- schema versioned
- easy to migrate later

JSON is acceptable in v0.x.

## GUI Role

GUI is allowed only as a lightweight companion.

Its job:

- browse data
- edit data
- copy exports
- inspect current memory state

Its job is not:

- define the product direction
- become the main architecture
- introduce heavy interaction workflows ahead of CLI/API validation

## Explicitly Deferred

These items are intentionally postponed:

- growth plan
- capability radar
- decision log as a major subsystem
- people graph
- full AI conversation archive
- weekly or monthly reflection agent
- self-profile auto-tuning
- browser auto-injection
- platform memory synchronization

## Success Criteria for v0.x

The product is successful only if it is used repeatedly in real workflows.

Primary validation metrics:

- used across multiple AI tools within 2 weeks
- reduces repeated context explanation
- improves output consistency across tools
- user continues updating profile, projects, and insights

Key qualitative questions:

- Did startup friction decrease?
- Did the AI get aligned faster?
- Did previously captured insights become reusable?
- Did structured context feel worth maintaining?

## Near-Term Roadmap

### v0.1

- CLI
- local JSON storage
- profile / project / insight
- export flow

### v0.2

- local API
- better schema stability
- stronger export targets

### v0.3

- lightweight GUI refinement
- import/export improvements
- tool integration experiments

## Product Boundary Reminder

Memory OS v0.x is the foundation, not the full self-model system.

It should first prove one thing clearly:

User-owned personal context can reduce friction across AI tools.
