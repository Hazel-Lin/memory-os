import React, { useState, useMemo } from 'react';
import { Plus, Lightbulb, Search, Filter } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';

export function InsightList() {
  const data = useMemoryStore((state) => state.data);
  const selectInsight = useMemoryStore((state) => state.selectInsight);

  const [search, setSearch] = useState('');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');

  const insights = data?.insights ?? [];
  const projects = data?.projects ?? [];

  const filteredInsights = useMemo(() => {
    let result = insights;

    if (filterProjectId === 'none') {
      result = result.filter((i) => !i.projectId);
    } else if (filterProjectId !== 'all') {
      result = result.filter((i) => i.projectId === filterProjectId);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q) ||
          i.scenario.toLowerCase().includes(q)
      );
    }

    return result;
  }, [insights, search, filterProjectId]);

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId)?.name ?? null;
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">洞察记录</h2>
          <p className="text-sm text-slate-400 mt-1">记录和管理你的 AI 协作启发</p>
        </div>
        <button
          onClick={() => selectInsight('new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          新建洞察
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-9 text-sm"
            placeholder="搜索标题、内容或场景..."
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="input-dark pl-9 pr-8 text-sm appearance-none min-w-[140px]"
          >
            <option value="all">全部项目</option>
            <option value="none">未关联项目</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 列表 */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          {insights.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-slate-300 mb-2">还没有洞察</h3>
              <p className="text-sm text-slate-500 mb-6">记录你的认知和经验，让 AI 更懂你</p>
              <button
                onClick={() => selectInsight('new')}
                className="btn-primary inline-flex"
              >
                <Plus className="w-4 h-4" />
                新建洞察
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-slate-300 mb-2">没有匹配的洞察</h3>
              <p className="text-sm text-slate-500">尝试修改搜索条件或过滤器</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInsights.map((insight) => {
            const projectName = getProjectName(insight.projectId);
            return (
              <button
                key={insight.id}
                onClick={() => selectInsight(insight.id)}
                className="w-full text-left card-dark hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">{insight.title}</h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-3">
                    {new Date(insight.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                {insight.scenario && (
                  <p className="text-xs text-blue-400/80 mb-2">
                    <span className="font-medium">场景：</span>
                    {insight.scenario}
                  </p>
                )}
                <p className="text-sm text-slate-400 line-clamp-2">{insight.content}</p>
                {projectName && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full ring-1 ring-slate-600/50">
                    {projectName}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 底部统计 */}
      {insights.length > 0 && (
        <div className="mt-4 text-xs text-slate-500 text-center">
          显示 {filteredInsights.length} / {insights.length} 条洞察
        </div>
      )}
    </div>
  );
}
