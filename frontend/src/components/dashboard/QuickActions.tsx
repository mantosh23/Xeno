import { apiFetch } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Send, Users, Sparkles, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  {
    icon: Send,
    title: 'Create Campaign',
    description: 'Start a new campaign',
    color: 'text-[#0f62fe]',
    bgColor: 'bg-[#e6f0ff]',
  },
  {
    icon: Users,
    title: 'AI Audience Builder',
    description: 'Find the right audience',
    color: 'text-[#0f62fe]',
    bgColor: 'bg-[#e6f0ff]',
  },
  {
    icon: Sparkles,
    title: 'AI Creative Generator',
    description: 'Generate creatives',
    color: 'text-[#0f62fe]',
    bgColor: 'bg-[#e6f0ff]',
  },
  {
    icon: Sparkles,
    title: 'Get Recommendation',
    description: 'AI-driven campaign idea',
    color: 'text-[#0f62fe]',
    bgColor: 'bg-[#e6f0ff]',
  },
];

import { useState } from 'react';

export function QuickActions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:3001/api/campaigns/recommendations');
      const data = await res.json();
      if (data.success) {
        navigate(`/campaigns/${data.campaign.id}`);
      } else {
        alert('Failed to generate recommendation: ' + data.error);
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <CardTitle>Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              disabled={loading && action.title === 'Get Recommendation'}
              onClick={() => {
                if (action.title === 'Create Campaign') {
                  navigate('/create-campaign');
                } else if (action.title === 'Get Recommendation') {
                  handleRecommend();
                }
              }}
              className="flex items-center gap-3 text-left p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors w-full group h-[64px]"
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] ${action.bgColor} group-hover:scale-105 transition-transform`}>
                <Icon className={`h-6 w-6 ${action.color} ${loading && action.title === 'Get Recommendation' ? 'animate-spin' : ''}`} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">
                  {loading && action.title === 'Get Recommendation' ? 'Generating...' : action.title}
                </span>
                <p className="text-[11px] font-medium text-gray-500 leading-tight mt-0.5">{action.description}</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
