/**
 * Mock данные для тестов
 */

import type { Test, PlayTest, TestAnalytics } from '@/types';

/**
 * Генератор уникальных ID
 */
let idCounter = 1;
export const generateId = (): string => `mock-id-${idCounter++}`;

/**
 * Мок-тесты
 */
export const mockTests: Test[] = [
    {
        id: 'test-1',
        ownerId: 'user-1',
        type: 'quiz',
        status: 'published',
        slug: 'quiz-example',
        allowRetake: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        welcomeScreen: {
            id: 'ws-1',
            testId: 'test-1',
            title: 'Тест на знание JavaScript',
            description: 'Проверьте свои знания JavaScript с помощью этого теста!',
            imageUrl: null,
            buttonText: 'Начать тест',
        },
        questions: [
            {
                id: 'q-1',
                testId: 'test-1',
                order: 0,
                text: 'Какой тип данных возвращает typeof null?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-1',
                        questionId: 'q-1',
                        order: 0,
                        text: 'null',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: null,
                    },
                    {
                        id: 'a-2',
                        questionId: 'q-1',
                        order: 1,
                        text: 'object',
                        imageUrl: null,
                        isCorrect: true,
                        nextQuestionId: null,
                        resultId: null,
                    },
                    {
                        id: 'a-3',
                        questionId: 'q-1',
                        order: 2,
                        text: 'undefined',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: null,
                    },
                ],
            },
            {
                id: 'q-2',
                testId: 'test-1',
                order: 1,
                text: 'Что выведет console.log(1 + "2")?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-4',
                        questionId: 'q-2',
                        order: 0,
                        text: '3',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: null,
                    },
                    {
                        id: 'a-5',
                        questionId: 'q-2',
                        order: 1,
                        text: '"12"',
                        imageUrl: null,
                        isCorrect: true,
                        nextQuestionId: null,
                        resultId: null,
                    },
                    {
                        id: 'a-6',
                        questionId: 'q-2',
                        order: 2,
                        text: 'NaN',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: null,
                    },
                ],
            },
            {
                id: 'q-3',
                testId: 'test-1',
                order: 2,
                text: 'Какой метод массива НЕ изменяет оригинальный массив?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-7',
                        questionId: 'q-3',
                        order: 0,
                        text: 'push()',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: null,
                    },
                    {
                        id: 'a-8',
                        questionId: 'q-3',
                        order: 1,
                        text: 'splice()',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: null,
                    },
                    {
                        id: 'a-9',
                        questionId: 'q-3',
                        order: 2,
                        text: 'map()',
                        imageUrl: null,
                        isCorrect: true,
                        nextQuestionId: null,
                        resultId: null,
                    },
                ],
            },
        ],
        results: [],
        _count: {
            sessions: 42,
        },
    },
    {
        id: 'test-2',
        ownerId: 'user-1',
        type: 'personality',
        status: 'draft',
        slug: null,
        allowRetake: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        publishedAt: null,
        welcomeScreen: {
            id: 'ws-2',
            testId: 'test-2',
            title: 'Кто ты из программистов?',
            description: 'Узнай, какой ты разработчик!',
            imageUrl: null,
            buttonText: 'Пройти тест',
        },
        questions: [
            {
                id: 'q-4',
                testId: 'test-2',
                order: 0,
                text: 'Как ты предпочитаешь решать проблемы?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-10',
                        questionId: 'q-4',
                        order: 0,
                        text: 'Методично и последовательно',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: 'result-1',
                        resultPoints: [{ id: 'rp-1', answerId: 'a-10', resultId: 'result-1', points: 2 }],
                    },
                    {
                        id: 'a-11',
                        questionId: 'q-4',
                        order: 1,
                        text: 'Креативно и нестандартно',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: 'result-2',
                        resultPoints: [{ id: 'rp-2', answerId: 'a-11', resultId: 'result-2', points: 2 }],
                    },
                ],
            },
        ],
        results: [
            {
                id: 'result-1',
                testId: 'test-2',
                title: 'Backend разработчик',
                description: 'Ты любишь порядок и логику. Backend - твоя стихия!',
                imageUrl: null,
            },
            {
                id: 'result-2',
                testId: 'test-2',
                title: 'Frontend разработчик',
                description: 'Ты креативен и любишь визуальные результаты!',
                imageUrl: null,
            },
        ],
        _count: {
            sessions: 0,
        },
    },
    {
        id: 'test-3',
        ownerId: 'user-1',
        type: 'branching',
        status: 'published',
        slug: 'adventure-test',
        allowRetake: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        welcomeScreen: {
            id: 'ws-3',
            testId: 'test-3',
            title: 'Приключение программиста',
            description: 'Интерактивная история с выборами!',
            imageUrl: null,
            buttonText: 'Начать приключение',
        },
        questions: [
            {
                id: 'q-5',
                testId: 'test-3',
                order: 0,
                text: 'Ты приходишь на работу. Что делаешь первым делом?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-12',
                        questionId: 'q-5',
                        order: 0,
                        text: 'Проверяю почту и Slack',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: 'q-6',
                        resultId: null,
                    },
                    {
                        id: 'a-13',
                        questionId: 'q-5',
                        order: 1,
                        text: 'Сразу открываю IDE',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: 'q-7',
                        resultId: null,
                    },
                ],
            },
            {
                id: 'q-6',
                testId: 'test-3',
                order: 1,
                text: 'В почте срочное письмо от PM. Что делаешь?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-14',
                        questionId: 'q-6',
                        order: 0,
                        text: 'Отвечаю сразу',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: 'result-3',
                    },
                    {
                        id: 'a-15',
                        questionId: 'q-6',
                        order: 1,
                        text: 'Откладываю на потом',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: 'result-4',
                    },
                ],
            },
            {
                id: 'q-7',
                testId: 'test-3',
                order: 2,
                text: 'В коде баг. Твои действия?',
                imageUrl: null,
                answers: [
                    {
                        id: 'a-16',
                        questionId: 'q-7',
                        order: 0,
                        text: 'Добавляю console.log везде',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: 'result-4',
                    },
                    {
                        id: 'a-17',
                        questionId: 'q-7',
                        order: 1,
                        text: 'Использую debugger',
                        imageUrl: null,
                        isCorrect: false,
                        nextQuestionId: null,
                        resultId: 'result-3',
                    },
                ],
            },
        ],
        results: [
            {
                id: 'result-3',
                testId: 'test-3',
                title: 'Ответственный разработчик',
                description: 'Ты всегда делаешь правильный выбор!',
                imageUrl: null,
            },
            {
                id: 'result-4',
                testId: 'test-3',
                title: 'Хаотичный программист',
                description: 'Творческий подход - это тоже подход!',
                imageUrl: null,
            },
        ],
        _count: {
            sessions: 15,
        },
    },
];

