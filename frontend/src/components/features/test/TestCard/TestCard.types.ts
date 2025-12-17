/**
 * Типы для TestCard компонента
 */

import type { TestType, TestStatus } from '@/types';

/**
 * Конфигурация типа теста для отображения
 */
export interface TestTypeConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Props для View компонента TestCard
 */
export interface TestCardViewProps {
  /** Название теста */
  title: string;
  /** Описание теста */
  description?: string | null;
  /** Тип теста */
  type: TestType;
  /** Статус теста */
  status: TestStatus;
  /** Количество прохождений */
  sessionsCount: number;
  /** Дата последнего обновления (форматированная) */
  updatedAt: string;
  /** Показывать меню действий */
  showActions: boolean;
  /** Индекс для анимации */
  index?: number;

  // Колбэки
  /** Клик по карточке */
  onCardClick: () => void;
  /** Клик по кнопке "Ещё" */
  onMoreClick: (e: React.MouseEvent) => void;
  /** Редактировать */
  onEdit: (e: React.MouseEvent) => void;
  /** Открыть аналитику */
  onAnalytics: (e: React.MouseEvent) => void;
  /** Поделиться */
  onShare: (e: React.MouseEvent) => void;
  /** Удалить */
  onDelete: (e: React.MouseEvent) => void;
}

/**
 * Props для Container компонента TestCard
 */
export interface TestCardContainerProps {
  /** Данные теста */
  test: {
    id: string;
    type: TestType;
    status: TestStatus;
    updatedAt: string;
    welcomeScreen?: {
      title: string;
      description?: string | null;
    } | null;
    _count?: {
      sessions: number;
    };
  };
  /** Обработчик удаления */
  onDelete?: (id: string) => void;
  /** Индекс для анимации */
  index?: number;
}
