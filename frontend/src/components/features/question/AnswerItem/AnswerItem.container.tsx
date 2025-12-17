/**
 * AnswerItem Container - компонент с логикой
 */

import { useState } from 'react';
import { AnswerItemView } from './AnswerItem.view';
import type { AnswerItemContainerProps } from './AnswerItem.types';

export function AnswerItem({
    answer,
    testType,
    disabled,
    onUpdateAnswer,
    onToggleCorrect,
    onDelete,
}: AnswerItemContainerProps) {
    const [localText, setLocalText] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // При редактировании используем локальный текст, иначе из props
    const displayText = isEditing ? localText : answer.text;

    const handleStartEdit = () => {
        setLocalText(answer.text);
        setIsEditing(true);
    };

    const handleBlur = () => {
        if (localText !== answer.text && localText.trim()) {
            onUpdateAnswer(answer.id, localText);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    return (
        <AnswerItemView
            answerText={answer.text}
            editingText={displayText}
            isCorrect={answer.isCorrect}
            testType={testType}
            isEditing={isEditing}
            disabled={disabled}
            onStartEdit={handleStartEdit}
            onTextChange={setLocalText}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onToggleCorrect={onToggleCorrect}
            onDelete={onDelete}
        />
    );
}
