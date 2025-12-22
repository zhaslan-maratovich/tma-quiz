/**
 * API для прохождения теста
 */

import { api } from './client';
import type { PlayTest, SessionResponse, UserSession, SubmitAnswersInput } from '@/types';

/**
 * Получить тест для прохождения
 */
export async function getTestBySlug(slug: string): Promise<PlayTest> {
    return api.get<PlayTest>(`/api/play/${slug}`);
}

/**
 * Проверить существующую сессию
 * Backend возвращает { completed, canRetake, session }
 */
export async function getExistingSession(slug: string): Promise<SessionResponse> {
    return api.get<SessionResponse>(`/api/play/${slug}/session`);
}

/**
 * Начать прохождение теста
 */
export async function startTest(slug: string): Promise<{ sessionId: string; testId: string }> {
    return api.post<{ sessionId: string; testId: string }>(`/api/play/${slug}/start`);
}

/**
 * Отправить ответы и завершить тест
 */
export async function submitAnswers(slug: string, data: SubmitAnswersInput): Promise<UserSession> {
    return api.post<UserSession>(`/api/play/${slug}/submit`, data);
}

export const playApi = {
    getTestBySlug,
    getExistingSession,
    startTest,
    submitAnswers,
};
