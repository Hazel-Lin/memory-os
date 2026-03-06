import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: '进行中', className: 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/30' },
  paused: { label: '已暂停', className: 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/30' },
  completed: { label: '已完成', className: 'bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/30' },
  ideation: { label: '构思中', className: 'bg-violet-400/10 text-violet-400 ring-1 ring-violet-400/30' },
  mvp: { label: 'MVP', className: 'bg-blue-400/10 text-blue-400 ring-1 ring-blue-400/30' },
  maintenance: { label: '维护中', className: 'bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/30' },
  archived: { label: '已归档', className: 'bg-slate-400/10 text-slate-500 ring-1 ring-slate-500/30' },
};

export function ProjectList() {
  const data = useMemoryStore((state) => state.data);
  const selectProject = useMemoryStore((state) => state.selectProject);

  const projects = data?.projects ?? [];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">项目管理</h2>
          <p className="text-sm text-slate-400 mt-1">管理你的项目和本周重点</p>
        </div>
        <button
          onClick={() => selectProject('new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      {/* 项目列表 */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">还没有项目</h3>
          <p className="text-sm text-slate-500 mb-6">点击「新建项目」开始添加你的第一个项目</p>
          <button
            onClick={() => selectProject('new')}
            className="btn-primary inline-flex"
          >
            <Plus className="w-4 h-4" />
            新建项目
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const status = statusConfig[project.status] ?? statusConfig.active;
            return (
              <button
                key={project.id}
                onClick={() => selectProject(project.id)}
                className="w-full text-left card-dark hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">{project.name}</h3>
                  <span className={`tag ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-slate-400 mb-2 line-clamp-2">{project.description}</p>
                )}
                {project.focusThisWeek && (
                  <p className="text-xs text-blue-400/80 mt-2">
                    <span className="font-medium">本周重点：</span>
                    {project.focusThisWeek}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
