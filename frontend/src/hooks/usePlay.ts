/**
 * Hooks для прохождения тестов (play)
 *
 * Конвенция именования:
 * - use<Entity>Query — для GET запросов (React Query)
 * - use<Action><Entity>Mutation — для мутаций (создание, обновление, удаление)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playApi } from '@/api';
import type { SubmitAnswersInput } from '@/types';

/**
 * Query keys для play API
 * Централизованное место для управления ключами кэша
 */
export const playQueryKeys = {
    all: ['play'] as const,
    test: (slug: string) => ['play', slug] as const,
    session: (slug: string) => ['play', slug, 'session'] as const,
};

/**
 * Query: Получение теста по slug (для прохождения)
 */
export function usePlayTestQuery(slug: string | undefined) {
    return useQuery({
        queryKey: playQueryKeys.test(slug!),
        queryFn: () => playApi.getTestBySlug(slug!),
        enabled: Boolean(slug),
        staleTime: 1000 * 60, // 1 минута
    });
}

/**
 * Query: Проверка существующей сессии пользователя
 */
export function usePlaySessionQuery(slug: string | undefined) {
    return useQuery({
        queryKey: playQueryKeys.session(slug!),
        queryFn: () => playApi.getExistingSession(slug!),
        enabled: Boolean(slug),
        staleTime: 1000 * 30, // 30 секунд
    });
}

/**
 * Mutation: Начало прохождения теста
 */
export function useStartTestMutation(slug: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => playApi.startTest(slug!),
        onSuccess: () => {
            // Инвалидируем сессию, чтобы перезапросить при необходимости
            if (slug) {
                queryClient.invalidateQueries({ queryKey: playQueryKeys.session(slug) });
            }
        },
    });
}

/**
 * Mutation: Отправка ответов и завершение теста
 */
export function useSubmitAnswersMutation(slug: string | undefined) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: SubmitAnswersInput) => playApi.submitAnswers(slug!, data),
        onSuccess: (session) => {
            if (slug) {
                // Обновляем кэш сессии с новыми данными
                queryClient.setQueryData(playQueryKeys.session(slug), session);
            }
        },
    });
}

/**
 * Комбинированный hook для страницы приветствия
 * Объединяет загрузку теста и проверку сессии
 */
export function useWelcomePageData(slug: string | undefined) {
    const testQuery = usePlayTestQuery(slug);
    const sessionQuery = usePlaySessionQuery(slug);

    return {
        test: testQuery.data,
        existingSession: sessionQuery.data,
        isLoading: testQuery.isLoading,
        isSessionLoading: sessionQuery.isLoading,
        error: testQuery.error,
        sessionError: sessionQuery.error,
    };
}
