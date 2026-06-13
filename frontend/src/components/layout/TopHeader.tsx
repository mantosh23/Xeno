import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function TopHeader() {
  const location = useLocation();

  let title = 'Dashboard';
  let subtitle = "Welcome back, Sarah. Here's what's happening with your marketing.";

  if (location.pathname === '/campaigns') {
    title = 'Campaigns';
    subtitle = 'Manage and track your AI-driven marketing campaigns.';
  } else if (location.pathname === '/create-campaign') {
    title = 'Create Campaign';
    subtitle = 'Design and launch a new AI-driven marketing campaign.';
  } else if (location.pathname === '/audience') {
    title = 'Audience';
    subtitle = 'Manage your customer segments and insights.';
  } else if (location.pathname.startsWith('/strategy')) {
    title = 'Strategy Planner';
    subtitle = 'Use AI to build campaigns and discover audience segments.';
  } else if (location.pathname === '/integrations') {
    title = 'Integrations';
    subtitle = 'Manage your marketing channel integrations.';
  }

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[240px] z-30 flex h-[72px] items-center justify-between border-b border-white/50 bg-white/70 px-6 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-500 hover:text-gray-900">
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <p className="hidden text-sm text-gray-500 sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Sarah Mehta"
            className="h-9 w-9 rounded-full border border-gray-100 object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-none">Sarah Mehta</p>
            <p className="text-xs text-gray-500 mt-1">Marketing Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
