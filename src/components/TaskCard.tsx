import { useState } from 'react';
import { Check, Trash2, Calendar, Repeat } from 'lucide-react';
import { Task, useStore } from '../store/useStore';
import { ConfirmDialog } from './ConfirmDialog';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const completeTask = useStore((state) => state.completeTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleComplete = () => {
    const result = completeTask(task.id);
    if (result.success) {
      toast.success(result.message, {
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
        },
      });
    } else {
      toast.error(result.message);
    }
  };

  const handleConfirmDelete = () => {
    deleteTask(task.id);
    toast.success('任务已删除');
    setShowDeleteConfirm(false);
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(dateStr);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return '今天';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const overdue = isOverdue();

  return (
    <>
      <div
        className={`bg-white rounded-2xl p-4 sm:p-5 card-shadow transition-all hover:card-shadow-lg ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            onClick={handleComplete}
            disabled={task.completed}
            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              task.completed
                ? 'bg-secondary text-white'
                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
            }`}
          >
            <Check className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <div className="flex-1 min-w-0 pt-1">
            <h3
              className={`font-semibold text-base sm:text-lg ${
                task.completed ? 'line-through text-gray-400' : 'text-gray-800'
              }`}
            >
              {task.name}
            </h3>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-sm font-mono font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-lg">
                +{task.points}
              </span>
              {task.repeatType && task.repeatType !== 'none' && (
                <span
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${
                    task.repeatType === 'daily'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-purple-600 bg-purple-50'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  {task.repeatType === 'daily' ? '每日' : '每周'}
                </span>
              )}
              {task.category && (
                <span className="text-sm text-gray-500">{task.category}</span>
              )}
              {task.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg ${
                    overdue
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-500 bg-gray-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDueDate(task.dueDate)}
                  {overdue && ' (已逾期)'}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
          >
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除任务"
        message={`确定要删除"${task.name}"吗？删除后无法恢复。`}
        confirmText="删除"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
