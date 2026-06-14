import { X, Loader2, Save } from 'lucide-react';

export function CampaignEditModal({
  isEditModalOpen, setIsEditModalOpen, editForm, setEditForm, handleSaveCampaign, isSaving
}: any) {
  if (!isEditModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-black text-gray-900">Edit Campaign</h2>
          <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-white hover:shadow-sm transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Name</label>
            <input 
              type="text" 
              value={editForm.name} 
              onChange={(e) => setEditForm((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white text-sm font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Goal</label>
            <textarea 
              value={editForm.goal} 
              onChange={(e) => setEditForm((prev: any) => ({ ...prev, goal: e.target.value }))}
              rows={3}
              className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white text-sm font-medium resize-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select 
              value={editForm.status} 
              onChange={(e) => setEditForm((prev: any) => ({ ...prev, status: e.target.value }))}
              className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white text-sm font-bold appearance-none transition-all cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveCampaign}
            disabled={isSaving}
            className="px-6 py-3 text-sm font-bold text-white bg-[#2563EB] border border-transparent rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
