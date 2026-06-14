import { create } from 'zustand';

interface PageCacheStore {
  cache: Record<string, any>;
  setCache: (key: string, value: any) => void;
  getCache: (key: string) => any;
  clearCache: (key: string) => void;
}

/**
 * usePageCacheStore Zustand Store
 * 
 * Manages global state for PageCacheStore.
 */
export const usePageCacheStore = create<PageCacheStore>((set, get) => ({
  cache: {},
  setCache: (key, value) => set((state) => ({ cache: { ...state.cache, [key]: value } })),
  getCache: (key) => get().cache[key],
  clearCache: (key) => set((state) => {
    const newCache = { ...state.cache };
    delete newCache[key];
    return { cache: newCache };
  })
}));
