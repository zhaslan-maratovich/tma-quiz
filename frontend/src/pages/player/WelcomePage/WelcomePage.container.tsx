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
        data: test,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['play', slug],
        queryFn: () => playApi.getTestBySlug(slug!),
        enabled: !!slug,
    });

    // Check existing session
    const { data: existingSession } = useQuery({
        queryKey: ['play', slug, 'session'],
        queryFn: () => playApi.getExistingSession(slug!),
        enabled: !!slug,
    });

    // Start test mutation
    const startTestMutation = useMutation({
        mutationFn: () => playApi.startTest(slug!),
        onSuccess: (result) => {
            if (result.sessionId) {
                if (test) {
                    setTest(test);
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
        if (test) {
            setTest(test);
            loadProgress(slug!);
        }
    }, [test, setTest, loadProgress, slug]);

    const handleStart = () => {
        haptic.impact('medium');
        startTestMutation.mutate();
    };

    const handleViewResult = () => {
        haptic.impact('light');
        navigate(`/play/${slug}/result`);
    };

    // Use Telegram MainButton
    useMainButton(
        existingSession?.completedAt && !test?.allowRetake
            ? 'Посмотреть результат'
            : test?.welcomeScreen?.buttonText || 'Начать',
        existingSession?.completedAt && !test?.allowRetake ? handleViewResult : handleStart,
        { enabled: !!test && !isLoading }
    );

    return (
        <WelcomePageView
            test={test || null}
            existingSession={existingSession || null}
            isLoading={isLoading}
            error={error}
            isStarting={startTestMutation.isPending}
            onStart={handleStart}
            onViewResult={handleViewResult}
        />
    );
}
