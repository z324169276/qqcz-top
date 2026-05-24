import { useState } from 'react';
import toast from 'react-hot-toast';
import { sendEmailLink } from '../api';

interface EmailBindModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
}

export function EmailBindModal({ isOpen, onClose, familyId }: EmailBindModalProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    const value = email.trim();
    if (!value) {
      toast.error('请输入邮箱');
      return;
    }

    setIsSending(true);
    try {
      const redirectTo = `${window.location.origin}/?bindOwner=1`;
      await sendEmailLink(value, redirectTo);
      toast.success('已发送绑定邮件，请打开邮件链接完成绑定');
      onClose();
    } catch (e: any) {
      toast.error(e?.message || '发送失败');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">绑定邮箱找回家庭码</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600">
              绑定后，如果忘记家庭码，可用邮箱登录找回。
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-black"
              />
            </div>
            <div className="text-xs text-gray-500">
              当前家庭码：{familyId}
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
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSending ? '发送中...' : '发送绑定邮件'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

