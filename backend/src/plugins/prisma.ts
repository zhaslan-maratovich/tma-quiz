/**
 * Fastify plugin для Prisma ORM
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { isDevelopment } from '../config/index.js';

/**
 * Расширение типов Fastify для Prisma
 */
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

/**
 * Prisma plugin для Fastify
 * Создаёт и управляет подключением к базе данных
 */
const prismaPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' },
          { emit: 'stdout', level: 'error' },
        ]
      : [{ emit: 'stdout', level: 'error' }],
  });

  // Логирование запросов в development режиме
  if (isDevelopment) {
    prisma.$on('query', (event) => {
      fastify.log.debug({
        query: event.query,
        params: event.params,
        duration: `${event.duration}ms`,
      });
    });
  }

  // Подключение к БД
  await prisma.$connect();
  fastify.log.info('📦 Connected to PostgreSQL database');

  // Декорирование fastify экземпляра
  fastify.decorate('prisma', prisma);

  // Закрытие подключения при остановке сервера
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
    fastify.log.info('📦 Disconnected from PostgreSQL database');
  });
};

export default fp(prismaPlugin, {
  name: 'prisma',
});
