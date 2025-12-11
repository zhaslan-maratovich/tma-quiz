/**
 * Сервис для работы с тестами
 */

import type { PrismaClient, Test, TestType, TestStatus, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, LimitExceededError, InvalidStateError } from '../utils/errors.js';
import { LIMITS } from '../types/index.js';

/**
 * Данные для создания теста
 */
export interface CreateTestInput {
  type: TestType;
  allowRetake?: boolean;
  welcomeScreen: {
    title: string;
    description?: string;
    imageUrl?: string;
    buttonText?: string;
  };
}

/**
 * Данные для обновления теста
 */
export interface UpdateTestInput {
  allowRetake?: boolean;
  welcomeScreen?: {
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    buttonText?: string;
  };
}

/**
 * Тест с включёнными связями
 */
export type TestWithRelations = Prisma.TestGetPayload<{
  include: {
    welcomeScreen: true;
    questions: {
      include: {
        answers: {
          include: {
            resultPoints: true;
          };
        };
      };
    };
    results: true;
  };
}>;

/**
 * Сервис для работы с тестами
 */
export class TestService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Получает список тестов пользователя
   * @param ownerId - ID владельца
   */
  async getTestsByOwner(ownerId: string): Promise<Test[]> {
    return this.prisma.test.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        welcomeScreen: true,
        _count: {
          select: {
            questions: true,
            sessions: true,
          },
        },
      },
    });
  }

  /**
   * Получает тест по ID
   * @param testId - ID теста
   * @param ownerId - ID владельца (для проверки доступа)
   */
  async getTestById(testId: string, ownerId: string): Promise<TestWithRelations> {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        welcomeScreen: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              include: {
                resultPoints: true,
              },
            },
          },
        },
        results: true,
      },
    });

    if (!test) {
      throw new NotFoundError('Test');
    }

    if (test.ownerId !== ownerId) {
      throw new ForbiddenError('You do not have access to this test');
    }

    return test;
  }

  /**
   * Создаёт новый тест
   * @param ownerId - ID владельца
   * @param input - данные для создания
   */
  async createTest(ownerId: string, input: CreateTestInput): Promise<TestWithRelations> {
    // Проверяем лимит тестов
    const testCount = await this.prisma.test.count({
      where: { ownerId },
    });

    if (testCount >= LIMITS.MAX_TESTS_PER_USER) {
      throw new LimitExceededError('Tests', LIMITS.MAX_TESTS_PER_USER);
    }

    // Создаём тест с welcome screen
    const test = await this.prisma.test.create({
      data: {
        ownerId,
        type: input.type,
        allowRetake: input.allowRetake ?? false,
        welcomeScreen: {
          create: {
            title: input.welcomeScreen.title,
            description: input.welcomeScreen.description,
            imageUrl: input.welcomeScreen.imageUrl,
            buttonText: input.welcomeScreen.buttonText ?? 'Начать',
          },
        },
      },
      include: {
        welcomeScreen: true,
        questions: {
          include: {
            answers: {
              include: {
                resultPoints: true,
              },
            },
          },
        },
        results: true,
      },
    });

    return test;
  }

  /**
   * Обновляет тест
   * @param testId - ID теста
   * @param ownerId - ID владельца
   * @param input - данные для обновления
   */
  async updateTest(testId: string, ownerId: string, input: UpdateTestInput): Promise<TestWithRelations> {
    // Получаем тест и проверяем доступ
    const test = await this.getTestById(testId, ownerId);

    // Проверяем статус
    if (test.status === 'published') {
      throw new InvalidStateError('Cannot update published test');
    }

    // Обновляем тест
    const updatedTest = await this.prisma.test.update({
      where: { id: testId },
      data: {
        allowRetake: input.allowRetake,
        welcomeScreen: input.welcomeScreen
          ? {
              update: {
                title: input.welcomeScreen.title,
                description: input.welcomeScreen.description,
                imageUrl: input.welcomeScreen.imageUrl,
                buttonText: input.welcomeScreen.buttonText,
              },
            }
          : undefined,
      },
      include: {
        welcomeScreen: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              include: {
                resultPoints: true,
              },
            },
          },
        },
        results: true,
      },
    });

    return updatedTest;
  }

  /**
   * Удаляет тест
   * @param testId - ID теста
   * @param ownerId - ID владельца
   */
  async deleteTest(testId: string, ownerId: string): Promise<void> {
    // Получаем тест и проверяем доступ
    await this.getTestById(testId, ownerId);

    // Удаляем тест (каскадно удалит все связанные данные)
    await this.prisma.test.delete({
      where: { id: testId },
    });
  }

  /**
   * Проверяет владельца теста
   * @param testId - ID теста
   * @param ownerId - ID предполагаемого владельца
   */
  async verifyOwnership(testId: string, ownerId: string): Promise<Test> {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundError('Test');
    }

    if (test.ownerId !== ownerId) {
      throw new ForbiddenError('You do not have access to this test');
    }

    return test;
  }

  /**
   * Проверяет, что тест в статусе draft
   * @param test - тест
   */
  assertDraftStatus(test: Test): void {
    if (test.status === 'published') {
      throw new InvalidStateError('Cannot modify published test');
    }
  }
}
