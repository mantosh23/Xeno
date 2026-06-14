import { Sparkles } from 'lucide-react';
import { useStatsStore } from '../../features/dashboard/hooks/useStatsStore';

/**
 * AIOpportunityBanner Component
 * 
 * @returns {JSX.Element}
 */
export function AIOpportunityBanner() {
  const stats = useStatsStore((s) => s.stats);
  
  // Format the values cleanly
  const formattedCount = new Intl.NumberFormat('en-IN').format(stats.inactiveCount || 0);
  const formattedRevenue = `₹${((stats.opportunityRevenue || 0) / 100000).toFixed(1)} Lakhs`;
  return (
    <div className="w-full rounded-2xl bg-[#F5F3FF] p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <Sparkles className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-lg">AI Opportunity</h3>
          </div>
          <p className="text-gray-700 font-medium">
            {formattedCount} dormant high-value customers haven't purchased in 60+ days.
          </p>
          <p className="text-purple-700 font-semibold mt-1">
            Potential recovery revenue: {formattedRevenue}
          </p>
        </div>
      </div>
      <button className="flex-shrink-0 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors">
        Create AI Campaign
      </button>
    </div>
  );
}
