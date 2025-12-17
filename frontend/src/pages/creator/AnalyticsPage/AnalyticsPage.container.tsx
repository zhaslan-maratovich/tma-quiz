/**
 * AnalyticsPage Container - компонент с логикой
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useTest, useTestAnalytics } from '@/hooks/useTests';
import { useBackButton, useHaptic } from '@/hooks/useTelegram';
import { AnalyticsPageView } from './AnalyticsPage.view';

export function AnalyticsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const haptic = useHaptic();

    const { data: test, isLoading: testLoading } = useTest(id!);
    const { data: analytics, isLoading: analyticsLoading } = useTestAnalytics(id!);

    useBackButton(() => navigate('/'));

    const isLoading = testLoading || analyticsLoading;

    const handleShare = () => {
        haptic.impact('light');
        navigate(`/tests/${id}/share`);
    };

    return (
        <AnalyticsPageView
            test={test || null}
            analytics={analytics || null}
            isLoading={isLoading}
            onShare={handleShare}
        />
    );
}
