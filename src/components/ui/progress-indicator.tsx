/**
 * Progress Indicator Component
 * Provides visual feedback for async operations and multi-step processes
 * Validates: Requirements 19.7, 22.1, 22.2, 22.3, 22.4, 22.5
 */

import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  className,
}: ProgressIndicatorProps) {
  return (
    <nav
      aria-label="Progress"
      className={cn('w-full', className)}
      role="navigation"
    >
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isError = step.status === 'error';

          return (
            <li
              key={step.id}
              className={cn(
                'flex-1 relative',
                index !== steps.length - 1 && 'pr-8'
              )}
            >
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2',
                    isCompleted
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step Content */}
              <div className="relative flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white dark:bg-gray-900 z-10',
                    isCompleted &&
                      'border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400',
                    isActive &&
                      'border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900',
                    !isCompleted &&
                      !isActive &&
                      'border-gray-300 dark:border-gray-600',
                    isError &&
                      'border-red-600 dark:border-red-400 bg-red-600 dark:bg-red-400'
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  ) : isActive ? (
                    <Loader2
                      className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isError
                          ? 'text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isActive && 'text-blue-600 dark:text-blue-400',
                      isCompleted && 'text-gray-900 dark:text-gray-100',
                      !isActive &&
                        !isCompleted &&
                        'text-gray-500 dark:text-gray-400',
                      isError && 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface LinearProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function LinearProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  className,
  variant = 'default',
}: LinearProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantClasses = {
    default: 'bg-blue-600 dark:bg-blue-400',
    success: 'bg-green-600 dark:bg-green-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    error: 'bg-red-600 dark:bg-red-400',
  };

  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  showValue = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', sizeClasses[size], className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-blue-600 dark:text-blue-400 transition-all duration-300 ease-in-out"
        />
      </svg>
      {showValue && (
        <span
          className={cn(
            'absolute font-semibold text-gray-900 dark:text-gray-100',
            textSizeClasses[size]
          )}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
