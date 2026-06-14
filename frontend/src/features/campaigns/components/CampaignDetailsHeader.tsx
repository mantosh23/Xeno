import { ArrowLeft, Calendar, Loader2, Activity, X } from 'lucide-react';

export function CampaignDetailsHeader({ campaign, isSimulating, handleSimulate, navigate }: any) {
  return (
    <>
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium text-[13px]">
        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
      </button>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
              campaign.status === 'Active' || campaign.status === 'active' ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]' : 'bg-[#F1F5F9] text-slate-600 border border-slate-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full mr-2 ${campaign.status === 'Active' || campaign.status === 'active' ? 'bg-[#10B981] animate-pulse' : 'bg-slate-400'}`} />
              {campaign.status || 'Draft'}
            </span>
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{campaign.name || 'Untitled Campaign'}</h1>
        </div>
        
        <div className="flex gap-2 flex-wrap justify-end">
          <button className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors text-xs flex items-center gap-2">
            <X className="h-3 w-3" />
            Stop Campaign
          </button>

          <button 
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-4 py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1D4ED8] disabled:opacity-70 transition-all text-xs flex items-center gap-2">
            {isSimulating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
            {isSimulating ? 'Simulating...' : 'Live Simulator'}
          </button>
        </div>
      </div>
    </>
  );
}
