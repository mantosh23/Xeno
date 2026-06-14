import { apiFetch } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Send, Users, Sparkles, BarChart2, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const actions = [
  {
    icon: Send,
    title: 'Create Campaign',
    description: 'Start a new campaign',
    color: 'text-[#0f62fe]',
    bgColor: 'bg-[#e6f0ff]',
  },
  {
    icon: Video,
    title: 'Reels Idea Generator',
    description: 'Get viral video scripts',
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
];

import { useState } from 'react';
import { useCampaignStore } from '../../features/campaigns/hooks/useCampaignStore';
import { usePageCacheStore } from '../../features/dashboard/hooks/usePageCacheStore';

/**
 * QuickActions Component
 * 
 * @returns {JSX.Element}
 */
export function QuickActions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const resetCampaign = useCampaignStore((state) => state.reset);
  const clearCache = usePageCacheStore((state) => state.clearCache);


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
              onClick={() => {
                if (action.title === 'Create Campaign') {
                  resetCampaign();
                  clearCache('CreateCampaign');
                  navigate('/?view=create-campaign');
                } else if (action.title === 'Reels Idea Generator') {
                  navigate('/?view=reels-generator');
                } else if (action.title === 'AI Creative Generator') {
                  navigate('/?view=generator');
                }
              }}
              className="flex items-center gap-3 text-left p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors w-full group h-[64px]"
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] ${action.bgColor} group-hover:scale-105 transition-transform`}>
                <Icon className={`h-6 w-6 ${action.color}`} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-900 leading-tight">
                  {action.title}
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
