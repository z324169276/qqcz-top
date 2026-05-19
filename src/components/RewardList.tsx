import { useStore } from '../store/useStore';
import { RewardForm } from './RewardForm';
import { RewardCard } from './RewardCard';
import { Gift } from 'lucide-react';

export function RewardList() {
  const rewards = useStore((state) => state.rewards);
  const points = useStore((state) => state.points);

  return (
    <div className="space-y-6">
      <RewardForm />

      {rewards.length === 0 && (
        <div className="bg-white rounded-2xl p-8 card-shadow text-center">
          <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            还没有奖励
          </h3>
          <p className="text-gray-400">
            点击上方按钮添加奖励吧
          </p>
        </div>
      )}

      {rewards.length > 0 && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              当前可用积分:{' '}
              <span className="font-bold text-accent font-mono">{points}</span>
            </p>
          </div>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
