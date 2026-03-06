#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const entry = path.join(repoRoot, "src", "index.ts");

const child = spawn(process.execPath, [tsxCli, entry, "mcp"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Failed to start Memory OS MCP server: ${message}`);
  process.exit(1);
});
