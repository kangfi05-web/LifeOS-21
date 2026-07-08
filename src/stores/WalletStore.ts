// Wallet Store - Zustand State Management

import { create } from 'zustand';
import { Wallet, Transaction } from '../types';
import { walletService } from '../services';
import { transactionRepository } from '../repositories';
import { eventBus } from '../utils/EventBus';

interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  transactions: Transaction[];
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchWallets: () => Promise<void>;
  createWallet: (data: { name: string; icon: string; color: string; type: Wallet['type']; initialBalance?: number }) => Promise<Wallet>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  selectWallet: (wallet: Wallet | null) => void;
  transfer: (fromId: string, toId: string, amount: number, note?: string) => Promise<void>;
  fetchRecentTransactions: (limit?: number) => Promise<void>;
  fetchTransactionsByWallet: (walletId: string) => Promise<void>;
  getTotalBalance: () => Promise<number>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  selectedWallet: null,
  transactions: [],
  recentTransactions: [],
  loading: false,
  error: null,

  fetchWallets: async () => {
    set({ loading: true, error: null });
    try {
      const wallets = await walletService.getAllWalletsWithBalances();
      set({ wallets, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createWallet: async (data) => {
    set({ loading: true, error: null });
    try {
      const wallet = await walletService.createWallet(data);
      set((state) => ({
        wallets: [...state.wallets, wallet],
        loading: false,
      }));
      return wallet;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateWallet: async (id, updates) => {
    try {
      await walletService.updateWallet(id, updates);
      set((state) => ({
        wallets: state.wallets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        selectedWallet: state.selectedWallet?.id === id ? { ...state.selectedWallet, ...updates } : state.selectedWallet,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteWallet: async (id) => {
    try {
      await walletService.deleteWallet(id);
      set((state) => ({
        wallets: state.wallets.filter((w) => w.id !== id),
        selectedWallet: state.selectedWallet?.id === id ? null : state.selectedWallet,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  selectWallet: (wallet) => {
    set({ selectedWallet: wallet });
  },

  transfer: async (fromId, toId, amount, note) => {
    set({ loading: true, error: null });
    try {
      await walletService.transfer(fromId, toId, amount, note);
      await get().fetchWallets();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchRecentTransactions: async (limit = 10) => {
    try {
      const recentTransactions = await transactionRepository.getRecent(limit);
      set({ recentTransactions });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  fetchTransactionsByWallet: async (walletId) => {
    try {
      const transactions = await transactionRepository.getByWalletId(walletId);
      set({ transactions });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getTotalBalance: async () => {
    return await walletService.getTotalBalance();
  },
}));

// Subscribe to wallet events
eventBus.subscribe('wallet_created', async () => {
  await useWalletStore.getState().fetchWallets();
});

eventBus.subscribe('wallet_updated', async () => {
  await useWalletStore.getState().fetchWallets();
});
