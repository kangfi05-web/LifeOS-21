// Analytics data aggregator — menghitung statistik nyata dari data user
// (menggantikan mock data yang sebelumnya dipakai di halaman Analytics)

import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale/id';
import { goalRepository, transactionRepository, dailyProgressRepository, achievementRepository } from '../repositories';
import { GOAL_CATEGORIES } from '../constants';
import { GoalCategory } from '../types';

export interface WeeklyPoint {
  name: string;
  amount: number;
}

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  weeklyData: WeeklyPoint[];
  weeklyTrendPercent: number;
  categoryData: CategorySlice[];
  hasCategoryData: boolean;
  currentStreak: number;
  achievementCount: number;
  healthScore: number;
  activeGoalsCount: number;
}

// Progress mingguan: total dana masuk per hari selama 7 hari terakhir
async function getWeeklyData(): Promise<{ points: WeeklyPoint[]; trendPercent: number }> {
  const today = startOfDay(new Date());
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(subDays(today, i));
  }

  const points: WeeklyPoint[] = [];
  for (const day of days) {
    const total = await transactionRepository.getTotalByDateRange(startOfDay(day), endOfDay(day));
    points.push({ name: format(day, 'EEE', { locale: localeId }), amount: total });
  }

  const firstHalf = points.slice(0, 3).reduce((sum, p) => sum + p.amount, 0);
  const secondHalf = points.slice(4).reduce((sum, p) => sum + p.amount, 0);
  let trendPercent = 0;
  if (firstHalf > 0) {
    trendPercent = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  } else if (secondHalf > 0) {
    trendPercent = 100;
  }

  return { points, trendPercent };
}

// Distribusi target: total dana terkumpul per kategori goal aktif
async function getCategoryData(): Promise<{ slices: CategorySlice[]; hasData: boolean }> {
  const goals = await goalRepository.getActive();
  const totalsByCategory = new Map<GoalCategory, number>();

  for (const goal of goals) {
    const collected = Math.max(0, goal.targetAmount - goal.remainingAmount);
    totalsByCategory.set(goal.category, (totalsByCategory.get(goal.category) ?? 0) + collected);
  }

  const grandTotal = Array.from(totalsByCategory.values()).reduce((a, b) => a + b, 0);

  if (grandTotal === 0) {
    return { slices: [], hasData: false };
  }

  const slices: CategorySlice[] = Array.from(totalsByCategory.entries())
    .map(([category, amount]) => ({
      name: GOAL_CATEGORIES[category]?.label ?? category,
      value: Math.round((amount / grandTotal) * 100),
      color: GOAL_CATEGORIES[category]?.color ?? '#64748B',
    }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);

  return { slices, hasData: slices.length > 0 };
}

// Streak rata-rata dari semua goal aktif (konsisten dengan logika AchievementService)
async function getAverageStreak(): Promise<number> {
  const goals = await goalRepository.getActive();
  if (goals.length === 0) return 0;

  let total = 0;
  for (const goal of goals) {
    total += await dailyProgressRepository.getCurrentStreak(goal.id);
  }

  return Math.round(total / goals.length);
}

// Skor kesehatan finansial (0-100), dihitung dari:
// - rata-rata progress goal aktif (50%)
// - rasio hari on-track/exceeded dari total hari tercatat (35%)
// - bonus streak, dicap di 15 poin (15%)
async function getHealthScore(): Promise<number> {
  const goals = await goalRepository.getActive();
  if (goals.length === 0) return 0;

  const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;

  let totalDays = 0;
  let goodDays = 0;
  for (const goal of goals) {
    const stats = await dailyProgressRepository.getStatsByGoal(goal.id);
    totalDays += stats.totalDays;
    goodDays += stats.onTrackDays + stats.exceededDays;
  }
  const consistencyRatio = totalDays > 0 ? (goodDays / totalDays) * 100 : 0;

  const streak = await getAverageStreak();
  const streakBonus = Math.min(15, streak);

  const score = avgProgress * 0.5 + consistencyRatio * 0.35 + streakBonus;
  return Math.round(Math.min(100, score));
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [weekly, category, currentStreak, achievementCount, healthScore, activeGoalsCount] =
    await Promise.all([
      getWeeklyData(),
      getCategoryData(),
      getAverageStreak(),
      achievementRepository.countCompleted(),
      getHealthScore(),
      goalRepository.countByStatus('active'),
    ]);

  return {
    weeklyData: weekly.points,
    weeklyTrendPercent: weekly.trendPercent,
    categoryData: category.slices,
    hasCategoryData: category.hasData,
    currentStreak,
    achievementCount,
    healthScore,
    activeGoalsCount,
  };
}
