import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { supabase } from '../supabase';

interface DirectPointsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectPointsEditor = ({ isOpen, onClose }: DirectPointsEditorProps) => {
  const points = useStore((state) => state.points);
  const familyId = useStore((state) => state.familyId);
  const currentMemberId = useStore((state) => state.currentMemberId);
  const history = useStore((state) => state.history);
  const [newPoints, setNewPoints] = useState<number>(points);
  const [reason, setReason] = useState('');
  const [pin, setPin] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    const storedPin = localStorage.getItem('familyPin');
    
    if (storedPin && pin !== storedPin) {
      toast.error('PIN码错误');
      return;
    }

    if (!storedPin && pin.trim()) {
      toast.error('请先设置PIN码');
      return;
    }

    if (newPoints < 0) {
      toast.error('积分不能为负数');
      return;
    }

    const diff = newPoints - points;
    
    if (diff === 0) {
      toast.success('积分未变化');
      onClose();
      return;
    }

    const adjustment = {
      id: `adj_${Date.now()}`,
      memberId: currentMemberId,
      type: 'adjust' as const,
      points: Math.abs(diff),
      description: reason.trim() || (diff > 0 ? '积分修正增加' : '积分修正减少'),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };

    const newHistory = [adjustment, ...history];

    if (familyId) {
      // #region debug-point points-adjust-revert.direct.before-cloud
      if (new URLSearchParams(window.location.search).has('debugPoints')) {
        localStorage.setItem('__points_adjust_debug', JSON.stringify({
          at: new Date().toISOString(),
          source: 'direct-points-editor',
          phase: 'before-cloud',
          familyId,
          currentMemberId,
          oldPoints: points,
          newPoints,
          diff,
        }));
      }
      // #endregion debug-point points-adjust-revert.direct.before-cloud

      await supabase
        .from('families')
        .update({ 
          points: newPoints,
          history: newHistory,
          lastModified: new Date().toISOString()
        })
        .eq('familycode', familyId);

      // #region debug-point points-adjust-revert.direct.after-cloud
      if (new URLSearchParams(window.location.search).has('debugPoints')) {
        localStorage.setItem('__points_adjust_debug', JSON.stringify({
          at: new Date().toISOString(),
          source: 'direct-points-editor',
          phase: 'after-cloud',
          familyId,
          currentMemberId,
          oldPoints: points,
          newPoints,
          diff,
        }));
      }
      // #endregion debug-point points-adjust-revert.direct.after-cloud
    }

    useStore.setState({
      points: newPoints,
      history: newHistory,
    });

    // #region debug-point points-adjust-revert.direct.after-local
    if (new URLSearchParams(window.location.search).has('debugPoints')) {
      localStorage.setItem('__points_adjust_debug', JSON.stringify({
        at: new Date().toISOString(),
        source: 'direct-points-editor',
        phase: 'after-local',
        familyId,
        currentMemberId,
        oldPoints: points,
        newPoints,
        diff,
      }));
    }
    // #endregion debug-point points-adjust-revert.direct.after-local

    toast.success('积分已修改');
    onClose();
  };

  const hasPin = localStorage.getItem('familyPin');

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary to-purple-600 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white">直接修改总积分</h2>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                当前总积分：<span className="font-bold text-2xl">{points}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入新的总积分
              </label>
              <input
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-2xl font-mono text-center text-black"
                placeholder="输入积分"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修改原因（选填）
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-black resize-none"
                placeholder="例如：数据修正、系统调整"
              />
            </div>

            {hasPin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入PIN码确认
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center font-mono text-xl tracking-widest text-black"
                  placeholder="请输入PIN码"
                />
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                ⚠️ 此操作会直接修改总积分，请谨慎操作。修改后可在历史记录中查看调整详情。
              </p>
            </div>
          </div>

          <div className="p-4 border-t flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-medium hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-md"
            >
              确认修改
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
