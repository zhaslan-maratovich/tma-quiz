/**
 * Мок Telegram WebApp для разработки без Telegram
 *
 * Эмулирует основные функции Telegram Mini App API
 */

import { mockUser } from './data/users';

/**
 * Мок-тема для разработки (тёмная тема в стиле Telegram)
 */
const mockThemeParams = {
    bg_color: '#1c1c1e',
    text_color: '#ffffff',
    hint_color: '#8e8e93',
    link_color: '#007aff',
    button_color: '#007aff',
    button_text_color: '#ffffff',
    secondary_bg_color: '#2c2c2e',
    header_bg_color: '#1c1c1e',
    accent_text_color: '#007aff',
    section_bg_color: '#2c2c2e',
    section_header_text_color: '#8e8e93',
    section_separator_color: '#3a3a3c',
    subtitle_text_color: '#8e8e93',
    destructive_text_color: '#ff453a',
};

/**
 * Светлая тема
 */
const mockThemeParamsLight = {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#8e8e93',
    link_color: '#007aff',
    button_color: '#007aff',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f2f2f7',
    header_bg_color: '#f8f8f8',
    accent_text_color: '#007aff',
    section_bg_color: '#ffffff',
    section_header_text_color: '#8e8e93',
    section_separator_color: '#c6c6c8',
    subtitle_text_color: '#8e8e93',
    destructive_text_color: '#ff3b30',
};

/**
 * Генерирует фейковый initData для авторизации
 */
function generateMockInitData(): string {
    const user = {
        id: parseInt(mockUser.telegramId),
        first_name: mockUser.firstName,
        last_name: mockUser.lastName,
        username: mockUser.username,
        language_code: 'ru',
    };

    const authDate = Math.floor(Date.now() / 1000);
    const queryId = `mock_query_${Date.now()}`;

    // Формируем initData в формате Telegram
    const params = new URLSearchParams({
        query_id: queryId,
        user: JSON.stringify(user),
        auth_date: authDate.toString(),
        hash: 'mock_hash_for_development_only',
    });

    return params.toString();
}

/**
 * Класс для эмуляции MainButton
 */
class MockMainButton {
    text = '';
    color = '#007aff';
    textColor = '#ffffff';
    isVisible = false;
    isActive = true;
    isProgressVisible = false;

    private clickHandler: (() => void) | null = null;
    private element: HTMLButtonElement | null = null;
    private boundClickHandler: (() => void) | null = null;

    setText(text: string): MockMainButton {
        this.text = text;
        this.updateElement();
        return this;
    }

    onClick(callback: () => void): MockMainButton {
        this.clickHandler = callback;
        return this;
    }

    offClick(_callback: () => void): MockMainButton {
        this.clickHandler = null;
        return this;
    }

    show(): MockMainButton {
        this.isVisible = true;
        this.render();
        return this;
    }

    hide(): MockMainButton {
        this.isVisible = false;
        this.element?.remove();
        this.element = null;
        document.body.style.paddingBottom = '';
        return this;
    }

    enable(): MockMainButton {
        this.isActive = true;
        this.updateElement();
        return this;
    }

    disable(): MockMainButton {
        this.isActive = false;
        this.updateElement();
        return this;
    }

    showProgress(_leaveActive?: boolean): MockMainButton {
        this.isProgressVisible = true;
        this.updateElement();
        return this;
    }

    hideProgress(): MockMainButton {
        this.isProgressVisible = false;
        this.updateElement();
        return this;
    }

    setParams(params: {
        text?: string;
        color?: string;
        text_color?: string;
        is_active?: boolean;
        is_visible?: boolean;
    }): MockMainButton {
        if (params.text) this.text = params.text;
        if (params.color) this.color = params.color;
        if (params.text_color) this.textColor = params.text_color;
        if (params.is_active !== undefined) this.isActive = params.is_active;
        if (params.is_visible !== undefined) {
            params.is_visible ? this.show() : this.hide();
        }
        this.updateElement();
        return this;
    }

