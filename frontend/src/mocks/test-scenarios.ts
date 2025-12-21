/**
 * Тестовые сценарии для проверки работы MSW
 *
 * Этот файл можно запустить в браузерной консоли для проверки всех API
 * Скопируйте содержимое функции и выполните в DevTools Console
 */

import { api } from '@/api/client';
import type {
    Test,
    CreateTestInput,
    Question,
    Answer,
    PlayTest,
    UserSession,
    TestAnalytics,
} from '@/types';
import type { AuthResponse } from '@/api/auth';

interface TestResult {
    scenario: string;
    success: boolean;
    error?: string;
    data?: unknown;
}

/**
 * Запускает все тестовые сценарии
 */
export async function runAllScenarios(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    let createdTestId: string | null = null;
    let createdQuestionId: string | null = null;
    let createdAnswerId: string | null = null;

    console.log('🧪 Starting test scenarios...\n');

    // ============ 1. Authentication ============
    try {
        const authResult = await api.post<AuthResponse>('/api/auth/telegram', {
            initData: 'test',
        });
        results.push({
            scenario: '1. Authentication - Login',
            success: true,
            data: authResult,
        });
        console.log('✅ 1. Authentication - Login:', authResult.user.username);
    } catch (error) {
        results.push({
            scenario: '1. Authentication - Login',
            success: false,
            error: String(error),
        });
        console.error('❌ 1. Authentication - Login failed:', error);
    }

    try {
        const meResult = await api.get<{ user: { id: string; username: string } }>('/api/auth/me');
        results.push({
            scenario: '1. Authentication - Get Me',
            success: true,
            data: meResult,
        });
        console.log('✅ 1. Authentication - Get Me:', meResult);
    } catch (error) {
        results.push({
            scenario: '1. Authentication - Get Me',
            success: false,
            error: String(error),
        });
        console.error('❌ 1. Authentication - Get Me failed:', error);
    }

    // ============ 2. Tests CRUD ============
    try {
        const tests = await api.get<Test[]>('/api/tests');
        results.push({
            scenario: '2. Tests - Get All',
            success: true,
            data: { count: tests.length, tests: tests.map((t) => ({ id: t.id, title: t.welcomeScreen?.title })) },
        });
        console.log('✅ 2. Tests - Get All:', tests.length, 'tests');
    } catch (error) {
        results.push({
            scenario: '2. Tests - Get All',
            success: false,
            error: String(error),
        });
        console.error('❌ 2. Tests - Get All failed:', error);
    }

    try {
        const createInput: CreateTestInput = {
            type: 'quiz',
            welcomeScreen: {
                title: 'Test Quiz',
                description: 'Created by test scenario',
                buttonText: 'Start Test',
            },
        };
        const newTest = await api.post<Test>('/api/tests', createInput);
        createdTestId = newTest.id;
        results.push({
            scenario: '2. Tests - Create',
            success: true,
            data: { id: newTest.id, title: newTest.welcomeScreen?.title },
        });
        console.log('✅ 2. Tests - Create:', newTest.id);
    } catch (error) {
        results.push({
            scenario: '2. Tests - Create',
            success: false,
            error: String(error),
        });
        console.error('❌ 2. Tests - Create failed:', error);
    }

    if (createdTestId) {
        try {
            const test = await api.get<Test>(`/api/tests/${createdTestId}`);
            results.push({
                scenario: '2. Tests - Get By ID',
                success: true,
                data: { id: test.id },
            });
            console.log('✅ 2. Tests - Get By ID:', test.id);
        } catch (error) {
            results.push({
                scenario: '2. Tests - Get By ID',
                success: false,
                error: String(error),
            });
            console.error('❌ 2. Tests - Get By ID failed:', error);
        }

        try {
            const updated = await api.put<Test>(`/api/tests/${createdTestId}`, {
                welcomeScreen: { title: 'Updated Test Quiz' },
            });
            results.push({
                scenario: '2. Tests - Update',
                success: true,
                data: { title: updated.welcomeScreen?.title },
            });
            console.log('✅ 2. Tests - Update:', updated.welcomeScreen?.title);
        } catch (error) {
            results.push({
                scenario: '2. Tests - Update',
                success: false,
                error: String(error),
            });
            console.error('❌ 2. Tests - Update failed:', error);
        }
    }

    // ============ 3. Questions CRUD ============
    if (createdTestId) {
        try {
            const question = await api.post<Question>(`/api/tests/${createdTestId}/questions`, {
                text: 'Test Question 1',
            });
            createdQuestionId = question.id;
            results.push({
                scenario: '3. Questions - Create',
                success: true,
                data: { id: question.id, text: question.text },
            });
            console.log('✅ 3. Questions - Create:', question.id);
        } catch (error) {
            results.push({
                scenario: '3. Questions - Create',
                success: false,
                error: String(error),
            });
            console.error('❌ 3. Questions - Create failed:', error);
        }

        if (createdQuestionId) {
            try {
                const updated = await api.put<Question>(`/api/questions/${createdQuestionId}`, {
                    text: 'Updated Question Text',
                });
                results.push({
                    scenario: '3. Questions - Update',
                    success: true,
                    data: { text: updated.text },
                });
                console.log('✅ 3. Questions - Update:', updated.text);
            } catch (error) {
                results.push({
                    scenario: '3. Questions - Update',
                    success: false,
                    error: String(error),
                });
                console.error('❌ 3. Questions - Update failed:', error);
            }
        }
    }

    // ============ 4. Answers CRUD ============
    if (createdQuestionId) {
        try {
            const answer = await api.post<Answer>(`/api/questions/${createdQuestionId}/answers`, {
                text: 'Answer Option 1',
                isCorrect: true,
            });
            createdAnswerId = answer.id;
            results.push({
                scenario: '4. Answers - Create',
                success: true,
                data: { id: answer.id, text: answer.text, isCorrect: answer.isCorrect },
            });
            console.log('✅ 4. Answers - Create:', answer.id);
        } catch (error) {
            results.push({
                scenario: '4. Answers - Create',
                success: false,
                error: String(error),
            });
            console.error('❌ 4. Answers - Create failed:', error);
        }

        // Create second answer
        try {
            const answer2 = await api.post<Answer>(`/api/questions/${createdQuestionId}/answers`, {
                text: 'Answer Option 2',
                isCorrect: false,
            });
            results.push({
                scenario: '4. Answers - Create Second',
                success: true,
                data: { id: answer2.id },
            });
            console.log('✅ 4. Answers - Create Second:', answer2.id);
        } catch (error) {
            results.push({
                scenario: '4. Answers - Create Second',
                success: false,
                error: String(error),
            });
            console.error('❌ 4. Answers - Create Second failed:', error);
        }

        if (createdAnswerId) {
            try {
                const updated = await api.put<Answer>(`/api/answers/${createdAnswerId}`, {
                    text: 'Updated Answer Text',
                });
                results.push({
                    scenario: '4. Answers - Update',
                    success: true,
                    data: { text: updated.text },
                });
                console.log('✅ 4. Answers - Update:', updated.text);
            } catch (error) {
                results.push({
                    scenario: '4. Answers - Update',
                    success: false,
                    error: String(error),
                });
                console.error('❌ 4. Answers - Update failed:', error);
            }
        }
    }

    // ============ 5. Publish Test ============
    if (createdTestId) {
        try {
            const published = await api.post<Test>(`/api/tests/${createdTestId}/publish`);
            results.push({
                scenario: '5. Tests - Publish',
                success: true,
                data: { status: published.status, slug: published.slug },
            });
            console.log('✅ 5. Tests - Publish:', published.slug);
        } catch (error) {
            results.push({
                scenario: '5. Tests - Publish',
                success: false,
                error: String(error),
            });
            console.error('❌ 5. Tests - Publish failed:', error);
        }
    }

    // ============ 6. Analytics ============
    try {
        const analytics = await api.get<TestAnalytics>('/api/tests/test-1/analytics');
        results.push({
            scenario: '6. Analytics - Get',
            success: true,
            data: {
                totalSessions: analytics.totalSessions,
                completionRate: analytics.completionRate,
            },
        });
        console.log('✅ 6. Analytics - Get:', analytics.totalSessions, 'sessions');
    } catch (error) {
        results.push({
            scenario: '6. Analytics - Get',
            success: false,
            error: String(error),
        });
        console.error('❌ 6. Analytics - Get failed:', error);
    }

    // ============ 7. Play Flow ============
    try {
        const playTest = await api.get<PlayTest>('/api/play/quiz-example');
        results.push({
            scenario: '7. Play - Get Test',
            success: true,
            data: { id: playTest.id, questionsCount: playTest.questionsCount },
        });
        console.log('✅ 7. Play - Get Test:', playTest.questionsCount, 'questions');
    } catch (error) {
        results.push({
            scenario: '7. Play - Get Test',
            success: false,
            error: String(error),
        });
        console.error('❌ 7. Play - Get Test failed:', error);
    }

    try {
        const session = await api.get<UserSession | null>('/api/play/quiz-example/session');
        results.push({
            scenario: '7. Play - Check Session',
            success: true,
            data: { hasSession: !!session },
        });
        console.log('✅ 7. Play - Check Session:', session ? 'exists' : 'no session');
    } catch (error) {
        results.push({
            scenario: '7. Play - Check Session',
            success: false,
            error: String(error),
        });
        console.error('❌ 7. Play - Check Session failed:', error);
    }

    try {
        const startResult = await api.post<{ sessionId: string }>('/api/play/quiz-example/start');
        results.push({
            scenario: '7. Play - Start',
            success: true,
            data: startResult,
        });
        console.log('✅ 7. Play - Start:', startResult.sessionId);
    } catch (error) {
        results.push({
            scenario: '7. Play - Start',
            success: false,
            error: String(error),
        });
        console.error('❌ 7. Play - Start failed:', error);
    }

    try {
        const submitResult = await api.post<UserSession>('/api/play/quiz-example/submit', {
            answers: [
                { questionId: 'q-1', answerId: 'a-2' }, // correct
                { questionId: 'q-2', answerId: 'a-5' }, // correct
                { questionId: 'q-3', answerId: 'a-9' }, // correct
            ],
        });
        results.push({
            scenario: '7. Play - Submit',
            success: true,
            data: { score: submitResult.score, maxScore: submitResult.maxScore },
        });
        console.log('✅ 7. Play - Submit:', submitResult.score, '/', submitResult.maxScore);
    } catch (error) {
        results.push({
            scenario: '7. Play - Submit',
            success: false,
            error: String(error),
        });
        console.error('❌ 7. Play - Submit failed:', error);
    }

    // ============ 8. Delete Test ============
    if (createdTestId) {
        try {
            await api.delete(`/api/tests/${createdTestId}`);
            results.push({
                scenario: '8. Tests - Delete',
                success: true,
            });
            console.log('✅ 8. Tests - Delete: success');
        } catch (error) {
            results.push({
                scenario: '8. Tests - Delete',
                success: false,
                error: String(error),
            });
            console.error('❌ 8. Tests - Delete failed:', error);
        }
    }

    // ============ 9. Health Check ============
    try {
        const health = await api.checkHealth();
        results.push({
            scenario: '9. Health Check',
            success: true,
            data: health,
        });
        console.log('✅ 9. Health Check:', health.status);
    } catch (error) {
        results.push({
            scenario: '9. Health Check',
            success: false,
            error: String(error),
        });
        console.error('❌ 9. Health Check failed:', error);
    }

    // ============ Summary ============
    console.log('\n📊 Test Results Summary:');
    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
        console.log('\n❌ Failed scenarios:');
        results
            .filter((r) => !r.success)
            .forEach((r) => {
                console.log(`  - ${r.scenario}: ${r.error}`);
            });
    }

    return results;
}

// Для использования в консоли браузера
// @ts-expect-error - for browser console
window.runMockTests = runAllScenarios;

export default runAllScenarios;
