/**
 * Типы для WelcomePage
 */

import type { TestType } from '@/types';

/**
 * Props для View компонента WelcomePage
 * Содержит только примитивы, необходимые для отображения
 */
export interface WelcomePageViewProps {
    // Данные теста
    /** Тип теста */
    testType: TestType;
    /** Заголовок теста */
    title: string;
    /** Описание теста */
    description?: string;
    /** URL изображения обложки */
    coverImageUrl?: string;
    /** Количество вопросов */
    questionsCount: number;
    /** Можно ли пройти тест повторно */
    canRetake: boolean;

    // Состояние сессии
    /** Есть завершённая сессия */
    hasCompletedSession: boolean;

    // Колбэки
    /** Посмотреть результат прошлой сессии */
    onViewResult: () => void;
}
