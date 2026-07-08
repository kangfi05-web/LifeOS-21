// Badge Component - Design System

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// Badge Variants
const badgeVariants = {
  variant: {
    default: 'bg-primary-500/15 text-primary-400 border-primary-500/20',
    secondary: 'bg-secondary-700/50 text-secondary-300 border-secondary-600/30',
    success: 'bg-success-500/15 text-success-400 border-success-500/20',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-500/20',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/20',
    info: 'bg-info-500/15 text-info-400 border-info-500/20',
    outline: 'bg-transparent border-border text-primary',
    premium: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  },

  size: {
    sm: 'px-2 py-0.5 text-[0.6875rem] rounded-md',
    md: 'px-2.5 py-0.5 text-xs rounded-lg',
    lg: 'px-3 py-1 text-sm rounded-lg',
  },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants.variant;
  size?: keyof typeof badgeVariants.size;
  icon?: ReactNode;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      icon,
      dot,
      pulse,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium border',
          badgeVariants.variant[variant],
          badgeVariants.size[size],
          className
        )}
        {...props}
      >
        {dot && (
          <motion.span
            animate={pulse ? { scale: [1, 1.2, 1] } : undefined}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              'w-2 h-2 rounded-full',
              variant === 'success' && 'bg-success-500',
              variant === 'warning' && 'bg-warning-500',
              variant === 'danger' && 'bg-danger-500',
              variant === 'info' && 'bg-info-500',
              variant === 'premium' && 'bg-amber-500',
              'bg-primary-500'
            )}
          />
        )}
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Priority Badge
export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export const PriorityBadge = forwardRef<HTMLSpanElement, PriorityBadgeProps>(
  ({ priority, className, ...props }, ref) => {
    const variantMap: Record<string, keyof typeof badgeVariants.variant> = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'secondary',
    };

    const labelMap: Record<string, string> = {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    };

    return (
      <Badge
        ref={ref}
        variant={variantMap[priority]}
        className={className}
        {...props}
      >
        {labelMap[priority]}
      </Badge>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

// Status Badge
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft';
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const variantMap: Record<string, keyof typeof badgeVariants.variant> = {
      active: 'success',
      paused: 'warning',
      completed: 'info',
      cancelled: 'danger',
      draft: 'secondary',
    };

    const labelMap: Record<string, string> = {
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      cancelled: 'Cancelled',
      draft: 'Draft',
    };

    return (
      <Badge
        ref={ref}
        variant={variantMap[status]}
        dot
        pulse={status === 'active'}
        className={className}
        {...props}
      >
        {labelMap[status]}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Level Badge
export interface LevelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelBadge = forwardRef<HTMLSpanElement, LevelBadgeProps>(
  ({ level, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-5 h-5 text-[0.625rem]',
      md: 'w-6 h-6 text-xs',
      lg: 'w-8 h-8 text-sm',
    };

    const getGradient = () => {
      if (level >= 100) return 'from-amber-500 to-orange-500';
      if (level >= 50) return 'from-purple-500 to-violet-500';
      if (level >= 20) return 'from-blue-500 to-cyan-500';
      if (level >= 10) return 'from-green-500 to-emerald-500';
      return 'from-gray-500 to-gray-600';
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold text-white',
          'bg-gradient-to-br',
          getGradient(),
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {level}
      </span>
    );
  }
);

LevelBadge.displayName = 'LevelBadge';

// Streak Badge
export interface StreakBadgeProps extends BadgeProps {
  days: number;
}

export const StreakBadge = forwardRef<HTMLSpanElement, StreakBadgeProps>(
  ({ days, className, ...props }, ref) => {
    const getIntensity = () => {
      if (days >= 100) return '🔥🔥🔥';
      if (days >= 30) return '🔥🔥';
      if (days >= 7) return '🔥';
      return '✨';
    };

    return (
      <Badge
        ref={ref}
        variant="premium"
        className={cn('font-bold', className)}
        {...props}
      >
        {getIntensity()} {days} hari
      </Badge>
    );
  }
);

StreakBadge.displayName = 'StreakBadge';

export { badgeVariants };
