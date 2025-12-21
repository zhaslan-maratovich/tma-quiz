/**
 * MSW Handlers для аутентификации
 */

import { http, HttpResponse } from 'msw';
import { mockUser } from '../data';
import type { ApiResponse, User } from '@/types';
import type { AuthResponse } from '@/api/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authHandlers = [
    /**
     * POST /api/auth/telegram - Аутентификация через Telegram
     */
    http.post(`${API_URL}/api/auth/telegram`, async () => {
        const response: ApiResponse<AuthResponse> = {
            success: true,
            data: {
                user: mockUser,
                isNewUser: false,
            },
        };

        return HttpResponse.json(response, { status: 200 });
    }),

    /**
     * GET /api/auth/me - Получить текущего пользователя
     */
    http.get(`${API_URL}/api/auth/me`, () => {
        const response: ApiResponse<User> = {
            success: true,
            data: mockUser,
        };

        return HttpResponse.json(response, { status: 200 });
    }),
];
