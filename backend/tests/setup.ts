/**
 * Настройка тестового окружения
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';

// Устанавливаем тестовые переменные окружения
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/quiz_tma_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';

beforeAll(async () => {
  // Глобальная настройка перед всеми тестами
});

afterAll(async () => {
  // Очистка после всех тестов
});

beforeEach(async () => {
  // Настройка перед каждым тестом
});
