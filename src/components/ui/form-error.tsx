/**
 * Form Error Component
 * Provides consistent error message display for forms
 * Validates: Requirements 22.1, 22.2
 */

import { AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FormErrorProps {
  message?: string;
  className?: string;
  variant?: 'inline' | 'banner';
}

export function FormError({
  message,
  className,
  variant = 'inline',
}: FormErrorProps) {
  if (!message) return null;

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <XCircle
          className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-red-600 dark:text-red-400',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
  className?: string;
}

export function FormFieldError({
  error,
  touched,
  className,
}: FormFieldErrorProps) {
  if (!error || !touched) return null;

  return (
    <FormError
      message={error}
      variant="inline"
      className={cn('mt-1', className)}
    />
  );
}

interface FormSuccessProps {
  message?: string;
  className?: string;
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <AlertCircle
        className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          {message}
        </p>
      </div>
    </div>
  );
}
