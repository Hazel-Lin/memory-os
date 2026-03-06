import {
  memoryFileExists,
  ensureDir,
  writeMemory,
  getDefaultMemory,
  getMemoryFilePath,
} from "../../core/storage.js";

export function initCommand(force = false): void {
  if (memoryFileExists() && !force) {
    console.log("memory.json 已存在，跳过初始化。如需重置请使用 --force");
    console.log(`路径: ${getMemoryFilePath()}`);
    return;
  }

  ensureDir();
  writeMemory(getDefaultMemory());
  console.log("初始化完成！");
  console.log(`已创建: ${getMemoryFilePath()}`);
  console.log("请运行 mem edit profile 来填写你的个人信息");
}
