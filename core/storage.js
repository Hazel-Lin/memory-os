import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const MEMORY_DIR = path.join(os.homedir(), ".memory-os");
const MEMORY_FILE = path.join(MEMORY_DIR, "memory.json");
export function getMemoryDir() {
    return MEMORY_DIR;
}
export function getMemoryFilePath() {
    return MEMORY_FILE;
}
export function memoryFileExists() {
    return fs.existsSync(MEMORY_FILE);
}
export function readMemory() {
    if (!memoryFileExists()) {
        console.error("memory.json 不存在，请先运行 mem init");
        process.exit(1);
    }
    const raw = fs.readFileSync(MEMORY_FILE, "utf-8");
    try {
        return JSON.parse(raw);
    }
    catch {
        console.error("memory.json 格式不合法，请手动检查文件内容");
        process.exit(1);
    }
}
export function writeMemory(data) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), "utf-8");
}
export function ensureDir() {
    if (!fs.existsSync(MEMORY_DIR)) {
        fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
}
export function getDefaultMemory() {
    return {
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
        projects: [],
        insights: [],
    };
}
//# sourceMappingURL=storage.js.map