/**
 * Хуки для EditTestPage
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTest, useUpdateTest, usePublishTest } from '@/hooks/useTests';
import { useBackButton, useHaptic } from '@/hooks/useTelegram';
import { questionsApi, answersApi } from '@/api';
import { showConfirm, showAlert } from '@/lib/telegram';
import type { Answer } from '@/types';

/**
 * Хук для управления формой редактирования теста
 */
export function useEditTestForm(testId: string) {
    const queryClient = useQueryClient();
    const haptic = useHaptic();
    const navigate = useNavigate();

    // Получение данных теста
    const { data: test, isLoading, error } = useTest(testId);
    const updateTest = useUpdateTest(testId);
    const publishTest = usePublishTest();

    // Состояние формы
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [buttonText, setButtonText] = useState('Начать');
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Загрузка данных в форму
    useEffect(() => {
        if (test?.welcomeScreen) {
            setTitle(test.welcomeScreen.title);
            setDescription(test.welcomeScreen.description || '');
            setButtonText(test.welcomeScreen.buttonText);
        }
    }, [test]);

    // Автосохранение
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

    // Back button handler
    useBackButton(() => {
        if (hasChanges) {
            handleSave();
        }
        navigate(-1);
    });

    // Debounced auto-save
    useEffect(() => {
        if (!hasChanges) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 2000);

        return () => clearTimeout(timer);
    }, [title, description, buttonText, hasChanges, handleSave]);

    // Изменение полей формы
    const handleTitleChange = (value: string) => {
        setTitle(value);
        setHasChanges(true);
    };

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        setHasChanges(true);
    };

    const handleButtonTextChange = (value: string) => {
        setButtonText(value);
        setHasChanges(true);
    };

    // ========== Мутации для вопросов ==========

    const createQuestion = useMutation({
        mutationFn: (text: string) => questionsApi.createQuestion(testId, { text }),
        onSuccess: (newQuestion) => {
            queryClient.invalidateQueries({ queryKey: ['tests', testId] });
            haptic.notification('success');
            setEditingQuestionId(newQuestion.id);
        },
    });

    const updateQuestion = useMutation({
        mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
            questionsApi.updateQuestion(questionId, { text }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests', testId] });
        },
    });

    const deleteQuestion = useMutation({
        mutationFn: (questionId: string) => questionsApi.deleteQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests', testId] });
            haptic.notification('success');
        },
    });

    // ========== Мутации для ответов ==========

    const createAnswer = useMutation({
        mutationFn: ({ questionId, text }: { questionId: string; text: string }) =>
            answersApi.createAnswer(questionId, { text }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests', testId] });
        },
    });

    const updateAnswer = useMutation({
        mutationFn: ({
            answerId,
            text,
            isCorrect,
        }: {
            answerId: string;
            text?: string;
            isCorrect?: boolean;
        }) => answersApi.updateAnswer(answerId, { text, isCorrect }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests', testId] });
        },
    });

    const deleteAnswer = useMutation({
        mutationFn: (answerId: string) => answersApi.deleteAnswer(answerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests', testId] });
        },
    });

    // ========== Обработчики событий ==========

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

    const handleToggleQuestion = (questionId: string) => {
        setEditingQuestionId(editingQuestionId === questionId ? null : questionId);
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
            isCorrect: !answer.isCorrect,
        });
    };

    const handleDeleteAnswer = async (answerId: string) => {
        haptic.impact('light');
        await deleteAnswer.mutateAsync(answerId);
    };

    const handlePublish = async () => {
        if (!test) return;

        // Валидация
        const questions = test.questions || [];
        if (questions.length === 0) {
            await showAlert('Добавьте хотя бы один вопрос');
            return;
        }

        const hasAllAnswers = questions.every((q) => q.answers && q.answers.length >= 2);
        if (!hasAllAnswers) {
            await showAlert('Каждый вопрос должен иметь минимум 2 ответа');
            return;
        }

        if (test.type === 'quiz') {
            const hasCorrectAnswers = questions.every((q) => q.answers?.some((a) => a.isCorrect));
            if (!hasCorrectAnswers) {
                await showAlert('Отметьте правильный ответ для каждого вопроса');
                return;
            }
        }

        const confirmed = await showConfirm(
            'Опубликовать тест? После публикации редактирование будет недоступно.'
        );
        if (confirmed) {
            try {
                await publishTest.mutateAsync(testId);
                haptic.notification('success');
                navigate(`/tests/${testId}/share`);
            } catch (e) {
                haptic.notification('error');
                console.error(e);
            }
        }
    };

    const handlePreview = () => {
        haptic.impact('light');
        navigate(`/tests/${testId}/preview`);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return {
        // Данные
        test,
        isLoading,
        error,

        // Состояние формы
        title,
        description,
        buttonText,
        editingQuestionId,
        isSaving,
        hasChanges,
        isPublishing: publishTest.isPending,
        isAddingQuestion: createQuestion.isPending,

        // Обработчики формы
        onTitleChange: handleTitleChange,
        onDescriptionChange: handleDescriptionChange,
        onButtonTextChange: handleButtonTextChange,

        // Обработчики вопросов
        onAddQuestion: handleAddQuestion,
        onUpdateQuestion: handleUpdateQuestion,
        onDeleteQuestion: handleDeleteQuestion,
        onToggleQuestion: handleToggleQuestion,

        // Обработчики ответов
        onAddAnswer: handleAddAnswer,
        onUpdateAnswer: handleUpdateAnswer,
        onToggleCorrect: handleToggleCorrect,
        onDeleteAnswer: handleDeleteAnswer,

        // Действия
        onPublish: handlePublish,
        onPreview: handlePreview,
        onGoHome: handleGoHome,
    };
}
