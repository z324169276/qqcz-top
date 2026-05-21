import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Home, Users, TrendingUp, Activity, Calendar, Trophy, ArrowLeft, Clock, Flame, BarChart3, LogOut, Eye, EyeOff, Shield, AlertCircle, Search, Pencil, RotateCcw, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { ConfirmDialog } from './ConfirmDialog';

interface FamilyData {
  familycode: string;
  familyname: string;
  points: number;
  members: any[];
  tasks: any[];
  rewards: any[];
  history: any[];
  created_at?: string;
  updated_at?: string;
}

interface LoginAttempt {
  time: number;
  success: boolean;
}

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [families, setFamilies] = useState<FamilyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckError, setAdminCheckError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dataErrorMessage, setDataErrorMessage] = useState('');
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [setPasswordMessage, setSetPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState<'created_at' | 'points' | 'members' | 'tasks' | 'familyname'>('created_at');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [editingFamily, setEditingFamily] = useState<FamilyData | null>(null);
  const [editingFamilyName, setEditingFamilyName] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { type: 'reset' | 'delete'; family: FamilyData }>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 5 * 60 * 1000;
  const PAGE_SIZE = 20;

  const getReadableErrorMessage = (error: unknown) => {
    if (!error) return '获取数据失败';
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
      const anyError = error as any;
      if (typeof anyError.message === 'string' && anyError.message) {
        const extras = [anyError.details, anyError.hint, anyError.code].filter(Boolean).join(' | ');
        return extras ? `${anyError.message} (${extras})` : anyError.message;
      }
      try {
        return JSON.stringify(anyError);
      } catch {
        return '获取数据失败';
      }
    }
    return String(error);
  };

  const checkLockout = useCallback(() => {
    const stored = localStorage.getItem('admin_lockout');
    if (stored) {
      const lockoutTime = parseInt(stored);
      if (Date.now() < lockoutTime) {
        setLockoutUntil(lockoutTime);
        return true;
      } else {
        localStorage.removeItem('admin_lockout');
        setLockoutUntil(null);
      }
    }
    return false;
  }, []);

  useEffect(() => {
    checkLockout();
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [checkLockout]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setIsAdmin(null);
      setAdminCheckError('');
      return;
    }

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setIsAdmin(false);
        setAdminCheckError(error.message);
        return;
      }

      setAdminCheckError('');
      setIsAdmin(!!data);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    setDataErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*');

      if (error) throw error;
      setFamilies(data || []);
    } catch (error) {
      console.error('获取数据失败:', error);
      setFamilies([]);
      setDataErrorMessage(getReadableErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const canOperateFamilies = isAdmin === true;

  const ensureCanOperateFamilies = () => {
    if (canOperateFamilies) return true;
    toast.error(isAdmin === null ? '管理员校验中，请稍等…' : '仅管理员可操作');
    return false;
  };

  const invokeAdminFamilyAction = async (action: 'update' | 'reset' | 'delete', family: FamilyData, extra?: Record<string, unknown>) => {
    if (!ensureCanOperateFamilies()) {
      return;
    }

    setActionLoading(`${action}:${family.familycode}`);
    try {
      if (action === 'update') {
        const familyname = (extra?.familyname as string | undefined)?.trim();
        if (!familyname) throw new Error('缺少家庭名称');

        const { error } = await supabase
          .from('families')
          .update({ familyname })
          .eq('familycode', family.familycode);

        if (error) throw error;

        setFamilies((prev) => prev.map((f) => (f.familycode === family.familycode ? { ...f, familyname } : f)));
        toast.success('家庭信息已更新');
        return;
      }

      if (action === 'reset') {
        const resetData = {
          points: 0,
          tasks: [],
          rewards: [],
          history: [],
          members: [],
        };

        const { error } = await supabase
          .from('families')
          .update(resetData)
          .eq('familycode', family.familycode);

        if (error) throw error;

        setFamilies((prev) =>
          prev.map((f) =>
            f.familycode === family.familycode
              ? { ...f, points: 0, tasks: [], rewards: [], history: [], members: [] }
              : f
          )
        );
        toast.success('家庭数据已清空');
        return;
      }

      if (action === 'delete') {
        const { error } = await supabase
          .from('families')
          .delete()
          .eq('familycode', family.familycode);

        if (error) throw error;

        setFamilies((prev) => prev.filter((f) => f.familycode !== family.familycode));
        toast.success('家庭已删除');
      }
    } catch (err) {
      toast.error(getReadableErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSortedFamilies = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    const filtered = keyword
      ? families.filter((f) => (f.familycode ?? '').toLowerCase().includes(keyword) || (f.familyname ?? '').toLowerCase().includes(keyword))
      : families.slice();

    const getCreatedAtValue = (f: FamilyData) => {
      const ts = f.created_at ? Date.parse(f.created_at) : 0;
      return Number.isNaN(ts) ? 0 : ts;
    };

    const sorted = filtered.sort((a, b) => {
      let av = 0;
      let bv = 0;

      if (sortKey === 'created_at') {
        av = getCreatedAtValue(a);
        bv = getCreatedAtValue(b);
      } else if (sortKey === 'points') {
        av = a.points || 0;
        bv = b.points || 0;
      } else if (sortKey === 'members') {
        av = a.members?.length || 0;
        bv = b.members?.length || 0;
      } else if (sortKey === 'tasks') {
        av = a.tasks?.length || 0;
        bv = b.tasks?.length || 0;
      }

      if (sortKey === 'familyname') {
        const result = (a.familyname || '').localeCompare(b.familyname || '', 'zh-Hans-CN');
        return sortDir === 'asc' ? result : -result;
      }

      const diff = av - bv;
      return sortDir === 'asc' ? diff : -diff;
    });

    return sorted;
  }, [families, searchText, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedFamilies.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pageFamilies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSortedFamilies.slice(start, start + PAGE_SIZE);
  }, [filteredSortedFamilies, page]);

  const openEditFamily = (family: FamilyData) => {
    if (!ensureCanOperateFamilies()) return;
    setEditingFamily(family);
    setEditingFamilyName(family.familyname || '');
    setIsEditOpen(true);
  };

  const closeEditFamily = () => {
    setIsEditOpen(false);
    setEditingFamily(null);
    setEditingFamilyName('');
  };

  const handleSaveEditFamily = async () => {
    if (!editingFamily) return;
    const name = editingFamilyName.trim();
    if (!name) {
      toast.error('请输入家庭名称');
      return;
    }
    await invokeAdminFamilyAction('update', editingFamily, { familyname: name });
    closeEditFamily();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (checkLockout()) {
      setErrorMessage('登录失败次数过多，请稍后再试');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      localStorage.removeItem('admin_lockout');
      setLoginAttempts([]);
      setPassword('');
      return;
    }

    const attempts = [...loginAttempts, { time: Date.now(), success: false }];
    setLoginAttempts(attempts);
    localStorage.setItem('admin_attempts', JSON.stringify(attempts));

    const failedAttempts = attempts.filter(a => !a.success && Date.now() - a.time < 15 * 60 * 1000).length;
    if (failedAttempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION;
      localStorage.setItem('admin_lockout', lockoutTime.toString());
      setLockoutUntil(lockoutTime);
      setErrorMessage('登录失败次数过多，请5分钟后再试');
    } else {
      setErrorMessage(`登录失败（${error.message}），剩余尝试次数：${MAX_ATTEMPTS - failedAttempts}`);
    }
    setPassword('');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setFamilies([]);
    setUserId(null);
    setIsAdmin(null);
    setAdminCheckError('');
    setDataErrorMessage('');
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetPasswordMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setSetPasswordMessage({ type: 'error', text: '密码至少 6 位' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSetPasswordMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setSetPasswordMessage({ type: 'error', text: `设置失败：${error.message}` });
      return;
    }

    setSetPasswordMessage({ type: 'success', text: '密码设置成功' });
    setNewPassword('');
    setConfirmNewPassword('');
    setShowSetPassword(false);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getDateNDaysAgo = (n: number) => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date.toISOString().split('T')[0];
  };

  const getNewFamiliesToday = () => {
    const today = getTodayDate();
    return families.filter(f => f.created_at?.startsWith(today)).length;
  };

  const getNewFamiliesThisWeek = () => {
    const weekAgo = getDateNDaysAgo(7);
    return families.filter(f => f.created_at && f.created_at >= weekAgo).length;
  };

  const getActiveFamiliesToday = () => {
    const today = getTodayDate();
    return families.filter(f => {
      if (!f.history || f.history.length === 0) return false;
      const recentHistory = f.history.some((h: any) => h.timestamp?.startsWith(today));
      return recentHistory;
    }).length;
  };

  const getActiveFamiliesThisWeek = () => {
    const weekAgo = getDateNDaysAgo(7);
    return families.filter(f => {
      if (!f.history || f.history.length === 0) return false;
      const recentHistory = f.history.some((h: any) => h.timestamp && h.timestamp >= weekAgo);
      return recentHistory;
    }).length;
  };

  const getTotalHistoryCount = () => {
    return families.reduce((sum, f) => sum + (f.history?.length || 0), 0);
  };

  const getTodayActivityCount = () => {
    const today = getTodayDate();
    return families.reduce((sum, f) => {
      const todayHistory = f.history?.filter((h: any) => h.timestamp?.startsWith(today)).length || 0;
      return sum + todayHistory;
    }, 0);
  };

  const getWeeklyActivityCount = () => {
    const weekAgo = getDateNDaysAgo(7);
    return families.reduce((sum, f) => {
      const weekHistory = f.history?.filter((h: any) => h.timestamp && h.timestamp >= weekAgo).length || 0;
      return sum + weekHistory;
    }, 0);
  };

  const getAveragePointsPerFamily = () => {
    if (families.length === 0) return 0;
    const total = families.reduce((sum, f) => sum + (f.points || 0), 0);
    return Math.round(total / families.length);
  };

  const getAverageMembersPerFamily = () => {
    if (families.length === 0) return 0;
    const total = families.reduce((sum, f) => sum + (f.members?.length || 0), 0);
    return (total / families.length).toFixed(1);
  };

  const totalFamilies = families.length;
  const totalMembers = families.reduce((sum, f) => sum + (f.members?.length || 0), 0);
  const totalTasks = families.reduce((sum, f) => sum + (f.tasks?.length || 0), 0);
  const totalPoints = families.reduce((sum, f) => sum + (f.points || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">管理后台</h1>
            <p className="text-gray-500">请输入管理员账号访问</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="管理员邮箱"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black"
                  disabled={!!lockoutUntil}
                  autoFocus
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="管理员密码"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black pr-12"
                  disabled={!!lockoutUntil}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errorMessage && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!!lockoutUntil || !email || !password}
              className="w-full py-3 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lockoutUntil ? '请稍后再试' : '登录'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 text-gray-500 hover:text-gray-700 transition-all"
            >
              返回首页
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              安全提示：连续5次密码错误将锁定5分钟
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
              <p className="text-gray-500 text-sm">家庭数据统计</p>
              {userId && (
                <p className="text-gray-400 text-xs mt-1">
                  UID：{userId}
                  {isAdmin !== null && (
                    <span className={isAdmin ? 'text-green-600' : 'text-red-500'}>
                      {' '}
                      · {isAdmin ? '已授权管理员' : '未授权管理员'}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSetPasswordMessage(null);
                setShowSetPassword((v) => !v);
              }}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              设置密码
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              {isLoading ? '加载中...' : '刷新数据'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>

        {showSetPassword && (
          <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              设置/修改管理员密码
            </h2>

            <form onSubmit={handleSetPassword} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新密码（至少 6 位）"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="再次输入新密码"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all"
                >
                  保存密码
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSetPassword(false);
                    setSetPasswordMessage(null);
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                  className="py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                >
                  取消
                </button>
              </div>
            </form>

            {setPasswordMessage && (
              <div className={`mt-3 text-sm ${setPasswordMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {setPasswordMessage.text}
              </div>
            )}
          </div>
        )}

        {isAdmin === false && userId && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="text-sm text-red-700">
                <div className="font-medium">当前账号未被授权为管理员</div>
                <div className="mt-1">
                  这会导致在 RLS 开启时读取 families 全表结果为 0。请在 Supabase 的 public.admins 表插入该 UID：{userId}
                </div>
                {adminCheckError && <div className="mt-1">检查权限失败：{adminCheckError}</div>}
              </div>
            </div>
          </div>
        )}

        {dataErrorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            获取数据失败：{dataErrorMessage}
          </div>
        )}

        {/* 基础统计卡片 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            基础统计
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">家庭总数</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalFamilies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">成员总数</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalMembers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">任务总数</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalTasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">总积分</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">{totalPoints}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 增长统计 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            增长统计
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 shadow-sm border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">今日</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-700">{getNewFamiliesToday()}</p>
              <p className="text-xs sm:text-sm text-gray-500">新增家庭</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-5 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">本周</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-700">{getNewFamiliesThisWeek()}</p>
              <p className="text-xs sm:text-sm text-gray-500">新增家庭</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-5 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">今日</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700">{getActiveFamiliesToday()}</p>
              <p className="text-xs sm:text-sm text-gray-500">活跃家庭</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">本周</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-700">{getActiveFamiliesThisWeek()}</p>
              <p className="text-xs sm:text-sm text-gray-500">活跃家庭</p>
            </div>
          </div>
        </div>

        {/* 活跃度统计 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            活跃度统计
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">今日活动</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">{getTodayActivityCount()}</p>
              <p className="text-xs text-gray-400">条记录</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">本周活动</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">{getWeeklyActivityCount()}</p>
              <p className="text-xs text-gray-400">条记录</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">历史总活动</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">{getTotalHistoryCount()}</p>
              <p className="text-xs text-gray-400">条记录</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-gray-500 text-xs sm:text-sm mb-2">平均家庭积分</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{getAveragePointsPerFamily()}</p>
              <p className="text-xs text-gray-400">积分/家庭</p>
            </div>
          </div>
        </div>

        {/* 家庭列表 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-800">家庭列表</h2>
              <span className="text-sm text-gray-500">{filteredSortedFamilies.length} 个家庭</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索家庭名/家庭码"
                  className="w-48 md:w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white"
              >
                <option value="created_at">按创建时间</option>
                <option value="points">按积分</option>
                <option value="members">按成员数</option>
                <option value="tasks">按任务数</option>
                <option value="familyname">按家庭名称</option>
              </select>
              <button
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                {sortDir === 'asc' ? '升序' : '降序'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : families.length === 0 ? (
            <div className="p-12 text-center">
              <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无家庭数据</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <div>
                  第 {page} / {totalPages} 页（每页 {PAGE_SIZE} 条）
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
              {/* Mobile Cards (sm up: Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        家庭码
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        家庭名称
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        成员数
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        任务数
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        积分
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pageFamilies.map((family) => (
                    <tr key={family.familycode} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-indigo-600">{family.familycode}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-800">
                        {family.familyname || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                        {family.members?.length || 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                        {family.tasks?.length || 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-semibold text-amber-600">
                        {family.points || 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-sm">
                        {family.created_at ? new Date(family.created_at).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditFamily(family)}
                            disabled={actionLoading === `update:${family.familycode}`}
                            className={`px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 ${canOperateFamilies ? '' : 'opacity-50'}`}
                          >
                            <Pencil className="w-4 h-4" />
                            编辑
                          </button>
                          <button
                            onClick={() => {
                              if (!ensureCanOperateFamilies()) return;
                              setConfirmAction({ type: 'reset', family });
                            }}
                            disabled={actionLoading === `reset:${family.familycode}`}
                            className={`px-3 py-1.5 bg-white border border-orange-200 rounded-lg text-sm text-orange-700 hover:bg-orange-50 disabled:opacity-50 flex items-center gap-1 ${canOperateFamilies ? '' : 'opacity-50'}`}
                          >
                            <RotateCcw className="w-4 h-4" />
                            清空
                          </button>
                          <button
                            onClick={() => {
                              if (!ensureCanOperateFamilies()) return;
                              setConfirmAction({ type: 'delete', family });
                            }}
                            disabled={actionLoading === `delete:${family.familycode}`}
                            className={`px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1 ${canOperateFamilies ? '' : 'opacity-50'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile View: Cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {pageFamilies.map((family) => (
                  <div key={family.familycode} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-mono font-semibold text-indigo-600 text-sm">{family.familycode}</div>
                        <div className="text-gray-800 font-medium mt-1">{family.familyname || '-'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-600 font-bold">{family.points || 0}</div>
                        <div className="text-xs text-gray-500">积分</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">成员:</span> {family.members?.length || 0}
                      </div>
                      <div>
                        <span className="text-gray-500">任务:</span> {family.tasks?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {family.created_at ? new Date(family.created_at).toLocaleDateString('zh-CN') : '-'}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEditFamily(family)}
                        disabled={actionLoading === `update:${family.familycode}`}
                        className={`px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 ${canOperateFamilies ? '' : 'opacity-50'}`}
                      >
                        <Pencil className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={() => {
                          if (!ensureCanOperateFamilies()) return;
                          setConfirmAction({ type: 'reset', family });
                        }}
                        disabled={actionLoading === `reset:${family.familycode}`}
                        className={`px-3 py-1.5 bg-white border border-orange-200 rounded-lg text-sm text-orange-700 hover:bg-orange-50 disabled:opacity-50 flex items-center gap-1 ${canOperateFamilies ? '' : 'opacity-50'}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        清空
                      </button>
                      <button
                        onClick={() => {
                          if (!ensureCanOperateFamilies()) return;
                          setConfirmAction({ type: 'delete', family });
                        }}
                        disabled={actionLoading === `delete:${family.familycode}`}
                        className={`px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 flex items-center gap-1 ${canOperateFamilies ? '' : 'opacity-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isEditOpen && editingFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeEditFamily} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold text-gray-800">编辑家庭</div>
                <div className="text-sm text-gray-500 font-mono">{editingFamily.familycode}</div>
              </div>
              <button onClick={closeEditFamily} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={editingFamilyName}
                onChange={(e) => setEditingFamilyName(e.target.value)}
                placeholder="家庭名称"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all text-black"
              />
              <div className="flex gap-3">
                <button
                  onClick={closeEditFamily}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEditFamily}
                  disabled={actionLoading === `update:${editingFamily.familycode}`}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.type === 'delete' ? '删除家庭' : '清空家庭数据'}
        message={
          confirmAction?.type === 'delete'
            ? `将永久删除家庭「${confirmAction.family.familyname || '-'}」（${confirmAction.family.familycode}），不可恢复。`
            : `将清空家庭「${confirmAction?.family.familyname || '-'}」（${confirmAction?.family.familycode}）的成员/任务/奖励/历史并将积分归零，不可恢复。`
        }
        confirmText={confirmAction?.type === 'delete' ? '删除' : '清空'}
        confirmClass={confirmAction?.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          const current = confirmAction;
          if (!current) return;
          setConfirmAction(null);
          await invokeAdminFamilyAction(current.type, current.family);
        }}
      />
    </div>
  );
}
