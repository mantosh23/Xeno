import { create } from 'zustand';

interface CreativeStore {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearState: () => void;
}

/**
 * useCreativeStore Zustand Store
 * 
 * Manages global state for CreativeStore.
 */
export const useCreativeStore = create<CreativeStore>((set) => ({
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  imageUrl: null,
  setImageUrl: (imageUrl) => set({ imageUrl }),
  error: null,
  setError: (error) => set({ error }),
  clearState: () => set({ prompt: '', isGenerating: false, imageUrl: null, error: null })
}));
