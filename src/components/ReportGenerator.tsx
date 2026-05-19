import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, TrendingUp, Target, Award, Download } from 'lucide-react';

interface ReportData {
  period: string;
  earnings: number;
  spendings: number;
  netPoints: number;
  tasksCompleted: number;
  daysWithActivity: number;
  totalDays: number;
  avgDailyPoints?: number;
  manualAdjustments?: number;
  rewardsRedeemed?: number;
}

const ReportGenerator = () => {
  const history = useStore((state) => state.history);
  const [reportType, setReportType] = useState<'week' | 'month'>('week');

  const getWeekData = useMemo((): ReportData => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekHistory = history.filter((item) => {
      const timestamp = new Date(item.timestamp);
      return timestamp >= startOfWeek && timestamp <= endOfWeek;
    });

    const earnings = weekHistory
      .filter((item) => item.type === 'earn')
      .reduce((sum, item) => sum + item.points, 0);
    
    const spendings = weekHistory
      .filter((item) => item.type === 'spend')
      .reduce((sum, item) => sum + item.points, 0);

    const tasksCompleted = weekHistory.filter(
      (item) => item.type === 'earn' && item.description.includes('完成任务')
    ).length;

    const manualAdjustments = weekHistory.filter(
      (item) => item.description.includes('手动')
    ).length;

    const daysWithActivity = [...new Set(
      weekHistory.map((item) => item.timestamp.split('T')[0])
    )].length;

    return {
      period: `${startOfWeek.toLocaleDateString('zh-CN')} ~ ${endOfWeek.toLocaleDateString('zh-CN')}`,
      earnings,
      spendings,
      netPoints: earnings - spendings,
      tasksCompleted,
      manualAdjustments,
      daysWithActivity,
      totalDays: 7,
    };
  }, [history]);

  const getMonthData = useMemo((): ReportData => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthHistory = history.filter((item) => {
      const timestamp = new Date(item.timestamp);
      return timestamp >= startOfMonth && timestamp <= endOfMonth;
    });

    const earnings = monthHistory
      .filter((item) => item.type === 'earn')
      .reduce((sum, item) => sum + item.points, 0);
    
    const spendings = monthHistory
      .filter((item) => item.type === 'spend')
      .reduce((sum, item) => sum + item.points, 0);

    const tasksCompleted = monthHistory.filter(
      (item) => item.type === 'earn' && item.description.includes('完成任务')
    ).length;

    const rewardsRedeemed = monthHistory.filter(
      (item) => item.type === 'spend' && item.description.includes('兑换')
    ).length;

    const daysWithActivity = [...new Set(
      monthHistory.map((item) => item.timestamp.split('T')[0])
    )].length;

    const avgDailyPoints = Math.round((earnings - spendings) / Math.max(daysWithActivity, 1));

    return {
      period: `${now.getFullYear()}年${now.getMonth() + 1}月`,
      earnings,
      spendings,
      netPoints: earnings - spendings,
      tasksCompleted,
      rewardsRedeemed,
      daysWithActivity,
      totalDays: endOfMonth.getDate(),
      avgDailyPoints,
    };
  }, [history]);

  const data = reportType === 'week' ? getWeekData : getMonthData;

  const getGrade = (netPoints: number, tasksCompleted: number) => {
    if (netPoints >= 100 && tasksCompleted >= 10) return { grade: 'S', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    if (netPoints >= 50 && tasksCompleted >= 5) return { grade: 'A', color: 'text-green-500', bg: 'bg-green-100' };
    if (netPoints >= 20 && tasksCompleted >= 3) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (netPoints >= 10 && tasksCompleted >= 1) return { grade: 'C', color: 'text-orange-500', bg: 'bg-orange-100' };
    return { grade: 'D', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const gradeInfo = getGrade(data.netPoints, data.tasksCompleted);

  const generateShareText = () => {
    const title = reportType === 'week' ? '本周成长报告' : '本月成长报告';
    return `${title} 📊\n\n${data.period}\n\n💰 获得积分: ${data.earnings}\n💳 消耗积分: ${data.spendings}\n📈 净增积分: ${data.netPoints}\n✅ 完成任务: ${data.tasksCompleted}个\n📅 活跃天数: ${data.daysWithActivity}/${data.totalDays}天\n\n🎖️ 评级: ${gradeInfo.grade}\n\n继续加油！💪`;
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    await navigator.clipboard.writeText(text);
    alert('报告已复制到剪贴板！');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          成长报告
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'week'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            周报
          </button>
          <button
            onClick={() => setReportType('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === 'month'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            月报
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="text-gray-500 text-sm mb-1">{reportType === 'week' ? '本周' : '本月'}</div>
        <div className="text-lg font-medium text-gray-700">{data.period}</div>
      </div>

      <div className={`text-center py-6 px-4 rounded-xl ${gradeInfo.bg} mb-6`}>
        <div className="text-sm text-gray-500 mb-2">综合评级</div>
        <div className={`text-6xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</div>
        <div className="text-sm text-gray-500 mt-2">
          {gradeInfo.grade === 'S' && '太棒了！继续保持！'}
          {gradeInfo.grade === 'A' && '表现优秀！再接再厉！'}
          {gradeInfo.grade === 'B' && '表现不错，还有进步空间！'}
          {gradeInfo.grade === 'C' && '加油！多完成任务！'}
          {gradeInfo.grade === 'D' && '需要更加努力哦！'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">获得积分</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{data.earnings}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">消耗积分</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{data.spendings}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm">完成任务</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{data.tasksCompleted}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">净增积分</span>
          </div>
          <div className={`text-3xl font-bold ${data.netPoints >= 0 ? 'text-purple-600' : 'text-red-500'}`}>
            {data.netPoints >= 0 ? '+' : ''}{data.netPoints}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">活跃天数</span>
          <span className="font-medium text-gray-800">{data.daysWithActivity} / {data.totalDays} 天</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${(data.daysWithActivity / data.totalDays) * 100}%` }}
          />
        </div>
      </div>

      {reportType === 'month' && data.avgDailyPoints !== undefined && (
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-orange-600">日均积分</span>
            <span className="text-2xl font-bold text-orange-600">{data.avgDailyPoints}</span>
          </div>
        </div>
      )}

      {reportType === 'week' && data.manualAdjustments !== undefined && data.manualAdjustments > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-yellow-600">手动调整次数</span>
            <span className="text-xl font-bold text-yellow-600">{data.manualAdjustments} 次</span>
          </div>
        </div>
      )}

      {reportType === 'month' && data.rewardsRedeemed !== undefined && data.rewardsRedeemed > 0 && (
        <div className="bg-pink-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-pink-600">兑换奖励次数</span>
            <span className="text-xl font-bold text-pink-600">{data.rewardsRedeemed} 次</span>
          </div>
        </div>
      )}

      <button
        onClick={copyToClipboard}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
      >
        <Download className="w-5 h-5" />
        复制报告分享
      </button>
    </div>
  );
};

export default ReportGenerator;
