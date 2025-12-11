/**
 * Сервис аналитики
 */

import type { PrismaClient } from '@prisma/client';
import { TestService } from './test.service.js';

/**
 * Статистика по вопросу
 */
export interface QuestionStats {
  questionId: string;
  questionText: string;
  totalAnswers: number;
  answerDistribution: Array<{
    answerId: string;
    answerText: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Статистика по результатам
 */
export interface ResultStats {
  resultId: string;
  resultTitle: string;
  count: number;
  percentage: number;
}

/**
 * Полная аналитика теста
 */
export interface TestAnalytics {
  testId: string;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageScore: number | null;
  questionStats: QuestionStats[];
  resultStats: ResultStats[];
}

/**
 * Сервис аналитики
 */
export class AnalyticsService {
  private testService: TestService;

  constructor(private prisma: PrismaClient) {
    this.testService = new TestService(prisma);
  }

  /**
   * Получает аналитику теста
   * @param testId - ID теста
   * @param ownerId - ID владельца
   */
  async getTestAnalytics(testId: string, ownerId: string): Promise<TestAnalytics> {
    // Проверяем доступ
    const test = await this.testService.getTestById(testId, ownerId);

    // Общая статистика сессий
    const [totalSessions, completedSessions] = await Promise.all([
      this.prisma.userSession.count({
        where: { testId },
      }),
      this.prisma.userSession.count({
        where: { testId, completedAt: { not: null } },
      }),
    ]);

    const completionRate = totalSessions > 0
      ? (completedSessions / totalSessions) * 100
      : 0;

    // Средний балл (для quiz тестов)
    let averageScore: number | null = null;
    if (test.type === 'quiz') {
      const scoreStats = await this.prisma.userSession.aggregate({
        where: {
          testId,
          completedAt: { not: null },
          score: { not: null },
        },
        _avg: { score: true },
      });
      averageScore = scoreStats._avg.score;
    }

    // Статистика по вопросам
    const questionStats = await this.getQuestionStats(testId, test.questions);

    // Статистика по результатам
    const resultStats = await this.getResultStats(testId, test.results, completedSessions);

    return {
      testId,
      totalSessions,
      completedSessions,
      completionRate: Math.round(completionRate * 10) / 10,
      averageScore,
      questionStats,
      resultStats,
    };
  }

  /**
   * Получает статистику по вопросам
   */
  private async getQuestionStats(
    testId: string,
    questions: any[]
  ): Promise<QuestionStats[]> {
    const stats: QuestionStats[] = [];

    for (const question of questions) {
      // Получаем все ответы на этот вопрос
      const answerCounts = await this.prisma.userAnswer.groupBy({
        by: ['answerId'],
        where: { questionId: question.id },
        _count: { answerId: true },
      });

      const totalAnswers = answerCounts.reduce((sum, ac) => sum + ac._count.answerId, 0);

      const answerDistribution = question.answers.map((answer: any) => {
        const countData = answerCounts.find((ac) => ac.answerId === answer.id);
        const count = countData?._count.answerId ?? 0;
        const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;

        return {
          answerId: answer.id,
          answerText: answer.text,
          count,
          percentage: Math.round(percentage * 10) / 10,
        };
      });

      stats.push({
        questionId: question.id,
        questionText: question.text,
        totalAnswers,
        answerDistribution,
      });
    }

    return stats;
  }

  /**
   * Получает статистику по результатам
   */
  private async getResultStats(
    testId: string,
    results: any[],
    totalCompleted: number
  ): Promise<ResultStats[]> {
    const stats: ResultStats[] = [];

    for (const result of results) {
      const count = await this.prisma.userSession.count({
        where: {
          testId,
          resultId: result.id,
          completedAt: { not: null },
        },
      });

      const percentage = totalCompleted > 0 ? (count / totalCompleted) * 100 : 0;

      stats.push({
        resultId: result.id,
        resultTitle: result.title,
        count,
        percentage: Math.round(percentage * 10) / 10,
      });
    }

    return stats;
  }
}
