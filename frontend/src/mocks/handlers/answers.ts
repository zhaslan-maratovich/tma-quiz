/**
 * MSW Handlers для ответов
 */

import { http, HttpResponse } from 'msw';
import { generateId, mockStore } from '../data';
import type { ApiResponse, Answer, CreateAnswerInput, UpdateAnswerInput } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const answersHandlers = [
    /**
     * POST /api/questions/:questionId/answers - Добавить ответ
     */
    http.post(`${API_URL}/api/questions/:questionId/answers`, async ({ params, request }) => {
        const { questionId } = params;
        const body = (await request.json()) as CreateAnswerInput;

        let foundQuestion = null;

        for (const test of mockStore.tests) {
            const question = test.questions.find((q) => q.id === questionId);
            if (question) {
                foundQuestion = question;
                break;
            }
        }

        if (!foundQuestion) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Вопрос не найден',
                    },
                },
                { status: 404 }
            );
        }

        const newAnswer: Answer = {
            id: generateId(),
            questionId: questionId as string,
            order: foundQuestion.answers.length,
            text: body.text,
            imageUrl: body.imageUrl ?? null,
            isCorrect: body.isCorrect ?? false,
            nextQuestionId: body.nextQuestionId ?? null,
            resultId: body.resultId ?? null,
            resultPoints: body.resultPoints?.map((rp) => ({
                id: generateId(),
                answerId: '',
                resultId: rp.resultId,
                points: rp.points,
            })),
        };

        if (newAnswer.resultPoints) {
            newAnswer.resultPoints.forEach((rp) => {
                rp.answerId = newAnswer.id;
            });
        }

        foundQuestion.answers.push(newAnswer);

        const response: ApiResponse<Answer> = {
            success: true,
            data: newAnswer,
        };

        return HttpResponse.json(response, { status: 201 });
    }),

    /**
     * PUT /api/answers/:id - Обновить ответ
     */
    http.put(`${API_URL}/api/answers/:id`, async ({ params, request }) => {
        const { id } = params;
        const body = (await request.json()) as UpdateAnswerInput;

        let foundAnswer: Answer | null = null;

        outerLoop: for (const test of mockStore.tests) {
            for (const question of test.questions) {
                const answerIndex = question.answers.findIndex((a) => a.id === id);
                if (answerIndex !== -1) {
                    const answer = question.answers[answerIndex];
                    foundAnswer = {
                        ...answer,
                        text: body.text ?? answer.text,
                        imageUrl: body.imageUrl !== undefined ? body.imageUrl : answer.imageUrl,
                        isCorrect: body.isCorrect ?? answer.isCorrect,
                        nextQuestionId:
                            body.nextQuestionId !== undefined ? body.nextQuestionId : answer.nextQuestionId,
                        resultId: body.resultId !== undefined ? body.resultId : answer.resultId,
                        resultPoints: body.resultPoints
                            ? body.resultPoints.map((rp) => ({
                                  id: generateId(),
                                  answerId: answer.id,
                                  resultId: rp.resultId,
                                  points: rp.points,
                              }))
                            : answer.resultPoints,
                    };
                    question.answers[answerIndex] = foundAnswer;
                    break outerLoop;
                }
            }
        }

        if (!foundAnswer) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Ответ не найден',
                    },
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<Answer> = {
            success: true,
            data: foundAnswer,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * DELETE /api/answers/:id - Удалить ответ
     */
    http.delete(`${API_URL}/api/answers/:id`, ({ params }) => {
        const { id } = params;
        let found = false;

        outerLoop: for (const test of mockStore.tests) {
            for (const question of test.questions) {
                const answerIndex = question.answers.findIndex((a) => a.id === id);
                if (answerIndex !== -1) {
                    question.answers.splice(answerIndex, 1);
                    // Пересчитываем order
                    question.answers.forEach((a, idx) => {
                        a.order = idx;
                    });
                    found = true;
                    break outerLoop;
                }
            }
        }

        if (!found) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Ответ не найден',
                    },
                },
                { status: 404 }
            );
        }

        return new HttpResponse(null, { status: 204 });
    }),
];
