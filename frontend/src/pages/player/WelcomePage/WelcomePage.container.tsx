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

    const handleStart = () => {
        if (startTestMutation.isPending || isNavigatingRef.current) return;

        isNavigatingRef.current = true;
        haptic.impact('medium');

        startTestMutation.mutate(undefined, {
            onSuccess: (result) => {
                console.log('[WelcomePage] Start test success:', result);
                if (result.sessionId) {
                    startTest();
                    haptic.notification('success');

                    const targetUrl = `/play/${slug}/question`;
                    console.log('[WelcomePage] Navigating to:', targetUrl);

                    // Пробуем разные способы навигации
                    try {
                        navigate(targetUrl, { replace: true });
                        console.log('[WelcomePage] navigate() called');
                    } catch (e) {
                        console.error('[WelcomePage] navigate() failed:', e);
                        // Fallback: прямой переход
                        window.location.href = targetUrl;
                    }
                } else {
                    console.warn('[WelcomePage] No sessionId in result');
                    isNavigatingRef.current = false;
                }
            },
            onError: (error) => {
                console.error('[WelcomePage] Start test error:', error);
                haptic.notification('error');
                isNavigatingRef.current = false;
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
        options: { enabled: Boolean(testData) && !isTestLoading && !startTestMutation.isPending },
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
