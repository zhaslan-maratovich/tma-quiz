/**
 * Типы для QuestionPage
 */

import type { PlayTest, PlayQuestion, PlayAnswer } from '@/types';

/**
 * Props для View компонента QuestionPage
 */
export interface QuestionPageViewProps {
    /** Данные теста */
    test: PlayTest | null;
    /** Текущий вопрос */
    currentQuestion: PlayQuestion | null;
    /** Индекс текущего вопроса */
    currentIndex: number;
    /** Общее количество вопросов */
    totalQuestions: number;
    /** Прогресс (0-100) */
    progress: number;
    /** ID выбранного ответа */
    selectedAnswerId: string | null;
    /** Можно ли вернуться назад */
    canGoBack: boolean;
    /** Последний вопрос */
    isLastQuestion: boolean;
    /** Идёт отправка */
    isSubmitting: boolean;

    // Колбэки
    /** Выбрать ответ */
    onSelectAnswer: (answer: PlayAnswer) => void;
    /** Далее */
    onNext: () => void;
    /** Назад */
    onPrevious: () => void;
}
