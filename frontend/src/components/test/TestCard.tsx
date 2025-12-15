/**
 * TestCard компонент для отображения теста в списке
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Edit,
  BarChart3,
  Share2,
  Trash2,
  FileText,
  Brain,
  GitBranch,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeDate, pluralize } from '@/lib/utils';
import { haptic } from '@/lib/telegram';
import type { Test, TestType } from '@/types';

interface TestCardProps {
  test: Test;
  onDelete?: (id: string) => void;
  index?: number;
}

const testTypeConfig: Record<TestType, { icon: React.ReactNode; label: string; color: string }> = {
  quiz: {
    icon: <FileText className="h-5 w-5" />,
    label: 'Викторина',
    color: 'text-primary-500',
  },
  personality: {
    icon: <Brain className="h-5 w-5" />,
    label: 'Типология',
    color: 'text-accent-violet',
  },
  branching: {
    icon: <GitBranch className="h-5 w-5" />,
    label: 'Сюжет',
    color: 'text-accent-emerald',
  },
};

export function TestCard({ test, onDelete, index = 0 }: TestCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = React.useState(false);

  const typeConfig = testTypeConfig[test.type];
  const isDraft = test.status === 'draft';
  const sessionsCount = test._count?.sessions ?? 0;

  const handleCardClick = () => {
    haptic.impact('light');
    if (isDraft) {
      navigate(`/tests/${test.id}/edit`);
    } else {
      navigate(`/tests/${test.id}/analytics`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.impact('light');
    navigate(`/tests/${test.id}/edit`);
  };

  const handleAnalytics = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.impact('light');
    navigate(`/tests/${test.id}/analytics`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.impact('light');
    navigate(`/tests/${test.id}/share`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.notification('warning');
    onDelete?.(test.id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.selection();
    setShowActions(!showActions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        interactive
        onClick={handleCardClick}
        className="relative overflow-hidden"
      >
        {/* Gradient accent на фоне */}
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl',
            test.type === 'quiz' && 'bg-primary-500',
            test.type === 'personality' && 'bg-accent-violet',
            test.type === 'branching' && 'bg-accent-emerald'
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
                  test.type === 'quiz' && 'bg-primary-500/10',
                  test.type === 'personality' && 'bg-accent-violet/10',
                  test.type === 'branching' && 'bg-accent-emerald/10'
                )}
              >
                <span className={typeConfig.color}>{typeConfig.icon}</span>
              </div>

              {/* Title & Type */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-tg-text truncate">
                  {test.welcomeScreen?.title || 'Без названия'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-tg-hint">{typeConfig.label}</span>
                  <span className="text-tg-separator">•</span>
                  <Badge
                    variant={isDraft ? 'warning' : 'success'}
                    size="sm"
                  >
                    {isDraft ? 'Черновик' : 'Опубликован'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* More button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleMoreClick}
              className="shrink-0 -mr-2"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Description */}
          {test.welcomeScreen?.description && (
            <p className="text-sm text-tg-hint line-clamp-2 mb-3">
              {test.welcomeScreen.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-tg-separator">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-tg-hint">
              {!isDraft && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {sessionsCount} {pluralize(sessionsCount, ['прохождение', 'прохождения', 'прохождений'])}
                  </span>
                </div>
              )}
              <span>{formatRelativeDate(test.updatedAt)}</span>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-1">
              {isDraft ? (
                <Button variant="ghost" size="icon-sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="icon-sm" onClick={handleAnalytics}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={handleShare}>
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
                <Button variant="secondary" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
              )}
              {!isDraft && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleAnalytics}>
                    <BarChart3 className="h-4 w-4" />
                    Аналитика
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    Поделиться
                  </Button>
                </>
              )}
              <Button variant="destructive" size="sm" onClick={handleDelete}>
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
