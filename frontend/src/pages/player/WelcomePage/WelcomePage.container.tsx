/**
 * WelcomePage Container - компонент с логикой
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { playApi } from '@/api';
import { usePlayStore } from '@/stores/playStore';
import { useMainButton, useHaptic } from '@/hooks/useTelegram';
import { WelcomePageView } from './WelcomePage.view';

export function WelcomePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const { setTest, startTest, loadProgress } = usePlayStore();

    // Fetch test data
    const {
        data: testData,
        isLoading: isTestLoading,
        error: testError,
    } = useQuery({
        queryKey: ['play', slug],
        queryFn: () => playApi.getTestBySlug(slug!),
        enabled: Boolean(slug),
    });

    // Check existing session
    const { data: existingSession } = useQuery({
        queryKey: ['play', slug, 'session'],
        queryFn: () => playApi.getExistingSession(slug!),
        enabled: Boolean(slug),
    });

    // Start test mutation
    const startTestMutation = useMutation({
        mutationFn: () => playApi.startTest(slug!),
        onSuccess: (result) => {
            if (result.sessionId) {
                if (testData) {
                    setTest(testData);
                }
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

    // Set test data to store
    useEffect(() => {
        if (testData) {
            setTest(testData);
            loadProgress(slug!);
        }
    }, [testData, setTest, loadProgress, slug]);

    const handleStart = () => {
        haptic.impact('medium');
        startTestMutation.mutate();
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
