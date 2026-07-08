// Card Component - Design System

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

// Card Variants
const cardVariants = {
  variant: {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface-elevated border border-border',
    glass: 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.05]',
    gradient: 'bg-gradient-to-br from-surface to-background border border-border',
    premium: 'bg-gradient-to-br from-surface to-background border border-primary-500/20',
    outline: 'bg-transparent border border-border',
  },

  padding: {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  radius: {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-3xl',
  },
};

// Base Card Props
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants.variant;
  padding?: keyof typeof cardVariants.padding;
  radius?: keyof typeof cardVariants.radius;
  isHoverable?: boolean;
  isPressable?: boolean;
  glowColor?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      radius = 'lg',
      isHoverable = false,
      isPressable = false,
      glowColor,
      children,
      ...props
    },
    ref
  ) => {
    const hoverStyles = isHoverable
      ? 'hover:border-border-hover hover:bg-surface-hover hover:-translate-y-0.5'
      : '';

    const cardClassName = cn(
      'transition-all duration-200',
      cardVariants.variant[variant],
      cardVariants.padding[padding],
      cardVariants.radius[radius],
      hoverStyles,
      glowColor && `shadow-[0_0_20px_${glowColor}40]`,
      className
    );

    if (isPressable) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          className={cardClassName}
          {...(props as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, icon, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-start justify-between mb-4', className)} {...props}>
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0">{icon}</div>
          )}
          <div>
            {title && <h3 className="font-semibold text-lg">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            {children}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('', className)} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-end gap-3 pt-4 border-t border-border mt-4', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Card Image
export interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
  overlay?: boolean;
}

export const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, src, alt, aspectRatio = 'video', overlay = false, ...props }, ref) => {
    const aspectClasses = {
      video: 'aspect-video',
      square: 'aspect-square',
      portrait: 'aspect-[3/4]',
      wide: 'aspect-[2/1]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-t-inherit',
          aspectClasses[aspectRatio],
          className
        )}
        {...props}
      >
        {src ? (
          <>
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
            />
            {overlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            )}
          </>
        ) : (
          <div className="h-full w-full bg-muted/20" />
        )}
      </div>
    );
  }
);

CardImage.displayName = 'CardImage';

// Skeleton Card for Loading States
export const CardSkeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-surface rounded-2xl border border-border p-6',
          className
        )}
        {...props}
      >
        <div className="space-y-4">
          <div className="h-32 bg-muted/20 rounded-xl" />
          <div className="h-4 bg-muted/20 rounded w-3/4" />
          <div className="h-4 bg-muted/20 rounded w-1/2" />
          <div className="h-10 bg-muted/20 rounded-xl" />
        </div>
      </div>
    );
  }
);

CardSkeleton.displayName = 'CardSkeleton';

export { cardVariants };
