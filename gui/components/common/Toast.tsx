import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 max-w-md rounded-lg shadow-2xl p-4 flex items-start gap-3 backdrop-blur-sm',
        {
          'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300': type === 'success',
          'bg-red-500/10 border border-red-500/20 text-red-300': type === 'error',
          'bg-blue-500/10 border border-blue-500/20 text-blue-300': type === 'info',
        }
      )}
    >
      {type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
      {type === 'info' && <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />}

      <p className="flex-1 text-sm">{message}</p>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
