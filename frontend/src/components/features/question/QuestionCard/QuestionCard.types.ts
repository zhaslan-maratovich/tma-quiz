/**
 * Типы для QuestionCard компонента
 */

import type { Question, Answer, TestType } from '@/types';

/**
 * Props для View компонента QuestionCard
 */
export interface QuestionCardViewProps {
  /** Номер вопроса (1-based) */
  questionNumber: number;
  /** Текст вопроса */
  questionText: string;
  /** Редактируемый текст вопроса */
  editingText: string;
  /** Ответы на вопрос */
  answers: Answer[];
  /** Тип теста */
  testType: TestType;
  /** Есть ли правильный ответ (для quiz) */
  hasCorrectAnswer: boolean;
  /** Развёрнут ли вопрос */
  isExpanded: boolean;
  /** Редактируется ли текст вопроса */
  isEditingQuestion: boolean;
  /** Заблокирован ли редактор */
  disabled: boolean;

  // Колбэки
  /** Переключение развёрнутости */
  onToggle: () => void;
  /** Начать редактирование вопроса */
  onStartEditQuestion: () => void;
  /** Изменение текста вопроса */
  onQuestionTextChange: (text: string) => void;
  /** Сохранение текста вопроса */
  onQuestionBlur: () => void;
  /** Нажатие Enter при редактировании */
  onQuestionKeyDown: (e: React.KeyboardEvent) => void;
  /** Добавление ответа */
  onAddAnswer: () => void;
  /** Удаление вопроса */
  onDelete: () => void;
  /** Обновление ответа */
  onUpdateAnswer: (answerId: string, text: string) => void;
  /** Переключение правильного ответа */
  onToggleCorrect: (answer: Answer) => void;
  /** Удаление ответа */
  onDeleteAnswer: (answerId: string) => void;
}

/**
 * Props для Container компонента QuestionCard
 */
export interface QuestionCardContainerProps {
  /** Данные вопроса */
  question: Question;
  /** Номер вопроса (0-based) */
  index: number;
  /** Тип теста */
  testType: TestType;
  /** Развёрнут ли вопрос */
  isExpanded: boolean;
  /** Заблокирован ли редактор */
  disabled: boolean;

  // Колбэки
  /** Переключение развёрнутости */
  onToggle: () => void;
  /** Обновление текста вопроса */
  onUpdateQuestion: (questionId: string, text: string) => void;
  /** Удаление вопроса */
  onDelete: () => void;
  /** Добавление ответа */
  onAddAnswer: () => void;
  /** Обновление ответа */
  onUpdateAnswer: (answerId: string, text: string) => void;
  /** Переключение правильного ответа */
  onToggleCorrect: (answer: Answer) => void;
  /** Удаление ответа */
  onDeleteAnswer: (answerId: string) => void;
}
