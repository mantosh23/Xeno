import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Bot, Send, Loader2, Upload, Maximize2, X } from 'lucide-react';
import { useCampaignStore } from '../../../hooks/useCampaignStore';

interface VisualsStepProps {
  onContinue: () => void;
  loading: boolean;
  error: string | null;
  creativePrompt: string;
  setCreativePrompt: (val: string) => void;
  onGenerateCreatives: (prompt: string) => void;
  chatHistory: { role: string; text: string }[];
  setPreviewImage: (val: string) => void;
}

/**
 * VisualsStep Component
 * 
 * @returns {JSX.Element}
 */
export function VisualsStep({
  onContinue,
  loading,
  error,
  creativePrompt,
  setCreativePrompt,
  onGenerateCreatives,
  chatHistory,
  setPreviewImage,
}: VisualsStepProps) {
  const store = useCampaignStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (creativePrompt.trim()) {
      onGenerateCreatives(creativePrompt);
      setCreativePrompt('');
    }
  };

  return (
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
              onClick={onContinue}
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
                onSubmit={handleSubmit}
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
      
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
          <span className="text-[11px] font-semibold text-red-600">{error}</span>
        </div>
      )}
    </div>
  );
}
