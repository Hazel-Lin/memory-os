import React from 'react';

interface CapabilitySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function CapabilitySlider({ label, value, onChange }: CapabilitySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-blue-400">{value}/5</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between mt-1 text-xs text-slate-600">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
}
