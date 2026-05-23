import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as api from '../api';

const SYNC_RETRY_TIMES = 3;
const SYNC_RETRY_DELAY = 1000;

interface Task {
  id: string;
  name: string;
  points: number;
  category?: string;
  completedToday?: boolean;
  completedDates?: string[];
  memberId?: string;
  dueDate?: string;
  repeatType?: 'none' | 'daily' | 'weekly';
}

interface Reward {
  id: string;
  name: string;
  points: number;
  stock?: number;
  emoji?: string;
}

interface HistoryItem {
  id: string;
  memberId?: string;
  type: 'earn' | 'redeem' | 'adjust';
  points: number;
  description: string;
  date: string;
  timestamp: string;
}

interface Member {
  id: string;
  name: string;
  avatar?: string;
  points: number;
}

interface StreakRewardConfig {
  days: number;
  points: number;
  enabled: boolean;
}

const defaultStreakRewards: StreakRewardConfig[] = [
  { days: 7, points: 50, enabled: true },
  { days: 14, points: 150, enabled: false },
  { days: 30, points: 500, enabled: false },
];

interface AppState {
  points: number;
  tasks: Task[];
  rewards: Reward[];
  history: HistoryItem[];
  members: Member[];
  currentMemberId: string;
  _hasHydrated: boolean;
  familyId: string | null;
  familyName: string;
  lastModified: string | null;
  isLoading: boolean;
  streakRewards: StreakRewardConfig[];

  setFamilyId: (familyId: string) => void;
  setFamilyName: (name: string) => void;
  initializeSync: (familyId: string) => void;
  refreshFromCloud: () => Promise<void>;
  hydrateFromLocal: (familyId: string) => void;
  updateStreakRewards: (rewards: StreakRewardConfig[]) => void;
  addTask: (name: string, points: number, category?: string, dueDate?: string, repeatType?: 'none' | 'daily' | 'weekly') => void;
  deleteTask: (taskId: string) => void;
  resetRecurringTasks: () => void;
  addReward: (name: string, points: number, stock?: number, emoji?: string) => void;
  redeemReward: (rewardId: string) => { success: boolean; message: string };
  deleteReward: (rewardId: string) => void;
  adjustPoints: (amount: number, reason?: string, date?: string) => { success: boolean; message: string };
  resetPoints: (amount: number) => void;
  addMember: (name: string, avatar?: string) => void;
  updateMember: (memberId: string, name: string, avatar?: string) => void;
  deleteMember: (memberId: string) => void;
  selectMember: (memberId: string) => void;
  updateMemberPoints: (memberId: string, points: number) => void;
  completeTask: (taskId: string) => { success: boolean; message: string };
}

const syncToCloud = async (familyId: string, data: Record<string, any>, retryCount = 0, mutationId?: number) => {
  const effectiveMutationId = mutationId ?? Date.now();
  try {
    await api.updateFamily(familyId, data);

    const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    const filtered = pendingSync.filter((item: any) => item.timestamp !== effectiveMutationId);
    localStorage.setItem('pendingSync', JSON.stringify(filtered));
    
  } catch (error: any) {
    console.error(`同步失败 (尝试 ${retryCount + 1}/${SYNC_RETRY_TIMES}):`, error?.message || error);

    const pendingItem = {
      familyId,
      data,
      timestamp: effectiveMutationId,
    };
    const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    const exists = pendingSync.some((item: any) => 
      item.familyId === familyId && JSON.stringify(item.data) === JSON.stringify(data)
    );
    if (!exists) {
      pendingSync.push(pendingItem);
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
    }

    if (retryCount < SYNC_RETRY_TIMES - 1) {
      await new Promise(resolve => setTimeout(resolve, SYNC_RETRY_DELAY * (retryCount + 1)));
      return syncToCloud(familyId, data, retryCount + 1, effectiveMutationId);
    }
  }
};

const syncPendingData = async (familyId: string) => {
  const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
  const familyPending = pendingSync.filter((item: any) => item.familyId === familyId);
  
  for (const item of familyPending) {
    await syncToCloud(familyId, item.data, 0, item.timestamp);
  }
};

