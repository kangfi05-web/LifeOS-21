// AI Coach Service - Local Intelligence Engine

import { goalRepository, transactionRepository, dailyProgressRepository } from '../repositories';
import { differenceInDays, startOfDay, subDays, getDay } from 'date-fns';

interface CoachInsight {
  type: 'daily' | 'weekly' | 'monthly' | 'recommendation' | 'warning' | 'celebration';
  title: string;
  message: string;
  actionable?: boolean;
  actionLabel?: string;
  actionData?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
}

interface DailyAnalysis {
  todayCollected: number;
  todayTarget: number;
  difference: number;
  status: 'ahead' | 'on_track' | 'behind' | 'missed';
  goalsNeedingAttention: Array<{
    goalId: string;
    title: string;
    needed: number;
    deadline: Date;
  }>;
}

interface WeeklyAnalysis {
  totalCollected: number;
  weeklyTarget: number;
  daysOnTrack: number;
  daysMissed: number;
  bestDay: string;
  worstDay: string;
}

interface Prediction {
  goalId: string;
  title: string;
  currentProgress: number;
  estimatedFinishDate: Date | null;
  daysEarlyOrLate: number;
  likelihood: 'excellent' | 'good' | 'warning' | 'critical';
}

export class AICoachService {
  // Get daily analysis
  async getDailyAnalysis(): Promise<DailyAnalysis> {
    const activeGoals = await goalRepository.getActive();
    const today = startOfDay(new Date());

    let todayCollected = 0;
    let todayTarget = 0;
    const goalsNeedingAttention: DailyAnalysis['goalsNeedingAttention'] = [];

    for (const goal of activeGoals) {
      todayTarget += goal.dailyTarget;
      const dailyTotal = await transactionRepository.getDailyTotalByGoal(goal.id, today);
      todayCollected += dailyTotal;

      // Check if goal needs attention
      const remainingDays = differenceInDays(new Date(goal.deadline), today);

      if (remainingDays > 0 && dailyTotal < goal.dailyTarget) {
        const needed = goal.dailyTarget - dailyTotal;
        goalsNeedingAttention.push({
          goalId: goal.id,
          title: goal.title,
          needed,
          deadline: new Date(goal.deadline),
        });
      }
    }

    const difference = todayCollected - todayTarget;
    let status: DailyAnalysis['status'] = 'on_track';

    if (todayTarget === 0) {
      status = 'on_track';
    } else if (difference >= todayTarget * 0.1) {
      status = 'ahead';
    } else if (difference >= 0) {
      status = 'on_track';
    } else if (difference >= -todayTarget * 0.5) {
      status = 'behind';
    } else {
      status = 'missed';
    }

    return {
      todayCollected,
      todayTarget,
      difference,
      status,
      goalsNeedingAttention,
    };
  }

  // Get weekly analysis
  async getWeeklyAnalysis(): Promise<WeeklyAnalysis> {
    const activeGoals = await goalRepository.getActive();
    const today = new Date();
    const weekStart = subDays(today, 7);

    let totalCollected = 0;
    let weeklyTarget = 0;
    let daysOnTrack = 0;
    let daysMissed = 0;

    const dayTotals: Record<string, number> = {};
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 0; i < 7; i++) {
      const date = subDays(today, i);
      const dayName = dayNames[getDay(date)];
      const dailyTotal = await transactionRepository.getTotalByDate(date);
      dayTotals[dayName] = (dayTotals[dayName] || 0) + dailyTotal;
    }

