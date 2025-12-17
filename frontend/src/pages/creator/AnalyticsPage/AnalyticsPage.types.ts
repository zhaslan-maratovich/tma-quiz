/**
 * Типы для AnalyticsPage
 */

import type { Test, TestAnalytics } from '@/types';

/**
 * Props для View компонента AnalyticsPage
 */
export interface AnalyticsPageViewProps {
  /** Данные теста */
  test: Test | null;
  /** Данные аналитики */
  analytics: TestAnalytics | null;
  /** Загрузка */
  isLoading: boolean;

  // Колбэки
  /** Поделиться */
  onShare: () => void;
}
