import React from 'react';
import { ActiveTab } from '../../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'today', label: 'امروز', icon: 'today' },
    { id: 'planner', label: 'هفتگی', icon: 'calendar_view_week' },
    { id: 'journal', label: 'یادداشت', icon: 'edit_note' },
    { id: 'timer', label: 'زمان‌سنج', icon: 'timer' },
    { id: 'ai-review', label: 'گزارش هوشمند', icon: 'auto_awesome' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#0b0f17]/95 backdrop-blur-md border-t border-white/[0.06]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
                isActive ? 'text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? 'material-symbols-filled text-cyan-400' : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[11px] font-medium leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
