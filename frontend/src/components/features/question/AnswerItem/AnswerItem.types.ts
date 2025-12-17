/**
 * Типы для AnswerItem компонента
 */

import type { Answer, TestType } from '@/types';

/**
 * Props для View компонента AnswerItem
 */
export interface AnswerItemViewProps {
    /** Текст ответа */
    answerText: string;
    /** Редактируемый текст */
    editingText: string;
    /** Правильный ли ответ */
    isCorrect: boolean;
    /** Тип теста */
    testType: TestType;
    /** Редактируется ли ответ */
    isEditing: boolean;
    /** Заблокирован ли редактор */
    disabled: boolean;

    // Колбэки
    /** Начать редактирование */
    onStartEdit: () => void;
    /** Изменение текста */
    onTextChange: (text: string) => void;
    /** Сохранение (blur) */
    onBlur: () => void;
    /** Нажатие Enter */
    onKeyDown: (e: React.KeyboardEvent) => void;
    /** Переключение правильности */
    onToggleCorrect: () => void;
    /** Удаление */
    onDelete: () => void;
}

/**
 * Props для Container компонента AnswerItem
 */
export interface AnswerItemContainerProps {
    /** Данные ответа */
    answer: Answer;
    /** Тип теста */
    testType: TestType;
    /** Заблокирован ли редактор */
    disabled: boolean;

    // Колбэки
    /** Обновление текста ответа */
    onUpdateAnswer: (answerId: string, text: string) => void;
    /** Переключение правильности */
    onToggleCorrect: () => void;
    /** Удаление ответа */
    onDelete: () => void;
}
