import { apiFetch } from '../../../services/api';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, Send, Bot, User, Rocket, X, Lightbulb, Image } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'ai';
  text: string;
  data?: {
    audienceSize: number;
    estimatedRevenue: number;
    primaryChannel: string;
    filters: any;
  } | null;
  creativeResult?: string[];
  contentResult?: {
    channel: string;
    message_copy: string;
  };
  previewResult?: {
    campaign_name: string;
    channels: string[];
  };
  insightResult?: { message?: string } | string;
  isGeneratingImages?: boolean;
};

import { useStrategyStore } from '../hooks/useStrategyStore';
import { usePageCacheStore } from '../../dashboard/hooks/usePageCacheStore';

/**
 * StrategyPlanner Component
 * 
 * @returns {JSX.Element}
 */
export function StrategyPlanner() {
  const { getCache, setCache } = usePageCacheStore();
  const cacheKey = 'StrategyPlanner';
  const cached = getCache(cacheKey) || {};

  const [input, setInput] = useState(cached.input || '');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(cached.messages || [
    { role: 'ai', text: 'Hi! I am the StyleHive AI Marketing Strategist. How can I help you build your audience today?' }
  ]);
  const [sessionId, setSessionId] = useState<string | null>(cached.sessionId || null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const stateRef = useRef({ input, messages, sessionId });
  stateRef.current = { input, messages, sessionId };

  useEffect(() => {
    return () => {
      setCache(cacheKey, stateRef.current);
    };
  }, []);

  const { id: urlSessionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchSessions } = useStrategyStore();

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, loadingHistory]);

  useEffect(() => {
    // Sync local sessionId with global activeSessionId and load chat history
    const loadSession = async (id: string) => {
      setLoadingHistory(true);
      setSessionId(id);
      try {
        const res = await apiFetch(`/api/strategy/sessions/${id}`);
        const data = await res.json();
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (urlSessionId) {
      if (urlSessionId !== sessionId) {
        loadSession(urlSessionId);
      }
    } else {
      setSessionId(null);
      setMessages([{ role: 'ai', text: 'Hi! I am the StyleHive AI Marketing Strategist. How can I help you build your audience today?' }]);
    }
  }, [urlSessionId]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, sessionId })
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiText = '';

      // Initialize the new AI message shell
      setMessages(prev => [...prev, { role: 'ai', text: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              
              if (data.sessionId && !sessionId) {
                setSessionId(data.sessionId);
                // Update URL to match new session ID
                navigate(`/strategy/${data.sessionId}`, { replace: true });
              }

              if (data.text) {
                aiText += data.text;
                // Strip out any JSON markdown blocks from the visible chat
                let displayAiText = aiText.replace(/```json[\s\S]*```/g, '').replace(/```json[\s\S]*/g, '').trim();
                // Also strip raw JSON if the user explicitly asked for ONLY JSON and no fences
                if (displayAiText.startsWith('{') && displayAiText.includes('"insight"')) {
                  displayAiText = '';
                }

                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = displayAiText;
                  return newMsgs;
                });
              }

              if (data.result) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].data = data.result;
                  return newMsgs;
                });
              }

              if (data.creativeResult) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].creativeResult = data.creativeResult;
                  return newMsgs;
                });
              }

              if (data.contentResult) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].contentResult = data.contentResult;
                  return newMsgs;
                });
              }

              if (data.previewResult) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].previewResult = data.previewResult;
                  return newMsgs;
                });
              }

              if (data.insightResult) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].insightResult = data.insightResult;
                  return newMsgs;
                });
              }

              if (data.isGeneratingImages) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].isGeneratingImages = data.isGeneratingImages;
                  return newMsgs;
                });
              }
              
              if (data.error) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = data.error;
                  return newMsgs;
                });
              }

            } catch (err) {
              console.warn('Failed to parse SSE line', dataStr);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please check your network and try again.' }]);
    } finally {
      setLoading(false);
      fetchSessions(); // Refresh list to update title
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Target users who spent over ₹5000 but haven't purchased in 60 days",
    "Find VIP customers who prefer Summer collections",
    "Find all dormant users in Mumbai"
  ];

  return (
    <div className="w-full h-screen -mt-[72px] flex flex-col bg-white relative z-0">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full relative scroll-smooth">
          <div className="max-w-4xl mx-auto px-6 md:px-8 pt-[96px] md:pt-[104px] pb-28 space-y-8">
          {loadingHistory && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[#0f62fe] animate-spin" />
            </div>
          )}

          {messages.length === 1 && messages[0].role === 'ai' ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-700 ease-out pt-10 pb-10">
              <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#0f62fe] to-[#4f8dff] flex items-center justify-center mb-8 shadow-2xl shadow-[#0f62fe]/20">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight text-center">
                AI Strategy Planner
              </h1>
              <p className="text-lg text-gray-500 text-center max-w-lg mb-12 leading-relaxed">
                I am the StyleHive Marketing Strategist. How can I help you build your audience today?
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 px-4 max-w-3xl">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(s)}
                    className="text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-[#0f62fe] hover:text-[#0f62fe] shadow-sm hover:shadow-md px-5 py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#0f62fe]' : 'bg-blue-50'}`}>
                {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-[#0f62fe]" />}
              </div>
              <div className={`space-y-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#0f62fe] text-white rounded-tr-sm' : 'bg-gray-50 text-gray-900 border border-gray-100 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    <div className="space-y-3 leading-relaxed">
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-[#0f62fe]" {...props} />
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                
                {/* Strategy Card */}
                {msg.data && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-w-[500px] mt-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#0f62fe]" />
                      AI Audience Recommendations
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Audience Size</div>
                        <div className="text-xl font-bold text-gray-900">{msg.data.audienceSize > 0 ? new Intl.NumberFormat('en-IN').format(msg.data.audienceSize) : 'Calculated'}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Est. Revenue</div>
                        <div className="text-xl font-bold text-green-600">
                          {msg.data.estimatedRevenue > 0 ? `₹${(msg.data.estimatedRevenue / 100000).toFixed(1)}L` : 'Projected'}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Primary Channel</div>
                        <div className="text-xl font-bold text-[#0f62fe]">{msg.data.primaryChannel}</div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Link 
                        to={`/audience?${new URLSearchParams(msg.data.filters).toString()}`}
                        className="text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                      >
                        View Audience
                      </Link>
                    </div>
                  </div>
                )}

                {/* Creatives Card & Loading State */}
                {(msg.creativeResult || msg.isGeneratingImages) && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-w-[500px] mt-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-[#0f62fe] to-purple-500"></div>
                    <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                      {msg.isGeneratingImages && !msg.creativeResult ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-[#0f62fe]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-[#0f62fe]">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {msg.isGeneratingImages && !msg.creativeResult ? 'Generating AI Creatives...' : 'Generated AI Creatives'}
                    </h3>
                    
                    {msg.isGeneratingImages && !msg.creativeResult ? (
                      <div className="flex gap-4 items-start">
                        <div className="relative rounded-xl border border-gray-100 bg-gray-50 flex-1 aspect-video flex flex-col items-center justify-center animate-pulse">
                           <Image className="h-8 w-8 text-gray-300 mb-2" strokeWidth={1.5} />
                           <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Generating Banner</span>
                        </div>
                        <div className="relative rounded-xl border border-gray-100 bg-gray-50 flex-1 aspect-[9/16] max-w-[200px] flex flex-col items-center justify-center animate-pulse">
                           <Image className="h-8 w-8 text-gray-300 mb-2" strokeWidth={1.5} />
                           <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Generating Vertical</span>
                        </div>
                      </div>
                    ) : msg.creativeResult && (
                      <div className="flex gap-4 items-start">
                        {msg.creativeResult.map((img, i) => (
                          <div 
                            key={i} 
                            className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-1 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-[#0f62fe]/50 group"
                            onClick={() => setPreviewImage(img.startsWith('http') || img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`)}
                          >
                            <img src={img.startsWith('http') || img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`} className="w-full h-auto block" alt="Generated Poster" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                               <div className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm translate-y-2 group-hover:translate-y-0">
                                 Click to expand
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content Card */}
                {msg.contentResult && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-w-[500px] mt-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-3 flex items-center gap-2">
                      <Bot className="h-4 w-4 text-[#0f62fe]" />
                      Message Content ({msg.contentResult.channel})
                    </h3>
                    <div className="bg-[#F0F2EB] rounded-xl p-4 border border-[#E6E8E1]">
                      <pre className="text-xs text-gray-800 leading-[1.7] font-medium whitespace-pre-wrap font-sans">
                        {msg.contentResult.message_copy}
                      </pre>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Link 
                        to="/create-campaign"
                        className="text-xs font-bold text-white bg-[#0f62fe] hover:bg-[#0f62fe]/90 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        Launch Campaign <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Campaign Preview Card */}
                {msg.previewResult && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-w-[500px] mt-2">
                    <h3 className="text-sm font-bold text-[#0f62fe] mb-4 border-b pb-3 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-[#0f62fe]" />
                      Campaign Ready to Launch
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-[#0f62fe] rounded-full flex items-center justify-center shadow-md mb-4">
                        <Rocket className="h-8 w-8 text-white ml-1 mb-1" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-4">Everything looks good!</h4>
                      <div className="grid grid-cols-2 gap-4 w-full text-left bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Campaign Name</span>
                          <span className="text-sm font-bold text-gray-900">{msg.previewResult.campaign_name || 'Winback Strategy'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Channels</span>
                          <span className="text-sm font-bold text-gray-900">{(msg.previewResult.channels || ['WhatsApp']).join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Personalization</span>
                          <span className="text-sm font-bold text-gray-900 text-green-600">Enabled</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Optimization</span>
                          <span className="text-sm font-bold text-gray-900 text-green-600">AI Managed</span>
                        </div>
                      </div>
                      <button 
                        className="w-full mt-5 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-bold py-3 rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                        onClick={() => alert('Campaign Launched successfully!')}
                      >
                        <Rocket className="h-4 w-4" /> Finalize & Launch Campaign
                      </button>
                    </div>
                  </div>
                )}

                {/* Insight Card */}
                {msg.insightResult && (
                  <div className="bg-white border border-[#E6E8E1] rounded-xl p-5 shadow-sm min-w-[500px] mt-2 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Strategic Insight</h4>
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {typeof msg.insightResult === 'string' ? msg.insightResult : msg.insightResult.message || msg.insightResult.insight}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )))}
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#0f62fe]" />
              </div>
              <div className="bg-gray-50 text-gray-500 border border-gray-100 rounded-2xl rounded-tl-sm p-4 flex flex-col gap-2.5 min-w-[200px]">
                <div className="h-3 w-3/4 skeleton rounded" />
                <div className="h-3 w-1/2 skeleton rounded" />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-white/70 backdrop-blur-md border-t border-white/50 p-4 pb-6 shrink-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your marketing goal or ask a question..."
                className="w-full pl-5 pr-14 py-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gray-300 focus:outline-none transition-all outline-none"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#0f62fe] text-white rounded-lg hover:bg-[#0353e9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4 flex items-center justify-center">
            <button 
              className="absolute top-0 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
