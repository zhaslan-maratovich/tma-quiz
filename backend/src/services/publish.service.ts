/**
 * Сервис публикации тестов
 */

import type { PrismaClient, TestType } from '@prisma/client';
import { TestService, TestWithRelations } from './test.service.js';
import { ValidationError, InvalidStateError } from '../utils/errors.js';
import { generateSlug } from '../utils/slug.js';

/**
 * Ошибка валидации теста
 */
interface ValidationIssue {
  field: string;
  message: string;
}

/**
 * Сервис публикации тестов
 */
export class PublishService {
  private testService: TestService;

  constructor(private prisma: PrismaClient) {
    this.testService = new TestService(prisma);
  }

  /**
   * Публикует тест
   * @param testId - ID теста
   * @param ownerId - ID владельца
   */
  async publishTest(testId: string, ownerId: string): Promise<TestWithRelations> {
    // Получаем полный тест
    const test = await this.testService.getTestById(testId, ownerId);

    // Проверяем статус
    if (test.status === 'published') {
      throw new InvalidStateError('Test is already published');
    }

    // Валидируем тест
    const issues = this.validateTest(test);
    if (issues.length > 0) {
      throw new ValidationError('Test validation failed', issues);
    }

    // Генерируем уникальный slug
    let slug = generateSlug();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await this.prisma.test.findUnique({
        where: { slug },
      });

      if (!existing) break;

      slug = generateSlug();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique slug');
    }

    // Публикуем тест
    const publishedTest = await this.prisma.test.update({
      where: { id: testId },
      data: {
        status: 'published',
        slug,
        publishedAt: new Date(),
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

    return publishedTest;
  }

  /**
   * Валидирует тест перед публикацией
   */
  private validateTest(test: TestWithRelations): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Проверяем welcome screen
    if (!test.welcomeScreen) {
      issues.push({ field: 'welcomeScreen', message: 'Welcome screen is required' });
    } else if (!test.welcomeScreen.title) {
      issues.push({ field: 'welcomeScreen.title', message: 'Welcome screen title is required' });
    }

    // Проверяем вопросы
    if (test.questions.length === 0) {
      issues.push({ field: 'questions', message: 'At least one question is required' });
    }

    // Проверяем каждый вопрос
    test.questions.forEach((question, index) => {
      if (question.answers.length < 2) {
        issues.push({
          field: `questions[${index}].answers`,
          message: `Question "${question.text}" must have at least 2 answers`,
        });
      }
    });

    // Валидация в зависимости от типа теста
    switch (test.type) {
      case 'quiz':
        this.validateQuiz(test, issues);
        break;
      case 'personality':
        this.validatePersonality(test, issues);
        break;
      case 'branching':
        this.validateBranching(test, issues);
        break;
    }

    return issues;
  }

  /**
   * Валидация Quiz теста
   */
  private validateQuiz(test: TestWithRelations, issues: ValidationIssue[]): void {
    test.questions.forEach((question, index) => {
      const hasCorrectAnswer = question.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) {
        issues.push({
          field: `questions[${index}]`,
          message: `Question "${question.text}" must have at least one correct answer`,
        });
      }
    });
  }

  /**
   * Валидация Personality теста
   */
  private validatePersonality(test: TestWithRelations, issues: ValidationIssue[]): void {
    // Должен быть хотя бы один результат
    if (test.results.length === 0) {
      issues.push({
        field: 'results',
        message: 'Personality test must have at least one result',
      });
    }

    // Каждый ответ должен иметь points
    test.questions.forEach((question, qIndex) => {
      question.answers.forEach((answer, aIndex) => {
        if (answer.resultPoints.length === 0) {
          issues.push({
            field: `questions[${qIndex}].answers[${aIndex}]`,
            message: `Answer "${answer.text}" must have result points`,
          });
        }
      });
    });
  }

  /**
   * Валидация Branching теста
   */
  private validateBranching(test: TestWithRelations, issues: ValidationIssue[]): void {
    // Должен быть хотя бы один результат
    if (test.results.length === 0) {
      issues.push({
        field: 'results',
        message: 'Branching test must have at least one result',
      });
    }

    // Проверяем, что все ветки ведут к результату или следующему вопросу
    const questionIds = new Set(test.questions.map((q) => q.id));
    const resultIds = new Set(test.results.map((r) => r.id));

    test.questions.forEach((question, qIndex) => {
      question.answers.forEach((answer, aIndex) => {
        const hasNextQuestion = answer.nextQuestionId && questionIds.has(answer.nextQuestionId);
        const hasResult = answer.resultId && resultIds.has(answer.resultId);

        if (!hasNextQuestion && !hasResult) {
          issues.push({
            field: `questions[${qIndex}].answers[${aIndex}]`,
            message: `Answer "${answer.text}" must lead to a next question or result`,
          });
        }
      });
    });
  }
}
