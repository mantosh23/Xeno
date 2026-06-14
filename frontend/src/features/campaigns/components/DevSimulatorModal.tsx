import React, { useState } from 'react';
import { X, SlidersHorizontal, Activity, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../../services/api';

export function DevSimulatorModal({ campaign, isOpen, onClose }: any) {
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !campaign) return null;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      await apiFetch(`/api/campaigns/${campaign.id}/simulate?count=${count}`);
      toast.success(`Simulation launched with ${count} events!`);
      onClose();
    } catch (e: any) {
      toast.error(`Simulation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-200/50 shadow-sm">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Dev Meter Simulator</h2>
              <p className="text-[12px] font-medium text-gray-500">Inject custom engagement events</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[13px] font-bold text-gray-700">Events to Simulate</label>
              <span className="text-[16px] font-black text-indigo-600">{count}</span>
            </div>
            
            <input 
              type="range" 
              min="10" 
              max={campaign.audience_size > 0 ? campaign.audience_size : 5000} 
              step="10"
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            
            <div className="flex justify-between text-[11px] font-bold text-gray-400">
              <span>10</span>
              <span>{campaign.audience_size > 0 ? campaign.audience_size : 5000}</span>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <Activity className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-800 font-medium leading-relaxed">
              This will generate <strong>{count}</strong> random engagement events (Sends, Opens, Clicks, Purchases) and stream them into the dashboard in real-time.
            </p>
          </div>
        </div>

        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors text-[13px]"
          >
            Cancel
          </button>
          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-[13px] shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-70 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
}
