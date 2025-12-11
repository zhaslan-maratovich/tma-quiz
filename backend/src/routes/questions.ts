/**
 * Роуты для работы с вопросами
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QuestionService, CreateQuestionInput, UpdateQuestionInput, ReorderQuestionsInput } from '../services/question.service.js';

/**
 * Схема создания вопроса
 */
const createQuestionSchema = {
  type: 'object',
  required: ['text'],
  properties: {
    text: { type: 'string', minLength: 1, maxLength: 1000 },
    imageUrl: { type: 'string', format: 'uri' },
  },
} as const;

/**
 * Схема обновления вопроса
 */
const updateQuestionSchema = {
  type: 'object',
  properties: {
    text: { type: 'string', minLength: 1, maxLength: 1000 },
    imageUrl: { type: ['string', 'null'] },
  },
} as const;

/**
 * Схема изменения порядка
 */
const reorderSchema = {
  type: 'object',
  required: ['questionIds'],
  properties: {
    questionIds: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
  },
} as const;

interface TestIdParams {
  testId: string;
}

interface QuestionIdParams {
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
 * Роуты для работы с вопросами
 */
const questionsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const questionService = new QuestionService(fastify.prisma);

  /**
   * POST /api/tests/:testId/questions
   * Добавить вопрос в тест
   */
  fastify.post<{ Params: TestIdParams; Body: CreateQuestionInput }>(
    '/tests/:testId/questions',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: createQuestionSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const question = await questionService.createQuestion(
        request.params.testId,
        userId,
        request.body
      );

      return reply.status(201).send({
        success: true,
        data: serialize(question),
      });
    }
  );

  /**
   * PUT /api/tests/:testId/questions/reorder
   * Изменить порядок вопросов
   */
  fastify.put<{ Params: TestIdParams; Body: ReorderQuestionsInput }>(
    '/tests/:testId/questions/reorder',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: reorderSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const questions = await questionService.reorderQuestions(
        request.params.testId,
        userId,
        request.body
      );

      return reply.send({
        success: true,
        data: serialize(questions),
      });
    }
  );

  /**
   * PUT /api/questions/:id
   * Обновить вопрос
   */
  fastify.put<{ Params: QuestionIdParams; Body: UpdateQuestionInput }>(
    '/questions/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: updateQuestionSchema,
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const question = await questionService.updateQuestion(
        request.params.id,
        userId,
        request.body
      );

      return reply.send({
        success: true,
        data: serialize(question),
      });
    }
  );

  /**
   * DELETE /api/questions/:id
   * Удалить вопрос
   */
  fastify.delete<{ Params: QuestionIdParams }>(
    '/questions/:id',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      await questionService.deleteQuestion(request.params.id, userId);

      return reply.status(204).send();
    }
  );
};

export default questionsRoutes;
