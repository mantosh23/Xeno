import { Filter, Bot, Sparkles, Loader2, X } from 'lucide-react';

export function AudienceSidebar({
  aiPrompt, setAiPrompt, handleAiFilter, isGeneratingAiFilter, aiReply,
  loyalty, setLoyalty, city, setCity, inactiveDays, setInactiveDays, minSpend, setMinSpend,
  advancedFilters, handleQuickSegment, setPage
}: any) {
  return (
    <div className="w-full md:w-64 flex-shrink-0 space-y-6">
      
      {/* AI Filter */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#0f62fe]" /> AI Filter
        </h3>
        <p className="text-[11px] text-gray-500 mb-4">Describe the audience you want to find.</p>
        <div className="space-y-3">
          <textarea 
             value={aiPrompt}
             onChange={(e) => setAiPrompt(e.target.value)}
             placeholder="e.g. Find me users in Delhi who haven't shopped in 60 days..."
             className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] transition-all resize-none shadow-sm"
             rows={3}
          />
          <button 
             onClick={handleAiFilter}
             disabled={isGeneratingAiFilter || !aiPrompt.trim()}
             className="w-full flex items-center justify-center gap-2 bg-[#0f62fe] hover:bg-[#0353e9] disabled:opacity-50 text-white font-bold py-2 rounded-lg text-[12px] transition-colors shadow-md"
          >
            {isGeneratingAiFilter ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isGeneratingAiFilter ? 'Analyzing...' : 'Apply AI Filter'}
          </button>
          {aiReply && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-[#0f62fe] border border-blue-100 animate-in fade-in slide-in-from-top-2">
              <span className="font-bold flex items-center gap-1 mb-1">
                <Bot className="h-3 w-3" /> AI Director
              </span>
              {aiReply}
            </div>
          )}
        </div>
      </div>

      {/* Normal Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#0f62fe]" /> Filter Audience
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Loyalty Tier</label>
            <select 
              value={loyalty} 
              onChange={(e) => { setLoyalty(e.target.value); setPage(1); }}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
            >
              <option value="">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">City</label>
            <select 
              value={city} 
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Inactive Days (Minimum)</label>
            <input 
              type="number" 
              placeholder="e.g. 60"
              value={inactiveDays}
              onChange={(e) => { setInactiveDays(e.target.value); setPage(1); }}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Minimum Lifetime Spend (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 5000"
              value={minSpend}
              onChange={(e) => { setMinSpend(e.target.value); setPage(1); }}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe] transition-all"
            />
          </div>

          {(city || loyalty || inactiveDays || minSpend || advancedFilters.length > 0) && (
            <button 
              onClick={() => handleQuickSegment('Clear')}
              className="w-full mt-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="h-4 w-4" /> Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#F8F9FB] rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#0f62fe]" /> AI Segments
        </h3>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => handleQuickSegment('VIP')}
            className="px-3 py-2 text-left text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#0f62fe] hover:shadow-sm transition-all"
          >
            👑 VIP Customers ({'>'}₹5k spend)
          </button>
          <button 
            onClick={() => { setAiPrompt("Find VIP customers who prefer Summer collections"); handleAiFilter(); }}
            className="px-3 py-2 text-left text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#0f62fe] hover:shadow-sm transition-all"
          >
            💤 Dormant Users ({'>'}60 days inactive)
          </button>
        </div>
      </div>
    </div>
  );
}
