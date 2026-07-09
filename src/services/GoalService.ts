// Goal Service - Business Logic

import { goalRepository } from '../repositories';
import { transactionRepository } from '../repositories';
import { dailyProgressRepository } from '../repositories';
import { lifeJourneyRepository } from '../repositories';
import { eventBus } from '../utils/EventBus';
import { Goal, GoalPriority, GoalCategory } from '../types';
import { differenceInDays, startOfDay } from 'date-fns';

export class GoalService {
  // Create a new goal
  async createGoal(data: {
    title: string;
    description?: string;
    category: GoalCategory;
    priority: GoalPriority;
    targetAmount: number;
    startDate: Date;
    deadline: Date;
    coverImage?: string;
    icon?: string;
    color?: string;
    notes?: string;
    walletId?: string;
    installmentMonths?: number;
  }): Promise<Goal> {
    const goal = await goalRepository.create({
      ...data,
      status: 'active',
    });

    // Create life journey entry
    await lifeJourneyRepository.create({
      date: new Date(),
      title: `Memulai target: ${goal.title}`,
      description: `Target Rp${goal.targetAmount.toLocaleString('id-ID')} diselesaikan dalam ${differenceInDays(new Date(goal.deadline), new Date(goal.startDate))} hari`,
      category: 'goal_created',
      icon: 'target',
      goalId: goal.id,
    });

    // Emit event
    eventBus.publish('goal_created', { goalId: goal.id, goal });

    return goal;
  }

  // Update goal
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    await goalRepository.update(id, updates);
    const goal = await goalRepository.getById(id);

    if (goal) {
      eventBus.publish('goal_updated', { goalId: id, updates, goal });
    }

