/**
 * Hooks для работы с тестами
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsApi } from '@/api';
import type { CreateTestInput, UpdateTestInput } from '@/types';

/**
 * Hook для получения списка тестов
 */
export function useTests() {
    return useQuery({
        queryKey: ['tests'],
        queryFn: testsApi.getTests,
        staleTime: 1000 * 60, // 1 минута
    });
}

/**
 * Hook для получения теста по ID
 */
export function useTest(id: string) {
    return useQuery({
        queryKey: ['tests', id],
        queryFn: () => testsApi.getTestById(id),
        enabled: !!id,
        staleTime: 1000 * 30, // 30 секунд
    });
}

/**
 * Hook для создания теста
 */
export function useCreateTest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTestInput) => testsApi.createTest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
        },
    });
}

/**
 * Hook для обновления теста
 */
export function useUpdateTest(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTestInput) => testsApi.updateTest(id, data),
        onSuccess: (updatedTest) => {
            queryClient.setQueryData(['tests', id], updatedTest);
            queryClient.invalidateQueries({ queryKey: ['tests'] });
        },
    });
}

/**
 * Hook для удаления теста
 */
export function useDeleteTest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => testsApi.deleteTest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tests'] });
        },
    });
}

/**
 * Hook для публикации теста
 */
export function usePublishTest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => testsApi.publishTest(id),
        onSuccess: (publishedTest) => {
            queryClient.setQueryData(['tests', publishedTest.id], publishedTest);
            queryClient.invalidateQueries({ queryKey: ['tests'] });
        },
    });
}

/**
 * Hook для получения аналитики теста
 */
export function useTestAnalytics(id: string) {
    return useQuery({
        queryKey: ['tests', id, 'analytics'],
        queryFn: () => testsApi.getTestAnalytics(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 минут
    });
}
