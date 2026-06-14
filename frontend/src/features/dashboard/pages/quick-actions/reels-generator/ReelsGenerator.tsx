import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Send, Loader2, User, Video, ArrowUp, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../../../../../services/api';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

/**
 * ReelsGenerator Component
 * 
 * @returns {JSX.Element}
 */
export const ReelsGenerator = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

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
        body: JSON.stringify({ 
          query: `You are an expert Social Media Manager and Reel Script Writer. Create a highly engaging, viral-style 30-60 second Instagram Reel script based on this request: "${text}". Format the output with clear [Visual/Scene] and [Audio/Voiceover] tags, keeping it punchy, dynamic, and trendy. Do not output raw JSON, output beautiful markdown.`,
          displayMessage: text
        })
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
                // Strip out any JSON blocks the AI might inadvertently return (since the original endpoint returns JSON inside text sometimes)
                const displayAiText = aiText.replace(/```json[\s\S]*```/g, '').replace(/```json[\s\S]*/g, '').trim();

                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = displayAiText || aiText;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "A summer dress collection launch",
    "How to style our new oversized tee",
    "Behind the scenes of packing an order"
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 -mt-[72px] relative z-40">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 md:pl-10 flex items-center justify-between shrink-0 h-[72px]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#e6f0ff] text-[#0f62fe] rounded-xl flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Reels Idea Generator</h1>
              <p className="text-xs text-gray-500 mt-0.5">Generate viral scripts for your social media</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative w-full bg-white min-h-0">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-10 pb-6 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0f62fe] to-[#0041d0] flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Create a Reel Script</h2>
                  <p className="text-gray-500 mb-8 max-w-sm">Describe what you want to feature, and I'll write the script, visuals, and voiceover for you.</p>
                  <div className="flex flex-col gap-2 w-full max-w-md">
                    {suggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(s)}
                        className="text-sm font-medium text-left text-gray-700 bg-gray-50 border border-gray-100 hover:border-[#0f62fe] hover:bg-[#e6f0ff] hover:text-[#0f62fe] p-4 rounded-xl transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.length > 0 && messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#0f62fe]' : 'bg-[#e6f0ff]'}`}>
                    {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-[#0f62fe]" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-[#0f62fe] text-white rounded-tr-sm shadow-sm' : 'bg-white shadow-sm border border-gray-100 rounded-tl-sm w-full text-gray-900'}`}>
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
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-[#e6f0ff] flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[#0f62fe]" />
                  </div>
                  <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm p-5 w-48">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="shrink-0 bg-white px-4 pt-4 pb-8 z-20">
            <div className="max-w-4xl mx-auto relative flex items-end bg-[#f0f4f9] rounded-[28px] p-2 pr-2 transition-all">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 400)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your idea here..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-700 placeholder-gray-500 focus:outline-none resize-none overflow-y-auto block"
                style={{ minHeight: '44px', maxHeight: '400px' }}
                disabled={loading}
                rows={1}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 h-10 w-10 mb-0.5 ml-2 flex items-center justify-center rounded-full transition-colors disabled:bg-[#d5d9e0] disabled:text-white disabled:cursor-not-allowed bg-[#0f62fe] text-white hover:bg-[#0353e9]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
