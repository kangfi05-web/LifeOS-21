// Goal Card Component - Design System

import { motion } from 'framer-motion';
import { Clock, MoreVertical, Edit, Pause, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { Card } from '../ui/Card';
import { Badge, PriorityBadge, StatusBadge } from '../ui/Badge';
import { CircularProgress } from '../ui/Progress';
import { Button } from '../ui/Button';
import type { Goal } from '../../types';
import { formatCurrency, getDaysRemaining } from '../../utils/calculations';
import { GOAL_CATEGORIES } from '../../constants';
import { InstallmentStatusBar } from '../InstallmentStatusBar';

// ============================================
// GOAL CARD
// ============================================
export interface GoalCardProps {
  goal: Goal;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPause?: () => void;
  onClick?: () => void;
  className?: string;
}

export function GoalCard({
  goal,
  variant = 'default',
  showActions = true,
  onAdd,
  onEdit,
  onDelete,
  onPause,
  onClick,
  className,
}: GoalCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const daysRemaining = getDaysRemaining(goal.deadline);
  const category = GOAL_CATEGORIES[goal.category] || GOAL_CATEGORIES.other;

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        onClick={onClick}
        className={cn(onClick && 'cursor-pointer')}
      >
        <Card variant="default" padding="sm" radius="xl" isHoverable className={className}>
          <div className="flex items-center gap-3">
            <CircularProgress
              value={goal.progress}
              size="sm"
              variant="gradient"
              animated={false}
              showValue={false}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{goal.title}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(goal.progress)}% • {daysRemaining} hari
              </p>
            </div>
            <p className="text-sm font-medium truncate">
              {formatCurrency(goal.targetAmount - goal.remainingAmount)}
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      <Card variant="default" padding="none" radius="2xl" isHoverable className={cn('group', className)}>
        {/* Cover/Image Section */}
        <div
          className="relative h-32 bg-gradient-to-br from-primary-500/30 to-accent/20"
          style={{
            backgroundImage: goal.coverImage ? `url(${goal.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <PriorityBadge priority={goal.priority} size="sm" />
          </div>

          {/* Menu */}
          {showActions && (
            <div className="absolute top-3 left-3">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="bg-black/30 backdrop-blur-sm"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute left-0 mt-1 bg-surface border border-border rounded-xl p-1 min-w-[120px] z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    )}
                    {onPause && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onPause();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-muted-foreground"
                      >
                        <Pause className="w-4 h-4" /> Pause
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-danger-500"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 -mt-8 relative">
          {/* Category Badge */}
          <div className="mb-3">
            <Badge variant="outline" size="sm">
              {category.label}
            </Badge>
          </div>

          {/* Title & Info */}
          <h3 className="font-semibold text-lg group-hover:text-primary-400 transition-colors mb-3">
            {goal.title}
          </h3>

          {/* Progress Section */}
          <div className="flex items-center gap-4 mb-4">
            <CircularProgress
              value={goal.progress}
              size="md"
              variant="gradient"
              showValue={false}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-success-400 font-medium">
                  {formatCurrency(goal.targetAmount - goal.remainingAmount)}
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(goal.targetAmount)}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-success-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Target Harian</p>
              <p className="font-medium text-sm">{formatCurrency(goal.dailyTarget)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Sisa Hari</p>
              </div>
              <p className={cn(
                'font-medium text-sm',
                daysRemaining <= 7 ? 'text-danger-500' :
                  daysRemaining <= 30 ? 'text-warning-500' : ''
              )}>
                {daysRemaining} hari
              </p>
            </div>
          </div>

          {/* Status Cicilan Bulanan (kalau goal ini pakai mode cicilan) */}
          {goal.installmentMonths ? (
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <InstallmentStatusBar goal={goal} compact />
            </div>
          ) : null}

          {/* Add Button */}
          {onAdd && (
            <Button
              variant="outline"
              isFullWidth
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              Tambah Dana
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================
// GOAL LIST ITEM
// ============================================
export interface GoalListItemProps {
  goal: Goal;
  onAdd?: () => void;
  onClick?: () => void;
  className?: string;
}

export function GoalListItem({ goal, onAdd, onClick, className }: GoalListItemProps) {
  const daysRemaining = getDaysRemaining(goal.deadline);

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      <Card variant="default" padding="md" radius="xl" isHoverable className={className}>
        <div className="flex items-center gap-4">
          <CircularProgress
            value={goal.progress}
            size="sm"
            variant="gradient"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={goal.status} size="sm" />
            </div>
            <h3 className="font-semibold truncate">{goal.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>
                {formatCurrency(goal.targetAmount - goal.remainingAmount)} / {formatCurrency(goal.targetAmount)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {daysRemaining} hari
              </span>
            </div>
          </div>

          {onAdd && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              Tambah
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
