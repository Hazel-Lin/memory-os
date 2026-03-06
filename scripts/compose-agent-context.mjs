#!/usr/bin/env node

function parseArgs(argv) {
  const options = {
    baseUrl: "http://127.0.0.1:3322",
    tool: "terminal-agent",
    target: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--project") {
      options.projectId = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--base-url") {
      options.baseUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--tool") {
      options.tool = argv[index + 1] ?? options.tool;
      index += 1;
      continue;
    }

    if (arg === "--target") {
      options.target = argv[index + 1] ?? options.target;
      index += 1;
      continue;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.projectId) {
    console.error("Usage: node scripts/compose-agent-context.mjs --project <id> [--tool <claude-code|codex|terminal-agent>] [--base-url <url>] [--target <generic|claude>]");
    process.exit(1);
  }

  const toolConfig = getToolConfig(options.tool, options.target);
  const baseUrl = options.baseUrl.replace(/\/$/, "");

  const [profilePayload, projectPayload] = await Promise.all([
    fetchJson(`${baseUrl}/profile`),
    fetchJson(`${baseUrl}/projects/${encodeURIComponent(options.projectId)}/context?target=${encodeURIComponent(toolConfig.target)}`),
  ]);

  const output = [
    `# Memory OS Context Pack`,
    ``,
    `Target Tool: ${toolConfig.label}`,
    toolConfig.instructions,
    ``,
    `## User Profile`,
    profilePayload.exports[toolConfig.target],
    ``,
    `## Project Context`,
    projectPayload.export,
  ].join("\n");

  process.stdout.write(`${output}\n`);
}

function getToolConfig(tool, explicitTarget) {
  const normalized = tool.toLowerCase();

  if (normalized === "claude-code") {
    return {
      label: "Claude Code",
      target: explicitTarget || "claude",
      instructions: "Use this context before planning, coding, or reviewing so the session inherits the user's profile and current project state.",
    };
  }

  if (normalized === "codex") {
    return {
      label: "Codex",
      target: explicitTarget || "generic",
      instructions: "Use this context as the session's working brief before generating code, planning changes, or answering implementation questions.",
    };
  }

  return {
    label: "Terminal Agent",
    target: explicitTarget || "generic",
    instructions: "Use this context as the current user and project briefing for the next task.",
  };
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
