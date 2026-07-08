// Stat Card Components - Design System

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card } from '../ui/Card';

// ============================================
// STAT CARD
// ============================================
export interface StatCardProps {
  icon: React.ElementType;
  iconClassName?: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  trend,
  subtitle,
  gradient,
  className,
  onClick,
}: StatCardProps) {
  const trendColors = {
    up: 'text-success-500',
    down: 'text-danger-500',
    neutral: 'text-muted-foreground',
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      <Card
        variant="default"
        padding="md"
        radius="xl"
        isHoverable={!!onClick}
        className={cn('relative overflow-hidden', className)}
      >
        {gradient && (
          <div
            className={cn('absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16', gradient)}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              gradient || 'bg-primary-500/20 text-primary-400'
            )}>
              <Icon className={cn('w-5 h-5', iconClassName)} />
            </div>

            {trend && (
              <div className={cn('flex items-center gap-1 text-xs', trendColors[trend.direction])}>
                <TrendIcon className="w-3 h-3" />
                <span>{trend.value}</span>
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================
// QUICK STAT (Mini Stat card)
// ============================================
export interface QuickStatProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: string;
  className?: string;
}

export function QuickStat({ label, value, icon: Icon, color, className }: QuickStatProps) {
  return (
    <div className={cn('bg-white/5 rounded-xl p-3', className)}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className={cn('w-4 h-4', color || 'text-muted-foreground')} />}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn('text-lg font-bold', color || 'text-primary')}>{value}</p>
    </div>
  );
}

// ============================================
// STATS GRID
// ============================================
export interface StatsGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  } as const;

  return (
    <div className={cn('grid gap-4', colClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
