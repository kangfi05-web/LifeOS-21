// Wallet Card Component - Design System

import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card } from '../ui/Card';
import type { Wallet as WalletType } from '../../types';
import { formatCurrency } from '../../utils/calculations';

// ============================================
// WALLET CARD
// ============================================
export interface WalletCardProps {
  wallet: WalletType;
  variant?: 'default' | 'compact' | 'detailed';
  onClick?: () => void;
  className?: string;
}

export function WalletCard({
  wallet,
  variant = 'default',
  onClick,
  className,
}: WalletCardProps) {
  if (variant === 'compact') {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={onClick ? { scale: 0.98 } : undefined}>
        <Card
          variant="default"
          padding="sm"
          radius="lg"
          isHoverable={!!onClick}
          onClick={onClick}
          className={cn('cursor-pointer', className)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${wallet.color}20` }}
            >
              <Wallet className="w-4 h-4" style={{ color: wallet.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{wallet.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(wallet.balance)}</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={onClick ? { scale: 0.99 } : undefined}>
      <Card
        variant="default"
        padding="none"
        radius="xl"
        isHoverable={!!onClick}
        onClick={onClick}
        className={cn('cursor-pointer overflow-hidden', className)}
      >
        {/* Color Bar */}
        <div className="h-1" style={{ backgroundColor: wallet.color }} />

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${wallet.color}20` }}
            >
              <Wallet className="w-6 h-6" style={{ color: wallet.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{wallet.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
            </div>
            {onClick && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </div>

          {/* Balance */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className="text-2xl font-bold" style={{ color: wallet.color }}>
              {formatCurrency(wallet.balance)}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-success-500">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Rp0</span>
            </div>
            <div className="flex items-center gap-1 text-danger-500">
              <ArrowUpRight className="w-4 h-4" />
              <span>Rp0</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================
// WALLET SELECTOR
// ============================================
export interface WalletSelectorProps {
  wallets: WalletType[];
  selectedId?: string;
  onSelect: (walletId: string) => void;
  className?: string;
}

export function WalletSelector({ wallets, selectedId, onSelect, className }: WalletSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {wallets.map((wallet) => (
        <motion.button
          key={wallet.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(wallet.id)}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
            selectedId === wallet.id
              ? 'border-primary-500/50 bg-primary-500/10'
              : 'border-border hover:border-border-hover'
          )}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${wallet.color}20` }}
          >
            <Wallet className="w-4 h-4" style={{ color: wallet.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{wallet.name}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(wallet.balance)}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ============================================
// TOTAL BALANCE CARD
// ============================================
export interface TotalBalanceCardProps {
  wallets: WalletType[];
  income?: number;
  expense?: number;
  className?: string;
}

export function TotalBalanceCard({ wallets, income = 0, expense = 0, className }: TotalBalanceCardProps) {
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <Card variant="gradient" padding="lg" radius="2xl" className={className}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
          <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-success-500">
          <ArrowDownLeft className="w-4 h-4" />
          <span className="text-sm">Income: {formatCurrency(income)}</span>
        </div>
        <div className="flex items-center gap-2 text-danger-500">
          <ArrowUpRight className="w-4 h-4" />
          <span className="text-sm">Expense: {formatCurrency(expense)}</span>
        </div>
      </div>
    </Card>
  );
}
