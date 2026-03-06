import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getMemoryFilePath, readMemory, writeMemory } from "../../core/storage.js";
import type { Insight, MemoryData, Project } from "../../core/models.js";
import {
  updateInsight,
  updateProject,
} from "../../core/services/memory-service.js";

export function editProfileCommand(): void {
  const memoryPath = getMemoryFilePath();

  // Validate source data before opening the editor.
  readMemory();

  editJsonFile(memoryPath, (raw) => {
    const parsed = JSON.parse(raw) as MemoryData;
    if (!parsed.selfProfile || !parsed.projects || !parsed.insights) {
      throw new Error("JSON 结构不完整，缺少 selfProfile / projects / insights");
    }

    writeMemory(parsed);
  });
}

export function editProjectCommand(id: string): void {
  const data = readMemory();
  const project = data.projects.find((item) => item.id === id);
  if (!project) {
    throw new Error(`Project ${id} 不存在`);
  }

  editJsonBuffer(JSON.stringify(project, null, 2), (raw) => {
    const parsed = JSON.parse(raw) as Project;
    const updated = updateProject(data, id, parsed);
    data.projects = data.projects.map((item) => (item.id === id ? updated : item));
    writeMemory(data);
  });
}

export function editInsightCommand(id: string): void {
  const data = readMemory();
  const insight = data.insights.find((item) => item.id === id);
  if (!insight) {
    throw new Error(`Insight ${id} 不存在`);
  }

  editJsonBuffer(JSON.stringify(insight, null, 2), (raw) => {
    const parsed = JSON.parse(raw) as Insight;
    const updated = updateInsight(data, id, parsed);
    data.insights = data.insights.map((item) => (item.id === id ? updated : item));
    writeMemory(data);
  });
}

function editJsonFile(filePath: string, onSave: (raw: string) => void): void {
  const tmpFile = path.join(os.tmpdir(), `memory-os-edit-${Date.now()}.json`);
  fs.copyFileSync(filePath, tmpFile);
  try {
    editJsonTempFile(tmpFile, onSave);
  } finally {
    cleanTmp(tmpFile);
  }
}

function editJsonBuffer(initialContent: string, onSave: (raw: string) => void): void {
  const tmpFile = path.join(os.tmpdir(), `memory-os-edit-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, initialContent, "utf-8");
  try {
    editJsonTempFile(tmpFile, onSave);
  } finally {
    cleanTmp(tmpFile);
  }
}

function editJsonTempFile(tmpFile: string, onSave: (raw: string) => void): void {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  const result = spawnSync(editor, [tmpFile], { stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error("编辑器非正常退出，未保存更改");
  }

  const raw = fs.readFileSync(tmpFile, "utf-8");
  try {
    onSave(raw);
    console.log("已保存更改");
  } catch (error) {
    const message = error instanceof Error ? error.message : "编辑后的 JSON 格式不合法";
    throw new Error(`${message}，未覆盖原文件`);
  }
}

function cleanTmp(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}
