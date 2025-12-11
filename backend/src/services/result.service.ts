/**
 * Сервис для работы с результатами (финальными экранами)
 */

import type { PrismaClient, TestResult } from '@prisma/client';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { TestService } from './test.service.js';

/**
 * Данные для создания результата
 */
export interface CreateResultInput {
  title: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Данные для обновления результата
 */
export interface UpdateResultInput {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
}

/**
 * Сервис для работы с результатами
 */
export class ResultService {
  private testService: TestService;

  constructor(private prisma: PrismaClient) {
    this.testService = new TestService(prisma);
  }

  /**
   * Получает результат по ID
   * @param resultId - ID результата
   */
  async getResultById(resultId: string): Promise<TestResult> {
    const result = await this.prisma.testResult.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      throw new NotFoundError('Result');
    }

    return result;
  }

  /**
   * Создаёт новый результат
   * @param testId - ID теста
   * @param ownerId - ID владельца
   * @param input - данные результата
   */
  async createResult(
    testId: string,
    ownerId: string,
    input: CreateResultInput
  ): Promise<TestResult> {
    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Создаём результат
    const result = await this.prisma.testResult.create({
      data: {
        testId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
      },
    });

    return result;
  }

  /**
   * Обновляет результат
   * @param resultId - ID результата
   * @param ownerId - ID владельца
   * @param input - данные для обновления
   */
  async updateResult(
    resultId: string,
    ownerId: string,
    input: UpdateResultInput
  ): Promise<TestResult> {
    // Получаем результат
    const result = await this.getResultById(resultId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(result.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Обновляем результат
    const updatedResult = await this.prisma.testResult.update({
      where: { id: resultId },
      data: {
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
      },
    });

    return updatedResult;
  }

  /**
   * Удаляет результат
   * @param resultId - ID результата
   * @param ownerId - ID владельца
   */
  async deleteResult(resultId: string, ownerId: string): Promise<void> {
    // Получаем результат
    const result = await this.getResultById(resultId);

    // Проверяем доступ и статус теста
    const test = await this.testService.verifyOwnership(result.testId, ownerId);
    this.testService.assertDraftStatus(test);

    // Проверяем, что нет ответов, ссылающихся на этот результат
    const answersCount = await this.prisma.answer.count({
      where: { resultId },
    });

    if (answersCount > 0) {
      throw new ConflictError(
        `Cannot delete result: ${answersCount} answer(s) reference this result`
      );
    }

    // Проверяем, что нет answerResultPoints, ссылающихся на этот результат
    const pointsCount = await this.prisma.answerResultPoint.count({
      where: { resultId },
    });

    if (pointsCount > 0) {
      throw new ConflictError(
        `Cannot delete result: ${pointsCount} answer point(s) reference this result`
      );
    }

    // Удаляем результат
    await this.prisma.testResult.delete({
      where: { id: resultId },
    });
  }
}
