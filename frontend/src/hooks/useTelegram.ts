/**
 * Hook для работы с Telegram WebApp
 */

import { useEffect, useState, useCallback } from 'react';
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
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const webApp = getTelegramWebApp();

    if (webApp) {
      setColorScheme(webApp.colorScheme);

      // Слушаем изменения темы
      const handleThemeChange = () => {
        setColorScheme(webApp.colorScheme);
      };

      webApp.onEvent('themeChanged', handleThemeChange);
      setIsReady(true);

      return () => {
        webApp.offEvent('themeChanged', handleThemeChange);
      };
    } else {
      // Dev mode
      setIsReady(true);
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
 */
export function useMainButton(
  text: string,
  onClick: () => void,
  options?: {
    enabled?: boolean;
    loading?: boolean;
  }
) {
  const { enabled = true, loading = false } = options ?? {};

  useEffect(() => {
    if (!enabled) {
      hideMainButton();
      return;
    }

    showMainButton(text, onClick);

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
  }, [text, onClick, enabled, loading]);
}

/**
 * Hook для BackButton
 */
export function useBackButton(onClick: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) {
      hideBackButton();
      return;
    }

    showBackButton(onClick);

    return () => {
      hideBackButton();
    };
  }, [onClick, enabled]);
}

/**
 * Hook для Haptic Feedback
 */
export function useHaptic() {
  const impact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    haptic.impact(style);
  }, []);

  const notification = useCallback((type: 'error' | 'success' | 'warning') => {
    haptic.notification(type);
  }, []);

  const selection = useCallback(() => {
    haptic.selection();
  }, []);

  return { impact, notification, selection };
}
