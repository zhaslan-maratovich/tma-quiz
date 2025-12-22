/**
 * WelcomePage Container - компонент с логикой
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayStore } from '@/stores/playStore';
import { useMainButton, useHaptic, usePlayTest, useExistingSession, useStartTest } from '@/hooks';
import { WelcomePageView } from './WelcomePage.view';

export function WelcomePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const { setTest, startTest, loadProgress } = usePlayStore();

    // Используем централизованные хуки для запросов
    const { data: testData, isLoading: isTestLoading, error: testError } = usePlayTest(slug);
    const { data: existingSession } = useExistingSession(slug);

    // Мутация для начала теста
    const startTestMutation = useStartTest(slug);

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

    // Use Telegram MainButton
    useMainButton({
        text: existingSession?.completedAt && !testData?.allowRetake
            ? 'Посмотреть результат'
            : testData?.welcomeScreen?.buttonText || 'Начать',
        onClick: existingSession?.completedAt && !testData?.allowRetake ? handleViewResult : handleStart,
        options: { enabled: !!testData && !isTestLoading }
    });

    return (
        <WelcomePageView
            test={testData || null}
            existingSession={existingSession || null}
            isLoading={isTestLoading}
            error={testError}
            isStarting={startTestMutation.isPending}
            onStart={handleStart}
            onViewResult={handleViewResult}
        />
    );
}
