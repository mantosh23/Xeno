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
  Trash2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { useStrategyStore } from '../../store/useStrategyStore';
import { SettingsModal } from '../../pages/Settings';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Audience', path: '/audience' },
  { icon: Sparkles, label: 'New Chat', path: '/strategy' },
  { icon: Megaphone, label: 'Campaigns', path: '/campaigns' },
  { icon: Zap, label: 'Automations', path: '/automations' },
  // { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  // { icon: Smartphone, label: 'Channel Simulator', path: '/simulator' },
  // { icon: Bot, label: 'AI Assistant', path: '/assistant' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessions, fetchSessions, deleteSession } = useStrategyStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const urlSessionId = location.pathname.startsWith('/strategy/') ? location.pathname.split('/strategy/')[1] : null;

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-gray-100 bg-white md:flex">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-6 h-[80px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f62fe] text-white font-bold text-lg flex-shrink-0">
          SH
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-bold text-gray-900 leading-tight">StyleHive</h1>
          <p className="text-[9px] text-gray-500 font-medium">AI Marketing OS</p>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Navigation */}
        <nav className="space-y-[2px] px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-[#0f62fe] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5 stroke-[2px]', isActive ? 'text-white' : 'text-slate-500')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Chat History Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Past Chats</div>
        <div className="space-y-1">
          {sessions.map(session => (
            <div key={session.id} className="relative group">
              <button
                onClick={() => handleLoadChat(session.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all pr-10 ${urlSessionId === session.id ? 'bg-blue-50 border border-blue-100 shadow-sm' : 'hover:bg-white border border-transparent'}`}
              >
                <div className={`text-xs font-semibold truncate ${urlSessionId === session.id ? 'text-[#0f62fe]' : 'text-gray-600'}`}>
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
            <div className="text-center text-gray-400 text-xs py-4">No past chats yet.</div>
          )}
        </div>
      </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        {/* AI Assistant Card */}
        <div className="rounded-2xl border border-gray-100 bg-[#FCFAFF] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[#0f62fe]">AI Assistant</h3>
            <span className="rounded-full bg-[#e6f0ff] px-2 py-0.5 text-xs font-bold text-[#0f62fe]">
              BETA
            </span>
          </div>
          <p className="text-[9px] text-[#0f62fe] mb-4 leading-[1.4] font-medium">
            Ask anything about your audience, campaigns or performance.
          </p>
          <button className="w-full rounded-xl bg-[#0f62fe] py-2.5 text-[9px] font-bold text-white shadow-sm hover:bg-[#7C3AED] transition-colors">
            Ask AI
          </button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="h-5 w-5 stroke-[2px] text-slate-500" />
            Settings
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
}
