/**
 * Конфигурация приложения
 * Загружает и валидирует переменные окружения
 */

import 'dotenv/config';
import { z } from 'zod';

/**
 * Схема валидации переменных окружения
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // S3 Storage
  S3_ENDPOINT: z.string().default('https://storage.yandexcloud.net'),
  S3_REGION: z.string().default('ru-central1'),
  S3_BUCKET: z.string().default('quiz-tma-images'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().optional(),
});

/**
 * Тип конфигурации на основе схемы
 */
export type Config = z.infer<typeof envSchema>;

/**
 * Загружает и валидирует конфигурацию
 * @throws {Error} если переменные окружения невалидны
 */
function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    console.error('❌ Invalid environment variables:', errors);
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

/**
 * Экспортируемая конфигурация приложения
 */
export const config = loadConfig();

/**
 * Проверка на production окружение
 */
export const isProduction = config.NODE_ENV === 'production';

/**
 * Проверка на development окружение
 */
export const isDevelopment = config.NODE_ENV === 'development';

/**
 * Проверка на test окружение
 */
export const isTest = config.NODE_ENV === 'test';
