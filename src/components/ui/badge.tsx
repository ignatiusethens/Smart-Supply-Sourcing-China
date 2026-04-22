import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-800 text-white hover:bg-primary-700',
        secondary:
          'border-transparent bg-primary-100 text-primary-700 hover:bg-primary-200',
        destructive: 'bg-error-50 text-error-700 border border-error-500',
        outline: 'text-slate-950 dark:text-slate-50',
        success: 'bg-success-50 text-success-700 border border-success-500',
        warning: 'bg-warning-50 text-warning-700 border border-warning-500',
        error: 'bg-error-50 text-error-700 border border-error-500',
        info: 'bg-info-50 text-info-700 border border-info-500',
        mpesa: 'border-transparent bg-green-500 text-white text-xs font-bold',
        bank: 'border-transparent bg-blue-500 text-white text-xs font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Screen reader description for the badge
   */
  srDescription?: string;
  /**
   * Whether the badge is interactive (clickable)
   */
  interactive?: boolean;
}

function Badge({
  className,
  variant,
  srDescription,
  interactive,
  children,
  ...props
}: BadgeProps) {
  if (interactive) {
    return (
      <button
        className={cn(
          badgeVariants({ variant }),
          'cursor-pointer hover:opacity-80',
          className
        )}
        role="button"
        tabIndex={0}
        aria-label={srDescription}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
        {srDescription && <span className="sr-only">{srDescription}</span>}
      </button>
    );
  }

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      aria-label={srDescription}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
      {srDescription && <span className="sr-only">{srDescription}</span>}
    </div>
  );
}

export { Badge, badgeVariants };
