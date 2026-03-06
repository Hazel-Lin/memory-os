# Iteration Documentation Process

This project should generate a product iteration document for each meaningful product change.

## Rule

For every product iteration, create one new document under `docs/product/iterations/`.

Suggested filename:

```text
docs/product/iterations/YYYY-MM-DD-vX.Y-short-name.md
```

Example:

```text
docs/product/iterations/2026-03-06-v0.2-local-api.md
```

## When To Create One

Create an iteration document when any of the following happens:

- scope changes
- a new product capability is added
- a product decision changes direction
- validation results change roadmap priority
- a release milestone is completed

## What Each Iteration Doc Must Include

- why this iteration exists
- user problem being addressed
- scope and non-scope
- product decisions and tradeoffs
- expected user value
- validation plan
- results after implementation
- recommendation for next iteration

## Product Layer Reminder

Iteration docs should reflect the current product boundary:

- v0.x focuses on the personal context layer
- growth system ideas stay deferred unless explicitly promoted into scope

## Workflow

1. Before implementation, create or update the iteration doc.
2. During implementation, keep product decisions aligned with the doc.
3. After implementation, fill result summary and next-step recommendation.

## Current Canonical Docs

- `docs/product/PRODUCT-PRD-v0x.md`
- `docs/product/ITERATION-DOC-TEMPLATE.md`
- `docs/product/ITERATION-PROCESS.md`
