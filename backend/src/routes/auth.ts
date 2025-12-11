/**
 * Роуты аутентификации
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { config } from '../config/index.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Схема запроса аутентификации
 */
const authBodySchema = {
  type: 'object',
  required: ['initData'],
  properties: {
    initData: { type: 'string', minLength: 1 },
  },
} as const;

/**
 * Интерфейс тела запроса
 */
interface AuthBody {
  initData: string;
}

/**
 * Роуты аутентификации
 */
const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const botToken = config.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    fastify.log.warn('TELEGRAM_BOT_TOKEN not configured, auth routes will not work');
  }

  /**
   * POST /api/auth/telegram
   * Аутентификация через Telegram initData
   */
  fastify.post<{ Body: AuthBody }>(
    '/telegram',
    {
      schema: {
        body: authBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      telegramId: { type: 'string' },
                      username: { type: ['string', 'null'] },
                      firstName: { type: ['string', 'null'] },
                      lastName: { type: ['string', 'null'] },
                    },
                  },
                  isNewUser: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { initData } = request.body;

      if (!botToken) {
        throw new ValidationError('Authentication is not configured');
      }

      const authService = new AuthService(fastify.prisma, botToken);
      const result = await authService.authenticateWithTelegram(initData);

      return reply.send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            telegramId: result.user.telegramId.toString(),
            username: result.user.username,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
          },
          isNewUser: result.isNewUser,
        },
      });
    }
  );

  /**
   * GET /api/auth/me
   * Получить текущего пользователя
   */
  fastify.get(
    '/me',
    {
      preHandler: [fastify.authenticate],
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  telegramId: { type: 'string' },
                  username: { type: ['string', 'null'] },
                  firstName: { type: ['string', 'null'] },
                  lastName: { type: ['string', 'null'] },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = request.user!;

      return reply.send({
        success: true,
        data: {
          id: user.id,
          telegramId: user.telegramId.toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }
  );
};

export default authRoutes;