    private handleClick = (): void => {
        if (this.isActive && this.clickHandler) {
            console.log('[Mock MainButton] Click handler called');
            this.clickHandler();
        }
    };

    private render(): void {
        if (this.element) {
            this.updateElement();
            return;
        }

        this.element = document.createElement('button');
        this.element.id = 'mock-main-button';
        this.element.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 56px;
            background: ${this.color};
            color: ${this.textColor};
            border: none;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            z-index: 9999;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        `;

        // Используем стрелочную функцию для сохранения контекста
        this.boundClickHandler = this.handleClick;
        this.element.addEventListener('click', this.boundClickHandler);

        this.updateElement();
        document.body.appendChild(this.element);

        // Добавляем отступ для контента
        document.body.style.paddingBottom = '56px';
    }

    private updateElement(): void {
        if (!this.element) return;

        this.element.style.background = this.color;
        this.element.style.color = this.textColor;
        this.element.style.opacity = this.isActive ? '1' : '0.6';
        this.element.disabled = !this.isActive;

        if (this.isProgressVisible) {
            this.element.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="50 50" />
                </svg>
                ${this.text}
            `;
        } else {
            this.element.textContent = this.text;
        }
    }
}

/**
 * Класс для эмуляции BackButton
 */
class MockBackButton {
    isVisible = false;
    private clickHandler: (() => void) | null = null;
    private element: HTMLButtonElement | null = null;

    onClick(callback: () => void): MockBackButton {
        this.clickHandler = callback;
        return this;
    }

    offClick(_callback: () => void): MockBackButton {
        this.clickHandler = null;
        return this;
    }

    show(): MockBackButton {
        this.isVisible = true;
        this.render();
        return this;
    }

    hide(): MockBackButton {
        this.isVisible = false;
        this.element?.remove();
        this.element = null;
        return this;
    }

