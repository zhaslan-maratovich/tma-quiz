/**
 * API для аутентификации
 */

import { api } from './client';
import type { User } from '@/types';

export interface AuthResponse {
  user: User;
  isNewUser: boolean;
}

/**
 * Аутентификация через Telegram initData
 */
export async function authenticate(initData: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/api/auth/telegram', { initData });
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>('/api/auth/me');
}

export const authApi = {
  authenticate,
  getCurrentUser,
};
