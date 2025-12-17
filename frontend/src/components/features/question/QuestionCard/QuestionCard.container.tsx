/**
 * QuestionCard Container - компонент с логикой
 */

import { useState } from 'react';
import { QuestionCardView } from './QuestionCard.view';
import type { QuestionCardContainerProps } from './QuestionCard.types';

export function QuestionCard({
  question,
  index,
  testType,
  isExpanded,
  disabled,
  onToggle,
  onUpdateQuestion,
  onDelete,
  onAddAnswer,
  onUpdateAnswer,
  onToggleCorrect,
  onDeleteAnswer,
}: QuestionCardContainerProps) {
  const [localText, setLocalText] = useState('');
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);

  // Текст для редактирования: при редактировании используем локальный, иначе из props
  const questionText = isEditingQuestion ? localText : question.text;

  const answers = question.answers || [];
  const hasCorrectAnswer = answers.some((a) => a.isCorrect);

  const handleStartEdit = () => {
    setLocalText(question.text);
    setIsEditingQuestion(true);
  };

  const handleQuestionBlur = () => {
    if (localText !== question.text && localText.trim()) {
      onUpdateQuestion(question.id, localText);
    }
    setIsEditingQuestion(false);
  };

  const handleQuestionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuestionBlur();
    }
  };

  return (
    <QuestionCardView
      questionNumber={index + 1}
      questionText={question.text}
      editingText={questionText}
      answers={answers}
      testType={testType}
      hasCorrectAnswer={hasCorrectAnswer}
      isExpanded={isExpanded}
      isEditingQuestion={isEditingQuestion}
      disabled={disabled}
      onToggle={onToggle}
      onStartEditQuestion={handleStartEdit}
      onQuestionTextChange={setLocalText}
      onQuestionBlur={handleQuestionBlur}
      onQuestionKeyDown={handleQuestionKeyDown}
      onAddAnswer={onAddAnswer}
      onDelete={onDelete}
      onUpdateAnswer={onUpdateAnswer}
      onToggleCorrect={onToggleCorrect}
      onDeleteAnswer={onDeleteAnswer}
    />
  );
}
