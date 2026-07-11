// LifeOS Constants

import { Wallet, Achievement, Settings } from '../types';

export const APP_NAME = 'LifeOS';
export const APP_VERSION = '1.0.0';
export const DATABASE_NAME = 'LifeOS_DB';
export const DATABASE_VERSION = 2;

// Currency
export const DEFAULT_CURRENCY = 'IDR';
export const CURRENCY_SYMBOL = 'Rp';

// Quick Add Amounts
export const QUICK_ADD_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];

// Default Wallets
export const DEFAULT_WALLETS: Omit<Wallet, 'id' | 'createdAt'>[] = [
  { name: 'Cash', icon: 'wallet', color: '#10B981', balance: 0, type: 'cash' },
  { name: 'BCA', icon: 'building-2', color: '#3B82F6', balance: 0, type: 'bank' },
  { name: 'Mandiri', icon: 'building-2', color: '#F59E0B', balance: 0, type: 'bank' },
  { name: 'BRI', icon: 'building-2', color: '#6366F1', balance: 0, type: 'bank' },
  { name: 'BNI', icon: 'building-2', color: '#EF4444', balance: 0, type: 'bank' },
  { name: 'Dana', icon: 'smartphone', color: '#0EA5E9', balance: 0, type: 'e_wallet' },
  { name: 'OVO', icon: 'smartphone', color: '#8B5CF6', balance: 0, type: 'e_wallet' },
  { name: 'GoPay', icon: 'smartphone', color: '#22C55E', balance: 0, type: 'e_wallet' },
  { name: 'ShopeePay', icon: 'smartphone', color: '#F97316', balance: 0, type: 'e_wallet' },
];

// Default Settings
export const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  theme: 'dark',
  currency: DEFAULT_CURRENCY,
  language: 'id',
  animation: true,
  dashboardLayout: 'default',
  quickAddAmounts: QUICK_ADD_AMOUNTS,
  notification: true,
  firstDayOfWeek: 1,
};

// Goal Categories
export const GOAL_CATEGORIES = {
  debt: { label: 'Hutang', icon: 'credit-card', color: '#EF4444' },
  savings: { label: 'Tabungan', icon: 'piggy-bank', color: '#10B981' },
  house: { label: 'Rumah', icon: 'home', color: '#3B82F6' },
  car: { label: 'Mobil', icon: 'car', color: '#F59E0B' },
  motorcycle: { label: 'Motor', icon: 'bike', color: '#8B5CF6' },
  vacation: { label: 'Liburan', icon: 'plane', color: '#06B6D4' },
  emergency_fund: { label: 'Dana Darurat', icon: 'shield', color: '#22C55E' },
  business: { label: 'Bisnis', icon: 'briefcase', color: '#F97316' },
  education: { label: 'Pendidikan', icon: 'graduation-cap', color: '#A855F7' },
  dream: { label: 'Impian', icon: 'sparkles', color: '#EC4899' },
  monthly_target: { label: 'Target Bulanan', icon: 'calendar', color: '#6366F1' },
  other: { label: 'Lainnya', icon: 'folder', color: '#64748B' },
};

// Achievements Definition
export const ACHIEVEMENTS_DEF: Omit<Achievement, 'id' | 'progress' | 'completed' | 'unlockDate'>[] = [
  // Saving Achievements
  { title: 'Langkah Pertama', description: 'Tambahkan dana pertama', icon: 'footprints', category: 'saving', rarity: 'common', target: 1 },
  { title: 'Konsisten', description: 'Tambah dana 10 kali', icon: 'repeat', category: 'saving', rarity: 'common', target: 10 },
  { title: 'Tabungan Rutin', description: 'Tambah dana 100 kali', icon: 'trending-up', category: 'saving', rarity: 'rare', target: 100 },
  { title: 'Juru Tabung', description: 'Tambah dana 500 kali', icon: 'coins', category: 'saving', rarity: 'epic', target: 500 },
  { title: 'Miliar', description: 'Total tabungan mencapai 1 Miliar', icon: 'gem', category: 'saving', rarity: 'mythic', target: 1000000000 },

  // Goal Achievements
  { title: 'Pemimpi', description: 'Buat target pertama', icon: 'target', category: 'goal', rarity: 'common', target: 1 },
  { title: 'Perencana', description: 'Buat 5 target', icon: 'list-checks', category: 'goal', rarity: 'common', target: 5 },
  { title: 'Pemburu Impian', description: 'Buat 10 target', icon: 'crosshair', category: 'goal', rarity: 'rare', target: 10 },
  { title: 'Visioner', description: 'Buat 25 target', icon: 'eye', category: 'goal', rarity: 'epic', target: 25 },
  { title: 'Selesai!', description: 'Selesaikan target pertama', icon: 'check-circle', category: 'goal', rarity: 'common', target: 1 },
  { title: 'Produktif', description: 'Selesaikan 5 target', icon: 'award', category: 'goal', rarity: 'rare', target: 5 },
  { title: 'Pencapai', description: 'Selesaikan 10 target', icon: 'trophy', category: 'goal', rarity: 'epic', target: 10 },
  { title: 'Legenda', description: 'Selesaikan 25 target', icon: 'crown', category: 'goal', rarity: 'legendary', target: 25 },

  // Consistency Achievements
  { title: 'Minggu Pertama', description: 'Streak 7 hari', icon: 'flame', category: 'consistency', rarity: 'common', target: 7 },
  { title: 'Sebulan Penuh', description: 'Streak 30 hari', icon: 'fire', category: 'consistency', rarity: 'rare', target: 30 },
  { title: '100 Hari', description: 'Streak 100 hari', icon: 'zap', category: 'consistency', rarity: 'epic', target: 100 },
  { title: 'Setahun', description: 'Streak 365 hari', icon: 'sparkles', category: 'consistency', rarity: 'legendary', target: 365 },
  { title: 'Perfect Week', description: 'Capai target 7 hari berturut-turut', icon: 'calendar-check', category: 'consistency', rarity: 'rare', target: 7 },
  { title: 'Perfect Month', description: 'Capai target 30 hari berturut-turut', icon: 'calendar-range', category: 'consistency', rarity: 'epic', target: 30 },

  // Habit Achievements
  { title: 'Habit Builder', description: 'Habit Score mencapai 50', icon: 'gauge', category: 'habit', rarity: 'rare', target: 50 },
  { title: 'Habit Master', description: 'Habit Score mencapai 80', icon: 'gauge', category: 'habit', rarity: 'epic', target: 80 },
  { title: 'Habit Legend', description: 'Habit Score mencapai 100', icon: 'star', category: 'habit', rarity: 'legendary', target: 100 },

  // Milestone
  { title: 'Early Bird', description: 'Tambah dana sebelum jam 6 pagi', icon: 'sunrise', category: 'milestone', rarity: 'rare', target: 1 },
  { title: 'Night Owl', description: 'Tambah dana setelah jam 10 malam', icon: 'moon', category: 'milestone', rarity: 'rare', target: 1 },
  { title: 'Debt Free', description: 'Lunasi semua hutang', icon: 'check-circle-2', category: 'milestone', rarity: 'legendary', target: 1 },
  { title: 'Financial Freedom', description: 'Capai semua target finansial', icon: 'unlocked', category: 'milestone', rarity: 'mythic', target: 1 },
];

