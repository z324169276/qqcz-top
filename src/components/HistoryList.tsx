import { useStore } from '../store/useStore';
import { HistoryItem } from './HistoryItem';
import { Clock } from 'lucide-react';

export function HistoryList() {
  const history = useStore((state) => state.history);
  const currentMemberId = useStore((state) => state.currentMemberId);

  const memberHistory = history.filter((h) => !h.memberId || h.memberId === currentMemberId);

  if (memberHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 card-shadow text-center">
        <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          暂无记录
        </h3>
        <p className="text-gray-400">
          开始完成任务或兑换奖励吧
        </p>
      </div>
    );
  }

  const earnedPoints = memberHistory
    .filter((h) => h.type === 'earn')
    .reduce((sum, h) => sum + h.points, 0);

  const spentPoints = memberHistory
    .filter((h) => h.type === 'spend')
    .reduce((sum, h) => sum + h.points, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">累计获得</p>
          <p className="text-2xl font-bold text-secondary font-mono">
            +{earnedPoints}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">累计消耗</p>
          <p className="text-2xl font-bold text-red-500 font-mono">
            -{spentPoints}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700 px-2">
          全部记录 ({memberHistory.length})
        </h2>
        <div className="space-y-3">
          {memberHistory.map((item) => (
            <HistoryItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
