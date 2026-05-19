import { useState } from 'react';
import { Trophy, X, Lock, Unlock, Flame } from 'lucide-react';
import { achievements, achievementCategories, type Achievement } from '../data/achievements';

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedIds: string[];
  stats: {
    totalPoints: number;
    completedTasks: number;
    currentStreak: number;
  };
}

export function AchievementsPanel({ isOpen, onClose, unlockedIds, stats }: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-h-[85vh] flex flex-col animate-scale-in">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-800">我的成就</h2>
              <span className="text-sm text-gray-500">({unlockedCount}/{totalCount})</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {achievementCategories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedCategory === cat.name 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredAchievements.map(achievement => {
              const isUnlocked = unlockedIds.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`text-2xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className={`font-medium text-sm ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                          {achievement.name}
                        </p>
                        {isUnlocked ? (
                          <Unlock className="w-3 h-3 text-green-500" />
                        ) : (
                          <Lock className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {achievement.description}
                      </p>
                      {achievement.reward && (
                        <p className="text-xs text-amber-600 mt-1">
                          +{achievement.reward}积分奖励
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-gray-600">已获成就</span>
                <span className="font-bold text-amber-600">{unlockedCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-red-500" />
                <span className="text-gray-600">连续打卡</span>
                <span className="font-bold text-red-600">{stats.currentStreak}天</span>
              </div>
            </div>
            <div className="text-gray-500">
              完成{stats.completedTasks}个任务
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
