/**
 * EditTestPage Container - компонент с логикой
 */

import { useParams } from 'react-router-dom';
import { useEditTestForm } from './EditTestPage.hooks';
import { EditTestPageView } from './EditTestPage.view';

export function EditTestPage() {
  const { id } = useParams<{ id: string }>();

  const {
    test,
    isLoading,
    error,
    title,
    description,
    buttonText,
    editingQuestionId,
    isSaving,
    hasChanges,
    isPublishing,
    onTitleChange,
    onDescriptionChange,
    onButtonTextChange,
    onAddQuestion,
    onUpdateQuestion,
    onDeleteQuestion,
    onToggleQuestion,
    onAddAnswer,
    onUpdateAnswer,
    onToggleCorrect,
    onDeleteAnswer,
    onPublish,
    onPreview,
    onGoHome,
  } = useEditTestForm(id!);

  return (
    <EditTestPageView
      test={test || null}
      isLoading={isLoading}
      error={error}
      title={title}
      description={description}
      buttonText={buttonText}
      editingQuestionId={editingQuestionId}
      isSaving={isSaving}
      hasChanges={hasChanges}
      isPublishing={isPublishing}
      onTitleChange={onTitleChange}
      onDescriptionChange={onDescriptionChange}
      onButtonTextChange={onButtonTextChange}
      onAddQuestion={onAddQuestion}
      onUpdateQuestion={onUpdateQuestion}
      onDeleteQuestion={onDeleteQuestion}
      onToggleQuestion={onToggleQuestion}
      onAddAnswer={onAddAnswer}
      onUpdateAnswer={onUpdateAnswer}
      onToggleCorrect={onToggleCorrect}
      onDeleteAnswer={onDeleteAnswer}
      onPublish={onPublish}
      onPreview={onPreview}
      onGoHome={onGoHome}
    />
  );
}
