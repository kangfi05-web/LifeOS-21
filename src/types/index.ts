// LifeOS Type Definitions

export type GoalStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type GoalPriority = 'critical' | 'high' | 'medium' | 'low';
export type GoalCategory =
  | 'debt' | 'savings' | 'house' | 'car' | 'motorcycle' | 'vacation'
  | 'emergency_fund' | 'business' | 'education' | 'dream' | 'monthly_target' | 'other';

export type TransactionType = 'daily' | 'quick_add' | 'manual' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'income' | 'expense';
export type DailyStatus = 'missed' | 'behind' | 'on_track' | 'exceeded';
export type WalletType = 'cash' | 'bank' | 'e_wallet' | 'investment' | 'other';

export type AchievementCategory = 'saving' | 'goal' | 'consistency' | 'wallet' | 'habit' | 'milestone' | 'special' | 'secret';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type NotificationType = 'reminder' | 'achievement' | 'goal' | 'deadline' | 'wallet' | 'ai_coach' | 'life_journey' | 'milestone';
export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';

export type JourneyCategory =
  | 'goal_created' | 'saving_added' | 'daily_target_reached' | 'new_streak'
  | 'achievement' | 'goal_completed' | 'new_wallet' | 'life_milestone' | 'note';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  animation: boolean;
  dashboardLayout: string;
  quickAddAmounts: number[];
  notification: boolean;
  firstDayOfWeek: number;
  // Data Protection & Recovery
  lastBackupAt?: Date;
  changesSinceBackup?: number;
}

export interface AuditLogEntry {
  id: string;
  type: 'backup' | 'restore' | 'import' | 'export' | 'delete_all' | 'migration';
  status: 'success' | 'failed';
  detail?: string;
  recordCount?: number;
  tableCount?: number;
  timestamp: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  targetAmount: number;
  remainingAmount: number;
  progress: number;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
  startDate: Date;
  deadline: Date;
  estimatedFinish?: Date;
  estimatedDelay?: number;
  coverImage?: string;
  icon?: string;
  color?: string;
  notes?: string;
  walletId?: string;
  // Mode cicilan bulanan (mis. hutang yang dibayar tiap bulan selama N bulan).
  // Kalau diisi, dailyTarget dihitung mengejar cicilan BULAN BERJALAN saja,
  // bukan disebar ke seluruh durasi target.
  installmentMonths?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Transaction {
  id: string;
  goalId?: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  date: Date;
  note?: string;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  type: WalletType;
  createdAt: Date;
}

export interface DailyProgress {
  id: string;
  goalId: string;
  date: Date;
  dailyTarget: number;
  dailyCollected: number;
  difference: number;
  status: DailyStatus;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  progress: number;
  target: number;
  completed: boolean;
  unlockDate?: Date;
}

export interface VisionBoard {
  id: string;
  goalId: string;
  image?: string;
  quote?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface LifeJourney {
  id: string;
  date: Date;
  title: string;
  description?: string;
  category: JourneyCategory;
  icon: string;
  image?: string;
  mood?: string;
  achievementId?: string;
  goalId?: string;
  createdAt: Date;
}

export interface AnalyticsCache {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface Backup {
  id: string;
  name: string;
  data: string;
  createdAt: Date;
}

// Player Profile for Gamification
export interface PlayerProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  currentStreak: number;
  bestStreak: number;
  habitScore: number;
  financialHealth: number;
  lifeScore: number;
  totalCheckIns: number;
  perfectDays: number;
}

// Event Types for Event Bus
export type EventType =
  | 'goal_created' | 'goal_updated' | 'goal_completed' | 'goal_deleted'
  | 'saving_added' | 'saving_deleted'
  | 'wallet_created' | 'wallet_updated' | 'wallet_transfer'
  | 'achievement_unlocked' | 'level_up'
  | 'journey_created'
  | 'notification_created'
  | 'streak_updated' | 'daily_check_in';

export interface AppEvent {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: Date;
}
