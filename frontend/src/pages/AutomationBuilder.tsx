import { apiFetch } from '../lib/api';
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Send, Loader2, User, Zap, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDashboardStore } from '../store/useDashboardStore';

type Message = {
  role: 'user' | 'ai';
  text: string;
  automationResult?: {
    title: string;
    description: string;
    triggers: string;
    actions: string;
    message_copy?: string;
  };
  error?: string;
};

export const AutomationBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const renderStringOrJson = (val: any) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
  };
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! Tell me what kind of automation you want to create. For example: "Wait 2 hours after a cart is abandoned and send a WhatsApp reminder."' }
  ]);
  const [generatedAutomation, setGeneratedAutomation] = useState<any>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { fetchAutomations } = useDashboardStore();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Design an automation workflow based on this request: "${text}"` })
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiText = '';

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

              if (data.text) {
                aiText += data.text;
                const displayAiText = aiText.replace(/```json[\s\S]*```/g, '').replace(/```json[\s\S]*/g, '').trim();

                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = displayAiText;
                  return newMsgs;
                });
              }

              if (data.automationResult) {
                setGeneratedAutomation(data.automationResult);
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].automationResult = data.automationResult;
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
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveAutomation = async () => {
    if (!generatedAutomation) return;
    setSaving(true);
    try {
      const payload = {
        title: generatedAutomation.title,
        description: generatedAutomation.description,
        triggers: generatedAutomation.triggers,
        actions: generatedAutomation.actions,
        status: 'active',
        icon: 'Zap',
        color: 'text-[#8B5CF6]',
        bgColor: 'bg-[#F5F3FF]',
        stats_sent: 0,
        stats_converted: 0
      };

      // Since we don't have a POST endpoint in the plan yet, let's just do a PUT if id exists, or alert if new.
      // Wait, we need a POST endpoint for new automations!
      const res = await apiFetch('http://localhost:3001/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchAutomations();
        navigate('/automations');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const suggestions = [
    "Send a welcome email when a user signs up",
    "Ping users on WhatsApp 2 days after cart abandonment",
    "Ask for a review 7 days after delivery"
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 -mt-[72px] pt-[72px]">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/automations')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">AI Automation Builder</h1>
            <p className="text-xs text-gray-500 mt-0.5">Tell the AI what you want to automate</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Chat Area */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white relative">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-28">
            {messages.length === 1 && (
              <div className="flex flex-col items-center justify-center pt-10 pb-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Build with AI</h2>
                <p className="text-gray-500 mb-8 max-w-sm">Describe the background workflow you want to create, and I will configure it for you.</p>
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(s)}
                      className="text-sm font-medium text-left text-gray-700 bg-gray-50 border border-gray-100 hover:border-[#8B5CF6] hover:bg-purple-50 hover:text-[#8B5CF6] p-4 rounded-xl transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 1 && messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#8B5CF6]' : 'bg-purple-50'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-[#8B5CF6]" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#8B5CF6] text-white rounded-tr-sm' : 'bg-gray-50 text-gray-900 border border-gray-100 rounded-tl-sm'}`}>
                  {msg.role === 'user' ? msg.text : (
                    <div className="space-y-2">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-4 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="shrink-0 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#8B5CF6]" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm p-4 w-48">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your automation..."
                className="w-full pl-5 pr-14 py-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#8B5CF6] text-white rounded-lg hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Preview Area */}
        <div className="w-1/3 min-w-[350px] bg-[#F8FAFC] p-8 flex flex-col items-center justify-center">
          {generatedAutomation ? (
            <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-[#F5F3FF] p-6 text-center border-b border-purple-100 relative">
                  <div className="absolute -top-3 -right-3 text-[10px] font-bold bg-green-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Ready
                  </div>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4 text-[#8B5CF6]">
                    <Zap className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{generatedAutomation.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{generatedAutomation.description}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Trigger Event</div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-semibold text-gray-700">
                      {renderStringOrJson(generatedAutomation.triggers)}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ArrowLeft className="h-4 w-4 text-gray-300 -rotate-90" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Action Sequence</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm font-semibold text-blue-700">
                      {renderStringOrJson(generatedAutomation.actions)}
                    </div>
                  </div>
                  {generatedAutomation.message_copy && (
                    <>
                      <div className="flex justify-center">
                        <ArrowLeft className="h-4 w-4 text-gray-300 -rotate-90" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Message Copy</div>
                        <div className="bg-[#F0F2EB] border border-[#E6E8E1] rounded-lg p-3 text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                          {renderStringOrJson(generatedAutomation.message_copy)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={handleSaveAutomation}
                disabled={saving}
                className="w-full mt-6 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Save Automation to Dashboard
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Your automation preview<br/>will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
