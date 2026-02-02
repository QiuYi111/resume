import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export const usePersistedMarkdown = () => {
  const { setValue, getValue } = useLocalStorage("glass-manual-markdown", "");

  const saveMarkdown = useCallback((markdown: string) => {
    setValue(markdown);
  }, [setValue]);

  const loadMarkdown = useCallback((): string => {
    return getValue();
  }, [getValue]);

  return {
    saveMarkdown,
    loadMarkdown,
  };
};