/**
 * Badge компонент
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-tg-secondary-bg text-tg-text',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
        secondary: 'bg-tg-secondary-bg text-tg-hint',
        success: 'bg-accent-emerald/10 text-accent-emerald',
        warning: 'bg-accent-amber/10 text-accent-amber',
        destructive: 'bg-tg-destructive/10 text-tg-destructive',
        outline: 'border border-tg-separator text-tg-text',
        gradient: 'bg-gradient-to-r from-primary-500 to-accent-violet text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xxs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
