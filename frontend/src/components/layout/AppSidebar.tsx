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
 * @returns {JSX.Element}
 */
export function AppSidebar() {
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
    <aside className={cn(
      "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-gray-100 bg-white md:flex transition-all duration-300 ease-in-out",
      isSidebarExpanded ? "w-[240px]" : "w-[80px]"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-900 shadow-sm z-50 transition-colors"
      >
        {isSidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Logo Section */}
      <div className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-6' : 'justify-center px-0'} py-6 h-[80px]`}>
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 shadow-sm">
          <img src={logoUrl} alt="StyleHive Logo" className="absolute w-[180%] max-w-[180%] h-auto top-[-20%]" />
        </div>
        {isSidebarExpanded && (
          <div className="flex flex-col justify-center animate-in fade-in duration-200">
            <h1 className="text-base font-bold text-gray-900 leading-tight">StyleHive</h1>
            <p className="text-[9px] text-gray-500 font-medium">AI Marketing OS</p>
          </div>
        )}
      </div>

      {/* Scrollable Area */}
      <div className={cn("flex-1 flex flex-col", isSidebarExpanded ? "overflow-y-auto custom-scrollbar" : "overflow-visible")}>
        {/* Navigation */}
        <nav className={`space-y-[2px] py-2 ${isSidebarExpanded ? 'px-4' : 'px-2'}`}>
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
              className={cn(
                'group relative flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold transition-colors',
                isSidebarExpanded ? 'px-3' : 'justify-center px-0',
                isActive
                  ? 'bg-[#0f62fe] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0 stroke-[2px]', isActive ? 'text-white' : 'text-slate-500')} />
              {isSidebarExpanded && <span className="truncate">{item.label}</span>}
              {!isSidebarExpanded && (
                <div className="absolute left-full ml-4 hidden group-hover:block z-50 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Chat History Section */}
      {isSidebarExpanded && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Past Chats</div>
          <div className="space-y-1">
            {sessions.map(session => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => handleLoadChat(session.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all pr-10 ${urlSessionId === session.id ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-white border border-transparent'}`}
                >
                  <div className={`text-sm font-semibold truncate ${urlSessionId === session.id ? 'text-[#0f62fe]' : 'text-gray-600'}`}>
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
      )}
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">


        <div className={cn("space-y-1", !isSidebarExpanded && "px-2")}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn("group relative w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors", isSidebarExpanded ? "px-3" : "justify-center px-0")}
          >
            <Settings className="h-5 w-5 shrink-0 stroke-[2px] text-slate-500" />
            {isSidebarExpanded && <span>Settings</span>}
            {!isSidebarExpanded && (
              <div className="absolute left-full ml-4 hidden group-hover:block z-50 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                Settings
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>
          <button
            onClick={() => signOut()}
            className={cn("group relative w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors", isSidebarExpanded ? "px-3" : "justify-center px-0")}
          >
            <LogOut className="h-5 w-5 shrink-0 stroke-[2px] text-red-500" />
            {isSidebarExpanded && <span>Logout</span>}
            {!isSidebarExpanded && (
              <div className="absolute left-full ml-4 hidden group-hover:block z-50 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                Logout
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
}
