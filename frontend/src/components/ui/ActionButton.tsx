import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ActionButtonProps Interface
 * 
 * Defines the structure for ActionButtonProps.
 */
export interface ActionButtonProps {
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * ActionButton Component
 * 
 * @returns {JSX.Element}
 */
export function ActionButton({
  loading,
  onClick,
  children,
  className = '',
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold text-[12px] transition-all shadow-md active:scale-95 ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
