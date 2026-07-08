// Life Journey Repository

import { db, generateId } from '../database';
import { LifeJourney, JourneyCategory } from '../types';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export class LifeJourneyRepository {
  // Create
  async create(journey: Omit<LifeJourney, 'id' | 'createdAt'>): Promise<LifeJourney> {
    const newJourney: LifeJourney = {
      ...journey,
      id: generateId(),
      createdAt: new Date(),
    };

    await db.lifeJourney.add(newJourney);
    return newJourney;
  }

  // Read
  async getById(id: string): Promise<LifeJourney | undefined> {
    return await db.lifeJourney.get(id);
  }

  async getAll(): Promise<LifeJourney[]> {
    return await db.lifeJourney.orderBy('date').reverse().toArray();
  }

  // Ambil N entri terbaru langsung lewat index 'date' (tanpa fetch seluruh tabel + sort di JS)
  async getRecent(limit: number = 20): Promise<LifeJourney[]> {
    return await db.lifeJourney.orderBy('date').reverse().limit(limit).toArray();
  }

  async getByDate(date: Date): Promise<LifeJourney[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return await db.lifeJourney
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByMonth(date: Date): Promise<LifeJourney[]> {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return await db.lifeJourney
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<LifeJourney[]> {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    return await db.lifeJourney
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByYear(year: number): Promise<LifeJourney[]> {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return await db.lifeJourney
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByCategory(category: JourneyCategory): Promise<LifeJourney[]> {
    return await db.lifeJourney.where('category').equals(category).toArray();
  }

  async getByGoalId(goalId: string): Promise<LifeJourney[]> {
    return await db.lifeJourney.where('goalId').equals(goalId).toArray();
  }

  async getByAchievementId(achievementId: string): Promise<LifeJourney | undefined> {
    return await db.lifeJourney.where('achievementId').equals(achievementId).first();
  }

  // Timeline - Get milestones
  async getMilestones(): Promise<LifeJourney[]> {
    const categories: JourneyCategory[] = ['goal_completed', 'achievement', 'life_milestone'];
    const all = await db.lifeJourney.toArray();
    return all
      .filter(j => categories.includes(j.category))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Update
  async update(id: string, updates: Partial<LifeJourney>): Promise<void> {
    await db.lifeJourney.update(id, updates);
  }

  // Delete
  async delete(id: string): Promise<void> {
    await db.lifeJourney.delete(id);
  }

  // Stats
  async count(): Promise<number> {
    return await db.lifeJourney.count();
  }

  async countByCategory(category: JourneyCategory): Promise<number> {
    return await db.lifeJourney.where('category').equals(category).count();
  }
}

export const lifeJourneyRepository = new LifeJourneyRepository();
