import { apiFetch } from '../../../services/api';
import { create } from 'zustand';

export type SessionInfo = {
  id: string;
  title: string;
  updated_at: string;
};

interface StrategyState {
  sessions: SessionInfo[];
  isLoading: boolean;
  fetchSessions: () => Promise<void>;
  deleteSession: (id: string) => Promise<boolean>;
}

/**
 * useStrategyStore Zustand Store
 * 
 * Manages global state for StrategyStore.
 */
export const useStrategyStore = create<StrategyState>((set) => ({
  sessions: [],
  isLoading: false,
  fetchSessions: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch('/api/strategy/sessions');
      const data = await res.json();
      if (data.success) {
        set({ sessions: data.sessions });
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    } finally {
      set({ isLoading: false });
    }
  },
  deleteSession: async (id: string) => {
    try {
      const res = await apiFetch(`/api/strategy/sessions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) }));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete session:', e);
      return false;
    }
  }
}));
