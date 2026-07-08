// Achievement Service - Business Logic

import { achievementRepository, transactionRepository, dailyProgressRepository, goalRepository, lifeJourneyRepository } from '../repositories';
import { eventBus } from '../utils/EventBus';
import { Achievement, AchievementCategory } from '../types';
import { XP_REWARDS } from '../constants';

export class AchievementService {
  private playerProfile = {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    title: 'Dreamer',
    currentStreak: 0,
    bestStreak: 0,
    habitScore: 0,
    financialHealth: 0,
    lifeScore: 0,
    totalCheckIns: 0,
    perfectDays: 0,
  };

  // Initialize player profile
  async initializeProfile(): Promise<void> {
    const totalXP = await achievementRepository.getTotalXP();

    this.playerProfile.xp = totalXP;
    this.playerProfile.level = this.calculateLevel(totalXP);
    this.playerProfile.xpToNextLevel = this.calculateXPForLevel(this.playerProfile.level + 1);

    // Update streak information
    const goals = await goalRepository.getActive();
    let totalStreak = 0;
    let bestStreakTotal = 0;

    for (const goal of goals) {
      const streak = await dailyProgressRepository.getCurrentStreak(goal.id);
      const best = await dailyProgressRepository.getBestStreak(goal.id);
      totalStreak += streak;
      bestStreakTotal = Math.max(bestStreakTotal, best);
    }

    this.playerProfile.currentStreak = goals.length > 0 ? Math.floor(totalStreak / goals.length) : 0;
    this.playerProfile.bestStreak = bestStreakTotal;

    this.playerProfile.title = this.getLevelTitle(this.playerProfile.level);
  }

  // Check all achievements
  async checkAllAchievements(): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    // Check saving achievements
    const totalTransactions = await transactionRepository.count();
    newlyUnlocked.push(...await this.checkCategoryAchievements('saving', totalTransactions));

    // Check goal achievements
    const totalGoals = await goalRepository.count();
    const completedGoals = await goalRepository.countByStatus('completed');

    newlyUnlocked.push(...await this.checkCategoryAchievements('goal', totalGoals));
    newlyUnlocked.push(...await this.checkSpecificAchievement('Selesai!', completedGoals));
    newlyUnlocked.push(...await this.checkSpecificAchievement('Produktif', completedGoals));
    newlyUnlocked.push(...await this.checkSpecificAchievement('Pencapai', completedGoals));

    // Check consistency achievements
    newlyUnlocked.push(...await this.checkCategoryAchievements('consistency', this.playerProfile.currentStreak));

    // Create journey entries for newly unlocked
    for (const achievement of newlyUnlocked) {
      await this.createAchievementJourney(achievement);
      eventBus.publish('achievement_unlocked', { achievementId: achievement.id, achievement });
    }

