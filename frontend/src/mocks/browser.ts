/**
 * MSW Browser Setup
 * Настройка Service Worker для перехвата запросов в браузере
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW Worker для браузера
 * Используется для мокирования API запросов в режиме разработки
 */
export const worker = setupWorker(...handlers);

/**
 * Опции для запуска worker
 */
export const workerOptions = {
    // Логирование перехваченных запросов в консоль
    onUnhandledRequest: 'bypass' as const,
    // Уведомление о запуске
    quiet: false,
};
