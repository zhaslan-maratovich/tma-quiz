/**
 * Утилиты для работы с Telegram Mini App
 */

import crypto from 'crypto';
import type { TelegramInitData, TelegramUser } from '../types/index.js';

/**
 * Максимальное время жизни initData (24 часа в секундах)
 */
const INIT_DATA_MAX_AGE = 24 * 60 * 60;

/**
 * Парсит строку initData от Telegram
 * @param initDataString - строка initData из Telegram Mini App
 * @returns распарсенные данные
 */
export function parseInitData(initDataString: string): Record<string, string> {
  const params = new URLSearchParams(initDataString);
  const data: Record<string, string> = {};

  params.forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

/**
 * Проверяет подпись initData от Telegram
 * @param initDataString - строка initData
 * @param botToken - токен бота
 * @returns true если подпись валидна
 */
export function verifyTelegramInitData(initDataString: string, botToken: string): boolean {
  const data = parseInitData(initDataString);
  const hash = data['hash'];

  if (!hash) {
    return false;
  }

  // Собираем строку для проверки (все параметры кроме hash, отсортированные)
  const dataCheckString = Object.entries(data)
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Создаём секретный ключ из токена бота
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Вычисляем HMAC
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

/**
 * Проверяет время создания initData
 * @param authDate - timestamp из initData
 * @param maxAge - максимальный возраст в секундах
 * @returns true если данные не устарели
 */
export function isInitDataFresh(authDate: number, maxAge: number = INIT_DATA_MAX_AGE): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now - authDate <= maxAge;
}

/**
 * Извлекает данные пользователя из initData
 * @param initDataString - строка initData
 * @returns данные пользователя или null
 */
export function extractUserFromInitData(initDataString: string): TelegramUser | null {
  const data = parseInitData(initDataString);
  const userString = data['user'];

  if (!userString) {
    return null;
  }

  try {
    const user = JSON.parse(userString) as TelegramUser;
    return user;
  } catch {
    return null;
  }
}

/**
 * Полная валидация initData
 * @param initDataString - строка initData
 * @param botToken - токен бота
 * @returns объект с результатом валидации
 */
export function validateTelegramInitData(
  initDataString: string,
  botToken: string
): { valid: boolean; error?: string; data?: TelegramInitData; user?: TelegramUser } {
  // Проверяем подпись
  if (!verifyTelegramInitData(initDataString, botToken)) {
    return { valid: false, error: 'Invalid signature' };
  }

  const parsedData = parseInitData(initDataString);

  // Проверяем наличие auth_date
  const authDateStr = parsedData['auth_date'];
  if (!authDateStr) {
    return { valid: false, error: 'Missing auth_date' };
  }

  const authDate = parseInt(authDateStr, 10);
  if (isNaN(authDate)) {
    return { valid: false, error: 'Invalid auth_date' };
  }

  // Проверяем срок действия
  if (!isInitDataFresh(authDate)) {
    return { valid: false, error: 'InitData expired' };
  }

  // Извлекаем пользователя
  const user = extractUserFromInitData(initDataString);
  if (!user) {
    return { valid: false, error: 'Missing or invalid user data' };
  }

  return {
    valid: true,
    data: {
      query_id: parsedData['query_id'],
      user,
      auth_date: authDate,
      hash: parsedData['hash'] ?? '',
    },
    user,
  };
}

/**
 * Создаёт тестовый initData для разработки
 * @param user - данные пользователя
 * @param botToken - токен бота
 * @returns строка initData
 */
export function createTestInitData(user: TelegramUser, botToken: string): string {
  const authDate = Math.floor(Date.now() / 1000);
  const userString = JSON.stringify(user);

  const params: Record<string, string> = {
    auth_date: authDate.toString(),
    user: userString,
    query_id: `test_${Date.now()}`,
  };

  // Создаём строку для подписи
  const dataCheckString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Создаём подпись
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  params['hash'] = hash;

  // Формируем строку
  return new URLSearchParams(params).toString();
}
