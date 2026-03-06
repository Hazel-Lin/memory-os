import type { MemoryData } from "./models.js";
export declare function getMemoryDir(): string;
export declare function getMemoryFilePath(): string;
export declare function memoryFileExists(): boolean;
export declare function readMemory(): MemoryData;
export declare function writeMemory(data: MemoryData): void;
export declare function ensureDir(): void;
export declare function getDefaultMemory(): MemoryData;
