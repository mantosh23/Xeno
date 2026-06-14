import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ArrowRight } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export function TopCampaignCard() {
  const { campaigns } = useDashboardStore();
  const isLoading = campaigns.isLoading;
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <CardTitle>Top Performing Campaign</CardTitle>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col sm:flex-row gap-6 pt-2">
        {isLoading ? (
          <div className="flex-1 flex flex-col sm:flex-row gap-6 pt-2">
            <div className="relative h-[160px] w-full sm:w-[160px] flex-shrink-0 skeleton rounded-xl" />
            <div className="flex-1 flex flex-col justify-center py-2">
              <div className="mb-6">
                <div className="h-6 w-3/4 skeleton rounded mb-2" />
                <div className="h-4 w-1/2 skeleton rounded" />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <div className="h-3 w-16 skeleton rounded mb-2" />
                  <div className="h-5 w-12 skeleton rounded" />
                </div>
                <div>
                  <div className="h-3 w-16 skeleton rounded mb-2" />
                  <div className="h-5 w-12 skeleton rounded" />
                </div>
              </div>
            </div>
          </div>
        ) : !campaigns.list || campaigns.list.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            No campaigns created yet.
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row gap-6 pt-2">
            {/* Poster Thumbnail */}
            <div className="relative h-[160px] w-full sm:w-[160px] flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
              {campaigns.list[0].creatives && campaigns.list[0].creatives[0] ? (
                <img
                  src={campaigns.list[0].creatives[0]}
                  alt={campaigns.list[0].name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest">No Image</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">{campaigns.list[0].status || 'Draft'}</p>
                <p className="text-sm font-bold leading-tight truncate">{campaigns.list[0].name}</p>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4">
                <h4 className="text-lg font-bold text-gray-900 truncate">{campaigns.list[0].name}</h4>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {(campaigns.list[0].channels || []).join(', ')} • {new Date(campaigns.list[0].created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Audience Size</p>
                  <p className="text-lg font-bold text-gray-900">{campaigns.list[0].audience_size?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Targeting</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{campaigns.list[0].audience_type || 'All Users'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Goal</p>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]" title={campaigns.list[0].goal}>{campaigns.list[0].goal || 'Engagement'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Est. Revenue</p>
                  <p className="text-lg font-bold text-emerald-600">₹{((campaigns.list[0].potential_revenue || 0) / 100000).toFixed(1)}L</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <div className="border-t border-gray-100 p-4 flex justify-center mt-auto">
        <button className="text-sm font-semibold text-[#2563EB] flex items-center gap-2 hover:opacity-80 transition-opacity">
          View Campaign <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
