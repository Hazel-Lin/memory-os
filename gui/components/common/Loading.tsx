import React from 'react';
import { Cpu } from 'lucide-react';

export function Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm text-slate-400">加载中...</p>
      </div>
    </div>
  );
}
