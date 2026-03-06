import React, { useState, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { useMemoryStore } from '../../store/memoryStore';
import { useToast } from '../common/ToastProvider';
import { CapabilitySlider } from './CapabilitySlider';
import type { SelfProfile } from '@core/models';

export function ProfileEditor() {
  const data = useMemoryStore((state) => state.data);
  const updateProfile = useMemoryStore((state) => state.updateProfile);
  const loading = useMemoryStore((state) => state.loading);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<SelfProfile | null>(null);
  const [newStructure, setNewStructure] = useState('');
  const [newAvoid, setNewAvoid] = useState('');

  useEffect(() => {
    if (data?.selfProfile) {
      setFormData(data.selfProfile);
    }
  }, [data]);

  if (!formData) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>加载中...</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      showToast({ message: 'Profile 保存成功', type: 'success' });
    } catch (error) {
      // 错误已在 store 中处理
    }
  };

  const addStructure = () => {
    if (newStructure.trim()) {
      setFormData({
        ...formData,
        writingStyle: {
          ...formData.writingStyle,
          preferredStructures: [...formData.writingStyle.preferredStructures, newStructure.trim()],
        },
      });
      setNewStructure('');
    }
  };

  const removeStructure = (index: number) => {
    setFormData({
      ...formData,
      writingStyle: {
        ...formData.writingStyle,
        preferredStructures: formData.writingStyle.preferredStructures.filter((_, i) => i !== index),
      },
    });
  };

  const addAvoid = () => {
    if (newAvoid.trim()) {
      setFormData({
        ...formData,
        writingStyle: {
          ...formData.writingStyle,
          avoid: [...formData.writingStyle.avoid, newAvoid.trim()],
        },
      });
      setNewAvoid('');
    }
  };

  const removeAvoid = (index: number) => {
    setFormData({
      ...formData,
      writingStyle: {
        ...formData.writingStyle,
        avoid: formData.writingStyle.avoid.filter((_, i) => i !== index),
      },
    });
  };

  const updateCapability = (key: string, value: number) => {
    setFormData({
      ...formData,
      capabilities: {
        ...formData.capabilities,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">个人简介</h2>
          <p className="text-sm text-slate-400 mt-1">编辑你的个人信息和能力评估</p>
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
        {/* 基础信息 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">基础信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-dark"
                placeholder="输入你的姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">语言</label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    languages: e.target.value.split(',').map((l) => l.trim()).filter(Boolean),
                  })
                }
                className="input-dark"
                placeholder="例如: zh-CN, en"
              />
              <p className="text-xs text-slate-500 mt-1">用逗号分隔多个语言</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">个人简介</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="textarea-dark"
                placeholder="简要介绍你自己..."
              />
            </div>
          </div>
        </section>

        {/* 写作风格 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">写作风格</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">语调 (Tone)</label>
              <input
                type="text"
                value={formData.writingStyle.tone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    writingStyle: { ...formData.writingStyle, tone: e.target.value },
                  })
                }
                className="input-dark"
                placeholder="例如: 专业、友好、幽默"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                偏好的结构 (Preferred Structures)
              </label>
              <div className="space-y-2">
                {formData.writingStyle.preferredStructures.map((structure, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300">
                      {structure}
                    </span>
                    <button
                      onClick={() => removeStructure(index)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStructure}
                    onChange={(e) => setNewStructure(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStructure()}
                    className="input-dark flex-1"
                    placeholder="添加一个结构..."
                  />
                  <button onClick={addStructure} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                避免使用 (Avoid)
              </label>
              <div className="space-y-2">
                {formData.writingStyle.avoid.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-300">
                      {item}
                    </span>
                    <button
                      onClick={() => removeAvoid(index)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAvoid}
                    onChange={(e) => setNewAvoid(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAvoid()}
                    className="input-dark flex-1"
                    placeholder="添加要避免的内容..."
                  />
                  <button onClick={addAvoid} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 能力评估 */}
        <section className="card-dark">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">能力评估</h3>
          <p className="text-sm text-slate-400 mb-6">自我评估你的各项能力（0-5 分）</p>
          <div className="space-y-6">
            {Object.entries(formData.capabilities).map(([key, value]) => (
              <CapabilitySlider
                key={key}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
                onChange={(newValue) => updateCapability(key, newValue)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
