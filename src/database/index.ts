// LifeOS Database with Dexie.js

import Dexie, { type Table } from 'dexie';
import {
  User,
  Settings,
  Goal,
  Transaction,
  Wallet,
  DailyProgress,
  Achievement,
  VisionBoard,
  Notification,
  LifeJourney,
  AnalyticsCache,
  Backup,
} from '../types';
import { DATABASE_NAME, DATABASE_VERSION, DEFAULT_WALLETS, DEFAULT_SETTINGS, ACHIEVEMENTS_DEF } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export class LifeOSDatabase extends Dexie {
  users!: Table<User, string>;
  settings!: Table<Settings, string>;
  goals!: Table<Goal, string>;
  transactions!: Table<Transaction, string>;
  wallets!: Table<Wallet, string>;
  dailyProgress!: Table<DailyProgress, string>;
  achievements!: Table<Achievement, string>;
  visionBoard!: Table<VisionBoard, string>;
  notifications!: Table<Notification, string>;
  lifeJourney!: Table<LifeJourney, string>;
  analyticsCache!: Table<AnalyticsCache, string>;
  backups!: Table<Backup, string>;

  constructor() {
    super(DATABASE_NAME);

    this.version(DATABASE_VERSION).stores({
      users: 'id, name, createdAt, updatedAt',
      settings: 'id, theme, currency',
      goals: 'id, title, category, priority, status, deadline, createdAt, deletedAt',
      transactions: 'id, goalId, walletId, date, type, createdAt, [goalId+date]',
      wallets: 'id, name, type, createdAt',
      dailyProgress: 'id, goalId, date, status, [goalId+date]',
      achievements: 'id, category, completed, unlockDate',
      visionBoard: 'id, goalId, createdAt',
      notifications: 'id, type, read, createdAt',
      lifeJourney: 'id, date, category, goalId, createdAt',
      analyticsCache: 'id, type, date',
      backups: 'id, createdAt',
    });
  }
}

export const db = new LifeOSDatabase();

// Initialize Default Data
export async function initializeDatabase(): Promise<void> {
  const existingSettings = await db.settings.count();

  if (existingSettings === 0) {
    // Create Default User
    await db.users.add({
      id: uuidv4(),
      name: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create Default Settings
    await db.settings.add({
      id: uuidv4(),
      ...DEFAULT_SETTINGS,
    });

    // Create Default Wallets
    for (const wallet of DEFAULT_WALLETS) {
      await db.wallets.add({
        id: uuidv4(),
        ...wallet,
        createdAt: new Date(),
      });
    }

    // Create Default Achievements
    for (const achievement of ACHIEVEMENTS_DEF) {
      await db.achievements.add({
        id: uuidv4(),
        ...achievement,
        progress: 0,
        completed: false,
      });
    }
  }
}

// Export helper for transactions
export function generateId(): string {
  return uuidv4();
}
