/**
 * Fastify plugin для аутентификации
 */

import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { UnauthorizedError } from '../utils/errors.js';
import { validateTelegramInitData } from '../utils/telegram.js';
import { config } from '../config/index.js';
import type { RequestUser } from '../types/index.js';

/**
 * Auth plugin для Fastify
 * Добавляет декоратор authenticate для защиты роутов
 */
const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * Декоратор для проверки аутентификации
   */
  fastify.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is required');
    }

    // Формат: "tma <initData>"
    const [scheme, initData] = authHeader.split(' ');

    if (scheme?.toLowerCase() !== 'tma' || !initData) {
      throw new UnauthorizedError('Invalid authorization format. Expected: tma <initData>');
    }

    // Валидируем initData
    const botToken = config.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new UnauthorizedError('Bot token not configured');
    }

    const validation = validateTelegramInitData(initData, botToken);

    if (!validation.valid || !validation.user) {
      throw new UnauthorizedError(validation.error ?? 'Invalid initData');
    }

    // Ищем пользователя в БД
    const user = await fastify.prisma.user.findUnique({
      where: { telegramId: BigInt(validation.user.id) },
    });

    if (!user) {
      throw new UnauthorizedError('User not found. Please authenticate first.');
    }

    // Добавляем пользователя в request
    const requestUser: RequestUser = {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    request.user = requestUser;
  });
};

export default fp(authPlugin, {
  name: 'auth',
  dependencies: ['prisma'],
});
