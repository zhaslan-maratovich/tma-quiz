/**
 * Роуты прохождения теста
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PlayService, UserAnswerInput } from '../services/play.service.js';

/**
 * Схема ответов
 */
const submitAnswersSchema = {
  type: 'object',
  required: ['answers'],
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['questionId', 'answerId'],
        properties: {
          questionId: { type: 'string' },
          answerId: { type: 'string' },
        },
      },
      minItems: 1,
    },
  },
} as const;

interface SlugParams {
  slug: string;
}

interface SubmitBody {
  answers: UserAnswerInput[];
}

/**
 * Сериализует данные для JSON
 */
function serialize(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * Роуты прохождения теста
 */
const playRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const playService = new PlayService(fastify.prisma);

  /**
   * GET /api/play/:slug
   * Получить тест для прохождения
   */
  fastify.get<{ Params: SlugParams }>(
    '/:slug',
    async (request, reply) => {
      const test = await playService.getTestBySlug(request.params.slug);

      // Убираем лишние поля для участника
      const safeTest = {
        id: test.id,
        type: test.type,
        slug: test.slug,
        allowRetake: test.allowRetake,
        welcomeScreen: test.welcomeScreen,
        questions: test.questions.map((q) => ({
          id: q.id,
          order: q.order,
          text: q.text,
          imageUrl: q.imageUrl,
          answers: q.answers.map((a) => ({
            id: a.id,
            order: a.order,
            text: a.text,
            imageUrl: a.imageUrl,
          })),
        })),
        questionsCount: test.questions.length,
      };

      return reply.send({
        success: true,
        data: serialize(safeTest),
      });
    }
  );

  /**
   * GET /api/play/:slug/session
   * Проверить существующую сессию
   */
  fastify.get<{ Params: SlugParams }>(
    '/:slug/session',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const session = await playService.getExistingSession(
        request.params.slug,
        userId
      );

      return reply.send({
        success: true,
        data: serialize(session),
      });
    }
  );

  /**
   * POST /api/play/:slug/start
   * Начать прохождение
   */
  fastify.post<{ Params: SlugParams }>(
    '/:slug/start',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await playService.startTest(request.params.slug, userId);

      return reply.send({
        success: true,
        data: serialize(result),
      });
    }
  );

  /**
   * POST /api/play/:slug/submit
   * Отправить ответы и завершить тест
   */
  fastify.post<{ Params: SlugParams; Body: SubmitBody }>(
    '/:slug/submit',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: submitAnswersSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await playService.submitAnswers(
        request.params.slug,
        userId,
        request.body.answers
      );

      return reply.send({
        success: true,
        data: serialize(result),
      });
    }
  );
};

export default playRoutes;
