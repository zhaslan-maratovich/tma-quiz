/**
 * Hooks для прохождения тестов (play)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playApi } from '@/api';
import type { SubmitAnswersInput } from '@/types';

/**
 * Query keys для play API
 * Централизованное место для управления ключами кэша
 */
export const playKeys = {
    all: ['play'] as const,
    test: (slug: string) => ['play', slug] as const,
    session: (slug: string) => ['play', slug, 'session'] as const,
};

/**
 * Hook для получения теста по slug (для прохождения)
 */
export function usePlayTest(slug: string | undefined) {
    return useQuery({
        queryKey: playKeys.test(slug!),
        queryFn: () => playApi.getTestBySlug(slug!),
        enabled: Boolean(slug),
        staleTime: 1000 * 60, // 1 минута
    });
}

/**
 * Hook для проверки существующей сессии пользователя
 */
export function useExistingSession(slug: string | undefined) {
    return useQuery({
        queryKey: playKeys.session(slug!),
        queryFn: () => playApi.getExistingSession(slug!),
        enabled: Boolean(slug),
        staleTime: 1000 * 30, // 30 секунд
    });
}

/**
 * Hook для начала прохождения теста
 */
export function useStartTest(slug: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => playApi.startTest(slug!),
        onSuccess: () => {
            // Инвалидируем сессию, чтобы перезапросить при необходимости
            if (slug) {
                queryClient.invalidateQueries({ queryKey: playKeys.session(slug) });
            }
        },
    });
}

/**
 * Hook для отправки ответов и завершения теста
 */
export function useSubmitAnswers(slug: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SubmitAnswersInput) => playApi.submitAnswers(slug!, data),
        onSuccess: (session) => {
            if (slug) {
                // Обновляем кэш сессии с новыми данными
                queryClient.setQueryData(playKeys.session(slug), session);
            }
        },
    });
}

/**
 * Комбинированный hook для страницы приветствия
 * Объединяет загрузку теста и проверку сессии
 */
export function useWelcomePageData(slug: string | undefined) {
    const testQuery = usePlayTest(slug);
    const sessionQuery = useExistingSession(slug);

    return {
        test: testQuery.data,
        existingSession: sessionQuery.data,
        isLoading: testQuery.isLoading,
        isSessionLoading: sessionQuery.isLoading,
        error: testQuery.error,
        sessionError: sessionQuery.error,
    };
}
