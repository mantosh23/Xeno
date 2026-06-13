import { apiFetch } from '../lib/api';
import {
  ArrowLeft, Sparkles, Compass, ArrowRight, RotateCw,
  Check, Rocket, AlertCircle, Loader2, Bot, Send,
  Users, Tag, Route, Upload, X, Maximize2,
  MessageCircle, MessageSquare, Mail,
  MoreHorizontal, ChevronRight, Heart, Bookmark, Globe, ThumbsUp, Share2
} from 'lucide-react';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaignStore } from '../store/useCampaignStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Strategy, AudienceResult, Insights, ChannelContent, SimulatorEvent } from '../store/useCampaignStore';

// ─── API helper ──────────────────────────────────────────────────────────
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
// ─── Step back labels ────────────────────────────────────────────────────
const stepLabels: Record<number, string> = {
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

// ─── Reusable loading button ─────────────────────────────────────────────
function ActionButton({
  loading, onClick, children, className = '',
}: {
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-[12px] transition-all shadow-md active:scale-95 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-[11px] font-semibold text-red-600">{message}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export function CreateCampaign() {
  const navigate = useNavigate();
  const store = useCampaignStore();

  const [creativePrompt, setCreativePrompt] = useState('');
  const chatHistory = store.globalChat;
  const setChatHistory = store.setGlobalChat;
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const chatHistoryStep2 = store.globalChat;
  const setChatHistoryStep2 = store.setGlobalChat;
  const [chatInputStep2, setChatInputStep2] = useState('');

  const chatHistoryStep6 = store.globalChat;
  const setChatHistoryStep6 = store.setGlobalChat;
  const [chatInputStep6, setChatInputStep6] = useState('');

  const { step, setStep } = store;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 3 local audience-found state
  const [audienceFound, setAudienceFound] = useState(false);
  
  // Channel Creator State
  const [activeChannelTab, setActiveChannelTab] = useState('WhatsApp');
  const [channelMessages, setChannelMessages] = useState<Record<string, string>>({});
  const [textExpanded, setTextExpanded] = useState(false);

  // Sync initial message when it loads
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

  // ── Init AI session on mount ────────────────────────────────────────────
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

  // ── Step 1 → 2: Generate AI strategy ───────────────────────────────────
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

  // ── Step 2: Chat with Strategy Assistant ────────────────────────────────
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
      store.setStrategy(data.strategy);
      setChatHistoryStep2(prev => [...prev, { role: 'ai', text: 'I have updated the strategy plan based on your request!' }]);
      fetchAudienceAndInsights(data.strategy);
    } catch (e: any) {
      setChatHistoryStep2(prev => [...prev, { role: 'ai', text: `Sorry, I couldn't update the strategy: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2 Background: Fetch Audience & Insights ──────────────────────
  async function fetchAudienceAndInsights(strategy: Strategy) {
    // Optional: we can set a separate loading state for insights if we don't want to block chat
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

  // ── Step 4 → 5: Load insights (already pre-fetched) ────────────────────
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

  // ── Step 4 → 5: Generate Imagen 3 Creatives ────────────────────────────
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
          body: JSON.stringify({
            offer,
            prompt_context,
            session_id: store.sessionId,
          }),
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

  // ── Step 5 → 6: Generate channel content ───────────────────────────────
  async function handleGenerateContent() {
    clearError();
    setLoading(true);
    try {
      const offer = store.strategy?.recommended_offer || '25% OFF';
      const data = await api<{ success: boolean; content: ChannelContent }>(
        '/api/campaigns/content',
        {
          method: 'POST',
          body: JSON.stringify({
            channel: 'WhatsApp',
            offer,
            session_id: store.sessionId,
          }),
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
          body: JSON.stringify({
            channel: activeChannelTab,
            offer,
            prompt_context: prompt,
            session_id: store.sessionId,
          }),
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

  // ── Step 7: Personalize for selected customer ───────────────────────────
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
          body: JSON.stringify({
            template,
            customer: { id: customer.id, name: customer.name, city: customer.city, loyalty_tier: customer.loyalty_tier },
            session_id: store.sessionId,
          }),
        }
      );
      store.setPersonalizedMessage(data.personalized_message);
    } catch (e: any) {
      toast.error(`Personalization failed: ${e.message}`);
    } finally {
      setPersonalizingId(null);
    }
  }

  // ── Save Draft and go to campaigns ────────────────────────────────────
  async function handleSaveDraft() {
    clearError();
    setLoading(true);
    try {
      await api<{ success: boolean; campaign: { id: number } }>(
        '/api/campaigns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: store.strategy?.campaign_name || 'Winback – Summer 25',
            status: 'Draft',
            goal: store.goal,
            audience_size: store.audienceResult?.count || 0,
            potential_revenue: store.audienceResult?.potential_revenue || 0,
            offer: store.strategy?.recommended_offer || '25% OFF',
            channels: store.strategy?.steps ? store.strategy.steps.map((s: any) => s.channel) : (store.strategy?.recommended_channels || ['WhatsApp']),
            strategy: {
              ...store.strategy,
              creatives: store.creatives,
              content: store.channelContent,
              personalizedMessage: store.personalizedMessage,
            },
          }),
        }
      );
      toast.success('Draft saved successfully!');
      navigate('/campaigns');
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 9 → 10: Save campaign to DB ──────────────────────────────────
  async function handleLaunch() {
    clearError();
    setLoading(true);
    try {
      const data = await api<{ success: boolean; campaign: { id: number } }>(
        '/api/campaigns',
        {
          method: 'POST',
          body: JSON.stringify({
            name: store.strategy?.campaign_name || 'Winback – Summer 25',
            status: 'Active',
            goal: store.goal,
            audience_size: store.audienceResult?.count || 0,
            potential_revenue: store.audienceResult?.potential_revenue || 0,
            offer: store.strategy?.recommended_offer || '25% OFF',
            channels: store.strategy?.steps ? store.strategy.steps.map((s: any) => s.channel) : (store.strategy?.recommended_channels || ['WhatsApp']),
            strategy: {
              ...store.strategy,
              creatives: store.creatives,
              content: store.channelContent,
              personalizedMessage: store.personalizedMessage,
            },
          }),
        }
      );
      store.setSavedCampaignId(data.campaign.id);
      setStep(10);
    } catch (e: any) {
      toast.error(`Launch failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 10: Load simulator events ────────────────────────────────────
  async function loadSimulatorEvents() {
    if (!store.savedCampaignId) return;
    try {
      const data = await api<{ success: boolean; events: SimulatorEvent[]; channel_status: Record<string, number> }>(
        `/api/campaigns/${store.savedCampaignId}/simulate`
      );
      store.setSimulatorData(data.events, data.channel_status);
    } catch {
      // Non-critical: keep default empty
    }
  }

  useEffect(() => {
    if (step === 10) loadSimulatorEvents();
  }, [step]);

  // ─── Back button ────────────────────────────────────────────────────────
  function goBack() {
    clearError();
    if (step === 5) setStep(2); // Skip Step 3 and 4
    else if (step === 8) setStep(6); // Skip deleted Step 7
    else if (step > 1) setStep(step - 1);
    else navigate(-1);
  }

  const channels = store.strategy?.recommended_channels || ['WhatsApp', 'Instagram', 'Email', 'Facebook', 'SMS'];

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-100px)] p-6 md:p-8">
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 w-full max-w-[1200px] min-h-[calc(100vh-120px)] p-8 md:p-10 relative flex flex-col">

        {/* Back button */}
        <button
          onClick={goBack}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 p-2 transition-colors rounded-full hover:bg-gray-50 flex items-center gap-1.5 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {step === 8 ? stepLabels[6] : step === 5 ? stepLabels[2] : (stepLabels[step - 1] || 'Back')}
          </span>
        </button>

        {/* ─── STEP 1: Goal Definition ─────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col lg:flex-row gap-10 mt-6 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
            {/* Left Side: Input */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-[24px] leading-tight font-bold text-[#0F172A] tracking-tight">
                  What's your marketing goal today?
                </h2>
                <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#7C3AED] border border-[#DBEAFE]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-[9px] font-bold tracking-wide uppercase">AI Assistant</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2 flex-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  Describe your goal in simple words...
                </label>
                <textarea
                  ref={goalRef}
                  defaultValue={store.goal}
                  className="w-full flex-1 min-h-[200px] p-4 rounded-[16px] border border-gray-200 text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] resize-none font-medium text-[13px] leading-relaxed shadow-sm"
                  placeholder="e.g. I want to bring back customers who purchased before…"
                />
              </div>

              {error && <ErrorBanner message={error} />}

              <div className="flex justify-end mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handleContinue}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Thinking…' : 'Continue'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>

            {/* Right Side: Popular Goals */}
            <div className="flex-1 lg:max-w-[400px] flex flex-col gap-4 lg:border-l lg:border-gray-100 lg:pl-10 lg:pt-2">
              <h3 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-gray-400" /> Popular Goals
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  'Increase repeat purchases',
                  'Promote new collection',
                  'Clear old inventory',
                  'Win back inactive customers',
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      if (goalRef.current) goalRef.current.value = goal;
                      store.setGoal(goal);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-[#FCFBFF] hover:bg-[#EFF6FF] hover:border-[#DBEAFE] transition-all text-left group shadow-sm"
                  >
                    <span className="text-[12px] font-semibold text-gray-700 group-hover:text-[#7C3AED] transition-colors">
                      "{goal}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: AI Strategy Plan ─────────────────────────────────── */}
        {step === 2 && store.strategy && (
          <div className="flex flex-col gap-6 mt-6 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[26px] leading-tight font-bold text-[#0F172A] tracking-tight">AI Strategy Plan</h2>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { clearError(); setLoading(true); handleContinue().finally(() => setLoading(false)); }}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[12px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
                >
                  <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Regenerate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStep(5);
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-xl font-bold text-[12px] transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                  Approve & Continue <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 flex-1">
              
              {/* Left Column: Chat Assistant */}
              <div className="flex flex-col bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm h-full max-h-[600px]">
                <div className="bg-[#F8F9FB] border-b border-gray-100 p-2.5 flex items-center gap-2">
                  <div className="bg-[#2563EB] p-1.5 rounded-lg">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-900 leading-none">Strategy Assistant</h3>
                    <span className="text-[8px] text-green-600 font-bold flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 p-2.5 overflow-y-auto flex flex-col gap-2.5">
                  <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#EFF6FF] text-[#1E3A8A] text-[9px] p-2.5 rounded-xl rounded-tl-none border border-[#DBEAFE] self-start max-w-[95%] shadow-sm font-medium leading-relaxed">
                      Here is the recommended strategy. You can ask me to tweak the target audience, change the offer, or adjust the journey!
                    </div>
                  </div>
                  {chatHistoryStep2.map((msg, i) => (
                    <div key={i} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      <div className={`text-[9px] p-2.5 rounded-xl shadow-sm font-medium leading-relaxed max-w-[95%] ${
                        msg.role === 'user' 
                          ? 'bg-[#2563EB] text-white rounded-tr-none' 
                          : 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && chatHistoryStep2.length > 0 && chatHistoryStep2[chatHistoryStep2.length - 1].role === 'user' && (
                    <div className="flex gap-2 animate-in fade-in duration-300">
                      <div className="bg-[#EFF6FF] text-[#1E3A8A] text-[9px] p-2.5 rounded-xl rounded-tl-none border border-[#DBEAFE] self-start max-w-[95%] shadow-sm font-medium flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2.5 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <button 
                      onClick={() => handleSendChatStep2('Target VIP customers only')}
                      className="text-[8px] font-bold bg-white border border-gray-200 px-1.5 py-1 rounded text-gray-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#DBEAFE] transition-all shadow-sm uppercase tracking-wide"
                    >
                      Target VIPs
                    </button>
                    <button 
                      onClick={() => handleSendChatStep2('Make the offer 30% off')}
                      className="text-[8px] font-bold bg-white border border-gray-200 px-1.5 py-1 rounded text-gray-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#DBEAFE] transition-all shadow-sm uppercase tracking-wide"
                    >
                      Offer 30% Off
                    </button>
                  </div>
                  <div className="flex gap-2 relative">
                    <input 
                      type="text" 
                      value={chatInputStep2}
                      onChange={(e) => setChatInputStep2(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatStep2(); }}
                      placeholder="Ask a follow up question..." 
                      className="flex-1 text-[10px] font-medium p-2 pr-8 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] shadow-sm bg-white"
                    />
                    <button 
                      onClick={() => handleSendChatStep2()}
                      disabled={!chatInputStep2.trim() || loading}
                      className="absolute right-1 top-1 bottom-1 bg-[#2563EB] text-white px-2 rounded hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Send className="h-2.5 w-2.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Strategy Plan details */}
              <div className="flex flex-col gap-2.5">
                
                <div className="grid grid-cols-[2fr_1fr] gap-2.5">
                  {/* AI Strategy Summary */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> AI Strategy Summary
                    </span>
                    <div className="bg-[#F8F9FB] border border-gray-100 rounded-lg p-2 flex-1">
                      <p className="text-[10px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {store.strategy.reasoning}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-0.5">
                      <div>
                        <span className="text-[7px] font-bold text-gray-400 block mb-0.5 uppercase">Estimated Size</span>
                        <span className="text-[11px] font-bold text-gray-900">
                          {store.strategy.estimated_size?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] font-bold text-gray-400 block mb-0.5 uppercase">Potential Revenue</span>
                        <span className="text-[11px] font-bold text-[#10B981]">
                          ₹{((store.strategy.potential_revenue || 0) / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Offer (Modern Ticket) */}
                  <div className="relative bg-gradient-to-br from-emerald-900 via-gray-900 to-black p-3 rounded-xl border border-emerald-500/30 shadow-lg flex flex-col items-center justify-center text-center overflow-hidden">
                    {/* Subtle glow effect */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500/20 rounded-full blur-xl"></div>
                    
                    <span className="text-[8px] font-bold text-emerald-400/90 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2 relative z-10">
                      <Tag className="h-3 w-3" /> Offer
                    </span>
                    
                    <div className="w-full border border-dashed border-emerald-500/40 rounded-lg p-2.5 bg-black/20 backdrop-blur-sm relative z-10 flex items-center justify-center">
                      <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-50 leading-snug drop-shadow-sm">
                        {store.strategy.recommended_offer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audience Insights (Merged) */}
                {store.insights && (
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2.5 animate-in fade-in zoom-in duration-500">
                    <span className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="h-3 w-3" /> Audience Insights
                    </span>
                    <div className="grid grid-cols-3 gap-2.5 items-stretch">
                      {/* Demographics */}
                      <div className="bg-[#F8F9FB] border border-gray-100 rounded-lg p-2 h-full flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-gray-500 uppercase block mb-1">Age Group</span>
                        <span className="text-[11px] font-bold text-gray-900">{store.insights.demographics.top_age_group} <span className="text-gray-400 font-medium text-[9px]">({store.insights.demographics.young_pct}%)</span></span>
                      </div>
                      {/* Top Cities */}
                      <div className="bg-[#F8F9FB] border border-gray-100 rounded-lg p-2 h-full flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-gray-500 uppercase block mb-1">Top Cities</span>
                        <div className="flex flex-col gap-0.5">
                           {store.insights.top_cities.slice(0, 2).map(c => <div key={c.city} className="flex justify-between text-[9px]"><span className="text-gray-600">{c.city}</span><span className="font-bold text-gray-900">{c.percentage}%</span></div>)}
                        </div>
                      </div>
                      {/* Categories */}
                      <div className="bg-[#F8F9FB] border border-gray-100 rounded-lg p-2 h-full flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-gray-500 uppercase block mb-1">Categories</span>
                        <div className="flex flex-col gap-0.5">
                           {store.insights.top_categories.slice(0, 2).map(c => <div key={c} className="text-[9px] text-gray-600 truncate">{c}</div>)}
                        </div>
                      </div>
                    </div>
                    {/* AI Insight string */}
                    <div className="flex items-start gap-1.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-2 mt-0.5">
                      <Sparkles className="h-3 w-3 text-[#2563EB] mt-[1px] flex-shrink-0" />
                      <p className="text-[9px] font-medium text-[#2563EB] leading-snug">{store.insights.ai_insight}</p>
                    </div>
                  </div>
                )}

                {/* Choose the channel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-[#2563EB] text-white p-3 font-semibold text-[13px] tracking-wide">
                    Choose the channel
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex flex-wrap gap-4">
                      {['WhatsApp', 'Instagram', 'SMS', 'Facebook', 'Email'].map((ch) => {
                        const isSelected = (store.strategy?.recommended_channels || []).includes(ch);
                        return (
                          <button 
                            key={ch}
                            onClick={() => toggleChannel(ch)}
                            className={`relative w-[85px] h-[85px] rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isSelected ? 'border-[#2563EB] bg-[#EFF6FF]/30 ring-1 ring-[#2563EB]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5 bg-[#2563EB] text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                                <Check className="h-2.5 w-2.5" strokeWidth={4} />
                              </div>
                            )}
                            {ch === 'WhatsApp' && <FaWhatsapp className={`h-6 w-6 ${isSelected ? 'text-[#2563EB]' : 'text-gray-800'}`} />}
                            {ch === 'Instagram' && <FiInstagram className={`h-6 w-6 ${isSelected ? 'text-[#2563EB]' : 'text-gray-800'}`} strokeWidth={1.5} />}
                            {ch === 'SMS' && <MessageSquare className={`h-6 w-6 ${isSelected ? 'text-[#2563EB]' : 'text-gray-800'}`} strokeWidth={1.5} />}
                            {ch === 'Facebook' && <FiFacebook className={`h-6 w-6 ${isSelected ? 'text-[#2563EB]' : 'text-gray-800'}`} strokeWidth={1.5} />}
                            {ch === 'Email' && <Mail className={`h-6 w-6 ${isSelected ? 'text-[#2563EB]' : 'text-gray-800'}`} strokeWidth={1.5} />}
                            <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#1D4ED8]' : 'text-gray-700'}`}>{ch}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {error && <ErrorBanner message={error} />}
          </div>
        )}





        {/* ─── STEP 6: AI Channel Creator ───────────────────────────────── */}
        {step === 6 && (
          <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">AI Channel Creator</h2>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(8)} 
                className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-xl font-semibold text-[12px] shadow-md active:scale-95"
              >
                Continue to Preview <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="bg-gradient-to-br from-[#F8F9FB] to-white rounded-[24px] p-6 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_45%] gap-6 h-full">
                {/* Left Column: Headers, Tabs, Editor */}
                <div className="flex flex-col">
                  <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Create Content for Each Channel</h3>
                  <p className="text-[13px] font-medium text-gray-500 mt-1 mb-5">AI-generated personalized content for your audience.</p>

                  <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 mb-5 overflow-x-auto hide-scrollbar shrink-0 shadow-sm">
                    {(store.strategy?.recommended_channels || ['WhatsApp']).map((ch) => {
                      const isActive = activeChannelTab === ch || (activeChannelTab.startsWith('step-') && ch === 'WhatsApp') || (!activeChannelTab && ch === 'WhatsApp');
                      return (
                        <button
                          key={ch}
                          onClick={() => { setActiveChannelTab(ch); setTextExpanded(false); }}
                          className={`flex-1 flex justify-center items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${isActive ? 'bg-[#2563EB] text-white shadow-md' : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                          {ch === 'WhatsApp' && <FaWhatsapp className="h-4 w-4" />}
                          {ch === 'Instagram' && <FiInstagram className="h-4 w-4" />}
                          {ch === 'SMS' && <MessageSquare className="h-4 w-4" />}
                          {ch === 'Facebook' && <FiFacebook className="h-4 w-4" />}
                          {ch === 'Email' && <Mail className="h-4 w-4" />}
                          {ch}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 flex flex-col h-[340px]">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center shadow-sm">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-[14px] font-bold text-gray-900">AI Copywriter</h4>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                      {chatHistoryStep6.map((msg, idx) => (
                        <div key={idx} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                          <div className={`text-[12px] p-3 rounded-xl max-w-[90%] font-medium leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white rounded-tr-none shadow-md' 
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm shadow-gray-100'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {loading && chatHistoryStep6.length > 0 && chatHistoryStep6[chatHistoryStep6.length - 1].role === 'user' && (
                        <div className="flex gap-2 animate-in fade-in duration-300">
                          <div className="bg-white text-gray-800 text-[12px] p-3 rounded-xl rounded-tl-none border border-gray-100 self-start max-w-[90%] shadow-sm shadow-gray-100 font-medium flex items-center gap-2.5">
                            <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" /> <span className="animate-pulse">Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleTweakContent();
                        }}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1.5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:shadow-sm transition-all"
                      >
                        <input 
                          type="text"
                          value={chatInputStep6}
                          onChange={(e) => setChatInputStep6(e.target.value)}
                          placeholder="e.g. Make it shorter, add more emojis..."
                          className="flex-1 bg-transparent border-none text-[13px] px-3 py-1.5 outline-none text-gray-800"
                          disabled={loading}
                        />
                        <button 
                          type="submit"
                          disabled={loading || !chatInputStep6.trim()}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-1.5 rounded-md disabled:opacity-50 transition-colors"
                        >
                          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        </button>
                      </form>
                    </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-900 tracking-tight">Manual Edit ({activeChannelTab})</label>
                      <textarea
                        value={channelMessages[activeChannelTab] || ""}
                        onChange={(e) => setChannelMessages(prev => ({ ...prev, [activeChannelTab]: e.target.value }))}
                        className="w-full h-[120px] p-3 rounded-xl border border-gray-200 text-gray-800 text-[13px] font-medium resize-none focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 shadow-sm transition-all hide-scrollbar"
                        placeholder={`Edit your ${activeChannelTab} message manually here...`}
                      />
                    </div>
                  </div>
                </div>

                {/* Phone mockup (now on right) */}
                <div className="flex justify-center items-start bg-[#F8F9FB] rounded-[24px] border border-gray-200 px-6 pb-6 pt-0 h-full min-h-[400px] overflow-hidden">
                  <div className="relative mt-2">
                    {/* iPhone 16 Hardware Buttons */}
                    <div className="absolute top-[75px] -left-[2px] w-[3px] h-[16px] bg-gray-400 rounded-l-md z-0" /> {/* Action Button */}
                    <div className="absolute top-[105px] -left-[2px] w-[3px] h-[35px] bg-gray-400 rounded-l-md z-0" /> {/* Volume Up */}
                    <div className="absolute top-[150px] -left-[2px] w-[3px] h-[35px] bg-gray-400 rounded-l-md z-0" /> {/* Volume Down */}
                    <div className="absolute top-[115px] -right-[2px] w-[3px] h-[50px] bg-gray-400 rounded-r-md z-0" /> {/* Power Button */}
                    <div className="absolute top-[210px] -right-[2px] w-[3px] h-[40px] bg-gray-300 rounded-r-md z-0 opacity-80" /> {/* Camera Control */}

                    {/* iPhone 16 Screen Container */}
                    <div className="bg-white rounded-[36px] border-[10px] border-gray-900 shadow-2xl relative overflow-hidden flex flex-col w-[220px] h-[460px] shrink-0 z-10">
                      
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-black rounded-full z-30 shadow-md flex justify-end items-center pr-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] shadow-inner"></div>
                      </div>
                  
                  {/* Dynamic Headers */}
                  {(() => {
                    const ch = activeChannelTab.startsWith('step-') ? (store.strategy?.steps?.[parseInt(activeChannelTab.replace('step-', ''))]?.channel || 'WhatsApp') : activeChannelTab;
                    if (ch === 'WhatsApp') return (
                      <div className="bg-[#008069] px-3 pt-8 pb-2 flex items-center gap-2 text-white z-10 shrink-0">
                        <ArrowLeft className="h-3.5 w-3.5 opacity-90" />
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#008069] font-bold text-[9px]">SH</div>
                        <span className="text-[11px] font-bold">StyleHive</span>
                      </div>
                    );
                    if (ch === 'Instagram') return (
                      <div className="bg-white border-b border-gray-200 px-3 pt-8 pb-2 flex items-center justify-between z-10 shrink-0">
                        <span className="font-serif italic text-[14px] font-bold">Instagram</span>
                        <div className="flex gap-3">
                          <Heart className="h-4 w-4 text-gray-900" strokeWidth={2} />
                          <MessageCircle className="h-4 w-4 text-gray-900" strokeWidth={2} />
                        </div>
                      </div>
                    );
                    if (ch === 'SMS') return (
                      <div className="bg-gray-100 border-b border-gray-200 px-3 pt-8 pb-2 flex items-center justify-center text-gray-900 z-10 relative shrink-0">
                        <ArrowLeft className="h-3.5 w-3.5 opacity-90 absolute left-3" />
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-[9px]">SH</div>
                          <span className="text-[9px] font-bold mt-0.5">StyleHive</span>
                        </div>
                      </div>
                    );
                    if (ch === 'Email') return (
                      <div className="bg-white border-b border-gray-200 px-3 pt-8 pb-2 flex flex-col gap-1 text-gray-900 z-10 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-8">From:</span>
                          <span className="text-[11px] font-bold">StyleHive &lt;hello@stylehive.in&gt;</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-8">To:</span>
                          <span className="text-[11px]">Customer</span>
                        </div>
                      </div>
                    );
                    if (ch === 'Facebook') return (
                      <div className="bg-white border-b border-gray-200 px-3 pt-8 pb-2 flex items-center justify-between z-10 shrink-0">
                        <span className="text-[#1877F2] font-bold text-[16px] tracking-tighter">facebook</span>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-3.5 w-3.5 text-gray-900" />
                          </div>
                        </div>
                      </div>
                    );
                    return null;
                  })()}

                  {/* Dynamic Body */}
                  {(() => {
                    const ch = activeChannelTab.startsWith('step-') ? (store.strategy?.steps?.[parseInt(activeChannelTab.replace('step-', ''))]?.channel || 'WhatsApp') : activeChannelTab;
                    const bgStyle = ch === 'WhatsApp' ? { background: "repeating-linear-gradient(45deg,#EFEAE2,#EFEAE2 10px,#E5DFDA 10px,#E5DFDA 20px)" } : ch === 'Facebook' ? { background: '#F0F2F5' } : { background: '#FFFFFF' };
                    
                    return (
                      <div className="flex-1 p-3 overflow-y-auto hide-scrollbar z-10 flex flex-col" style={bgStyle}>
                        {ch === 'WhatsApp' && (
                          <div className="bg-white rounded-xl rounded-tl-none p-1.5 shadow-sm max-w-[95%] relative mt-2 self-start">
                            <div className="absolute top-0 -left-1.5 w-3 h-3 bg-white" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                            {store.creatives && store.creatives.length > 0 && (
                              <div className="mb-1.5">
                                <img src={store.creatives[0].startsWith('http') || store.creatives[0].startsWith('data:') || store.creatives[0].startsWith('blob:') ? store.creatives[0] : `data:image/jpeg;base64,${store.creatives[0]}`} alt="Preview" className="w-full h-auto rounded-lg object-cover border border-gray-100" />
                              </div>
                            )}
                            <div className="px-1.5 pb-0.5">
                              <pre className="text-[9px] text-gray-800 leading-[1.6] font-medium whitespace-pre-wrap z-10 font-sans">{channelMessages[activeChannelTab] || "Type your message..."}</pre>
                              <span className="text-[7px] text-gray-400 block text-right mt-0.5">10:30 AM</span>
                            </div>
                          </div>
                        )}

                        {ch === 'Instagram' && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-2 flex flex-col pb-2">
                            <div className="p-2 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[1.5px] shrink-0">
                                <div className="bg-white w-full h-full rounded-full flex items-center justify-center text-[8px] font-bold text-gray-900">SH</div>
                              </div>
                              <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-1">
                                  <p className="text-[10px] font-bold text-gray-900 leading-none">stylehive_in</p>
                                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="h-1.5 w-1.5 text-white" strokeWidth={4} />
                                  </div>
                                </div>
                                <p className="text-[8px] text-gray-500 mt-0.5 leading-none">Sponsored</p>
                              </div>
                              <div className="ml-auto">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </div>
                            </div>
                            
                            {store.creatives && store.creatives.length > 0 ? (
                              <img src={store.creatives[0].startsWith('http') || store.creatives[0].startsWith('data:') || store.creatives[0].startsWith('blob:') ? store.creatives[0] : `data:image/jpeg;base64,${store.creatives[0]}`} alt="Preview" className="w-full h-auto object-cover" />
                            ) : (
                              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Image Placeholder</div>
                            )}
                            
                            <div className="bg-[#EFF6FF] px-2.5 py-2 flex items-center justify-between border-b border-gray-100 cursor-pointer">
                              <span className="text-[10px] font-bold text-[#1D4ED8]">Shop Now</span>
                              <ChevronRight className="h-3.5 w-3.5 text-[#1D4ED8]" />
                            </div>

                            <div className="px-2.5 pt-2 pb-1.5 flex justify-between items-center">
                              <div className="flex gap-3">
                                <Heart className="h-4 w-4 text-gray-900" strokeWidth={1.5} />
                                <MessageCircle className="h-4 w-4 text-gray-900" strokeWidth={1.5} />
                                <Send className="h-4 w-4 text-gray-900" strokeWidth={1.5} />
                              </div>
                              <Bookmark className="h-4 w-4 text-gray-900" strokeWidth={1.5} />
                            </div>
                            
                            <div className="px-2.5 pb-2">
                              <p className="text-[10px] font-bold text-gray-900 mb-0.5">1,234 likes</p>
                              <div className="text-[9px] text-gray-800 leading-[1.4] font-sans">
                                <span className="font-bold mr-1">stylehive_in</span>
                                <span className="whitespace-pre-wrap">
                                  {textExpanded ? (
                                    <>
                                      {channelMessages[activeChannelTab] || "Type your message..."}
                                      {(channelMessages[activeChannelTab] || "Type your message...").length > 60 && (
                                        <span 
                                          className="text-gray-500 cursor-pointer ml-1 font-medium"
                                          onClick={() => setTextExpanded(false)}
                                        >less</span>
                                      )}
                                    </>
                                  ) : (channelMessages[activeChannelTab] || "Type your message...").slice(0, 60)}
                                  {!textExpanded && (channelMessages[activeChannelTab] || "Type your message...").length > 60 && (
                                    <span 
                                      className="text-gray-500 cursor-pointer ml-1 font-medium"
                                      onClick={() => setTextExpanded(true)}
                                    >... more</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {ch === 'SMS' && (
                          <div className="bg-gray-200 rounded-2xl p-2 max-w-[85%] mt-2 self-start text-gray-900">
                            <pre className="text-[9px] text-gray-900 leading-[1.4] font-medium whitespace-pre-wrap font-sans">{channelMessages[activeChannelTab] || "Type your message..."}</pre>
                          </div>
                        )}

                        {ch === 'Facebook' && (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-2 flex flex-col">
                            <div className="p-2 flex items-start gap-1.5 overflow-hidden">
                              <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-0.5">SH</div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="text-[11px] font-bold text-gray-900 leading-none truncate">StyleHive</p>
                                  <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                                    <Check className="h-2 w-2 text-white" strokeWidth={4} />
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <p className="text-[9px] text-gray-500 leading-none truncate">Sponsored</p>
                                  <span className="text-[9px] text-gray-500 leading-none shrink-0">•</span>
                                  <Globe className="h-2.5 w-2.5 text-gray-500 shrink-0" />
                                </div>
                              </div>
                              <div className="flex gap-1.5 text-gray-500 ml-auto shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <X className="h-4 w-4" />
                              </div>
                            </div>
                            
                            <div className="px-2.5 pb-2">
                              <div className="text-[10px] text-gray-900 leading-[1.4] whitespace-pre-wrap font-sans font-medium">
                                {textExpanded ? (
                                  <>
                                    {channelMessages[activeChannelTab] || "Type your message..."}
                                    {(channelMessages[activeChannelTab] || "Type your message...").length > 90 && (
                                      <span 
                                        className="text-gray-500 cursor-pointer font-normal ml-1"
                                        onClick={() => setTextExpanded(false)}
                                      >See less</span>
                                    )}
                                  </>
                                ) : (channelMessages[activeChannelTab] || "Type your message...").slice(0, 90)}
                                {!textExpanded && (channelMessages[activeChannelTab] || "Type your message...").length > 90 && (
                                  <span 
                                    className="text-gray-500 cursor-pointer font-normal ml-1"
                                    onClick={() => setTextExpanded(true)}
                                  >... See more</span>
                                )}
                              </div>
                            </div>
                            
                            {store.creatives && store.creatives.length > 0 ? (
                              <div className="">
                                <img src={store.creatives[0].startsWith('http') || store.creatives[0].startsWith('data:') || store.creatives[0].startsWith('blob:') ? store.creatives[0] : `data:image/jpeg;base64,${store.creatives[0]}`} alt="Preview" className="w-full h-auto object-cover border-y border-gray-100" />
                              </div>
                            ) : (
                              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs">Image Placeholder</div>
                            )}
                            
                            <div className="p-2 bg-[#F0F2F5] flex items-center justify-between cursor-pointer gap-1.5">
                              <div className="flex flex-col flex-1 min-w-0">
                                <p className="text-[8px] text-gray-500 uppercase font-semibold tracking-wide truncate">STYLEHIVE.IN</p>
                                <p className="text-[10px] font-bold text-gray-900 truncate">Shop New Arrivals</p>
                              </div>
                              <button className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-[9px] font-bold text-gray-900 transition-colors shrink-0 whitespace-nowrap">Shop now</button>
                            </div>
                            
                            <div className="px-2 py-1.5 flex justify-between items-center border-t border-gray-200 text-gray-500 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-[8px] shrink-0">
                                <div className="w-3 h-3 rounded-full bg-[#1877F2] flex items-center justify-center"><ThumbsUp className="h-[6px] w-[6px] text-white" /></div>
                                <span>2.4K</span>
                              </div>
                              <div className="flex gap-1 text-[8px] shrink-0 ml-1">
                                <span>120 comments</span>
                                <span>•</span>
                                <span>45 shares</span>
                              </div>
                            </div>
                            
                            <div className="px-1 py-1 flex justify-between items-center border-t border-gray-200 text-gray-600 whitespace-nowrap">
                              <div className="flex-1 flex items-center justify-center gap-1 text-[8px] font-semibold py-1.5 hover:bg-gray-50 rounded-md cursor-pointer"><ThumbsUp className="h-2.5 w-2.5" /> Like</div>
                              <div className="flex-1 flex items-center justify-center gap-1 text-[8px] font-semibold py-1.5 hover:bg-gray-50 rounded-md cursor-pointer"><MessageCircle className="h-2.5 w-2.5" /> Comment</div>
                              <div className="flex-1 flex items-center justify-center gap-1 text-[8px] font-semibold py-1.5 hover:bg-gray-50 rounded-md cursor-pointer"><Share2 className="h-2.5 w-2.5" /> Share</div>
                            </div>
                          </div>
                        )}

                        {ch === 'Email' && (
                          <div className="bg-white p-2.5 mt-2 flex flex-col border border-gray-100 rounded-lg shadow-sm">
                            {store.creatives && store.creatives.length > 0 && (
                              <div className="mb-2">
                                <img src={store.creatives[0].startsWith('http') || store.creatives[0].startsWith('data:') || store.creatives[0].startsWith('blob:') ? store.creatives[0] : `data:image/jpeg;base64,${store.creatives[0]}`} alt="Preview" className="w-full h-auto rounded object-cover" />
                              </div>
                            )}
                            <pre className="text-[9px] text-gray-800 leading-[1.6] font-medium whitespace-pre-wrap font-sans">{channelMessages[activeChannelTab] || "Type your message..."}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 5: Campaign Creatives ───────────────────────────── */}
        {step === 5 && (
          <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[26px] leading-tight font-bold text-[#0F172A] tracking-tight mb-1">AI Campaign Creatives</h2>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-bold text-gray-900">Generated Assets</h3>
                  <span className="bg-[#E9F2FF] text-[#1E5DDE] border border-[#B8D4FF] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Imagen 3
                  </span>
                </div>
                <p className="text-[12px] font-medium text-gray-500">High quality bespoke AI creatives crafted for your campaign strategy.</p>
              </div>

              <div className="flex items-center gap-3">
                {store.creatives.length > 0 && (
                  <button 
                    onClick={handleGenerateContent}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-xl font-bold text-[12px] transition-all shadow-md active:scale-95 disabled:opacity-70"
                  >
                    {loading ? 'Processing...' : <>Continue to Content <ArrowRight className="h-4 w-4" /></>}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col bg-[#F8F9FB] rounded-[20px] p-5 border border-gray-100 flex-1">



              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
                {/* Left Side: Chat Prompt */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden h-full min-h-[350px] shadow-sm">
                  <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[#2563EB]" />
                    <span className="text-[12px] font-bold text-gray-800">AI Director</span>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                    {chatHistory.length === 0 && store.creatives.length === 0 && (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-[#EFF6FF] text-[#1E3A8A] text-[11px] p-2.5 rounded-xl rounded-tl-none border border-[#DBEAFE] self-start max-w-[90%]">
                          I'm ready to generate campaign creatives. What kind of vibe are you looking for?
                        </div>
                      </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`text-[11px] p-2.5 rounded-xl max-w-[90%] ${
                          msg.role === 'user' 
                            ? 'bg-[#2563EB] text-white rounded-tr-none' 
                            : 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-gray-200 bg-white">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (creativePrompt.trim()) {
                          handleGenerateCreatives(creativePrompt);
                          setCreativePrompt('');
                        }
                      }}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB] transition-all"
                    >
                      <input 
                        type="text"
                        value={creativePrompt}
                        onChange={(e) => setCreativePrompt(e.target.value)}
                        placeholder="Describe the creative..."
                        className="flex-1 bg-transparent border-none text-[12px] px-2 py-1 outline-none text-gray-800"
                        disabled={loading}
                      />
                      <button 
                        type="submit"
                        disabled={loading || !creativePrompt.trim()}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white p-1.5 rounded-md disabled:opacity-50 transition-colors"
                      >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </button>
                    </form>
                    
                  </div>
                </div>

                {/* Right Side: Images Preview or Empty Setup */}
                <div className="flex flex-col gap-2">
                  {store.creatives.length > 0 ? (
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="relative group w-full max-w-[400px] mx-auto aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                          <img src={store.creatives[0].startsWith('http') || store.creatives[0].startsWith('data:') || store.creatives[0].startsWith('blob:') ? store.creatives[0] : `data:image/jpeg;base64,${store.creatives[0]}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Generated Banner" />
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                            <button 
                              onClick={() => setPreviewImage(store.creatives[0])}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all transform hover:scale-110 shadow-lg"
                              title="Preview Fullscreen"
                            >
                              <Maximize2 className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => store.setCreatives([])}
                              className="bg-red-500/80 hover:bg-red-500 backdrop-blur-md p-3 rounded-full text-white transition-all transform hover:scale-110 shadow-lg"
                              title="Remove Image"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 border-dashed text-center h-full min-h-[350px]">
                      <Sparkles className="h-8 w-8 text-[#2563EB] mb-3 opacity-50" />
                      <h4 className="text-[15px] font-bold text-gray-800 mb-1">Generate or Upload Creatives</h4>
                      <p className="text-[12px] text-gray-500 max-w-sm mb-6 leading-relaxed">Tell the AI Director what kind of visuals you want, or upload your own pre-made assets to use for the campaign.</p>
                      
                      {loading ? (
                        <div className="flex items-center gap-2 text-[#2563EB] text-[13px] font-bold">
                          <Loader2 className="h-5 w-5 animate-spin" /> Generating Assets...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[13px] hover:bg-gray-50 cursor-pointer shadow-sm transition-all active:scale-95">
                            <Upload className="h-4 w-4" />
                            Upload Assets
                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                               const files = Array.from(e.target.files || []);
                               if (files.length > 0) {
                                  const url = URL.createObjectURL(files[0]);
                                  store.setCreatives([url, url]);
                               }
                            }} />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 8: Campaign Preview ─────────────────────────────────── */}
        {step === 8 && (
          <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">Campaign Preview</h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 px-5 py-2 rounded-xl font-bold text-[12px] shadow-sm transition-all active:scale-95"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save as Draft
                </button>
                <ActionButton loading={loading} onClick={() => setStep(9)} className="px-5 py-2 rounded-xl text-[12px] shadow-md">
                  Approve & Launch <ArrowRight className="h-4 w-4" />
                </ActionButton>
              </div>
            </div>
            <div className="flex flex-col bg-[#F8F9FB] rounded-xl p-4 border border-gray-100">
              <div className="flex flex-col gap-3 mb-3">
                {/* 1. Overview & Channels */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-4 w-4 text-[#2563EB]" />
                        <h4 className="text-[13px] font-bold text-gray-900">Overview</h4>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed max-w-[500px]">
                        {store.strategy?.summary || 'This campaign targets your inactive customers with a compelling winback offer across multiple channels to drive re-engagement and conversions.'}
                      </p>
                    </div>
                    <div className="flex flex-col md:items-end shrink-0">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Selected Channels</h4>
                      <div className="flex flex-wrap gap-2 justify-end max-w-[280px]">
                        {(store.strategy?.recommended_channels || ['WhatsApp', 'Instagram', 'Facebook', 'Email']).map((channel: string) => {
                          const getIcon = () => {
                            if (channel === 'WhatsApp') return <FaWhatsapp className="h-3 w-3 text-[#25D366]" />;
                            if (channel === 'Instagram') return <FiInstagram className="h-3 w-3 text-[#E1306C]" />;
                            if (channel === 'Facebook') return <FiFacebook className="h-3 w-3 text-[#1877F2]" />;
                            if (channel === 'Email') return <Mail className="h-3 w-3 text-gray-500" />;
                            return <MessageCircle className="h-3 w-3 text-gray-500" />;
                          };
                          return (
                            <div key={channel} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAFAFA] border border-gray-200 rounded-md shadow-sm">
                              {getIcon()}
                              <span className="text-[10px] font-bold text-gray-800">{channel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics & Details */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Row 1 */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Campaign Name</span>
                    <span className="text-[14px] font-bold text-gray-900 mt-0.5 truncate">{store.strategy?.campaign_name || 'Winback Campaign'}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Primary Goal</span>
                    <span className="text-[14px] font-bold text-gray-900 mt-0.5 truncate capitalize">{store.goal || 'Reactivate Users'}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Audience Rule</span>
                    <span className="text-[14px] font-bold text-gray-900 mt-0.5 truncate">&gt; {store.audienceCriteria?.inactive_days || 60} days inactive</span>
                  </div>

                  {/* Row 2 */}
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Target Audience</span>
                    <span className="text-[15px] font-bold text-gray-900 mt-0.5">{store.audienceResult?.count.toLocaleString('en-IN') || 0} <span className="text-[10px] text-gray-500 font-medium">Users</span></span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Core Offer</span>
                    <span className="text-[15px] font-bold text-[#2563EB] mt-0.5">{store.strategy?.recommended_offer || '25% OFF'}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Est. Revenue</span>
                    <span className="text-[15px] font-bold text-[#10B981] mt-0.5">₹{(store.audienceResult?.potential_revenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              {error && <ErrorBanner message={error} />}
            </div>
          </div>
        )}

        {/* ─── STEP 9: Launch Campaign ──────────────────────────────────── */}
        {step === 9 && (
          <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">Launch Campaign</h2>
            <div className="flex flex-col bg-[#F8F9FB] rounded-[20px] p-8 border border-gray-100 items-center text-center">
              <div className="relative mb-6 mt-4">
                {[
                  'w-1.5 h-1.5 bg-blue-400 -top-4 -left-4',
                  'w-2 h-2 bg-pink-400 top-0 -right-6',
                  'w-1.5 h-1.5 bg-yellow-400 bottom-4 -left-8',
                  'w-2 h-2 bg-green-400 -bottom-2 -right-2',
                  'w-1.5 h-1.5 bg-purple-400 -top-8 right-4',
                ].map((cls, i) => (
                  <div key={i} className={`rounded-full absolute animate-pulse opacity-70 ${cls}`} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
                <div className="w-28 h-28 bg-[#2563EB] rounded-full flex items-center justify-center shadow-lg shadow-[#2563EB]/30 hover:scale-105 transition-transform duration-300">
                  <Rocket className="h-12 w-12 text-white ml-2 mb-2" strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-[18px] font-bold text-gray-900 mb-6">Your campaign is ready to launch!</h3>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 w-full max-w-[400px] mb-8 text-left">
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  {[
                    { label: 'Campaign Name', val: store.strategy?.campaign_name || 'Winback – Summer 25' },
                    { label: 'Audience Size', val: store.audienceResult?.count.toLocaleString('en-IN') || '0' },
                    { label: 'Channels', val: `${(store.strategy?.recommended_channels || []).length} Channels` },
                    { label: 'Estimated Reach', val: `${(((store.audienceResult?.count || 0) * 8) / 1000).toFixed(0)}K+` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                      <span className="text-[13px] font-bold text-gray-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="w-full max-w-[400px] mb-4"><ErrorBanner message={error} /></div>}

              <ActionButton loading={loading} onClick={handleLaunch} className="w-full max-w-[400px] justify-center py-3.5 text-[14px] mb-5">
                {loading ? 'Saving to Database…' : <><Rocket className="h-4 w-4 group-hover:-translate-y-1 transition-transform" /> Launch Campaign</>}
              </ActionButton>
              <span className="text-[11px] font-medium text-gray-500">Campaign will be saved to your Supabase database.</span>
            </div>
          </div>
        )}

        {/* ─── STEP 10: Channel Simulator ───────────────────────────────── */}
        {step === 10 && (
          <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">Channel Simulator</h2>
            {store.savedCampaignId && (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
                <span className="text-[11px] font-bold text-green-700">Campaign #{store.savedCampaignId} saved to Supabase! Simulating delivery…</span>
              </div>
            )}
            <div className="flex flex-col bg-[#F8F9FB] rounded-[20px] p-5 border border-gray-100">
              <h3 className="text-[16px] font-bold text-gray-900">Channel Service Simulator</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5 mb-4">Simulating delivery, opens, clicks & conversions.</p>

              <div className="flex gap-2 mb-4">
                <button className="bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-4 py-1.5 rounded-lg text-[12px] font-bold shadow-sm">Live Events</button>
                <button className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-1.5 rounded-lg text-[12px] font-bold shadow-sm">Event Log</button>
              </div>

              <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4">
                {/* Live events */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <span className="text-[11px] font-bold text-[#2563EB]">Live Events</span>
                  </div>
                  <div className="flex flex-col p-2 text-[11px] h-[180px] overflow-y-auto">
                    {store.simulatorEvents.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                      </div>
                    ) : (
                      store.simulatorEvents.map((ev, i) => (
                        <div key={i} className="grid grid-cols-4 px-2 py-1.5 hover:bg-gray-50 rounded text-gray-700 gap-1">
                          <span className="text-gray-400 text-[10px]">{ev.time}</span>
                          <span className="font-semibold text-[10px]">{ev.channel}</span>
                          <span className="text-[10px]">{ev.event}</span>
                          <span className="text-[10px] truncate">{ev.customer}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Channel status bars */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <span className="text-[12px] font-bold text-gray-900 mb-3 block">Channel Status</span>
                  <div className="flex flex-col gap-3.5">
                    {Object.entries(
                      store.channelStatus && Object.keys(store.channelStatus).length > 0
                        ? store.channelStatus
                        : (channels.reduce((a, ch) => ({ ...a, [ch]: 0 }), {}))
                    ).map(([ch, pct]) => (
                      <div key={ch} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-gray-800">{ch}</span>
                          <span className="text-gray-900">{pct as number}%</span>
                        </div>
                        <span className="text-[9px] font-medium text-gray-400 -mt-0.5 mb-0.5">Sending…</span>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#F8F9FB] rounded-xl p-3 border border-gray-100 flex items-center gap-2 mb-4">
                <RotateCw className="h-4 w-4 text-gray-400 ml-1" />
                <span className="text-[11px] font-medium text-gray-600">All events are simulated and sent back to CRM via callbacks.</span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-bold text-[12px] shadow-md active:scale-95"
                >
                  View Live Campaign <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={previewImage.startsWith('http') || previewImage.startsWith('data:') || previewImage.startsWith('blob:') ? previewImage : `data:image/jpeg;base64,${previewImage}`} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
            alt="Preview" 
          />
        </div>
      )}
    </div>
  );
}
