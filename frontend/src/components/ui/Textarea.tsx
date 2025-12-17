/**
 * Textarea компонент
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex min-h-[100px] w-full rounded-xl border bg-tg-secondary-bg px-4 py-3 text-base text-tg-text transition-all duration-200',
                    'placeholder:text-tg-hint',
                    'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'resize-none',
                    error &&
                        'border-tg-destructive focus:border-tg-destructive focus:ring-tg-destructive/20',
                    !error && 'border-transparent',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
