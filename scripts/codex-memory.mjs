#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const options = {
    baseUrl: "http://127.0.0.1:3322",
    target: "generic",
    print: false,
    execPrompt: "",
    codexArgs: [],
  };

  let passthrough = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (passthrough) {
      options.codexArgs.push(arg);
      continue;
    }

    if (arg === "--") {
      passthrough = true;
      continue;
    }

    if (arg === "--project") {
      options.projectId = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--base-url") {
      options.baseUrl = argv[index + 1] ?? options.baseUrl;
      index += 1;
      continue;
    }

    if (arg === "--target") {
      options.target = argv[index + 1] ?? options.target;
      index += 1;
      continue;
    }

    if (arg === "--print") {
      options.print = true;
      continue;
    }

    if (arg === "--exec") {
      options.execPrompt = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--cd") {
      options.cd = argv[index + 1];
      index += 1;
      continue;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.projectId) {
    console.error("Usage: node scripts/codex-memory.mjs --project <id> [--print] [--exec \"<task>\"] [--cd <dir>] [--base-url <url>] [--target <generic|claude>] [-- <extra codex args>]");
    process.exit(1);
  }

  const prompt = await buildPrompt(options);

  if (options.print || !options.execPrompt) {
    process.stdout.write(`${prompt}\n`);
    if (!options.execPrompt) {
      return;
    }
  }

  const codexBin = process.env.CODEX_BIN || "codex";
  const args = ["exec"];

  if (options.cd) {
    args.push("-C", options.cd);
  }

  args.push(...options.codexArgs, prompt);

  const result = spawnSync(codexBin, args, {
    stdio: "inherit",
    env: process.env,
  });

  process.exit(result.status ?? 1);
}

async function buildPrompt(options) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const [profilePayload, projectPayload] = await Promise.all([
    fetchJson(`${baseUrl}/profile`),
    fetchJson(`${baseUrl}/projects/${encodeURIComponent(options.projectId)}/context?target=${encodeURIComponent(options.target)}`),
  ]);

  return [
    `# Memory OS Codex Brief`,
    ``,
    `Use the following context for this Codex task.`,
    ``,
    `## User Profile`,
    profilePayload.exports[options.target === "claude" ? "claude" : "generic"],
    ``,
    `## Project Context`,
    projectPayload.export,
    ``,
    `## Task`,
    options.execPrompt,
  ].join("\n");
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }
  return response.json();
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
