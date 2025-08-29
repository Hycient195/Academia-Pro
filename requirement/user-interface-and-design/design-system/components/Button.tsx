// Academia Pro Design System - Button Component
// WCAG 2.1 AA Compliant, Accessible Button Component

import React, { forwardRef } from 'react';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { borders } from '../tokens/borders';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Button state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Children content */
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Generate CSS classes based on props
    const getButtonClasses = () => {
      const classes = [
        'inline-flex items-center justify-center',
        'font-medium transition-all duration-200 ease-in-out',
        'border-none rounded-lg',
        'outline-none select-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        fullWidth ? 'w-full' : '',
      ];

      // Variant classes
      switch (variant) {
        case 'primary':
          classes.push(
            'bg-blue-600 text-white shadow-sm',
            'hover:bg-blue-700 focus-visible:ring-blue-500',
            'active:bg-blue-800'
          );
          break;
        case 'secondary':
          classes.push(
            'bg-gray-100 text-gray-900 shadow-sm',
            'hover:bg-gray-200 focus-visible:ring-gray-500',
            'active:bg-gray-300'
          );
          break;
        case 'success':
          classes.push(
            'bg-green-600 text-white shadow-sm',
            'hover:bg-green-700 focus-visible:ring-green-500',
            'active:bg-green-800'
          );
          break;
        case 'warning':
          classes.push(
            'bg-yellow-500 text-gray-900 shadow-sm',
            'hover:bg-yellow-600 focus-visible:ring-yellow-500',
            'active:bg-yellow-700'
          );
          break;
        case 'error':
          classes.push(
            'bg-red-600 text-white shadow-sm',
            'hover:bg-red-700 focus-visible:ring-red-500',
            'active:bg-red-800'
          );
          break;
        case 'info':
          classes.push(
            'bg-blue-500 text-white shadow-sm',
            'hover:bg-blue-600 focus-visible:ring-blue-500',
            'active:bg-blue-700'
          );
          break;
        case 'outline':
          classes.push(
            'bg-transparent text-blue-600 border border-blue-600',
            'hover:bg-blue-50 focus-visible:ring-blue-500',
            'active:bg-blue-100'
          );
          break;
        case 'ghost':
          classes.push(
            'bg-transparent text-blue-600',
            'hover:bg-blue-50 focus-visible:ring-blue-500',
            'active:bg-blue-100'
          );
          break;
      }

      // Size classes
      switch (size) {
        case 'xs':
          classes.push('h-8 px-2 py-1 text-xs gap-1');
          break;
        case 'sm':
          classes.push('h-9 px-3 py-1.5 text-sm gap-1.5');
          break;
        case 'md':
          classes.push('h-10 px-4 py-2 text-sm gap-2');
          break;
        case 'lg':
          classes.push('h-11 px-5 py-2.5 text-base gap-2.5');
          break;
        case 'xl':
          classes.push('h-12 px-6 py-3 text-base gap-3');
          break;
      }

      return classes.filter(Boolean).join(' ');
    };

    const buttonClasses = getButtonClasses();

    return (
      <button
        ref={ref}
        className={`${buttonClasses} ${className}`}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

// Usage Examples:
//
// Primary Button
// <Button variant="primary" size="md">Save Changes</Button>
//
// Secondary Button with Icon
// <Button variant="secondary" leftIcon={<PlusIcon />}>Add Item</Button>
//
// Loading Button
// <Button variant="primary" loading>Loading...</Button>
//
// Full Width Button
// <Button variant="primary" fullWidth>Continue</Button>
//
// Disabled Button
// <Button variant="primary" disabled>Disabled</Button>