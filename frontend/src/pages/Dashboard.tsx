import { KPISection } from '../components/dashboard/KPISection';
import { CampaignPerformance } from '../components/dashboard/CampaignPerformance';
import { ChannelPerformance } from '../components/dashboard/ChannelPerformance';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TopCampaignCard } from '../components/dashboard/TopCampaignCard';
import { AIInsights } from '../components/dashboard/AIInsights';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

export function Dashboard() {
  const { fetchAnalytics, fetchStats, fetchCampaigns } = useDashboardStore();

  useEffect(() => {
    fetchStats();
    fetchCampaigns();
    fetchAnalytics();
  }, [fetchAnalytics, fetchStats, fetchCampaigns]);

  return (
    <div className="flex flex-col p-6 max-w-[1458px] mx-auto w-full gap-4">
      <KPISection />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-4">
        <div className="h-[380px] lg:col-span-2 xl:col-span-1">
          <CampaignPerformance />
        </div>
        <div className="h-[380px]">
          <ChannelPerformance />
        </div>
        <div className="h-[380px] lg:col-span-2 xl:col-span-1">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        <div className="h-[335px] lg:col-span-2 xl:col-span-1">
          <TopCampaignCard />
        </div>
        <div className="h-[335px]">
          <AIInsights />
        </div>
        <div className="h-[335px] lg:col-span-2 xl:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
