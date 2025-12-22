/**
 * WelcomePage Container - компонент с логикой
 */

import { useEffect } from 'react';
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
    const { data: existingSession } = usePlaySessionQuery(slug);

    // Мутация для начала теста
    const startTestMutation = useStartTestMutation(slug);

    // Load saved progress when test data is available
    useEffect(() => {
        if (testData && slug) {
            setTest(testData);
            loadProgress(slug);
        }
    }, [testData, slug, setTest, loadProgress]);

    const handleStart = () => {
        haptic.impact('medium');
        startTestMutation.mutate(undefined, {
            onSuccess: (result) => {
                if (result.sessionId) {
                    startTest();
                    haptic.notification('success');
                    navigate(`/play/${slug}/question`);
                }
            },
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
    const hasCompletedSession = Boolean(existingSession?.completedAt);
    const canRetake = Boolean(testData?.allowRetake);
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
