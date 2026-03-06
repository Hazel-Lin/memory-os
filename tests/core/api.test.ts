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

test("serve exposes local read-only API endpoints", async () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-os-home-"));
  const memoryDir = path.join(homeDir, ".memory-os");
  const memoryFile = path.join(memoryDir, "memory.json");
  const port = await getFreePort();

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

  const child = spawn(process.execPath, [tsxCli, entry, "serve", "--port", String(port)], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: homeDir,
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

  try {
    await waitForServer(`http://127.0.0.1:${port}/health`);

    const profileRes = await fetch(`http://127.0.0.1:${port}/profile`);
    assert.equal(profileRes.status, 200);
    const profileJson = await profileRes.json() as {
      data: { name: string };
      exports: { claude: string };
    };
    assert.equal(profileJson.data.name, "Lin");
    assert.match(profileJson.exports.claude, /You are collaborating with Lin/);

    const projectRes = await fetch(`http://127.0.0.1:${port}/projects/p1/context?target=claude`);
    assert.equal(projectRes.status, 200);
    const projectJson = await projectRes.json() as {
      data: { project: { name: string }; insights: Array<{ id: string }> };
      export: string;
      target: string;
    };
    assert.equal(projectJson.data.project.name, "Memory OS");
    assert.equal(projectJson.data.insights.length, 1);
    assert.equal(projectJson.target, "claude");
    assert.match(projectJson.export, /Ship local API/);

    const insightsRes = await fetch(`http://127.0.0.1:${port}/insights?project=p1`);
    assert.equal(insightsRes.status, 200);
    const insightsJson = await insightsRes.json() as {
      data: Array<{ title: string }>;
      export: string;
    };
    assert.equal(insightsJson.data.length, 1);
    assert.equal(insightsJson.data[0].title, "Prefer structured context");
    assert.match(insightsJson.export, /reusable collaboration patterns/);
  } finally {
    child.kill("SIGTERM");
    await waitForExit(child);
    fs.rmSync(homeDir, { recursive: true, force: true });
  }

  assert.equal(stderr.trim(), "", stderr);
  assert.match(stdout, /Memory OS API listening on/);
});

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
  const deadline = Date.now() + 5000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }
    await delay(100);
  }

  throw new Error(`Server did not start in time: ${url}`);
}

function waitForExit(child: ReturnType<typeof spawn>): Promise<void> {
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
