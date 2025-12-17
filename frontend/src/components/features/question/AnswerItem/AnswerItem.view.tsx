/**
 * AnswerItem View - презентационный компонент
 */

import { Check, Trash2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { AnswerItemViewProps } from './AnswerItem.types';

export function AnswerItemView({
  answerText,
  editingText,
  isCorrect,
  testType,
  isEditing,
  disabled,
  onStartEdit,
  onTextChange,
  onBlur,
  onKeyDown,
  onToggleCorrect,
  onDelete,
}: AnswerItemViewProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors',
        isCorrect
          ? 'bg-accent-emerald/10 border border-accent-emerald/30'
          : 'bg-tg-secondary-bg'
      )}
    >
      {/* Correct indicator for quiz */}
      {testType === 'quiz' && (
        <button
          onClick={onToggleCorrect}
          disabled={disabled}
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
            isCorrect
              ? 'bg-accent-emerald border-accent-emerald text-white'
              : 'border-tg-hint hover:border-accent-emerald'
          )}
        >
          {isCorrect && <Check className="h-4 w-4" />}
        </button>
      )}

      {/* Answer text - editable */}
      {disabled ? (
        <span className="flex-1 text-sm text-tg-text">
          {answerText}
        </span>
      ) : isEditing ? (
        <Input
          value={editingText}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder="Введите ответ"
          autoFocus
          className="flex-1 text-sm py-1 h-auto"
        />
      ) : (
        <button
          onClick={onStartEdit}
          className="flex-1 text-left text-sm text-tg-text hover:text-tg-link transition-colors flex items-center gap-2"
        >
          <span className="flex-1">{answerText}</span>
          <Pencil className="h-3 w-3 text-tg-hint opacity-0 group-hover:opacity-100 flex-shrink-0" />
        </button>
      )}

      {/* Delete button */}
      {!disabled && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1 text-tg-hint hover:text-tg-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
