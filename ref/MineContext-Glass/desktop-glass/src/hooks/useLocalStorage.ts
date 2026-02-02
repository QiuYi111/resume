import { useCallback, useEffect } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  saveCallback?: (value: T) => void
) => {
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(initialValue) : value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      saveCallback?.(valueToStore);
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, initialValue, saveCallback]);

  const getValue = useCallback((): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      saveCallback?.(initialValue);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }, [key, initialValue, saveCallback]);

  return {
    setValue,
    getValue,
    removeValue,
  };
};