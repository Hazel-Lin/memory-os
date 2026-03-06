import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const entry = path.join(repoRoot, "src", "index.ts");

function runMem(args: string[], homeDir: string, extraEnv: NodeJS.ProcessEnv = {}) {
  return spawnSync(process.execPath, [tsxCli, entry, ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      HOME: homeDir,
      ...extraEnv,
    },
    encoding: "utf-8",
  });
}

test("init --force resets existing memory data", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-os-home-"));
  const memoryDir = path.join(homeDir, ".memory-os");
  const memoryFile = path.join(memoryDir, "memory.json");

  fs.mkdirSync(memoryDir, { recursive: true });
  fs.writeFileSync(
    memoryFile,
    JSON.stringify({
      version: 1,
      selfProfile: {
        name: "Existing",
        languages: ["zh-CN"],
        bio: "Should be reset",
        writingStyle: {
          tone: "direct",
          preferredStructures: ["list"],
          avoid: ["fluff"],
        },
        capabilities: {
          business_judgment: 4,
          writing: 5,
          product_thinking: 3,
        },
      },
      projects: [{ id: "p1", name: "Keep", description: "", goals: [], audience: "", status: "active", focusThisWeek: "", createdAt: new Date().toISOString() }],
      insights: [{ id: "i1", title: "Keep", scenario: "", content: "", projectId: null, createdAt: new Date().toISOString() }],
    }),
    "utf-8"
  );

  const result = runMem(["init", "--force"], homeDir);

  assert.equal(result.status, 0, result.stderr);
  const resetData = JSON.parse(fs.readFileSync(memoryFile, "utf-8"));
  assert.equal(resetData.selfProfile.name, "");
  assert.deepEqual(resetData.projects, []);
  assert.deepEqual(resetData.insights, []);

  fs.rmSync(homeDir, { recursive: true, force: true });
});

test("edit project updates a single project through $EDITOR", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-os-home-"));
  const memoryDir = path.join(homeDir, ".memory-os");
  const memoryFile = path.join(memoryDir, "memory.json");
  const editorScript = path.join(homeDir, "mock-editor.js");

  fs.mkdirSync(memoryDir, { recursive: true });
  fs.writeFileSync(
    memoryFile,
    JSON.stringify({
      version: 1,
      selfProfile: {
        name: "",
        languages: ["zh-CN", "en"],
        bio: "",
        writingStyle: {
          tone: "",
          preferredStructures: [],
          avoid: [],
        },
        capabilities: {
          business_judgment: 0,
          writing: 0,
          product_thinking: 0,
        },
      },
      projects: [{
        id: "p1",
        name: "Memory OS",
        description: "Before edit",
        goals: ["Ship CLI"],
        audience: "Builders",
        status: "active",
        focusThisWeek: "Tests",
        createdAt: "2026-03-06T00:00:00.000Z",
      }],
      insights: [],
    }),
    "utf-8"
  );

  fs.writeFileSync(
    editorScript,
    `#!/usr/bin/env node
const fs = require("node:fs");
const filePath = process.argv[2];
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
data.description = "After edit";
data.status = "maintenance";
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
`,
    "utf-8"
  );
  fs.chmodSync(editorScript, 0o755);

  const result = runMem(["edit", "project", "p1"], homeDir, { EDITOR: editorScript });

  assert.equal(result.status, 0, result.stderr);
  const updatedData = JSON.parse(fs.readFileSync(memoryFile, "utf-8"));
  assert.equal(updatedData.projects[0].description, "After edit");
  assert.equal(updatedData.projects[0].status, "maintenance");
  assert.equal(updatedData.projects[0].createdAt, "2026-03-06T00:00:00.000Z");

  fs.rmSync(homeDir, { recursive: true, force: true });
});

test("edit insight updates a single insight through $EDITOR", () => {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "memory-os-home-"));
  const memoryDir = path.join(homeDir, ".memory-os");
  const memoryFile = path.join(memoryDir, "memory.json");
  const editorScript = path.join(homeDir, "mock-editor.js");

  fs.mkdirSync(memoryDir, { recursive: true });
  fs.writeFileSync(
    memoryFile,
    JSON.stringify({
      version: 1,
      selfProfile: {
        name: "",
        languages: ["zh-CN", "en"],
        bio: "",
        writingStyle: {
          tone: "",
          preferredStructures: [],
          avoid: [],
        },
        capabilities: {
          business_judgment: 0,
          writing: 0,
          product_thinking: 0,
        },
      },
      projects: [{
        id: "p1",
        name: "Memory OS",
        description: "Project",
        goals: ["Ship CLI"],
        audience: "Builders",
        status: "active",
        focusThisWeek: "Tests",
        createdAt: "2026-03-06T00:00:00.000Z",
      }],
      insights: [{
        id: "i1",
        title: "Before edit",
        scenario: "Drafting",
        content: "Initial content",
        projectId: "p1",
        createdAt: "2026-03-06T00:00:00.000Z",
      }],
    }),
    "utf-8"
  );

  fs.writeFileSync(
    editorScript,
    `#!/usr/bin/env node
const fs = require("node:fs");
const filePath = process.argv[2];
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
data.title = "After edit";
data.content = "Updated content";
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
`,
    "utf-8"
  );
  fs.chmodSync(editorScript, 0o755);

  const result = runMem(["edit", "insight", "i1"], homeDir, { EDITOR: editorScript });

  assert.equal(result.status, 0, result.stderr);
  const updatedData = JSON.parse(fs.readFileSync(memoryFile, "utf-8"));
  assert.equal(updatedData.insights[0].title, "After edit");
  assert.equal(updatedData.insights[0].content, "Updated content");
  assert.equal(updatedData.insights[0].projectId, "p1");

  fs.rmSync(homeDir, { recursive: true, force: true });
});
