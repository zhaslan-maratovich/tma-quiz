/**
 * HomePage Container - компонент с бизнес-логикой
 */

import { useNavigate } from 'react-router-dom';
import { useTests, useDeleteTest } from '@/hooks/useTests';
import { useAuth } from '@/hooks/useAuth';
import { haptic, showConfirm } from '@/lib/telegram';
import { HomePageView } from './HomePage.view';

export function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: tests, isLoading, error } = useTests();
    const deleteTest = useDeleteTest();

    const greeting = user?.firstName ? `Привет, ${user.firstName}!` : 'Привет!';

    const handleCreateTest = () => {
        haptic.impact('medium');
        navigate('/create');
    };

    const handleDeleteTest = async (id: string) => {
        const confirmed = await showConfirm('Удалить этот тест? Это действие нельзя отменить.');
        if (confirmed) {
            haptic.notification('warning');
            deleteTest.mutate(id);
        }
    };

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <HomePageView
            greeting={greeting}
            tests={tests || []}
            isLoading={isLoading}
            error={error}
            onCreateTest={handleCreateTest}
            onDeleteTest={handleDeleteTest}
            onRetry={handleRetry}
        />
    );
}
