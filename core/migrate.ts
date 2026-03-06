import type { MemoryData } from "./models.js";
import {
  CURRENT_MEMORY_VERSION,
  MemoryDataSchema,
  normalizeMemoryData,
} from "./schema.js";

export function migrateMemoryData(input: unknown): MemoryData {
  const normalized = normalizeMemoryData(input);

  switch (normalized.version) {
    case CURRENT_MEMORY_VERSION:
      return MemoryDataSchema.parse(normalized);
    default:
      return MemoryDataSchema.parse({
        ...normalized,
        version: CURRENT_MEMORY_VERSION,
      });
  }
}
