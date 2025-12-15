/**
 * API для работы с ответами
 */

import { api } from './client';
import type { Answer, CreateAnswerInput, UpdateAnswerInput } from '@/types';

/**
 * Добавить ответ к вопросу
 */
export async function createAnswer(
  questionId: string,
  data: CreateAnswerInput
): Promise<Answer> {
  return api.post<Answer>(`/api/questions/${questionId}/answers`, data);
}

/**
 * Обновить ответ
 */
export async function updateAnswer(
  id: string,
  data: UpdateAnswerInput
): Promise<Answer> {
  return api.put<Answer>(`/api/answers/${id}`, data);
}

/**
 * Удалить ответ
 */
export async function deleteAnswer(id: string): Promise<void> {
  return api.delete(`/api/answers/${id}`);
}

export const answersApi = {
  createAnswer,
  updateAnswer,
  deleteAnswer,
};
