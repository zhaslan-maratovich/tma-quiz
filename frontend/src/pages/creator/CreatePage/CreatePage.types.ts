/**
 * Типы для CreatePage
 */

import type { TestType } from '@/types';

/**
 * Props для View компонента CreatePage
 */
export interface CreatePageViewProps {
  /** Идёт создание теста */
  isCreating: boolean;

  // Колбэки
  /** Выбор типа теста */
  onSelectType: (type: TestType) => void;
}
