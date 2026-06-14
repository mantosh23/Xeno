import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { useCampaignStore } from '../../../hooks/useCampaignStore';

interface GoalStepProps {
  onContinue: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * GoalStep Component
 * 
 * @returns {JSX.Element}
 */
export function GoalStep({ onContinue, loading, error }: GoalStepProps) {
  const store = useCampaignStore();
  const goalRef = useRef<HTMLTextAreaElement>(null);

  const handleGoalChange = (goal: string) => {
    if (goalRef.current) goalRef.current.value = goal;
    store.setGoal(goal);
  };

  const handleNext = () => {
    const goal = goalRef.current?.value?.trim() || store.goal || "I want to bring back customers who purchased before but haven't shopped recently.";
    store.setGoal(goal);
    onContinue();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 mt-6 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
      {/* Left Side: Input */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-[24px] leading-tight font-bold text-[#0F172A] tracking-tight">
            What's your marketing goal today?
          </h2>
          <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#7C3AED] border border-[#DBEAFE]">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold tracking-wide uppercase">AI Assistant</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2 flex-1">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Describe your goal in simple words...
          </label>
          <textarea
            ref={goalRef}
            defaultValue={store.goal}
            className="w-full flex-1 min-h-[200px] p-4 rounded-[16px] border border-gray-200 text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] resize-none font-medium text-[13px] leading-relaxed shadow-sm placeholder-gray-400"
            placeholder="I want to bring back customers who purchased before but haven't shopped recently."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
            <span className="text-[11px] font-semibold text-red-600">{error}</span>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleNext}
            className="flex items-center gap-2 bg-[#0f62fe] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#0f62fe]/90 transition-all disabled:opacity-50 shadow-md"
          >
            {loading ? 'Thinking…' : 'Continue'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>

      {/* Right Side: Popular Goals */}
      <div className="flex-1 lg:max-w-[400px] flex flex-col gap-4 lg:border-l lg:border-gray-100 lg:pl-10 lg:pt-2">
        <h3 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
          <Compass className="h-4 w-4 text-gray-400" /> Popular Goals
        </h3>
        <div className="flex flex-col gap-2.5">
          {[
            'Increase repeat purchases',
            'Promote new collection',
            'Clear old inventory',
            'Win back inactive customers',
          ].map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalChange(goal)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-[#FCFBFF] hover:bg-[#EFF6FF] hover:border-[#DBEAFE] transition-all text-left group shadow-sm"
            >
              <span className="text-[12px] font-semibold text-gray-700 group-hover:text-[#7C3AED] transition-colors">
                "{goal}"
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
