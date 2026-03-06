import React from 'react';
import { FolderOpen, Calendar, Copy, Check } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { useToast } from '../common/ToastProvider';

export function InsightInfoPanel() {
  const data = useMemoryStore((state) => state.data);
  const selectedInsightId = useMemoryStore((state) => state.selectedInsightId);
  const selectProject = useMemoryStore((state) => state.selectProject);
  const setView = useMemoryStore((state) => state.setView);
  const { showToast } = useToast();
  const [copiedType, setCopiedType] = React.useState<string | null>(null);

  if (!data) return null;

  const insights = data.insights;
  const projects = data.projects;
  const insight =
    selectedInsightId && selectedInsightId !== 'new'
      ? insights.find((i) => i.id === selectedInsightId)
      : null;

  const handleCopy = async (text: string, type: string, label: string) => {
    try {
      await window.electronAPI.clipboard.write(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
      showToast({ message: `${label}已复制到剪贴板`, type: 'success' });
    } catch {
      showToast({ message: '复制失败', type: 'error' });
    }
  };

  // 未选中洞察时：显示统计
  if (!insight) {
    const withProject = insights.filter((i) => i.projectId).length;
    const withoutProject = insights.length - withProject;

    const projectCounts: Record<string, number> = {};
    for (const i of insights) {
      if (i.projectId) {
        projectCounts[i.projectId] = (projectCounts[i.projectId] || 0) + 1;
      }
    }

    return (
      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-4">洞察统计</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">全部洞察</span>
              <span className="font-semibold text-slate-200">{insights.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">已关联项目</span>
              <span className="font-semibold text-slate-200">{withProject}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">未关联项目</span>
              <span className="font-semibold text-slate-200">{withoutProject}</span>
            </div>
          </div>
        </section>

        {Object.keys(projectCounts).length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">项目分布</h3>
            <div className="space-y-2">
              {Object.entries(projectCounts).map(([projectId, count]) => {
                const project = projects.find((p) => p.id === projectId);
                return (
                  <div key={projectId} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate mr-2">
                      {project?.name ?? '未知项目'}
                    </span>
                    <span className="font-semibold text-slate-200 shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 批量导出全部洞察 */}
        {insights.length > 0 && (
          <section className="pt-2 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">批量导出</h3>
            <button
              onClick={async () => {
                try {
                  const result = await window.electronAPI.export.insights();
                  await window.electronAPI.clipboard.write(result.data);
                  setCopiedType('all');
                  setTimeout(() => setCopiedType(null), 2000);
                  showToast({ message: '全部洞察已复制', type: 'success' });
                } catch {
                  showToast({ message: '导出失败', type: 'error' });
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-600 active:scale-[0.98] transition-all"
            >
              {copiedType === 'all' ? (
                <><Check className="w-4 h-4" /> 已复制</>
              ) : (
                <><Copy className="w-4 h-4" /> 导出全部洞察</>
              )}
            </button>
          </section>
        )}
      </div>
    );
  }

  // 选中洞察时：显示详情
  const relatedProject = insight.projectId
    ? projects.find((p) => p.id === insight.projectId)
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* 场景 */}
      {insight.scenario && (
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">适用场景</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.scenario}</p>
        </section>
      )}

      {/* 关联项目 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 mb-3">关联项目</h3>
        {relatedProject ? (
          <button
            onClick={() => {
              setView('projects');
              selectProject(relatedProject.id);
            }}
            className="w-full text-left flex items-start gap-2 text-xs text-slate-400 hover:text-blue-400 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
            <span>{relatedProject.name}</span>
          </button>
        ) : (
          <p className="text-xs text-slate-500">未关联项目</p>
        )}
      </section>

      {/* 创建时间 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 mb-2">创建时间</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{new Date(insight.createdAt).toLocaleString('zh-CN')}</span>
        </div>
      </section>

      {/* 快捷操作 */}
      <section className="pt-2 border-t border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">快捷操作</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCopy(insight.content, 'content', '洞察内容')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {copiedType === 'content' ? (
              <><Check className="w-4 h-4" /> 已复制</>
            ) : (
              <><Copy className="w-4 h-4" /> 复制内容</>
            )}
          </button>
          <button
            onClick={() => {
              const full = `## ${insight.title}\n${insight.scenario ? `Scenario: ${insight.scenario}\n\n` : ''}${insight.content}`;
              handleCopy(full, 'full', '完整洞察');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-600 active:scale-[0.98] transition-all"
          >
            {copiedType === 'full' ? (
              <><Check className="w-4 h-4" /> 已复制</>
            ) : (
              <><Copy className="w-4 h-4" /> 复制完整洞察</>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