// Level Titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Dreamer',
  5: 'Planner',
  10: 'Builder',
  20: 'Achiever',
  35: 'Wealth Creator',
  50: 'Financial Master',
  75: 'Life Architect',
  100: 'Legend',
};

// XP Rewards
export const XP_REWARDS = {
  add_saving: 20,
  daily_target_reached: 50,
  streak_7: 100,
  streak_30: 300,
  streak_100: 1000,
  goal_completed: 500,
  monthly_review: 75,
  backup_data: 25,
  perfect_day: 30,
};

// Motivational Quotes
export const MOTIVATIONAL_QUOTES = [
  "Sedikit demi sedikit, lama-lama menjadi bukit.",
  "Hari ini lebih baik dari kemarin.",
  "Target besar dimulai dari langkah kecil.",
  "Konsistensi adalah kunci kesuksesan.",
  "Setiap langkah kecil membawa Anda lebih dekat ke impian.",
  "Jangan lihat seberapa jauh, lihat seberapa dekat.",
  "Kesabaran adalah kekuatan.",
  "Mulai hari ini, bukan besok.",
  "Impian tanpa aksi hanya mimpi.",
  "Setiap detik adalah kesempatan.",
  "Tabungan hari ini, kebebasan besok.",
  "Konsistensi mengalahkan intensitas.",
  "Waktu terbaik untuk mulai adalah sekarang.",
  "Perjalanan seribu mil dimulai dari satu langkah.",
  "Perseverance is the hard work you do after you get tired.",
  "Kesuksesan adalah hasil dari konsistensi.",
  "Setiap hari adalah halaman baru.",
  "Percaya pada proses.",
  "Lakukan yang terbaik hari ini.",
  "Kebiasaan kecil membentuk masa depan besar.",
  "Fokus pada progres, bukan kesempurnaan.",
  "Langkah kecil, dampak besar.",
  "Mulai dari mana Anda berada.",
  "Gunakan apa yang Anda miliki.",
  "Lakukan apa yang Anda bisa.",
  "Tomorrow belongs to those who prepare for it today.",
  "Kesepuluh ribu perjalanan dimulai dari satu langkah.",
  "Dream big, start small.",
  "Jalan setapak dilalui harus, sebelum menjadi jalan raya.",
  "Satu persatu, sampai ke tujuan.",
  "Dilarang menyerah sebelum berusaha.",
  "Sabar itu tidak sekedar menunggu, tapi menunggu dengan suasana hati yang tetap baik.",
  "Jangan tunda sampai besok apa yang bisa kamu lakukan hari ini.",
  "Orang sukses melakukan hal yang tidak disukai orang gagal.",
  "Disiplin adalah jembatan antara tujuan dan pencapaian.",
];

// Goal Colors by Category
export const GOAL_COLORS_BY_CATEGORY: Record<string, string> = {
  house: '#3B82F6',
  car: '#F59E0B',
  motorcycle: '#8B5CF6',
  vacation: '#06B6D4',
  emergency_fund: '#22C55E',
  business: '#F97316',
  education: '#A855F7',
  debt: '#EF4444',
  savings: '#10B981',
  dream: '#EC4899',
  monthly_target: '#6366F1',
  other: '#64748B',
};
