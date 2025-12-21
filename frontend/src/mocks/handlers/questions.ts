/**
 * MSW Handlers для вопросов
 */

import { http, HttpResponse } from 'msw';
import { generateId, mockStore } from '../data';
import type { ApiResponse, Question, CreateQuestionInput, UpdateQuestionInput } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const questionsHandlers = [
    /**
     * POST /api/tests/:testId/questions - Добавить вопрос
     */
    http.post(`${API_URL}/api/tests/:testId/questions`, async ({ params, request }) => {
        const { testId } = params;
        const body = (await request.json()) as CreateQuestionInput;

        const test = mockStore.findTestById(testId as string);
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

        const newQuestion: Question = {
            id: generateId(),
            testId: testId as string,
            order: test.questions.length,
            text: body.text,
            imageUrl: body.imageUrl ?? null,
            answers: [],
        };

        test.questions.push(newQuestion);

        const response: ApiResponse<Question> = {
            success: true,
            data: newQuestion,
        };

        return HttpResponse.json(response, { status: 201 });
    }),

    /**
     * PUT /api/questions/:id - Обновить вопрос
     */
    http.put(`${API_URL}/api/questions/:id`, async ({ params, request }) => {
        const { id } = params;
        const body = (await request.json()) as UpdateQuestionInput;

        let foundQuestion: Question | null = null;

        for (const test of mockStore.tests) {
            const questionIndex = test.questions.findIndex((q) => q.id === id);
            if (questionIndex !== -1) {
                const question = test.questions[questionIndex];
                foundQuestion = {
                    ...question,
                    text: body.text ?? question.text,
                    imageUrl: body.imageUrl !== undefined ? body.imageUrl : question.imageUrl,
                };
                test.questions[questionIndex] = foundQuestion;
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

        const response: ApiResponse<Question> = {
            success: true,
            data: foundQuestion,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * DELETE /api/questions/:id - Удалить вопрос
     */
    http.delete(`${API_URL}/api/questions/:id`, ({ params }) => {
        const { id } = params;
        let found = false;

        for (const test of mockStore.tests) {
            const questionIndex = test.questions.findIndex((q) => q.id === id);
            if (questionIndex !== -1) {
                test.questions.splice(questionIndex, 1);
                // Пересчитываем order
                test.questions.forEach((q, idx) => {
                    q.order = idx;
                });
                found = true;
                break;
            }
        }

        if (!found) {
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

        return new HttpResponse(null, { status: 204 });
    }),

    /**
     * PUT /api/tests/:testId/questions/reorder - Изменить порядок вопросов
     */
    http.put(`${API_URL}/api/tests/:testId/questions/reorder`, async ({ params, request }) => {
        const { testId } = params;
        const body = (await request.json()) as { questionIds: string[] };

        const test = mockStore.findTestById(testId as string);
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

        // Переупорядочиваем вопросы
        const reorderedQuestions: Question[] = [];
        body.questionIds.forEach((qId, idx) => {
            const question = test.questions.find((q) => q.id === qId);
            if (question) {
                reorderedQuestions.push({ ...question, order: idx });
            }
        });

        test.questions = reorderedQuestions;

        const response: ApiResponse<Question[]> = {
            success: true,
            data: reorderedQuestions,
        };

        return HttpResponse.json(response, { status: 200 });
    }),
];
