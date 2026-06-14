import { create } from 'zustand';
import { apiFetch } from '../../../services/api';

interface CampaignsListState {
  selectedCampaignFilter: string;
  setCampaignFilter: (filter: string) => void;
  campaigns: { list: any[]; isLoading: boolean };
  fetchCampaigns: () => Promise<void>;
  deleteCampaign: (id: string) => Promise<boolean>;
}

/**
 * useCampaignsListStore Zustand Store
 * 
 * Manages global state for CampaignsListStore.
 */
export const useCampaignsListStore = create<CampaignsListState>((set) => ({
  selectedCampaignFilter: 'Last 7 Days',
  setCampaignFilter: (filter) => set({ selectedCampaignFilter: filter }),
  campaigns: { list: [], isLoading: false },
  fetchCampaigns: async () => {
    set((state) => ({ campaigns: { ...state.campaigns, isLoading: true } }));
    try {
      const res = await apiFetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        set({ campaigns: { list: data.campaigns || [], isLoading: false } });
      } else {
        set((state) => ({ campaigns: { ...state.campaigns, isLoading: false } }));
      }
    } catch (e) {
      set((state) => ({ campaigns: { ...state.campaigns, isLoading: false } }));
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
}));
