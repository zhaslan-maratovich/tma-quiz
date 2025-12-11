/**
 * Сервис для работы с вопросами
 */

import type { PrismaClient, Question, Prisma } from '@prisma/client';
import { NotFoundError, LimitExceededError } from '../utils/errors.js';
import { TestService } from './test.service.js';
import { LIMITS } from '../types/index.js';

/**
 * Данные для создания вопроса
 */
export interface CreateQuestionInput {
  text: string;
  imageUrl?: string;
}

/**
 * Данные для обновления вопроса
 */
export interface UpdateQuestionInput {
  text?: string;
  imageUrl?: string | null;
}

/**
 * Данные для изменения порядка вопросов
 */
export interface ReorderQuestionsInput {
  questionIds: string[];
}

/**
 * Вопрос с ответами
 */
export type QuestionWithAnswers = Prisma.QuestionGetPayload<{
  include: {
    answers: {
      include: {
        resultPoints: true;
      };
    };
  };
}>;

/**
 * Сервис для работы с вопросами
 */
export class QuestionService {
  private testService: TestService;

  constructor(private prisma: PrismaClient) {
    this.testService = new TestService(prisma);
  }

  /**
   * Получает вопрос по ID
   * @param questionId - ID вопроса
   */
  async getQuestionById(questionId: string): Promise<QuestionWithAnswers> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: {
          orderBy: { order: 'asc' },
          include: {
            resultPoints: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Question');
    }

    return question;
  }

  /**
   * Создаёт новый вопрос
   * @param testId - ID теста
   * @param ownerId - ID владельца
   * @param input - данные вопроса
   */
  async createQuestion(
    testId: string,
    ownerId: string,
    input: CreateQuestionInput
  ): Promise<QuestionWithAnswers> {
    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Проверяем лимит вопросов
    const questionCount = await this.prisma.question.count({
      where: { testId },
    });

    if (questionCount >= LIMITS.MAX_QUESTIONS_PER_TEST) {
      throw new LimitExceededError('Questions', LIMITS.MAX_QUESTIONS_PER_TEST);
    }

    // Получаем следующий порядковый номер
    const maxOrder = await this.prisma.question.aggregate({
      where: { testId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    // Создаём вопрос
    const question = await this.prisma.question.create({
      data: {
        testId,
        text: input.text,
        imageUrl: input.imageUrl,
        order: nextOrder,
      },
      include: {
        answers: {
          include: {
            resultPoints: true,
          },
        },
      },
    });

    return question;
  }

  /**
   * Обновляет вопрос
   * @param questionId - ID вопроса
   * @param ownerId - ID владельца
   * @param input - данные для обновления
   */
  async updateQuestion(
    questionId: string,
    ownerId: string,
    input: UpdateQuestionInput
  ): Promise<QuestionWithAnswers> {
    // Получаем вопрос
    const question = await this.getQuestionById(questionId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(question.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Обновляем вопрос
    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        text: input.text,
        imageUrl: input.imageUrl,
      },
      include: {
        answers: {
          orderBy: { order: 'asc' },
          include: {
            resultPoints: true,
          },
        },
      },
    });

    return updatedQuestion;
  }

  /**
   * Удаляет вопрос
   * @param questionId - ID вопроса
   * @param ownerId - ID владельца
   */
  async deleteQuestion(questionId: string, ownerId: string): Promise<void> {
    // Получаем вопрос
    const question = await this.getQuestionById(questionId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(question.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Удаляем вопрос
    await this.prisma.question.delete({
      where: { id: questionId },
    });

    // Пересчитываем порядок оставшихся вопросов
    await this.reorderAfterDelete(question.testId, question.order);
  }

  /**
   * Изменяет порядок вопросов
   * @param testId - ID теста
   * @param ownerId - ID владельца
   * @param input - новый порядок
   */
  async reorderQuestions(
    testId: string,
    ownerId: string,
    input: ReorderQuestionsInput
  ): Promise<QuestionWithAnswers[]> {
    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Обновляем порядок в транзакции
    await this.prisma.$transaction(
      input.questionIds.map((id, index) =>
        this.prisma.question.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    // Возвращаем обновлённые вопросы
    const questions = await this.prisma.question.findMany({
      where: { testId },
      orderBy: { order: 'asc' },
      include: {
        answers: {
          orderBy: { order: 'asc' },
          include: {
            resultPoints: true,
          },
        },
      },
    });

    return questions;
  }

  /**
   * Пересчитывает порядок вопросов после удаления
   */
  private async reorderAfterDelete(testId: string, deletedOrder: number): Promise<void> {
    await this.prisma.question.updateMany({
      where: {
        testId,
        order: { gt: deletedOrder },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  }
}
