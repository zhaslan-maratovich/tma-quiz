/**
 * WelcomePage Container - компонент с логикой
 */

import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayStore } from '@/stores/playStore';
import {
    useMainButton,
    useHaptic,
    usePlayTestQuery,
    usePlaySessionQuery,
    useStartTestMutation,
} from '@/hooks';
import { WelcomePageView } from './WelcomePage.view';

export function WelcomePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const { setTest, startTest, loadProgress } = usePlayStore();

    // Используем централизованные хуки для запросов
    const { data: testData, isLoading: isTestLoading, error: testError } = usePlayTestQuery(slug);
    const { data: sessionResponse } = usePlaySessionQuery(slug);

    // Мутация для начала теста
    const startTestMutation = useStartTestMutation(slug);

    // Флаг для предотвращения двойной навигации
    const isNavigatingRef = useRef(false);

    // Load saved progress when test data is available
    useEffect(() => {
        if (testData && slug) {
            setTest(testData);
            loadProgress(slug);
        }
    }, [testData, slug, setTest, loadProgress]);

    // Навигация после успешного старта теста
    useEffect(() => {
        if (startTestMutation.isSuccess && startTestMutation.data?.sessionId && !isNavigatingRef.current) {
            isNavigatingRef.current = true;
            startTest();
            haptic.notification('success');
            // Используем setTimeout для гарантии что навигация произойдёт после рендера
            setTimeout(() => {
                navigate(`/play/${slug}/question`, { replace: true });
            }, 0);
        }
    }, [startTestMutation.isSuccess, startTestMutation.data, startTest, haptic, navigate, slug]);

    const handleStart = () => {
        if (startTestMutation.isPending || isNavigatingRef.current) return;
        haptic.impact('medium');
        startTestMutation.mutate(undefined, {
            onError: (error) => {
                console.error('Start test error:', error);
                haptic.notification('error');
            },
        });
    };

    const handleViewResult = () => {
        haptic.impact('light');
        navigate(`/play/${slug}/result`);
    };

    // Вычисляем состояния для отображения
    // Backend возвращает { completed, canRetake, session }
    const hasCompletedSession = sessionResponse?.completed ?? false;
    const canRetake = sessionResponse?.canRetake ?? testData?.allowRetake ?? false;
    const isViewResult = hasCompletedSession && !canRetake;

    // Use Telegram MainButton
    useMainButton({
        text: isViewResult
            ? 'Посмотреть результат'
            : testData?.welcomeScreen?.buttonText || 'Начать',
        onClick: isViewResult ? handleViewResult : handleStart,
        options: { enabled: Boolean(testData) && !isTestLoading },
    });

    if (isTestLoading) {
        return <WelcomePageView.Skeleton />;
    }

    if (testError || !testData) {
        return <WelcomePageView.Error />;
    }

    return (
        <WelcomePageView
            testType={testData.type}
            title={testData.welcomeScreen?.title ?? 'Тест'}
            description={testData.welcomeScreen?.description ?? undefined}
            coverImageUrl={testData.welcomeScreen?.imageUrl ?? undefined}
            questionsCount={testData.questionsCount}
            canRetake={canRetake}
            hasCompletedSession={hasCompletedSession}
            onViewResult={handleViewResult}
        />
    );
}
