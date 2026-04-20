import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-100',
        secondary: 'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700',
        destructive: 'border-transparent bg-red-500 text-slate-50 hover:bg-red-600 dark:hover:bg-red-600',
        outline: 'text-slate-950 dark:text-slate-50',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
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

function Badge({ className, variant, srDescription, interactive, children, ...props }: BadgeProps) {
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
        {srDescription && (
          <span className="sr-only">{srDescription}</span>
        )}
      </button>
    );
  }

  return (
    <div 
      className={cn(
        badgeVariants({ variant }), 
        className
      )} 
      aria-label={srDescription}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
      {srDescription && (
        <span className="sr-only">{srDescription}</span>
      )}
    </div>
  );
}

export { Badge, badgeVariants };