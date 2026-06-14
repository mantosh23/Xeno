import React from 'react';
import { Rocket } from 'lucide-react';
import { useCampaignStore } from '../../../hooks/useCampaignStore';
import { ActionButton } from '../../../../../components/ui/ActionButton';
import { ErrorBanner } from '../../../../../components/ui/ErrorBanner';

interface LaunchStepProps {
  onLaunch: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * LaunchStep Component
 * 
 * @returns {JSX.Element}
 */
export function LaunchStep({ onLaunch, loading, error }: LaunchStepProps) {
  const store = useCampaignStore();

  return (
    <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">Launch Campaign</h2>
      <div className="flex flex-col bg-[#F8F9FB] rounded-[20px] p-8 border border-gray-100 items-center text-center">
        <div className="relative mb-6 mt-4">
          {[
            'w-1.5 h-1.5 bg-blue-400 -top-4 -left-4',
            'w-2 h-2 bg-pink-400 top-0 -right-6',
            'w-1.5 h-1.5 bg-yellow-400 bottom-4 -left-8',
            'w-2 h-2 bg-green-400 -bottom-2 -right-2',
            'w-1.5 h-1.5 bg-purple-400 -top-8 right-4',
          ].map((cls, i) => (
            <div key={i} className={`rounded-full absolute animate-pulse opacity-70 ${cls}`} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          <div className="w-28 h-28 bg-[#2563EB] rounded-full flex items-center justify-center shadow-lg shadow-[#2563EB]/30 hover:scale-105 transition-transform duration-300">
            <Rocket className="h-12 w-12 text-white ml-2 mb-2" strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-[18px] font-bold text-gray-900 mb-6">Your campaign is ready to launch!</h3>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 w-full max-w-[400px] mb-8 text-left">
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {[
              { label: 'Campaign Name', val: store.strategy?.campaign_name || 'Winback – Summer 25' },
              { label: 'Audience Size', val: store.audienceResult?.count.toLocaleString('en-IN') || '0' },
              { label: 'Channels', val: `${(store.strategy?.recommended_channels || []).length} Channels` },
              { label: 'Estimated Reach', val: `${(((store.audienceResult?.count || 0) * 8) / 1000).toFixed(0)}K+` },
            ].map(({ label, val }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-gray-500">{label}</span>
                <span className="text-[13px] font-bold text-gray-900">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="w-full max-w-[400px] mb-4"><ErrorBanner message={error} /></div>}

        <ActionButton loading={loading} onClick={onLaunch} className="w-full max-w-[400px] justify-center py-3.5 text-[14px] mb-5">
          {loading ? 'Saving to Database…' : <><Rocket className="h-4 w-4 group-hover:-translate-y-1 transition-transform" /> Launch Campaign</>}
        </ActionButton>
        <span className="text-[11px] font-medium text-gray-500">Campaign will be saved to your Supabase database.</span>
      </div>
    </div>
  );
}
