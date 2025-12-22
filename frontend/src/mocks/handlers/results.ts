/**
 * MSW Handlers для результатов
 */

import { http, HttpResponse } from 'msw';
import { generateId, mockStore } from '../data';
import type { ApiResponse, TestResult, CreateResultInput, UpdateResultInput } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const resultsHandlers = [
    /**
     * POST /api/tests/:testId/results - Добавить результат
     */
    http.post(`${API_URL}/api/tests/:testId/results`, async ({ params, request }) => {
        const { testId } = params;
        const body = (await request.json()) as CreateResultInput;

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

        const newResult: TestResult = {
            id: generateId(),
            testId: testId as string,
            title: body.title,
            description: body.description ?? null,
            imageUrl: body.imageUrl ?? null,
        };

        test.results.push(newResult);

        const response: ApiResponse<TestResult> = {
            success: true,
            data: newResult,
        };

        return HttpResponse.json(response, { status: 201 });
    }),

    /**
     * PUT /api/results/:id - Обновить результат
     */
    http.put(`${API_URL}/api/results/:id`, async ({ params, request }) => {
        const { id } = params;
        const body = (await request.json()) as UpdateResultInput;

        let foundResult: TestResult | null = null;

        for (const test of mockStore.tests) {
            const resultIndex = test.results.findIndex((r) => r.id === id);
            if (resultIndex !== -1) {
                const result = test.results[resultIndex];
                foundResult = {
                    ...result,
                    title: body.title ?? result.title,
                    description:
                        body.description !== undefined ? body.description : result.description,
                    imageUrl: body.imageUrl !== undefined ? body.imageUrl : result.imageUrl,
                };
                test.results[resultIndex] = foundResult;
                break;
            }
        }

        if (!foundResult) {
            return HttpResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Результат не найден',
                    },
                },
                { status: 404 }
            );
        }

        const response: ApiResponse<TestResult> = {
            success: true,
            data: foundResult,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * DELETE /api/results/:id - Удалить результат
     */
    http.delete(`${API_URL}/api/results/:id`, ({ params }) => {
        const { id } = params;
        let found = false;

        for (const test of mockStore.tests) {
            const resultIndex = test.results.findIndex((r) => r.id === id);
            if (resultIndex !== -1) {
                test.results.splice(resultIndex, 1);
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
                        message: 'Результат не найден',
                    },
                },
                { status: 404 }
            );
        }

        return new HttpResponse(null, { status: 204 });
    }),
];
