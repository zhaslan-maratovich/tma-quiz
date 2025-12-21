/// <reference types="vite/client" />

/**
 * Типизация переменных окружения Vite
 */
interface ImportMetaEnv {
    /** URL API сервера */
    readonly VITE_API_URL: string;
    /** Включить MSW для мокирования API */
    readonly VITE_ENABLE_MOCKS: string;
    /** Тестовые initData для разработки */
    readonly VITE_DEV_INIT_DATA?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
