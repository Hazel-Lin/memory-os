import { create } from 'zustand';
import type { MemoryData, Project, Insight, SelfProfile } from '@core/models';

type ViewType = 'profile' | 'projects' | 'insights';

interface MemoryStore {
  // ========== 状态 ==========
  data: MemoryData | null;
  currentView: ViewType;
  selectedProjectId: string | null;
  selectedInsightId: string | null;
  loading: boolean;
  error: string | null;

  // ========== 通用操作 ==========
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  setView: (view: ViewType) => void;
  setError: (error: string | null) => void;

  // ========== Profile 操作 ==========
  updateProfile: (updates: Partial<SelfProfile>) => Promise<void>;

  // ========== Project 操作 ==========
  selectProject: (id: string | null) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // ========== Insight 操作 ==========
  selectInsight: (id: string | null) => void;
  addInsight: (insight: Omit<Insight, 'id' | 'createdAt'>) => Promise<void>;
  updateInsight: (id: string, updates: Partial<Insight>) => Promise<void>;
  deleteInsight: (id: string) => Promise<void>;
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  // ========== 初始状态 ==========
  data: null,
  currentView: 'profile',
  selectedProjectId: null,
  selectedInsightId: null,
  loading: false,
  error: null,

  // ========== 通用操作 ==========

  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await window.electronAPI.storage.read();
      set({ data, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载数据失败';
      set({ error: message, loading: false });
      console.error('加载数据失败:', error);
    }
  },

  saveData: async () => {
    const { data } = get();
    if (!data) {
      set({ error: '没有数据可保存' });
      return;
    }

    set({ loading: true, error: null });
    try {
      await window.electronAPI.storage.write(data);
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存数据失败';
      set({ error: message, loading: false });
      console.error('保存数据失败:', error);
    }
  },

  setView: (view) => {
    set({ currentView: view });
  },

  setError: (error) => {
    set({ error });
  },

  // ========== Profile 操作 ==========

  updateProfile: async (updates) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.profile.update(updates);
      const { data } = get();
      if (data) {
        set({
          data: { ...data, selfProfile: result.data },
          loading: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新 Profile 失败';
      set({ error: message, loading: false });
      console.error('更新 Profile 失败:', error);
      throw error;
    }
  },

  // ========== Project 操作 ==========

  selectProject: (id) => {
    set({ selectedProjectId: id });
  },

  addProject: async (project) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.project.add(project);
      const { data } = get();
      if (data) {
        set({
          data: { ...data, projects: [...data.projects, result.data] },
          loading: false,
          selectedProjectId: result.data.id,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加项目失败';
      set({ error: message, loading: false });
      console.error('添加项目失败:', error);
      throw error;
    }
  },

  updateProject: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.project.update(id, updates);
      const { data } = get();
      if (data) {
        const projects = data.projects.map((p) => (p.id === id ? result.data : p));
        set({
          data: { ...data, projects },
          loading: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新项目失败';
      set({ error: message, loading: false });
      console.error('更新项目失败:', error);
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.project.delete(id);
      const { data, selectedProjectId } = get();
      if (data) {
        const projects = data.projects.filter((p) => p.id !== id);
        set({
          data: { ...data, projects },
          loading: false,
          selectedProjectId: selectedProjectId === id ? null : selectedProjectId,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除项目失败';
      set({ error: message, loading: false });
      console.error('删除项目失败:', error);
      throw error;
    }
  },

  // ========== Insight 操作 ==========

  selectInsight: (id) => {
    set({ selectedInsightId: id });
  },

  addInsight: async (insight) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.insight.add(insight);
      const { data } = get();
      if (data) {
        set({
          data: { ...data, insights: [...data.insights, result.data] },
          loading: false,
          selectedInsightId: result.data.id,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '添加洞察失败';
      set({ error: message, loading: false });
      console.error('添加洞察失败:', error);
      throw error;
    }
  },

  updateInsight: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.insight.update(id, updates);
      const { data } = get();
      if (data) {
        const insights = data.insights.map((i) => (i.id === id ? result.data : i));
        set({
          data: { ...data, insights },
          loading: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '更新洞察失败';
      set({ error: message, loading: false });
      console.error('更新洞察失败:', error);
      throw error;
    }
  },

  deleteInsight: async (id) => {
    set({ loading: true, error: null });
    try {
      await window.electronAPI.insight.delete(id);
      const { data, selectedInsightId } = get();
      if (data) {
        const insights = data.insights.filter((i) => i.id !== id);
        set({
          data: { ...data, insights },
          loading: false,
          selectedInsightId: selectedInsightId === id ? null : selectedInsightId,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '删除洞察失败';
      set({ error: message, loading: false });
      console.error('删除洞察失败:', error);
      throw error;
    }
  },
}));
