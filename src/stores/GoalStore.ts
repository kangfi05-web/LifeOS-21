// Goal Store - Zustand State Management

import { create } from 'zustand';
import { Goal, GoalPriority, GoalCategory } from '../types';
import { goalService } from '../services';
import { eventBus } from '../utils/EventBus';

interface GoalState {
  goals: Goal[];
  activeGoals: Goal[];
  selectedGoal: Goal | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchGoals: () => Promise<void>;
  fetchActiveGoals: () => Promise<void>;
  createGoal: (data: {
    title: string;
    description?: string;
    category: GoalCategory;
    priority: GoalPriority;
    targetAmount: number;
    startDate: Date;
    deadline: Date;
    coverImage?: string;
    icon?: string;
    color?: string;
    notes?: string;
    walletId?: string;
    installmentMonths?: number;
  }) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  restoreGoal: (id: string) => Promise<void>;
  pauseGoal: (id: string) => Promise<void>;
  resumeGoal: (id: string) => Promise<void>;
  selectGoal: (goal: Goal | null) => void;
  getGoalById: (id: string) => Promise<Goal | undefined>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  activeGoals: [],
  selectedGoal: null,
  loading: false,
  error: null,

  fetchGoals: async () => {
    set({ loading: true, error: null });
    try {
      const goals = await goalService.getActiveGoalsWithPriorities();
      set({ goals, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchActiveGoals: async () => {
    set({ loading: true, error: null });
    try {
      const activeGoals = await goalService.getActiveGoalsWithPriorities();
      set({ activeGoals, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createGoal: async (data) => {
    set({ loading: true, error: null });
    try {
      const goal = await goalService.createGoal(data);
      set((state) => ({
        goals: [...state.goals, goal],
        activeGoals: [...state.activeGoals, goal],
        loading: false,
      }));
      return goal;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateGoal: async (id, updates) => {
    try {
      await goalService.updateGoal(id, updates);
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        activeGoals: state.activeGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        selectedGoal: state.selectedGoal?.id === id ? { ...state.selectedGoal, ...updates } : state.selectedGoal,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteGoal: async (id) => {
    try {
      await goalService.deleteGoal(id);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        activeGoals: state.activeGoals.filter((g) => g.id !== id),
        selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  restoreGoal: async (id) => {
    try {
      const goal = await goalService.restoreGoal(id);
      if (goal) {
        set((state) => ({
          goals: [...state.goals, goal],
          activeGoals: goal.status === 'active' ? [...state.activeGoals, goal] : state.activeGoals,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  pauseGoal: async (id) => {
    try {
      await goalService.pauseGoal(id);
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, status: 'paused' as const } : g)),
        activeGoals: state.activeGoals.filter((g) => g.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  resumeGoal: async (id) => {
    try {
      await goalService.resumeGoal(id);
      const goal = await goalService.getActiveGoalsWithPriorities();
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, status: 'active' as const } : g)),
        activeGoals: goal,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  selectGoal: (goal) => {
    set({ selectedGoal: goal });
  },

  getGoalById: async (id) => {
    return get().goals.find((g) => g.id === id);
  },
}));

// Subscribe to goal events
eventBus.subscribe('goal_created', async () => {
  await useGoalStore.getState().fetchActiveGoals();
});

eventBus.subscribe('goal_updated', async () => {
  await useGoalStore.getState().fetchActiveGoals();
});

eventBus.subscribe('goal_completed', async () => {
  await useGoalStore.getState().fetchActiveGoals();
});

eventBus.subscribe('goal_deleted', async () => {
  await useGoalStore.getState().fetchActiveGoals();
});

eventBus.subscribe('saving_added', async () => {
  await useGoalStore.getState().fetchActiveGoals();
});
