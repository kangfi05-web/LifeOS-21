// Progress Components - Design System

import { forwardRef, HTMLAttributes, useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { cn } from '../../utils/cn';

// ============================================
// PROGRESS BAR
// ============================================
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showValue = false,
      animated = true,
      striped = false,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
      xs: 'h-1',
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3',
    };

    const variantClasses = {
      default: 'from-primary-500 to-primary-400',
      success: 'from-success-500 to-success-400',
      warning: 'from-warning-500 to-warning-400',
      danger: 'from-danger-500 to-danger-400',
      gradient: 'from-primary-500 to-accent',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showValue && (
          <div className="flex justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn('w-full bg-muted/20 rounded-full overflow-hidden', sizeClasses[size])}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full bg-gradient-to-r',
              variantClasses[variant],
              striped && 'bg-[length:1rem_1rem] bg-stripes'
            )}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// ============================================
// CIRCULAR PROGRESS
// ============================================
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  thickness?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'gradient';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      thickness = 4,
      variant = 'primary',
      showValue = true,
      label,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeMap: Record<string, number> = {
      sm: 48,
      md: 64,
      lg: 96,
      xl: 128,
      '2xl': 160,
    };

    const dimension = sizeMap[size];
    const radius = (dimension - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const variantColors = {
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      gradient: 'url(#progressGradient)',
    };

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col items-center', className)}
        {...props}
      >
        <div className="relative" style={{ width: dimension, height: dimension }}>
          <svg
            width={dimension}
            height={dimension}
            className="-rotate-90"
          >
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={thickness}
            />

            {/* Progress circle */}
            <motion.circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              fill="none"
              stroke={variantColors[variant]}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
            />
          </svg>

          {/* Center content */}
          {showValue && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className="text-lg font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(percentage)}%
              </motion.span>
            </div>
          )}
        </div>

        {label && (
          <span className="mt-2 text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// ============================================
// PROGRESS RING (Donut Chart Style)
// ============================================
export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      color = '#3b82f6',
      trackColor = 'rgba(255,255,255,0.1)',
      children,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeMap: Record<string, number> = {
      sm: 32,
      md: 48,
      lg: 64,
      xl: 96,
      '2xl': 128,
    };

    const dimension = sizeMap[size];
    const stroke = size === 'sm' ? 2 : 3;
    const radius = (dimension - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <svg width={dimension} height={dimension} className="-rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <motion.circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {children && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = 'ProgressRing';

// ============================================
// ANIMATED NUMBER
// ============================================
export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, duration = 1, format = (v) => v.toString(), className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { duration: duration * 1000 });

  useEffect(() => {
    spring.set(value);
    return spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
  }, [value, spring]);

  return <span className={className}>{format(displayValue)}</span>;
}
