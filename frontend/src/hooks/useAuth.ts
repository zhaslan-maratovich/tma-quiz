/**
 * Hook для аутентификации
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api';
import { getInitData, isTelegramWebApp } from '@/lib/telegram';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    logout
  } = useAuthStore();

  const queryClient = useQueryClient();

  // Mutation для аутентификации
  const authMutation = useMutation({
    mutationFn: (initData: string) => authApi.authenticate(initData),
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // Query для получения текущего пользователя
  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  // Автоматическая аутентификация при загрузке
  useEffect(() => {
    const authenticate = async () => {
      // Если уже аутентифицирован, не делаем ничего
      if (isAuthenticated && user) {
        setLoading(false);
        return;
      }

      const initData = getInitData();

      // В режиме разработки без Telegram
      if (!isTelegramWebApp() && !initData) {
        // Используем dev-токен или показываем ошибку
        const devInitData = import.meta.env.VITE_DEV_INIT_DATA;
        if (devInitData) {
          authMutation.mutate(devInitData);
        } else {
          setError('Откройте приложение в Telegram');
        }
        return;
      }

      // Аутентификация через Telegram
      if (initData) {
        authMutation.mutate(initData);
      } else {
        setError('Не удалось получить данные для авторизации');
      }
    };

    authenticate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Обновляем данные пользователя из query
  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
    }
  }, [userQuery.data, setUser]);

  const handleLogout = () => {
    logout();
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || authMutation.isPending,
    error,
    logout: handleLogout,
    refetch: userQuery.refetch,
  };
}
