/**
 * EmptyState компонент
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center py-12 px-6',
                className
            )}
        >
            {icon && <div className="mb-4 text-tg-hint">{icon}</div>}

            <h3 className="text-lg font-semibold text-tg-text mb-2">{title}</h3>

            {description && <p className="text-sm text-tg-hint max-w-xs mb-6">{description}</p>}

            {action && (
                <Button onClick={action.onClick} variant="gradient">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
