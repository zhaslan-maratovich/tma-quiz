/**
 * Типы для StatCard компонента
 */

/**
 * Цветовая схема карточки
 */
export type StatCardColor = 'primary' | 'emerald' | 'violet' | 'amber';

/**
 * Props для StatCard View компонента
 */
export interface StatCardViewProps {
  /** Иконка */
  icon: React.ReactNode;
  /** Значение (число или строка) */
  value: string | number;
  /** Подпись */
  label: string;
  /** Цветовая схема */
  color: StatCardColor;
}
