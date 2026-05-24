import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import Calendar from './Calendar';
import StreakDisplay from './StreakDisplay';
import ReportGenerator from './ReportGenerator';
import StreakSettings from './StreakSettings';
import { Calendar as CalendarIcon, Flame, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

type StatsTab = 'calendar' | 'streak' | 'report';

export function StatsPage() {
  const [activeStatsTab, setActiveStatsTab] = useState<StatsTab>('calendar');
  const [showStreakSettings, setShowStreakSettings] = useState(false);

  const tabs = [
    { id: 'calendar' as const, label: '日历', icon: CalendarIcon },
    { id: 'streak' as const, label: '打卡', icon: Flame },
    { id: 'report' as const, label: '报告', icon: FileText },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-2 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStatsTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatsTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in">
        {activeStatsTab === 'calendar' && <Calendar />}
        {activeStatsTab === 'streak' && (
          <StreakDisplay onOpenSettings={() => setShowStreakSettings(true)} />
        )}
        {activeStatsTab === 'report' && <ReportGenerator />}
      </div>

      {showStreakSettings && activeStatsTab === 'streak' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <StreakSettings onClose={() => setShowStreakSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPage;
