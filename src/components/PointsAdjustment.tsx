import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export function PointsAdjustment() {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const adjustPoints = useStore((state) => state.adjustPoints);

  const handleAdjust = (type: 'add' | 'subtract') => {
    const adjustAmount = type === 'add' ? Math.abs(amount) : -Math.abs(amount);

    if (amount === 0) {
      toast.error('请输入积分数量');
      return;
    }

    if (!reason.trim()) {
      toast.error('请输入调整原因');
      return;
    }

    const result = adjustPoints(adjustAmount, reason.trim());

    if (result.success) {
      toast.success(result.message);
      setAmount(0);
      setReason('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-50 w-72 animate-scale-in">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">手动调整积分</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            积分数量
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-center"
            placeholder="输入数量"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            调整原因
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="例如：额外奖励、迟到扣分"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleAdjust('subtract')}
            className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-1.5 text-sm"
          >
            <Minus className="w-4 h-4" />
            扣分
          </button>
          <button
            onClick={() => handleAdjust('add')}
            className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            加分
          </button>
        </div>
      </div>
    </div>
  );
}
