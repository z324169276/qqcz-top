import { useState } from 'react';
import { Gift, Trash2 } from 'lucide-react';
import { Reward, useStore } from '../store/useStore';
import { ConfirmDialog } from './ConfirmDialog';
import toast from 'react-hot-toast';

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const redeemReward = useStore((state) => state.redeemReward);
  const deleteReward = useStore((state) => state.deleteReward);
  const points = useStore((state) => state.points);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRedeem = () => {
    const result = redeemReward(reward.id);
    if (result.success) {
      toast.success(result.message, {
        icon: '🎁',
        style: {
          background: '#F59E0B',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
    } else {
      toast.error(result.message);
    }
  };

  const handleConfirmDelete = () => {
    deleteReward(reward.id);
    toast.success('奖励已删除');
    setShowDeleteConfirm(false);
  };

  const canRedeem = points >= reward.points && reward.stock > 0;

  return (
    <>
      <div className="bg-white rounded-2xl p-4 card-shadow hover:card-shadow-lg transition-all">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-4xl">
            {reward.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-800">{reward.name}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-sm font-mono font-medium text-accent bg-accent/10 px-2 py-1 rounded-lg">
                <Gift className="w-3 h-3" />
                {reward.points}
              </span>
              <span className="text-sm text-gray-500">
                库存: {reward.stock}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedeem}
              disabled={!canRedeem}
              className={`px-5 py-2 rounded-xl font-medium transition-all ${
                canRedeem
                  ? 'bg-accent text-white hover:bg-accent/90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              兑换
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除奖励"
        message={`确定要删除"${reward.name}"吗？删除后无法恢复。`}
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
