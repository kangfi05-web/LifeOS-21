// Daily Progress Repository

import { db, generateId } from '../database';
import { DailyProgress, DailyStatus } from '../types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays, differenceInCalendarDays } from 'date-fns';

export class DailyProgressRepository {
  // Create or Update
  async upsert(progress: Omit<DailyProgress, 'id'>): Promise<DailyProgress> {
    const today = startOfDay(progress.date);
    const existing = await this.getByGoalAndDate(progress.goalId, today);

    if (existing) {
      await db.dailyProgress.update(existing.id, {
        dailyCollected: progress.dailyCollected,
        difference: progress.difference,
        status: progress.status,
      });
      return { ...existing, ...progress };
    }

    const newProgress: DailyProgress = {
      ...progress,
      id: generateId(),
      date: today,
    };

    await db.dailyProgress.add(newProgress);
    return newProgress;
  }

  // Read
  async getById(id: string): Promise<DailyProgress | undefined> {
    return await db.dailyProgress.get(id);
  }

  async getByGoalId(goalId: string): Promise<DailyProgress[]> {
    return await db.dailyProgress.where('goalId').equals(goalId).toArray();
  }

  async getByDate(date: Date): Promise<DailyProgress[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return await db.dailyProgress
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByGoalAndDate(goalId: string, date: Date): Promise<DailyProgress | undefined> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return await db.dailyProgress
      .where('[goalId+date]')
      .between([goalId, start], [goalId, end])
      .first();
  }

  async getByDateRange(goalId: string, startDate: Date, endDate: Date): Promise<DailyProgress[]> {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    return await db.dailyProgress
      .where('[goalId+date]')
      .between([goalId, start], [goalId, end])
      .toArray();
  }

  async getByWeek(goalId: string, date: Date): Promise<DailyProgress[]> {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return await this.getByDateRange(goalId, start, end);
  }

  async getByMonth(goalId: string, date: Date): Promise<DailyProgress[]> {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return await this.getByDateRange(goalId, start, end);
  }

  // Stats
  async getStatsByGoal(goalId: string): Promise<{
    totalDays: number;
    onTrackDays: number;
    exceededDays: number;
    behindDays: number;
    missedDays: number;
  }> {
    const all = await this.getByGoalId(goalId);
    return {
      totalDays: all.length,
      onTrackDays: all.filter(p => p.status === 'on_track').length,
      exceededDays: all.filter(p => p.status === 'exceeded').length,
      behindDays: all.filter(p => p.status === 'behind').length,
      missedDays: all.filter(p => p.status === 'missed').length,
    };
  }

  // Streak Calculation
  async getCurrentStreak(goalId: string): Promise<number> {
    const today = startOfDay(new Date());
    const all = await this.getByGoalId(goalId);

    if (all.length === 0) return 0;

    const sorted = all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = today;

    for (const progress of sorted) {
      const progressDate = startOfDay(new Date(progress.date));
      const daysDiff = differenceInCalendarDays(currentDate, progressDate);

      if (daysDiff > 1) break;
      if (daysDiff === 0 || daysDiff === 1) {
        if (progress.status === 'on_track' || progress.status === 'exceeded') {
          streak++;
          currentDate = progressDate;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  async getBestStreak(goalId: string): Promise<number> {
    const all = await this.getByGoalId(goalId);
    if (all.length === 0) return 0;

    const sorted = all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let bestStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].status === 'on_track' || sorted[i].status === 'exceeded') {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return bestStreak;
  }

  // Get Last N Days for Heatmap
  async getLastNDays(goalId: string, days: number): Promise<Map<string, DailyProgress>> {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    const progress = await this.getByDateRange(goalId, startDate, endDate);
    const map = new Map<string, DailyProgress>();

    for (const p of progress) {
      const key = format(new Date(p.date), 'yyyy-MM-dd');
      map.set(key, p);
    }

    return map;
  }

  // Update Status
  async updateStatus(id: string, status: DailyStatus): Promise<void> {
    await db.dailyProgress.update(id, { status });
  }

  // Delete
  async deleteByGoal(goalId: string): Promise<void> {
    await db.dailyProgress.where('goalId').equals(goalId).delete();
  }
}

export const dailyProgressRepository = new DailyProgressRepository();
