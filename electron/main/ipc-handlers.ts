import { ipcMain, clipboard } from 'electron';
import {
  readMemory,
  writeMemory,
  getDefaultMemory,
  memoryFileExists,
  ensureDir,
  getMemoryFilePath,
} from '../../core/storage.js';
import type {
  ExportTarget,
  MemoryData,
  Project,
  Insight,
  SelfProfile,
} from '../../core/models.js';
import {
  formatInsightsExport,
  formatProfileExport,
  formatProjectContextExport,
} from '../../core/services/exporters.js';
import {
  addInsight,
  addProject,
  deleteInsight,
  deleteProject,
  updateInsight,
  updateProfile,
  updateProject,
} from '../../core/services/memory-service.js';

/**
 * 注册所有 IPC 处理器
 */
export function registerIPCHandlers() {
  // 读取完整数据
  ipcMain.handle('storage:read', async () => {
    try {
      if (!memoryFileExists()) {
        ensureDir();
        const defaultData = getDefaultMemory();
        writeMemory(defaultData);
        return defaultData;
      }
      return readMemory();
    } catch (error) {
      console.error('读取数据失败:', error);
      throw error;
    }
  });

  // 写入完整数据
  ipcMain.handle('storage:write', async (_event, data: MemoryData) => {
    try {
      writeMemory(data);
      return { success: true };
    } catch (error) {
      console.error('写入数据失败:', error);
      throw error;
    }
  });

  // 获取文件路径
  ipcMain.handle('storage:getPath', async () => {
    return getMemoryFilePath();
  });

  // 检查文件是否存在
  ipcMain.handle('storage:exists', async () => {
    return memoryFileExists();
  });

  // ========== Profile 操作 ==========

  // 更新 Profile
  ipcMain.handle('profile:update', async (_event, updates: Partial<SelfProfile>) => {
    try {
      const data = readMemory();
      data.selfProfile = updateProfile(data, updates);
      writeMemory(data);
      return { success: true, data: data.selfProfile };
    } catch (error) {
      console.error('更新 Profile 失败:', error);
      throw error;
    }
  });

  // ========== Project 操作 ==========

  // 添加 Project
  ipcMain.handle('project:add', async (_event, project: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const data = readMemory();
      const newProject = addProject(data, project);
      data.projects.push(newProject);
      writeMemory(data);
      return { success: true, data: newProject };
    } catch (error) {
      console.error('添加 Project 失败:', error);
      throw error;
    }
  });

  // 更新 Project
  ipcMain.handle('project:update', async (_event, id: string, updates: Partial<Project>) => {
    try {
      const data = readMemory();
      const index = data.projects.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Project ${id} 不存在`);
      data.projects[index] = updateProject(data, id, updates);
      writeMemory(data);
      return { success: true, data: data.projects[index] };
    } catch (error) {
      console.error('更新 Project 失败:', error);
      throw error;
    }
  });

  // 删除 Project
  ipcMain.handle('project:delete', async (_event, id: string) => {
    try {
      const data = readMemory();
      deleteProject(data, id);
      const index = data.projects.findIndex((p) => p.id === id);
      data.projects.splice(index, 1);
      writeMemory(data);
      return { success: true };
    } catch (error) {
      console.error('删除 Project 失败:', error);
      throw error;
    }
  });

  // ========== Insight 操作 ==========

  // 添加 Insight
  ipcMain.handle('insight:add', async (_event, insight: Omit<Insight, 'id' | 'createdAt'>) => {
    try {
      const data = readMemory();
      const newInsight = addInsight(data, insight);
      data.insights.push(newInsight);
      writeMemory(data);
      return { success: true, data: newInsight };
    } catch (error) {
      console.error('添加 Insight 失败:', error);
      throw error;
    }
  });

  // 更新 Insight
  ipcMain.handle('insight:update', async (_event, id: string, updates: Partial<Insight>) => {
    try {
      const data = readMemory();
      const index = data.insights.findIndex((i) => i.id === id);
      if (index === -1) throw new Error(`Insight ${id} 不存在`);
      data.insights[index] = updateInsight(data, id, updates);
      writeMemory(data);
      return { success: true, data: data.insights[index] };
    } catch (error) {
      console.error('更新 Insight 失败:', error);
      throw error;
    }
  });

  // 删除 Insight
  ipcMain.handle('insight:delete', async (_event, id: string) => {
    try {
      const data = readMemory();
      deleteInsight(data, id);
      const index = data.insights.findIndex((i) => i.id === id);
      data.insights.splice(index, 1);
      writeMemory(data);
      return { success: true };
    } catch (error) {
      console.error('删除 Insight 失败:', error);
      throw error;
    }
  });

  // ========== 导出操作 ==========

  // 导出 Profile
  ipcMain.handle('export:profile', async (_event, target: ExportTarget = 'generic') => {
    try {
      const data = readMemory();
      return { success: true, data: formatProfileExport(data, target) };
    } catch (error) {
      console.error('导出 Profile 失败:', error);
      throw error;
    }
  });

  // 导出 Project Context
  ipcMain.handle('export:context', async (_event, projectId: string, target: ExportTarget = 'generic') => {
    try {
      const data = readMemory();
      return { success: true, data: formatProjectContextExport(data, projectId, target) };
    } catch (error) {
      console.error('导出 Context 失败:', error);
      throw error;
    }
  });

  // 导出 Insights
  ipcMain.handle('export:insights', async (_event, projectId?: string) => {
    try {
      const data = readMemory();
      return { success: true, data: formatInsightsExport(data, projectId) };
    } catch (error) {
      console.error('导出 Insights 失败:', error);
      throw error;
    }
  });

  // 复制到剪贴板
  ipcMain.handle('clipboard:write', async (_event, text: string) => {
    try {
      clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      throw error;
    }
  });

  console.log('✓ IPC 处理器已注册');
}
