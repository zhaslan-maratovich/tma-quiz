/**
 * Progress компонент
 */

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    indicatorClassName?: string;
    showLabel?: boolean;
    variant?: 'default' | 'gradient' | 'success' | 'warning' | 'destructive';
    size?: 'sm' | 'default' | 'lg';
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
    (
        {
            className,
            value,
            indicatorClassName,
            showLabel,
            variant = 'default',
            size = 'default',
            ...props
        },
        ref
    ) => {
        const sizeClasses = {
            sm: 'h-1.5',
            default: 'h-2.5',
            lg: 'h-4',
        };

        const indicatorVariants = {
            default: 'bg-tg-button',
            gradient: 'bg-gradient-to-r from-primary-500 via-primary-600 to-accent-violet',
            success: 'bg-accent-emerald',
            warning: 'bg-accent-amber',
            destructive: 'bg-tg-destructive',
        };

        return (
            <div className="relative">
                <ProgressPrimitive.Root
                    ref={ref}
                    className={cn(
                        'relative overflow-hidden rounded-full bg-tg-secondary-bg',
                        sizeClasses[size],
                        className
                    )}
                    {...props}
                >
                    <ProgressPrimitive.Indicator
                        className={cn(
                            'h-full w-full flex-1 transition-all duration-500 ease-out',
                            indicatorVariants[variant],
                            indicatorClassName
                        )}
                        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
                    />
                </ProgressPrimitive.Root>
                {showLabel && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-tg-hint">
                        {Math.round(value || 0)}%
                    </span>
                )}
            </div>
        );
    }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
