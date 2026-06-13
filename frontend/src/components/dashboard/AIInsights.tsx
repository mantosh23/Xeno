import { apiFetch } from '../../lib/api';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

export function AIInsights() {
  const { analytics } = useDashboardStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hi! I am your AI Campaign Analyst. Ask me anything about your current campaign performance, audience metrics, or channel breakdown.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiFetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          campaignContext: analytics,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: 'Oops! I had trouble analyzing that. Please try again later.' }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Network error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full w-full relative overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 pb-2 shrink-0 border-b border-gray-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6345ED]" /> AI Analyst
        </CardTitle>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
          LIVE
        </span>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-[#FAFBFF]">
        {/* Chat Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-[#1E5DDE] text-white' : 'bg-[#E9D5FF] text-[#6345ED]'}`}>
                {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div className={`p-2.5 rounded-xl text-[12px] max-w-[85%] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#1E5DDE] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 flex-row">
              <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mt-1 bg-[#E9D5FF] text-[#6345ED]">
                <Bot className="h-3 w-3" />
              </div>
              <div className="p-2.5 rounded-xl text-[12px] bg-white border border-gray-100 text-gray-500 rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Analyzing data...
              </div>
            </div>
          )}

        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Ask about your campaign..."
              className="w-full bg-[#F4F5F7] border-none rounded-full py-2 pl-4 pr-10 text-[12px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6345ED]"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 h-6 w-6 rounded-full bg-[#6345ED] text-white flex items-center justify-center hover:bg-[#5335DA] disabled:opacity-50 transition-colors"
            >
              <Send className="h-3 w-3 -ml-0.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
