import { KPISection } from '../../../components/dashboard/KPISection';
import { CampaignPerformance } from '../../../components/dashboard/CampaignPerformance';
import { ChannelPerformance } from '../../../components/dashboard/ChannelPerformance';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { TopCampaignCard } from '../../../components/dashboard/TopCampaignCard';
import { RecentActivity } from '../../../components/dashboard/RecentActivity';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStatsStore } from '../hooks/useStatsStore';
import { useCampaignsListStore } from '../../campaigns/hooks/useCampaignsListStore';
import { useAnalyticsStore } from '../hooks/useAnalyticsStore';
import { CreativeGenerator } from './quick-actions/creative-generator/CreativeGenerator';
import { CreateCampaign } from './quick-actions/create-campaign/CreateCampaign';
import { ReelsGenerator } from './quick-actions/reels-generator/ReelsGenerator';

/**
 * Dashboard Component
 * 
 * @returns {JSX.Element}
 */
export function Dashboard() {
  const fetchStats = useStatsStore((s) => s.fetchStats);
  const fetchCampaigns = useCampaignsListStore((s) => s.fetchCampaigns);
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics);
  
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  useEffect(() => {
    fetchStats();
    fetchCampaigns();
    fetchAnalytics();
  }, [fetchAnalytics, fetchStats, fetchCampaigns]);

  if (view === 'generator') {
    return <CreativeGenerator />;
  }

  if (view === 'create-campaign') {
    return <CreateCampaign />;
  }

  if (view === 'reels-generator') {
    return <ReelsGenerator />;
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-[1458px] mx-auto w-full gap-4">
      <KPISection />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-4">
        <div className="min-h-[380px] lg:col-span-2 xl:col-span-1">
          <CampaignPerformance />
        </div>
        <div className="min-h-[380px]">
          <ChannelPerformance />
        </div>
        <div className="min-h-[380px] lg:col-span-2 xl:col-span-1">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)] gap-4">
        <div className="min-h-[335px]">
          <TopCampaignCard />
        </div>
        <div className="min-h-[335px]">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
