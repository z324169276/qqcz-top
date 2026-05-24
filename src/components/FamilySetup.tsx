import { useEffect, useState, useRef } from 'react';
import { Users, Copy, LogIn } from 'lucide-react';
import { createFamily, joinFamily, listFamiliesByOwner, sendEmailLink, ensureMembership } from '../api';
import toast from 'react-hot-toast';

interface FamilySetupProps {
  onComplete: (familyId: string) => void;
  onShowAdmin?: () => void;
}

export function FamilySetup({ onComplete, onShowAdmin }: FamilySetupProps) {
  const [mode, setMode] = useState<'choice' | 'create' | 'join' | 'recover' | 'recoverList'>('choice');
  const [familyName, setFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoveredFamilies, setRecoveredFamilies] = useState<Array<{ familycode: string; familyname: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('recover')) return;

    const run = async () => {
      setIsLoading(true);
      try {
        const list = await listFamiliesByOwner();
        setRecoveredFamilies(list as any);
        setMode('recoverList');
      } catch (e: any) {
        toast.error(e?.message || '找回失败');
        setMode('recover');
      } finally {
        setIsLoading(false);
        params.delete('recover');
        const query = params.toString();
        const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, '', nextUrl);
      }
    };

    run();
  }, []);

  const handleLogoClick = () => {
    clickCount.current++;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 1000);

    if (clickCount.current >= 5 && onShowAdmin) {
      onShowAdmin();
      clickCount.current = 0;
    }
  };

  const handleCreate = async () => {
    if (!familyName.trim()) {
      toast.error('请输入家庭名称');
      return;
    }

    setIsLoading(true);
    try {
      const familyCode = await createFamily(familyName.trim());
      toast.success('家庭创建成功！');
      onComplete(familyCode);
    } catch (error) {
      toast.error('创建失败，请重试');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      toast.error('请输入邀请码');
      return;
    }

    setIsLoading(true);
    try {
      const result = await joinFamily(joinCode);
      if (result.success) {
        toast.success(result.message);
        onComplete(joinCode);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('加入失败，请重试');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecoverEmail = async () => {
    const value = recoverEmail.trim();
    if (!value) {
      toast.error('请输入邮箱');
      return;
    }
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/?recover=1`;
      await sendEmailLink(value, redirectTo);
      toast.success('已发送找回邮件，请打开邮件链接继续');
    } catch (e: any) {
      toast.error(e?.message || '发送失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterRecoveredFamily = async (familyCode: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem('familyId', familyCode);
      await ensureMembership(familyCode);
      toast.success('已进入家庭');
      onComplete(familyCode);
    } catch (e: any) {
      toast.error(e?.message || '进入失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleLogoClick}
          >
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">青春成长积分册</h1>
          <p className="text-gray-500">创建或加入一个家庭，开始积分之旅</p>
        </div>

        {mode === 'choice' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
              <Users className="w-5 h-5" />
              创建新家庭
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              加入已有家庭
            </button>
            <button
              onClick={() => setMode('recover')}
              className="w-full py-3 px-6 bg-white border border-gray-200 text-gray-500 rounded-xl font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all"
            >
              忘记家庭码？用邮箱找回
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                家庭名称
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="例如：幸福之家、阳光家庭"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black"
                maxLength={20}
                autoFocus
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? '创建中...' : '创建家庭'}
            </button>
            <button
              onClick={() => setMode('choice')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-all"
            >
              返回
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入邀请码
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="例如：ABC123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-center text-2xl tracking-widest font-mono text-black"
                maxLength={6}
                autoFocus
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={isLoading || joinCode.length < 6}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? '加入中...' : '加入家庭'}
            </button>
            <button
              onClick={() => setMode('choice')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-all"
            >
              返回
            </button>
          </div>
        )}

        {mode === 'recover' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              请输入绑定过的邮箱，我们会发送找回链接到邮箱。
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={recoverEmail}
                onChange={(e) => setRecoverEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black"
                autoFocus
              />
            </div>
            <button
              onClick={handleSendRecoverEmail}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? '发送中...' : '发送找回邮件'}
            </button>
            <button
              onClick={() => setMode('choice')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-all"
            >
              返回
            </button>
          </div>
        )}

        {mode === 'recoverList' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              找回结果（选择一个家庭进入）：
            </div>
            {recoveredFamilies.length === 0 ? (
              <div className="text-sm text-gray-500">
                没有找到已绑定的家庭码。请确认该邮箱之前已在某个家庭内绑定。
              </div>
            ) : (
              <div className="space-y-3">
                {recoveredFamilies.map((f) => (
                  <div key={f.familycode} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">家庭邀请码</div>
                      <div className="text-xl font-mono font-bold text-gray-800 tracking-wider">{f.familycode}</div>
                      <div className="text-sm text-gray-600 truncate">{f.familyname}</div>
                    </div>
                    <button
                      onClick={() => handleEnterRecoveredFamily(f.familycode)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      进入
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setMode('choice')}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-all"
            >
              返回
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>家庭创建者会获得一个邀请码</p>
          <p>分享邀请码，其他家庭成员即可加入</p>
        </div>
      </div>
    </div>
  );
}

interface FamilyCodeDisplayProps {
  familyCode: string;
  familyName: string;
}

export function FamilyCodeDisplay({ familyCode, familyName }: FamilyCodeDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-emerald-600 font-medium mb-1">家庭邀请码</p>
          <p className="text-2xl font-mono font-bold text-emerald-700 tracking-wider">{familyCode}</p>
          <p className="text-sm text-emerald-600 mt-1">{familyName}</p>
        </div>
        <button
          onClick={() => copyToClipboard(familyCode)}
          className="p-3 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
          title="复制邀请码"
        >
          <Copy className="w-5 h-5 text-emerald-600" />
        </button>
      </div>
      <p className="text-xs text-emerald-500 mt-3">
        分享邀请码，其他家庭成员输入后可加入同一家庭
      </p>
    </div>
  );
}
