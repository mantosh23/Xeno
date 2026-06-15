import { Menu, User } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useLayoutStore } from '../../hooks/useLayoutStore';

/**
 * TopHeader Component
 * 
 * @param {{ setMobileMenuOpen: (open: boolean) => void }} props
 * @returns {JSX.Element}
 */
export function TopHeader({ setMobileMenuOpen }: { setMobileMenuOpen: (open: boolean) => void }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const { isSidebarExpanded } = useLayoutStore();

  let title = 'Dashboard';
  let subtitle = "Welcome back. Here's what's happening with your marketing.";

  if (location.pathname === '/campaigns') {
    title = 'Campaigns';
    subtitle = 'Manage and track your AI-driven marketing campaigns.';
  } else if (location.pathname.startsWith('/campaigns/')) {
    title = 'Campaign Details';
    subtitle = 'Deep dive into campaign performance and analytics.';
  } else if (location.pathname === '/create-campaign' || view === 'create-campaign') {
    title = 'Create Campaign';
    subtitle = 'Design and launch a new AI-driven marketing campaign.';
  } else if (location.pathname === '/audience') {
    title = 'Audience';
    subtitle = 'Manage your customer segments and insights.';
  } else if (location.pathname.startsWith('/strategy')) {
    title = 'Strategy Planner';
    subtitle = 'Use AI to build campaigns and discover audience segments.';
  } else if (location.pathname.startsWith('/automations')) {
    title = 'Automations';
    subtitle = 'Design and manage background workflows to engage your audience.';
  } else if (location.pathname === '/integrations') {
    title = 'Integrations';
    subtitle = 'Manage your marketing channel integrations.';
  } else if (location.pathname === '/' && view === 'generator') {
    title = 'AI Creative Generator';
    subtitle = 'Generate stunning, conversion-optimized visuals for your campaigns instantly.';
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 flex h-[72px] items-center justify-between border-b border-white/50 bg-white/70 px-4 sm:px-6 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out md:left-[80px] ${isSidebarExpanded ? 'md:left-[240px]' : ''}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden text-gray-500 hover:text-gray-900 -ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          type="button"
        >
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-500">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-none">Admin</p>
            <p className="text-xs text-gray-500 mt-1">Marketing OS</p>
          </div>
        </div>
      </div>
    </header>
  );
}
