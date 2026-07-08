// Achievement Repository

import { db, generateId } from '../database';
import { Achievement, AchievementCategory, AchievementRarity } from '../types';

export class AchievementRepository {
  // Create
  async create(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
    const newAchievement: Achievement = {
      ...achievement,
      id: generateId(),
    };

    await db.achievements.add(newAchievement);
    return newAchievement;
  }

  // Read
  async getById(id: string): Promise<Achievement | undefined> {
    return await db.achievements.get(id);
  }

  async getAll(): Promise<Achievement[]> {
    return await db.achievements.toArray();
  }

  async getByCategory(category: AchievementCategory): Promise<Achievement[]> {
    return await db.achievements.where('category').equals(category).toArray();
  }

  async getByRarity(rarity: AchievementRarity): Promise<Achievement[]> {
    return await db.achievements.where('rarity').equals(rarity).toArray();
  }

  async getCompleted(): Promise<Achievement[]> {
    return await db.achievements.filter(a => a.completed === true).toArray();
  }

  async getUncompleted(): Promise<Achievement[]> {
    return await db.achievements.filter(a => a.completed === false).toArray();
  }

  async getRecentUnlocked(limit: number = 5): Promise<Achievement[]> {
    const completed = await this.getCompleted();
    return completed
      .filter(a => a.unlockDate)
      .sort((a, b) => new Date(b.unlockDate!).getTime() - new Date(a.unlockDate!).getTime())
      .slice(0, limit);
  }

  // Update
  async updateProgress(id: string, progress: number): Promise<void> {
    await db.achievements.update(id, { progress });
  }

  async unlock(id: string): Promise<Achievement | undefined> {
    const achievement = await this.getById(id);
    if (!achievement || achievement.completed) return undefined;

    await db.achievements.update(id, {
      completed: true,
      progress: achievement.target,
      unlockDate: new Date(),
    });

    return await this.getById(id);
  }

  // Check and Update Progress
  async checkAndUnlock(id: string, currentValue: number): Promise<Achievement | undefined> {
    const achievement = await this.getById(id);
    if (!achievement) return undefined;

    if (currentValue >= achievement.target && !achievement.completed) {
      return await this.unlock(id);
    }

    await this.updateProgress(id, Math.min(currentValue, achievement.target));
    return await this.getById(id);
  }

  // Stats
  async count(): Promise<number> {
    return await db.achievements.count();
  }

  async countCompleted(): Promise<number> {
    const completed = await this.getCompleted();
    return completed.length;
  }

  async getTotalXP(): Promise<number> {
    const completed = await this.getCompleted();
    const rarityXP = {
      common: 10,
      rare: 25,
      epic: 50,
      legendary: 100,
      mythic: 200,
    };

    return completed.reduce((sum, a) => sum + rarityXP[a.rarity], 0);
  }
}

export const achievementRepository = new AchievementRepository();
