import { create } from 'zustand';
import { apiFetch } from '../../../services/api';

interface StatsState {
  dateRange: string;
  setDateRange: (range: string) => void;
  stats: { totalCustomers: number; totalRevenue: number; inactiveCount: number; opportunityRevenue: number; isLoading: boolean };
  fetchStats: () => Promise<void>;
}

/**
 * useStatsStore Zustand Store
 * 
 * Manages global state for StatsStore.
 */
export const useStatsStore = create<StatsState>((set) => ({
  dateRange: 'May 1 – May 31, 2026',
  setDateRange: (range) => set({ dateRange: range }),
  stats: { totalCustomers: 0, totalRevenue: 0, inactiveCount: 0, opportunityRevenue: 0, isLoading: false },
  fetchStats: async () => {
    set((state) => ({ stats: { ...state.stats, isLoading: true } }));
    try {
      const res = await apiFetch('/api/customers/stats');
      const data = await res.json();
      if (data.success) {
        set({ 
          stats: { 
            totalCustomers: data.totalCustomers, 
            totalRevenue: data.totalRevenue, 
            inactiveCount: data.inactiveCount || 0,
            opportunityRevenue: data.opportunityRevenue || 0,
            isLoading: false 
          } 
        });
      } else {
        set((state) => ({ stats: { ...state.stats, isLoading: false } }));
      }
    } catch (e) {
      set((state) => ({ stats: { ...state.stats, isLoading: false } }));
    }
  },
}));
