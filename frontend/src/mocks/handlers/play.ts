/**
 * MSW Handlers для прохождения тестов (play)
 */

import { http, HttpResponse } from 'msw';
import { testToPlayTest, mockUser, mockStore } from '../data';
import { createSession, getSessionByUserAndTest, completeSession, mockSessions } from '../data/sessions';
import type { ApiResponse, PlayTest, UserSession, SubmitAnswersInput, Test } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Вычислить результат quiz теста
 */
function calculateQuizResult(
    test: Test,
    answers: { questionId: string; answerId: string }[]
): { score: number; maxScore: number } {
    let score = 0;
    const maxScore = test.questions.length;

    for (const userAnswer of answers) {
        const question = test.questions.find((q) => q.id === userAnswer.questionId);
        if (question) {
            const answer = question.answers.find((a) => a.id === userAnswer.answerId);
            if (answer?.isCorrect) {
                score++;
            }
        }
    }

    return { score, maxScore };
}

/**
 * Вычислить результат personality теста
 */
function calculatePersonalityResult(
    test: Test,
    answers: { questionId: string; answerId: string }[]
): string | null {
    const pointsPerResult: Record<string, number> = {};

    // Инициализируем все результаты
    for (const result of test.results) {
        pointsPerResult[result.id] = 0;
    }

    // Считаем очки
    for (const userAnswer of answers) {
        const question = test.questions.find((q) => q.id === userAnswer.questionId);
        if (question) {
            const answer = question.answers.find((a) => a.id === userAnswer.answerId);
            if (answer?.resultPoints) {
                for (const rp of answer.resultPoints) {
                    pointsPerResult[rp.resultId] = (pointsPerResult[rp.resultId] || 0) + rp.points;
                }
            }
        }
    }

    // Находим результат с максимальным количеством очков
    let maxPoints = 0;
    let resultId: string | null = null;

    for (const [id, points] of Object.entries(pointsPerResult)) {
        if (points > maxPoints) {
            maxPoints = points;
            resultId = id;
        }
    }

    return resultId;
}

/**
 * Вычислить результат branching теста
 */
function calculateBranchingResult(
    test: Test,
    answers: { questionId: string; answerId: string }[]
): string | null {
    // Последний ответ определяет результат
    if (answers.length === 0) return null;

    const lastAnswer = answers[answers.length - 1];
    const question = test.questions.find((q) => q.id === lastAnswer.questionId);
    if (question) {
        const answer = question.answers.find((a) => a.id === lastAnswer.answerId);
        return answer?.resultId || null;
    }

    return null;
}

export const playHandlers = [
    /**
     * GET /api/play/:slug - Получить тест для прохождения
     */
    http.get(`${API_URL}/api/play/:slug`, ({ params }) => {
        const { slug } = params;
        const test = mockStore.findTestBySlug(slug as string);

        if (!test) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Тест не найден или не опубликован',
                    },
                },
                { status: 404 }
            );
        }

        const playTest = testToPlayTest(test);

        const response: ApiResponse<PlayTest> = {
            success: true,
            data: playTest,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * GET /api/play/:slug/session - Проверить существующую сессию
     */
    http.get(`${API_URL}/api/play/:slug/session`, ({ params }) => {
        const { slug } = params;
        const test = mockStore.findTestBySlug(slug as string);

        if (!test) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Тест не найден',
                    },
                },
                { status: 404 }
            );
        }

        // Ищем существующую сессию пользователя
        const session = getSessionByUserAndTest(mockUser.id, test.id);

        // Если сессия есть и тест не разрешает повторное прохождение, возвращаем её
        if (session && session.completedAt && !test.allowRetake) {
            // Добавляем информацию о результате
            const result = test.results.find((r) => r.id === session.resultId);

            const response: ApiResponse<UserSession> = {
                success: true,
                data: {
                    ...session,
                    result: result || null,
                },
            };

            return HttpResponse.json(response, { status: 200 });
        }

        // Сессии нет или можно пройти заново
        const response: ApiResponse<null> = {
            success: true,
            data: null,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * POST /api/play/:slug/start - Начать прохождение
     */
    http.post(`${API_URL}/api/play/:slug/start`, ({ params }) => {
        const { slug } = params;
        const test = mockStore.findTestBySlug(slug as string);

        if (!test) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Тест не найден',
                    },
                },
                { status: 404 }
            );
        }

        // Проверяем, есть ли уже завершённая сессия
        const existingSession = getSessionByUserAndTest(mockUser.id, test.id);
        if (existingSession?.completedAt && !test.allowRetake) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'ALREADY_COMPLETED',
                        message: 'Вы уже прошли этот тест',
                    },
                },
                { status: 400 }
            );
        }

        // Если есть незавершённая сессия, удаляем её
        if (existingSession && !existingSession.completedAt) {
            mockSessions.delete(existingSession.id);
        }

        // Создаём новую сессию
        const session = createSession(mockUser.id, test.id);

        const response: ApiResponse<{ sessionId: string; testId: string }> = {
            success: true,
            data: {
                sessionId: session.id,
                testId: test.id,
            },
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * POST /api/play/:slug/submit - Отправить ответы
     */
    http.post(`${API_URL}/api/play/:slug/submit`, async ({ params, request }) => {
        const { slug } = params;
        const body = (await request.json()) as SubmitAnswersInput;
        const test = mockStore.findTestBySlug(slug as string);

        if (!test) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Тест не найден',
                    },
                },
                { status: 404 }
            );
        }

        // Находим активную сессию
        let session = getSessionByUserAndTest(mockUser.id, test.id);

        if (!session || session.completedAt) {
            // Создаём новую сессию если нет активной
            session = createSession(mockUser.id, test.id);
        }

        // Вычисляем результат в зависимости от типа теста
        let resultId: string | null = null;
        let score: number | null = null;
        let maxScore: number | null = null;

        switch (test.type) {
            case 'quiz': {
                const quizResult = calculateQuizResult(test, body.answers);
                score = quizResult.score;
                maxScore = quizResult.maxScore;
                break;
            }
            case 'personality': {
                resultId = calculatePersonalityResult(test, body.answers);
                break;
            }
            case 'branching': {
                resultId = calculateBranchingResult(test, body.answers);
                break;
            }
        }

        // Завершаем сессию
        const completedSession = completeSession(session.id, resultId, score, maxScore);

        if (!completedSession) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'SESSION_ERROR',
                        message: 'Ошибка сессии',
                    },
                },
                { status: 500 }
            );
        }

        // Добавляем информацию о результате
        const result = resultId ? test.results.find((r) => r.id === resultId) : null;

        // Добавляем детальную информацию об ответах для отображения результата
        const answersWithDetails = body.answers.map((ua) => {
            const question = test.questions.find((q) => q.id === ua.questionId);
            const answer = question?.answers.find((a) => a.id === ua.answerId);
            return {
                questionId: ua.questionId,
                answerId: ua.answerId,
                question,
                answer,
            };
        });

        const response: ApiResponse<UserSession> = {
            success: true,
            data: {
                ...completedSession,
                result: result || null,
                answers: answersWithDetails,
            },
        };

        return HttpResponse.json(response, { status: 200 });
    }),
];