const baseStore = (set: any, get: any) => ({
  points: 0,
  tasks: [],
  rewards: [],
  history: [],
  members: [],
  currentMemberId: '',
  _hasHydrated: false,
  familyId: null,
  familyName: '',
  lastModified: null,
  isLoading: true,
  streakRewards: defaultStreakRewards,

  setFamilyId: (familyId: string) => {
    set({ familyId });
  },

  setFamilyName: (familyName: string) => {
    const state = get();
    if (!state.familyId) return;
    
    set({ familyName });
    syncToCloud(state.familyId, { familyname: familyName });
  },

  initializeSync: async (familyId: string) => {
    const data = await api.getFamily(familyId);

    if (data) {
      const members = data.members || [];
      const storedMemberId = localStorage.getItem('memberId');
      let currentMemberId = storedMemberId || '';
      if (members.length > 0) {
        if (!storedMemberId || !members.find((m: Member) => m.id === storedMemberId)) {
          currentMemberId = members[0].id;
          localStorage.setItem('memberId', currentMemberId);
        }
      }

      const currentMember = members.find((m: Member) => m.id === currentMemberId);

      const streakRewards = data.streak_rewards || defaultStreakRewards;
      const lastModified = (data as any).lastModified || (data as any).lastmodified || null;
      const remotePoints = typeof (data as any).points === 'number' ? (data as any).points : 0;
      const chosenPoints = remotePoints || currentMember?.points || 0;
      const normalizedMembers = members.map((m: Member) =>
        m.id === currentMemberId && remotePoints ? { ...m, points: remotePoints } : m
      );

      // #region debug-point points-adjust-revert.init-choice
      if (new URLSearchParams(window.location.search).has('debugPoints')) {
        localStorage.setItem('__points_adjust_debug', JSON.stringify({
          at: new Date().toISOString(),
          source: 'initializeSync',
          familyId,
          currentMemberId,
          remote: {
            dataPoints: (data as any).points ?? null,
            memberPoints: currentMember?.points ?? null,
            lastModified,
          },
          chosenPoints,
        }));
      }
      // #endregion debug-point points-adjust-revert.init-choice

      set({
        points: chosenPoints,
        tasks: data.tasks || [],
        rewards: data.rewards || [],
        history: data.history || [],
        familyName: data.familyname || '',
        members: normalizedMembers,
        currentMemberId: currentMemberId,
        streakRewards: streakRewards,
        lastModified,
        _hasHydrated: true,
        isLoading: false,
      });

      syncPendingData(familyId);
    } else {
      set({
        _hasHydrated: true,
        isLoading: false,
      });
    }
  },

  refreshFromCloud: async () => {
    const state = get();
    if (!state.familyId) return;

    const data = await api.getFamily(state.familyId);
    if (!data) return;

    const remoteLastModified = (data as any).lastModified || (data as any).lastmodified || null;
    if (remoteLastModified && state.lastModified && remoteLastModified === state.lastModified) return;

    const members = data.members || [];
    const storedMemberId = localStorage.getItem('memberId');
    let currentMemberId = storedMemberId || state.currentMemberId || '';
    if (members.length > 0) {
      if (!currentMemberId || !members.find((m: Member) => m.id === currentMemberId)) {
        currentMemberId = members[0].id;
        localStorage.setItem('memberId', currentMemberId);
      }
    }

    const currentMember = members.find((m: Member) => m.id === currentMemberId);
    const streakRewards = data.streak_rewards || defaultStreakRewards;
    const remotePoints = typeof (data as any).points === 'number' ? (data as any).points : 0;
    const chosenPoints = remotePoints || currentMember?.points || 0;
    const normalizedMembers = members.map((m: Member) =>
      m.id === currentMemberId && remotePoints ? { ...m, points: remotePoints } : m
    );

    // #region debug-point points-adjust-revert.refresh-choice
    if (new URLSearchParams(window.location.search).has('debugPoints')) {
      localStorage.setItem('__points_adjust_debug', JSON.stringify({
        at: new Date().toISOString(),
        source: 'refreshFromCloud',
        familyId: state.familyId,
        currentMemberId,
        localPoints: state.points,
        remote: {
          dataPoints: (data as any).points ?? null,
          memberPoints: currentMember?.points ?? null,
          lastModified: remoteLastModified,
        },
        chosenPoints,
      }));
    }
    // #endregion debug-point points-adjust-revert.refresh-choice

    set({
      points: chosenPoints,
      tasks: data.tasks || [],
      rewards: data.rewards || [],
      history: data.history || [],
      familyName: data.familyname || '',
      members: normalizedMembers,
      currentMemberId: currentMemberId,
      streakRewards: streakRewards,
      lastModified: remoteLastModified,
    });
  },

  hydrateFromLocal: (familyId: string) => {
    const storedTasks = localStorage.getItem(`tasks_${familyId}`);
    const storedRewards = localStorage.getItem(`rewards_${familyId}`);
    const storedHistory = localStorage.getItem(`history_${familyId}`);
    const storedPoints = localStorage.getItem(`points_${familyId}`);
    const storedMembers = localStorage.getItem(`members_${familyId}`);
    const storedFamilyName = localStorage.getItem(`familyName_${familyId}`);
    const storedStreakRewards = localStorage.getItem('streakRewards');
    const storedMemberId = localStorage.getItem('memberId');

    const tasks = storedTasks ? JSON.parse(storedTasks) : [];
    const rewards = storedRewards ? JSON.parse(storedRewards) : [];
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    const points = storedPoints ? parseInt(storedPoints) : 0;
    const members = storedMembers ? JSON.parse(storedMembers) : [];
    const streakRewards = storedStreakRewards ? JSON.parse(storedStreakRewards) : defaultStreakRewards;

    let currentMemberId = storedMemberId || '';
    if (members.length > 0 && !storedMemberId) {
      currentMemberId = members[0].id;
    }

    const currentMember = members.find((m: Member) => m.id === currentMemberId);

    set({
      points: currentMember?.points || points,
      tasks,
      rewards,
      history,
      members,
      currentMemberId,
      familyName: storedFamilyName || '',
      streakRewards,
      lastModified: null,
      _hasHydrated: true,
    });
  },

  updateStreakRewards: (rewards: StreakRewardConfig[]) => {
    const state = get();
    if (!state.familyId) return;

    localStorage.setItem('streakRewards', JSON.stringify(rewards));
    set({ streakRewards: rewards });

    syncToCloud(state.familyId, { streak_rewards: rewards });
  },

  addTask: (name: string, points: number, category?: string, dueDate?: string, repeatType?: 'none' | 'daily' | 'weekly') => {
    const state = get();
    if (!state.familyId) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      points,
      category: category || '其他',
      completedToday: false,
      completedDates: [],
      memberId: state.currentMemberId || undefined,
      dueDate,
      repeatType: repeatType || 'none',
    };
    const newTasks = [newTask, ...state.tasks];
    set({ tasks: newTasks });

    syncToCloud(state.familyId, { tasks: newTasks });
  },

  completeTask: (taskId: string) => {
    const state = get();
    const task = state.tasks.find((t: Task) => t.id === taskId);
    if (!task || !state.familyId) return { success: false, message: '任务不存在' };

    const today = new Date().toISOString().split('T')[0];
    if (task.completedDates?.includes(today)) {
      return { success: false, message: '该任务今日已完成' };
    }

    const newPoints = state.points + task.points;
    
    const updatedTasks = state.tasks.map((t: Task) =>
      t.id === taskId
        ? { ...t, completedToday: true, completedDates: [...(t.completedDates || []), today] }
        : t
    );

    const newHistory: HistoryItem = {
      id: crypto.randomUUID(),
      memberId: state.currentMemberId,
      type: 'earn',
      points: task.points,
      description: task.name,
      date: today,
      timestamp: new Date().toISOString(),
    };
    const newHistoryArray = [newHistory, ...state.history];

    const updatedMembers = state.members.map((m: Member) =>
      m.id === state.currentMemberId ? { ...m, points: m.points + task.points } : m
    );

    set({
      points: newPoints,
      tasks: updatedTasks,
      history: newHistoryArray,
      members: updatedMembers,
    });

    syncToCloud(state.familyId, {
      points: newPoints,
      tasks: updatedTasks,
      history: newHistoryArray,
      members: updatedMembers,
    });

    return { success: true, message: `获得 ${task.points} 积分` };
  },

  deleteTask: (taskId: string) => {
    const state = get();
    if (!state.familyId) return;

    const newTasks = state.tasks.filter((t: Task) => t.id !== taskId);
    set({ tasks: newTasks });

    syncToCloud(state.familyId, { tasks: newTasks });
  },

  resetRecurringTasks: () => {
    const state = get();
    if (!state.familyId) return;

    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = localStorage.getItem('lastResetDate');
    
    if (lastResetDate === today) return;

    const newTasks = state.tasks.map((t: Task) => {
      let reset = false;
      
      if (t.repeatType === 'daily') {
        reset = true;
      } else if (t.repeatType === 'weekly') {
        const lastReset = lastResetDate ? new Date(lastResetDate) : null;
        const todayDate = new Date(today);
        if (!lastReset || lastReset.getDay() > todayDate.getDay()) {
          reset = true;
        }
      }

      return reset ? { ...t, completedToday: false } : t;
    });

    localStorage.setItem('lastResetDate', today);
    set({ tasks: newTasks });

    syncToCloud(state.familyId, { tasks: newTasks });
  },

  addReward: (name: string, points: number, stock?: number, emoji?: string) => {
    const state = get();
    if (!state.familyId) return;

    const newReward: Reward = {
      id: crypto.randomUUID(),
      name,
      points,
      stock: stock ?? undefined,
      emoji: emoji || undefined,
    };
    const newRewards = [newReward, ...state.rewards];
    set({ rewards: newRewards });

    syncToCloud(state.familyId, { rewards: newRewards });
  },

  redeemReward: (rewardId: string) => {
    const state = get();
    const reward = state.rewards.find((r: Reward) => r.id === rewardId);
    if (!reward || !state.familyId) return { success: false, message: '奖励不存在' };

    if (state.points < reward.points) {
      return { success: false, message: '积分不足' };
    }

    if (reward.stock !== undefined && reward.stock <= 0) {
      return { success: false, message: '奖励已兑换完' };
    }

    const newPoints = state.points - reward.points;
    const newRewards = state.rewards.map((r: Reward) =>
      r.id === rewardId && r.stock !== undefined
        ? { ...r, stock: r.stock - 1 }
        : r
    );

    const newHistory: HistoryItem = {
      id: crypto.randomUUID(),
      memberId: state.currentMemberId,
      type: 'redeem',
      points: reward.points,
      description: reward.name,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
    const newHistoryArray = [newHistory, ...state.history];

    const updatedMembers = state.members.map((m: Member) =>
      m.id === state.currentMemberId ? { ...m, points: m.points - reward.points } : m
    );

    set({
      points: newPoints,
      rewards: newRewards,
      history: newHistoryArray,
      members: updatedMembers,
    });

    syncToCloud(state.familyId, {
      points: newPoints,
      rewards: newRewards,
      history: newHistoryArray,
      members: updatedMembers,
    });

    return { success: true, message: `消耗 ${reward.points} 积分` };
  },

  deleteReward: (rewardId: string) => {
    const state = get();
    if (!state.familyId) return;

    const newRewards = state.rewards.filter((r: Reward) => r.id !== rewardId);
    set({ rewards: newRewards });

    syncToCloud(state.familyId, { rewards: newRewards });
  },

  adjustPoints: (amount: number, reason?: string, date?: string) => {
    const state = get();
    if (!state.familyId) return { success: false, message: '未登录' };

    const newPoints = state.points + amount;
    const newHistory: HistoryItem = {
      id: crypto.randomUUID(),
      memberId: state.currentMemberId,
      type: 'adjust',
      points: Math.abs(amount),
      description: reason || (amount > 0 ? '手动增加' : '手动扣除'),
      date: date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
    const newHistoryArray = [newHistory, ...state.history];

    const updatedMembers = state.members.map((m: Member) =>
      m.id === state.currentMemberId ? { ...m, points: m.points + amount } : m
    );

    set({
      points: newPoints,
      history: newHistoryArray,
      members: updatedMembers,
    });

    // #region debug-point points-adjust-revert.adjust.after-local
    if (new URLSearchParams(window.location.search).has('debugPoints')) {
      const currentMember = updatedMembers.find((m: Member) => m.id === state.currentMemberId);
      localStorage.setItem('__points_adjust_debug', JSON.stringify({
        at: new Date().toISOString(),
        source: 'adjustPoints',
        familyId: state.familyId,
        currentMemberId: state.currentMemberId,
        oldPoints: state.points,
        newPoints,
        amount,
        localMemberPoints: currentMember?.points ?? null,
      }));
    }
    // #endregion debug-point points-adjust-revert.adjust.after-local

    syncToCloud(state.familyId, {
      points: newPoints,
      history: newHistoryArray,
      members: updatedMembers,
    });

    return {
      success: true,
      message: amount > 0 ? `增加 ${amount} 积分` : `扣除 ${Math.abs(amount)} 积分`,
    };
  },

  resetPoints: (amount: number) => {
    const state = get();
    if (!state.familyId) return;

    const updatedMembers = state.members.map((m: Member) =>
      m.id === state.currentMemberId ? { ...m, points: amount } : m
    );

    set({ points: amount, members: updatedMembers });
    syncToCloud(state.familyId, { points: amount, members: updatedMembers });
  },

  addMember: (name: string, avatar?: string) => {
    const state = get();
    if (!state.familyId) return;

    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      avatar: avatar || undefined,
      points: state.points,
    };
    const updatedMembers = [...state.members, newMember];
    set({ members: updatedMembers, currentMemberId: newMember.id });
    localStorage.setItem('memberId', newMember.id);

    syncToCloud(state.familyId, { members: updatedMembers });
  },

  updateMember: (memberId: string, name: string, avatar?: string) => {
    const state = get();
    if (!state.familyId) return;

    const updatedMembers = state.members.map((m: Member) =>
      m.id === memberId ? { ...m, name, avatar } : m
    );
    set({ members: updatedMembers });

    syncToCloud(state.familyId, { members: updatedMembers });
  },

  deleteMember: (memberId: string) => {
    const state = get();
    if (!state.familyId) return;

    const updatedMembers = state.members.filter((m: Member) => m.id !== memberId);
    
    if (state.currentMemberId === memberId && updatedMembers.length > 0) {
      set({ members: updatedMembers, currentMemberId: updatedMembers[0].id, points: updatedMembers[0].points });
      localStorage.setItem('memberId', updatedMembers[0].id);
    } else {
      set({ members: updatedMembers });
    }

    syncToCloud(state.familyId, { members: updatedMembers });
  },

  selectMember: (memberId: string) => {
    const state = get();
    const member = state.members.find((m: Member) => m.id === memberId);
    if (member) {
      set({ currentMemberId: memberId, points: member.points });
      localStorage.setItem('memberId', memberId);
    }
  },

  updateMemberPoints: (memberId: string, points: number) => {
    const state = get();
    if (!state.familyId) return;

    const updatedMembers = state.members.map((m: Member) =>
      m.id === memberId ? { ...m, points } : m
    );
    set({ members: updatedMembers });

    syncToCloud(state.familyId, { members: updatedMembers });
  },

  resetStore: () => {
    set({
      points: 0,
      tasks: [],
      rewards: [],
      history: [],
      members: [],
      currentMemberId: '',
      _hasHydrated: false,
      familyId: null,
      familyName: '',
      isLoading: true,
      streakRewards: defaultStreakRewards,
    });
    
    localStorage.removeItem('familyId');
    localStorage.removeItem('memberId');
    localStorage.removeItem('familyPin');
  },
});

export const useStore = create<AppState>()(
  persist(baseStore, {
    name: 'childlike-task-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      // 持久化所有状态
      points: state.points,
      tasks: state.tasks,
      rewards: state.rewards,
      history: state.history,
      members: state.members,
      currentMemberId: state.currentMemberId,
      familyName: state.familyName,
      streakRewards: state.streakRewards,
      lastModified: state.lastModified,
    }),
  })
);
