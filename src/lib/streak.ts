type HistoryLike = {
  type?: string;
  date?: string;
  timestamp?: string;
  memberId?: string;
};

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getHistoryLocalDate = (item: HistoryLike) => {
  if (item.timestamp) {
    const d = new Date(item.timestamp);
    if (!Number.isNaN(d.getTime())) return formatLocalDate(d);
  }
  if (item.date) return item.date;
  return null;
};

export const calculateStreakFromHistory = (history: HistoryLike[], currentMemberId: string) => {
  if (!Array.isArray(history) || history.length === 0) return 0;

  const memberHistory = currentMemberId
    ? history.filter((h) => !h.memberId || h.memberId === currentMemberId)
    : history;

  const dateSet = new Set<string>();
  for (const h of memberHistory) {
    if (h.type !== 'earn') continue;
    const day = getHistoryLocalDate(h);
    if (day) dateSet.add(day);
  }

  if (dateSet.size === 0) return 0;

  let streak = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const day = formatLocalDate(checkDate);
    if (dateSet.has(day)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }
    if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
};

