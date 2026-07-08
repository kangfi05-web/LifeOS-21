// Transaction Repository

import { db, generateId } from '../database';
import { Transaction, TransactionType } from '../types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export class TransactionRepository {
  // Create
  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date(),
    };

    await db.transactions.add(newTransaction);
    return newTransaction;
  }

  // Read
  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  }

  async getAll(): Promise<Transaction[]> {
    return await db.transactions.orderBy('date').reverse().toArray();
  }

  async getByGoalId(goalId: string): Promise<Transaction[]> {
    return await db.transactions.where('goalId').equals(goalId).reverse().toArray();
  }

  async getByGoalIdAndDateRange(goalId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    const all = await this.getByGoalId(goalId);
    return all.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }

  async getByWalletId(walletId: string): Promise<Transaction[]> {
    return await db.transactions.where('walletId').equals(walletId).reverse().toArray();
  }

  async getByDate(date: Date): Promise<Transaction[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return await db.transactions
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    return await db.transactions
      .where('date')
      .between(start, end)
      .toArray();
  }

  async getByWeek(date: Date): Promise<Transaction[]> {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return await this.getByDateRange(start, end);
  }

  async getByMonth(date: Date): Promise<Transaction[]> {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return await this.getByDateRange(start, end);
  }

  async getByType(type: TransactionType): Promise<Transaction[]> {
    return await db.transactions.where('type').equals(type).toArray();
  }

  async getByGoalAndDate(goalId: string, date: Date): Promise<Transaction[]> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return await db.transactions
      .where('[goalId+date]')
      .between([goalId, start], [goalId, end])
      .toArray();
  }

  // Calculate totals
  async getTotalByGoalId(goalId: string): Promise<number> {
    const transactions = await this.getByGoalId(goalId);
    return transactions
      .filter(t =>
        t.type === 'daily' ||
        t.type === 'quick_add' ||
        t.type === 'manual' ||
        t.type === 'adjustment'
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  async getTotalByWalletId(walletId: string): Promise<number> {
    const transactions = await this.getByWalletId(walletId);
    return transactions.reduce((sum, t) => {
      if (t.type === 'income' || t.type === 'transfer_in') return sum + t.amount;
      if (t.type === 'expense' || t.type === 'transfer_out') return sum - t.amount;
      return sum + t.amount; // savings contributions
    }, 0);
  }

  async getTotalByDate(date: Date): Promise<number> {
    const transactions = await this.getByDate(date);
    return transactions
      .filter(t =>
        t.type === 'daily' ||
        t.type === 'quick_add' ||
        t.type === 'manual' ||
        t.type === 'adjustment'
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  async getTotalByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const transactions = await this.getByDateRange(startDate, endDate);
    return transactions
      .filter(t =>
        t.type === 'daily' ||
        t.type === 'quick_add' ||
        t.type === 'manual' ||
        t.type === 'adjustment'
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  async getDailyTotalByGoal(goalId: string, date: Date): Promise<number> {
    const transactions = await this.getByGoalAndDate(goalId, date);
    return transactions
      .filter(t =>
        t.type === 'daily' ||
        t.type === 'quick_add' ||
        t.type === 'manual' ||
        t.type === 'adjustment'
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Update
  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    await db.transactions.update(id, updates);
  }

  // Delete
  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  }

  async deleteByGoalId(goalId: string): Promise<void> {
    await db.transactions.where('goalId').equals(goalId).delete();
  }

  // Stats
  async count(): Promise<number> {
    return await db.transactions.count();
  }

  async countByType(type: TransactionType): Promise<number> {
    return await db.transactions.where('type').equals(type).count();
  }

  async getRecent(limit: number = 10): Promise<Transaction[]> {
    return await db.transactions.orderBy('date').reverse().limit(limit).toArray();
  }

  async getTransactionsByDateGrouped(date: Date): Promise<Map<string, Transaction[]>> {
    const transactions = await this.getByDate(date);
    const grouped = new Map<string, Transaction[]>();

    for (const tx of transactions) {
      if (tx.goalId) {
        const existing = grouped.get(tx.goalId) || [];
        existing.push(tx);
        grouped.set(tx.goalId, existing);
      }
    }

    return grouped;
  }
}

export const transactionRepository = new TransactionRepository();
