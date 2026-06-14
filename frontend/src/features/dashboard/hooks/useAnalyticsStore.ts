import { create } from 'zustand';
import { apiFetch } from '../../../services/api';

interface AnalyticsState {
  analytics: any | null;
  isLoading: boolean;
  fetchAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analytics: null,
  isLoading: false,
  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const res = await apiFetch('/api/analytics/dashboard');
      const data = await res.json();
      console.log('Analytics API Response:', data);
      if (data.success) {
        set({ analytics: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  }
}));