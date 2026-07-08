// Button Component - Design System

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

// Button Variants
const buttonVariants = {
  // Variant styles
  variant: {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm',
    secondary: 'bg-secondary-700 text-white hover:bg-secondary-600 active:bg-secondary-500',
    outline: 'border border-border bg-transparent hover:bg-white/5 active:bg-white/10',
    ghost: 'bg-transparent hover:bg-white/5 active:bg-white/10',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700',
    success: 'bg-success-500 text-white hover:bg-success-600 active:bg-success-700',
    gradient: 'bg-gradient-to-r from-primary-500 to-accent text-white hover:opacity-90 active:opacity-80',
  },

  // Size styles
  size: {
    xs: 'h-6 px-2 text-xs rounded-md',
    sm: 'h-8 px-3 text-sm rounded-lg',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-12 px-6 text-base rounded-xl',
    xl: 'h-14 px-8 text-lg rounded-xl',
  },

  // Shapes
  shape: {
    default: '',
    square: 'aspect-square p-0',
    circle: 'aspect-square p-0 rounded-full',
  },
};

// Button Props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  shape?: keyof typeof buttonVariants.shape;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      shape = 'default',
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

          // Variant
          buttonVariants.variant[variant],

          // Size & Shape
          buttonVariants.size[size],
          buttonVariants.shape[shape],

          // Full width
          isFullWidth && 'w-full',

          className
        )}
        disabled={isDisabled}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button - convenience component
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'ghost', size = 'md', shape = 'circle', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        shape={shape}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { buttonVariants };
