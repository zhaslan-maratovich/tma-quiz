/**
 * Типы для WelcomePage
 */

import type { PlayTest, UserSession } from '@/types';

/**
 * Props для View компонента WelcomePage
 */
export interface WelcomePageViewProps {
  /** Данные теста */
  test: PlayTest | null;
  /** Существующая сессия */
  existingSession: UserSession | null;
  /** Загрузка */
  isLoading: boolean;
  /** Ошибка */
  error: Error | null;
  /** Идёт запуск теста */
  isStarting: boolean;

  // Колбэки
  /** Начать тест */
  onStart: () => void;
  /** Посмотреть результат */
  onViewResult: () => void;
}
