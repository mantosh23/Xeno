import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCw, Bot, Send, Loader2, Tag, Compass, Check, ArrowUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { MessageSquare, Mail } from 'lucide-react';
import { useCampaignStore } from '../../../hooks/useCampaignStore';

interface StrategyStepProps {
  onContinue: () => void;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  onSendChat: (customText?: string) => void;
  onToggleChannel: (channel: string) => void;
  chatHistory: { role: string; text: string }[];
}

/**
 * StrategyStep Component
 * 
 * @returns {JSX.Element}
 */
export function StrategyStep({
  onContinue,
  loading,
  error,
  onRegenerate,
  chatInput,
  setChatInput,
  onSendChat,
  onToggleChannel,
  chatHistory,
}: StrategyStepProps) {
  const store = useCampaignStore();
  if (!store.strategy) return null;

  return (
    <div className="flex flex-col gap-6 mt-6 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
      <div className="flex items-center justify-between">
        <h2 className="text-[26px] leading-tight font-bold text-[#0F172A] tracking-tight">AI Strategy Plan</h2>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRegenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[12px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            disabled={loading || !store.strategy.recommended_channels || store.strategy.recommended_channels.length === 0 || !store.strategy.reasoning || !store.strategy.recommended_offer}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2 rounded-xl font-bold text-[12px] transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
            <h3 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wide">Strategy Assistant</h3>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 bg-white">
            <div className="flex gap-2 animate-in fade-in duration-300">
              <div className="bg-[#F8F9FB] text-gray-700 text-[10px] p-2.5 rounded-xl rounded-tl-none border border-gray-100 self-start max-w-[95%] shadow-sm font-medium leading-relaxed">
                Here's a strategy designed for <span className="font-bold text-[#2563EB]">{store.goal}</span>. You can edit it manually or ask me to make changes!
              </div>
            </div>
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`text-[10px] p-2.5 rounded-xl font-medium leading-relaxed max-w-[95%] shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#2563EB] text-white rounded-tr-none' 
                    : 'bg-[#F8F9FB] text-gray-700 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
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
                onClick={() => onSendChat('Target VIP customers only')}
                className="text-[8px] font-bold bg-white border border-gray-200 px-1.5 py-1 rounded text-gray-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#DBEAFE] transition-all shadow-sm uppercase tracking-wide"
              >
                Target VIPs
              </button>
              <button 
                onClick={() => onSendChat('Make the offer 30% off')}
                className="text-[8px] font-bold bg-white border border-gray-200 px-1.5 py-1 rounded text-gray-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#DBEAFE] transition-all shadow-sm uppercase tracking-wide"
              >
                Offer 30% Off
              </button>
            </div>
            <div className="flex flex-col bg-[#f0f4f9] rounded-2xl p-2 shadow-sm border border-transparent focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-md transition-all relative">
              <textarea 
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendChat(); } }}
                placeholder="Ask a follow up question..." 
                rows={1}
                className="flex-1 text-[10px] font-medium px-2 py-1 bg-transparent focus:outline-none resize-none"
                style={{ minHeight: '24px' }}
              />
              <div className="flex justify-end mt-1">
                <button 
                  onClick={() => onSendChat()}
                  disabled={!chatInput.trim() || loading}
                  className="h-6 w-6 bg-[#0f62fe] text-white rounded-full hover:bg-[#0041d0] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUp className="h-3 w-3" />}
                </button>
              </div>
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
                      onClick={() => onToggleChannel(ch)}
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

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
          <span className="text-[11px] font-semibold text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
}