    private render(): void {
        if (this.element) return;

        this.element = document.createElement('button');
        this.element.id = 'mock-back-button';
        this.element.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
        `;
        this.element.style.cssText = `
            position: fixed;
            top: 12px;
            left: 12px;
            width: 40px;
            height: 40px;
            background: rgba(0, 0, 0, 0.5);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        `;

        this.element.addEventListener('click', () => {
            if (this.clickHandler) {
                this.clickHandler();
            }
        });

        document.body.appendChild(this.element);
    }
}

/**
 * Класс для эмуляции HapticFeedback
 */
class MockHapticFeedback {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): MockHapticFeedback {
        console.log(`[Mock Haptic] impact: ${style}`);
        // Попытка использовать Vibration API если доступен
        if ('vibrate' in navigator) {
            const durations: Record<string, number> = {
                light: 10,
                medium: 20,
                heavy: 30,
                rigid: 40,
                soft: 15,
            };
            navigator.vibrate(durations[style] || 20);
        }
        return this;
    }

    notificationOccurred(type: 'error' | 'success' | 'warning'): MockHapticFeedback {
        console.log(`[Mock Haptic] notification: ${type}`);
        if ('vibrate' in navigator) {
            const patterns: Record<string, number[]> = {
                success: [20, 50, 20],
                warning: [30, 30, 30],
                error: [50, 30, 50],
            };
            navigator.vibrate(patterns[type] || [20]);
        }
        return this;
    }

    selectionChanged(): MockHapticFeedback {
        console.log('[Mock Haptic] selection');
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
        return this;
    }
}

/**
 * Создаёт мок Telegram WebApp
 */
function createMockTelegramWebApp() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeParams = isDarkMode ? mockThemeParams : mockThemeParamsLight;

    const eventHandlers: Record<string, Set<() => void>> = {};

    const mockWebApp = {
        initData: generateMockInitData(),
        initDataUnsafe: {
            query_id: `mock_query_${Date.now()}`,
            user: {
                id: parseInt(mockUser.telegramId),
                first_name: mockUser.firstName || 'Разработчик',
                last_name: mockUser.lastName || 'Тестовый',
                username: mockUser.username || 'dev_user',
                language_code: 'ru',
                is_premium: false,
            },
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mock_hash_for_development_only',
            start_param: new URLSearchParams(window.location.search).get('startapp') || undefined,
        },
        version: '7.0',
        platform: 'web',
        colorScheme: (isDarkMode ? 'dark' : 'light') as 'light' | 'dark',
        themeParams,
        isExpanded: true,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        headerColor: themeParams.header_bg_color || '#1c1c1e',
        backgroundColor: themeParams.bg_color || '#1c1c1e',
        isClosingConfirmationEnabled: false,

        // Методы
        ready: () => {
            console.log('[Mock Telegram] WebApp ready');
        },
        expand: () => {
            console.log('[Mock Telegram] WebApp expand');
        },
        close: () => {
            console.log('[Mock Telegram] WebApp close');
            window.close();
        },
        enableClosingConfirmation: () => {
            mockWebApp.isClosingConfirmationEnabled = true;
        },
        disableClosingConfirmation: () => {
            mockWebApp.isClosingConfirmationEnabled = false;
        },
        setHeaderColor: (color: string) => {
            mockWebApp.headerColor = color;
        },
        setBackgroundColor: (color: string) => {
            mockWebApp.backgroundColor = color;
        },

        // Кнопки
        MainButton: new MockMainButton(),
        BackButton: new MockBackButton(),

        // Haptic feedback
        HapticFeedback: new MockHapticFeedback(),

        // Шеринг
        openLink: (url: string) => {
            console.log('[Mock Telegram] openLink:', url);
            window.open(url, '_blank');
        },
        openTelegramLink: (url: string) => {
            console.log('[Mock Telegram] openTelegramLink:', url);
            window.open(url, '_blank');
        },
        switchInlineQuery: (query: string, chooseChatTypes?: string[]) => {
            console.log('[Mock Telegram] switchInlineQuery:', query, chooseChatTypes);
        },
        showPopup: (
            params: { title?: string; message: string; buttons?: Array<{ id?: string }> },
            callback?: (buttonId: string) => void
        ) => {
            console.log('[Mock Telegram] showPopup:', params);
            const result = window.confirm(`${params.title || ''}\n\n${params.message}`);
            callback?.(result ? 'ok' : 'cancel');
        },
        showAlert: (message: string, callback?: () => void) => {
            console.log('[Mock Telegram] showAlert:', message);
            window.alert(message);
            callback?.();
        },
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
            console.log('[Mock Telegram] showConfirm:', message);
            const result = window.confirm(message);
            callback?.(result);
        },

        // События
        onEvent: (eventType: string, eventHandler: () => void) => {
            if (!eventHandlers[eventType]) {
                eventHandlers[eventType] = new Set();
            }
            eventHandlers[eventType].add(eventHandler);
        },
        offEvent: (eventType: string, eventHandler: () => void) => {
            eventHandlers[eventType]?.delete(eventHandler);
        },
    };

    // Слушаем изменения темы системы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        mockWebApp.colorScheme = e.matches ? 'dark' : 'light';
        Object.assign(mockWebApp.themeParams, e.matches ? mockThemeParams : mockThemeParamsLight);
        eventHandlers['themeChanged']?.forEach((handler) => handler());
    });

    return mockWebApp;
}

/**
 * Инициализирует мок Telegram WebApp
 */
export function initMockTelegram(): void {
    // Проверяем, что мы не в реальном Telegram
    if (window.Telegram?.WebApp?.initData) {
        console.log('[Mock Telegram] Real Telegram detected, skipping mock');
        return;
    }

    console.log('[Mock Telegram] Initializing mock Telegram WebApp');

    // Добавляем CSS для анимации спиннера
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Создаём мок Telegram
    const mockWebApp = createMockTelegramWebApp();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Telegram = {
        WebApp: mockWebApp,
    };

    console.log('[Mock Telegram] Mock Telegram WebApp initialized');
    console.log('[Mock Telegram] User:', mockWebApp.initDataUnsafe.user);
}
