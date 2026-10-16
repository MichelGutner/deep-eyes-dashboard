import { useCallback, useState } from 'react';

const KEY = 'deep-eyes:saved-filters';

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string>;
  createdAt: string;
}

function load(): SavedFilter[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persist(filters: SavedFilter[]) {
  localStorage.setItem(KEY, JSON.stringify(filters));
}

export function useSavedFilters() {
  const [saved, setSaved] = useState<SavedFilter[]>(load);

  const save = useCallback((name: string, filters: Record<string, string>) => {
    const entry: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    setSaved(prev => {
      const next = [entry, ...prev];
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSaved(prev => {
      const next = prev.filter(f => f.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { saved, save, remove };
}
