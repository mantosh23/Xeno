import React, { useState } from 'react';
import { Integrations } from '../../integrations/pages/Integrations';
import { Link2, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * SettingsModal Component
 * 
 * @returns {JSX.Element}
 */
export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState('integrations');

  if (!isOpen) return null;

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: Link2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-gray-50/30">
          {/* Settings Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0 p-6 border-r border-gray-100 bg-white overflow-y-auto">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive 
                      ? 'bg-purple-50 text-purple-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          </aside>

          {/* Settings Content */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm min-h-[400px]">
              {activeTab === 'integrations' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Channel Integrations</h2>
                  <Integrations />
                </div>
              )}
              {activeTab !== 'integrations' && (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                  <IconPlaceholder icon={tabs.find(t => t.id === activeTab)?.icon} />
                  <p className="mt-4 font-medium text-gray-500">This section is under construction.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const IconPlaceholder = ({ icon: Icon }: { icon: any }) => {
  if (!Icon) return null;
  return <Icon className="h-12 w-12 text-gray-300" />;
};
