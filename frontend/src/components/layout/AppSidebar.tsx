import {
  LayoutDashboard,
  Users,
  Megaphone,
  Zap,
  BarChart2,
  Smartphone,
  Bot,
  Settings,
  Target,
  Link2,
  Sparkles,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/utils';
import { useStrategyStore } from '../../features/strategy/hooks/useStrategyStore';
import { useAuthStore } from '../../features/auth/hooks/useAuthStore';
import { usePageCacheStore } from '../../features/dashboard/hooks/usePageCacheStore';
import { SettingsModal } from "../../features/settings/pages/Settings";
import logoUrl from '../../assets/stylehive_logo.png';
import { useLayoutStore } from '../../hooks/useLayoutStore';

const navItems = [
  { icon: Sparkles, label: 'New Chat', path: '/strategy' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Audience', path: '/audience' },
  { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
  { icon: Zap, label: 'Automations', path: '/automations' },
  // { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  // { icon: Smartphone, label: 'Channel Simulator', path: '/simulator' },
  // { icon: Bot, label: 'AI Assistant', path: '/assistant' },
];

/**
 * AppSidebar Component
 * 
 * @param {{ isMobileMenuOpen: boolean, setMobileMenuOpen: (open: boolean) => void }} props
 * @returns {JSX.Element}
 */
export function AppSidebar({ isMobileMenuOpen, setMobileMenuOpen }: { isMobileMenuOpen: boolean, setMobileMenuOpen: (open: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessions, fetchSessions, deleteSession } = useStrategyStore();
  const { signOut, session } = useAuthStore();
  const { getCache, setCache } = usePageCacheStore();
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const urlSessionId = location.pathname.startsWith('/strategy/') ? location.pathname.split('/strategy/')[1] : null;

  useEffect(() => {
    if (session) {
      fetchSessions();
    }
  }, [fetchSessions, session]);

  useEffect(() => {
    if (location.pathname === '/') {
      setCache('dashboardSearch', location.search);
    } else if (location.pathname === '/campaigns') {
      setCache('campaignsSearch', location.search);
    }
  }, [location.pathname, location.search]);

  const handleLoadChat = (id: string) => {
    navigate(`/strategy/${id}`);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const success = await deleteSession(id);
    if (success && urlSessionId === id) {
      navigate('/strategy');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 z-50 h-screen flex-col border-r border-gray-100 bg-white flex transition-all duration-300 ease-in-out",
        isSidebarExpanded ? "w-[240px]" : "w-[240px] md:w-[80px]",
        isMobileMenuOpen ? "left-0" : "-left-[240px] md:left-0"
      )}>
        {/* Toggle Button (Desktop Only) */}
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-900 shadow-sm z-50 transition-colors"
        >
          {isSidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

      {/* Logo Section */}
      <div className={cn("flex shrink-0 items-center border-b border-gray-100 py-6", !isSidebarExpanded ? "md:justify-center px-6 md:px-0 h-[80px]" : "h-[80px] px-6 gap-3")}>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 shadow-sm">
          <img src={logoUrl} alt="StyleHive Logo" className="absolute w-[180%] max-w-[180%] h-auto top-[-20%]" />
        </div>
        <div className={cn("flex flex-col justify-center animate-in fade-in duration-200", !isSidebarExpanded && "md:hidden")}>
          <h1 className="text-base font-bold text-gray-900 leading-tight">StyleHive</h1>
          <p className="text-[9px] text-gray-500 font-medium">AI Marketing OS</p>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className={cn("flex-1 flex flex-col overflow-y-auto custom-scrollbar", !isSidebarExpanded && "md:overflow-visible")}>
        {/* Navigation */}
        <nav className={cn("space-y-[2px] py-2", !isSidebarExpanded ? "md:px-2 px-4" : "px-4")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label !== 'New Chat' && (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
          
          let targetPath = item.path;
          if (item.label === 'Dashboard') {
            if (isActive) {
              targetPath = '/';
            } else {
              targetPath = '/' + (getCache('dashboardSearch') || '');
            }
          } else if (item.label === 'Campaigns') {
            if (isActive) {
              targetPath = '/campaigns';
            } else {
              targetPath = '/campaigns' + (getCache('campaignsSearch') || '');
            }
          }

          return (
            <Link
              key={item.label}
              to={targetPath}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition-colors',
                !isSidebarExpanded ? 'md:justify-center md:px-0 px-3' : 'px-3',
                isActive
                  ? 'bg-[#0f62fe] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0 stroke-[2px]', isActive ? 'text-white' : 'text-slate-500')} />
              <span className={cn("truncate", !isSidebarExpanded && "md:hidden")}>{item.label}</span>
              
              <div className={cn("absolute left-full ml-4 z-50 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl", isSidebarExpanded ? "hidden" : "hidden md:group-hover:block")}>
                {item.label}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Chat History Section */}
        <div className={cn("p-4 border-t border-gray-100 bg-gray-50/50 flex-1", !isSidebarExpanded && "md:hidden")}>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Past Chats</div>
          <div className="space-y-1">
            {sessions.map(session => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => {
                    handleLoadChat(session.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all pr-10 ${urlSessionId === session.id ? 'bg-[#0f62fe] text-white shadow-sm' : 'hover:bg-white border border-transparent'}`}
                >
                  <div className={`text-sm font-semibold truncate ${urlSessionId === session.id ? 'text-white' : 'text-gray-600'}`}>
                    {session.title}
                  </div>
                </button>
                <button
                  onClick={(e) => handleDeleteChat(e, session.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">No past chats yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">


        <div className={cn("space-y-1", !isSidebarExpanded && "md:px-2")}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn("group relative w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors", !isSidebarExpanded ? "md:justify-center md:px-0 px-3" : "px-3")}
          >
            <Settings className="h-5 w-5 shrink-0 stroke-[2px] text-slate-500" />
            <span className={cn(!isSidebarExpanded && "md:hidden")}>Settings</span>
            
            <div className={cn("absolute left-full ml-4 z-50 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl", isSidebarExpanded ? "hidden" : "hidden md:group-hover:block")}>
              Settings
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          </button>
          <button
            onClick={() => signOut()}
            className={cn("group relative w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors", !isSidebarExpanded ? "md:justify-center md:px-0 px-3" : "px-3")}
          >
            <LogOut className="h-5 w-5 shrink-0 stroke-[2px] text-red-500" />
            <span className={cn(!isSidebarExpanded && "md:hidden")}>Logout</span>
            
            <div className={cn("absolute left-full ml-4 z-50 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl", isSidebarExpanded ? "hidden" : "hidden md:group-hover:block")}>
              Logout
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </aside>
    </>
  );
}