    for (const goal of activeGoals) {
      weeklyTarget += goal.dailyTarget * 7;

      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        const progress = await dailyProgressRepository.getByGoalAndDate(goal.id, date);
        if (progress) {
          if (progress.status === 'on_track' || progress.status === 'exceeded') {
            daysOnTrack++;
          } else if (progress.status === 'missed') {
            daysMissed++;
          }
        }
      }
    }

    totalCollected = await transactionRepository.getTotalByDateRange(weekStart, today);

    // Find best and worst days
    let bestDay = 'Senin';
    let worstDay = 'Senin';
    let maxAmount = 0;
    let minAmount = Infinity;

    for (const [day, amount] of Object.entries(dayTotals)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        bestDay = day;
      }
      if (amount < minAmount) {
        minAmount = amount;
        worstDay = day;
      }
    }

    return {
      totalCollected,
      weeklyTarget,
      daysOnTrack,
      daysMissed,
      bestDay,
      worstDay,
    };
  }

  // Get predictions for all goals
  async getPredictions(): Promise<Prediction[]> {
    const activeGoals = await goalRepository.getActive();
    const predictions: Prediction[] = [];

    for (const goal of activeGoals) {
      const totalCollected = await transactionRepository.getTotalByGoalId(goal.id);
      const remaining = goal.targetAmount - totalCollected;

      let estimatedFinishDate: Date | null = null;
      let daysEarlyOrLate = 0;
      let likelihood: Prediction['likelihood'] = 'good';

      if (goal.dailyTarget > 0 && remaining > 0) {
        const estimatedDays = Math.ceil(remaining / goal.dailyTarget);
        estimatedFinishDate = new Date();
        estimatedFinishDate.setDate(estimatedFinishDate.getDate() + estimatedDays);

        daysEarlyOrLate = differenceInDays(new Date(goal.deadline), estimatedFinishDate);

        // Calculate likelihood based on progress vs expected
        const totalDays = differenceInDays(new Date(goal.deadline), new Date(goal.startDate));
        const daysPassed = differenceInDays(new Date(), new Date(goal.startDate));
        const expectedProgress = (daysPassed / totalDays) * 100;

        if (goal.progress >= expectedProgress + 10) {
          likelihood = 'excellent';
        } else if (goal.progress >= expectedProgress - 5) {
          likelihood = 'good';
        } else if (goal.progress >= expectedProgress - 15) {
          likelihood = 'warning';
        } else {
          likelihood = 'critical';
        }
      }

      predictions.push({
        goalId: goal.id,
        title: goal.title,
        currentProgress: goal.progress,
        estimatedFinishDate,
        daysEarlyOrLate,
        likelihood,
      });
    }

    return predictions.sort((a, b) => b.currentProgress - a.currentProgress);
  }

  // Generate daily insight
  async getDailyInsight(): Promise<CoachInsight> {
    const analysis = await this.getDailyAnalysis();

    if (analysis.status === 'ahead') {
      return {
        type: 'celebration',
        title: 'Luar Biasa!',
        message: `Hari ini Anda sudah mengumpulkan Rp${analysis.todayCollected.toLocaleString('id-ID')}, melebihi target Rp${analysis.todayTarget.toLocaleString('id-ID')}. Pertahankan konsistensi ini!`,
        priority: 'low',
      };
    }

    if (analysis.status === 'on_track') {
      return {
        type: 'daily',
        title: 'Tepat Sasaran',
        message: `Target hari ini tercapai! Anda sudah mengumpulkan Rp${analysis.todayCollected.toLocaleString('id-ID')} dari target Rp${analysis.todayTarget.toLocaleString('id-ID')}.`,
        priority: 'low',
      };
    }

    if (analysis.status === 'behind') {
      const firstGoal = analysis.goalsNeedingAttention[0];
      return {
        type: 'warning',
        title: 'Perlu Perhatian',
        message: `Kurang Rp${Math.abs(analysis.difference).toLocaleString('id-ID')} dari target hari ini. ${firstGoal ? `Tambah Rp${firstGoal.needed.toLocaleString('id-ID')} untuk ${firstGoal.title}` : 'Ayo semangat!'}`,
        actionable: true,
        actionLabel: 'Tambah Dana',
        actionData: { goalId: firstGoal?.goalId },
        priority: 'high',
      };
    }

    return {
      type: 'warning',
      title: 'Belum Ada Tabungan Hari Ini',
      message: `Target hari ini Rp${analysis.todayTarget.toLocaleString('id-ID')}. Mulai langkah kecil sekarang.`,
      actionable: true,
      actionLabel: 'Mulai Menabung',
      priority: 'high',
    };
  }

  // Generate simulation
  async simulateScenario(dailySaving: number): Promise<Array<{
    goalId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    estimatedFinishDate: Date;
  }>> {
    const activeGoals = await goalRepository.getActive();
    const results: Array<{
      goalId: string;
      title: string;
      targetAmount: number;
      currentAmount: number;
      estimatedFinishDate: Date;
    }> = [];

    // Sort goals by priority
    const sortedGoals = activeGoals.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    let dailyAmount = dailySaving;

    for (const goal of sortedGoals) {
      const currentAmount = await transactionRepository.getTotalByGoalId(goal.id);
      const remaining = goal.targetAmount - currentAmount;

      if (remaining <= 0) continue;

      const goalDailyAmount = Math.min(dailyAmount, remaining / differenceInDays(new Date(goal.deadline), new Date()));
      const daysNeeded = Math.ceil(remaining / goalDailyAmount);

      const estimatedFinishDate = new Date();
      estimatedFinishDate.setDate(estimatedFinishDate.getDate() + daysNeeded);

      results.push({
        goalId: goal.id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount,
        estimatedFinishDate,
      });

      // Assuming proportional distribution of daily saving
      dailyAmount -= goalDailyAmount * 0.5; // Simplified logic
    }

    return results;
  }

  // Get smart recommendations
  async getRecommendations(): Promise<CoachInsight[]> {
    const insights: CoachInsight[] = [];
    const predictions = await this.getPredictions();
    const weeklyAnalysis = await this.getWeeklyAnalysis();

    // Check for critical goals
    const criticalGoals = predictions.filter(p => p.likelihood === 'critical');
    if (criticalGoals.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Target Terancam',
        message: `${criticalGoals.length} target membutuhkan perhatian segera. Tingkatkan tabungan untuk mengejar ketertinggalan.`,
        priority: 'high',
        actionable: true,
        actionLabel: 'Lihat Target',
      });
    }

    // Streak recommendation
    if (weeklyAnalysis.daysOnTrack >= 5) {
      insights.push({
        type: 'celebration',
        title: 'Minggu Luar Biasa!',
        message: `${weeklyAnalysis.daysOnTrack} dari 7 hari berhasil mencapai target. Pertahankan momentum ini!`,
        priority: 'low',
      });
    }

    // Productivity insight
    insights.push({
      type: 'recommendation',
      title: 'Pola Produktivitas',
      message: `Hari ${weeklyAnalysis.bestDay} adalah hari terbaik Anda. Manfaatkan untuk menambah tabungan lebih besar.`,
      priority: 'medium',
    });

    return insights;
  }

  // Get motivation message
  getMotivationMessage(): string {
    const messages = [
      "Sedikit demi sedikit, lama-lama menjadi bukit.",
      "Hari ini lebih baik dari kemarin.",
      "Target besar dimulai dari langkah kecil.",
      "Konsistensi adalah kunci kesuksesan.",
      "Setiap langkah kecil membawa Anda lebih dekat ke impian.",
      "Jangan lihat seberapa jauh, lihat seberapa dekat.",
      "Kesabaran adalah kekuatan.",
      "Mulai hari ini, bukan besok.",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export const aiCoachService = new AICoachService();