/**
 * Конвертация Test в PlayTest для прохождения
 */
export function testToPlayTest(test: Test): PlayTest {
    return {
        id: test.id,
        type: test.type,
        slug: test.slug || '',
        allowRetake: test.allowRetake,
        welcomeScreen: test.welcomeScreen,
        questions: test.questions.map((q) => ({
            id: q.id,
            order: q.order,
            text: q.text,
            imageUrl: q.imageUrl,
            answers: q.answers.map((a) => ({
                id: a.id,
                order: a.order,
                text: a.text,
                imageUrl: a.imageUrl,
            })),
        })),
        questionsCount: test.questions.length,
    };
}

/**
 * Мок-аналитика
 */
export const mockAnalytics: Record<string, TestAnalytics> = {
    'test-1': {
        totalSessions: 42,
        completedSessions: 38,
        completionRate: 90.5,
        questionStats: [
            {
                questionId: 'q-1',
                questionText: 'Какой тип данных возвращает typeof null?',
                totalAnswers: 38,
                answerDistribution: [
                    { answerId: 'a-1', answerText: 'null', count: 8, percentage: 21.05, isCorrect: false },
                    { answerId: 'a-2', answerText: 'object', count: 25, percentage: 65.79, isCorrect: true },
                    { answerId: 'a-3', answerText: 'undefined', count: 5, percentage: 13.16, isCorrect: false },
                ],
            },
            {
                questionId: 'q-2',
                questionText: 'Что выведет console.log(1 + "2")?',
                totalAnswers: 38,
                answerDistribution: [
                    { answerId: 'a-4', answerText: '3', count: 12, percentage: 31.58, isCorrect: false },
                    { answerId: 'a-5', answerText: '"12"', count: 22, percentage: 57.89, isCorrect: true },
                    { answerId: 'a-6', answerText: 'NaN', count: 4, percentage: 10.53, isCorrect: false },
                ],
            },
            {
                questionId: 'q-3',
                questionText: 'Какой метод массива НЕ изменяет оригинальный массив?',
                totalAnswers: 38,
                answerDistribution: [
                    { answerId: 'a-7', answerText: 'push()', count: 5, percentage: 13.16, isCorrect: false },
                    { answerId: 'a-8', answerText: 'splice()', count: 8, percentage: 21.05, isCorrect: false },
                    { answerId: 'a-9', answerText: 'map()', count: 25, percentage: 65.79, isCorrect: true },
                ],
            },
        ],
        resultStats: [],
    },
    'test-3': {
        totalSessions: 15,
        completedSessions: 12,
        completionRate: 80.0,
        questionStats: [],
        resultStats: [
            {
                resultId: 'result-3',
                resultTitle: 'Ответственный разработчик',
                count: 7,
                percentage: 58.33,
            },
            {
                resultId: 'result-4',
                resultTitle: 'Хаотичный программист',
                count: 5,
                percentage: 41.67,
            },
        ],
    },
};
