// Input Component - Design System

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Check, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

// Input Variants
const inputVariants = {
  size: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  },

  state: {
    default: 'border-border bg-surface hover:border-border-hover',
    focused: 'border-primary-500 ring-2 ring-primary-500/20',
    error: 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
    success: 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
    disabled: 'opacity-50 cursor-not-allowed bg-muted/20',
  },
};

// Input Props
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  isLoading?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      size = 'md',
      label,
      error,
      success,
      helperText,
      leftElement,
      rightElement,
      isLoading = false,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const getState = () => {
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (success) return 'success';
      if (isFocused) return 'focused';
      return 'default';
    };

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-secondary-foreground">
            {label}
            {props.required && (
              <span className="text-danger-500 ml-1">*</span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Element */}
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftElement}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled || isLoading}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              // Base styles
              'w-full rounded-xl border bg-transparent',
              'text-primary placeholder:text-muted-foreground',
              'transition-all duration-200',
              'focus:outline-none',

              // Size
              inputVariants.size[size],

              // State
              inputVariants.state[getState()],

              // Left/Right padding for elements
              leftElement && 'pl-10',
              (rightElement || isPassword || isLoading) && 'pr-10',

              className
            )}
            {...props}
          />

          {/* Right Element */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}

            {error && <AlertCircle className="h-4 w-4 text-danger-500" />}
            {success && !error && <Check className="h-4 w-4 text-success-500" />}
            {rightElement}
          </div>
        </div>

        {/* Helper Text, Error, Success */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-danger-500"
            >
              {error}
            </motion.p>
          )}
          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-success-500"
            >
              {success}
            </motion.p>
          )}
          {helperText && !error && !success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, label, error, helperText, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const getState = () => {
      if (disabled) return 'disabled';
      if (error) return 'error';
      if (isFocused) return 'focused';
      return 'default';
    };

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-secondary-foreground">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'w-full rounded-xl border bg-transparent',
            'text-primary placeholder:text-muted-foreground',
            'transition-all duration-200',
            'focus:outline-none resize-none',
            'px-4 py-3 min-h-[100px]',
            inputVariants.state[getState()],
            className
          )}
          {...props}
        />

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-danger-500"
            >
              {error}
            </motion.p>
          )}
          {helperText && !error && (
            <motion.p className="text-sm text-muted-foreground">{helperText}</motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Currency Input
export interface CurrencyInputProps extends Omit<InputProps, 'type' | 'leftElement' | 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, size = 'lg', ...props }, ref) => {
    const formatValue = (num: number) => {
      return num.toLocaleString('id-ID');
    };

    const parseValue = (str: string) => {
      const cleaned = str.replace(/\D/g, '');
      return parseInt(cleaned, 10) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseValue(e.target.value);
      onChange(parsed);
    };

    return (
      <Input
        ref={ref}
        type="text"
        size={size}
        value={formatValue(value)}
        onChange={handleChange}
        leftElement={<span className="text-muted-foreground font-medium">Rp</span>}
        className={cn('pl-12', className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
