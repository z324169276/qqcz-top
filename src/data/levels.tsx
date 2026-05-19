import React from 'react';
import { Star, Shield, Award, Crown, Zap, Flame, Rocket, Target, Trophy } from 'lucide-react';

export interface Level {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const levels: Level[] = [
  {
    id: 'bronze',
    name: '青铜',
    minPoints: 0,
    maxPoints: 99,
    icon: <Shield className="w-6 h-6" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    description: '初出茅庐，继续加油！',
  },
  {
    id: 'silver',
    name: '白银',
    minPoints: 100,
    maxPoints: 299,
    icon: <Star className="w-6 h-6" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    description: '小有成就，继续努力！',
  },
  {
    id: 'gold',
    name: '黄金',
    minPoints: 300,
    maxPoints: 599,
    icon: <Award className="w-6 h-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    description: '表现优秀，棒极了！',
  },
  {
    id: 'platinum',
    name: '铂金',
    minPoints: 600,
    maxPoints: 999,
    icon: <Crown className="w-6 h-6" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-400',
    description: '卓尔不凡，继续保持！',
  },
  {
    id: 'diamond',
    name: '钻石',
    minPoints: 1000,
    maxPoints: 1999,
    icon: <Zap className="w-6 h-6" />,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-400',
    description: '光芒四射，太厉害了！',
  },
  {
    id: 'master',
    name: '大师',
    minPoints: 2000,
    maxPoints: 3999,
    icon: <Flame className="w-6 h-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-400',
    description: '炉火纯青，无人能敌！',
  },
  {
    id: 'legend',
    name: '传奇',
    minPoints: 4000,
    maxPoints: 999999,
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
    description: '登峰造极，神级存在！',
  },
];

export const getLevel = (totalPoints: number): Level => {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].minPoints) {
      return levels[i];
    }
  }
  return levels[0];
};

export const getProgress = (totalPoints: number): { current: number; max: number; percentage: number } => {
  const level = getLevel(totalPoints);
  const current = totalPoints - level.minPoints;
  const max = level.maxPoints - level.minPoints;
  const percentage = max === 0 ? 100 : Math.min(100, (current / max) * 100);
  return { current, max, percentage };
};

export const getNextLevel = (totalPoints: number): Level | null => {
  const currentLevel = getLevel(totalPoints);
  const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return null;
};

interface LevelBadgeProps {
  totalPoints: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const LevelBadge = ({ totalPoints, size = 'md', showProgress = true }: LevelBadgeProps) => {
  const level = getLevel(totalPoints);
  const progress = getProgress(totalPoints);
  const nextLevel = getNextLevel(totalPoints);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`${level.bgColor} border ${level.borderColor} rounded-xl p-3 ${sizeClasses[size]}`}>
      <div className="flex items-center gap-2">
        <div className={level.color}>{level.icon}</div>
        <div className="flex-1">
          <div className={`font-bold ${level.color}`}>{level.name}</div>
          <div className="text-gray-500">{totalPoints} 积分</div>
        </div>
      </div>
      
      {showProgress && nextLevel && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{level.name}</span>
            <span>距{nextLevel.name}还需 {nextLevel.minPoints - totalPoints}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${level.color.replace('text-', 'bg-')}`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface LevelProgressProps {
  totalPoints: number;
}

export const LevelProgress = ({ totalPoints }: LevelProgressProps) => {
  const level = getLevel(totalPoints);
  const progress = getProgress(totalPoints);
  const nextLevel = getNextLevel(totalPoints);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${level.bgColor} border-2 ${level.borderColor} flex items-center justify-center ${level.color}`}>
            {level.icon}
          </div>
          <div>
            <div className={`text-xl font-bold ${level.color}`}>{level.name}级</div>
            <div className="text-gray-500">{totalPoints} 累计积分</div>
          </div>
        </div>
        
        {nextLevel && (
          <div className="text-right">
            <div className="text-sm text-gray-500">距离升级</div>
            <div className={`font-bold ${level.color}`}>{nextLevel.minPoints - totalPoints} 积分</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">升级进度</span>
          <span className="font-medium">{progress.current} / {progress.max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${level.color.replace('text-', 'bg-')}`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className={`text-center py-2 px-4 rounded-lg ${level.bgColor} border ${level.borderColor}`}>
        <p className={level.color}>{level.description}</p>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {levels.map((l) => (
          <div
            key={l.id}
            className={`text-center p-1 rounded ${
              totalPoints >= l.minPoints
                ? `${l.bgColor} ${l.color}`
                : 'bg-gray-100 text-gray-400'
            }`}
            title={l.name}
          >
            <div className={`mx-auto ${l.id === level.id ? 'scale-110' : ''}`}>
              {React.cloneElement(l.icon as React.ReactElement, { className: 'w-4 h-4 mx-auto' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
