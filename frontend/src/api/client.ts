/**
 * API Client для работы с backend
 */

import type { ApiResponse } from '@/types';
import { getInitData, isTelegramWebApp } from '@/lib/telegram';

// Base URL для API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Класс для HTTP ошибок
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Получает initData для авторизации
 * В режиме разработки использует dev-токен
 */
function getAuthToken(): string {
  if (isTelegramWebApp()) {
    return getInitData();
  }

  // Development mode - используем тестовые данные
  return import.meta.env.VITE_DEV_INIT_DATA || 'dev_mode';
}

/**
 * Базовый метод для API запросов
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {};

  // Устанавливаем Content-Type только если есть body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // Добавляем Authorization header
  const initData = getAuthToken();
  if (initData) {
    headers['Authorization'] = `tma ${initData}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers as Record<string, string>,
    },
  });

  // Обработка 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      response.status,
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Произошла ошибка',
      data.error?.details
    );
  }

  return data.data as T;
}

/**
 * GET запрос
 */
export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

/**
 * POST запрос
 */
export async function post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT запрос
 */
export async function put<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE запрос
 */
export async function del<T = void>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

/**
 * Upload файла
 */
export async function upload<T>(endpoint: string, file: File): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};

  const initData = getAuthToken();
  if (initData) {
    (headers as Record<string, string>)['Authorization'] = `tma ${initData}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      response.status,
      data.error?.code || 'UPLOAD_ERROR',
      data.error?.message || 'Ошибка загрузки файла',
      data.error?.details
    );
  }

  return data.data as T;
}

/**
 * Проверка здоровья API
 */
export async function checkHealth(): Promise<{
  status: string;
  database: string;
  redis: string;
  timestamp: string;
}> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

export const api = {
  get,
  post,
  put,
  delete: del,
  upload,
  checkHealth,
};
