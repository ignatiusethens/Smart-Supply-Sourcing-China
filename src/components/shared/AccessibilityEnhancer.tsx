/**
 * Accessibility Enhancer Component
 * Provides enhanced accessibility features and WCAG AA compliance
 * Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { checkColorContrast } from '@/lib/utils/accessibility';
import { useAnnouncer } from '@/lib/hooks/useAccessibility';

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
  enableColorContrastCheck?: boolean;
  enableFocusManagement?: boolean;
  enableKeyboardNavigation?: boolean;
}

/**
 * Enhanced Button with accessibility features
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading,
  loadingText,
  className = '',
  disabled,
  ...props
}: AccessibleButtonProps) {
  const { announce } = useAnnouncer();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800',
    ghost: 'text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-500 dark:text-slate-50 dark:hover:bg-slate-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm min-w-[36px]',
    md: 'h-11 px-4 text-base min-w-[44px]',
    lg: 'h-12 px-6 text-lg min-w-[48px]'
  };

  const isDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    
    if (props.onClick) {
      props.onClick(e);
    }

    // Announce action to screen readers if it's an important action
    if (props['aria-label'] && !isLoading) {
      announce(`${props['aria-label']} activated`, 'polite');
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLoading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading</span>
        </>
      )}
      
      {!isLoading && leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      <span>
        {isLoading && loadingText ? loadingText : children}
      </span>
      
      {!isLoading && rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}

/**
 * Enhanced Image with accessibility features
 */
interface AccessibleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  decorative?: boolean;
  caption?: string;
}

export function AccessibleImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  decorative = false,
  caption,
  ...props
}: AccessibleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <div 
        className={`bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={decorative ? undefined : `Failed to load image: ${alt}`}
      >
        <span className="text-slate-400 text-sm" aria-hidden="true">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <figure className={caption ? 'space-y-2' : ''}>
      <img
        src={src}
        alt={decorative ? '' : alt}
        width={width}
        height={height}
        loading={loading}
        className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        role={decorative ? 'presentation' : undefined}
        aria-hidden={decorative}
        {...props}
      />
      {caption && !decorative && (
        <figcaption className="text-sm text-slate-600 dark:text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Enhanced Icon Button with accessibility features
 */
interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function AccessibleIconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: AccessibleIconButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 p-1',
    md: 'h-11 w-11 p-2',
    lg: 'h-12 w-12 p-3'
  };

  return (
    <AccessibleButton
      {...props}
      variant={variant}
      className={`${sizeClasses[size]} ${className}`}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">
        {icon}
      </span>
    </AccessibleButton>
  );
}

/**
 * Enhanced Form Field with accessibility features
 */
interface AccessibleFormFieldProps {
  children: React.ReactNode;
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function AccessibleFormField({
  children,
  label,
  id,
  error,
  helperText,
  required,
  className = ''
}: AccessibleFormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-slate-900 dark:text-slate-50"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required,
      })}
      
      {helperText && !error && (
        <p 
          id={helperId}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          {helperText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Color Contrast Checker Component
 */
interface ColorContrastCheckerProps {
  foreground: string;
  background: string;
  text?: string;
  className?: string;
}

export function ColorContrastChecker({
  foreground,
  background,
  text = 'Sample Text',
  className = ''
}: ColorContrastCheckerProps) {
  const contrastResult = useMemo(() => {
    return checkColorContrast(foreground, background);
  }, [foreground, background]);

  if (!contrastResult) return null;

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div 
        className="p-3 rounded mb-3"
        style={{ 
          color: foreground, 
          backgroundColor: background 
        }}
      >
        {text}
      </div>
      
      <div className="space-y-1 text-sm">
        <p>Contrast Ratio: <strong>{contrastResult.ratio}:1</strong></p>
        <p className={contrastResult.passesAA ? 'text-green-600' : 'text-red-600'}>
          WCAG AA: {contrastResult.passesAA ? '✓ Pass' : '✗ Fail'}
        </p>
        <p className={contrastResult.passesAAA ? 'text-green-600' : 'text-red-600'}>
          WCAG AAA: {contrastResult.passesAAA ? '✓ Pass' : '✗ Fail'}
        </p>
      </div>
    </div>
  );
}

/**
 * Main Accessibility Enhancer Component
 */
export function AccessibilityEnhancer({
  children,
  enableColorContrastCheck = false,
  enableFocusManagement = true,
  enableKeyboardNavigation = true,
}: AccessibilityEnhancerProps) {
  useEffect(() => {
    if (enableFocusManagement) {
      // Ensure focus is visible for keyboard users
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      };

      const handleMouseDown = () => {
        document.body.classList.remove('keyboard-navigation');
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleMouseDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [enableFocusManagement]);

  useEffect(() => {
    if (enableKeyboardNavigation) {
      // Add keyboard navigation support for custom components
      const handleKeyDown = (e: KeyboardEvent) => {
        // Handle Escape key for closing modals/dropdowns
        if (e.key === 'Escape') {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.closest('[role="dialog"]')) {
            const closeButton = activeElement.closest('[role="dialog"]')?.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
            closeButton?.click();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableKeyboardNavigation]);

  return (
    <>
      {children}
      {enableColorContrastCheck && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border max-w-sm">
          <h3 className="font-semibold mb-2">Accessibility Check</h3>
          <ColorContrastChecker
            foreground="#1f2937"
            background="#ffffff"
            text="Dark on Light"
            className="mb-2"
          />
          <ColorContrastChecker
            foreground="#ffffff"
            background="#2563eb"
            text="Light on Blue"
          />
        </div>
      )}
    </>
  );
}