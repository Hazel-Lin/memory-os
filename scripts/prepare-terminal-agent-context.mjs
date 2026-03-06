#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = ["scripts/compose-agent-context.mjs", "--tool", "terminal-agent", ...process.argv.slice(2)];
const result = spawnSync(process.execPath, args, { stdio: "inherit" });
process.exit(result.status ?? 1);
