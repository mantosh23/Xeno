import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../../../../../services/api';
import { useCampaignStore } from '../../../../campaigns/hooks/useCampaignStore';
import { usePageCacheStore } from '../../../hooks/usePageCacheStore';
import type { Strategy, AudienceResult, Insights, ChannelContent, SimulatorEvent } from '../../../../campaigns/hooks/useCampaignStore';

const API = '';
async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await apiFetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
  return json as T;
}

export const stepLabels: Record<number, string> = {
  1: 'Dashboard',
  2: 'Create Campaign',
  3: 'AI Strategy Planner',
  4: 'AI Audience Builder',
  5: 'AI Audience Insights',
  6: 'AI Channel Creator',
  8: 'Campaign Preview',
  9: 'Launch Campaign',
  10: 'Channel Simulator',
};

export function useCreateCampaign() {
  const navigate = useNavigate();
  const store = useCampaignStore();
  const { getCache, setCache } = usePageCacheStore();
  
  const cacheKey = 'CreateCampaign';
  const cached = getCache(cacheKey) || {};

  const [creativePrompt, setCreativePrompt] = useState(cached.creativePrompt || '');
  const chatHistory = store.globalChat;
  const setChatHistory = store.setGlobalChat;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const chatHistoryStep2 = store.globalChat;
  const setChatHistoryStep2 = store.setGlobalChat;
  const [chatInputStep2, setChatInputStep2] = useState(cached.chatInputStep2 || '');

  const chatHistoryStep6 = store.globalChat;
  const setChatHistoryStep6 = store.setGlobalChat;
  const [chatInputStep6, setChatInputStep6] = useState(cached.chatInputStep6 || '');

  const { step, setStep } = store;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [audienceFound, setAudienceFound] = useState(cached.audienceFound || false);
  const [activeChannelTab, setActiveChannelTab] = useState(cached.activeChannelTab || 'WhatsApp');
  const [channelMessages, setChannelMessages] = useState<Record<string, string>>(cached.channelMessages || {});
  const [textExpanded, setTextExpanded] = useState(cached.textExpanded || false);

  const stateRef = useRef({ creativePrompt, chatInputStep2, chatInputStep6, audienceFound, activeChannelTab, channelMessages, textExpanded });
  stateRef.current = { creativePrompt, chatInputStep2, chatInputStep6, audienceFound, activeChannelTab, channelMessages, textExpanded };

  useEffect(() => {
    return () => {
      setCache(cacheKey, stateRef.current);
    };
  }, []);

  useEffect(() => {
    if (store.channelContent?.message && Object.keys(channelMessages).length === 0) {
      const seed = store.channelContent.message.replace(/{{name}}/g, '');
      const initial: Record<string, string> = {};
      (store.strategy?.recommended_channels || ['WhatsApp']).forEach(ch => {
        initial[ch] = seed;
      });
      setChannelMessages(initial);
    }
  }, [store.channelContent, store.strategy]);

  const goalRef = useRef<HTMLTextAreaElement>(null);
  const clearError = () => setError(null);

  const toggleChannel = (channel: string) => {
    if (!store.strategy) return;
    const channels = store.strategy.recommended_channels || [];
    if (channels.includes(channel)) {
      store.setStrategy({ ...store.strategy, recommended_channels: channels.filter(c => c !== channel) });
    } else {
      store.setStrategy({ ...store.strategy, recommended_channels: [...channels, channel] });
    }
  };

  useEffect(() => {
    if (!store.sessionId) {
      api<{ success: boolean; session_id: string }>('/api/campaigns/session', {
        method: 'POST',
        body: JSON.stringify({}),
      })
        .then((d) => store.setSessionId(d.session_id))
        .catch((e) => console.warn('Session init failed:', e.message));
    }
  }, []);

  async function fetchAudienceAndInsights(strategy: Strategy) {
    try {
      const inactive_days = strategy.estimated_inactive_days || store.audienceCriteria.inactive_days;
      const audData = await api<AudienceResult & { success: boolean }>('/api/campaigns/audience/find', {
        method: 'POST',
        body: JSON.stringify({ ...store.audienceCriteria, inactive_days, session_id: store.sessionId }),
      });
      store.setAudienceResult(audData);

      const ids = audData.customer_ids.slice(0, 50).join(',');
      const insData = await api<{ success: boolean; insights: Insights }>(
        `/api/campaigns/audience/insights?ids=${ids}&session_id=${store.sessionId || ''}`
      );
      store.setInsights(insData.insights);
    } catch (e: any) {
      console.warn(`Failed to fetch insights: ${e.message}`);
    }
  }

  async function handleContinue() {
    const goal = goalRef.current?.value?.trim() || store.goal;
    if (!goal) { setError('Please describe your goal first.'); return; }
    if (!store.sessionId) { setError('AI session not ready yet. Please wait a moment and try again.'); return; }
    clearError();
    store.setGoal(goal);
    setLoading(true);
    try {
      const data = await api<{ success: boolean; strategy: Strategy }>('/api/campaigns/strategy', {
        method: 'POST',
        body: JSON.stringify({ goal, session_id: store.sessionId }),
      });
      store.setStrategy(data.strategy);
      setStep(2);
      fetchAudienceAndInsights(data.strategy);
    } catch (e: any) {
      setError(`Strategy generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendChatStep2(customText?: string) {
    const text = customText || chatInputStep2.trim();
    if (!text) return;
    setChatHistoryStep2(prev => [...prev, { role: 'user', text }]);
    setChatInputStep2('');
    setLoading(true);
    try {
      const newGoal = `${store.goal}. Additional tweak: ${text}`;
      store.setGoal(newGoal);
      const data = await api<{ success: boolean; strategy: Strategy }>('/api/campaigns/strategy', {
        method: 'POST',
        body: JSON.stringify({ goal: newGoal, session_id: store.sessionId }),
      });
      if (!data.strategy || !data.strategy.reasoning || !data.strategy.recommended_offer) {
        setChatHistoryStep2(prev => [...prev, { role: 'ai', text: 'Sorry, I got a bit confused by that request. Could you please rephrase or specify how you want to adjust the offer and audience?' }]);
      } else {
        store.setStrategy(data.strategy);
        setChatHistoryStep2(prev => [...prev, { role: 'ai', text: 'I have updated the strategy plan based on your request!' }]);
        fetchAudienceAndInsights(data.strategy);
      }
    } catch (e: any) {
      setChatHistoryStep2(prev => [...prev, { role: 'ai', text: `Sorry, I couldn't update the strategy: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadInsights() {
    if (!store.insights) {
      clearError();
      setLoading(true);
      try {
        const ids = (store.audienceResult?.customer_ids || []).slice(0, 50).join(',');
        const data = await api<{ success: boolean; insights: Insights }>(
          `/api/campaigns/audience/insights?ids=${ids}&session_id=${store.sessionId || ''}`
        );
        store.setInsights(data.insights);
      } catch (e: any) {
        setError(`Insights failed: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    setStep(4);
  }

  async function handleGenerateCreatives(customPrompt?: string | any) {
    clearError();
    setLoading(true);
    const userPrompt = typeof customPrompt === 'string' ? customPrompt : '';
    if (userPrompt) {
      setChatHistory(prev => [...prev, { role: 'user', text: userPrompt }]);
    }
    try {
      const offer = store.strategy?.recommended_offer || '25% OFF';
      const prompt_context = userPrompt || store.insights?.ai_insight || '';
      const data = await api<{ success: boolean; creatives: string[] }>(
        '/api/campaigns/creatives',
        {
          method: 'POST',
          body: JSON.stringify({ offer, prompt_context, session_id: store.sessionId }),
        }
      );
      store.setCreatives(data.creatives);
      if (userPrompt) {
        setChatHistory(prev => [...prev, { role: 'ai', text: 'I updated the creatives based on your request. How do these look?' }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: 'Here are the initial creatives I generated based on the strategy! How do they look? You can ask me to adjust the styling, background, or colors.' }]);
      }
    } catch (e: any) {
      setError(`Image generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateContent() {
    clearError();
    setLoading(true);
    try {
      const offer = store.strategy?.recommended_offer || '25% OFF';
      const data = await api<{ success: boolean; content: ChannelContent }>(
        '/api/campaigns/content',
        {
          method: 'POST',
          body: JSON.stringify({ channel: 'WhatsApp', offer, session_id: store.sessionId }),
        }
      );
      store.setChannelContent(data.content);
      setChatHistoryStep6(prev => [...prev, { role: 'ai', text: 'Here is the personalized content I created based on the strategy! Ask me to rewrite it, change the tone, or make it shorter.' }]);
      setStep(6);
    } catch (e: any) {
      setError(`Content generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleTweakContent() {
    if (!chatInputStep6.trim()) return;
    const prompt = chatInputStep6.trim();
    setChatHistoryStep6(prev => [...prev, { role: 'user', text: prompt }]);
    setChatInputStep6('');
    setLoading(true);
    try {
      const offer = store.strategy?.recommended_offer || '25% OFF';
      const data = await api<{ success: boolean; content: ChannelContent }>(
        '/api/campaigns/content',
        {
          method: 'POST',
          body: JSON.stringify({ channel: activeChannelTab, offer, prompt_context: prompt, session_id: store.sessionId }),
        }
      );
      store.setChannelContent(data.content);
      if (data.content.message) {
        setChannelMessages(prev => ({ ...prev, [activeChannelTab]: data.content.message.replace(/{{name}}/g, '') }));
      }
      setChatHistoryStep6(prev => [...prev, { role: 'ai', text: 'I updated the message content for ' + activeChannelTab + ' as requested!' }]);
    } catch (e: any) {
      setChatHistoryStep6(prev => [...prev, { role: 'ai', text: `Failed to update content: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  const [personalizingId, setPersonalizingId] = useState<number | null>(null);
  async function handlePersonalize(customer: AudienceResult['sample_customers'][0]) {
    clearError();
    setPersonalizingId(customer.id);
    store.setSelectedCustomer(customer);
    try {
      const template = store.channelContent?.message || `Hi {{name}} 👋\n\nWe miss you!\n\nEnjoy ${store.strategy?.recommended_offer || '25% OFF'} on our latest collection.\n\nUse code: STYLE25\n\nShop now ➔\nstylehive.com`;
      const data = await api<{ success: boolean; personalized_message: string }>(
        '/api/campaigns/personalize',
        {
          method: 'POST',
          body: JSON.stringify({ template, customer: { id: customer.id, name: customer.name, city: customer.city, loyalty_tier: customer.loyalty_tier }, session_id: store.sessionId }),
        }
      );
      store.setPersonalizedMessage(data.personalized_message);
    } catch (e: any) {
      toast.error(`Personalization failed: ${e.message}`);
    } finally {
      setPersonalizingId(null);
    }
  }

  async function handleSaveDraft() {
    clearError();
    setLoading(true);
    try {
      await api<{ success: boolean; campaign: { id: number } }>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: store.strategy?.campaign_name || 'Winback – Summer 25',
          status: 'Draft',
          goal: store.goal,
          audience_size: store.audienceResult?.count || 0,
          potential_revenue: store.audienceResult?.potential_revenue || 0,
          offer: store.strategy?.recommended_offer || '25% OFF',
          channels: store.strategy?.steps ? store.strategy.steps.map((s: any) => s.channel) : (store.strategy?.recommended_channels || ['WhatsApp']),
          strategy: { ...store.strategy, creatives: store.creatives, content: store.channelContent, personalizedMessage: store.personalizedMessage },
        }),
      });
      toast.success('Draft saved successfully!');
      navigate('/campaigns');
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLaunch() {
    clearError();
    setLoading(true);
    try {
      const data = await api<{ success: boolean; campaign: { id: number } }>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: store.strategy?.campaign_name || 'Winback – Summer 25',
          status: 'Active',
          goal: store.goal,
          audience_size: store.audienceResult?.count || 0,
          potential_revenue: store.audienceResult?.potential_revenue || 0,
          offer: store.strategy?.recommended_offer || '25% OFF',
          channels: store.strategy?.steps ? store.strategy.steps.map((s: any) => s.channel) : (store.strategy?.recommended_channels || ['WhatsApp']),
          strategy: { ...store.strategy, creatives: store.creatives, content: store.channelContent, personalizedMessage: store.personalizedMessage },
        }),
      });
      store.setSavedCampaignId(data.campaign.id);
      setStep(10);
    } catch (e: any) {
      toast.error(`Launch failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadSimulatorEvents() {
    if (!store.savedCampaignId) return;
    try {
      const data = await api<{ success: boolean; events: SimulatorEvent[]; channel_status: Record<string, number> }>(
        `/api/campaigns/${store.savedCampaignId}/simulate`
      );
      store.setSimulatorData(data.events, data.channel_status);
    } catch {}
  }

  useEffect(() => {
    if (step === 10) loadSimulatorEvents();
  }, [step]);

  function goBack() {
    clearError();
    if (step === 5) setStep(2);
    else if (step === 8) setStep(6);
    else if (step > 1) setStep(step - 1);
    else navigate(-1);
  }

  const channels = store.strategy?.recommended_channels || ['WhatsApp', 'Instagram', 'Email', 'Facebook', 'SMS'];

  return {
    store,
    step,
    loading,
    error,
    creativePrompt,
    setCreativePrompt,
    chatHistory,
    setChatHistory,
    previewImage,
    setPreviewImage,
    chatInputStep2,
    setChatInputStep2,
    chatHistoryStep2,
    chatInputStep6,
    setChatInputStep6,
    chatHistoryStep6,
    activeChannelTab,
    setActiveChannelTab,
    channelMessages,
    setChannelMessages,
    textExpanded,
    setTextExpanded,
    goalRef,
    handleContinue,
    handleSendChatStep2,
    handleLoadInsights,
    handleGenerateCreatives,
    handleGenerateContent,
    handleTweakContent,
    handlePersonalize,
    handleSaveDraft,
    handleLaunch,
    toggleChannel,
    goBack,
    channels,
    personalizingId,
  };
}
