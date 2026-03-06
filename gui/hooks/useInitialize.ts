import { useEffect, useRef } from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { useToast } from '../components/common/ToastProvider';

/**
 * 初始化应用数据
 * 在应用启动时加载数据，并处理错误
 */
export function useInitialize() {
  const loadData = useMemoryStore((state) => state.loadData);
  const data = useMemoryStore((state) => state.data);
  const error = useMemoryStore((state) => state.error);
  const { showToast } = useToast();

  // 使用 ref 跟踪是否已显示过 Toast
  const hasShownSuccessToast = useRef(false);
  const hasShownErrorToast = useRef(false);

  // 只在首次加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 数据加载成功时显示提示（仅一次）
  useEffect(() => {
    if (data && !hasShownSuccessToast.current) {
      console.log('✓ 数据加载成功:', data);
      showToast({
        message: '数据加载成功',
        type: 'success',
        duration: 2000,
      });
      hasShownSuccessToast.current = true;
    }
  }, [data]);

  // 加载失败时显示错误（仅一次）
  useEffect(() => {
    if (error && !hasShownErrorToast.current) {
      console.error('✗ 加载数据失败:', error);
      showToast({
        message: error,
        type: 'error',
        duration: 5000,
      });
      hasShownErrorToast.current = true;
    }
  }, [error]);
}
