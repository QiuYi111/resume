import { useCallback, useState } from 'react';

export type ToastTone = "muted" | "info" | "success" | "warning" | "error";

export interface ToastMessage {
  message: string;
  tone: ToastTone;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    setToast({ message, tone });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return {
    toast,
    showToast,
    clearToast,
  };
};