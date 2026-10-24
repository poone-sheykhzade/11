import React from 'react';
import { UserProfile, ActiveTab } from '../../types';
import { MinimalistAvatar } from './MinimalistAvatar';

interface HeaderProps {
  user: UserProfile;
  activeTab: ActiveTab;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenProfile,
}) => {
  const getTabLabel = () => {
    switch (activeTab) {
      case 'today':
        return 'امروز';
      case 'planner':
        return 'برنامه هفتگی';
      case 'journal':
        return 'یادداشت‌های روزانه';
      case 'timer':
        return 'زمان‌سنج کار';
      case 'ai-review':
        return 'گزارش هوشمند هفته';
      default:
        return 'امروز';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md pt-safe border-b border-white/[0.06]">
      <div className="max-w-4xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Wordmark (No external image logo, pure clean typography) */}
        <div className="flex items-center gap-2.5">
          <span className="font-outfit text-lg font-semibold tracking-tight text-white">
            LifeOS
          </span>
          <span className="text-slate-600 text-sm font-light">|</span>
          <span className="text-xs text-slate-300 font-medium">
            {getTabLabel()}
          </span>
        </div>

        {/* Profile Trigger with Minimalist Illustrated Avatar */}
        <button
          onClick={onOpenProfile}
          aria-label="پروفایل و مدیریت داده‌ها"
          className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          title="پروفایل و تنظیمات داده"
        >
          <MinimalistAvatar size={32} />
        </button>
      </div>
    </header>
  );
};
