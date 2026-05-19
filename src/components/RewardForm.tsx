import { useState } from 'react';
import { Plus, BookOpen, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { rewardTemplates, rewardCategories } from '../data/templates';
import toast from 'react-hot-toast';

const emojiOptions = [
  '🎁', '🎮', '📱', '🎧', '🎤', '🎸', '🎹', '🎺',
  '🎪', '🎨', '🎭', '🎬', '🎯', '🎲', '🎳', '🎰',
  '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎵', '🎶',
  '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📒',
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒',
  '🍕', '🍔', '🌭', '🍿', '🍩', '🍪', '🍰', '🍫',
  '🎂', '🍭', '🍬', '🍦', '🍧', '🍨', '🍯', '☕',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'
];

export function RewardForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [points, setPoints] = useState(50);
  const [stock, setStock] = useState(1);
  const [emoji, setEmoji] = useState('🎁');
  const addReward = useStore((state) => state.addReward);

  const filteredTemplates = selectedCategory
    ? rewardTemplates.filter(t => t.category === selectedCategory)
    : rewardTemplates;

  const handleSelectTemplate = (template: typeof rewardTemplates[0]) => {
    setName(template.name);
    setPoints(template.points);
    setStock(template.stock);
    setEmoji(template.emoji);
    setShowTemplates(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('请输入奖励名称');
      return;
    }

    if (points < 1) {
      toast.error('积分必须大于0');
      return;
    }

    if (stock < 1) {
      toast.error('库存必须大于0');
      return;
    }

    addReward(name.trim(), points, stock, emoji);
    toast.success('奖励创建成功');
    setName('');
    setPoints(50);
    setStock(1);
    setEmoji('🎁');
    setShowTemplates(false);
    setShowEmojiPicker(false);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setShowTemplates(false);
    setName('');
    setPoints(50);
    setStock(1);
    setEmoji('🎁');
  };

  if (!isExpanded) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white border-2 border-dashed border-secondary/30 hover:border-secondary text-secondary rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all hover:bg-secondary/5"
        >
          <Plus className="w-5 h-5" />
          添加新奖励
        </button>
        
        <button
          onClick={() => { setIsExpanded(true); setShowTemplates(true); }}
          className="w-full bg-white border-2 border-dashed border-blue-300 hover:border-blue-400 text-blue-600 rounded-2xl py-3 px-6 flex items-center justify-center gap-2 font-medium transition-all hover:bg-blue-50"
        >
          <BookOpen className="w-5 h-5" />
          从模板库选择
        </button>
      </div>
    );
  }

  if (showTemplates) {
    return (
      <div className="bg-white rounded-2xl p-6 card-shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">奖励模板库</h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-secondary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {rewardCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-secondary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-secondary hover:bg-secondary/5 transition-all text-left"
            >
              <span className="text-2xl">{template.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">{template.name}</div>
                <div className="text-xs text-gray-500">{template.points}积分</div>
              </div>
              <Check className="w-4 h-4 text-secondary opacity-0" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowTemplates(false)}
          className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all"
        >
          手动创建
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-6 card-shadow-lg animate-scale-in"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              奖励名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：奶茶一杯"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图标
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-secondary focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-center text-3xl bg-white"
              >
                {emoji}
              </button>
              
              {showEmojiPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-10">
                  <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto">
                    {emojiOptions.map((e, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setEmoji(e);
                          setShowEmojiPicker(false);
                        }}
                        className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all ${
                          emoji === e
                            ? 'bg-secondary text-white shadow-md scale-110'
                            : 'hover:bg-gray-100 hover:scale-105'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所需积分
            </label>
            <div className="relative">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                积分
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              库存数量
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 rounded-xl bg-secondary text-white font-medium hover:bg-secondary/90 transition-all"
          >
            创建奖励
          </button>
        </div>
      </div>
    </form>
  );
}
