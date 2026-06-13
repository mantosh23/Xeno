import { apiFetch } from '../lib/api';
import { create } from 'zustand';

interface DashboardState {
  dateRange: string;
  setDateRange: (range: string) => void;
  selectedCampaignFilter: string;
  setCampaignFilter: (filter: string) => void;
  stats: { totalCustomers: number; totalRevenue: number; inactiveCount: number; opportunityRevenue: number; isLoading: boolean };
  fetchStats: () => Promise<void>;
  campaigns: { list: any[]; isLoading: boolean };
  fetchCampaigns: () => Promise<void>;
  analytics: { summary: any; chartData: any[]; channelBreakdown: any } | null;
  fetchAnalytics: () => Promise<void>;
  deleteCampaign: (id: string) => Promise<boolean>;
  fetchCampaignAnalytics: (id: string) => Promise<{ summary: any; channelBreakdown: any } | null>;
  automations: { list: any[]; isLoading: boolean };
  fetchAutomations: () => Promise<void>;
  toggleAutomation: (id: string, newStatus: string) => Promise<boolean>;
  updateAutomation: (id: string, workflow_data: any) => Promise<void>;
  deleteAutomation: (id: string) => Promise<boolean>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dateRange: 'May 1 – May 31, 2026',
  setDateRange: (range) => set({ dateRange: range }),
  selectedCampaignFilter: 'Last 7 Days',
  setCampaignFilter: (filter) => set({ selectedCampaignFilter: filter }),
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
      }
    } catch (e) {
      set((state) => ({ stats: { ...state.stats, isLoading: false } }));
    }
  },
  campaigns: { list: [], isLoading: false },
  fetchCampaigns: async () => {
    set((state) => ({ campaigns: { ...state.campaigns, isLoading: true } }));
    try {
      const res = await apiFetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        set({ campaigns: { list: data.campaigns || [], isLoading: false } });
      }
    } catch (e) {
      set((state) => ({ campaigns: { ...state.campaigns, isLoading: false } }));
    }
  },
  analytics: null,
  fetchAnalytics: async () => {
    try {
      const res = await apiFetch('/api/analytics/dashboard');
      const data = await res.json();
      if (data.success) {
        set({ analytics: { summary: data.summary, chartData: data.chartData, channelBreakdown: data.channelBreakdown } });
      }
    } catch (e) {
      console.error(e);
    }
  },
  deleteCampaign: async (id: string) => {
    try {
      const res = await apiFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        set((state) => ({ campaigns: { ...state.campaigns, list: state.campaigns.list.filter((c) => c.id !== id) } }));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  fetchCampaignAnalytics: async (id: string) => {
    try {
      const res = await apiFetch(`/api/campaigns/${id}/analytics`);
      const data = await res.json();
      if (data.success) {
        return { summary: data.summary, channelBreakdown: data.channelBreakdown };
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  automations: { list: [], isLoading: false },
  fetchAutomations: async () => {
    set((state) => ({ automations: { ...state.automations, isLoading: true } }));
    try {
      const res = await apiFetch('http://localhost:3001/api/automations');
      const data = await res.json();
      if (data.success) {
        set({ automations: { list: data.automations || [], isLoading: false } });
      }
    } catch (e) {
      set((state) => ({ automations: { ...state.automations, isLoading: false } }));
    }
  },
  toggleAutomation: async (id: string, newStatus: string) => {
    try {
      const res = await apiFetch(`http://localhost:3001/api/automations/${id}/toggle`, {
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
  deleteAutomation: async (id: string) => {
    try {
      const res = await apiFetch(`http://localhost:3001/api/automations/${id}`, {
        method: 'DELETE',
      });
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
