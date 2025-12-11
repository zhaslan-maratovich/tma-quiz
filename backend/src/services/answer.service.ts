/**
 * Сервис для работы с ответами
 */

import type { PrismaClient, Answer, Prisma } from '@prisma/client';
import { NotFoundError } from '../utils/errors.js';
import { TestService } from './test.service.js';
import { QuestionService } from './question.service.js';

/**
 * Данные для создания ответа
 */
export interface CreateAnswerInput {
  text: string;
  imageUrl?: string;
  isCorrect?: boolean;
  nextQuestionId?: string;
  resultId?: string;
  resultPoints?: Array<{ resultId: string; points: number }>;
}

/**
 * Данные для обновления ответа
 */
export interface UpdateAnswerInput {
  text?: string;
  imageUrl?: string | null;
  isCorrect?: boolean;
  nextQuestionId?: string | null;
  resultId?: string | null;
  resultPoints?: Array<{ resultId: string; points: number }>;
}

/**
 * Ответ с resultPoints
 */
export type AnswerWithPoints = Prisma.AnswerGetPayload<{
  include: {
    resultPoints: true;
  };
}>;

/**
 * Сервис для работы с ответами
 */
export class AnswerService {
  private testService: TestService;
  private questionService: QuestionService;

  constructor(private prisma: PrismaClient) {
    this.testService = new TestService(prisma);
    this.questionService = new QuestionService(prisma);
  }

  /**
   * Получает ответ по ID
   * @param answerId - ID ответа
   */
  async getAnswerById(answerId: string): Promise<AnswerWithPoints> {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        resultPoints: true,
      },
    });

    if (!answer) {
      throw new NotFoundError('Answer');
    }

    return answer;
  }

  /**
   * Создаёт новый ответ
   * @param questionId - ID вопроса
   * @param ownerId - ID владельца
   * @param input - данные ответа
   */
  async createAnswer(
    questionId: string,
    ownerId: string,
    input: CreateAnswerInput
  ): Promise<AnswerWithPoints> {
    // Получаем вопрос
    const question = await this.questionService.getQuestionById(questionId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(question.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Получаем следующий порядковый номер
    const maxOrder = await this.prisma.answer.aggregate({
      where: { questionId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Создаём ответ
    const answer = await this.prisma.answer.create({
      data: {
        questionId,
        text: input.text,
        imageUrl: input.imageUrl,
        isCorrect: input.isCorrect ?? false,
        nextQuestionId: input.nextQuestionId,
        resultId: input.resultId,
        order: nextOrder,
        resultPoints: input.resultPoints
          ? {
              create: input.resultPoints.map((rp) => ({
                resultId: rp.resultId,
                points: rp.points,
              })),
            }
          : undefined,
      },
      include: {
        resultPoints: true,
      },
    });

    return answer;
  }

  /**
   * Обновляет ответ
   * @param answerId - ID ответа
   * @param ownerId - ID владельца
   * @param input - данные для обновления
   */
  async updateAnswer(
    answerId: string,
    ownerId: string,
    input: UpdateAnswerInput
  ): Promise<AnswerWithPoints> {
    // Получаем ответ
    const answer = await this.getAnswerById(answerId);

    // Получаем вопрос
    const question = await this.questionService.getQuestionById(answer.questionId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(question.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Обновляем resultPoints если переданы
    if (input.resultPoints !== undefined) {
      // Удаляем старые points
      await this.prisma.answerResultPoint.deleteMany({
        where: { answerId },
      });

      // Создаём новые
      if (input.resultPoints.length > 0) {
        await this.prisma.answerResultPoint.createMany({
          data: input.resultPoints.map((rp) => ({
            answerId,
            resultId: rp.resultId,
            points: rp.points,
          })),
        });
      }
    }

    // Обновляем ответ
    const updatedAnswer = await this.prisma.answer.update({
      where: { id: answerId },
      data: {
        text: input.text,
        imageUrl: input.imageUrl,
        isCorrect: input.isCorrect,
        nextQuestionId: input.nextQuestionId,
        resultId: input.resultId,
      },
      include: {
        resultPoints: true,
      },
    });

    return updatedAnswer;
  }

  /**
   * Удаляет ответ
   * @param answerId - ID ответа
   * @param ownerId - ID владельца
   */
  async deleteAnswer(answerId: string, ownerId: string): Promise<void> {
    // Получаем ответ
    const answer = await this.getAnswerById(answerId);

    // Получаем вопрос
    const question = await this.questionService.getQuestionById(answer.questionId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(question.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Удаляем ответ
    await this.prisma.answer.delete({
      where: { id: answerId },
    });

    // Пересчитываем порядок оставшихся ответов
    await this.reorderAfterDelete(answer.questionId, answer.order);
  }

  /**
   * Пересчитывает порядок ответов после удаления
   */
  private async reorderAfterDelete(questionId: string, deletedOrder: number): Promise<void> {
    await this.prisma.answer.updateMany({
      where: {
        questionId,
        order: { gt: deletedOrder },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  }
}
