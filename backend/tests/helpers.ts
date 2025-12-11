/**
 * Вспомогательные функции для тестов
 */

import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

/**
 * Опции для создания тестового приложения
 */
export interface TestAppOptions {
  withDatabase?: boolean;
  withRedis?: boolean;
}

/**
 * Создаёт тестовый экземпляр приложения
 * @param options - опции подключения к сервисам
 */
export async function createTestApp(options: TestAppOptions = {}): Promise<FastifyInstance> {
  const { withDatabase = false, withRedis = false } = options;

  const app = await buildApp({
    logger: false,
    skipDatabase: !withDatabase,
    skipRedis: !withRedis,
  });
  await app.ready();
  return app;
}

/**
 * Закрывает тестовый экземпляр приложения
 */
export async function closeTestApp(app: FastifyInstance): Promise<void> {
  await app.close();
}
