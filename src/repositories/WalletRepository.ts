// Wallet Repository

import { db, generateId } from '../database';
import { Wallet, WalletType } from '../types';

export class WalletRepository {
  // Create
  async create(wallet: Omit<Wallet, 'id' | 'createdAt'>): Promise<Wallet> {
    const newWallet: Wallet = {
      ...wallet,
      id: generateId(),
      createdAt: new Date(),
    };

    await db.wallets.add(newWallet);
    return newWallet;
  }

  // Read
  async getById(id: string): Promise<Wallet | undefined> {
    return await db.wallets.get(id);
  }

  async getAll(): Promise<Wallet[]> {
    return await db.wallets.orderBy('createdAt').toArray();
  }

  async getByName(name: string): Promise<Wallet | undefined> {
    return await db.wallets.where('name').equals(name).first();
  }

  async getByType(type: WalletType): Promise<Wallet[]> {
    return await db.wallets.where('type').equals(type).toArray();
  }

  // Update
  async update(id: string, updates: Partial<Wallet>): Promise<void> {
    await db.wallets.update(id, updates);
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    const wallet = await this.getById(id);
    if (wallet) {
      await this.update(id, { balance: wallet.balance + amount });
    }
  }

  // Delete
  async delete(id: string): Promise<void> {
    await db.wallets.delete(id);
  }

  // Stats
  async count(): Promise<number> {
    return await db.wallets.count();
  }

  async getTotalBalance(): Promise<number> {
    const wallets = await this.getAll();
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }

  async getWalletContribution(goalId: string): Promise<Map<string, number>> {
    const transactions = await db.transactions.where('goalId').equals(goalId).toArray();
    const contribution = new Map<string, number>();

    for (const tx of transactions) {
      const currentAmount = contribution.get(tx.walletId) || 0;
      contribution.set(tx.walletId, currentAmount + tx.amount);
    }

    return contribution;
  }
}

export const walletRepository = new WalletRepository();
