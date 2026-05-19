import React from 'react';
import { Flame, Gift, TrendingUp, Calendar, CheckCircle2, Settings } from 'lucide-react';
import { useStore, StreakRewardConfig } from '../store/useStore';

interface StreakDisplayProps {
  compact?: boolean;
  onOpenSettings?: () => void;
}

export const StreakDisplay = ({ compact = false, onOpenSettings }: StreakDisplayProps) => {
  const history = useStore((state) => state.history);
  const currentMemberId = useStore((state) => state.currentMemberId);
  const streakRewards = useStore((state) => state.streakRewards);

  const calculateStreak = () => {
    if (history.length === 0) return 0;
    
    const memberHistory = currentMemberId 
      ? history.filter(h => h.memberId === currentMemberId)
      : history;
    
    const completedTasks = memberHistory.filter(h => h.type === 'earn' && h.date);
    
    if (completedTasks.length === 0) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasTaskOnDate = completedTasks.some(h => h.date === dateStr);
      
      if (hasTaskOnDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  const getCurrentReward = () => {
    let reward: StreakRewardConfig | null = null;
    for (let i = streakRewards.length - 1; i >= 0; i--) {
      if (currentStreak >= streakRewards[i].days) {
        reward = streakRewards[i];
        break;
      }
    }
    return reward;
  };

  const getNextReward = () => {
    for (const reward of streakRewards) {
      if (currentStreak < reward.days) {
        return reward;
      }
    }
    return null;
  };

  const nextReward = getNextReward();
  const currentReward = getCurrentReward();
  const progressToNext = nextReward 
    ? Math.min(100, (currentStreak / nextReward.days) * 100) 
    : 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl px-4 py-2">
        <div className="text-2xl">🔥</div>
        <div>
          <div className="text-sm font-medium text-orange-600">{currentStreak}天连续</div>
          {nextReward && (
            <div className="text-xs text-gray-500">再{nextReward.days - currentStreak}天获{nextReward.points}积分</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          连续打卡奖励
        </h2>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="设置奖励"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl mb-2">🔥</div>
        <div className="text-4xl font-bold text-orange-500">{currentStreak}</div>
        <div className="text-gray-500">天连续打卡</div>
      </div>

      {currentReward && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{currentReward.emoji}</div>
            <div>
              <div className="font-bold text-orange-600">{currentReward.name}</div>
              <div className="text-sm text-gray-600">已达成！奖励 {currentReward.points} 积分</div>
            </div>
          </div>
        </div>
      )}

      {nextReward && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>距离 {nextReward.name}</span>
            <span>{nextReward.days - currentStreak} 天</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{nextReward.emoji}</span>
              <span className="font-medium text-gray-700">{nextReward.name}</span>
            </div>
            <div className="text-orange-500 font-bold">+{nextReward.points}积分</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">全部奖励</h3>
        {streakRewards.map((reward) => {
          const achieved = currentStreak >= reward.days;
          const isNext = nextReward?.days === reward.days;
          
          return (
            <div
              key={reward.days}
              className={`flex items-center justify-between p-3 rounded-lg ${
                achieved
                  ? 'bg-green-50 border border-green-200'
                  : isNext
                  ? 'bg-orange-50 border-2 border-orange-300'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{reward.emoji}</span>
                <div>
                  <div className={`font-medium ${achieved ? 'text-green-600' : 'text-gray-700'}`}>
                    {reward.name}
                  </div>
                  <div className="text-xs text-gray-500">连续 {reward.days} 天</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${achieved ? 'text-green-600' : 'text-gray-500'}`}>
                  +{reward.points}
                </span>
                {achieved && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {isNext && <Flame className="w-5 h-5 text-orange-500" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">坚持就是胜利！</p>
            <p>连续打卡可以获得额外积分奖励。休息一天不会中断连续记录哦~</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
