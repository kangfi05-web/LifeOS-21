// Achievement Store - Zustand State Management

import { create } from 'zustand';
import { Achievement } from '../types';
import { achievementService } from '../services';
import { eventBus } from '../utils/EventBus';

interface PlayerProfile {
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

interface AchievementState {
  achievements: Achievement[];
  recentUnlocked: Achievement[];
  playerProfile: PlayerProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchRecentUnlocked: () => Promise<void>;
  fetchPlayerProfile: () => Promise<void>;
  checkAchievements: () => Promise<Achievement[]>;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  recentUnlocked: [],
  playerProfile: null,
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      await achievementService.initializeProfile();
      const profile = achievementService.getPlayerProfile();
      const achievements = await achievementService.getAllAchievementsWithProgress();
      const recentUnlocked = await achievementService.getRecentUnlockedAchievements(5);

      set({
        playerProfile: profile,
        achievements,
        recentUnlocked,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAchievements: async () => {
    try {
      const achievements = await achievementService.getAllAchievementsWithProgress();
      set({ achievements });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchRecentUnlocked: async () => {
    try {
      const recentUnlocked = await achievementService.getRecentUnlockedAchievements(5);
      set({ recentUnlocked });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchPlayerProfile: async () => {
    try {
      const profile = achievementService.getPlayerProfile();
      set({ playerProfile: profile });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  checkAchievements: async () => {
    try {
      const newlyUnlocked = await achievementService.checkAllAchievements();
      if (newlyUnlocked.length > 0) {
        const profile = achievementService.getPlayerProfile();
        set((state) => ({
          playerProfile: profile,
          recentUnlocked: [...newlyUnlocked, ...state.recentUnlocked].slice(0, 5),
        }));
      }
      return newlyUnlocked;
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    }
  },
}));

// Subscribe to achievement events
eventBus.subscribe('achievement_unlocked', async () => {
  await useAchievementStore.getState().fetchRecentUnlocked();
});

eventBus.subscribe('level_up', async () => {
  await useAchievementStore.getState().fetchPlayerProfile();
});
