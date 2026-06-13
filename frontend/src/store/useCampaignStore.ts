import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────

export interface Strategy {
  target_audience_description: string;
  estimated_inactive_days: number;
  estimated_size: number;
  potential_revenue: number;
  recommended_offer: string;
  recommended_channels: string[];
  campaign_name: string;
  reasoning: string;
}

export interface AudienceResult {
  customer_ids: number[];
  count: number;
  potential_revenue: number;
  sample_customers: {
    id: number;
    name: string;
    city: string;
    email: string;
    loyalty_tier?: string;
  }[];
}

export interface CityInsight {
  city: string;
  percentage: number;
}

export interface Insights {
  demographics: {
    top_age_group: string;
    young_pct: number;
  };
  top_cities: CityInsight[];
  top_categories: string[];

  ai_insight: string;
}

export interface ChannelContent {
  message: string;
  why_it_works: string[];
  expected_open_rate: number;
  expected_click_rate: number;
  expected_conversion_rate: number;
}

export interface SimulatorEvent {
  time: string;
  channel: string;
  event: string;
  customer: string;
}

// ─── Store State ──────────────────────────────────────────────────────────

interface CampaignState {
  // Current Step
  step: number;
  // Step 1
  goal: string;
  // Step 2
  strategy: Strategy | null;
  // Step 3
  audienceCriteria: { inactive_days: number; min_spend: number; age_min: number; age_max: number };
  audienceResult: AudienceResult | null;
  // Step 4
  insights: Insights | null;
  // Step 5
  channelContent: ChannelContent | null;
  creatives: string[];
  personalization: any;
  // Step 7
  selectedCustomer: AudienceResult['sample_customers'][0] | null;
  personalizedMessage: string | null;
  // Step 9
  savedCampaignId: number | null;
  // Step 10
  simulatorEvents: SimulatorEvent[];
  channelStatus: Record<string, number>;
  // AI Session
  sessionId: string | null;
  globalChat: { role: 'ai' | 'user'; text: string }[];

  // Setters
  setStep: (step: number) => void;
  setGoal: (goal: string) => void;
  setStrategy: (s: Strategy) => void;
  setAudienceResult: (r: AudienceResult) => void;
  setInsights: (i: Insights) => void;
  setChannelContent: (c: ChannelContent) => void;
  setCreatives: (images: string[]) => void;
  setPersonalization: (p: any) => void;
  setSelectedCustomer: (c: CampaignState['selectedCustomer']) => void;
  setPersonalizedMessage: (m: string) => void;
  setSavedCampaignId: (id: number) => void;
  setSimulatorData: (events: SimulatorEvent[], status: Record<string, number>) => void;
  setSessionId: (id: string) => void;
  setGlobalChat: (chat: { role: 'ai' | 'user'; text: string }[] | ((prev: { role: 'ai' | 'user'; text: string }[]) => { role: 'ai' | 'user'; text: string }[])) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  goal: "I want to bring back customers who purchased before but haven't shopped recently.",
  strategy: null,
  audienceCriteria: { inactive_days: 60, min_spend: 0, age_min: 18, age_max: 45 },
  audienceResult: null,
  insights: null,
  channelContent: null,
  creatives: [],
  personalization: null,
  selectedCustomer: null,
  personalizedMessage: null,
  savedCampaignId: null,
  simulatorEvents: [],
  channelStatus: {},
  sessionId: null,
  globalChat: [],
};

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setGoal: (goal) => set({ goal }),
      setStrategy: (strategy) => set({ strategy }),
      setAudienceResult: (audienceResult) => set({ audienceResult }),
      setInsights: (insights) => set({ insights }),
      setChannelContent: (channelContent) => set({ channelContent }),
      setCreatives: (creatives) => set({ creatives }),
      setPersonalization: (personalization) => set({ personalization }),
      setSelectedCustomer: (selectedCustomer) => set({ selectedCustomer }),
      setPersonalizedMessage: (personalizedMessage) => set({ personalizedMessage }),
      setSavedCampaignId: (savedCampaignId) => set({ savedCampaignId }),
      setSimulatorData: (simulatorEvents, channelStatus) =>
        set({ simulatorEvents, channelStatus }),
      setSessionId: (sessionId) => set({ sessionId }),
      setGlobalChat: (chatOrUpdater) => set((state) => ({ 
        globalChat: typeof chatOrUpdater === 'function' ? chatOrUpdater(state.globalChat) : chatOrUpdater 
      })),
      reset: () => set(initialState),
    }),
    {
      name: 'campaign-storage',
    }
  )
);
