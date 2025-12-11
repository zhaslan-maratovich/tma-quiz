/**
 * Роуты для работы с ответами
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AnswerService, CreateAnswerInput, UpdateAnswerInput } from '../services/answer.service.js';

/**
 * Схема создания ответа
 */
const createAnswerSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: { type: 'string', minLength: 1, maxLength: 500 },
    imageUrl: { type: 'string', format: 'uri' },
    isCorrect: { type: 'boolean' },
    nextQuestionId: { type: 'string' },
    resultId: { type: 'string' },
    resultPoints: {
      type: 'array',
      items: {
        type: 'object',
        required: ['resultId', 'points'],
        properties: {
          resultId: { type: 'string' },
          points: { type: 'integer', minimum: 1 },
        },
      },
    },
  },
} as const;

/**
 * Схема обновления ответа
 */
const updateAnswerSchema = {
  type: 'object',
  properties: {
    text: { type: 'string', minLength: 1, maxLength: 500 },
    imageUrl: { type: ['string', 'null'] },
    isCorrect: { type: 'boolean' },
    nextQuestionId: { type: ['string', 'null'] },
    resultId: { type: ['string', 'null'] },
    resultPoints: {
      type: 'array',
      items: {
        type: 'object',
        required: ['resultId', 'points'],
        properties: {
          resultId: { type: 'string' },
          points: { type: 'integer', minimum: 1 },
        },
      },
    },
  },
} as const;

interface QuestionIdParams {
  questionId: string;
}

interface AnswerIdParams {
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
 * Роуты для работы с ответами
 */
const answersRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const answerService = new AnswerService(fastify.prisma);

  /**
   * POST /api/questions/:questionId/answers
   * Добавить ответ к вопросу
   */
  fastify.post<{ Params: QuestionIdParams; Body: CreateAnswerInput }>(
    '/questions/:questionId/answers',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: createAnswerSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const answer = await answerService.createAnswer(
        request.params.questionId,
        userId,
        request.body
      );

      return reply.status(201).send({
        success: true,
        data: serialize(answer),
      });
    }
  );

  /**
   * PUT /api/answers/:id
   * Обновить ответ
   */
  fastify.put<{ Params: AnswerIdParams; Body: UpdateAnswerInput }>(
    '/answers/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: updateAnswerSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const answer = await answerService.updateAnswer(
        request.params.id,
        userId,
        request.body
      );

      return reply.send({
        success: true,
        data: serialize(answer),
      });
    }
  );

  /**
   * DELETE /api/answers/:id
   * Удалить ответ
   */
  fastify.delete<{ Params: AnswerIdParams }>(
    '/answers/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      await answerService.deleteAnswer(request.params.id, userId);

      return reply.status(204).send();
    }
  );
};

export default answersRoutes;
