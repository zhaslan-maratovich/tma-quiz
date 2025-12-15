/**
 * Простой API клиент для тестирования
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Для dev-режима используем X-Dev-User-Id
const DEV_USER_ID = '123456789';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

interface AuthUser {
  telegramId: string;
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  user: AuthUser;
  isNewUser: boolean;
}

/**
 * Получает initData из Telegram WebApp или использует dev-режим
 */
function getAuthHeader(): Record<string, string> {
  // Проверяем, есть ли Telegram WebApp
  const tg = (window as any).Telegram?.WebApp;

  console.log('[Auth] Telegram WebApp:', !!tg);
  console.log('[Auth] initData exists:', !!tg?.initData);
  console.log('[Auth] initData length:', tg?.initData?.length || 0);

  if (tg?.initData) {
    // Production: используем initData от Telegram
    console.log('[Auth] Using Telegram Authorization');
    return { 'Authorization': `tma ${tg.initData}` };
  }

  // Development: используем X-Dev-User-Id
  console.log('[Auth] Using Dev mode X-Dev-User-Id');
  return { 'X-Dev-User-Id': DEV_USER_ID };
}

/**
 * Базовый fetch с авторизацией
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  // Добавляем Content-Type только если есть body
  const headers: Record<string, string> = {
    ...getAuthHeader(),
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers as Record<string, string>,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP ${response.status}`);
  }

  return data;
}

// ============ API методы ============

/**
 * Проверка здоровья API
 */
export async function checkHealth() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

/**
 * Авторизация (для Telegram режима)
 */
export async function authenticate(): Promise<ApiResponse<AuthResponse>> {
  const tg = (window as any).Telegram?.WebApp;

  if (!tg?.initData) {
    // В dev-режиме сразу возвращаем успех
    return {
      success: true,
      data: {
        user: { telegramId: DEV_USER_ID },
        isNewUser: false
      }
    };
  }

  return apiFetch<AuthResponse>('/api/auth/telegram', {
    method: 'POST',
    body: JSON.stringify({ initData: tg.initData }),
  });
}

/**
 * Получить список тестов
 */
export async function getTests() {
  return apiFetch<any[]>('/api/tests');
}

/**
 * Создать тест с заготовленными данными
 */
export async function createSampleTest() {
  // Заготовленные данные для теста
  const testData = {
    type: 'quiz',
    allowRetake: true,
    welcomeScreen: {
      title: 'Тест по JavaScript',
      description: 'Проверь свои знания JavaScript! 🚀',
      buttonText: 'Начать тест',
    },
  };

  return apiFetch<any>('/api/tests', {
    method: 'POST',
    body: JSON.stringify(testData),
  });
}

/**
 * Удалить тест
 */
export async function deleteTest(testId: string) {
  const url = `${API_URL}/api/tests/${testId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });

  // DELETE может вернуть пустой ответ (204 No Content)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true, data: null };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP ${response.status}`);
  }

  return data;
}

/**
 * Получить информацию о Telegram WebApp
 */
export function getTelegramInfo() {
  const tg = (window as any).Telegram?.WebApp;

  if (!tg) {
    return {
      available: false,
      mode: 'browser',
      user: null,
      initData: null,
    };
  }

  return {
    available: true,
    mode: 'telegram',
    user: tg.initDataUnsafe?.user || null,
    initData: tg.initData ? `${tg.initData.substring(0, 50)}...` : null,
    colorScheme: tg.colorScheme,
    platform: tg.platform,
  };
}
