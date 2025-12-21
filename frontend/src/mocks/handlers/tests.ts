/**
 * MSW Handlers для тестов
 */

import { http, HttpResponse } from 'msw';
import { mockAnalytics, generateId, mockStore } from '../data';
import type { ApiResponse, Test, TestAnalytics, CreateTestInput, UpdateTestInput } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const testsHandlers = [
    /**
     * GET /api/tests - Получить список тестов
     */
    http.get(`${API_URL}/api/tests`, () => {
        const response: ApiResponse<Test[]> = {
            success: true,
            data: mockStore.tests,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * GET /api/tests/:id - Получить тест по ID
     */
    http.get(`${API_URL}/api/tests/:id`, ({ params }) => {
        const { id } = params;
        const test = mockStore.findTestById(id as string);

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

        const response: ApiResponse<Test> = {
            success: true,
            data: test,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * POST /api/tests - Создать новый тест
     */
    http.post(`${API_URL}/api/tests`, async ({ request }) => {
        const body = (await request.json()) as CreateTestInput;

        const newTest: Test = {
            id: generateId(),
            ownerId: 'user-1',
            type: body.type,
            status: 'draft',
            slug: null,
            allowRetake: body.allowRetake ?? true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: null,
            welcomeScreen: {
                id: generateId(),
                testId: '',
                title: body.welcomeScreen.title,
                description: body.welcomeScreen.description ?? null,
                imageUrl: body.welcomeScreen.imageUrl ?? null,
                buttonText: body.welcomeScreen.buttonText ?? 'Начать',
            },
            questions: [],
            results: [],
            _count: { sessions: 0 },
        };

        newTest.welcomeScreen!.testId = newTest.id;
        mockStore.addTest(newTest);

        const response: ApiResponse<Test> = {
            success: true,
            data: newTest,
        };

        return HttpResponse.json(response, { status: 201 });
    }),

    /**
     * PUT /api/tests/:id - Обновить тест
     */
    http.put(`${API_URL}/api/tests/:id`, async ({ params, request }) => {
        const { id } = params;
        const body = (await request.json()) as UpdateTestInput;

        const testIndex = mockStore.findTestIndex(id as string);
        if (testIndex === -1) {
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

        const test = mockStore.tests[testIndex];
        const updatedTest: Test = {
            ...test,
            allowRetake: body.allowRetake ?? test.allowRetake,
            updatedAt: new Date().toISOString(),
            welcomeScreen: test.welcomeScreen
                ? {
                      ...test.welcomeScreen,
                      title: body.welcomeScreen?.title ?? test.welcomeScreen.title,
                      description:
                          body.welcomeScreen?.description !== undefined
                              ? body.welcomeScreen.description
                              : test.welcomeScreen.description,
                      imageUrl:
                          body.welcomeScreen?.imageUrl !== undefined
                              ? body.welcomeScreen.imageUrl
                              : test.welcomeScreen.imageUrl,
                      buttonText: body.welcomeScreen?.buttonText ?? test.welcomeScreen.buttonText,
                  }
                : null,
        };

        mockStore.updateTest(testIndex, updatedTest);

        const response: ApiResponse<Test> = {
            success: true,
            data: updatedTest,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * DELETE /api/tests/:id - Удалить тест
     */
    http.delete(`${API_URL}/api/tests/:id`, ({ params }) => {
        const { id } = params;
        const testIndex = mockStore.findTestIndex(id as string);

        if (testIndex === -1) {
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

        mockStore.removeTest(testIndex);

        return new HttpResponse(null, { status: 204 });
    }),

    /**
     * POST /api/tests/:id/publish - Опубликовать тест
     */
    http.post(`${API_URL}/api/tests/:id/publish`, ({ params }) => {
        const { id } = params;
        const testIndex = mockStore.findTestIndex(id as string);

        if (testIndex === -1) {
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

        const test = mockStore.tests[testIndex];

        // Генерируем slug из заголовка
        const slug =
            test.welcomeScreen?.title
                .toLowerCase()
                .replace(/[^a-zа-яё0-9]/gi, '-')
                .replace(/-+/g, '-')
                .slice(0, 30) + `-${Date.now().toString(36)}`;

        const publishedTest: Test = {
            ...test,
            status: 'published',
            slug,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        mockStore.updateTest(testIndex, publishedTest);

        const response: ApiResponse<Test> = {
            success: true,
            data: publishedTest,
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * GET /api/tests/:id/analytics - Получить аналитику
     */
    http.get(`${API_URL}/api/tests/:id/analytics`, ({ params }) => {
        const { id } = params;

        // Проверяем, существует ли тест
        const test = mockStore.findTestById(id as string);
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

        // Возвращаем мок-аналитику или пустую
        const analytics: TestAnalytics = mockAnalytics[id as string] || {
            totalSessions: 0,
            completedSessions: 0,
            completionRate: 0,
            questionStats: [],
            resultStats: [],
        };

        const response: ApiResponse<TestAnalytics> = {
            success: true,
            data: analytics,
        };

        return HttpResponse.json(response, { status: 200 });
    }),
];

/**
 * Сброс хранилища (для тестов)
 */
export function resetTestsStore(): void {
    mockStore.reset();
}
