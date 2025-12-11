/**
 * Типы TypeScript для приложения
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Типы тестов
 */
export type TestType = 'branching' | 'quiz' | 'personality';

/**
 * Статусы тестов
 */
export type TestStatus = 'draft' | 'published';

/**
 * Данные пользователя из Telegram
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

/**
 * Данные initData от Telegram
 */
export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

/**
 * Пользователь в контексте запроса
 */
export interface RequestUser {
  id: string;
  telegramId: bigint;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}

/**
 * Расширение FastifyRequest для авторизованных запросов
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: RequestUser;
}

/**
 * Базовый ответ API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Ответ со списком элементов
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Декоратор для Fastify с Prisma и Redis
 */
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: RequestUser;
  }
}

/**
 * Лимиты приложения
 */
export const LIMITS = {
  /** Максимум тестов на пользователя */
  MAX_TESTS_PER_USER: 20,
  /** Максимум вопросов в тесте */
  MAX_QUESTIONS_PER_TEST: 50,
  /** Максимум картинок в тесте */
  MAX_IMAGES_PER_TEST: 100,
  /** Максимальный размер картинки в байтах (2MB) */
  MAX_IMAGE_SIZE: 2 * 1024 * 1024,
} as const;
