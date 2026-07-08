// App Store - Global Application State

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, User } from '../types';
import { userRepository, settingsRepository } from '../repositories/OtherRepositories';
import { initializeDatabase } from '../database';

interface AppState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  user: User | null;
  settings: Settings | null;
  sidebarOpen: boolean;
  currentPage: string;

  // Actions
  initialize: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      initialized: false,
      loading: false,
      error: null,
      user: null,
      settings: null,
      sidebarOpen: true,
      currentPage: 'dashboard',

      initialize: async () => {
        if (get().initialized) return;

        set({ loading: true, error: null });
        try {
          // Initialize database with default data
          await initializeDatabase();

          // Load user and settings
          const user = await userRepository.getCurrentUser();
          const settings = await settingsRepository.get();

          set({
            initialized: true,
            user: user || null,
            settings: settings || null,
            loading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      updateUser: async (updates) => {
        const { user } = get();
        if (user) {
          await userRepository.update(user.id, updates);
          set({ user: { ...user, ...updates } });
        }
      },

      updateSettings: async (updates) => {
        const { settings } = get();
        if (settings) {
          await settingsRepository.update(settings.id, updates);
          set({ settings: { ...settings, ...updates } });
        }
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
      },
    }),
    {
      name: 'lifeos-app-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentPage: state.currentPage,
      }),
    }
  )
);
