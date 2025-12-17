/**
 * Типы для SharePage
 */

import type { Test } from '@/types';

/**
 * Props для View компонента SharePage
 */
export interface SharePageViewProps {
    /** Данные теста */
    test: Test | null;
    /** Загрузка */
    isLoading: boolean;
    /** Ссылка на тест */
    testLink: string;
    /** Ссылка скопирована */
    copied: boolean;

    // Колбэки
    /** Копировать ссылку */
    onCopyLink: () => void;
    /** Поделиться в Telegram */
    onShareTelegram: () => void;
    /** Открыть тест */
    onOpenTest: () => void;
    /** QR код */
    onShowQR: () => void;
    /** Перейти к редактированию */
    onGoToEdit: () => void;
}
