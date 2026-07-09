// Komponen visual status cicilan bulanan — dipakai di GoalCard & Dashboard.
// Menampilkan titik per bulan (lunas/berjalan/telat/akan datang) + ringkasan teks.

import { Check, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import { calculateInstallmentInfo, InstallmentMonthStatus } from '../utils/calculations';
import type { Goal } from '../types';

interface InstallmentStatusBarProps {
  goal: Pick<Goal, 'startDate' | 'deadline' | 'targetAmount' | 'remainingAmount' | 'installmentMonths'>;
  compact?: boolean;
}

const STATUS_STYLE: Record<InstallmentMonthStatus, string> = {
  paid: 'bg-success text-white',
  current: 'bg-primary-500 text-white ring-2 ring-primary-500/40 ring-offset-2 ring-offset-surface',
  overdue: 'bg-danger text-white',
  upcoming: 'bg-white/10 text-base-400',
};

export function InstallmentStatusBar({ goal, compact = false }: InstallmentStatusBarProps) {
  if (!goal.installmentMonths) return null;

  const info = calculateInstallmentInfo(
    goal.startDate,
    goal.deadline,
    goal.targetAmount,
    goal.remainingAmount,
    goal.installmentMonths
  );

  const hasOverdue = info.monthsBreakdown.some((m) => m.status === 'overdue');

  return (
    <div className="space-y-2">
      {/* Titik per bulan */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {info.monthsBreakdown.map((m) => (
          <div
            key={m.month}
            title={`Bulan ke-${m.month}: ${
              m.status === 'paid'
                ? 'Lunas'
                : m.status === 'current'
                  ? 'Berjalan'
                  : m.status === 'overdue'
                    ? 'Belum lunas (terlewat)'
                    : 'Belum jatuh tempo'
            }`}
            className={cn(
              'flex items-center justify-center rounded-full font-medium transition-colors',
              compact ? 'w-5 h-5 text-[0.6rem]' : 'w-7 h-7 text-xs',
              STATUS_STYLE[m.status]
            )}
          >
            {m.status === 'paid' ? (
              <Check className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            ) : m.status === 'overdue' ? (
              <AlertTriangle className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            ) : (
              m.month
            )}
          </div>
        ))}
      </div>

      {/* Ringkasan teks */}
      <p className={cn('text-base-400', compact ? 'text-xs' : 'text-sm')}>
        Lunas <span className="text-success font-medium">{info.monthsPaid}</span> dari{' '}
        {info.totalMonths} bulan
        {info.monthsRemaining > 0 && (
          <>
            {' '}
            • tersisa <span className="font-medium text-white">{info.monthsRemaining}</span> bulan lagi
          </>
        )}
        {hasOverdue && (
          <span className="text-danger font-medium"> • ada tunggakan, sedang dikejar</span>
        )}
      </p>
    </div>
  );
}

// Versi ringkas satu baris untuk Dashboard (tanpa dots, cuma teks + ikon status)
export function InstallmentStatusLine({
  goal,
}: {
  goal: Pick<Goal, 'startDate' | 'deadline' | 'targetAmount' | 'remainingAmount' | 'installmentMonths'>;
}) {
  if (!goal.installmentMonths) return null;

  const info = calculateInstallmentInfo(
    goal.startDate,
    goal.deadline,
    goal.targetAmount,
    goal.remainingAmount,
    goal.installmentMonths
  );

  const hasOverdue = info.monthsBreakdown.some((m) => m.status === 'overdue');

  return (
    <div className="flex items-center gap-1.5 text-xs text-base-400">
      {hasOverdue ? (
        <AlertTriangle className="w-3.5 h-3.5 text-danger flex-shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
      )}
      <span>
        Bulan ke-{info.currentMonth}/{info.totalMonths} • Lunas {info.monthsPaid} bulan • Tersisa{' '}
        {info.monthsRemaining} bulan
      </span>
    </div>
  );
}
