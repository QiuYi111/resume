import { useState, useEffect, useCallback } from 'react';
import { fetchUploadLimits } from '../api';
import type { UploadLimits } from '../types';
import { useToast } from './useToast';

export const useUploadLimits = () => {
  const [limits, setLimits] = useState<UploadLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadLimits = useCallback(async () => {
    try {
      setLoading(true);
      const limitsData = await fetchUploadLimits();
      setLimits(limitsData);
    } catch (error) {
      console.error('Failed to load upload limits:', error);
      showToast((error as Error).message ?? '无法加载上传限制', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadLimits();
  }, [loadLimits]);

  return {
    limits,
    loading,
    reload: loadLimits,
  };
};