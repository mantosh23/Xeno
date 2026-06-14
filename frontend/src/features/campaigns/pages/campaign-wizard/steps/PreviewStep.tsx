import React from 'react';
import { ArrowRight, Loader2, Sparkles, MessageCircle, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiInstagram, FiFacebook } from 'react-icons/fi';
import { useCampaignStore } from '../../../hooks/useCampaignStore';
import { ErrorBanner } from '../../../../../components/ui/ErrorBanner';

interface ActionButtonProps {
  loading?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

function ActionButton({ loading, onClick, className, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {!loading && children}
    </button>
  );
}

interface PreviewStepProps {
  onSaveDraft: () => void;
  onLaunch: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * PreviewStep Component
 * 
 * @returns {JSX.Element}
 */
export function PreviewStep({ onSaveDraft, onLaunch, loading, error }: PreviewStepProps) {
  const store = useCampaignStore();

  return (
    <div className="flex flex-col gap-4 mt-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-bold text-[#2563EB] tracking-tight">Campaign Preview</h2>
        <div className="flex gap-3">
          <button 
            onClick={onSaveDraft}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 px-5 py-2 rounded-xl font-bold text-[12px] shadow-sm transition-all active:scale-95"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save as Draft
          </button>
          <ActionButton loading={loading} onClick={onLaunch} className="px-5 py-2 rounded-xl text-[12px] shadow-md">
            Approve & Launch <ArrowRight className="h-4 w-4" />
          </ActionButton>
        </div>
      </div>
      <div className="flex flex-col bg-[#F8F9FB] rounded-xl p-4 border border-gray-100">
        <div className="flex flex-col gap-3 mb-3">
          {/* 1. Overview & Channels */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-4 w-4 text-[#2563EB]" />
                  <h4 className="text-[13px] font-bold text-gray-900">Overview</h4>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed max-w-[500px]">
                  {store.strategy?.summary || 'This campaign targets your inactive customers with a compelling winback offer across multiple channels to drive re-engagement and conversions.'}
                </p>
              </div>
              <div className="flex flex-col md:items-end shrink-0">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Selected Channels</h4>
                <div className="flex flex-wrap gap-2 justify-end max-w-[280px]">
                  {(store.strategy?.recommended_channels || ['WhatsApp', 'Instagram', 'Facebook', 'Email']).map((channel: string) => {
                    const getIcon = () => {
                      if (channel === 'WhatsApp') return <FaWhatsapp className="h-3 w-3 text-[#25D366]" />;
                      if (channel === 'Instagram') return <FiInstagram className="h-3 w-3 text-[#E1306C]" />;
                      if (channel === 'Facebook') return <FiFacebook className="h-3 w-3 text-[#1877F2]" />;
                      if (channel === 'Email') return <Mail className="h-3 w-3 text-gray-500" />;
                      return <MessageCircle className="h-3 w-3 text-gray-500" />;
                    };
                    return (
                      <div key={channel} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAFAFA] border border-gray-200 rounded-md shadow-sm">
                        {getIcon()}
                        <span className="text-[10px] font-bold text-gray-800">{channel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key Metrics & Details */}
          <div className="grid grid-cols-3 gap-3">
            {/* Row 1 */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Campaign Name</span>
              <span className="text-[14px] font-bold text-gray-900 mt-0.5 truncate">{store.strategy?.campaign_name || 'Winback Campaign'}</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Primary Goal</span>
              <span className="text-[14px] font-bold text-gray-900 mt-0.5 truncate capitalize">{store.goal || 'Reactivate Users'}</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Audience Rule</span>
              <span className="text-[14px] font-bold text-gray-900 mt-0.5 truncate">&gt; {store.audienceCriteria?.inactive_days || 60} days inactive</span>
            </div>

            {/* Row 2 */}
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Target Audience</span>
              <span className="text-[15px] font-bold text-gray-900 mt-0.5">{store.audienceResult?.count.toLocaleString('en-IN') || 0} <span className="text-[10px] text-gray-500 font-medium">Users</span></span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Core Offer</span>
              <span className="text-[15px] font-bold text-[#2563EB] mt-0.5">{store.strategy?.recommended_offer || '25% OFF'}</span>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Est. Revenue</span>
              <span className="text-[15px] font-bold text-[#10B981] mt-0.5">₹{(store.audienceResult?.potential_revenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
    </div>
  );
}
