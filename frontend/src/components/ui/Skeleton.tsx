/**
 * Skeleton компонент для loading states
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'circular' | 'rounded';
    animation?: 'pulse' | 'shimmer' | 'none';
}

function Skeleton({
    className,
    variant = 'default',
    animation = 'pulse',
    ...props
}: SkeletonProps) {
    const variantClasses = {
        default: 'rounded-lg',
        circular: 'rounded-full',
        rounded: 'rounded-2xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        shimmer:
            'animate-shimmer bg-gradient-to-r from-tg-secondary-bg via-tg-bg to-tg-secondary-bg bg-[length:200%_100%]',
        none: '',
    };

    return (
        <div
            className={cn(
                'bg-tg-secondary-bg',
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
            {...props}
        />
    );
}

// Предопределённые skeleton компоненты
function SkeletonCard() {
    return (
        <div className="rounded-2xl bg-tg-section p-4 shadow-card">
            <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>
        </div>
    );
}

function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 15}%` }} />
            ))}
        </div>
    );
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonText };
