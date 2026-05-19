import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { TaskTemplates } from './TaskTemplates';
import { ListTodo, Calendar, Sparkles } from 'lucide-react';
import type { TaskTemplate } from '../data/templates';
import toast from 'react-hot-toast';

export function TaskList() {
  const tasks = useStore((state) => state.tasks);
  const currentMemberId = useStore((state) => state.currentMemberId);
  const addTask = useStore((state) => state.addTask);
  const [filterDate, setFilterDate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const memberTasks = tasks.filter((t) => !t.memberId || t.memberId === currentMemberId);
  const activeTasks = memberTasks.filter((t) => !t.completed);
  const completedTasks = memberTasks.filter((t) => t.completed);

  const filteredActiveTasks = filterDate
    ? activeTasks.filter((t) => t.dueDate === filterDate)
    : activeTasks;

  const filteredCompletedTasks = filterDate
    ? completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        const taskDate = t.completedAt.split('T')[0];
        return taskDate === filterDate;
      })
    : completedTasks;

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    addTask(template.name, template.points, template.category, getTodayString());
    toast.success('任务添加成功');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="flex-1">
          <TaskForm />
        </div>
        <button
          onClick={() => setShowTemplates(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden sm:inline">模板库</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 card-shadow">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            min={getTodayString()}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-black bg-white"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-sm text-primary hover:text-primary/80"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {filteredActiveTasks.length === 0 && filteredCompletedTasks.length === 0 && (
        <div className="bg-white rounded-2xl p-8 card-shadow text-center">
          <ListTodo className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {filterDate ? '该日期暂无任务' : '还没有任务'}
          </h3>
          <p className="text-gray-400">
            {filterDate ? '试试其他日期吧' : '点击上方按钮添加你的第一个任务吧'}
          </p>
        </div>
      )}

      {filteredActiveTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 px-2">
            待完成 ({filteredActiveTasks.length})
          </h2>
          <div className="space-y-3">
            {filteredActiveTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {filteredCompletedTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-500 px-2">
            已完成 ({filteredCompletedTasks.length})
          </h2>
          <div className="space-y-3">
            {filteredCompletedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      <TaskTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleSelectTemplate}
        onCustomTask={() => {
          setShowTemplates(false);
          document.getElementById('task-input')?.focus();
        }}
      />
    </div>
  );
}
