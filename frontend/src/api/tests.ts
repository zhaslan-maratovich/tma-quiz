/**
 * API для работы с тестами
 */

import { api } from './client';
import type { Test, CreateTestInput, UpdateTestInput, TestAnalytics } from '@/types';

/**
 * Получить список своих тестов
 */
export async function getTests(): Promise<Test[]> {
    return api.get<Test[]>('/api/tests');
}

/**
 * Получить тест по ID
 */
export async function getTestById(id: string): Promise<Test> {
    return api.get<Test>(`/api/tests/${id}`);
}

/**
 * Создать новый тест
 */
export async function createTest(data: CreateTestInput): Promise<Test> {
    return api.post<Test>('/api/tests', data);
}

/**
 * Обновить тест
 */
export async function updateTest(id: string, data: UpdateTestInput): Promise<Test> {
    return api.put<Test>(`/api/tests/${id}`, data);
}

/**
 * Удалить тест
 */
export async function deleteTest(id: string): Promise<void> {
    return api.delete(`/api/tests/${id}`);
}

/**
 * Опубликовать тест
 */
export async function publishTest(id: string): Promise<Test> {
    return api.post<Test>(`/api/tests/${id}/publish`);
}

/**
 * Получить аналитику теста
 */
export async function getTestAnalytics(id: string): Promise<TestAnalytics> {
    return api.get<TestAnalytics>(`/api/tests/${id}/analytics`);
}

export const testsApi = {
    getTests,
    getTestById,
    createTest,
    updateTest,
    deleteTest,
    publishTest,
    getTestAnalytics,
};
