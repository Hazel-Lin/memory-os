#!/usr/bin/env node

function parseArgs(argv) {
  const options = {
    baseUrl: "http://127.0.0.1:3322",
    target: "generic",
    json: false,
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

    if (arg === "--target") {
      options.target = argv[index + 1] ?? "generic";
      index += 1;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.projectId) {
    console.error("Usage: node scripts/fetch-project-context.mjs --project <id> [--base-url <url>] [--target <generic|claude>] [--json]");
    process.exit(1);
  }

  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const url = `${baseUrl}/projects/${encodeURIComponent(options.projectId)}/context?target=${encodeURIComponent(options.target)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch project context: ${response.status}`);
    console.error(errorText);
    process.exit(1);
  }

  const payload = await response.json();

  if (options.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  process.stdout.write(`${payload.export}\n`);
}

void main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
