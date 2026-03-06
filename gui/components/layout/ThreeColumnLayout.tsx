import React from 'react';

interface ThreeColumnLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  info: React.ReactNode;
}

export function ThreeColumnLayout({ sidebar, main, info }: ThreeColumnLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-900">
      {/* 左侧导航栏 */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
        {sidebar}
      </aside>

      {/* 中间主面板 */}
      <main className="flex-1 overflow-y-auto bg-slate-900">
        {main}
      </main>

      {/* 右侧信息面板 */}
      <aside className="w-80 bg-slate-850 border-l border-slate-800 flex-shrink-0 overflow-y-auto"
        style={{ backgroundColor: 'rgb(17, 24, 39)' }}
      >
        {info}
      </aside>
    </div>
  );
}
