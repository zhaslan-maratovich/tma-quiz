/**
 * API для работы с результатами (финальными экранами)
 */

import { api } from './client';
import type { TestResult, CreateResultInput, UpdateResultInput } from '@/types';

/**
 * Добавить результат в тест
 */
export async function createResult(
  testId: string,
  data: CreateResultInput
): Promise<TestResult> {
  return api.post<TestResult>(`/api/tests/${testId}/results`, data);
}

/**
 * Обновить результат
 */
export async function updateResult(
  id: string,
  data: UpdateResultInput
): Promise<TestResult> {
  return api.put<TestResult>(`/api/results/${id}`, data);
}

/**
 * Удалить результат
 */
export async function deleteResult(id: string): Promise<void> {
  return api.delete(`/api/results/${id}`);
}

export const resultsApi = {
  createResult,
  updateResult,
  deleteResult,
};
