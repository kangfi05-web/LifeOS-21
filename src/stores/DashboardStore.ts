// Dashboard Store - Zustand State Management

import { create } from 'zustand';
import { goalService, aiCoachService } from '../services';
import { eventBus } from '../utils/EventBus';
import { Goal } from '../types';

interface DailySummary {
  todayCollected: number;
  todayTarget: number;
  difference: number;
  status: 'ahead' | 'on_track' | 'behind' | 'missed';
}

interface DashboardSummary {
  activeGoals: number;
  completedGoals: number;
  totalTarget: number;
  totalCollected: number;
  todayTarget: number;
  todayCollected: number;
  overallProgress: number;
}

interface CoachInsight {
  type: string;
  title: string;
  message: string;
  actionable?: boolean;
  actionLabel?: string;
  actionData?: Record<string, unknown>;
  priority: string;
}

interface DashboardState {
  summary: DashboardSummary | null;
  dailySummary: DailySummary | null;
  priorityGoals: Goal[];
  coachInsight: CoachInsight | null;
  motivationQuote: string;
  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchDailySummary: () => Promise<void>;
  fetchPriorityGoals: () => Promise<void>;
  fetchCoachInsight: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  dailySummary: null,
  priorityGoals: [],
  coachInsight: null,
  motivationQuote: '',
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await goalService.getDashboardSummary();
      set({ summary, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDailySummary: async () => {
    try {
      const analysis = await aiCoachService.getDailyAnalysis();
      set({
        dailySummary: {
          todayCollected: analysis.todayCollected,
          todayTarget: analysis.todayTarget,
          difference: analysis.difference,
          status: analysis.status,
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchPriorityGoals: async () => {
    try {
      const priorityGoals = await goalService.getActiveGoalsWithPriorities();
      set({ priorityGoals });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchCoachInsight: async () => {
    try {
      const insight = await aiCoachService.getDailyInsight();
      set({ coachInsight: insight });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  refreshAll: async () => {
    set({ loading: true });
    try {
      const [summary, dailySummary, priorityGoals, coachInsight] = await Promise.all([
        goalService.getDashboardSummary(),
        aiCoachService.getDailyAnalysis(),
        goalService.getActiveGoalsWithPriorities(),
        aiCoachService.getDailyInsight(),
      ]);

      set({
        summary,
        dailySummary: {
          todayCollected: dailySummary.todayCollected,
          todayTarget: dailySummary.todayTarget,
          difference: dailySummary.difference,
          status: dailySummary.status,
        },
        priorityGoals,
        coachInsight,
        motivationQuote: aiCoachService.getMotivationMessage(),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

// Subscribe to events to refresh dashboard
eventBus.subscribe('saving_added', async () => {
  await useDashboardStore.getState().refreshAll();
});

eventBus.subscribe('goal_created', async () => {
  await useDashboardStore.getState().refreshAll();
});

eventBus.subscribe('goal_completed', async () => {
  await useDashboardStore.getState().refreshAll();
});
