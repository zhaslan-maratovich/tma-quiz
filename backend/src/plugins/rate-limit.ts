/**
 * Fastify plugin для Rate Limiting
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

/**
 * Rate Limit plugin для Fastify
 */
const rateLimitPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(rateLimit, {
    global: true,
    max: 100, // 100 req/min на IP
    timeWindow: '1 minute',
    cache: 10000,
    allowList: [],
    redis: fastify.redis,
    keyGenerator: (request) => {
      // Используем user ID если авторизован, иначе IP
      return request.user?.id ?? request.ip;
    },
    errorResponseBuilder: (_request, context) => {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
          retryAfter: Math.ceil(context.ttl / 1000),
        },
      };
    },
  });

  fastify.log.info('🚦 Rate limiting enabled');
};

export default fp(rateLimitPlugin, {
  name: 'rate-limit',
  dependencies: ['redis'],
});

/**
 * Конфигурации rate limit для разных endpoints
 */
export const rateLimitConfigs = {
  /**
   * Создание теста: 20 req/hour
   */
  createTest: {
    max: 20,
    timeWindow: '1 hour',
  },

  /**
   * Загрузка картинки: 50 req/hour
   */
  uploadImage: {
    max: 50,
    timeWindow: '1 hour',
  },

  /**
   * Прохождение теста: 200 req/hour
   */
  playTest: {
    max: 200,
    timeWindow: '1 hour',
  },

  /**
   * Генерация share: 30 req/hour
   */
  shareResult: {
    max: 30,
    timeWindow: '1 hour',
  },
};
