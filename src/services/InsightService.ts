// Insight Service - Auto-generate insights from user data

import { goalRepository } from '../repositories';
import { transactionRepository } from '../repositories';
import { dailyProgressRepository } from '../repositories';
import { walletRepository } from '../repositories';
import { lifeJourneyRepository } from '../repositories';
import { Goal } from '../types';
import { differenceInDays, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement' | 'recommendation';
  title: string;
  message: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
  actionable: boolean;
  actionLabel?: string;
  actionType?: 'add_funds' | 'view_goal' | 'create_goal' | 'adjust_target';
  relatedGoalId?: string;
  createdAt: Date;
}

export interface MonthlyReflection {
  month: string;
  totalCollected: number;
  totalTarget: number;
  goalsCompleted: number;
  progress: number;
  bestWallet: string | null;
  newAchievements: number;
  streak: number;
  summary: string;
}

export interface YearInReview {
  year: number;
  totalCollected: number;
  goalsCompleted: number;
  biggestGoal: string | null;
  bestWallet: string | null;
  totalAchievements: number;
  journeyHighlight: string | null;
  bestPlanet: string | null;
}

export class InsightService {
  // Generate daily insights
  async getDailyInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const today = startOfDay(new Date());

    const goals = await goalRepository.getActive();
    if (goals.length === 0) return insights;

    for (const goal of goals) {
      const dailyCollected = await transactionRepository.getDailyTotalByGoal(goal.id, today);
      const dailyTarget = goal.dailyTarget;

      // Exceeds daily target
      if (dailyCollected > dailyTarget * 1.1) {
        insights.push({
          id: `daily-exceed-${goal.id}`,
          type: 'success',
          title: 'Target Harian Terlampaui!',
          message: `Anda sudah mengumpulkan ${Math.round(((dailyCollected - dailyTarget) / dailyTarget) * 100)}% lebih dari target harian untuk "${goal.title}".`,
          icon: 'trophy',
          priority: 'high',
          category: 'daily',
          actionable: false,
          relatedGoalId: goal.id,
          createdAt: new Date(),
        });
      }

      // Behind daily target
      else if (dailyCollected < dailyTarget * 0.5 && dailyTarget > 0) {
        insights.push({
          id: `daily-behind-${goal.id}`,
          type: 'warning',
          title: 'Target Harian Belum Tercapai',
          message: `Anda baru mengumpulkan ${Math.round((dailyCollected / dailyTarget) * 100)}% dari target harian untuk "${goal.title}". Masih butuh ${((dailyTarget - dailyCollected) / 1000).toFixed(0)}K lagi.`,
          icon: 'alert',
          priority: 'medium',
          category: 'daily',
          actionable: true,
          actionLabel: 'Tambah Dana',
          actionType: 'add_funds',
          relatedGoalId: goal.id,
          createdAt: new Date(),
        });
      }

      // Near deadline warning
      const daysRemaining = differenceInDays(new Date(goal.deadline), today);
      if (daysRemaining <= 7 && daysRemaining > 0 && goal.progress < 80) {
        insights.push({
          id: `deadline-${goal.id}`,
          type: 'warning',
          title: 'Deadline Mendekat',
          message: `"${goal.title}" ${daysRemaining} hari lagi. Progress: ${Math.round(goal.progress)}%. Tingkatkan tabungan untuk mencapai target tepat waktu.`,
          icon: 'clock',
          priority: 'high',
          category: 'daily',
          actionable: true,
          actionLabel: 'Tambah Dana',
          actionType: 'add_funds',
          relatedGoalId: goal.id,
          createdAt: new Date(),
        });
      }
    }

    // Check streak
    for (const goal of goals) {
      const streak = await dailyProgressRepository.getCurrentStreak(goal.id);
      if (streak >= 7) {
        insights.push({
          id: `streak-${goal.id}`,
          type: 'achievement',
          title: `${streak} Hari Beruntun!`,
          message: `Luar biasa! Anda konsisten menabung untuk "${goal.title}" selama ${streak} hari berturut-turut.`,
          icon: 'flame',
          priority: 'medium',
          category: 'daily',
          actionable: false,
          relatedGoalId: goal.id,
          createdAt: new Date(),
        });
      }
    }

