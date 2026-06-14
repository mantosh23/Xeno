import { ArrowLeft, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { GoalStep } from '../../../../campaigns/pages/campaign-wizard/steps/GoalStep';
import { StrategyStep } from '../../../../campaigns/pages/campaign-wizard/steps/StrategyStep';
import { VisualsStep } from '../../../../campaigns/pages/campaign-wizard/steps/VisualsStep';
import { ChannelCreatorStep } from '../../../../campaigns/pages/campaign-wizard/steps/ChannelCreatorStep';
import { PreviewStep } from '../../../../campaigns/pages/campaign-wizard/steps/PreviewStep';
import { LaunchStep } from '../../../../campaigns/pages/campaign-wizard/steps/LaunchStep';
import { SimulatorStep } from '../../../../campaigns/pages/campaign-wizard/steps/SimulatorStep';
import { useCreateCampaign, stepLabels } from './useCreateCampaign';

/**
 * CreateCampaign Component
 * 
 * Refactored to use the `useCreateCampaign` custom hook for state management
 * and Domain-Driven Design component segregation.
 * 
 * @returns {JSX.Element}
 */
export function CreateCampaign() {
  const wizard = useCreateCampaign();
  const location = useLocation();
  const isCampaignTab = location.pathname === '/campaigns';

  return (
    <div className="flex items-start justify-center min-h-[calc(100vh-100px)] p-6 md:p-8">
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 w-full max-w-[1200px] min-h-[calc(100vh-120px)] p-8 md:p-10 relative flex flex-col">

        {/* Back button */}
        <button
          onClick={wizard.goBack}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 p-2 transition-colors rounded-full hover:bg-gray-50 flex items-center gap-1.5 z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {wizard.step === 1 
              ? (isCampaignTab ? 'Back to Campaigns' : 'Back to Dashboard')
              : wizard.step === 8 ? stepLabels[6] 
              : wizard.step === 5 ? stepLabels[2] 
              : (stepLabels[wizard.step - 1] || 'Back')}
          </span>
        </button>

        {/* ─── STEP 1: Goal Definition ─────────────────────────────────── */}
        {wizard.step === 1 && (
          <GoalStep 
            onContinue={wizard.handleContinue} 
            loading={wizard.loading} 
            error={wizard.error} 
          />
        )}

        {/* ─── STEP 2: AI Strategy Plan ─────────────────────────────────── */}
        {wizard.step === 2 && wizard.store.strategy && (
          <StrategyStep
            onContinue={wizard.handleLoadInsights}
            loading={wizard.loading}
            error={wizard.error}
            onRegenerate={wizard.handleContinue}
            chatInput={wizard.chatInputStep2}
            setChatInput={wizard.setChatInputStep2}
            onSendChat={wizard.handleSendChatStep2}
            onToggleChannel={wizard.toggleChannel}
            chatHistory={wizard.chatHistoryStep2}
          />
        )}

        {/* ─── STEP 6: AI Channel Creator ───────────────────────────────── */}
        {wizard.step === 6 && (
          <ChannelCreatorStep
            onContinue={() => wizard.store.setStep(8)}
            activeChannelTab={wizard.activeChannelTab}
            setActiveChannelTab={wizard.setActiveChannelTab}
            channelMessages={wizard.channelMessages}
            setChannelMessages={wizard.setChannelMessages}
            chatHistory={wizard.chatHistoryStep6}
            chatInput={wizard.chatInputStep6}
            setChatInput={wizard.setChatInputStep6}
            onTweakContent={wizard.handleTweakContent}
            loading={wizard.loading}
            textExpanded={wizard.textExpanded}
            setTextExpanded={wizard.setTextExpanded}
          />
        )}

        {/* ─── STEP 5: Campaign Creatives ───────────────────────────── */}
        {wizard.step === 5 && (
          <VisualsStep
            onContinue={wizard.handleGenerateContent}
            loading={wizard.loading}
            error={wizard.error}
            creativePrompt={wizard.creativePrompt}
            setCreativePrompt={wizard.setCreativePrompt}
            onGenerateCreatives={wizard.handleGenerateCreatives}
            chatHistory={wizard.chatHistory}
            setPreviewImage={wizard.setPreviewImage}
          />
        )}

        {/* ─── STEP 8: Campaign Preview ─────────────────────────────────── */}
        {wizard.step === 8 && (
          <PreviewStep
            onSaveDraft={wizard.handleSaveDraft}
            onLaunch={() => wizard.store.setStep(9)}
            loading={wizard.loading}
            error={wizard.error}
          />
        )}

        {/* ─── STEP 9: Launch Campaign ──────────────────────────────────── */}
        {wizard.step === 9 && (
          <LaunchStep onLaunch={wizard.handleLaunch} loading={wizard.loading} error={wizard.error} />
        )}

        {/* ─── STEP 10: Channel Simulator ───────────────────────────────── */}
        {wizard.step === 10 && <SimulatorStep />}

      </div>

      {/* Fullscreen Image Preview Modal */}
      {wizard.previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => wizard.setPreviewImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={wizard.previewImage.startsWith('http') || wizard.previewImage.startsWith('data:') || wizard.previewImage.startsWith('blob:') ? wizard.previewImage : `data:image/jpeg;base64,${wizard.previewImage}`} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200" 
            alt="Preview" 
          />
        </div>
      )}
    </div>
  );
}
