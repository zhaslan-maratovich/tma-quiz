/**
 * Mock данные для пользователей
 */

import type { User } from '@/types';

/**
 * Мок-пользователь для разработки
 */
export const mockUser: User = {
    id: 'user-1',
    telegramId: '123456789',
    username: 'dev_user',
    firstName: 'Разработчик',
    lastName: 'Тестовый',
};

/**
 * Дополнительные пользователи для тестирования
 */
export const mockUsers: User[] = [
    mockUser,
    {
        id: 'user-2',
        telegramId: '987654321',
        username: 'another_user',
        firstName: 'Другой',
        lastName: 'Пользователь',
    },
];
