import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

/**
 * SectionHeader Component
 * 
 * @returns {JSX.Element}
 */
export function SectionHeader({ title, icon: Icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="bg-gray-100 p-2 rounded-xl">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
