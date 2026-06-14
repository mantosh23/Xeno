import { Target, Users, DollarSign } from 'lucide-react';

export function CampaignStrategyBrief({ campaign }: any) {
  const { strategy } = campaign;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Target className="h-5 w-5 text-[#2563EB]" />
        Strategy Brief
      </h3>
      
      <div className="space-y-6">
        {campaign.offer && (
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Offer / Value Prop</p>
            <p className="text-sm font-medium text-gray-900 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-gray-100">{campaign.offer}</p>
          </div>
        )}

        {campaign.channels && campaign.channels.length > 0 && (
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Selected Channels</p>
            <div className="flex flex-wrap gap-2">
              {campaign.channels.map((channel: string) => (
                <span key={channel} className="px-3 py-1.5 bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold rounded-lg shadow-sm">
                  {channel}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Audience</p>
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
              <Users className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{campaign.audience_size ? campaign.audience_size.toLocaleString() : '—'}</p>
              <p className="text-[11px] font-semibold text-gray-500">Matching customers</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Revenue</p>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600">₹{(campaign.potential_revenue ? (campaign.potential_revenue / 100000).toFixed(1) : '0')}L</p>
              <p className="text-[11px] font-semibold text-emerald-700/70">Potential impact</p>
            </div>
          </div>
        </div>
        
        {strategy?.summary && (
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">AI Reasoning</p>
            <p className="text-sm font-medium text-gray-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-gray-100">{strategy.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
