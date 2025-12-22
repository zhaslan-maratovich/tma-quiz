/**
 * ResultPage Container - компонент с логикой
 */

import { useParams, useNavigate } from 'react-router-dom';
import { usePlayStore } from '@/stores/playStore';
import { useHaptic, usePlayTestQuery, usePlaySessionQuery } from '@/hooks';
import { openTelegramLink, showAlert } from '@/lib/telegram';
import { ResultPageView } from './ResultPage.view';

export function ResultPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const { reset, clearProgress } = usePlayStore();

    // Используем централизованные хуки для запросов
    // sessionResponse имеет формат { completed, canRetake, session }
    const { data: sessionResponse, isLoading } = usePlaySessionQuery(slug);
    const { data: test } = usePlayTestQuery(slug);

    // Извлекаем session из ответа API
    const session = sessionResponse?.session ?? null;
    const canRetake = sessionResponse?.canRetake ?? test?.allowRetake ?? false;

    const handleShare = async () => {
        haptic.impact('medium');

        if (!session || !test) return;

        const resultText = session.result?.title || `${session.score}/${session.maxScore}`;
        const shareText = `Я прошёл тест "${test.welcomeScreen?.title}"!\n\nМой результат: ${resultText}\n\nПройди и ты!`;

        const botUsername = import.meta.env.VITE_BOT_USERNAME || 'your_bot';
        const appName = import.meta.env.VITE_APP_NAME || 'app';
        const testLink = `https://t.me/${botUsername}/${appName}?startapp=${slug}`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(testLink)}&text=${encodeURIComponent(shareText)}`;

        openTelegramLink(shareUrl);
    };

    const handleRetake = async () => {
        if (!canRetake) {
            await showAlert('Повторное прохождение недоступно');
            return;
        }

        haptic.impact('light');
        reset();
        clearProgress(slug!);
        navigate(`/play/${slug}`);
    };

    const handleGoHome = () => {
        haptic.impact('light');
        reset();
        clearProgress(slug!);
        navigate('/');
    };

    const handleGoToTest = () => {
        navigate(`/play/${slug}`);
    };

    return (
        <ResultPageView
            test={test || null}
            session={session}
            isLoading={isLoading}
            canRetake={canRetake}
            onShare={handleShare}
            onRetake={handleRetake}
            onGoHome={handleGoHome}
            onGoToTest={handleGoToTest}
        />
    );
}
