import { contextBridge, ipcRenderer } from 'electron';
import type { MemoryData, Project, Insight, SelfProfile } from '../../core/models.js';

// 暴露给渲染进程的 API
const api = {
  // ========== 存储操作 ==========
  storage: {
    read: (): Promise<MemoryData> => ipcRenderer.invoke('storage:read'),
    write: (data: MemoryData): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('storage:write', data),
    getPath: (): Promise<string> => ipcRenderer.invoke('storage:getPath'),
    exists: (): Promise<boolean> => ipcRenderer.invoke('storage:exists'),
  },

  // ========== Profile 操作 ==========
  profile: {
    update: (
      updates: Partial<SelfProfile>
    ): Promise<{ success: boolean; data: SelfProfile }> =>
      ipcRenderer.invoke('profile:update', updates),
  },

  // ========== Project 操作 ==========
  project: {
    add: (
      project: Omit<Project, 'id' | 'createdAt'>
    ): Promise<{ success: boolean; data: Project }> =>
      ipcRenderer.invoke('project:add', project),
    update: (
      id: string,
      updates: Partial<Project>
    ): Promise<{ success: boolean; data: Project }> =>
      ipcRenderer.invoke('project:update', id, updates),
    delete: (id: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('project:delete', id),
  },

  // ========== Insight 操作 ==========
  insight: {
    add: (
      insight: Omit<Insight, 'id' | 'createdAt'>
    ): Promise<{ success: boolean; data: Insight }> =>
      ipcRenderer.invoke('insight:add', insight),
    update: (
      id: string,
      updates: Partial<Insight>
    ): Promise<{ success: boolean; data: Insight }> =>
      ipcRenderer.invoke('insight:update', id, updates),
    delete: (id: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('insight:delete', id),
  },

  // ========== 导出操作 ==========
  export: {
    profile: (target: 'claude' | 'generic'): Promise<{ success: boolean; data: string }> =>
      ipcRenderer.invoke('export:profile', target),
    context: (projectId: string, target: 'claude' | 'generic'): Promise<{ success: boolean; data: string }> =>
      ipcRenderer.invoke('export:context', projectId, target),
    insights: (projectId?: string): Promise<{ success: boolean; data: string }> =>
      ipcRenderer.invoke('export:insights', projectId),
  },

  // ========== 剪贴板操作 ==========
  clipboard: {
    write: (text: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('clipboard:write', text),
  },
};

// 通过 contextBridge 安全地暴露 API
contextBridge.exposeInMainWorld('electronAPI', api);

// TypeScript 类型定义（用于渲染进程）
export type ElectronAPI = typeof api;
