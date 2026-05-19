import { CheckSquare, Gift, History, BarChart3 } from 'lucide-react';

interface TabNavProps {
  activeTab: 'tasks' | 'rewards' | 'history' | 'stats';
  onTabChange: (tab: 'tasks' | 'rewards' | 'history' | 'stats') => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabs = [
    { id: 'tasks' as const, label: '任务', icon: CheckSquare },
    { id: 'rewards' as const, label: '兑换', icon: Gift },
    { id: 'history' as const, label: '历史', icon: History },
    { id: 'stats' as const, label: '统计', icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm safe-area-pt">
      <div className="max-w-2xl mx-auto">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 sm:py-4 px-1 font-medium transition-all relative active:scale-95 ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
