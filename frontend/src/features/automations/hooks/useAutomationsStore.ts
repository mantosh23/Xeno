import { create } from 'zustand';
import { apiFetch } from '../../../services/api';

interface AutomationsState {
  automations: { list: any[]; isLoading: boolean };
  fetchAutomations: () => Promise<void>;
  toggleAutomation: (id: string, newStatus: string) => Promise<boolean>;
  updateAutomation: (id: string, workflow_data: any) => Promise<void>;
  deleteAutomation: (id: string) => Promise<boolean>;
}

export const useAutomationsStore = create<AutomationsState>((set) => ({
  automations: { list: [], isLoading: false },
  fetchAutomations: async () => {
    set((state) => ({ automations: { ...state.automations, isLoading: true } }));
    try {
      const res = await apiFetch('/api/automations');
      const data = await res.json();
      if (data.success) {
        set({ automations: { list: data.automations || [], isLoading: false } });
      } else {
        set((state) => ({ automations: { ...state.automations, isLoading: false } }));
      }
    } catch (e) {
      set((state) => ({ automations: { ...state.automations, isLoading: false } }));
    }
  },
  toggleAutomation: async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/automations/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          automations: {
            ...state.automations,
            list: state.automations.list.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
          },
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  updateAutomation: async (id: string, workflow_data: any) => {
    try {
      const res = await apiFetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_data }),
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          automations: {
            ...state.automations,
            list: state.automations.list.map((a) => (a.id === id ? { ...a, workflow_data } : a)),
          },
        }));
      }
    } catch (e) {
      console.error(e);
    }
  },
  deleteAutomation: async (id: string) => {
    try {
      const res = await apiFetch(`/api/automations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          automations: {
            ...state.automations,
            list: state.automations.list.filter((a) => a.id !== id),
          },
        }));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}));