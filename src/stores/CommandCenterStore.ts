// Command Center Store - Global Command Palette State

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  category: 'navigation' | 'create' | 'edit' | 'report' | 'backup' | 'tools' | 'settings' | 'data' | 'smart';
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandCenterState {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  recentActions: string[];
  favoriteActions: string[];
  usageCount: Record<string, number>;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  moveSelectionUp: () => void;
  moveSelectionDown: (maxIndex: number) => void;
  addToRecent: (actionId: string) => void;
  clearRecent: () => void;
  toggleFavorite: (actionId: string) => void;
  isFavorite: (actionId: string) => boolean;
  getUsageCount: (actionId: string) => number;
}

export const useCommandCenterStore = create<CommandCenterState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      searchQuery: '',
      selectedIndex: 0,
      recentActions: [],
      favoriteActions: [],
      usageCount: {},

      open: () => set({ isOpen: true, searchQuery: '', selectedIndex: 0 }),

      close: () => set({ isOpen: false, searchQuery: '', selectedIndex: 0 }),

      toggle: () => {
        const { isOpen } = get();
        if (isOpen) {
          set({ isOpen: false, searchQuery: '', selectedIndex: 0 });
        } else {
          set({ isOpen: true, searchQuery: '', selectedIndex: 0 });
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query, selectedIndex: 0 }),

      setSelectedIndex: (index) => set({ selectedIndex: index }),

      moveSelectionUp: () => {
        const { selectedIndex } = get();
        set({ selectedIndex: Math.max(0, selectedIndex - 1) });
      },

      moveSelectionDown: (maxIndex) => {
        const { selectedIndex } = get();
        set({ selectedIndex: Math.min(maxIndex, selectedIndex + 1) });
      },

      addToRecent: (actionId) => {
        const { recentActions, usageCount } = get();
        const filtered = recentActions.filter((id) => id !== actionId);
        const newRecent = [actionId, ...filtered].slice(0, 10);
        set({
          recentActions: newRecent,
          usageCount: { ...usageCount, [actionId]: (usageCount[actionId] ?? 0) + 1 },
        });
      },

      clearRecent: () => set({ recentActions: [] }),

      toggleFavorite: (actionId) => {
        const { favoriteActions } = get();
        if (favoriteActions.includes(actionId)) {
          set({ favoriteActions: favoriteActions.filter((id) => id !== actionId) });
        } else {
          set({ favoriteActions: [...favoriteActions, actionId] });
        }
      },

      isFavorite: (actionId) => get().favoriteActions.includes(actionId),

      getUsageCount: (actionId) => get().usageCount[actionId] ?? 0,
    }),
    {
      name: 'lifeos-command-center',
      partialize: (state) => ({
        recentActions: state.recentActions,
        favoriteActions: state.favoriteActions,
        usageCount: state.usageCount,
      }),
    }
  )
);
