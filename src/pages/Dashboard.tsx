// Dashboard Page

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Wallet,
  Calendar,
  BarChart3,
  TrendingUp,
  Sparkles,
  Flame,
  Trophy,
  ChevronRight,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  CreditCard,
} from 'lucide-react';
import { useDashboardStore, useGoalStore, useAchievementStore, useAppStore } from '../stores';
import { formatCurrency, getGreeting, formatDate, getRandomMotivationalQuote } from '../utils/calculations';
import { QuickAddModal } from '../modals/QuickAddModal';
import { GoalModal } from '../modals/GoalModal';
import { Goal } from '../types';
import { insightService, Insight } from '../services/InsightService';
import { InstallmentStatusBar } from '../components/InstallmentStatusBar';

export function Dashboard() {
  const { refreshAll, summary, dailySummary, priorityGoals, coachInsight, loading } = useDashboardStore();
  const { recentUnlocked } = useAchievementStore();
  const { user, setCurrentPage } = useAppStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    refreshAll();
    useAchievementStore.getState().initialize();
    useGoalStore.getState().fetchActiveGoals();
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const dailyInsights = await insightService.getDailyInsights();
    setInsights(dailyInsights.slice(0, 5));
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon === 'Sun' ? Sun : greeting.icon === 'CloudSun' ? CloudSun : greeting.icon === 'Sunset' ? Sunset : Moon;

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hasNoGoals = !priorityGoals || priorityGoals.length === 0;

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-goal':
        setShowGoalModal(true);
        break;
      case 'quick-add':
        setShowQuickAdd(true);
        break;
      case 'calendar':
        setCurrentPage('calendar');
        break;
      case 'analytics':
        setCurrentPage('analytics');
        break;
    }
  };

  // Handle goal add
  const handleAddToGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowQuickAdd(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <GreetingIcon className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting.text}, <span className="text-gradient">{user?.name || 'User'}</span>
            </h1>
            <p className="text-base-400 mt-1">{formatDate(new Date(), 'EEEE, d MMMM yyyy')}</p>
          </div>
        </div>
        <p className="text-base-300 italic">"{getRandomMotivationalQuote()}"</p>
      </motion.div>

      {/* Hero Card - Today's Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden"
      >
        <div className="bg-gradient-to-br from-surface to-base-950 rounded-2xl border border-white/5 p-6 shadow-elevated">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-base-400 uppercase tracking-wider mb-1">Fokus Hari Ini</p>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary-400" />
                  <span className="text-xl md:text-2xl font-bold">Target Dana Harian</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-base-400">Streak</p>
                  <p className="font-bold text-amber-400">7 hari</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Dana Hari Ini"
                value={dailySummary ? formatCurrency(dailySummary.todayCollected) : formatCurrency(0)}
                trend={dailySummary?.difference && dailySummary.difference > 0 ? 'up' : 'neutral'}
              />
              <StatCard
                label="Target Hari Ini"
                value={dailySummary ? formatCurrency(dailySummary.todayTarget) : formatCurrency(0)}
              />
              <StatCard
                label="Sisa Target"
                value={dailySummary ? formatCurrency(Math.max(0, dailySummary.todayTarget - dailySummary.todayCollected)) : formatCurrency(0)}
              />
              <StatCard
                label="Target Aktif"
                value={summary?.activeGoals?.toString() || '0'}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQuickAdd(true)}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent rounded-xl
                font-semibold text-white flex items-center justify-center gap-2
                hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Tambah Dana Hari Ini
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <QuickActionCard icon={Target} label="Target Baru" color="from-blue-500 to-cyan-500" onClick={() => handleQuickAction('new-goal')} />
        <QuickActionCard icon={Wallet} label="Dana Hari Ini" color="from-green-500 to-emerald-500" onClick={() => handleQuickAction('quick-add')} />
        <QuickActionCard icon={Calendar} label="Kalender" color="from-purple-500 to-violet-500" onClick={() => handleQuickAction('calendar')} />
        <QuickActionCard icon={BarChart3} label="Statistik" color="from-orange-500 to-amber-500" onClick={() => handleQuickAction('analytics')} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Target Prioritas</h2>
            <button
              onClick={() => setCurrentPage('goals')}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {hasNoGoals ? (
            <EmptyState onCreateGoal={() => setShowGoalModal(true)} />
          ) : (
            <div className="space-y-4">
              {priorityGoals.slice(0, 3).map((goal, index) => (
                <GoalCard key={goal.id} goal={goal} index={index} onAdd={() => handleAddToGoal(goal)} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Coach */}
          {coachInsight && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-surface to-base-950 rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">LifeOS Coach</p>
                  <p className="text-xs text-base-400">AI Financial Assistant</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm font-medium text-primary-400 mb-1">
                    {coachInsight.title}
                  </p>
                  <p className="text-sm text-base-300">{coachInsight.message}</p>
                </div>

                {coachInsight.actionable && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowQuickAdd(true)}
                    className="w-full py-2 bg-primary-500/20 text-primary-400 rounded-xl text-sm font-medium"
                  >
                    {coachInsight.actionLabel}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Cicilan Bulanan (hanya muncul kalau ada target bermode cicilan) */}
          {priorityGoals.some((g) => g.installmentMonths) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.32 }}
              className="bg-surface rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-400" />
                <h3 className="font-semibold">Cicilan Bulanan</h3>
              </div>

              <div className="space-y-4">
                {priorityGoals
                  .filter((g) => g.installmentMonths)
                  .map((g) => (
                    <div
                      key={g.id}
                      className="p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setCurrentPage('goals')}
                    >
                      <p className="font-medium text-sm mb-2 truncate">{g.title}</p>
                      <InstallmentStatusBar goal={g} compact />
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Today's Insights */}
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-surface rounded-2xl border border-white/5 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold">Insight Hari Ini</h3>
              </div>

              <div className="space-y-3">
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onAction={() => {
                      if (insight.relatedGoalId) {
                        const goal = priorityGoals.find((g) => g.id === insight.relatedGoalId);
                        if (goal) {
                          setSelectedGoal(goal);
                          setShowQuickAdd(true);
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-surface rounded-2xl border border-white/5 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Achievement Terbaru</h3>
              <button onClick={() => setCurrentPage('achievements')}>
                <Trophy className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            <div className="space-y-3">
              {recentUnlocked.length > 0 ? (
                recentUnlocked.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-base-400">{achievement.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-base-400">
                  <p className="text-sm">Belum ada achievement</p>
                  <p className="text-xs mt-1">Mulai menabung untuk mendapatkan achievement pertama!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-surface rounded-2xl border border-white/5 p-5"
          >
            <h3 className="font-semibold mb-4">Progress Mingguan</h3>
            <WeeklyProgressChart />
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showQuickAdd && (
        <QuickAddModal
          goal={selectedGoal || undefined}
          onClose={() => {
            setShowQuickAdd(false);
            setSelectedGoal(null);
          }}
        />
      )}
      {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} />}
    </div>
  );
}

function StatCard({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 md:p-4">
      <p className="text-xs text-base-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-base md:text-lg font-bold">{value}</span>
        {trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, color, onClick }: { icon: React.ElementType; label: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gradient-to-br ${color} p-4 rounded-2xl text-white text-left w-full`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <p className="font-medium">{label}</p>
    </motion.button>
  );
}

function GoalCard({ goal, index, onAdd }: { goal: Goal; index: number; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="bg-surface rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Progress Circle */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${goal.progress * 1.75} 175`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{Math.round(goal.progress)}%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
              {goal.category}
            </span>
            <span className="text-xs text-base-400">{goal.priority}</span>
          </div>
          <h3 className="font-semibold text-white truncate">{goal.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div>
              <p className="text-base-400 text-xs">Terkumpul</p>
              <p className="text-success font-medium">{formatCurrency(goal.targetAmount - goal.remainingAmount)}</p>
            </div>
            <div>
              <p className="text-base-400 text-xs">Target</p>
              <p className="text-white">{formatCurrency(goal.targetAmount)}</p>
            </div>
            <div>
              <p className="text-base-400 text-xs">Deadline</p>
              <p className="text-base-300">{formatDate(goal.deadline, 'd MMM yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="px-4 py-2 bg-primary-500 rounded-xl text-white font-medium
            hover:bg-primary-600 transition-colors"
        >
          Tambah
        </motion.button>
      </div>

      {/* Daily Target */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-400">Target Harian</span>
          <span className="text-white font-medium">{formatCurrency(goal.dailyTarget)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onCreateGoal }: { onCreateGoal: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-white/5 p-8 text-center"
    >
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center">
        <Target className="w-10 h-10 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Mulai Perjalanan Finansial Anda</h3>
      <p className="text-base-400 mb-6 max-w-md mx-auto">
        Satu target kecil hari ini adalah langkah menuju impian besar.
        Buat target pertama Anda dan mulai perjalanan menuju kebebasan finansial.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateGoal}
        className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent rounded-xl font-semibold"
      >
        Buat Target Pertama
      </motion.button>
    </motion.div>
  );
}

function WeeklyProgressChart() {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const data = [80, 100, 45, 90, 30, 60, 75]; // Sample data

  return (
    <div className="flex items-end gap-2 h-24">
      {days.map((day, i) => (
        <div key={day} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-300"
            style={{
              height: `${data[i]}%`,
              background: data[i] >= 80
                ? 'linear-gradient(to top, #10B981, #22C55E)'
                : data[i] >= 50
                  ? 'linear-gradient(to top, #3B82F6, #0EA5E9)'
                  : 'linear-gradient(to top, #F59E0B, #FBBF24)',
            }}
          />
          <span className="text-xs text-base-400">{day}</span>
        </div>
      ))}
    </div>
  );
}

function InsightCard({
  insight,
  onAction,
}: {
  insight: Insight;
  onAction?: () => void;
}) {
  const getIcon = () => {
    switch (insight.icon) {
      case 'trophy':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'flame':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'star':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'lightbulb':
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'achievement':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'recommendation':
        return 'bg-primary-500/10 border-primary-500/20';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-3 ${getBgColor()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{insight.title}</p>
          <p className="text-xs text-base-400 mt-0.5">{insight.message}</p>
        </div>
      </div>
      {insight.actionable && onAction && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAction}
          className="mt-2 w-full py-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          {insight.actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 bg-surface rounded-2xl" />
      <div className="h-48 bg-surface rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-surface rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
