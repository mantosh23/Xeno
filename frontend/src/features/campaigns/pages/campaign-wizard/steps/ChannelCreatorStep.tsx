import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Send, Loader2, ArrowLeft, Heart, MessageCircle, MoreHorizontal, Check, Bookmark, Globe, Share2, ThumbsUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { Mail, X } from 'lucide-react';
import { useCampaignStore } from '../../../hooks/useCampaignStore';

interface ChannelCreatorStepProps {
  onContinue: () => void;
  activeChannelTab: string;
  setActiveChannelTab: (val: string) => void;
  channelMessages: Record<string, string>;
  setChannelMessages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  chatHistory: { role: string; text: string }[];
  chatInput: string;
  setChatInput: (val: string) => void;
  onTweakContent: () => void;
  loading: boolean;
  textExpanded: boolean;
  setTextExpanded: (val: boolean) => void;
}

/**
 * ChannelCreatorStep Component
 * 
 * @returns {JSX.Element}
 */
export function ChannelCreatorStep({
  onContinue,
  activeChannelTab,
  setActiveChannelTab,
  channelMessages,
  setChannelMessages,
  chatHistory,
  chatInput,
  setChatInput,
  onTweakContent,
  loading,
  textExpanded,
  setTextExpanded
}: ChannelCreatorStepProps) {
  const store = useCampaignStore();

  return (
    <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">AI Channel Creator</h2>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue} 
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
                  {chatHistory.map((msg, idx) => (
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
                  {loading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
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
                      onTweakContent();
                    }}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1.5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 focus-within:shadow-sm transition-all"
                  >
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="e.g. Make it shorter, add more emojis..."
                      className="flex-1 bg-transparent border-none text-[13px] px-3 py-1.5 outline-none text-gray-800"
                      disabled={loading}
                    />
                    <button 
                      type="submit"
                      disabled={loading || !chatInput.trim()}
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
                        <ArrowRight className="h-3.5 w-3.5 text-[#1D4ED8]" />
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
  );
}
