/**
 * Типы для ResultPage
 */

import type { PlayTest, UserSession } from '@/types';

/**
 * Props для View компонента ResultPage
 */
export interface ResultPageViewProps {
  /** Данные теста */
  test: PlayTest | null;
  /** Сессия пользователя */
  session: UserSession | null;
  /** Загрузка */
  isLoading: boolean;
  /** Можно ли пройти заново */
  canRetake: boolean;

  // Колбэки
  /** Поделиться результатом */
  onShare: () => void;
  /** Пройти заново */
  onRetake: () => void;
  /** На главную */
  onGoHome: () => void;
  /** Пройти тест */
  onGoToTest: () => void;
}