    return goal;
  }

  // Add saving to goal
  async addSaving(
    goalId: string,
    amount: number,
    walletId: string,
    type: 'daily' | 'quick_add' | 'manual' | 'adjustment' = 'manual',
    note?: string
  ): Promise<{ goal: Goal; amount: number }> {
    // Create transaction
    const transaction = await transactionRepository.create({
      goalId,
      walletId,
      amount,
      type,
      date: new Date(),
      note,
    });

    // Calculate total collected
    const totalCollected = await transactionRepository.getTotalByGoalId(goalId);

    // Update goal progress
    const goal = await goalRepository.updateProgress(goalId, totalCollected);

    if (goal) {
      // Update daily progress
      const today = startOfDay(new Date());
      const dailyCollected = await transactionRepository.getDailyTotalByGoal(goalId, today);

      await dailyProgressRepository.upsert({
        goalId,
        date: today,
        dailyTarget: goal.dailyTarget,
        dailyCollected,
        difference: dailyCollected - goal.dailyTarget,
        status: this.getDailyStatus(dailyCollected, goal.dailyTarget),
      });

      // Check if goal is completed
      if (goal.progress >= 100 && goal.status !== 'completed') {
        await this.completeGoal(goalId);
      }

      // Create journey entry for significant milestones
      if (goal.progress >= 50 && goal.progress < 55) {
        await lifeJourneyRepository.create({
          date: new Date(),
          title: `${goal.title} - Setengah Tercapai!`,
          description: `Sudah mengumpulkan 50% dari target`,
          category: 'saving_added',
          icon: 'trophy',
          goalId: goal.id,
        });
      }

      // Emit event
      eventBus.publish('saving_added', { goalId, amount, transaction, goal });
    }

    return { goal: goal!, amount };
  }

  // Complete a goal
  async completeGoal(id: string): Promise<Goal | undefined> {
    await goalRepository.markCompleted(id);
    const goal = await goalRepository.getById(id);

    if (goal) {
      // Create journey entry
      await lifeJourneyRepository.create({
        date: new Date(),
        title: `Target Tercapai: ${goal.title}!`,
        description: `Berhasil mengumpulkan Rp${goal.targetAmount.toLocaleString('id-ID')}`,
        category: 'goal_completed',
        icon: 'check-circle',
        goalId: goal.id,
      });

      // Emit event
      eventBus.publish('goal_completed', { goalId: id, goal });
    }

    return goal;
  }

  // Pause goal
  async pauseGoal(id: string): Promise<void> {
    await goalRepository.pause(id);
    eventBus.publish('goal_updated', { goalId: id, status: 'paused' });
  }

  // Resume goal
  async resumeGoal(id: string): Promise<void> {
    await goalRepository.resume(id);
    eventBus.publish('goal_updated', { goalId: id, status: 'active' });
  }

  // Delete goal (soft delete)
  async deleteGoal(id: string): Promise<void> {
    await goalRepository.delete(id);
    eventBus.publish('goal_deleted', { goalId: id });
  }

  // Restore goal
  async restoreGoal(id: string): Promise<Goal | undefined> {
    await goalRepository.restore(id);
    return await goalRepository.getById(id);
  }

  // Get goal with statistics
  async getGoalWithStats(id: string): Promise<{
    goal: Goal;
    totalCollected: number;
    transactions: number;
    streak: number;
    bestStreak: number;
  } | undefined> {
    const goal = await goalRepository.getById(id);
    if (!goal) return undefined;

    const totalCollected = await transactionRepository.getTotalByGoalId(id);
    const transactions = await transactionRepository.getByGoalId(id);
    const streak = await dailyProgressRepository.getCurrentStreak(id);
    const bestStreak = await dailyProgressRepository.getBestStreak(id);

    return {
      goal,
      totalCollected,
      transactions: transactions.length,
      streak,
      bestStreak,
    };
  }

  // Get all active goals with priorities
  async getActiveGoalsWithPriorities(): Promise<Goal[]> {
    return await goalRepository.getTopPriorities(10);
  }

  // Get goals needing attention
  async getGoalsNeedingAttention(): Promise<{
    behindSchedule: Goal[];
    nearDeadline: Goal[];
    lowProgress: Goal[];
  }> {
    const activeGoals = await goalRepository.getActive();
    const today = new Date();

    const behindSchedule: Goal[] = [];
    const nearDeadline: Goal[] = [];
    const lowProgress: Goal[] = [];

    for (const goal of activeGoals) {
      const remainingDays = differenceInDays(new Date(goal.deadline), today);
      const expectedProgress = this.calculateExpectedProgress(goal);

      if (goal.progress < expectedProgress - 10) {
        behindSchedule.push(goal);
      }

      if (remainingDays <= 30 && remainingDays > 0 && goal.progress < 80) {
        nearDeadline.push(goal);
      }

      if (remainingDays <= 7 && goal.progress < 50) {
        lowProgress.push(goal);
      }
    }

    return { behindSchedule, nearDeadline, lowProgress };
  }

  // Calculate expected progress based on time elapsed
  private calculateExpectedProgress(goal: Goal): number {
    const totalDays = differenceInDays(new Date(goal.deadline), new Date(goal.startDate));
    const daysElapsed = differenceInDays(new Date(), new Date(goal.startDate));

    if (totalDays <= 0) return 100;
    return Math.min(100, (daysElapsed / totalDays) * 100);
  }

  // Get daily status
  private getDailyStatus(collected: number, target: number): 'missed' | 'behind' | 'on_track' | 'exceeded' {
    if (target === 0) return 'on_track';
    const ratio = collected / target;
    if (ratio >= 1.1) return 'exceeded';
    if (ratio >= 0.9) return 'on_track';
    if (ratio >= 0.5) return 'behind';
    return 'missed';
  }

  // Get dashboard summary
  async getDashboardSummary(): Promise<{
    activeGoals: number;
    completedGoals: number;
    totalTarget: number;
    totalCollected: number;
    todayTarget: number;
    todayCollected: number;
    overallProgress: number;
  }> {
    const activeGoals = await goalRepository.getActive();
    const completedGoals = await goalRepository.getCompleted();
    const totalTarget = await goalRepository.getTotalTargetAmount();
    const overallProgress = await goalRepository.getTotalProgress();

    let totalCollected = 0;
    let todayTarget = 0;
    let todayCollected = 0;

    const today = startOfDay(new Date());

    for (const goal of activeGoals) {
      const collected = await transactionRepository.getTotalByGoalId(goal.id);
      totalCollected += collected;
      todayTarget += goal.dailyTarget;

      const dailyTotal = await transactionRepository.getDailyTotalByGoal(goal.id, today);
      todayCollected += dailyTotal;
    }

    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalCollected,
      todayTarget,
      todayCollected,
      overallProgress,
    };
  }
}

export const goalService = new GoalService();
