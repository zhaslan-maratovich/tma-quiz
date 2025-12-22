/**
 * QuestionPage Container - компонент с логикой
 */

import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayStore } from '@/stores/playStore';
import { useBackButton, useHaptic, useSubmitAnswersMutation, usePlayTestQuery } from '@/hooks';
import { QuestionPageView } from './QuestionPage.view';
import type { PlayAnswer } from '@/types';

export function QuestionPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const {
        test,
        setTest,
        currentQuestionIndex,
        answers,
        getCurrentQuestion,
        getSelectedAnswer,
        selectAnswer,
        nextQuestion,
        previousQuestion,
        canGoPrevious,
        getProgress,
        saveProgress,
        completeTest,
    } = usePlayStore();

    // Загружаем тест если его нет в store (например, при прямом переходе или перезагрузке)
    const { data: testData, isLoading: isTestLoading } = usePlayTestQuery(slug);

    console.log('[QuestionPage] Render:', {
        testInStore: !!test,
        testData: !!testData,
        isTestLoading,
        currentQuestionIndex,
    });

    // Синхронизируем тест в store когда он загружен
    useEffect(() => {
        if (testData && !test) {
            console.log('[QuestionPage] Setting test from query to store');
            setTest(testData);
        }
    }, [testData, test, setTest]);

    // Используем тест из store или из query
    const activeTest = test ?? testData;

    const currentQuestion = getCurrentQuestion();
    const selectedAnswerId = currentQuestion ? getSelectedAnswer(currentQuestion.id) : null;
    const progress = getProgress();
    const isLastQuestion = activeTest ? currentQuestionIndex === activeTest.questions.length - 1 : false;

    // Используем централизованный хук для отправки ответов
    const submitMutation = useSubmitAnswersMutation(slug);

    // Save progress periodically
    useEffect(() => {
        if (slug) {
            saveProgress(slug);
        }
    }, [currentQuestionIndex, answers, slug, saveProgress]);

    // Back button handler
    useBackButton(
        useCallback(() => {
            if (canGoPrevious()) {
                previousQuestion();
                haptic.impact('light');
            } else {
                navigate(`/play/${slug}`);
            }
        }, [canGoPrevious, previousQuestion, navigate, slug, haptic]),
        true
    );

    // Redirect if no test data available after loading
    useEffect(() => {
        // Если тест уже есть - не редиректим
        if (activeTest) return;

        // Ждём пока загрузка завершится
        if (isTestLoading) return;

        // Если тест не загружен и не в store - редиректим
        console.log('[QuestionPage] No test data, redirecting to welcome');
        navigate(`/play/${slug}`, { replace: true });
    }, [activeTest, isTestLoading, navigate, slug]);
    const handleSelectAnswer = (answer: PlayAnswer) => {
        if (!currentQuestion) return;
        haptic.selection();
        selectAnswer(currentQuestion.id, answer.id);
    };

    const handleNext = () => {
        if (!selectedAnswerId) return;

        haptic.impact('light');

        if (isLastQuestion) {
            submitMutation.mutate(
                { answers },
                {
                    onSuccess: () => {
                        completeTest();
                        haptic.notification('success');
                        navigate(`/play/${slug}/result`);
                    },
                    onError: () => {
                        haptic.notification('error');
                    },
                }
            );
        } else {
            nextQuestion();
        }
    };

    const handlePrevious = () => {
        if (canGoPrevious()) {
            haptic.impact('light');
            previousQuestion();
        }
    };

    // Показываем загрузку только если нет теста в store И идёт загрузка
    if (!activeTest) {
        if (isTestLoading) {
            return <QuestionPageView.Skeleton />;
        }
        // Если не загружается и нет теста - useEffect сделает редирект
        return <QuestionPageView.Skeleton />;
    }

    return (
        <QuestionPageView
            test={activeTest}
            currentQuestion={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={activeTest.questions.length}
            progress={progress}
            selectedAnswerId={selectedAnswerId}
            canGoBack={canGoPrevious()}
            isLastQuestion={isLastQuestion}
            isSubmitting={submitMutation.isPending}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
        />
    );
}
