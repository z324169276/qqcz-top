import { useState } from 'react';
import { Plus, Calendar, Repeat } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export function TaskForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [points, setPoints] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly'>('none');
  const addTask = useStore((state) => state.addTask);

  const resetForm = () => {
    setName('');
    setPoints('');
    setCategory('');
    setRepeatType('none');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setDueDate(`${year}-${month}-${day}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('请输入任务名称');
      return;
    }

    const pointsValue = parseInt(points);
    if (!pointsValue || pointsValue <= 0) {
      toast.error('请输入有效的积分奖励');
      return;
    }

    addTask(name.trim(), pointsValue, category.trim() || undefined, dueDate || undefined, repeatType);
    toast.success('任务创建成功');
    
    resetForm();
    setIsExpanded(false);
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-white border-2 border-dashed border-primary/30 hover:border-primary text-primary rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-medium transition-all hover:bg-primary/5"
      >
        <Plus className="w-5 h-5" />
        添加新任务
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-6 card-shadow-lg animate-scale-in"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            任务名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：完成学习计划"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-black bg-white"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              积分奖励
            </label>
            <div className="relative">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="1"
                placeholder="积分"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-black bg-white text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              截止日期
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={getTodayString()}
                className="w-full px-2 sm:px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-black bg-white text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            重复类型
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRepeatType('none')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                repeatType === 'none'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              不重复
            </button>
            <button
              type="button"
              onClick={() => setRepeatType('daily')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                repeatType === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <Repeat className="w-4 h-4" />
              每日
            </button>
            <button
              type="button"
              onClick={() => setRepeatType('weekly')}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                repeatType === 'weekly'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Repeat className="w-4 h-4" />
              每周
            </button>
          </div>
          {repeatType !== 'none' && (
            <p className="text-xs text-gray-500 mt-2">
              {repeatType === 'daily' && '每天自动重置，完成后第二天可再次完成'}
              {repeatType === 'weekly' && '每周自动重置，完成后下周可再次完成'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类（可选）
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如：学习"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-black bg-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsExpanded(false);
            }}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all"
          >
            创建任务
          </button>
        </div>
      </div>
    </form>
  );
}
