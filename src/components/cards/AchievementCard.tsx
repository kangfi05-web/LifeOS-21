// Achievement Card Component - Design System

import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle, Star, Gift } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Achievement } from '../../types';
import { formatDate } from '../../utils/calculations';

// Rarity configurations
const RARITY_CONFIG = {
  common: {
    gradient: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    icon: Trophy,
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: Trophy,
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: Star,
  },
  legendary: {
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: Star,
  },
  mythic: {
    gradient: 'from-pink-400 to-rose-600',
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    icon: Gift,
  },
};

// ============================================
// ACHIEVEMENT CARD
// ============================================
export interface AchievementCardProps {
  achievement: Achievement;
  variant?: 'default' | 'compact' | 'detailed';
  onClick?: () => void;
  className?: string;
}

export function AchievementCard({
  achievement,
  variant = 'default',
  onClick,
  className,
}: AchievementCardProps) {
  const config = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common;

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        onClick={onClick}
        className={cn(onClick && 'cursor-pointer')}
      >
        <Card
          variant="default"
          padding="sm"
          radius="lg"
          isHoverable={!!onClick}
          className={cn(
            'relative overflow-hidden',
            achievement.completed && 'ring-1',
            config.border,
            className
          )}
        >
          {/* Progress bar line */}
          <div className="absolute top-0 left-0 right-0 h-0.5">
            <div
              className={cn('h-full bg-gradient-to-r', config.gradient)}
              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              config.bg,
              achievement.completed ? '' : 'opacity-50'
            )}>
              {achievement.completed ? (
                <CheckCircle className={cn('w-5 h-5', config.text)} />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{achievement.title}</p>
              <p className="text-xs text-muted-foreground">
                {achievement.progress}/{achievement.target}
              </p>
            </div>
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
      <Card
        variant="default"
        padding="none"
        radius="xl"
        isHoverable={!!onClick}
        className={cn(
          'relative overflow-hidden',
          achievement.completed && 'ring-2',
          config.border,
          className
        )}
      >
        {/* Rarity indicator bar */}
        <div className={cn('h-1 bg-gradient-to-r', config.gradient)} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              config.bg,
              achievement.completed ? '' : 'opacity-50 grayscale'
            )}>
              {achievement.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className={cn('w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center', config.gradient)}
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <Lock className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{achievement.title}</h4>
                <Badge variant="outline" size="sm" className={cn('capitalize', config.text)}>
                  {achievement.rarity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>

              {/* Progress or Completed */}
              {!achievement.completed ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{achievement.progress}/{achievement.target}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      className={cn('h-full bg-gradient-to-r rounded-full', config.gradient)}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-success-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">
                    Unlocked {achievement.unlockDate ? formatDate(achievement.unlockDate, 'd MMM yyyy') : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================
// ACHIEVEMENT UNLOCKED
// ============================================
export interface AchievementUnlockedProps {
  achievement: Achievement;
  onClose?: () => void;
}

export function AchievementUnlocked({ achievement, onClose }: AchievementUnlockedProps) {
  const config = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-sm mx-4 bg-surface rounded-3xl border border-border overflow-hidden text-center"
      >
        {/* Glow effect */}
        <div
          className={cn('absolute inset-x-0 top-0 h-48 blur-3xl opacity-20 bg-gradient-to-b', config.gradient)}
        />

        {/* Content */}
        <div className="relative p-8">
          {/* Icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className={cn(
              'w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center',
              'bg-gradient-to-br',
              config.gradient
            )}
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>

          {/* Rarity */}
          <Badge
            variant="premium"
            size="lg"
            className={cn('capitalize mb-4', config.text)}
          >
            {achievement.rarity}
          </Badge>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
          >
            {achievement.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6"
          >
            {achievement.description}
          </motion.p>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-white',
              'bg-gradient-to-r',
              config.gradient
            )}
          >
            Awesome!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PLAYER PROFILE CARD
// ============================================
export interface PlayerProfileCardProps {
  level: number;
  title: string;
  xp: number;
  xpToNextLevel: number;
  avatar?: string;
  name?: string;
  achievements: number;
  streak: number;
  className?: string;
}

export function PlayerProfileCard({
  level,
  title,
  xp,
  xpToNextLevel,
  avatar,
  name,
  achievements,
  streak,
  className,
}: PlayerProfileCardProps) {
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <Card variant="gradient" padding="lg" radius="2xl" className={className}>
      <div className="flex items-center gap-6">
        {/* Avatar with level */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-bold">{name?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold shadow-lg">
            {level}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">Level {level}</p>

          {/* XP Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Experience</span>
              <span>{xp}/{xpToNextLevel} XP</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary-500 to-accent rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{streak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-500">{achievements}</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
