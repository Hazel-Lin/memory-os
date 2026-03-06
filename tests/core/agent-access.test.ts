import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const entry = path.join(repoRoot, "src", "index.ts");

test("Claude Code adapter script assembles profile and project context", async () => {
  const homeDir = await createFixtureHome();
  const port = await getFreePort();
  const server = spawn(process.execPath, [tsxCli, entry, "serve", "--port", String(port)], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: homeDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/health`);

    const result = await runNodeScript([
      "scripts/prepare-claude-code-context.mjs",
      "--base-url",
      `http://127.0.0.1:${port}`,
      "--project",
      "p1",
    ]);

    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /Target Tool: Claude Code/);
    assert.match(result.stdout, /## User Profile/);
    assert.match(result.stdout, /You are collaborating with Lin/);
    assert.match(result.stdout, /## Project Context/);
    assert.match(result.stdout, /Ship local API/);
  } finally {
    server.kill("SIGTERM");
    await waitForExit(server);
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

test("MCP server exposes initialize, resources, prompts, and tools", async () => {
  const homeDir = await createFixtureHome();
  const child = spawn(process.execPath, [tsxCli, entry, "mcp"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: homeDir,
    },
    stdio: ["pipe", "pipe", "pipe"],
  });

  const reader = createJsonLineReader(child.stdout);

  try {
    child.stdin.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } },
      })}\n`
    );
    const initialize = await reader();
    assert.equal(initialize.result.serverInfo.name, "memory-os");

    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} })}\n`
    );

    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "resources/list" })}\n`
    );
    const resources = await reader();
    assert.ok(
      resources.result.resources.some((item: { uri: string }) => item.uri === "memory://profile")
    );

    child.stdin.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "prompts/get",
        params: { name: "project_context", arguments: { projectId: "p1", target: "claude" } },
      })}\n`
    );
    const prompt = await reader();
    assert.match(prompt.result.messages[0].content.text, /Use the following project context/);

    child.stdin.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "get_project_context", arguments: { projectId: "p1", target: "claude" } },
      })}\n`
    );
    const tool = await reader();
    assert.match(tool.result.content[0].text, /Ship local API/);
    assert.equal(tool.result.structuredContent.project.name, "Memory OS");
  } finally {
    child.kill("SIGTERM");
    await waitForExit(child);
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

test("Codex install script registers the Memory OS MCP server", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-os-codex-home-"));
  fs.mkdirSync(path.join(homeDir, ".codex"), { recursive: true });

  const installResult = await runNodeScript(
    ["scripts/install-codex-mcp.mjs"],
    {
      HOME: homeDir,
    }
  );

  assert.equal(installResult.code, 0, installResult.stderr);

  const codexGet = await runCommand("codex", ["mcp", "get", "memory-os", "--json"], {
    HOME: homeDir,
  });

  assert.equal(codexGet.code, 0, codexGet.stderr);
  const config = JSON.parse(codexGet.stdout);
  assert.equal(config.name, "memory-os");
  assert.equal(config.transport.type, "stdio");
  assert.ok(typeof config.transport.command === "string");
  assert.match(config.transport.args[0], /run-memory-os-mcp\.mjs$/);

  fs.rmSync(homeDir, { recursive: true, force: true });
});

test("codex-memory prints a combined Memory OS briefing", async () => {
  const homeDir = await createFixtureHome();
  const port = await getFreePort();
  const server = spawn(process.execPath, [tsxCli, entry, "serve", "--port", String(port)], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: homeDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/health`);

    const result = await runNodeScript([
      "scripts/codex-memory.mjs",
      "--base-url",
      `http://127.0.0.1:${port}`,
      "--project",
      "p1",
      "--print",
    ]);

    assert.equal(result.code, 0, result.stderr);
    assert.match(result.stdout, /# Memory OS Codex Brief/);
    assert.match(result.stdout, /## User Profile/);
    assert.match(result.stdout, /## Project Context/);
    assert.match(result.stdout, /## Task/);
  } finally {
    server.kill("SIGTERM");
    await waitForExit(server);
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

test("codex-memory forwards the assembled prompt to Codex exec", async () => {
  const homeDir = await createFixtureHome();
  const port = await getFreePort();
  const server = spawn(process.execPath, [tsxCli, entry, "serve", "--port", String(port)], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: homeDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const mockCodex = path.join(homeDir, "mock-codex.js");
  const captureFile = path.join(homeDir, "captured.json");
  fs.writeFileSync(
    mockCodex,
    `#!/usr/bin/env node
const fs = require("node:fs");
const out = process.env.CAPTURE_FILE;
fs.writeFileSync(out, JSON.stringify(process.argv.slice(2), null, 2));
process.exit(0);
`,
    "utf-8"
  );
  fs.chmodSync(mockCodex, 0o755);

  try {
    await waitForServer(`http://127.0.0.1:${port}/health`);

    const result = await runNodeScript([
      "scripts/codex-memory.mjs",
      "--base-url",
      `http://127.0.0.1:${port}`,
      "--project",
      "p1",
      "--exec",
      "Return only the project name.",
      "--",
      "--skip-git-repo-check",
    ], {
      CODEX_BIN: mockCodex,
      CAPTURE_FILE: captureFile,
    });

    assert.equal(result.code, 0, result.stderr);
    const captured = JSON.parse(fs.readFileSync(captureFile, "utf-8"));
    assert.equal(captured[0], "exec");
    assert.equal(captured[1], "--skip-git-repo-check");
    assert.match(captured[2], /# Memory OS Codex Brief/);
    assert.match(captured[2], /Return only the project name/);
    assert.match(captured[2], /Personal AI context layer/);
  } finally {
    server.kill("SIGTERM");
    await waitForExit(server);
    fs.rmSync(homeDir, { recursive: true, force: true });
  }
});

async function createFixtureHome(): Promise<string> {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-os-home-"));
  const memoryDir = path.join(homeDir, ".memory-os");
  const memoryFile = path.join(memoryDir, "memory.json");

  fs.mkdirSync(memoryDir, { recursive: true });
  fs.writeFileSync(
    memoryFile,
    JSON.stringify({
      version: 1,
      selfProfile: {
        name: "Lin",
        languages: ["zh-CN", "en"],
        bio: "Builds AI-native tools",
        writingStyle: {
          tone: "direct",
          preferredStructures: ["problem -> reasoning -> action"],
          avoid: ["fluff"],
        },
        capabilities: {
          business_judgment: 4,
          writing: 5,
          product_thinking: 4,
        },
      },
      projects: [{
        id: "p1",
        name: "Memory OS",
        description: "Personal AI context layer",
        goals: ["Reduce context repetition"],
        audience: "AI-native builders",
        status: "active",
        focusThisWeek: "Ship local API",
        createdAt: "2026-03-06T00:00:00.000Z",
      }],
      insights: [{
        id: "i1",
        title: "Prefer structured context",
        scenario: "Cross-tool AI workflow",
        content: "Capture stable context separately from raw chat.",
        projectId: "p1",
        createdAt: "2026-03-06T00:00:00.000Z",
      }],
    }),
    "utf-8"
  );

  return homeDir;
}

function runNodeScript(
  args: string[],
  extraEnv: NodeJS.ProcessEnv = {}
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...extraEnv,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

function runCommand(
  command: string,
  args: string[],
  extraEnv: NodeJS.ProcessEnv = {}
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...extraEnv,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

function createJsonLineReader(stream: NodeJS.ReadableStream) {
  let buffer = "";
  const queue: Array<(value: any) => void> = [];

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    let newline = buffer.indexOf("\n");

    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) {
        const parsed = JSON.parse(line);
        const next = queue.shift();
        if (next) {
          next(parsed);
        }
      }
      newline = buffer.indexOf("\n");
    }
  });

  return () =>
    new Promise<any>((resolve) => {
      queue.push(resolve);
    });
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to allocate port"));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitForServer(url: string): Promise<void> {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start in time: ${url}`);
}

function waitForExit(child: ReturnType<typeof spawn>): Promise<void> {
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
  });
}
