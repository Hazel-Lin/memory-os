import React from 'react';
import { User, FolderOpen, Lightbulb, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { useMemoryStore } from '../../store/memoryStore';

export function Sidebar() {
  const currentView = useMemoryStore((state) => state.currentView);
  const setView = useMemoryStore((state) => state.setView);

  const navItems = [
    { id: 'profile' as const, icon: User, label: 'Profile', subtitle: '个人画像' },
    { id: 'projects' as const, icon: FolderOpen, label: 'Projects', subtitle: '项目管理' },
    { id: 'insights' as const, icon: Lightbulb, label: 'Insights', subtitle: 'AI 协作启发' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header with drag region for macOS */}
      <div className="titlebar-drag pt-8 pb-4 px-5">
        <div className="titlebar-no-drag flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Memory OS</h1>
            <p className="text-[10px] text-slate-500 leading-tight">个人上下文管理</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setView(item.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-500/15 text-blue-400 font-medium shadow-sm shadow-blue-500/5'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  )}
                >
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-blue-400' : 'text-slate-500')} />
                  <div className="text-left">
                    <span className="block text-sm leading-tight">{item.label}</span>
                    <span className={clsx(
                      'block text-[10px] leading-tight mt-0.5',
                      isActive ? 'text-blue-400/60' : 'text-slate-600'
                    )}>
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span>v0.1.0</span>
          <span>本地存储</span>
        </div>
      </div>
    </div>
  );
}