    return newlyUnlocked;
  }

  // Check category achievements
  private async checkCategoryAchievements(category: AchievementCategory, currentValue: number): Promise<Achievement[]> {
    const achievements = await achievementRepository.getByCategory(category);
    const unlocked: Achievement[] = [];

    for (const achievement of achievements) {
      if (!achievement.completed && currentValue >= achievement.target) {
        const unlockedAchievement = await achievementRepository.unlock(achievement.id);
        if (unlockedAchievement) {
          unlocked.push(unlockedAchievement);
          this.addXP(this.getXPForRarity(achievement.rarity));
        }
      } else if (!achievement.completed) {
        await achievementRepository.updateProgress(achievement.id, Math.min(currentValue, achievement.target));
      }
    }

    return unlocked;
  }

  // Check specific achievement by title
  private async checkSpecificAchievement(title: string, currentValue: number): Promise<Achievement[]> {
    const achievements = await achievementRepository.getAll();
    const achievement = achievements.find(a => a.title === title);

    if (!achievement) return [];

    if (!achievement.completed && currentValue >= achievement.target) {
      const unlockedAchievement = await achievementRepository.unlock(achievement.id);
      if (unlockedAchievement) {
        this.addXP(this.getXPForRarity(achievement.rarity));
        return [unlockedAchievement];
      }
    } else if (!achievement.completed) {
      await achievementRepository.updateProgress(achievement.id, Math.min(currentValue, achievement.target));
    }

    return [];
  }

  // Add XP and check for level up
  addXP(amount: number): boolean {
    this.playerProfile.xp += amount;

    const newLevel = this.calculateLevel(this.playerProfile.xp);
    const leveledUp = newLevel > this.playerProfile.level;

    if (leveledUp) {
      this.playerProfile.level = newLevel;
      this.playerProfile.title = this.getLevelTitle(newLevel);
      this.playerProfile.xpToNextLevel = this.calculateXPForLevel(newLevel + 1);
      eventBus.publish('level_up', { level: newLevel, xp: this.playerProfile.xp });
    }

    return leveledUp;
  }

  // Calculate level from XP
  private calculateLevel(totalXP: number): number {
    let level = 1;
    let xpRemaining = totalXP;

    while (true) {
      const xpForThisLevel = this.calculateXPForLevel(level);
      if (xpRemaining < xpForThisLevel) break;
      xpRemaining -= xpForThisLevel;
      level++;
    }

    return level;
  }

  // Calculate XP needed for a level
  private calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Get level title
  private getLevelTitle(level: number): string {
    if (level >= 100) return 'Legend';
    if (level >= 75) return 'Life Architect';
    if (level >= 50) return 'Financial Master';
    if (level >= 35) return 'Wealth Creator';
    if (level >= 20) return 'Achiever';
    if (level >= 10) return 'Builder';
    if (level >= 5) return 'Planner';
    return 'Dreamer';
  }

  // Get XP for rarity
  private getXPForRarity(rarity: string): number {
    const xpMap: Record<string, number> = {
      common: 10,
      rare: 25,
      epic: 50,
      legendary: 100,
      mythic: 200,
    };
    return xpMap[rarity] || 10;
  }

  // Create journey entry for achievement
  private async createAchievementJourney(achievement: Achievement): Promise<void> {
    await lifeJourneyRepository.create({
      date: new Date(),
      title: `Achievement Unlocked: ${achievement.title}`,
      description: achievement.description,
      category: 'achievement',
      icon: achievement.icon,
      achievementId: achievement.id,
    });
  }

  // Get player profile
  getPlayerProfile() {
    return { ...this.playerProfile };
  }

  // Update streak stats
  async updateStreakStats(): Promise<void> {
    const goals = await goalRepository.getActive();
    let totalStreak = 0;
    let bestStreakTotal = 0;

    for (const goal of goals) {
      const streak = await dailyProgressRepository.getCurrentStreak(goal.id);
      const best = await dailyProgressRepository.getBestStreak(goal.id);
      totalStreak += streak;
      bestStreakTotal = Math.max(bestStreakTotal, best);
    }

    this.playerProfile.currentStreak = goals.length > 0 ? Math.floor(totalStreak / goals.length) : 0;
    this.playerProfile.bestStreak = bestStreakTotal;
  }

  // Record daily check-in
  async recordDailyCheckIn(): Promise<{ xpEarned: number; streakUpdated: boolean }> {
    this.playerProfile.totalCheckIns++;
    this.playerProfile.currentStreak++;

    if (this.playerProfile.currentStreak > this.playerProfile.bestStreak) {
      this.playerProfile.bestStreak = this.playerProfile.currentStreak;
    }

    const xpEarned = XP_REWARDS.daily_target_reached || 50;
    this.addXP(xpEarned);

    eventBus.publish('daily_check_in', {
      streak: this.playerProfile.currentStreak,
      xp: xpEarned
    });

    return { xpEarned, streakUpdated: true };
  }

  // Get all achievements with progress
  async getAllAchievementsWithProgress(): Promise<Achievement[]> {
    return await achievementRepository.getAll();
  }

  // Get recent unlocked achievements
  async getRecentUnlockedAchievements(limit: number = 5): Promise<Achievement[]> {
    return await achievementRepository.getRecentUnlocked(limit);
  }
}

export const achievementService = new AchievementService();
