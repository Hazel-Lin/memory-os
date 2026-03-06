import type {
  Insight,
  MemoryData,
  Project,
  SelfProfile,
} from "../models.js";
import { generateId } from "./ids.js";

export function updateProfile(
  data: MemoryData,
  updates: Partial<SelfProfile>
): SelfProfile {
  return {
    ...data.selfProfile,
    ...updates,
  };
}

export function addProject(
  data: MemoryData,
  project: Omit<Project, "id" | "createdAt">
): Project {
  return {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
}

export function updateProject(
  data: MemoryData,
  id: string,
  updates: Partial<Project>
): Project {
  const existing = data.projects.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`Project ${id} 不存在`);
  }

  return {
    ...existing,
    ...updates,
  };
}

export function deleteProject(data: MemoryData, id: string): void {
  const exists = data.projects.some((item) => item.id === id);
  if (!exists) {
    throw new Error(`Project ${id} 不存在`);
  }
}

export function addInsight(
  data: MemoryData,
  insight: Omit<Insight, "id" | "createdAt">
): Insight {
  if (insight.projectId) {
    assertProjectExists(data, insight.projectId);
  }

  return {
    ...insight,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
}

export function updateInsight(
  data: MemoryData,
  id: string,
  updates: Partial<Insight>
): Insight {
  const existing = data.insights.find((item) => item.id === id);
  if (!existing) {
    throw new Error(`Insight ${id} 不存在`);
  }

  if (updates.projectId) {
    assertProjectExists(data, updates.projectId);
  }

  return {
    ...existing,
    ...updates,
  };
}

export function deleteInsight(data: MemoryData, id: string): void {
  const exists = data.insights.some((item) => item.id === id);
  if (!exists) {
    throw new Error(`Insight ${id} 不存在`);
  }
}

function assertProjectExists(data: MemoryData, projectId: string): void {
  const exists = data.projects.some((item) => item.id === projectId);
  if (!exists) {
    throw new Error(`Project ${projectId} 不存在`);
  }
}
