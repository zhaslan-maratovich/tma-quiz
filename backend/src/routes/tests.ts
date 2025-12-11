/**
 * Роуты для работы с тестами
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { TestService, CreateTestInput, UpdateTestInput } from '../services/test.service.js';
import { PublishService } from '../services/publish.service.js';
import { AnalyticsService } from '../services/analytics.service.js';

/**
 * Схема создания теста
 */
const createTestSchema = {
  type: 'object',
  required: ['type', 'welcomeScreen'],
  properties: {
    type: { type: 'string', enum: ['branching', 'quiz', 'personality'] },
    allowRetake: { type: 'boolean' },
    welcomeScreen: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: 'string', maxLength: 1000 },
        imageUrl: { type: 'string', format: 'uri' },
        buttonText: { type: 'string', maxLength: 50 },
      },
    },
  },
} as const;

/**
 * Схема обновления теста
 */
const updateTestSchema = {
  type: 'object',
  properties: {
    allowRetake: { type: 'boolean' },
    welcomeScreen: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 200 },
        description: { type: ['string', 'null'], maxLength: 1000 },
        imageUrl: { type: ['string', 'null'] },
        buttonText: { type: 'string', maxLength: 50 },
      },
    },
  },
} as const;

/**
 * Параметры с ID теста
 */
interface TestParams {
  id: string;
}

/**
 * Сериализует BigInt в строку для JSON
 */
function serializeTest(test: any): any {
  return JSON.parse(
    JSON.stringify(test, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * Роуты для работы с тестами
 */
const testsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const testService = new TestService(fastify.prisma);
  const publishService = new PublishService(fastify.prisma);
  const analyticsService = new AnalyticsService(fastify.prisma);

  /**
   * GET /api/tests
   * Получить список своих тестов
   */
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const tests = await testService.getTestsByOwner(userId);

      return reply.send({
        success: true,
        data: serializeTest(tests),
      });
    }
  );

  /**
   * POST /api/tests
   * Создать новый тест
   */
  fastify.post<{ Body: CreateTestInput }>(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: createTestSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const test = await testService.createTest(userId, request.body);

      return reply.status(201).send({
        success: true,
        data: serializeTest(test),
      });
    }
  );

  /**
   * GET /api/tests/:id
   * Получить тест по ID
   */
  fastify.get<{ Params: TestParams }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const test = await testService.getTestById(request.params.id, userId);

      return reply.send({
        success: true,
        data: serializeTest(test),
      });
    }
  );

  /**
   * PUT /api/tests/:id
   * Обновить тест
   */
  fastify.put<{ Params: TestParams; Body: UpdateTestInput }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: updateTestSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const test = await testService.updateTest(
        request.params.id,
        userId,
        request.body
      );

      return reply.send({
        success: true,
        data: serializeTest(test),
      });
    }
  );

  /**
   * DELETE /api/tests/:id
   * Удалить тест
   */
  fastify.delete<{ Params: TestParams }>(
    '/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      await testService.deleteTest(request.params.id, userId);

      return reply.status(204).send();
    }
  );

  /**
   * POST /api/tests/:id/publish
   * Опубликовать тест
   */
  fastify.post<{ Params: TestParams }>(
    '/:id/publish',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const test = await publishService.publishTest(request.params.id, userId);

      return reply.send({
        success: true,
        data: serializeTest(test),
      });
    }
  );

  /**
   * GET /api/tests/:id/analytics
   * Получить аналитику теста
   */
  fastify.get<{ Params: TestParams }>(
    '/:id/analytics',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const analytics = await analyticsService.getTestAnalytics(
        request.params.id,
        userId
      );

      return reply.send({
        success: true,
        data: serializeTest(analytics),
      });
    }
  );
};

export default testsRoutes;
