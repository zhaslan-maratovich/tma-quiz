/**
 * Hooks для работы с тестами (CRUD операции для создателей)
 *
 * Конвенция именования:
 * - use<Entity>Query / use<Entity>ListQuery — для GET запросов
 * - use<Action><Entity>Mutation — для мутаций
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsApi } from '@/api';
import type { CreateTestInput, UpdateTestInput } from '@/types';

/**
 * Query keys для tests API
 */
export const testsQueryKeys = {
    all: ['tests'] as const,
    list: () => ['tests'] as const,
    detail: (id: string) => ['tests', id] as const,
    analytics: (id: string) => ['tests', id, 'analytics'] as const,
};

/**
 * Query: Получение списка тестов
 */
export function useTestsListQuery() {
    return useQuery({
        queryKey: testsQueryKeys.list(),
        queryFn: testsApi.getTests,
        staleTime: 1000 * 60, // 1 минута
    });
}

/**
 * Query: Получение теста по ID
 */
export function useTestQuery(id: string | undefined) {
    return useQuery({
        queryKey: testsQueryKeys.detail(id!),
        queryFn: () => testsApi.getTestById(id!),
        enabled: Boolean(id),
        staleTime: 1000 * 30, // 30 секунд
    });
}

/**
 * Query: Получение аналитики теста
 */
export function useTestAnalyticsQuery(id: string | undefined) {
    return useQuery({
        queryKey: testsQueryKeys.analytics(id!),
        queryFn: () => testsApi.getTestAnalytics(id!),
        enabled: Boolean(id),
        staleTime: 1000 * 60 * 5, // 5 минут
    });
}

/**
 * Mutation: Создание теста
 */
export function useCreateTestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTestInput) => testsApi.createTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testsQueryKeys.list() });
        },
    });
}

/**
 * Mutation: Обновление теста
 */
export function useUpdateTestMutation(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTestInput) => testsApi.updateTest(id, data),
        onSuccess: (updatedTest) => {
            queryClient.setQueryData(testsQueryKeys.detail(id), updatedTest);
            queryClient.invalidateQueries({ queryKey: testsQueryKeys.list() });
        },
    });
}

/**
 * Mutation: Удаление теста
 */
export function useDeleteTestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => testsApi.deleteTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testsQueryKeys.list() });
        },
    });
}

/**
 * Mutation: Публикация теста
 */
export function usePublishTestMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => testsApi.publishTest(id),
        onSuccess: (publishedTest) => {
            queryClient.setQueryData(testsQueryKeys.detail(publishedTest.id), publishedTest);
            queryClient.invalidateQueries({ queryKey: testsQueryKeys.list() });
        },
    });
}

// =============================================================================
// Алиасы для обратной совместимости (deprecated, будут удалены)
// =============================================================================

/** @deprecated Используйте useTestQuery */
export const useTest = useTestQuery;

/** @deprecated Используйте useCreateTestMutation */
export const useCreateTest = useCreateTestMutation;

/** @deprecated Используйте useUpdateTestMutation */
export const useUpdateTest = useUpdateTestMutation;

/** @deprecated Используйте useDeleteTestMutation */
export const useDeleteTest = useDeleteTestMutation;

/** @deprecated Используйте usePublishTestMutation */
export const usePublishTest = usePublishTestMutation;

/** @deprecated Используйте useTestAnalyticsQuery */
export const useTestAnalytics = useTestAnalyticsQuery;
