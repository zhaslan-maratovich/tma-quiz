/**
 * WelcomePage Container - компонент с логикой
 *
 * Ответственность: показать приветственный экран теста и обработать начало теста.
 * НЕ отвечает за: подготовку данных для QuestionPage (это делает сам QuestionPage).
 */

import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayStore } from '@/stores/playStore';
import { hideMainButton } from '@/lib/telegram';
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

    const { startTest } = usePlayStore();

    // Загрузка данных о тесте и сессии
    const { data: testData, isLoading: isTestLoading, error: testError } = usePlayTestQuery(slug);
    const { data: sessionResponse } = usePlaySessionQuery(slug);

    // Мутация для начала теста
    const startTestMutation = useStartTestMutation(slug);

    // Флаг для предотвращения двойной навигации
    const isNavigatingRef = useRef(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Вычисляем состояния для отображения
    const hasCompletedSession = sessionResponse?.completed ?? false;
    const canRetake = sessionResponse?.canRetake ?? testData?.allowRetake ?? false;
    const isViewResult = hasCompletedSession && !canRetake;

    const handleStart = () => {
        if (startTestMutation.isPending || isNavigatingRef.current) return;

        isNavigatingRef.current = true;
        setIsNavigating(true);
        hideMainButton();
        haptic.impact('medium');

        startTestMutation.mutate(undefined, {
            onSuccess: (result) => {
                console.log('[WelcomePage] Start test success:', result);
                if (result.sessionId) {
                    startTest();
                    haptic.notification('success');
                    navigate(`/play/${slug}/question`, { replace: true });
                } else {
                    console.warn('[WelcomePage] No sessionId in result');
                    isNavigatingRef.current = false;
                    setIsNavigating(false);
                }
            },
            onError: (error) => {
                console.error('[WelcomePage] Start test error:', error);
                haptic.notification('error');
                isNavigatingRef.current = false;
                setIsNavigating(false);
            },
        });
    };

    const handleViewResult = () => {
        haptic.impact('light');
        navigate(`/play/${slug}/result`);
    };

    // Telegram MainButton
    useMainButton({
        text: isViewResult
            ? 'Посмотреть результат'
            : testData?.welcomeScreen?.buttonText || 'Начать',
        onClick: isViewResult ? handleViewResult : handleStart,
        options: {
            enabled: Boolean(testData) && !isTestLoading && !startTestMutation.isPending && !isNavigating,
        },
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
