// Goal Repository

import { db, generateId } from '../database';
import { Goal, GoalStatus, GoalPriority, GoalCategory } from '../types';
import { differenceInDays, differenceInCalendarDays, isAfter, isBefore } from 'date-fns';
import { roundDailyTarget } from '../utils/calculations';

export class GoalRepository {
  // Create
  async create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'remainingAmount' | 'dailyTarget' | 'weeklyTarget' | 'monthlyTarget'>): Promise<Goal> {
    const now = new Date();
    const totalDays = differenceInCalendarDays(new Date(goal.deadline), new Date(goal.startDate)) + 1;
    const dailyTargetRaw = totalDays > 0 ? goal.targetAmount / totalDays : 0;
    const dailyTarget = roundDailyTarget(dailyTargetRaw);
    const weeklyTarget = roundDailyTarget(dailyTargetRaw * 7);
    const monthlyTarget = roundDailyTarget(dailyTargetRaw * 30);

    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      progress: 0,
      remainingAmount: goal.targetAmount,
      dailyTarget,
      weeklyTarget,
      monthlyTarget,
      createdAt: now,
      updatedAt: now,
    };

    await db.goals.add(newGoal);
    return newGoal;
  }

  // Read
  async getById(id: string): Promise<Goal | undefined> {
    return await db.goals.get(id);
  }

  async getByIds(ids: string[]): Promise<Goal[]> {
    return await db.goals.where('id').anyOf(ids).toArray();
  }

  async getAll(): Promise<Goal[]> {
    return await db.goals.where('deletedAt').equals(undefined as unknown as Date).toArray();
  }

  async getByStatus(status: GoalStatus): Promise<Goal[]> {
    return await db.goals.where(['status', 'deletedAt']).equals([status, undefined as unknown as Date]).toArray();
  }

  async getActive(): Promise<Goal[]> {
    return await db.goals
      .where('status')
      .equals('active')
      .filter(g => !g.deletedAt)
      .toArray();
  }

  async getActiveWithUpcomingDeadline(days: number): Promise<Goal[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db.goals
      .where('status')
      .equals('active')
      .filter(g => {
        if (g.deletedAt) return false;
        const deadline = new Date(g.deadline);
        return isAfter(deadline, now) && isBefore(deadline, futureDate);
      })
      .toArray();
  }

  async getByCategory(category: GoalCategory): Promise<Goal[]> {
    return await db.goals.where(['category', 'deletedAt']).equals([category, undefined as unknown as Date]).toArray();
  }

  async getByPriority(priority: GoalPriority): Promise<Goal[]> {
    return await db.goals.where(['priority', 'deletedAt']).equals([priority, undefined as unknown as Date]).toArray();
  }

  async getCompleted(): Promise<Goal[]> {
    return await db.goals.where('status').equals('completed').filter(g => !g.deletedAt).toArray();
  }

  async getTopPriorities(limit: number = 3): Promise<Goal[]> {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const goals = await this.getActive();
    return goals
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, limit);
  }

  // Update
  async update(id: string, updates: Partial<Goal>): Promise<void> {
    await db.goals.update(id, { ...updates, updatedAt: new Date() });
  }

  async updateProgress(id: string, collectedAmount: number): Promise<Goal | undefined> {
    const goal = await this.getById(id);
    if (!goal) return undefined;

    const progress = Math.min(100, (collectedAmount / goal.targetAmount) * 100);
    const remainingAmount = Math.max(0, goal.targetAmount - collectedAmount);
    const remainingDays = differenceInDays(new Date(goal.deadline), new Date()) + 1;
    const dailyTargetRaw = remainingDays > 0 ? remainingAmount / remainingDays : remainingAmount;
    const dailyTarget = roundDailyTarget(dailyTargetRaw);

    const updatedGoal = {
      progress,
      remainingAmount,
      dailyTarget,
      weeklyTarget: roundDailyTarget(dailyTargetRaw * 7),
      monthlyTarget: roundDailyTarget(dailyTargetRaw * 30),
      updatedAt: new Date(),
    };

    await this.update(id, updatedGoal);
    return await this.getById(id);
  }

  // Hitung ulang dailyTarget/weeklyTarget/monthlyTarget semua goal aktif berdasarkan
  // TANGGAL HARI INI — bukan cuma saat ada transaksi. Ini memastikan kalau user
  // beberapa hari tidak menabung, kekurangannya otomatis "menumpuk" dan terdistribusi
  // ke sisa hari yang ada, bukan malah tetap pakai angka lama yang basi.
  // Dipanggil sekali tiap aplikasi dibuka (lihat AppStore.initialize).
  async recalculateActiveTargets(): Promise<void> {
    const activeGoals = await this.getActive();
    const today = new Date();

    for (const goal of activeGoals) {
      const remainingDays = differenceInCalendarDays(new Date(goal.deadline), today) + 1;
      const dailyTargetRaw =
        remainingDays > 0 ? goal.remainingAmount / remainingDays : goal.remainingAmount;
      const dailyTarget = roundDailyTarget(dailyTargetRaw);
      const weeklyTarget = roundDailyTarget(dailyTargetRaw * 7);
      const monthlyTarget = roundDailyTarget(dailyTargetRaw * 30);

      // Hanya tulis ke DB kalau memang berubah, supaya tidak boros write tiap buka app
      if (
        goal.dailyTarget !== dailyTarget ||
        goal.weeklyTarget !== weeklyTarget ||
        goal.monthlyTarget !== monthlyTarget
      ) {
        await db.goals.update(goal.id, {
          dailyTarget,
          weeklyTarget,
          monthlyTarget,
          updatedAt: new Date(),
        });
      }
    }
  }

  async markCompleted(id: string): Promise<void> {
    const now = new Date();
    await db.goals.update(id, {
      status: 'completed',
      progress: 100,
      remainingAmount: 0,
      dailyTarget: 0,
      weeklyTarget: 0,
      monthlyTarget: 0,
      updatedAt: now,
    });
  }

  async pause(id: string): Promise<void> {
    await db.goals.update(id, { status: 'paused', updatedAt: new Date() });
  }

  async resume(id: string): Promise<void> {
    await db.goals.update(id, { status: 'active', updatedAt: new Date() });
  }

  // Delete (Soft Delete)
  async delete(id: string): Promise<void> {
    await db.goals.update(id, { deletedAt: new Date(), updatedAt: new Date() });
  }

  async restore(id: string): Promise<void> {
    await db.goals.update(id, { deletedAt: undefined, updatedAt: new Date() });
  }

  // Stats
  async count(): Promise<number> {
    return await db.goals.filter(g => !g.deletedAt).count();
  }

  async countByStatus(status: GoalStatus): Promise<number> {
    return await db.goals.where('status').equals(status).filter(g => !g.deletedAt).count();
  }

  async getTotalTargetAmount(): Promise<number> {
    const goals = await this.getActive();
    return goals.reduce((sum, g) => sum + g.targetAmount, 0);
  }

  async getTotalProgress(): Promise<number> {
    const goals = await this.getActive();
    if (goals.length === 0) return 0;
    return goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
  }
}

export const goalRepository = new GoalRepository();
