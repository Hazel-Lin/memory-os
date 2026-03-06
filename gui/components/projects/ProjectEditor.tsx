import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Plus, X, Trash2 } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { useToast } from '../common/ToastProvider';
import type { Project } from '@core/models';

type FormData = Omit<Project, 'id' | 'createdAt'>;

const defaultForm: FormData = {
  name: '',
  description: '',
  goals: [],
  audience: '',
  status: 'active',
  focusThisWeek: '',
};

export function ProjectEditor() {
  const data = useMemoryStore((state) => state.data);
  const selectedProjectId = useMemoryStore((state) => state.selectedProjectId);
  const selectProject = useMemoryStore((state) => state.selectProject);
  const addProject = useMemoryStore((state) => state.addProject);
  const updateProject = useMemoryStore((state) => state.updateProject);
  const deleteProject = useMemoryStore((state) => state.deleteProject);
  const loading = useMemoryStore((state) => state.loading);
  const { showToast } = useToast();

  const isNew = selectedProjectId === 'new';
  const project = isNew ? null : data?.projects.find((p) => p.id === selectedProjectId);

  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [newGoal, setNewGoal] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isNew) {
      setFormData(defaultForm);
    } else if (project) {
      const { id, createdAt, ...rest } = project;
      setFormData(rest);
    }
  }, [selectedProjectId]);

  if (!isNew && !project) {
    selectProject(null);
    return null;
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({ message: '请输入项目名称', type: 'error' });
      return;
    }
    try {
      if (isNew) {
        await addProject(formData);
        showToast({ message: '项目创建成功', type: 'success' });
      } else {
        await updateProject(selectedProjectId!, formData);
        showToast({ message: '项目保存成功', type: 'success' });
      }
    } catch {
      // 错误已在 store 中处理
    }
  };

  const handleDelete = async () => {
    if (!selectedProjectId || isNew) return;
    try {
      await deleteProject(selectedProjectId);
      showToast({ message: '项目已删除', type: 'success' });
    } catch {
      // 错误已在 store 中处理
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData({ ...formData, goals: [...formData.goals, newGoal.trim()] });
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData({ ...formData, goals: formData.goals.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectProject(null)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isNew ? '新建项目' : formData.name || '编辑项目'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isNew ? '填写信息创建新项目' : '编辑项目信息'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">基本信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">项目名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-dark"
                placeholder="输入项目名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">项目描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="textarea-dark"
                placeholder="简要描述这个项目..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">目标用户</label>
              <input
                type="text"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="input-dark"
                placeholder="例如: 独立开发者、产品经理"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-dark"
              >
                <option value="ideation">构思中</option>
                <option value="mvp">MVP</option>
                <option value="active">进行中</option>
                <option value="paused">已暂停</option>
                <option value="maintenance">维护中</option>
                <option value="completed">已完成</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>
        </section>

        {/* 项目目标 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">项目目标</h3>
          <div className="space-y-2">
            {formData.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300">
                  {goal}
                </span>
                <button
                  onClick={() => removeGoal(index)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                className="input-dark flex-1"
                placeholder="添加一个目标..."
              />
              <button
                onClick={addGoal}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* 本周重点 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">本周重点</h3>
          <textarea
            value={formData.focusThisWeek}
            onChange={(e) => setFormData({ ...formData, focusThisWeek: e.target.value })}
            rows={3}
            className="textarea-dark"
            placeholder="描述这周要重点推进的工作..."
          />
        </section>

        {/* 删除项目 */}
        {!isNew && (
          <section className="card-dark !border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 mb-2">危险区域</h3>
            <p className="text-sm text-slate-400 mb-4">删除项目后无法恢复，关联的洞察不会被删除。</p>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  确认删除
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除项目
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
