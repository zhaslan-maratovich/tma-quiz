/**
 * API для работы с вопросами
 */

import { api } from './client';
import type { Question, CreateQuestionInput, UpdateQuestionInput } from '@/types';

/**
 * Добавить вопрос в тест
 */
export async function createQuestion(testId: string, data: CreateQuestionInput): Promise<Question> {
    return api.post<Question>(`/api/tests/${testId}/questions`, data);
}

/**
 * Обновить вопрос
 */
export async function updateQuestion(id: string, data: UpdateQuestionInput): Promise<Question> {
    return api.put<Question>(`/api/questions/${id}`, data);
}

/**
 * Удалить вопрос
 */
export async function deleteQuestion(id: string): Promise<void> {
    return api.delete(`/api/questions/${id}`);
}

/**
 * Изменить порядок вопросов
 */
export async function reorderQuestions(testId: string, questionIds: string[]): Promise<Question[]> {
    return api.put<Question[]>(`/api/tests/${testId}/questions/reorder`, { questionIds });
}

export const questionsApi = {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
};
