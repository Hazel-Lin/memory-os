import React, { useState } from 'react';
import { Users, Calendar, Target, Lightbulb, Copy, Check, ChevronDown } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { useToast } from '../common/ToastProvider';

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: '进行中', className: 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/30' },
  paused: { label: '已暂停', className: 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30' },
  completed: { label: '已完成', className: 'bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/30' },
  ideation: { label: '构思中', className: 'bg-violet-400/10 text-violet-400 ring-1 ring-violet-400/30' },
  mvp: { label: 'MVP', className: 'bg-blue-400/10 text-blue-400 ring-1 ring-blue-400/30' },
  maintenance: { label: '维护中', className: 'bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/30' },
  archived: { label: '已归档', className: 'bg-slate-400/10 text-slate-500 ring-1 ring-slate-500/30' },
};

export function ProjectInfoPanel() {
  const data = useMemoryStore((state) => state.data);
  const selectedProjectId = useMemoryStore((state) => state.selectedProjectId);
  const selectInsight = useMemoryStore((state) => state.selectInsight);
  const setView = useMemoryStore((state) => state.setView);
  const { showToast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [exportTarget, setExportTarget] = useState<'claude' | 'generic'>('claude');
  const [showTargetMenu, setShowTargetMenu] = useState(false);

  if (!data) return null;

  const projects = data.projects;
  const project =
    selectedProjectId && selectedProjectId !== 'new'
      ? projects.find((p) => p.id === selectedProjectId)
      : null;

  const handleExportContext = async () => {
    if (!project) return;
    try {
      const result = await window.electronAPI.export.context(project.id, exportTarget);
      await window.electronAPI.clipboard.write(result.data);
      setCopied('context');
      setTimeout(() => setCopied(null), 2000);
      showToast({ message: `项目上下文已复制（${exportTarget}）`, type: 'success' });
    } catch {
      showToast({ message: '导出失败', type: 'error' });
    }
  };

  const handleExportInsights = async () => {
    if (!project) return;
    try {
      const result = await window.electronAPI.export.insights(project.id);
      await window.electronAPI.clipboard.write(result.data);
      setCopied('insights');
      setTimeout(() => setCopied(null), 2000);
      showToast({ message: '关联洞察已复制', type: 'success' });
    } catch {
      showToast({ message: '导出失败', type: 'error' });
    }
  };

  // 未选中项目时：显示统计
  if (!project) {
    const statusCounts: Record<string, number> = {};
    for (const p of projects) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    return (
      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-4">项目统计</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">全部项目</span>
              <span className="font-semibold text-slate-200">{projects.length}</span>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => {
              const config = statusConfig[status] ?? statusConfig.active;
              return (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.className}`}>
                      {config.label}
                    </span>
                  </span>
                  <span className="font-semibold text-slate-200">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // 选中项目时：显示详情 + 导出按钮
  const status = statusConfig[project.status] ?? statusConfig.active;
  const relatedInsights = data.insights.filter((i) => i.projectId === project.id);

  return (
    <div className="p-6 space-y-6">
      {/* 状态 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">项目状态</h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
          {status.label}
        </span>
      </section>

      {/* 基本信息 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">基本信息</h3>
        <div className="space-y-2 text-xs text-slate-400">
          {project.audience && (
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <span>{project.audience}</span>
            </div>
          )}
          {project.createdAt && (
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <span>{new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          )}
        </div>
      </section>

      {/* 项目目标 */}
      {project.goals.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">项目目标</h3>
          <ul className="space-y-1.5">
            {project.goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-slate-400">
                <Target className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 本周重点 */}
      {project.focusThisWeek && (
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">本周重点</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{project.focusThisWeek}</p>
        </section>
      )}

      {/* 关联洞察 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          关联洞察
          <span className="ml-1.5 text-slate-500 font-normal">({relatedInsights.length})</span>
        </h3>
        {relatedInsights.length === 0 ? (
          <p className="text-xs text-slate-500">暂无关联的洞察</p>
        ) : (
          <ul className="space-y-2">
            {relatedInsights.map((insight) => (
              <li key={insight.id}>
                <button
                  onClick={() => {
                    setView('insights');
                    selectInsight(insight.id);
                  }}
                  className="w-full text-left flex items-start gap-2 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{insight.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 导出操作 */}
      <section className="pt-2 border-t border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">导出给 AI</h3>

        {/* Target 选择 */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowTargetMenu(!showTargetMenu)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-700/50 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span>目标平台: {exportTarget === 'claude' ? 'Claude' : '通用'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showTargetMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 rounded-lg overflow-hidden shadow-xl z-10 border border-slate-600">
              <button
                onClick={() => { setExportTarget('claude'); setShowTargetMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${exportTarget === 'claude' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                Claude
              </button>
              <button
                onClick={() => { setExportTarget('generic'); setShowTargetMenu(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${exportTarget === 'generic' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-600'}`}
              >
                通用格式
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleExportContext}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {copied === 'context' ? (
              <><Check className="w-4 h-4" /> 已复制</>
            ) : (
              <><Copy className="w-4 h-4" /> 导出项目上下文</>
            )}
          </button>
          {relatedInsights.length > 0 && (
            <button
              onClick={handleExportInsights}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-600 active:scale-[0.98] transition-all"
            >
              {copied === 'insights' ? (
                <><Check className="w-4 h-4" /> 已复制</>
              ) : (
                <><Copy className="w-4 h-4" /> 导出关联洞察</>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
