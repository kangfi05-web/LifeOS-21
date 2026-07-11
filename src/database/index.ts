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
  AuditLogEntry,
} from '../types';
import { DATABASE_NAME, DEFAULT_WALLETS, DEFAULT_SETTINGS, ACHIEVEMENTS_DEF } from '../constants';
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
  auditLog!: Table<AuditLogEntry, string>;

  constructor() {
    super(DATABASE_NAME);

    const baseSchema = {
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
    };

    // Versi 1 (skema asli) — dipertahankan supaya user lama bisa upgrade dengan aman
    this.version(1).stores(baseSchema);

    // Versi 2 — tambah tabel auditLog untuk mencatat riwayat backup/restore/import/export.
    // Additive-only (tidak mengubah/menghapus tabel lama), jadi data user lama tetap utuh.
    this.version(2).stores({
      ...baseSchema,
      auditLog: 'id, type, status, timestamp',
    });
  }
}

export const db = new LifeOSDatabase();

// Buat Installation ID unik permanen, format: LIFEOS-XXXX-XXXX-XXXX
function generateInstallationId(): string {
  const segment = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
  return `LIFEOS-${segment()}-${segment()}-${segment()}`;
}

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

    // Create Default Settings (termasuk Installation ID permanen untuk perangkat ini)
    await db.settings.add({
      id: uuidv4(),
      ...DEFAULT_SETTINGS,
      installationId: generateInstallationId(),
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
  } else {
    // User lama (settings sudah ada sebelum fitur Installation ID ini dibuat) —
    // generate sekali saja kalau belum punya, tanpa mengubah data lain.
    const settings = await db.settings.toCollection().first();
    if (settings && !settings.installationId) {
      await db.settings.update(settings.id, { installationId: generateInstallationId() });
    }
  }
}

// Export helper for transactions
export function generateId(): string {
  return uuidv4();
}
