/**
 * Сервис прохождения теста
 */

import type { PrismaClient, Test, TestType, Prisma } from '@prisma/client';
import { NotFoundError, InvalidStateError, ForbiddenError } from '../utils/errors.js';

/**
 * Ответ пользователя
 */
export interface UserAnswerInput {
  questionId: string;
  answerId: string;
}

/**
 * Результат прохождения теста
 */
export interface PlayResult {
  sessionId: string;
  testType: TestType;
  result: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  } | null;
  score: number | null;
  maxScore: number | null;
  answers?: Array<{
    questionId: string;
    answerId: string;
    isCorrect: boolean | null;
  }>;
}

/**
 * Тест для прохождения
 */
export type PlayableTest = Prisma.TestGetPayload<{
  include: {
    welcomeScreen: true;
    questions: {
      include: {
        answers: true;
      };
    };
    results: true;
  };
}>;

/**
 * Сервис прохождения теста
 */
export class PlayService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Получает тест для прохождения по slug
   * @param slug - slug теста
   */
  async getTestBySlug(slug: string): Promise<PlayableTest> {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      include: {
        welcomeScreen: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                text: true,
                imageUrl: true,
                order: true,
                questionId: true,
                // Не показываем isCorrect, nextQuestionId, resultId для участника
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

    if (test.status !== 'published') {
      throw new NotFoundError('Test');
    }

    return test as PlayableTest;
  }

  /**
   * Проверяет существующую сессию
   * @param slug - slug теста
   * @param userId - ID пользователя
   */
  async getExistingSession(slug: string, userId: string) {
    const test = await this.getTestBySlug(slug);

    const session = await this.prisma.userSession.findUnique({
      where: {
        userId_testId: {
          userId,
          testId: test.id,
        },
      },
      include: {
        result: true,
        answers: true,
      },
    });

    if (!session) {
      return null;
    }

    // Если тест не позволяет перепрохождение и сессия завершена
    if (!test.allowRetake && session.completedAt) {
      return {
        completed: true,
        session: {
          id: session.id,
          score: session.score,
          maxScore: session.maxScore,
          result: session.result,
          completedAt: session.completedAt,
        },
      };
    }

    return {
      completed: !!session.completedAt,
      canRetake: test.allowRetake,
      session: {
        id: session.id,
        score: session.score,
        maxScore: session.maxScore,
        result: session.result,
        completedAt: session.completedAt,
      },
    };
  }

  /**
   * Начинает прохождение теста
   * @param slug - slug теста
   * @param userId - ID пользователя
   */
  async startTest(slug: string, userId: string) {
    const test = await this.getTestBySlug(slug);

    // Проверяем существующую сессию
    const existingSession = await this.prisma.userSession.findUnique({
      where: {
        userId_testId: {
          userId,
          testId: test.id,
        },
      },
    });

    if (existingSession) {
      // Если не разрешено перепрохождение и уже завершено
      if (!test.allowRetake && existingSession.completedAt) {
        throw new ForbiddenError('Test already completed and retake is not allowed');
      }

      // Если разрешено - сбрасываем сессию
      if (test.allowRetake && existingSession.completedAt) {
        await this.prisma.userAnswer.deleteMany({
          where: { sessionId: existingSession.id },
        });

        await this.prisma.userSession.update({
          where: { id: existingSession.id },
          data: {
            resultId: null,
            score: null,
            maxScore: null,
            completedAt: null,
            startedAt: new Date(),
          },
        });

        return { sessionId: existingSession.id, testId: test.id };
      }

      // Продолжаем незавершённую сессию
      return { sessionId: existingSession.id, testId: test.id };
    }

    // Создаём новую сессию
    const session = await this.prisma.userSession.create({
      data: {
        userId,
        testId: test.id,
      },
    });

    return { sessionId: session.id, testId: test.id };
  }

  /**
   * Отправляет ответы и завершает тест
   * @param slug - slug теста
   * @param userId - ID пользователя
   * @param answers - ответы пользователя
   */
  async submitAnswers(
    slug: string,
    userId: string,
    answers: UserAnswerInput[]
  ): Promise<PlayResult> {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      include: {
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

    if (!test || test.status !== 'published') {
      throw new NotFoundError('Test');
    }

    // Получаем сессию
    const session = await this.prisma.userSession.findUnique({
      where: {
        userId_testId: {
          userId,
          testId: test.id,
        },
      },
    });

    if (!session) {
      throw new InvalidStateError('Session not found. Please start the test first.');
    }

    // Сохраняем ответы
    for (const answer of answers) {
      await this.prisma.userAnswer.upsert({
        where: {
          sessionId_questionId: {
            sessionId: session.id,
            questionId: answer.questionId,
          },
        },
        create: {
          sessionId: session.id,
          questionId: answer.questionId,
          answerId: answer.answerId,
        },
        update: {
          answerId: answer.answerId,
        },
      });
    }

    // Вычисляем результат в зависимости от типа теста
    let result: PlayResult;

    switch (test.type) {
      case 'quiz':
        result = await this.calculateQuizResult(test, session.id, answers);
        break;
      case 'personality':
        result = await this.calculatePersonalityResult(test, session.id, answers);
        break;
      case 'branching':
        result = await this.calculateBranchingResult(test, session.id, answers);
        break;
      default:
        throw new InvalidStateError('Unknown test type');
    }

    // Обновляем сессию
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        resultId: result.result?.id,
        score: result.score,
        maxScore: result.maxScore,
        completedAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Вычисляет результат Quiz теста
   */
  private async calculateQuizResult(
    test: any,
    sessionId: string,
    userAnswers: UserAnswerInput[]
  ): Promise<PlayResult> {
    const answerMap = new Map(userAnswers.map((a) => [a.questionId, a.answerId]));
    let score = 0;
    const maxScore = test.questions.length;
    const answersResult: PlayResult['answers'] = [];

    for (const question of test.questions) {
      const userAnswerId = answerMap.get(question.id);
      const correctAnswer = question.answers.find((a: any) => a.isCorrect);
      const isCorrect = correctAnswer && userAnswerId === correctAnswer.id;

      if (isCorrect) {
        score++;
      }

      answersResult.push({
        questionId: question.id,
        answerId: userAnswerId ?? '',
        isCorrect: isCorrect ?? false,
      });
    }

    return {
      sessionId,
      testType: 'quiz',
      result: null,
      score,
      maxScore,
      answers: answersResult,
    };
  }

  /**
   * Вычисляет результат Personality теста
   */
  private async calculatePersonalityResult(
    test: any,
    sessionId: string,
    userAnswers: UserAnswerInput[]
  ): Promise<PlayResult> {
    const answerMap = new Map(userAnswers.map((a) => [a.questionId, a.answerId]));
    const resultPoints: Map<string, number> = new Map();

    // Подсчитываем очки для каждого результата
    for (const question of test.questions) {
      const userAnswerId = answerMap.get(question.id);
      const userAnswer = question.answers.find((a: any) => a.id === userAnswerId);

      if (userAnswer && userAnswer.resultPoints) {
        for (const rp of userAnswer.resultPoints) {
          const current = resultPoints.get(rp.resultId) ?? 0;
          resultPoints.set(rp.resultId, current + rp.points);
        }
      }
    }

    // Находим результат с максимальным количеством очков
    let maxPoints = 0;
    let winningResultId: string | null = null;

    resultPoints.forEach((points, resultId) => {
      if (points > maxPoints) {
        maxPoints = points;
        winningResultId = resultId;
      }
    });

    const winningResult = test.results.find((r: any) => r.id === winningResultId);

    return {
      sessionId,
      testType: 'personality',
      result: winningResult
        ? {
            id: winningResult.id,
            title: winningResult.title,
            description: winningResult.description,
            imageUrl: winningResult.imageUrl,
          }
        : null,
      score: maxPoints,
      maxScore: null,
    };
  }

  /**
   * Вычисляет результат Branching теста
   */
  private async calculateBranchingResult(
    test: any,
    sessionId: string,
    userAnswers: UserAnswerInput[]
  ): Promise<PlayResult> {
    // Для branching теста последний ответ должен вести к результату
    const lastUserAnswer = userAnswers[userAnswers.length - 1];

    if (!lastUserAnswer) {
      return {
        sessionId,
        testType: 'branching',
        result: null,
        score: null,
        maxScore: null,
      };
    }

    // Находим выбранный ответ
    for (const question of test.questions) {
      const answer = question.answers.find((a: any) => a.id === lastUserAnswer.answerId);
      if (answer && answer.resultId) {
        const result = test.results.find((r: any) => r.id === answer.resultId);
        if (result) {
          return {
            sessionId,
            testType: 'branching',
            result: {
              id: result.id,
              title: result.title,
              description: result.description,
              imageUrl: result.imageUrl,
            },
            score: null,
            maxScore: null,
          };
        }
      }
    }

    return {
      sessionId,
      testType: 'branching',
      result: null,
      score: null,
      maxScore: null,
    };
  }
}
