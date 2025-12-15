/**
 * Telegram Mini App SDK утилиты
 */

// Тип для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;

  // Методы
  ready(): void;
  expand(): void;
  close(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;

  // Кнопки
  MainButton: MainButton;
  BackButton: BackButton;

  // Haptic feedback
  HapticFeedback: HapticFeedback;

  // Методы шеринга
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  switchInlineQuery(query: string, chooseChatTypes?: string[]): void;
  showPopup(params: PopupParams, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;

  // События
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  section_separator_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;

  setText(text: string): MainButton;
  onClick(callback: () => void): MainButton;
  offClick(callback: () => void): MainButton;
  show(): MainButton;
  hide(): MainButton;
  enable(): MainButton;
  disable(): MainButton;
  showProgress(leaveActive?: boolean): MainButton;
  hideProgress(): MainButton;
  setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): MainButton;
}

interface BackButton {
  isVisible: boolean;
  onClick(callback: () => void): BackButton;
  offClick(callback: () => void): BackButton;
  show(): BackButton;
  hide(): BackButton;
}

interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): HapticFeedback;
  notificationOccurred(type: 'error' | 'success' | 'warning'): HapticFeedback;
  selectionChanged(): HapticFeedback;
}

interface PopupParams {
  title?: string;
  message: string;
  buttons?: PopupButton[];
}

interface PopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

/**
 * Проверяет, запущено ли приложение в Telegram
 */
export function isTelegramWebApp(): boolean {
  return !!window.Telegram?.WebApp?.initData;
}

/**
 * Получает экземпляр Telegram WebApp
 */
export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

/**
 * Получает initData для авторизации
 */
export function getInitData(): string {
  return window.Telegram?.WebApp?.initData ?? '';
}

/**
 * Получает информацию о пользователе
 */
export function getTelegramUser(): TelegramUser | null {
  return window.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
}

/**
 * Получает start_param из ссылки
 */
export function getStartParam(): string | null {
  return window.Telegram?.WebApp?.initDataUnsafe?.start_param ?? null;
}

/**
 * Получает цветовую схему
 */
export function getColorScheme(): 'light' | 'dark' {
  return window.Telegram?.WebApp?.colorScheme ?? 'light';
}

/**
 * Применяет тему Telegram к CSS переменным
 */
export function applyTelegramTheme(): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.themeParams) return;

  const theme = webApp.themeParams;
  const root = document.documentElement;

  if (theme.bg_color) {
    root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
  }
  if (theme.text_color) {
    root.style.setProperty('--tg-theme-text-color', theme.text_color);
  }
  if (theme.hint_color) {
    root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
  }
  if (theme.link_color) {
    root.style.setProperty('--tg-theme-link-color', theme.link_color);
  }
  if (theme.button_color) {
    root.style.setProperty('--tg-theme-button-color', theme.button_color);
  }
  if (theme.button_text_color) {
    root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
  }
  if (theme.secondary_bg_color) {
    root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
  }
  if (theme.header_bg_color) {
    root.style.setProperty('--tg-theme-header-bg-color', theme.header_bg_color);
  }
  if (theme.accent_text_color) {
    root.style.setProperty('--tg-theme-accent-text-color', theme.accent_text_color);
  }
  if (theme.section_bg_color) {
    root.style.setProperty('--tg-theme-section-bg-color', theme.section_bg_color);
  }
  if (theme.section_header_text_color) {
    root.style.setProperty('--tg-theme-section-header-text-color', theme.section_header_text_color);
  }
  if (theme.section_separator_color) {
    root.style.setProperty('--tg-theme-section-separator-color', theme.section_separator_color);
  }
  if (theme.subtitle_text_color) {
    root.style.setProperty('--tg-theme-subtitle-text-color', theme.subtitle_text_color);
  }
  if (theme.destructive_text_color) {
    root.style.setProperty('--tg-theme-destructive-text-color', theme.destructive_text_color);
  }

  // Добавляем класс темной темы
  if (webApp.colorScheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Инициализирует Telegram Mini App
 */
export function initTelegramApp(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  // Сообщаем Telegram что приложение готово
  webApp.ready();

  // Разворачиваем на весь экран
  webApp.expand();

  // Применяем тему
  applyTelegramTheme();

  // Слушаем изменения темы
  webApp.onEvent('themeChanged', applyTelegramTheme);
}

/**
 * Показывает MainButton
 */
export function showMainButton(text: string, onClick: () => void): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  webApp.MainButton
    .setText(text)
    .onClick(onClick)
    .show();
}

/**
 * Скрывает MainButton
 */
export function hideMainButton(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  webApp.MainButton.hide();
}

/**
 * Показывает BackButton
 */
export function showBackButton(onClick: () => void): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  webApp.BackButton
    .onClick(onClick)
    .show();
}

/**
 * Скрывает BackButton
 */
export function hideBackButton(): void {
  const webApp = getTelegramWebApp();
  if (!webApp) return;

  webApp.BackButton.hide();
}

/**
 * Haptic feedback
 */
export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    getTelegramWebApp()?.HapticFeedback?.impactOccurred(style);
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    getTelegramWebApp()?.HapticFeedback?.notificationOccurred(type);
  },
  selection: () => {
    getTelegramWebApp()?.HapticFeedback?.selectionChanged();
  },
};

/**
 * Открывает ссылку
 */
export function openLink(url: string): void {
  getTelegramWebApp()?.openLink(url);
}

/**
 * Открывает Telegram ссылку
 */
export function openTelegramLink(url: string): void {
  getTelegramWebApp()?.openTelegramLink(url);
}

/**
 * Показывает popup
 */
export function showPopup(
  message: string,
  title?: string,
  buttons?: PopupButton[]
): Promise<string> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      resolve('');
      return;
    }

    webApp.showPopup(
      { message, title, buttons },
      (buttonId) => resolve(buttonId)
    );
  });
}

/**
 * Показывает alert
 */
export function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      alert(message);
      resolve();
      return;
    }

    webApp.showAlert(message, resolve);
  });
}

/**
 * Показывает confirm
 */
export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      resolve(confirm(message));
      return;
    }

    webApp.showConfirm(message, resolve);
  });
}
