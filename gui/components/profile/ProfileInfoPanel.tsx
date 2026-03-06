import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { useToast } from '../common/ToastProvider';

export function ProfileInfoPanel() {
  const data = useMemoryStore((state) => state.data);
  const { showToast } = useToast();
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  if (!data) return null;

  const profile = data.selfProfile;

  const handleExport = async (target: 'claude' | 'generic') => {
    try {
      const result = await window.electronAPI.export.profile(target);
      await window.electronAPI.clipboard.write(result.data);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 2000);
      showToast({ message: `已复制到剪贴板（${target}）`, type: 'success' });
    } catch {
      showToast({ message: '导出失败', type: 'error' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 能力可视化 */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 mb-4">能力概览</h3>
        <div className="space-y-3">
          {Object.entries(profile.capabilities).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <span className="font-semibold text-slate-200">{value}/5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${(value / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 导出按钮 */}
      <section className="pt-2 border-t border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">快捷导出</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleExport('claude')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {copiedTarget === 'claude' ? (
              <><Check className="w-4 h-4" /> 已复制</>
            ) : (
              <><Copy className="w-4 h-4" /> 导出给 Claude</>
            )}
          </button>
          <button
            onClick={() => handleExport('generic')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 text-sm rounded-lg hover:bg-slate-600 active:scale-[0.98] transition-all"
          >
            {copiedTarget === 'generic' ? (
              <><Check className="w-4 h-4" /> 已复制</>
            ) : (
              <><Copy className="w-4 h-4" /> 通用格式</>
            )}
          </button>
        </div>
      </section>

      {/* 写作风格摘要 */}
      {profile.writingStyle.tone && (
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">写作风格</h3>
          <div className="text-xs text-slate-400 space-y-1.5">
            <p>
              <span className="font-medium text-slate-300">语调：</span>
              {profile.writingStyle.tone}
            </p>
            {profile.writingStyle.preferredStructures.length > 0 && (
              <p>
                <span className="font-medium text-slate-300">偏好结构：</span>
                {profile.writingStyle.preferredStructures.length} 项
              </p>
            )}
            {profile.writingStyle.avoid.length > 0 && (
              <p>
                <span className="font-medium text-slate-300">避免使用：</span>
                {profile.writingStyle.avoid.length} 项
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
