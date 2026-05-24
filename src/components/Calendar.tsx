import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { calculateStreakFromHistory, formatLocalDate } from '../lib/streak';

const Calendar = () => {
  const history = useStore((state) => state.history);
  const points = useStore((state) => state.points);
  const currentMemberId = useStore((state) => state.currentMemberId);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const memberHistory = history.filter((h) => !h.memberId || h.memberId === currentMemberId);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const getItemLocalDate = (item: any) => {
    if (item.timestamp) return formatLocalDate(new Date(item.timestamp));
    if (item.date) return item.date;
    return null;
  };

  const monthHistory = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;
    return memberHistory.filter((item) => {
      const d = getItemLocalDate(item);
      return typeof d === 'string' && d.startsWith(prefix);
    });
  }, [memberHistory, currentMonth]);

  const getDayPoints = (date: Date) => {
    const dateStr = formatLocalDate(date);
    return monthHistory
      .filter((item) => getItemLocalDate(item) === dateStr)
      .reduce((sum, item) => {
        if (item.type === 'earn') return sum + item.points;
        if (item.type === 'redeem') return sum - item.points;
        if (item.type === 'adjust') {
          const desc = String(item.description || '');
          const isDecrease = desc.includes('扣') || desc.includes('减少');
          const isIncrease = desc.includes('增') || desc.includes('增加');
          if (isDecrease) return sum - item.points;
          if (isIncrease) return sum + item.points;
          return sum;
        }
        return sum;
      }, 0);
  };

  const getDayTasks = (date: Date) => {
    const dateStr = formatLocalDate(date);
    return monthHistory.filter((item) => getItemLocalDate(item) === dateStr && item.type === 'earn').length;
  };

  const getPointsColor = (points: number) => {
    if (points >= 20) return 'bg-green-500';
    if (points >= 10) return 'bg-green-400';
    if (points > 0) return 'bg-green-300';
    if (points < 0) return 'bg-red-300';
    return 'bg-gray-200';
  };

  const getWeekDays = () => ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const monthName = currentMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  const totalPoints = useMemo(() => {
    return points;
  }, [points]);

  const completedTasks = useMemo(() => {
    return monthHistory.filter((item) => item.type === 'earn').length;
  }, [monthHistory]);

  const activeTaskDays = useMemo(() => {
    const days = new Set<string>();
    for (const item of monthHistory) {
      if (item.type !== 'earn') continue;
      const d = getItemLocalDate(item);
      if (d) days.add(d);
    }
    return days.size;
  }, [monthHistory]);

  const avgTasksPerDay = useMemo(() => {
    if (!completedTasks) return 0;
    return Math.round((completedTasks / Math.max(activeTaskDays, 1)) * 10) / 10;
  }, [completedTasks, activeTaskDays]);

  const streakDays = useMemo(() => {
    return calculateStreakFromHistory(memberHistory as any, currentMemberId);
  }, [memberHistory, currentMemberId]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">📅 积分日历</h2>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ◀
          </button>
          <span className="text-sm sm:text-lg font-medium text-gray-700 whitespace-nowrap">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{totalPoints}</div>
          <div className="text-xs sm:text-sm text-gray-500">当前积分</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{completedTasks}</div>
          <div className="text-xs sm:text-sm text-gray-500">本月完成任务</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{streakDays}</div>
          <div className="text-xs sm:text-sm text-gray-500">连续打卡</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{avgTasksPerDay}</div>
          <div className="text-xs sm:text-sm text-gray-500">本月日均任务</div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {getWeekDays().map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={index} className="h-10 sm:h-12"></div>;
          
          const points = getDayPoints(date);
          const tasks = getDayTasks(date);
          const isTodayFlag = isToday(date);

          return (
            <div
              key={formatLocalDate(date)}
              className={`relative h-10 sm:h-12 rounded-lg p-1 cursor-pointer transition-all hover:scale-105 ${
                isTodayFlag ? 'ring-2 ring-blue-500' : ''
              }`}
              title={`${date.toLocaleDateString('zh-CN')}\n积分: ${points}\n任务: ${tasks}`}
            >
              <div className={`w-full h-full rounded ${getPointsColor(points)} flex flex-col items-center justify-center`}>
                <span className={`text-xs font-medium ${
                  isTodayFlag ? 'text-white font-bold' : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </span>
                {tasks > 0 && (
                  <span className="text-xs text-white font-bold">✓{tasks}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-200"></div>
          <span>无记录</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-300"></div>
          <span>1-9分</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-400"></div>
          <span>10-19分</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-500"></div>
          <span>20分+</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-red-300"></div>
          <span>扣分</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
