import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { MemoryData } from "./models.js";
import { createDefaultMemoryData, MemoryDataSchema } from "./schema.js";
import { migrateMemoryData } from "./migrate.js";

const MEMORY_DIR = path.join(os.homedir(), ".memory-os");
const MEMORY_FILE = path.join(MEMORY_DIR, "memory.json");

export function getMemoryDir(): string {
  return MEMORY_DIR;
}

export function getMemoryFilePath(): string {
  return MEMORY_FILE;
}

export function memoryFileExists(): boolean {
  return fs.existsSync(MEMORY_FILE);
}

export function readMemory(): MemoryData {
  if (!memoryFileExists()) {
    throw new Error("memory.json 不存在，请先运行 mem init");
  }

  const raw = fs.readFileSync(MEMORY_FILE, "utf-8");
  try {
    return migrateMemoryData(JSON.parse(raw));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`memory.json 格式不合法: ${error.message}`);
    }
    throw new Error("memory.json 格式不合法，请手动检查文件内容");
  }
}

export function writeMemory(data: MemoryData): void {
  ensureDir();
  const normalized = MemoryDataSchema.parse(data);
  const tmpFile = `${MEMORY_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(normalized, null, 2), "utf-8");
  fs.renameSync(tmpFile, MEMORY_FILE);
}

export function ensureDir(): void {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

export function getDefaultMemory(): MemoryData {
  return createDefaultMemoryData();
}
