/**
 * API для прохождения теста
 */

import { api } from './client';
import type { PlayTest, UserSession, SubmitAnswersInput } from '@/types';

/**
 * Получить тест для прохождения
 */
export async function getTestBySlug(slug: string): Promise<PlayTest> {
  return api.get<PlayTest>(`/api/play/${slug}`);
}

/**
 * Проверить существующую сессию
 */
export async function getExistingSession(slug: string): Promise<UserSession | null> {
  return api.get<UserSession | null>(`/api/play/${slug}/session`);
}

/**
 * Начать прохождение теста
 */
export async function startTest(slug: string): Promise<{ session: UserSession; canStart: boolean }> {
  return api.post<{ session: UserSession; canStart: boolean }>(`/api/play/${slug}/start`);
}

/**
 * Отправить ответы и завершить тест
 */
export async function submitAnswers(
  slug: string,
  data: SubmitAnswersInput
): Promise<UserSession> {
  return api.post<UserSession>(`/api/play/${slug}/submit`, data);
}

export const playApi = {
  getTestBySlug,
  getExistingSession,
  startTest,
  submitAnswers,
};
