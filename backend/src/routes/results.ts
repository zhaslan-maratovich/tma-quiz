/**
 * Роуты для работы с результатами (финальными экранами)
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ResultService, CreateResultInput, UpdateResultInput } from '../services/result.service.js';

/**
 * Схема создания результата
 */
const createResultSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 1000 },
    imageUrl: { type: 'string', format: 'uri' },
  },
} as const;

/**
 * Схема обновления результата
 */
const updateResultSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: ['string', 'null'], maxLength: 1000 },
    imageUrl: { type: ['string', 'null'] },
  },
} as const;

interface TestIdParams {
  testId: string;
}

interface ResultIdParams {
  id: string;
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
 * Роуты для работы с результатами
 */
const resultsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const resultService = new ResultService(fastify.prisma);

  /**
   * POST /api/tests/:testId/results
   * Добавить результат в тест
   */
  fastify.post<{ Params: TestIdParams; Body: CreateResultInput }>(
    '/tests/:testId/results',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: createResultSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await resultService.createResult(
        request.params.testId,
        userId,
        request.body
      );

      return reply.status(201).send({
        success: true,
        data: serialize(result),
      });
    }
  );

  /**
   * PUT /api/results/:id
   * Обновить результат
   */
  fastify.put<{ Params: ResultIdParams; Body: UpdateResultInput }>(
    '/results/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: updateResultSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await resultService.updateResult(
        request.params.id,
        userId,
        request.body
      );

      return reply.send({
        success: true,
        data: serialize(result),
      });
    }
  );

  /**
   * DELETE /api/results/:id
   * Удалить результат
   */
  fastify.delete<{ Params: ResultIdParams }>(
    '/results/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      await resultService.deleteResult(request.params.id, userId);

      return reply.status(204).send();
    }
  );
};

export default resultsRoutes;
