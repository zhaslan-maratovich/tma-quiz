/**
 * PageContainer - обёртка для страниц
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    noPadding?: boolean;
    gradient?: boolean;
}

export function PageContainer({
    children,
    className,
    header,
    footer,
    noPadding = false,
    gradient = false,
}: PageContainerProps) {
    return (
        <div className={cn('min-h-screen flex flex-col bg-tg-bg', gradient && 'gradient-mesh')}>
            {header && <header className="sticky top-0 z-50 safe-area-top">{header}</header>}

            <main className={cn('flex-1 flex flex-col', !noPadding && 'px-4 py-4', className)}>
                {children}
            </main>

            {footer && <footer className="sticky bottom-0 z-50 safe-area-bottom">{footer}</footer>}
        </div>
    );
}
