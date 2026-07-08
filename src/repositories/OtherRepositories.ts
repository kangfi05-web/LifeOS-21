// Other Repositories

import { db, generateId } from '../database';
import { User, Settings, Notification, VisionBoard, AnalyticsCache, Backup } from '../types';

// User Repository
export class UserRepository {
  async getCurrentUser(): Promise<User | undefined> {
    const users = await db.users.toArray();
    return users[0];
  }

  async create(name: string): Promise<User> {
    const user: User = {
      id: generateId(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.users.add(user);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<void> {
    await db.users.update(id, { ...updates, updatedAt: new Date() });
  }
}

// Settings Repository
export class SettingsRepository {
  async get(): Promise<Settings | undefined> {
    const settings = await db.settings.toArray();
    return settings[0];
  }

  async update(id: string, updates: Partial<Settings>): Promise<void> {
    await db.settings.update(id, updates);
  }
}

// Notification Repository
export class NotificationRepository {
  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
    };
    await db.notifications.add(newNotification);
    return newNotification;
  }

  async getAll(): Promise<Notification[]> {
    return await db.notifications.orderBy('createdAt').reverse().toArray();
  }

  async getUnread(): Promise<Notification[]> {
    return await db.notifications.filter(n => !n.read).reverse().toArray();
  }

  async getById(id: string): Promise<Notification | undefined> {
    return await db.notifications.get(id);
  }

  async markAsRead(id: string): Promise<void> {
    await db.notifications.update(id, { read: true });
  }

  async markAllAsRead(): Promise<void> {
    const unread = await this.getUnread();
    for (const n of unread) {
      await db.notifications.update(n.id, { read: true });
    }
  }

  async delete(id: string): Promise<void> {
    await db.notifications.delete(id);
  }

  async unreadCount(): Promise<number> {
    const unread = await this.getUnread();
    return unread.length;
  }
}

// Vision Board Repository
export class VisionBoardRepository {
  async create(vision: Omit<VisionBoard, 'id' | 'createdAt'>): Promise<VisionBoard> {
    const newVision: VisionBoard = {
      ...vision,
      id: generateId(),
      createdAt: new Date(),
    };
    await db.visionBoard.add(newVision);
    return newVision;
  }

  async getByGoalId(goalId: string): Promise<VisionBoard | undefined> {
    return await db.visionBoard.where('goalId').equals(goalId).first();
  }

  async getAll(): Promise<VisionBoard[]> {
    return await db.visionBoard.toArray();
  }

  async update(id: string, updates: Partial<VisionBoard>): Promise<void> {
    await db.visionBoard.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    await db.visionBoard.delete(id);
  }
}

// Analytics Cache Repository
export class AnalyticsCacheRepository {
  async get(type: string, date: Date): Promise<AnalyticsCache | undefined> {
    return await db.analyticsCache.where(['type', 'date']).equals([type, date]).first();
  }

  async set(type: string, date: Date, data: Record<string, unknown>): Promise<void> {
    const existing = await this.get(type, date);
    if (existing) {
      await db.analyticsCache.update(existing.id, { data, createdAt: new Date() });
    } else {
      await db.analyticsCache.add({
        id: generateId(),
        type: type as AnalyticsCache['type'],
        date,
        data,
        createdAt: new Date(),
      });
    }
  }

  async clear(): Promise<void> {
    await db.analyticsCache.clear();
  }
}

// Backup Repository
export class BackupRepository {
  async create(name: string, data: string): Promise<Backup> {
    const backup: Backup = {
      id: generateId(),
      name,
      data,
      createdAt: new Date(),
    };
    await db.backups.add(backup);
    return backup;
  }

  async getAll(): Promise<Backup[]> {
    return await db.backups.orderBy('createdAt').reverse().toArray();
  }

  async getById(id: string): Promise<Backup | undefined> {
    return await db.backups.get(id);
  }

  async getLatest(): Promise<Backup | undefined> {
    return await db.backups.orderBy('createdAt').reverse().first();
  }

  async delete(id: string): Promise<void> {
    await db.backups.delete(id);
  }
}

export const userRepository = new UserRepository();
export const settingsRepository = new SettingsRepository();
export const notificationRepository = new NotificationRepository();
export const visionBoardRepository = new VisionBoardRepository();
export const analyticsCacheRepository = new AnalyticsCacheRepository();
export const backupRepository = new BackupRepository();
