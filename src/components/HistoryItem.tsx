import { HistoryItem as HistoryItemType } from '../store/useStore';
import { TrendingUp, TrendingDown, Edit3 } from 'lucide-react';

interface HistoryItemProps {
  item: HistoryItemType;
}

export function HistoryItem({ item }: HistoryItemProps) {
  const isEarn = item.type === 'earn';
  const isAdjust = item.description.includes('手动');

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIcon = () => {
    if (isAdjust) return Edit3;
    return isEarn ? TrendingUp : TrendingDown;
  };

  const getColor = () => {
    if (isAdjust) return 'bg-blue-500/10 text-blue-500';
    return isEarn ? 'bg-secondary/10 text-secondary' : 'bg-red-500/10 text-red-500';
  };

  const Icon = getIcon();

  return (
    <div className="bg-white rounded-xl p-4 card-shadow flex items-center gap-4">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColor()}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{item.description}</p>
        {item.reason && (
          <p className="text-sm text-gray-500 mt-1">
            原因: {item.reason}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">{formatDate(item.timestamp)}</p>
      </div>

      <div className="flex-shrink-0 text-right">
        <p
          className={`font-bold font-mono ${
            isEarn ? 'text-secondary' : 'text-red-500'
          }`}
        >
          {isEarn ? '+' : '-'}{item.points}
        </p>
        <p className="text-xs text-gray-400">
          余额: {item.balanceAfter}
        </p>
      </div>
    </div>
  );
}
