/**
 * Типы для HomePage
 */

import type { Test } from '@/types';

/**
 * Props для View компонента HomePage
 */
export interface HomePageViewProps {
  /** Приветствие пользователя */
  greeting: string;
  /** Список тестов */
  tests: Test[];
  /** Загрузка */
  isLoading: boolean;
  /** Ошибка */
  error: Error | null;

  // Колбэки
  /** Создать тест */
  onCreateTest: () => void;
  /** Удалить тест */
  onDeleteTest: (id: string) => void;
  /** Повторная загрузка */
  onRetry: () => void;
}
