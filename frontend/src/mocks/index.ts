/**
 * MSW Mock Service Worker
 *
 * Точка входа для настройки MSW.
 * Экспортирует функцию для инициализации мокирования API.
 */

export { handlers } from './handlers';
export * from './data';
export { initMockTelegram } from './telegram';

/**
 * Функция для запуска MSW и мока Telegram в режиме разработки
 * Вызывается перед рендерингом приложения
 */
export async function enableMocking(): Promise<void> {
    // Проверяем, включён ли режим мокирования
    const isMockEnabled = import.meta.env.VITE_ENABLE_MOCKS === 'true';

    if (!isMockEnabled) {
        console.log('[Mocks] Mocking is disabled. Set VITE_ENABLE_MOCKS=true to enable.');
        return;
    }

    // В production моки не используем
    if (import.meta.env.PROD) {
        console.warn('[Mocks] Mocking is disabled in production mode.');
        return;
    }

    // Инициализируем мок Telegram WebApp (если не в реальном Telegram)
    const { initMockTelegram } = await import('./telegram');
    initMockTelegram();

    // Динамический импорт для code-splitting
    const { worker, workerOptions } = await import('./browser');

    // Запускаем Service Worker
    await worker.start(workerOptions);

    // Регистрируем тестовые сценарии в window для отладки
    const { runAllScenarios } = await import('./test-scenarios');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).runMockTests = runAllScenarios;

    console.log('[Mocks] All mocks initialized successfully');
    console.log('[Mocks] Run window.runMockTests() in console to test all API endpoints');
}
