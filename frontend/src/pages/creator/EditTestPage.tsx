/**
 * EditTestPage - Редактор теста
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Eye,
  Rocket,
  AlertCircle,
  Pencil
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer, Header } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTest, useUpdateTest, usePublishTest } from '@/hooks/useTests';
import { useBackButton, useHaptic } from '@/hooks/useTelegram';
import { questionsApi, answersApi } from '@/api';
import { cn } from '@/lib/utils';
import { showConfirm, showAlert } from '@/lib/telegram';
import type { Question, Answer, TestType } from '@/types';

export function EditTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const haptic = useHaptic();

  const { data: test, isLoading, error } = useTest(id!);
  const updateTest = useUpdateTest(id!);
  const publishTest = usePublishTest();

  // Local state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('Начать');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load test data into local state
  useEffect(() => {
    if (test?.welcomeScreen) {
      setTitle(test.welcomeScreen.title);
      setDescription(test.welcomeScreen.description || '');
      setButtonText(test.welcomeScreen.buttonText);
    }
  }, [test]);

  useBackButton(() => {
    if (hasChanges) {
      handleSave();
    }
    navigate(-1);
  });

  // Auto-save on changes
  const handleSave = useCallback(async () => {
    if (!hasChanges || !test) return;

    setIsSaving(true);
    try {
      await updateTest.mutateAsync({
        welcomeScreen: {
          title,
          description: description || null,
          buttonText,
        },
      });
      setHasChanges(false);
      haptic.notification('success');
    } catch (e) {
      haptic.notification('error');
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }, [test, title, description, buttonText, hasChanges, updateTest, haptic]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, description, buttonText, hasChanges, handleSave]);

  const handleFieldChange = (field: 'title' | 'description' | 'buttonText', value: string) => {
    setHasChanges(true);
    if (field === 'title') setTitle(value);
    if (field === 'description') setDescription(value);
    if (field === 'buttonText') setButtonText(value);
  };

  // Question mutations
  const createQuestion = useMutation({
    mutationFn: (text: string) => questionsApi.createQuestion(id!, { text }),
    onSuccess: (newQuestion) => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
      haptic.notification('success');
      // Автоматически открываем новый вопрос для редактирования
      setEditingQuestion(newQuestion.id);
    },
  });

  const updateQuestion = useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
      questionsApi.updateQuestion(questionId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: (questionId: string) => questionsApi.deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
      haptic.notification('success');
    },
  });

  // Answer mutations
  const createAnswer = useMutation({
    mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
      answersApi.createAnswer(questionId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
    },
  });

  const updateAnswer = useMutation({
    mutationFn: ({ answerId, text, isCorrect }: { answerId: string; text?: string; isCorrect?: boolean }) =>
      answersApi.updateAnswer(answerId, { text, isCorrect }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
    },
  });

  const deleteAnswer = useMutation({
    mutationFn: (answerId: string) => answersApi.deleteAnswer(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
    },
  });

  const handleAddQuestion = async () => {
    haptic.impact('medium');
    await createQuestion.mutateAsync('Новый вопрос');
  };

  const handleUpdateQuestion = async (questionId: string, text: string) => {
    await updateQuestion.mutateAsync({ questionId, text });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const confirmed = await showConfirm('Удалить этот вопрос?');
    if (confirmed) {
      haptic.notification('warning');
      await deleteQuestion.mutateAsync(questionId);
    }
  };

  const handleAddAnswer = async (questionId: string) => {
    haptic.impact('light');
    await createAnswer.mutateAsync({ questionId, text: 'Новый ответ' });
  };

  const handleUpdateAnswer = async (answerId: string, text: string) => {
    await updateAnswer.mutateAsync({ answerId, text });
  };

  const handleToggleCorrect = async (answer: Answer) => {
    haptic.selection();
    await updateAnswer.mutateAsync({
      answerId: answer.id,
      isCorrect: !answer.isCorrect
    });
  };

  const handleDeleteAnswer = async (answerId: string) => {
    haptic.impact('light');
    await deleteAnswer.mutateAsync(answerId);
  };

  const handlePublish = async () => {
    if (!test) return;

    // Validate
    const questions = test.questions || [];
    if (questions.length === 0) {
      await showAlert('Добавьте хотя бы один вопрос');
      return;
    }

    const hasAllAnswers = questions.every(q => q.answers && q.answers.length >= 2);
    if (!hasAllAnswers) {
      await showAlert('Каждый вопрос должен иметь минимум 2 ответа');
      return;
    }

    if (test.type === 'quiz') {
      const hasCorrectAnswers = questions.every(q =>
        q.answers?.some(a => a.isCorrect)
      );
      if (!hasCorrectAnswers) {
        await showAlert('Отметьте правильный ответ для каждого вопроса');
        return;
      }
    }

    const confirmed = await showConfirm('Опубликовать тест? После публикации редактирование будет недоступно.');
    if (confirmed) {
      try {
        await publishTest.mutateAsync(id!);
        haptic.notification('success');
        navigate(`/tests/${id}/share`);
      } catch (e) {
        haptic.notification('error');
        console.error(e);
      }
    }
  };

  const handlePreview = () => {
    haptic.impact('light');
    navigate(`/tests/${id}/preview`);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (error || !test) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-tg-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Тест не найден</h2>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </PageContainer>
    );
  }

  const isPublished = test.status === 'published';
  const questions = test.questions || [];

  return (
    <PageContainer
      header={
        <Header
          title="Редактор"
          subtitle={isSaving ? 'Сохранение...' : hasChanges ? 'Изменения' : 'Сохранено'}
          showBack
          rightAction={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={handlePreview}>
                <Eye className="h-5 w-5" />
              </Button>
              {!isPublished && (
                <Button variant="gradient" size="sm" onClick={handlePublish}>
                  <Rocket className="h-4 w-4" />
                  Публикация
                </Button>
              )}
            </div>
          }
        />
      }
      footer={
        !isPublished && (
          <div className="p-4 bg-tg-bg/80 backdrop-blur-xl border-t border-tg-separator">
            <Button
              variant="gradient"
              fullWidth
              onClick={handlePublish}
              loading={publishTest.isPending}
            >
              <Rocket className="h-5 w-5" />
              Опубликовать тест
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6 pb-24">
        {/* Welcome Screen Section */}
        <section>
          <SectionHeader title="Приветствие" />
          <Card>
            <div className="space-y-4">
              {/* Cover image placeholder */}
              <button
                className="w-full aspect-video rounded-xl bg-tg-secondary-bg flex flex-col items-center justify-center gap-2 text-tg-hint hover:bg-tg-secondary-bg/80 transition-colors"
                onClick={() => haptic.impact('light')}
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Добавить обложку</span>
              </button>

              <div>
                <label className="text-sm font-medium text-tg-text mb-2 block">
                  Название теста *
                </label>
                <Input
                  value={title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Введите название"
                  disabled={isPublished}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-tg-text mb-2 block">
                  Описание
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Опишите ваш тест"
                  rows={3}
                  disabled={isPublished}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-tg-text mb-2 block">
                  Текст кнопки
                </label>
                <Input
                  value={buttonText}
                  onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                  placeholder="Начать"
                  disabled={isPublished}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Questions Section */}
        <section>
          <SectionHeader
            title="Вопросы"
            badge={`${questions.length}`}
          />

          <div className="space-y-3">
            <AnimatePresence>
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  testType={test.type}
                  isExpanded={editingQuestion === question.id}
                  onToggle={() => setEditingQuestion(
                    editingQuestion === question.id ? null : question.id
                  )}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDelete={() => handleDeleteQuestion(question.id)}
                  onAddAnswer={() => handleAddAnswer(question.id)}
                  onUpdateAnswer={handleUpdateAnswer}
                  onToggleCorrect={handleToggleCorrect}
                  onDeleteAnswer={handleDeleteAnswer}
                  disabled={isPublished}
                />
              ))}
            </AnimatePresence>
          </div>

          {!isPublished && (
            <Button
              variant="secondary"
              fullWidth
              onClick={handleAddQuestion}
              loading={createQuestion.isPending}
              className="mt-4"
            >
              <Plus className="h-5 w-5" />
              Добавить вопрос
            </Button>
          )}
        </section>

        {/* Results Section - for personality tests */}
        {test.type === 'personality' && (
          <section>
            <SectionHeader
              title="Результаты"
              badge={`${test.results?.length || 0}`}
            />
            <Card>
              <p className="text-sm text-tg-hint">
                Результаты для теста-типологии (в разработке)
              </p>
            </Card>
          </section>
        )}
      </div>
    </PageContainer>
  );
}

