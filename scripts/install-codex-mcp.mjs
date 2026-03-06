#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const serverName = process.argv[2] || "memory-os";
const runner = path.join(repoRoot, "scripts", "run-memory-os-mcp.mjs");
const codexBin = process.env.CODEX_BIN || "codex";

removeIfExists(serverName);

const addResult = spawnSync(
  codexBin,
  ["mcp", "add", serverName, "--", process.execPath, runner],
  {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf-8",
  }
);

if (addResult.status !== 0) {
  process.stderr.write(addResult.stderr || addResult.stdout || "Failed to add Codex MCP server\n");
  process.exit(addResult.status ?? 1);
}

process.stdout.write(addResult.stdout);
process.stdout.write(`Installed Codex MCP server '${serverName}' using ${runner}\n`);

function removeIfExists(name) {
  const getResult = spawnSync(codexBin, ["mcp", "get", name, "--json"], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf-8",
  });

  if (getResult.status !== 0) {
    return;
  }

  const removeResult = spawnSync(codexBin, ["mcp", "remove", name], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf-8",
  });

  if (removeResult.status !== 0) {
    process.stderr.write(removeResult.stderr || removeResult.stdout || `Failed to remove existing MCP server '${name}'\n`);
    process.exit(removeResult.status ?? 1);
  }
}
