import React, { useState } from 'react';
import { Flame, Settings, Save, RotateCcw } from 'lucide-react';
import { useStore, StreakRewardConfig, defaultStreakRewards } from '../store/useStore';

const emojiOptions = ['🌟', '🔥', '🏆', '💎', '👑', '⭐', '✨', '🎉', '🎊', '💪', '🚀', '🌈', '💫', '🏅', '🥇', '🎖️'];

interface StreakSettingsProps {
  onClose?: () => void;
}

export const StreakSettings = ({ onClose }: StreakSettingsProps) => {
  const streakRewards = useStore((state) => state.streakRewards);
  const updateStreakRewards = useStore((state) => state.updateStreakRewards);
  const [rewards, setRewards] = useState<StreakRewardConfig[]>(() => {
    return [...streakRewards];
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePointsChange = (index: number, points: number) => {
    const newRewards = [...rewards];
    newRewards[index].points = Math.max(0, points);
    setRewards(newRewards);
    setHasChanges(true);
  };

  const handleEmojiChange = (index: number, emoji: string) => {
    const newRewards = [...rewards];
    newRewards[index].emoji = emoji;
    setRewards(newRewards);
    setHasChanges(true);
  };

  const handleNameChange = (index: number, name: string) => {
    const newRewards = [...rewards];
    newRewards[index].name = name;
    setRewards(newRewards);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    updateStreakRewards(rewards);
    setHasChanges(false);
    setIsSaving(false);
    alert('保存成功！');
    if (onClose) onClose();
  };

  const handleReset = () => {
    setRewards(defaultStreakRewards);
    setHasChanges(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          连续打卡奖励设置
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {rewards.map((reward, index) => (
          <div key={reward.days} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{reward.emoji}</div>
              <div className="flex-1">
                <input
                  type="text"
                  value={reward.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-orange-200 bg-white text-gray-800 font-medium"
                  placeholder="奖励名称"
                />
                <div className="text-sm text-gray-500 mt-1">连续 {reward.days} 天</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">积分奖励</label>
                <input
                  type="number"
                  value={reward.points}
                  onChange={(e) => handlePointsChange(index, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-800 font-mono text-center"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">图标</label>
                <select
                  value={reward.emoji}
                  onChange={(e) => handleEmojiChange(index, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200 bg-white text-gray-800"
                >
                  {emojiOptions.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          恢复默认
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
            hasChanges && !isSaving
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          {isSaving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
};

export default StreakSettings;
