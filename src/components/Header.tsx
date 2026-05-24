import { Sparkles, Plus, Minus, Calendar, Trophy, Shield, Settings, Users, Download, LogOut, Activity, Edit3, Mail } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { AchievementsPanel } from './AchievementsPanel';
import { ConfirmDialog } from './ConfirmDialog';
import { PinProtection, usePinProtection } from './PinProtection';
import { achievements } from '../data/achievements';
import ThemeSwitcher from './ThemeSwitcher';
import MemberPanel from './MemberPanel';
import { getLevel } from '../data/levels';
import { useLogout } from '../contexts/LogoutContext';
import { DirectPointsEditor } from './DirectPointsEditor';
import { calculateStreakFromHistory } from '../lib/streak';
import { EmailBindModal } from './EmailBindModal';

interface HeaderProps {
  onShowAdmin?: () => void;
}

export function Header({ onShowAdmin }: HeaderProps) {
  const points = useStore((state) => state.points);
  const history = useStore((state) => state.history);
  const tasks = useStore((state) => state.tasks);
  const rewards = useStore((state) => state.rewards);
  const members = useStore((state) => state.members);
  const familyName = useStore((state) => state.familyName);
  const currentMemberId = useStore((state) => state.currentMemberId);
  const familyId = useStore((state) => state.familyId);
  const adjustPoints = useStore((state) => state.adjustPoints);
  const { triggerLogout } = useLogout();
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout>();

  const handleTitleClick = () => {
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
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDirectEditor, setShowDirectEditor] = useState(false);
  const [showEmailBind, setShowEmailBind] = useState(false);
  const [isAdjustmentEnabled, setIsAdjustmentEnabled] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [adjustDate, setAdjustDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const { showPinVerify, setShowPinVerify, verifyPin, handlePinSuccess } = usePinProtection();

  const hasPin = localStorage.getItem('familyPin');

  useEffect(() => {
    if (points !== displayPoints) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayPoints(points);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [points, displayPoints]);

  const handleAdjustClick = () => {
    if (!hasPin) {
      setShowPinSetup(true);
      return;
    }

    if (!isAdjustmentEnabled) {
      setShowAdjustment(false);
      verifyPin(() => {
        setIsAdjustmentEnabled(true);
        setShowAdjustment(true);
      });
      return;
    }

    setShowAdjustment(!showAdjustment);
  };

  const handleAdjust = (type: 'add' | 'subtract') => {
    const adjustAmount = type === 'add' ? Math.abs(Number(amount)) : -Math.abs(Number(amount));

    if (!amount || Number(amount) === 0) {
      toast.error('请输入积分数量');
      return;
    }

    if (!reason.trim()) {
      toast.error('请输入调整原因');
      return;
    }

    const result = adjustPoints(adjustAmount, reason.trim(), adjustDate);

    if (result.success) {
      toast.success(result.message);
      setAmount('');
      setReason('');
      setShowAdjustment(false);
    } else {
      toast.error(result.message);
    }
  };

  const handlePinSetupSuccess = () => {
    toast.success('PIN码设置成功，现在需要验证才能调整积分');
  };

  const handleExportData = () => {
    const exportData = {
      familyName,
      exportDate: new Date().toISOString(),
      members,
      tasks,
      rewards,
      history,
      points,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `青春成长积分册_备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateStreak = () => calculateStreakFromHistory(history as any, currentMemberId);

  const getStats = () => {
    const completedTasks = history.filter(h => h.type === 'earn').length;
    const rewardsRedeemed = history.filter(h => h.type === 'redeem').length;
    const totalPoints = history.reduce((sum, h) => {
      if (h.type === 'earn') return sum + h.points;
      if (h.type === 'redeem') return sum - h.points;
      if (h.type === 'adjust') {
        const desc = String(h.description || '');
        const isDecrease = desc.includes('扣') || desc.includes('减少');
        const isIncrease = desc.includes('增') || desc.includes('增加');
        if (isDecrease) return sum - h.points;
        if (isIncrease) return sum + h.points;
        return sum;
      }
      return sum;
    }, 0);
    
    return {
      totalPoints: Math.max(0, totalPoints + points),
      completedTasks,
      currentStreak: calculateStreak(),
      rewardsRedeemed,
    };
  };

  const getUnlockedAchievements = () => {
    const stats = getStats();
    return achievements
      .filter(a => a.condition(stats))
      .map(a => a.id);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 sm:px-6 py-4 sm:py-5 relative safe-area-pt">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
            <h1 
              className="text-xl sm:text-2xl font-bold font-heading leading-tight cursor-pointer select-none"
              onClick={handleTitleClick}
            >
              青春成长积分册
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1">记录成长，每一步都值得</p>
          </div>
              
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2">
                <div className={getLevel(displayPoints).color}>
                  {getLevel(displayPoints).icon}
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/80 font-medium">{getLevel(displayPoints).name}</div>
                  <div
                    className={`text-xl sm:text-2xl font-bold font-mono transition-transform duration-200 ${
                      isAnimating ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    {displayPoints}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setShowMemberPanel(true)}
                className="flex-shrink-0 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">成员</span>
              </button>

              <button
                onClick={() => setShowThemeSwitcher(true)}
                className="flex-shrink-0 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">主题</span>
              </button>

              <button
                onClick={handleExportData}
                className="flex-shrink-0 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
                title="导出数据"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setShowEmailBind(true)}
                className="flex-shrink-0 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
                title="绑定邮箱找回"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">找回</span>
              </button>

              <button
                onClick={() => setShowAchievements(true)}
                className="flex-shrink-0 text-xs sm:text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">成就</span>
              </button>

              <button
                onClick={handleAdjustClick}
                className={`flex-shrink-0 text-xs sm:text-sm transition-colors flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95 ${
                  hasPin && !isAdjustmentEnabled
                    ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{hasPin && !isAdjustmentEnabled ? '已锁定' : '调整'}</span>
                {hasPin && (
                  isAdjustmentEnabled ? (
                    <Shield className="w-2.5 h-2.5 text-green-300" />
                  ) : (
                    <Shield className="w-2.5 h-2.5 text-red-300" />
                  )
                )}
              </button>

              {hasPin && (
                <button
                  onClick={() => setShowDirectEditor(true)}
                  className="flex-shrink-0 text-xs sm:text-sm bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
                  title="直接修改总积分"
                >
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">改积分</span>
                </button>
              )}

              <button
                onClick={() => setShowExitConfirm(true)}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors flex items-center gap-1 bg-white/10 hover:bg-red-500/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
                title="退出登录"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {showAdjustment && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAdjustment(false)} />
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl p-4 z-50 w-full max-w-xs sm:max-w-sm animate-scale-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">手动调整积分</h3>
                  <button
                    onClick={() => setIsAdjustmentEnabled(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    锁定
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      日期
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={adjustDate}
                        onChange={(e) => setAdjustDate(e.target.value)}
                        max={getTodayString()}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-black bg-white"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      积分数量
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-center text-black bg-white"
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
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-black bg-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdjust('subtract')}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-1.5 text-sm active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                      扣分
                    </button>
                    <button
                      onClick={() => handleAdjust('add')}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 text-sm active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      加分
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PinProtection
        isOpen={showPinVerify}
        onClose={() => setShowPinVerify(false)}
        onSuccess={handlePinSuccess}
        mode="verify"
      />

      <PinProtection
        isOpen={showPinSetup}
        onClose={() => setShowPinSetup(false)}
        onSuccess={handlePinSetupSuccess}
        mode="setup"
      />

      <AchievementsPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlockedIds={getUnlockedAchievements()}
        stats={getStats()}
      />

      <MemberPanel
        isOpen={showMemberPanel}
        onClose={() => setShowMemberPanel(false)}
      />

      {showThemeSwitcher && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowThemeSwitcher(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-md pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <ThemeSwitcher onClose={() => setShowThemeSwitcher(false)} />
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={showExitConfirm}
        title="退出登录"
        message="确定要退出当前家庭吗？退出后需要重新输入家庭码才能再次访问。"
        confirmText="退出"
        onConfirm={() => {
          triggerLogout();
          toast.success('已退出登录');
        }}
        onCancel={() => setShowExitConfirm(false)}
      />

      <DirectPointsEditor
        isOpen={showDirectEditor}
        onClose={() => setShowDirectEditor(false)}
      />

      <EmailBindModal
        isOpen={showEmailBind}
        onClose={() => setShowEmailBind(false)}
        familyId={familyId || ''}
      />
    </>
  );
}
