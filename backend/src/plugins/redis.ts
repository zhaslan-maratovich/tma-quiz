/**
 * Fastify plugin для Redis
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';
import { config } from '../config/index.js';

/**
 * Расширение типов Fastify для Redis
 */
declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

/**
 * Redis plugin для Fastify
 * Создаёт и управляет подключением к Redis
 */
const redisPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 3) {
        fastify.log.error('Redis: Could not connect after 3 retries');
        return null;
      }
      return Math.min(times * 100, 3000);
    },
    lazyConnect: true,
  });

  // Обработка событий Redis
  redis.on('connect', () => {
    fastify.log.info('🔴 Connected to Redis');
  });

  redis.on('error', (error) => {
    fastify.log.error(error, 'Redis connection error');
  });

  redis.on('close', () => {
    fastify.log.info('🔴 Redis connection closed');
  });

  // Подключение к Redis
  try {
    await redis.connect();
  } catch (error) {
    fastify.log.warn('Redis connection failed, continuing without Redis');
  }

  // Декорирование fastify экземпляра
  fastify.decorate('redis', redis);

  // Закрытие подключения при остановке сервера
  fastify.addHook('onClose', async (instance) => {
    await instance.redis.quit();
    fastify.log.info('🔴 Disconnected from Redis');
  });
};

export default fp(redisPlugin, {
  name: 'redis',
});
