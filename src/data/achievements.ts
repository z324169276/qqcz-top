export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'special';
  condition: (stats: AchievementStats) => boolean;
  reward?: number;
}

export interface AchievementStats {
  totalPoints: number;
  completedTasks: number;
  currentStreak: number;
  rewardsRedeemed: number;
}

export const achievements: Achievement[] = [
  // 里程碑成就
  {
    id: 'first_task',
    name: '初出茅庐',
    description: '完成第一个任务',
    icon: '🌟',
    category: 'milestone',
    condition: (stats) => stats.completedTasks >= 1,
    reward: 5,
  },
  {
    id: 'tasks_10',
    name: '小试牛刀',
    description: '累计完成10个任务',
    icon: '⭐',
    category: 'milestone',
    condition: (stats) => stats.completedTasks >= 10,
    reward: 10,
  },
  {
    id: 'tasks_50',
    name: '任务达人',
    description: '累计完成50个任务',
    icon: '🌈',
    category: 'milestone',
    condition: (stats) => stats.completedTasks >= 50,
    reward: 20,
  },
  {
    id: 'tasks_100',
    name: '任务大师',
    description: '累计完成100个任务',
    icon: '🏆',
    category: 'milestone',
    condition: (stats) => stats.completedTasks >= 100,
    reward: 50,
  },

  // 积分成就
  {
    id: 'points_100',
    name: '百分小子',
    description: '累计获得100积分',
    icon: '💯',
    category: 'milestone',
    condition: (stats) => stats.totalPoints >= 100,
    reward: 10,
  },
  {
    id: 'points_500',
    name: '积分新星',
    description: '累计获得500积分',
    icon: '💎',
    category: 'milestone',
    condition: (stats) => stats.totalPoints >= 500,
    reward: 25,
  },
  {
    id: 'points_1000',
    name: '积分达人',
    description: '累计获得1000积分',
    icon: '👑',
    category: 'milestone',
    condition: (stats) => stats.totalPoints >= 1000,
    reward: 50,
  },
  {
    id: 'points_5000',
    name: '积分传奇',
    description: '累计获得5000积分',
    icon: '🏅',
    category: 'milestone',
    condition: (stats) => stats.totalPoints >= 5000,
    reward: 100,
  },

  // 连续打卡成就
  {
    id: 'streak_3',
    name: '坚持3天',
    description: '连续打卡3天',
    icon: '🔥',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 3,
    reward: 10,
  },
  {
    id: 'streak_7',
    name: '坚持一周',
    description: '连续打卡7天',
    icon: '💪',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 7,
    reward: 25,
  },
  {
    id: 'streak_14',
    name: '双周坚持',
    description: '连续打卡14天',
    icon: '🌟',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 14,
    reward: 40,
  },
  {
    id: 'streak_30',
    name: '月度之星',
    description: '连续打卡30天',
    icon: '🎯',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 30,
    reward: 80,
  },
  {
    id: 'streak_100',
    name: '百日英雄',
    description: '连续打卡100天',
    icon: '🚀',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 100,
    reward: 200,
  },

  // 特殊成就
  {
    id: 'early_bird',
    name: '早起达人',
    description: '在早上8点前完成任务',
    icon: '🌅',
    category: 'special',
    condition: (stats) => stats.completedTasks >= 1,
  },
  {
    id: 'first_reward',
    name: '初次兑换',
    description: '首次兑换奖励',
    icon: '🎁',
    category: 'special',
    condition: (stats) => stats.rewardsRedeemed >= 1,
    reward: 15,
  },
];

export const achievementCategories = [
  { name: 'milestone', label: '里程碑', icon: '🏆', color: 'amber' },
  { name: 'streak', label: '连续打卡', icon: '🔥', color: 'red' },
  { name: 'special', label: '特殊成就', icon: '✨', color: 'purple' },
];