    return this.prioritizeInsights(insights);
  }

  // Generate weekly insights
  async getWeeklyInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const goals = await goalRepository.getActive();
    if (goals.length === 0) return insights;

    let totalWeeklyCollected = 0;
    let totalWeeklyTarget = 0;

    for (const goal of goals) {
      const transactions = await transactionRepository.getByGoalIdAndDateRange(
        goal.id,
        weekStart,
        weekEnd
      );
      const weeklyCollected = transactions.reduce((sum, t) => sum + t.amount, 0);
      totalWeeklyCollected += weeklyCollected;
      totalWeeklyTarget += goal.dailyTarget * 7;
    }

    if (totalWeeklyTarget > 0) {
      const weeklyProgress = (totalWeeklyCollected / totalWeeklyTarget) * 100;

      if (weeklyProgress >= 100) {
        insights.push({
          id: 'weekly-success',
          type: 'success',
          title: 'Minggu yang Luar Biasa!',
          message: `Anda berhasil mengumpulkan ${formatCurrency(totalWeeklyCollected)} minggu ini, mencapai ${Math.round(weeklyProgress)}% dari target mingguan.`,
          icon: 'star',
          priority: 'high',
          category: 'weekly',
          actionable: false,
          createdAt: new Date(),
        });
      } else if (weeklyProgress >= 70) {
        insights.push({
          id: 'weekly-good',
          type: 'info',
          title: 'Progress Mingguan Baik',
          message: `Anda sudah mencapai ${Math.round(weeklyProgress)}% dari target mingguan. Sedikit lagi untuk melampaui target!`,
          icon: 'trending-up',
          priority: 'medium',
          category: 'weekly',
          actionable: true,
          actionLabel: 'Tambah Dana',
          actionType: 'add_funds',
          createdAt: new Date(),
        });
      } else {
        insights.push({
          id: 'weekly-behind',
          type: 'warning',
          title: 'Minggu Ini Perlu Perhatian',
          message: `Progress mingguan baru ${Math.round(weeklyProgress)}%. Tingkatkan konsistensi untuk mencapai target.`,
          icon: 'alert',
          priority: 'high',
          category: 'weekly',
          actionable: true,
          actionLabel: 'Tambah Dana',
          actionType: 'add_funds',
          createdAt: new Date(),
        });
      }
    }

    // Identify fastest growing goal
    let fastestGoal: Goal | null = null;
    let fastestRate = 0;

    for (const goal of goals) {
      const transactions = await transactionRepository.getByGoalIdAndDateRange(goal.id, weekStart, weekEnd);
      const weeklyRate = transactions.reduce((sum, t) => sum + t.amount, 0);
      if (weeklyRate > fastestRate) {
        fastestRate = weeklyRate;
        fastestGoal = goal;
      }
    }

    if (fastestGoal) {
      insights.push({
        id: 'fastest-goal',
        type: 'info',
        title: 'Target Tercepat Minggu Ini',
        message: `"${fastestGoal.title}" tumbuh paling cepat dengan ${formatCurrency(fastestRate)} minggu ini.`,
        icon: 'zap',
        priority: 'low',
        category: 'weekly',
        actionable: false,
        relatedGoalId: fastestGoal.id,
        createdAt: new Date(),
      });
    }

    return this.prioritizeInsights(insights);
  }

  // Generate monthly insights
  async getMonthlyInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const goals = await goalRepository.getActive();
    const completedGoals = await goalRepository.getCompleted();

    // Goals completed this month
    const completedThisMonth = completedGoals.filter(
      (g) => g.updatedAt && new Date(g.updatedAt) >= monthStart && new Date(g.updatedAt) <= monthEnd
    );

    if (completedThisMonth.length > 0) {
      insights.push({
        id: 'monthly-completed',
        type: 'achievement',
        title: `${completedThisMonth.length} Target Selesai!`,
        message: `Selamat! Anda telah menyelesaikan ${completedThisMonth.length} target bulan ini: ${completedThisMonth.map((g) => g.title).join(', ')}.`,
        icon: 'trophy',
        priority: 'high',
        category: 'monthly',
        actionable: false,
        createdAt: new Date(),
      });
    }

    // Monthly total collection
    let totalMonthlyCollected = 0;
    for (const goal of goals) {
      const transactions = await transactionRepository.getByGoalIdAndDateRange(goal.id, monthStart, monthEnd);
      totalMonthlyCollected += transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    if (totalMonthlyCollected > 0) {
      insights.push({
        id: 'monthly-total',
        type: 'info',
        title: 'Total Tabungan Bulan Ini',
        message: `Anda telah mengumpulkan ${formatCurrency(totalMonthlyCollected)} bulan ini. Terus pertahankan!`,
        icon: 'piggy-bank',
        priority: 'medium',
        category: 'monthly',
        actionable: false,
        createdAt: new Date(),
      });
    }

    // Generate recommendations
    for (const goal of goals) {
      const expectedProgress = this.calculateExpectedProgress(goal);
      if (goal.progress < expectedProgress - 15) {
        const additionalDaily = Math.ceil((goal.remainingAmount / Math.max(1, differenceInDays(new Date(goal.deadline), new Date())) - goal.dailyTarget) / 1000) * 1000;
        insights.push({
          id: `recommendation-${goal.id}`,
          type: 'recommendation',
          title: 'Rekomendasi: Tingkatkan Tabungan',
          message: `Untuk mencapai "${goal.title}" tepat waktu, tambahkan sekitar ${formatCurrency(additionalDaily)} per hari dari target saat ini.`,
          icon: 'lightbulb',
          priority: 'high',
          category: 'monthly',
          actionable: true,
          actionLabel: 'Tambah Dana',
          actionType: 'add_funds',
          relatedGoalId: goal.id,
          createdAt: new Date(),
        });
        break; // Show only one recommendation at a time
      }
    }

    return this.prioritizeInsights(insights);
  }

  // Generate monthly reflection
  async generateMonthlyReflection(): Promise<MonthlyReflection | null> {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const month = format(new Date(), 'MMMM yyyy');

    const goals = await goalRepository.getActive();
    const completedGoals = await goalRepository.getCompleted();
    const wallets = await walletRepository.getAll();

    let totalCollected = 0;
    let totalTarget = 0;

    for (const goal of goals) {
      const transactions = await transactionRepository.getByGoalIdAndDateRange(goal.id, monthStart, monthEnd);
      totalCollected += transactions.reduce((sum, t) => sum + t.amount, 0);
      totalTarget += goal.targetAmount;
    }

    const completedThisMonth = completedGoals.filter(
      (g) => g.updatedAt && new Date(g.updatedAt) >= monthStart && new Date(g.updatedAt) <= monthEnd
    );

    // Find best wallet
    let bestWallet: string | null = null;
    let bestWalletContribution = 0;

    for (const wallet of wallets) {
      const transactions = await transactionRepository.getByWalletId(wallet.id);
      const monthlyContribution = transactions
        .filter((t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      if (monthlyContribution > bestWalletContribution) {
        bestWalletContribution = monthlyContribution;
        bestWallet = wallet.name;
      }
    }

    // Get streak
    let maxStreak = 0;
    for (const goal of goals) {
      const streak = await dailyProgressRepository.getCurrentStreak(goal.id);
      maxStreak = Math.max(maxStreak, streak);
    }

    return {
      month,
      totalCollected,
      totalTarget,
      goalsCompleted: completedThisMonth.length,
      progress: totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0,
      bestWallet,
      newAchievements: 0,
      streak: maxStreak,
      summary: `Bulan ini Anda mengumpulkan ${formatCurrency(totalCollected)} dengan ${completedThisMonth.length} target selesai. Streak terbaik: ${maxStreak} hari.`,
    };
  }

  // Generate year in review
  async generateYearInReview(): Promise<YearInReview | null> {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    const year = new Date().getFullYear();

    const goals = await goalRepository.getAll();
    const completedGoals = goals.filter((g) => g.status === 'completed');
    const wallets = await walletRepository.getAll();

    let totalCollected = 0;
    let biggestGoal: string | null = null;
    let biggestAmount = 0;

    for (const goal of goals) {
      const total = goal.targetAmount - goal.remainingAmount;
      totalCollected += total;
      if (total > biggestAmount) {
        biggestAmount = total;
        biggestGoal = goal.title;
      }
    }

    // Find best wallet
    let bestWallet: string | null = null;
    let bestWalletContribution = 0;

    for (const wallet of wallets) {
      const transactions = await transactionRepository.getByWalletId(wallet.id);
      const yearlyContribution = transactions
        .filter((t) => new Date(t.date) >= yearStart && new Date(t.date) <= yearEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      if (yearlyContribution > bestWalletContribution) {
        bestWalletContribution = yearlyContribution;
        bestWallet = wallet.name;
      }
    }

    // Get journey highlight
    const journeys = await lifeJourneyRepository.getByDateRange(yearStart, yearEnd);
    const journeyHighlight = journeys.find((j) => j.category === 'goal_completed')?.title || null;

    return {
      year,
      totalCollected,
      goalsCompleted: completedGoals.length,
      biggestGoal,
      bestWallet,
      totalAchievements: 0,
      journeyHighlight,
      bestPlanet: null,
    };
  }

  // Get all insights combined
  async getAllInsights(): Promise<Insight[]> {
    const daily = await this.getDailyInsights();
    const weekly = await this.getWeeklyInsights();
    const monthly = await this.getMonthlyInsights();

    return [...daily, ...weekly, ...monthly].slice(0, 10);
  }

  // Helper: Calculate expected progress
  private calculateExpectedProgress(goal: Goal): number {
    const totalDays = differenceInDays(new Date(goal.deadline), new Date(goal.startDate));
    const daysElapsed = differenceInDays(new Date(), new Date(goal.startDate));

    if (totalDays <= 0) return 100;
    return Math.min(100, (daysElapsed / totalDays) * 100);
  }

  // Helper: Prioritize insights
  private prioritizeInsights(insights: Insight[]): Insight[] {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const insightService = new InsightService();
