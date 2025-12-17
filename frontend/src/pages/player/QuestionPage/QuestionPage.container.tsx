/**
 * QuestionPage Container - компонент с логикой
 */

import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { playApi } from '@/api';
import { usePlayStore } from '@/stores/playStore';
import { useBackButton, useHaptic } from '@/hooks/useTelegram';
import { QuestionPageView } from './QuestionPage.view';
import type { PlayAnswer } from '@/types';

export function QuestionPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const {
        test,
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

    const currentQuestion = getCurrentQuestion();
    const selectedAnswerId = currentQuestion ? getSelectedAnswer(currentQuestion.id) : null;
    const progress = getProgress();
    const isLastQuestion = test ? currentQuestionIndex === test.questions.length - 1 : false;

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: () => playApi.submitAnswers(slug!, { answers }),
        onSuccess: () => {
            completeTest();
            haptic.notification('success');
            navigate(`/play/${slug}/result`);
        },
        onError: () => {
            haptic.notification('error');
        },
    });

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

    // Redirect if no test
    useEffect(() => {
        if (!test) {
            navigate(`/play/${slug}`);
        }
    }, [test, navigate, slug]);

    const handleSelectAnswer = (answer: PlayAnswer) => {
        if (!currentQuestion) return;
        haptic.selection();
        selectAnswer(currentQuestion.id, answer.id);
    };

    const handleNext = () => {
        if (!selectedAnswerId) return;

        haptic.impact('light');

        if (isLastQuestion) {
            submitMutation.mutate();
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

    return (
        <QuestionPageView
            test={test}
            currentQuestion={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={test?.questions.length || 0}
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
