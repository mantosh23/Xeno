import React from 'react';
import { ArrowRight, Check, Loader2, RotateCw } from 'lucide-react';
import { useCampaignStore } from '../../../hooks/useCampaignStore';
import { useNavigate } from 'react-router-dom';

/**
 * SimulatorStep Component
 * 
 * @returns {JSX.Element}
 */
export function SimulatorStep() {
  const store = useCampaignStore();
  const navigate = useNavigate();

  const channels = store.strategy?.recommended_channels || ['WhatsApp', 'Instagram', 'Email', 'Facebook', 'SMS'];

  return (
    <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">Channel Simulator</h2>
      {store.savedCampaignId && (
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <Check className="h-4 w-4 text-green-600" strokeWidth={3} />
          <span className="text-[11px] font-bold text-green-700">Campaign #{store.savedCampaignId} saved to Supabase! Simulating delivery…</span>
        </div>
      )}
      <div className="flex flex-col bg-[#F8F9FB] rounded-[20px] p-5 border border-gray-100">
        <h3 className="text-[16px] font-bold text-gray-900">Channel Service Simulator</h3>
        <p className="text-[12px] font-medium text-gray-500 mt-0.5 mb-4">Simulating delivery, opens, clicks & conversions.</p>

        <div className="flex gap-2 mb-4">
          <button className="bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-4 py-1.5 rounded-lg text-[12px] font-bold shadow-sm">Live Events</button>
          <button className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-1.5 rounded-lg text-[12px] font-bold shadow-sm">Event Log</button>
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4">
          {/* Live events */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-50">
              <span className="text-[11px] font-bold text-[#2563EB]">Live Events</span>
            </div>
            <div className="flex flex-col p-2 text-[11px] h-[180px] overflow-y-auto">
              {store.simulatorEvents.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                </div>
              ) : (
                store.simulatorEvents.map((ev, i) => (
                  <div key={i} className="grid grid-cols-4 px-2 py-1.5 hover:bg-gray-50 rounded text-gray-700 gap-1">
                    <span className="text-gray-400 text-[10px]">{ev.time}</span>
                    <span className="font-semibold text-[10px]">{ev.channel}</span>
                    <span className="text-[10px]">{ev.event}</span>
                    <span className="text-[10px] truncate">{ev.customer}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Channel status bars */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <span className="text-[12px] font-bold text-gray-900 mb-3 block">Channel Status</span>
            <div className="flex flex-col gap-3.5">
              {Object.entries(
                store.channelStatus && Object.keys(store.channelStatus).length > 0
                  ? store.channelStatus
                  : (channels.reduce((a, ch) => ({ ...a, [ch]: 0 }), {}))
              ).map(([ch, pct]) => (
                <div key={ch} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px] font-semibold">
                    <span className="text-gray-800">{ch}</span>
                    <span className="text-gray-900">{pct as number}%</span>
                  </div>
                  <span className="text-[9px] font-medium text-gray-400 -mt-0.5 mb-0.5">Sending…</span>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FB] rounded-xl p-3 border border-gray-100 flex items-center gap-2 mb-4">
          <RotateCw className="h-4 w-4 text-gray-400 ml-1" />
          <span className="text-[11px] font-medium text-gray-600">All events are simulated and sent back to CRM via callbacks.</span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-bold text-[12px] shadow-md active:scale-95"
          >
            View Live Campaign <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
