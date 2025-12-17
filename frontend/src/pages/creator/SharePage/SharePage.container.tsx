/**
 * SharePage Container - компонент с логикой
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTest } from '@/hooks/useTests';
import { useBackButton, useHaptic } from '@/hooks/useTelegram';
import { copyToClipboard } from '@/lib/utils';
import { openTelegramLink, showAlert } from '@/lib/telegram';
import { SharePageView } from './SharePage.view';

export function SharePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const { data: test, isLoading } = useTest(id!);
    const [copied, setCopied] = useState(false);

    useBackButton(() => navigate('/'));

    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'your_bot';
    const appName = import.meta.env.VITE_APP_NAME || 'app';
    const testLink = test?.slug
        ? `https://t.me/${botUsername}/${appName}?startapp=${test.slug}`
        : '';

    const handleCopyLink = async () => {
        const success = await copyToClipboard(testLink);
        if (success) {
            haptic.notification('success');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            haptic.notification('error');
            await showAlert('Не удалось скопировать ссылку');
        }
    };

    const handleShareTelegram = () => {
        haptic.impact('medium');
        const shareText = `${test?.welcomeScreen?.title}\n\nПройди тест!`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(testLink)}&text=${encodeURIComponent(shareText)}`;
        openTelegramLink(shareUrl);
    };

    const handleOpenTest = () => {
        haptic.impact('light');
        window.open(testLink, '_blank');
    };

    const handleShowQR = () => {
        haptic.impact('light');
        // TODO: Implement QR code modal
    };

    const handleGoToEdit = () => {
        navigate(`/tests/${id}/edit`);
    };

    return (
        <SharePageView
            test={test || null}
            isLoading={isLoading}
            testLink={testLink}
            copied={copied}
            onCopyLink={handleCopyLink}
            onShareTelegram={handleShareTelegram}
            onOpenTest={handleOpenTest}
            onShowQR={handleShowQR}
            onGoToEdit={handleGoToEdit}
        />
    );
}
