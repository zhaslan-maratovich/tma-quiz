/**
 * Hook для работы с Telegram WebApp
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    getTelegramWebApp,
    getInitData,
    getTelegramUser,
    isTelegramWebApp,
    haptic,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
} from '@/lib/telegram';

export function useTelegram() {
    // Используем ленивую инициализацию для начальных значений
    // Это позволяет избежать синхронного setState в useEffect
    const [isReady] = useState(() => {
        // В dev mode сразу готовы
        return !isTelegramWebApp() || Boolean(getTelegramWebApp());
    });

    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() => {
        // Получаем начальное значение цветовой схемы синхронно
        const webApp = getTelegramWebApp();
        return webApp?.colorScheme ?? 'light';
    });

    useEffect(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            // Подписываемся на изменения темы (асинхронные события)
            const handleThemeChange = () => {
                setColorScheme(webApp.colorScheme);
            };

            webApp.onEvent('themeChanged', handleThemeChange);

            return () => {
                webApp.offEvent('themeChanged', handleThemeChange);
            };
        }
    }, []);

    return {
        isReady,
        isTelegram: isTelegramWebApp(),
        colorScheme,
        initData: getInitData(),
        user: getTelegramUser(),
        haptic,
        webApp: getTelegramWebApp(),
    };
}

/**
 * Hook для MainButton
 * Используем useRef для стабильного callback, чтобы избежать лишних перерендеров
 */
export function useMainButton(props: {
    text: string;
    onClick: () => void;
    options?: {
        enabled?: boolean;
        loading?: boolean;
    };
}) {
    const { text, onClick, options } = props;

    const { enabled = true, loading = false } = options ?? {};

    // Храним актуальный callback в ref, чтобы не пересоздавать обработчик
    const callbackRef = useRef(onClick);

    // Обновляем ref в useEffect, а не во время рендера
    useEffect(() => {
        callbackRef.current = onClick;
    });

    // Стабильный обработчик, который вызывает актуальный callback из ref
    const stableCallback = useCallback(() => {
        callbackRef.current();
    }, []);

    useEffect(() => {
        if (!enabled) {
            hideMainButton();
            return;
        }

        showMainButton(text, stableCallback);

        const webApp = getTelegramWebApp();
        if (webApp) {
            if (loading) {
                webApp.MainButton.showProgress(true);
            } else {
                webApp.MainButton.hideProgress();
            }
        }

        return () => {
            hideMainButton();
        };
    }, [text, stableCallback, enabled, loading]);
}

/**
 * Hook для BackButton
 * Используем useRef для стабильного callback
 */
export function useBackButton(onClick: () => void, enabled = true) {
    // Храним актуальный callback в ref
    const callbackRef = useRef(onClick);

    // Обновляем ref в useEffect, а не во время рендера
    useEffect(() => {
        callbackRef.current = onClick;
    });

    // Стабильный обработчик
    const stableCallback = useCallback(() => {
        callbackRef.current();
    }, []);

    useEffect(() => {
        if (!enabled) {
            hideBackButton();
            return;
        }

        showBackButton(stableCallback);

        return () => {
            hideBackButton();
        };
    }, [stableCallback, enabled]);
}

/**
 * Hook для Haptic Feedback
 */
export function useHaptic() {
    const impact = useCallback(
        (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
            haptic.impact(style);
        },
        []
    );

    const notification = useCallback((type: 'error' | 'success' | 'warning') => {
        haptic.notification(type);
    }, []);

    const selection = useCallback(() => {
        haptic.selection();
    }, []);

    return { impact, notification, selection };
}
