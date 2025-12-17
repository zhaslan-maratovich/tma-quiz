/**
 * Header компонент
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { haptic } from '@/lib/telegram';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    transparent?: boolean;
    className?: string;
}

export function Header({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightAction,
    transparent = false,
    className,
}: HeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        haptic.impact('light');
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div
            className={cn(
                'flex items-center justify-between px-4 py-3 min-h-[56px]',
                !transparent && 'bg-tg-header-bg/80 backdrop-blur-xl border-b border-tg-separator',
                className
            )}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {showBack && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleBack}
                        className="shrink-0 -ml-2"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                )}

                {(title || subtitle) && (
                    <div className="min-w-0 flex-1">
                        {title && (
                            <h1 className="text-lg font-semibold text-tg-text truncate">{title}</h1>
                        )}
                        {subtitle && <p className="text-xs text-tg-hint truncate">{subtitle}</p>}
                    </div>
                )}
            </div>

            {rightAction && <div className="shrink-0 ml-3">{rightAction}</div>}
        </div>
    );
}
