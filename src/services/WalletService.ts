// Wallet Service - Business Logic

import { walletRepository, transactionRepository } from '../repositories';
import { eventBus } from '../utils/EventBus';
import { Wallet, WalletType, Transaction } from '../types';

export class WalletService {
  // Create wallet
  async createWallet(data: {
    name: string;
    icon: string;
    color: string;
    type: WalletType;
    initialBalance?: number;
  }): Promise<Wallet> {
    const wallet = await walletRepository.create({
      ...data,
      balance: data.initialBalance || 0,
    });

    // If initial balance, create income transaction
    if (data.initialBalance && data.initialBalance > 0) {
      await transactionRepository.create({
        walletId: wallet.id,
        amount: data.initialBalance,
        type: 'income',
        date: new Date(),
        note: 'Saldo awal',
      });
    }

    eventBus.publish('wallet_created', { walletId: wallet.id, wallet });
    return wallet;
  }

  // Update wallet
  async updateWallet(id: string, updates: Partial<Wallet>): Promise<void> {
    await walletRepository.update(id, updates);
    eventBus.publish('wallet_updated', { walletId: id, updates });
  }

  // Delete wallet
  async deleteWallet(id: string): Promise<void> {
    // Check if wallet has transactions
    const transactions = await transactionRepository.getByWalletId(id);
    if (transactions.length > 0) {
      throw new Error('Cannot delete wallet with existing transactions');
    }
    await walletRepository.delete(id);
  }

  // Transfer between wallets
  async transfer(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    note?: string
  ): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
    // Create outgoing transaction
    const fromTransaction = await transactionRepository.create({
      walletId: fromWalletId,
      amount,
      type: 'transfer_out',
      date: new Date(),
      note: note || `Transfer to wallet`,
    });

    // Create incoming transaction
    const toTransaction = await transactionRepository.create({
      walletId: toWalletId,
      amount,
      type: 'transfer_in',
      date: new Date(),
      note: note || `Transfer from wallet`,
    });

    // Update wallet balances
    await walletRepository.updateBalance(fromWalletId, -amount);
    await walletRepository.updateBalance(toWalletId, amount);

    eventBus.publish('wallet_transfer', { fromWalletId, toWalletId, amount });

    return { fromTransaction, toTransaction };
  }

  // Add income
  async addIncome(
    walletId: string,
    amount: number,
    note?: string
  ): Promise<Transaction> {
    const transaction = await transactionRepository.create({
      walletId,
      amount,
      type: 'income',
      date: new Date(),
      note,
    });

    await walletRepository.updateBalance(walletId, amount);

    return transaction;
  }

  // Add expense
  async addExpense(
    walletId: string,
    amount: number,
    note?: string
  ): Promise<Transaction> {
    const transaction = await transactionRepository.create({
      walletId,
      amount,
      type: 'expense',
      date: new Date(),
      note,
    });

    await walletRepository.updateBalance(walletId, -amount);

    return transaction;
  }

  // Get wallet with statistics
  async getWalletWithStats(id: string): Promise<{
    wallet: Wallet;
    totalIn: number;
    totalOut: number;
    transactionCount: number;
    goalContributions: Map<string, number>;
  } | undefined> {
    const wallet = await walletRepository.getById(id);
    if (!wallet) return undefined;

    const transactions = await transactionRepository.getByWalletId(id);

    let totalIn = 0;
    let totalOut = 0;

    const goalContributions = new Map<string, number>();

    for (const tx of transactions) {
      if (['income', 'transfer_in'].includes(tx.type)) {
        totalIn += tx.amount;
      } else if (['expense', 'transfer_out'].includes(tx.type)) {
        totalOut += tx.amount;
      } else if (tx.goalId) {
        goalContributions.set(tx.goalId, (goalContributions.get(tx.goalId) || 0) + tx.amount);
      }
    }

    return {
      wallet,
      totalIn,
      totalOut,
      transactionCount: transactions.length,
      goalContributions,
    };
  }

  // Get total balance across all wallets
  async getTotalBalance(): Promise<number> {
    return await walletRepository.getTotalBalance();
  }

  // Get all wallets with balances
  async getAllWalletsWithBalances(): Promise<Wallet[]> {
    return await walletRepository.getAll();
  }

  // Get cash flow summary
  async getCashFlowSummary(): Promise<{
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    totalSaving: number;
    netCashFlow: number;
  }> {
    const wallets = await walletRepository.getAll();
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    const allTransactions = await transactionRepository.getAll();

    let totalIncome = 0;
    let totalExpense = 0;
    let totalSaving = 0;

    for (const tx of allTransactions) {
      switch (tx.type) {
        case 'income':
          totalIncome += tx.amount;
          break;
        case 'expense':
          totalExpense += tx.amount;
          break;
        case 'transfer_out':
        case 'transfer_in':
          // Transfers don't count as income/expense
          break;
        default:
          // Savings transactions
          totalSaving += tx.amount;
      }
    }

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      totalSaving,
      netCashFlow: totalIncome - totalExpense,
    };
  }
}

export const walletService = new WalletService();
