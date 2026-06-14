import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCampaignDetails } from './useCampaignDetails';
import { CampaignDetailsHeader } from '../components/CampaignDetailsHeader';
import { CampaignChannelInsights } from '../components/CampaignChannelInsights';
import { CampaignStrategyBrief } from '../components/CampaignStrategyBrief';
import { CampaignCreatives } from '../components/CampaignCreatives';
import { CampaignEditModal } from '../components/CampaignEditModal';

/**
 * CampaignDetails Component
 * 
 * Refactored to use Domain-Driven Design component segregation.
 * 
 * @returns {JSX.Element}
 */
export const CampaignDetails = () => {
  const details = useCampaignDetails();

  if (details.loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
          <p className="font-semibold tracking-wider uppercase text-sm">Loading Deep Analytics...</p>
        </div>
      </div>
    );
  }

  if (details.error || !details.campaign) {
    return (
      <div className="flex-1 p-8">
        <button onClick={() => details.navigate('/campaigns')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">
          Error: {details.error || 'Campaign not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-[1458px] mx-auto w-full font-sans">
      <CampaignDetailsHeader {...details} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <CampaignChannelInsights {...details} />
        </div>
        <div className="space-y-8">
          <CampaignStrategyBrief {...details} />
          <CampaignCreatives {...details} />
        </div>
      </div>

      <CampaignEditModal {...details} />
    </div>
  );
};
