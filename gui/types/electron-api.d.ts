// Electron API 类型定义
import type { MemoryData, Project, Insight, SelfProfile } from '@core/models';

export interface ElectronAPI {
  storage: {
    read: () => Promise<MemoryData>;
    write: (data: MemoryData) => Promise<{ success: boolean }>;
    getPath: () => Promise<string>;
    exists: () => Promise<boolean>;
  };

  profile: {
    update: (updates: Partial<SelfProfile>) => Promise<{ success: boolean; data: SelfProfile }>;
  };

  project: {
    add: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<{ success: boolean; data: Project }>;
    update: (id: string, updates: Partial<Project>) => Promise<{ success: boolean; data: Project }>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };

  insight: {
    add: (insight: Omit<Insight, 'id' | 'createdAt'>) => Promise<{ success: boolean; data: Insight }>;
    update: (id: string, updates: Partial<Insight>) => Promise<{ success: boolean; data: Insight }>;
    delete: (id: string) => Promise<{ success: boolean }>;
  };

  export: {
    profile: (target: 'claude' | 'generic') => Promise<{ success: boolean; data: string }>;
    context: (projectId: string, target: 'claude' | 'generic') => Promise<{ success: boolean; data: string }>;
    insights: (projectId?: string) => Promise<{ success: boolean; data: string }>;
  };

  clipboard: {
    write: (text: string) => Promise<{ success: boolean }>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { };
