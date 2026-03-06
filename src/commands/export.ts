import { readMemory } from "../../core/storage.js";
import {
  formatInsightsExport,
  formatProfileExport,
  formatProjectContextExport,
} from "../../core/services/exporters.js";

export function exportProfileCommand(target: string): void {
  const data = readMemory();
  console.log(formatProfileExport(data, target === "claude" ? "claude" : "generic"));
}

export function exportContextCommand(projectId: string, target: string): void {
  const data = readMemory();
  if (!data.projects.some((p) => p.id === projectId)) {
    console.error(`找不到项目 id: ${projectId}`);
    console.log("可用的项目:");
    data.projects.forEach((p) => console.log(`  ${p.id} - ${p.name}`));
    process.exit(1);
  }
  console.log(
    formatProjectContextExport(
      data,
      projectId,
      target === "claude" ? "claude" : "generic"
    )
  );
}

export function exportInsightsCommand(projectId: string): void {
  const data = readMemory();
  console.log(formatInsightsExport(data, projectId));
}
