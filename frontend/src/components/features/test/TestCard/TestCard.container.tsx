/**
 * TestCard Container - компонент с бизнес-логикой
 *
 * Отвечает за:
 * - Навигацию
 * - Управление состоянием (showActions)
 * - Обработку событий
 * - Haptic feedback
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { haptic } from '@/lib/telegram';
import { formatRelativeDate } from '@/lib/utils';
import { TestCardView } from './TestCard.view';
import type { TestCardContainerProps } from './TestCard.types';

export function TestCard({ test, onDelete, index = 0 }: TestCardContainerProps) {
    const navigate = useNavigate();
    const [showActions, setShowActions] = React.useState(false);

    const isDraft = test.status === 'draft';
    const title = test.welcomeScreen?.title || 'Без названия';
    const description = test.welcomeScreen?.description || null;
    const sessionsCount = test._count?.sessions ?? 0;
    const updatedAt = formatRelativeDate(test.updatedAt);

    // === Обработчики событий ===

    const handleCardClick = React.useCallback(() => {
        haptic.impact('light');
        if (isDraft) {
            navigate(`/tests/${test.id}/edit`);
        } else {
            navigate(`/tests/${test.id}/analytics`);
        }
    }, [isDraft, test.id, navigate]);

    const handleEdit = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            haptic.impact('light');
            navigate(`/tests/${test.id}/edit`);
        },
        [test.id, navigate]
    );

    const handleAnalytics = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            haptic.impact('light');
            navigate(`/tests/${test.id}/analytics`);
        },
        [test.id, navigate]
    );

    const handleShare = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            haptic.impact('light');
            navigate(`/tests/${test.id}/share`);
        },
        [test.id, navigate]
    );

    const handleDelete = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            haptic.notification('warning');
            onDelete?.(test.id);
        },
        [test.id, onDelete]
    );

    const handleMoreClick = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            haptic.selection();
            setShowActions(!showActions);
        },
        [showActions]
    );

    return (
        <TestCardView
            title={title}
            description={description}
            type={test.type}
            status={test.status}
            sessionsCount={sessionsCount}
            updatedAt={updatedAt}
            showActions={showActions}
            index={index}
            onCardClick={handleCardClick}
            onMoreClick={handleMoreClick}
            onEdit={handleEdit}
            onAnalytics={handleAnalytics}
            onShare={handleShare}
            onDelete={handleDelete}
        />
    );
}
