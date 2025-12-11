/**
 * Настройка и конфигурация Fastify приложения
 */

import Fastify, { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import { config, isDevelopment } from './config/index.js';
import { AppError } from './utils/errors.js';
import prismaPlugin from './plugins/prisma.js';
import redisPlugin from './plugins/redis.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import testsRoutes from './routes/tests.js';
import questionsRoutes from './routes/questions.js';
import answersRoutes from './routes/answers.js';
import resultsRoutes from './routes/results.js';
import playRoutes from './routes/play.js';
import uploadRoutes from './routes/upload.js';
import shareRoutes from './routes/share.js';
import rateLimitPlugin from './plugins/rate-limit.js';

/**
 * Опции для создания приложения
 */
export interface AppOptions {
  logger?: boolean;
  /** Пропустить подключение к БД (для тестов) */
  skipDatabase?: boolean;
  /** Пропустить подключение к Redis (для тестов) */
  skipRedis?: boolean;
}

/**
 * Создаёт и настраивает экземпляр Fastify
 */
export async function buildApp(options: AppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? {
      level: isDevelopment ? 'debug' : 'info',
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
  });

  // Регистрация плагинов
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(formbody);

  // Регистрация Prisma plugin (опционально для тестов)
  if (!options.skipDatabase) {
    await app.register(prismaPlugin);
  }

  // Регистрация Redis plugin (опционально для тестов)
  if (!options.skipRedis) {
    await app.register(redisPlugin);
  }

  // Регистрация Auth plugin (требует prisma)
  if (!options.skipDatabase) {
    await app.register(authPlugin);
  }

  // Регистрация Rate Limit plugin (требует redis)
  if (!options.skipRedis) {
    await app.register(rateLimitPlugin);
  }

  // Глобальный обработчик ошибок
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    // Обработка кастомных ошибок приложения
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    // Обработка ошибок валидации Fastify
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.validation,
        },
      });
    }

    // Обработка остальных ошибок
    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: isDevelopment ? error.message : 'Internal server error',
      },
    });
  });

  // Health check endpoint
  app.get('/health', async (request, _reply) => {
    let databaseStatus = 'not_configured';
    let redisStatus = 'not_configured';

    // Проверка PostgreSQL
    if (app.prisma) {
      try {
        await app.prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      } catch (error) {
        request.log.error(error, 'Database health check failed');
        databaseStatus = 'disconnected';
      }
    }

    // Проверка Redis
    if (app.redis) {
      try {
        const pong = await app.redis.ping();
        redisStatus = pong === 'PONG' ? 'connected' : 'disconnected';
      } catch (error) {
        request.log.error(error, 'Redis health check failed');
        redisStatus = 'disconnected';
      }
    }

    const isDatabaseOk = databaseStatus === 'connected' || databaseStatus === 'not_configured';
    const isRedisOk = redisStatus === 'connected' || redisStatus === 'not_configured';

    return {
      status: isDatabaseOk && isRedisOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: databaseStatus,
      redis: redisStatus,
    };
  });

  // Корневой маршрут
  app.get('/', async (_request, _reply) => {
    return {
      name: 'Quiz TMA Backend',
      version: '1.0.0',
      documentation: '/documentation',
    };
  });

  // Регистрация роутов API
  if (!options.skipDatabase) {
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(testsRoutes, { prefix: '/api/tests' });
    await app.register(questionsRoutes, { prefix: '/api' });
    await app.register(answersRoutes, { prefix: '/api' });
    await app.register(resultsRoutes, { prefix: '/api' });
    await app.register(playRoutes, { prefix: '/api/play' });
    await app.register(uploadRoutes, { prefix: '/api/upload' });
    await app.register(shareRoutes, { prefix: '/api/sessions' });
  }

  return app;
}

/**
 * Запускает приложение
 */
export async function startApp(app: FastifyInstance): Promise<void> {
  try {
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info(`🚀 Server running at http://${config.HOST}:${config.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}
