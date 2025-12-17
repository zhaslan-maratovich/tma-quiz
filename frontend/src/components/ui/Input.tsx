/**
 * Input компонент
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, icon, rightIcon, ...props }, ref) => {
        return (
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-12 w-full rounded-xl border bg-tg-secondary-bg px-4 py-3 text-base text-tg-text transition-all duration-200',
                        'placeholder:text-tg-hint',
                        'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        error &&
                            'border-tg-destructive focus:border-tg-destructive focus:ring-tg-destructive/20',
                        !error && 'border-transparent',
                        icon && 'pl-10',
                        rightIcon && 'pr-10',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tg-hint">
                        {rightIcon}
                    </div>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
