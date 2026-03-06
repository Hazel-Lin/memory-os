import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { useToast } from '../common/ToastProvider';
import type { Insight } from '@core/models';

type FormData = Omit<Insight, 'id' | 'createdAt'>;

const defaultForm: FormData = {
  title: '',
  scenario: '',
  content: '',
  projectId: null,
};

export function InsightEditor() {
  const data = useMemoryStore((state) => state.data);
  const selectedInsightId = useMemoryStore((state) => state.selectedInsightId);
  const selectInsight = useMemoryStore((state) => state.selectInsight);
  const addInsight = useMemoryStore((state) => state.addInsight);
  const updateInsight = useMemoryStore((state) => state.updateInsight);
  const deleteInsight = useMemoryStore((state) => state.deleteInsight);
  const loading = useMemoryStore((state) => state.loading);
  const { showToast } = useToast();

  const isNew = selectedInsightId === 'new';
  const insight = isNew ? null : data?.insights.find((i) => i.id === selectedInsightId);
  const projects = data?.projects ?? [];

  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isNew) {
      setFormData(defaultForm);
    } else if (insight) {
      const { id, createdAt, ...rest } = insight;
      setFormData(rest);
    }
  }, [selectedInsightId]);

  if (!isNew && !insight) {
    selectInsight(null);
    return null;
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showToast({ message: '请输入洞察标题', type: 'error' });
      return;
    }
    if (!formData.content.trim()) {
      showToast({ message: '请输入洞察内容', type: 'error' });
      return;
    }
    try {
      if (isNew) {
        await addInsight(formData);
        showToast({ message: '洞察创建成功', type: 'success' });
      } else {
        await updateInsight(selectedInsightId!, formData);
        showToast({ message: '洞察保存成功', type: 'success' });
      }
    } catch {
      // 错误已在 store 中处理
    }
  };

  const handleDelete = async () => {
    if (!selectedInsightId || isNew) return;
    try {
      await deleteInsight(selectedInsightId);
      showToast({ message: '洞察已删除', type: 'success' });
    } catch {
      // 错误已在 store 中处理
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectInsight(null)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isNew ? '新建洞察' : formData.title || '编辑洞察'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isNew ? '记录一条新的 AI 协作启发' : '编辑洞察内容'}
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
              <label className="block text-sm font-medium text-slate-300 mb-1">标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-dark"
                placeholder="简洁地概括这条洞察"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">适用场景</label>
              <input
                type="text"
                value={formData.scenario}
                onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                className="input-dark"
                placeholder="这条洞察适用于什么场景？"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">关联项目</label>
              <select
                value={formData.projectId ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value || null })
                }
                className="input-dark"
              >
                <option value="">不关联项目</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 洞察内容 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">洞察内容</h3>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="textarea-dark font-mono text-sm leading-relaxed"
            placeholder="详细描述你的洞察，支持 Markdown 格式..."
          />
          <p className="text-xs text-slate-500 mt-2">支持 Markdown 格式书写</p>
        </section>

        {/* 删除 */}
        {!isNew && (
          <section className="card-dark !border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 mb-2">危险区域</h3>
            <p className="text-sm text-slate-400 mb-4">删除洞察后无法恢复。</p>
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
                删除洞察
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