// Helper components

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-tg-text">{title}</h2>
      {badge && (
        <Badge variant="secondary">{badge}</Badge>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: Question;
  index: number;
  testType: TestType;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateQuestion: (questionId: string, text: string) => void;
  onDelete: () => void;
  onAddAnswer: () => void;
  onUpdateAnswer: (answerId: string, text: string) => void;
  onToggleCorrect: (answer: Answer) => void;
  onDeleteAnswer: (answerId: string) => void;
  disabled: boolean;
}

function QuestionCard({
  question,
  index,
  testType,
  isExpanded,
  onToggle,
  onUpdateQuestion,
  onDelete,
  onAddAnswer,
  onUpdateAnswer,
  onToggleCorrect,
  onDeleteAnswer,
  disabled,
}: QuestionCardProps) {
  const [questionText, setQuestionText] = useState(question.text);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const answers = question.answers || [];
  const hasCorrectAnswer = answers.some(a => a.isCorrect);

  // Sync question text with prop
  useEffect(() => {
    setQuestionText(question.text);
  }, [question.text]);

  const handleQuestionBlur = () => {
    if (questionText !== question.text && questionText.trim()) {
      onUpdateQuestion(question.id, questionText);
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
                Вопрос {index + 1}
              </span>
              {testType === 'quiz' && !hasCorrectAnswer && (
                <Badge variant="warning" size="sm">
                  Нет ответа
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-tg-text truncate">
              {question.text}
            </p>
          </div>

          <ChevronRight
            className={cn(
              "h-5 w-5 text-tg-hint transition-transform",
              isExpanded && "rotate-90"
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
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        onBlur={handleQuestionBlur}
                        onKeyDown={handleQuestionKeyDown}
                        placeholder="Введите текст вопроса"
                        rows={2}
                        autoFocus
                        className="text-sm"
                      />
                    ) : (
                      <button
                        onClick={() => setIsEditingQuestion(true)}
                        className="w-full p-3 rounded-xl bg-tg-secondary-bg text-left text-sm text-tg-text hover:bg-tg-secondary-bg/80 transition-colors flex items-center gap-2"
                      >
                        <span className="flex-1">{questionText}</span>
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
                        onUpdateAnswer={onUpdateAnswer}
                        onToggleCorrect={() => onToggleCorrect(answer)}
                        onDelete={() => onDeleteAnswer(answer.id)}
                        disabled={disabled}
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

interface AnswerItemProps {
  answer: Answer;
  testType: TestType;
  onUpdateAnswer: (answerId: string, text: string) => void;
  onToggleCorrect: () => void;
  onDelete: () => void;
  disabled: boolean;
}

function AnswerItem({
  answer,
  testType,
  onUpdateAnswer,
  onToggleCorrect,
  onDelete,
  disabled,
}: AnswerItemProps) {
  const [answerText, setAnswerText] = useState(answer.text);
  const [isEditing, setIsEditing] = useState(false);

  // Sync answer text with prop
  useEffect(() => {
    setAnswerText(answer.text);
  }, [answer.text]);

  const handleBlur = () => {
    if (answerText !== answer.text && answerText.trim()) {
      onUpdateAnswer(answer.id, answerText);
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
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors",
        answer.isCorrect
          ? "bg-accent-emerald/10 border border-accent-emerald/30"
          : "bg-tg-secondary-bg"
      )}
    >
      {/* Correct indicator for quiz */}
      {testType === 'quiz' && (
        <button
          onClick={onToggleCorrect}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
            answer.isCorrect
              ? "bg-accent-emerald border-accent-emerald text-white"
              : "border-tg-hint hover:border-accent-emerald"
          )}
        >
          {answer.isCorrect && <Check className="h-4 w-4" />}
        </button>
      )}

      {/* Answer text - editable */}
      {disabled ? (
        <span className="flex-1 text-sm text-tg-text">
          {answer.text}
        </span>
      ) : isEditing ? (
        <Input
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Введите ответ"
          autoFocus
          className="flex-1 text-sm py-1 h-auto"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
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
