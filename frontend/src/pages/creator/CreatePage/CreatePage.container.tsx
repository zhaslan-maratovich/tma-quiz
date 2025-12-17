/**
 * CreatePage Container - компонент с логикой
 */

import { useNavigate } from 'react-router-dom';
import { useCreateTest } from '@/hooks/useTests';
import { useBackButton } from '@/hooks/useTelegram';
import { haptic } from '@/lib/telegram';
import { CreatePageView } from './CreatePage.view';
import type { TestType } from '@/types';

/**
 * Получить название по умолчанию для типа теста
 */
function getDefaultTitle(type: TestType): string {
    switch (type) {
        case 'quiz':
            return 'Новая викторина';
        case 'personality':
            return 'Тест личности';
        case 'branching':
            return 'Интерактивная история';
        default:
            return 'Новый тест';
    }
}

export function CreatePage() {
    const navigate = useNavigate();
    const createTest = useCreateTest();

    useBackButton(() => navigate(-1));

    const handleSelectType = async (type: TestType) => {
        haptic.impact('medium');

        try {
            const test = await createTest.mutateAsync({
                type,
                welcomeScreen: {
                    title: getDefaultTitle(type),
                    buttonText: 'Начать',
                },
            });

            haptic.notification('success');
            navigate(`/tests/${test.id}/edit`);
        } catch (error) {
            haptic.notification('error');
            console.error('Failed to create test:', error);
        }
    };

    return <CreatePageView isCreating={createTest.isPending} onSelectType={handleSelectType} />;
}
