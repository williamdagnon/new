import React from 'react';
import { BarChart3, Crown, Wallet, Users } from 'lucide-react';

type TabKey = 'overview' | 'vip' | 'wallet' | 'team' | 'history' | 'support' | 'deposit' | 'withdrawal';

interface BottomNavProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChange }) => {
  const items = [
    { key: 'overview', icon: BarChart3, label: 'Overview' },
    { key: 'vip', icon: Crown, label: 'VIP' },
    { key: 'wallet', icon: Wallet, label: 'Wallet' },
    { key: 'team', icon: Users, label: 'Team' },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-3xl md:hidden">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-3xl shadow-2xl dark:shadow-2xl px-3 py-2 flex items-center justify-between transition-colors duration-300">
        {items.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key as TabKey)}
            className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              activeTab === key 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
            aria-label={key}
            title={key}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </nav>
  );
};
