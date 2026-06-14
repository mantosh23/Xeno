import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
}

/**
 * ErrorBanner Component
 * 
 * @returns {JSX.Element}
 */
export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-[11px] font-semibold text-red-600">{message}</span>
    </div>
  );
}
