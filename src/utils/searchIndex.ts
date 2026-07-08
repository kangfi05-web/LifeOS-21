// Universal Search Data Index
// Mengambil data langsung dari Repository Layer (Dexie sebagai single source of truth),
// BUKAN dari Zustand store, supaya hasil pencarian selalu lengkap & konsisten dengan database.

import {
  goalRepository,
  walletRepository,
  transactionRepository,
  achievementRepository,
  lifeJourneyRepository,
} from '../repositories';
import { GOAL_CATEGORIES } from '../constants';
import { formatCurrency } from './calculations';

export type SearchEntityType = 'goal' | 'wallet' | 'transaction' | 'achievement' | 'journey';

export interface SearchDataItem {
  id: string;
  entityType: SearchEntityType;
  title: string;
  subtitle?: string;
  keywords: string[];
  page: string; // halaman tujuan saat item ini dipilih
}

const RECENT_TRANSACTION_LIMIT = 40;
const RECENT_JOURNEY_LIMIT = 40;

// Index di-cache sebentar (5 detik) supaya buka Command Center berkali-kali dalam
// waktu singkat tidak query Dexie berulang-ulang, sambil tetap terasa "live".
let cachedIndex: SearchDataItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5000;

export function invalidateSearchIndexCache(): void {
  cachedIndex = null;
}

export async function buildSearchIndex(forceRefresh = false): Promise<SearchDataItem[]> {
  const now = Date.now();
  if (!forceRefresh && cachedIndex && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedIndex;
  }

  const [goals, wallets, transactions, achievements, journeys] = await Promise.all([
    goalRepository.getAll(),
    walletRepository.getAll(),
    transactionRepository.getRecent(RECENT_TRANSACTION_LIMIT),
    achievementRepository.getAll(),
    lifeJourneyRepository.getAll(),
  ]);

  const items: SearchDataItem[] = [];

  for (const goal of goals) {
    items.push({
      id: `goal-${goal.id}`,
      entityType: 'goal',
      title: goal.title,
      subtitle: `${GOAL_CATEGORIES[goal.category]?.label ?? goal.category} • ${Math.round(goal.progress)}% selesai`,
      keywords: [goal.title, goal.category, goal.description ?? '', goal.status],
      page: 'goals',
    });
  }

  for (const wallet of wallets) {
    items.push({
      id: `wallet-${wallet.id}`,
      entityType: 'wallet',
      title: wallet.name,
      subtitle: `Saldo ${formatCurrency(wallet.balance)}`,
      keywords: [wallet.name, wallet.type],
      page: 'wallet',
    });
  }

  for (const trx of transactions) {
    const goal = trx.goalId ? goals.find((g) => g.id === trx.goalId) : undefined;
    items.push({
      id: `trx-${trx.id}`,
      entityType: 'transaction',
      title: `${formatCurrency(trx.amount)}${goal ? ` → ${goal.title}` : ''}`,
      subtitle: trx.note || new Date(trx.date).toLocaleDateString('id-ID'),
      keywords: [trx.note ?? '', goal?.title ?? '', trx.type],
      page: 'wallet',
    });
  }

  for (const achievement of achievements) {
    items.push({
      id: `achievement-${achievement.id}`,
      entityType: 'achievement',
      title: achievement.title,
      subtitle: achievement.completed
        ? 'Selesai'
        : `Progress ${Math.round((achievement.progress / achievement.target) * 100)}%`,
      keywords: [achievement.title, achievement.description, achievement.category],
      page: 'achievements',
    });
  }

  const recentJourneys = [...journeys]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, RECENT_JOURNEY_LIMIT);

  for (const journey of recentJourneys) {
    items.push({
      id: `journey-${journey.id}`,
      entityType: 'journey',
      title: journey.title,
      subtitle: new Date(journey.date).toLocaleDateString('id-ID'),
      keywords: [journey.title, journey.description ?? '', journey.category],
      page: 'journey',
    });
  }

  cachedIndex = items;
  cacheTimestamp = now;
  return items;
}
