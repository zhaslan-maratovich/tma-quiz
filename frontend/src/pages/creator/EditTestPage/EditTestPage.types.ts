/**
 * Типы для EditTestPage
 */

import type { Test, Answer } from '@/types';

/**
 * Props для View компонента EditTestPage
 */
export interface EditTestPageViewProps {
  /** Данные теста */
  test: Test | null;
  /** Загрузка данных */
  isLoading: boolean;
  /** Ошибка загрузки */
  error: Error | null;

  // Состояние формы
  /** Название теста */
  title: string;
  /** Описание теста */
  description: string;
  /** Текст кнопки */
  buttonText: string;
  /** ID редактируемого вопроса */
  editingQuestionId: string | null;
  /** Идёт сохранение */
  isSaving: boolean;
  /** Есть несохранённые изменения */
  hasChanges: boolean;
  /** Идёт публикация */
  isPublishing: boolean;

  // Колбэки - форма
  /** Изменение названия */
  onTitleChange: (value: string) => void;
  /** Изменение описания */
  onDescriptionChange: (value: string) => void;
  /** Изменение текста кнопки */
  onButtonTextChange: (value: string) => void;

  // Колбэки - вопросы
  /** Добавить вопрос */
  onAddQuestion: () => void;
  /** Обновить вопрос */
  onUpdateQuestion: (questionId: string, text: string) => void;
  /** Удалить вопрос */
  onDeleteQuestion: (questionId: string) => void;
  /** Переключить раскрытие вопроса */
  onToggleQuestion: (questionId: string) => void;

  // Колбэки - ответы
  /** Добавить ответ */
  onAddAnswer: (questionId: string) => void;
  /** Обновить ответ */
  onUpdateAnswer: (answerId: string, text: string) => void;
  /** Переключить правильность ответа */
  onToggleCorrect: (answer: Answer) => void;
  /** Удалить ответ */
  onDeleteAnswer: (answerId: string) => void;

  // Колбэки - действия
  /** Публикация теста */
  onPublish: () => void;
  /** Предпросмотр */
  onPreview: () => void;
  /** Домой */
  onGoHome: () => void;
}

/**
 * Состояние формы редактирования
 */
export interface EditFormState {
  title: string;
  description: string;
  buttonText: string;
  editingQuestionId: string | null;
  hasChanges: boolean;
  isSaving: boolean;
}
