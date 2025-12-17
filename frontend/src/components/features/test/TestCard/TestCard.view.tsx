/**
 * TestCard View - презентационный компонент
 *
 * Только отображение, без бизнес-логики
 */

import {
    MoreHorizontal,
    Edit,
    BarChart3,
    Share2,
    Trash2,
    FileText,
    Brain,
    GitBranch,
    Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, pluralize } from '@/lib/utils';
import type { TestCardViewProps, TestTypeConfig } from './TestCard.types';
import type { TestType } from '@/types';

/**
 * Конфигурация визуального отображения типов тестов
 */
const testTypeConfig: Record<TestType, TestTypeConfig> = {
    quiz: {
        icon: <FileText className="h-5 w-5" />,
        label: 'Викторина',
        color: 'text-primary-500',
        bgColor: 'bg-primary-500/10',
    },
    personality: {
        icon: <Brain className="h-5 w-5" />,
        label: 'Типология',
        color: 'text-accent-violet',
        bgColor: 'bg-accent-violet/10',
    },
    branching: {
        icon: <GitBranch className="h-5 w-5" />,
        label: 'Сюжет',
        color: 'text-accent-emerald',
        bgColor: 'bg-accent-emerald/10',
    },
};

/**
 * Получить цвет градиента по типу теста
 */
function getGradientColor(type: TestType): string {
    switch (type) {
        case 'quiz':
            return 'bg-primary-500';
        case 'personality':
            return 'bg-accent-violet';
        case 'branching':
            return 'bg-accent-emerald';
        default:
            return 'bg-primary-500';
    }
}

export function TestCardView({
    title,
    description,
    type,
    status,
    sessionsCount,
    updatedAt,
    showActions,
    index = 0,
    onCardClick,
    onMoreClick,
    onEdit,
    onAnalytics,
    onShare,
    onDelete,
}: TestCardViewProps) {
    const config = testTypeConfig[type];
    const isDraft = status === 'draft';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <Card interactive onClick={onCardClick} className="relative overflow-hidden">
                {/* Gradient accent на фоне */}
                <div
                    className={cn(
                        'absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl',
                        getGradientColor(type)
                    )}
                />

                <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Icon */}
                            <div
                                className={cn(
                                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                                    config.bgColor
                                )}
                            >
                                <span className={config.color}>{config.icon}</span>
                            </div>

                            {/* Title & Type */}
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-tg-text truncate">
                                    {title || 'Без названия'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-tg-hint">{config.label}</span>
                                    <span className="text-tg-separator">•</span>
                                    <Badge variant={isDraft ? 'warning' : 'success'} size="sm">
                                        {isDraft ? 'Черновик' : 'Опубликован'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* More button */}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={onMoreClick}
                            className="shrink-0 -mr-2"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-tg-hint line-clamp-2 mb-3">{description}</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-tg-separator">
                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-tg-hint">
                            {!isDraft && (
                                <div className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>
                                        {sessionsCount}{' '}
                                        {pluralize(sessionsCount, [
                                            'прохождение',
                                            'прохождения',
                                            'прохождений',
                                        ])}
                                    </span>
                                </div>
                            )}
                            <span>{updatedAt}</span>
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-1">
                            {isDraft ? (
                                <Button variant="ghost" size="icon-sm" onClick={onEdit}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="icon-sm" onClick={onAnalytics}>
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon-sm" onClick={onShare}>
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Extended actions panel */}
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-tg-separator"
                    >
                        <div className="flex flex-wrap gap-2">
                            {isDraft && (
                                <Button variant="secondary" size="sm" onClick={onEdit}>
                                    <Edit className="h-4 w-4" />
                                    Редактировать
                                </Button>
                            )}
                            {!isDraft && (
                                <>
                                    <Button variant="secondary" size="sm" onClick={onAnalytics}>
                                        <BarChart3 className="h-4 w-4" />
                                        Аналитика
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={onShare}>
                                        <Share2 className="h-4 w-4" />
                                        Поделиться
                                    </Button>
                                </>
                            )}
                            <Button variant="destructive" size="sm" onClick={onDelete}>
                                <Trash2 className="h-4 w-4" />
                                Удалить
                            </Button>
                        </div>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
}
