/**
 * MSW Handler для health check
 */

import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const healthHandlers = [
    /**
     * GET /health - Проверка состояния сервера
     */
    http.get(`${API_URL}/health`, () => {
        return HttpResponse.json(
            {
                status: 'ok',
                database: 'connected',
                redis: 'connected',
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    }),
];
