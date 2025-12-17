/**
 * QuestionCard View - презентационный компонент
 */

import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronRight, Plus, Trash2, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { AnswerItem } from '../AnswerItem';
import { cn } from '@/lib/utils';
import type { QuestionCardViewProps } from './QuestionCard.types';

export function QuestionCardView({
  questionNumber,
  questionText,
  editingText,
  answers,
  testType,
  hasCorrectAnswer,
  isExpanded,
  isEditingQuestion,
  disabled,
  onToggle,
  onStartEditQuestion,
  onQuestionTextChange,
  onQuestionBlur,
  onQuestionKeyDown,
  onAddAnswer,
  onDelete,
  onUpdateAnswer,
  onToggleCorrect,
  onDeleteAnswer,
}: QuestionCardViewProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card padding="none" className="overflow-hidden">
        {/* Question header */}
        <button
          onClick={onToggle}
          className="w-full px-4 py-3 flex items-center gap-3 text-left"
        >
          <div className="flex-shrink-0 text-tg-hint">
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-tg-hint">
                Вопрос {questionNumber}
              </span>
              {testType === 'quiz' && !hasCorrectAnswer && (
                <Badge variant="warning" size="sm">
                  Нет ответа
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-tg-text truncate">
              {questionText}
            </p>
          </div>

          <ChevronRight
            className={cn(
              'h-5 w-5 text-tg-hint transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-tg-separator space-y-4">
                {/* Question text editor */}
                {!disabled && (
                  <div>
                    <label className="text-xs font-medium text-tg-hint mb-2 block">
                      Текст вопроса
                    </label>
                    {isEditingQuestion ? (
                      <Textarea
                        value={editingText}
                        onChange={(e) => onQuestionTextChange(e.target.value)}
                        onBlur={onQuestionBlur}
                        onKeyDown={onQuestionKeyDown}
                        placeholder="Введите текст вопроса"
                        rows={2}
                        autoFocus
                        className="text-sm"
                      />
                    ) : (
                      <button
                        onClick={onStartEditQuestion}
                        className="w-full p-3 rounded-xl bg-tg-secondary-bg text-left text-sm text-tg-text hover:bg-tg-secondary-bg/80 transition-colors flex items-center gap-2"
                      >
                        <span className="flex-1">{editingText}</span>
                        <Pencil className="h-4 w-4 text-tg-hint flex-shrink-0" />
                      </button>
                    )}
                  </div>
                )}

                {/* Answers list */}
                <div>
                  <label className="text-xs font-medium text-tg-hint mb-2 block">
                    Варианты ответов
                  </label>
                  <div className="space-y-2">
                    {answers.map((answer) => (
                      <AnswerItem
                        key={answer.id}
                        answer={answer}
                        testType={testType}
                        disabled={disabled}
                        onUpdateAnswer={onUpdateAnswer}
                        onToggleCorrect={() => onToggleCorrect(answer)}
                        onDelete={() => onDeleteAnswer(answer.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {!disabled && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onAddAnswer}
                    >
                      <Plus className="h-4 w-4" />
                      Добавить ответ
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDelete}
                      className="text-tg-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить вопрос
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
