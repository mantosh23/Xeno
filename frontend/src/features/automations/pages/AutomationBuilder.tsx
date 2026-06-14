import { apiFetch } from '../../../services/api';
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Send, Loader2, User, Zap, Save, MessageSquare, Mail, Smartphone, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAutomationsStore } from '../hooks/useAutomationsStore';
import { usePageCacheStore } from '../../dashboard/hooks/usePageCacheStore';

type Message = {
  role: 'user' | 'ai';
  text: string;
  automationResult?: {
    title: string;
    description: string;
    triggers: string;
    actions: string;
    message_copy?: string;
    channels?: string[];
    copies?: { [key: string]: string };
  };
  error?: string;
};

/**
 * AutomationBuilder Component
 * 
 * @returns {JSX.Element}
 */
export const AutomationBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCache, setCache } = usePageCacheStore();
  const cacheKey = 'AutomationBuilder';
  const cached = getCache(cacheKey) || {};

  const [input, setInput] = useState(cached.input || '');

  const [activeChannels, setActiveChannels] = useState<string[]>(['WhatsApp']);
  const [activePreviewChannel, setActivePreviewChannel] = useState<string>('');

  const [copyMessages, setCopyMessages] = useState<Message[]>([
    { role: 'ai', text: 'Here are the drafts for your channels. Need to change the tone or adjust the offer? Let me know!' }
  ]);
  const [copyInput, setCopyInput] = useState('');

  const handleSendCopyChat = async () => {
    if (!copyInput.trim()) return;
    setCopyMessages(prev => [...prev, { role: 'user', text: copyInput }]);
    const req = copyInput;
    setCopyInput('');
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1500));
      setCopyMessages(prev => [...prev, { role: 'ai', text: `Got it! I've tweaked the copy slightly to reflect: "${req}"` }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (ch: string) => {
    setActiveChannels(prev => 
      prev.includes(ch) && prev.length > 1 
        ? prev.filter(c => c !== ch) 
        : prev.includes(ch) ? prev : [...prev, ch]
    );
  };

  const renderStringOrJson = (val: any) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
  };
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(cached.step || 1);
  const [messages, setMessages] = useState<Message[]>(cached.messages || [
    { role: 'ai', text: 'Hi! Tell me what kind of automation you want to create. For example: "Wait 2 hours after a cart is abandoned and send a WhatsApp reminder."' }
  ]);
  const [generatedAutomation, setGeneratedAutomation] = useState<any>(cached.generatedAutomation || null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fetchAutomations = useAutomationsStore((s) => s.fetchAutomations);

  const stateRef = useRef({ input, messages, generatedAutomation, step });
  stateRef.current = { input, messages, generatedAutomation, step };

  useEffect(() => {
    return () => {
      setCache(cacheKey, stateRef.current);
    };
  }, []);

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
      const res = await apiFetch('/api/automations', {
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
    <div className="flex flex-col h-screen bg-gray-50 -mt-[72px] relative z-40">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 h-[72px]">
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

      {/* Step 1: Automation Builder */}
      {step === 1 && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Chat Area */}
          <div className="w-[400px] shrink-0 flex flex-col border-r border-gray-200 bg-white relative">
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
        <div className="flex-1 bg-[#F8FAFC] p-8 flex flex-col items-center overflow-y-auto">
          {generatedAutomation ? (
            <div className="w-full max-w-sm my-auto animate-in fade-in zoom-in-95 duration-500 pb-8 flex flex-col gap-3">
              {/* Header Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative p-5 text-center">
                <div className="absolute -top-3 -right-3 text-[10px] font-bold bg-green-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Ready
                </div>
                <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl mx-auto flex items-center justify-center mb-3 text-[#8B5CF6]">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1">{generatedAutomation.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">{generatedAutomation.description}</p>
              </div>

              {/* Trigger Card */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-1"><Zap className="h-3 w-3 text-gray-400"/> Trigger Event</span>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-[13px] font-semibold text-gray-700">
                  {renderStringOrJson(generatedAutomation.triggers)}
                </div>
              </div>

              <div className="flex justify-center -my-3 relative z-10">
                 <div className="bg-white border border-gray-100 p-1 rounded-full shadow-sm">
                   <ArrowLeft className="h-4 w-4 text-gray-300 -rotate-90" />
                 </div>
              </div>

              {/* Action Sequence Card */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-2 block flex items-center gap-1"><Sparkles className="h-3 w-3 text-blue-500"/> Action Sequence</span>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[13px] font-semibold text-blue-700">
                  {renderStringOrJson(generatedAutomation.actions)}
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Approve & Continue <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="text-center my-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Your automation preview<br/>will appear here</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Step 2: Content & Channels */}
      {step === 2 && generatedAutomation && (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center bg-gray-50 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-[#F8FAFC] border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose the Channel</h2>
                <p className="text-sm text-gray-500 mt-1">Select where you want this automation to run.</p>
              </div>
              <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Back to Builder
              </button>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-center gap-6">
                {['WhatsApp', 'SMS', 'Email'].map((ch: string) => {
                  let Icon = MessageSquare;
                  if (ch === 'Email') Icon = Mail;
                  if (ch === 'SMS') Icon = Smartphone;
                  const isActive = activeChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`w-32 h-32 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                        isActive 
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-lg scale-105 ring-4 ring-[#2563EB]/20' 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                      <span className="font-bold text-sm">{ch}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setStep(3)}
                disabled={activeChannels.length === 0}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70"
              >
                Continue <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Message Preview & Launch */}
      {step === 3 && generatedAutomation && (
        <div className="flex-1 flex flex-col bg-gray-50 animate-in fade-in zoom-in-95 duration-500 relative h-full">
           {/* Topbar for Step 3 */}
           <div className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 h-[72px]">
             <div>
               <h2 className="text-xl font-bold text-gray-900">Preview & Finalize</h2>
               <p className="text-sm text-gray-500">Edit your message copies and review how they look.</p>
             </div>
             <div className="flex items-center gap-3">
               <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                 Back to Channels
               </button>
               <button 
                  onClick={handleSaveAutomation}
                  disabled={saving}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                  Launch Automation
               </button>
             </div>
           </div>

           {/* Main Content */}
           <div className="flex-1 overflow-y-auto p-8">
             <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
                
                {/* Left: Chat Assistant */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm h-[480px]">
                  <div className="bg-[#F8F9FB] border-b border-gray-100 p-3 flex items-center gap-2 shrink-0">
                    <div className="bg-[#2563EB] p-1.5 rounded-lg">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 leading-none">Copywriter AI</h3>
                      <span className="text-[9px] text-green-600 font-bold flex items-center gap-1 mt-1">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span> Online
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                    {copyMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`text-xs p-3 rounded-xl shadow-sm font-medium leading-relaxed max-w-[85%] ${
                          msg.role === 'user' 
                            ? 'bg-[#2563EB] text-white rounded-tr-none' 
                            : 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#DBEAFE] rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-2 animate-in fade-in duration-300">
                        <div className="bg-[#EFF6FF] text-[#1E3A8A] text-xs p-3 rounded-xl rounded-tl-none border border-[#DBEAFE] self-start shadow-sm font-medium flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex gap-2 relative">
                      <input 
                        type="text" 
                        value={copyInput}
                        onChange={(e) => setCopyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendCopyChat(); }}
                        placeholder="Make it shorter, add emojis..." 
                        className="flex-1 text-xs font-medium p-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] shadow-sm bg-white"
                      />
                      <button 
                        onClick={() => handleSendCopyChat()}
                        disabled={!copyInput.trim() || loading}
                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#2563EB] text-white px-3 rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: iPhone Mockup */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mx-auto">
                    {activeChannels.map(ch => (
                      <button 
                        key={ch}
                        onClick={() => setActivePreviewChannel(ch)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          (activePreviewChannel || activeChannels[0]) === ch ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative mx-auto shrink-0 mt-4">
                    {/* iPhone 16 Hardware Buttons */}
                    <div className="absolute top-[75px] -left-[2px] w-[3px] h-[16px] bg-gray-400 rounded-l-md z-0" /> {/* Action Button */}
                    <div className="absolute top-[105px] -left-[2px] w-[3px] h-[35px] bg-gray-400 rounded-l-md z-0" /> {/* Volume Up */}
                    <div className="absolute top-[150px] -left-[2px] w-[3px] h-[35px] bg-gray-400 rounded-l-md z-0" /> {/* Volume Down */}
                    <div className="absolute top-[115px] -right-[2px] w-[3px] h-[50px] bg-gray-400 rounded-r-md z-0" /> {/* Power Button */}
                    <div className="absolute top-[210px] -right-[2px] w-[3px] h-[40px] bg-gray-300 rounded-r-md z-0 opacity-80" /> {/* Camera Control */}

                    {/* iPhone 16 Screen Container */}
                    <div className="bg-white rounded-[36px] border-[10px] border-gray-900 shadow-2xl relative overflow-hidden flex flex-col w-[240px] h-[480px] z-10">
                      
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80px] h-[22px] bg-black rounded-full z-30 shadow-md flex justify-end items-center pr-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#0a0a0a] border border-[#1a1a1a] shadow-inner"></div>
                      </div>
                      
                      {/* Fake Status Bar */}
                      <div className="absolute top-0 inset-x-0 h-7 flex justify-between items-center px-5 text-[9px] font-bold text-gray-900 z-20 mix-blend-difference text-white">
                        <span className="mt-1">9:41</span>
                        <div className="flex gap-1 items-center mt-1">
                          <span className="w-3.5 h-2 bg-white rounded-sm relative"><span className="absolute right-[-2px] top-[2px] w-[1px] h-[4px] bg-white"></span></span>
                        </div>
                      </div>
                      
                      {/* Dynamic Headers */}
                      {(() => {
                        const ch = activePreviewChannel || activeChannels[0];
                        if (ch === 'WhatsApp') return (
                          <div className="bg-[#008069] px-3 pt-8 pb-2 flex items-center gap-2 text-white z-10 shrink-0">
                            <ArrowLeft className="h-3.5 w-3.5 opacity-90" />
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#008069] font-bold text-[9px]">SH</div>
                            <span className="text-[11px] font-bold">StyleHive</span>
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
                        return null;
                      })()}

                      {/* Dynamic Body */}
                      {(() => {
                        const ch = activePreviewChannel || activeChannels[0];
                        const bgStyle = ch === 'WhatsApp' ? { background: "repeating-linear-gradient(45deg,#EFEAE2,#EFEAE2 10px,#E5DFDA 10px,#E5DFDA 20px)" } : { background: '#FFFFFF' };
                        const text = generatedAutomation.copies 
                              ? (generatedAutomation.copies[ch] || Object.values(generatedAutomation.copies)[0])
                              : generatedAutomation.message_copy;
                        const renderText = typeof text === 'string' ? text : JSON.stringify(text, null, 2);

                        return (
                          <div className="flex-1 p-3 overflow-y-auto hide-scrollbar z-10 flex flex-col" style={bgStyle}>
                            {ch === 'WhatsApp' && (
                              <div className="bg-white rounded-xl rounded-tl-none p-1.5 shadow-sm max-w-[95%] relative mt-2 self-start">
                                <div className="absolute top-0 -left-1.5 w-3 h-3 bg-white" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                                <div className="px-1.5 pb-0.5">
                                  <pre className="text-[9px] text-gray-800 leading-[1.6] font-medium whitespace-pre-wrap z-10 font-sans">{renderText}</pre>
                                  <span className="text-[7px] text-gray-400 block text-right mt-0.5">10:30 AM</span>
                                </div>
                              </div>
                            )}

                            {ch === 'SMS' && (
                              <div className="bg-gray-200 rounded-2xl p-2 max-w-[85%] mt-2 self-start text-gray-900">
                                <pre className="text-[9px] text-gray-900 leading-[1.4] font-medium whitespace-pre-wrap font-sans">{renderText}</pre>
                              </div>
                            )}
                            
                            {ch === 'Email' && (
                              <div className="text-[9px] text-gray-900 leading-[1.6] whitespace-pre-wrap font-sans mt-2">
                                {renderText}
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
    </div>
  );
};
