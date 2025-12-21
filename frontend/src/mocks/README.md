# MSW (Mock Service Worker) & Telegram Mock

Этот модуль обеспечивает мокирование API запросов и Telegram WebApp для локальной разработки и тестирования без необходимости запуска бекенда и Telegram.

## Возможности

- ✅ **MSW** - мокирование всех API запросов
- ✅ **Telegram Mock** - эмуляция Telegram Mini App SDK
- ✅ **MainButton & BackButton** - визуальная эмуляция кнопок Telegram
- ✅ **Темы** - автоматическая поддержка светлой/тёмной темы
- ✅ **Haptic Feedback** - эмуляция через Vibration API

## Структура

```
src/mocks/
├── browser.ts        # Настройка Service Worker для браузера
├── index.ts          # Точка входа, функция enableMocking()
├── telegram.ts       # Мок Telegram WebApp
├── data/             # Мок-данные
│   ├── index.ts      # Экспорт всех данных
│   ├── users.ts      # Пользователи
│   ├── tests.ts      # Тесты, вопросы, ответы
│   ├── sessions.ts   # Сессии прохождения
│   └── store.ts      # Централизованное хранилище
└── handlers/         # MSW handlers
    ├── index.ts      # Экспорт всех handlers
    ├── auth.ts       # /api/auth/*
    ├── tests.ts      # /api/tests/*
    ├── questions.ts  # /api/questions/*
    ├── answers.ts    # /api/answers/*
    ├── results.ts    # /api/results/*
    ├── play.ts       # /api/play/*
    └── health.ts     # /health
```

## Использование

### Запуск с моками (без бекенда и Telegram)

```bash
# Используя npm script
npm run dev:mock

# Или с переменной окружения
VITE_ENABLE_MOCKS=true npm run dev
```

### Конфигурация

В файле `.env` или `.env.local`:

```env
# Включить MSW + Telegram Mock
VITE_ENABLE_MOCKS=true

# URL API (будет перехватываться MSW)
VITE_API_URL=http://localhost:3000
```

## Telegram Mock

При включении моков автоматически создаётся эмуляция `window.Telegram.WebApp`:

### Что эмулируется

| Функция | Описание |
|---------|----------|
| `initData` | Генерируется фейковый initData для авторизации |
| `initDataUnsafe.user` | Тестовый пользователь (dev_user) |
| `MainButton` | Визуальная кнопка внизу экрана |
| `BackButton` | Кнопка "Назад" в углу |
| `HapticFeedback` | Вибрация через Vibration API |
| `showAlert/showConfirm/showPopup` | Нативные диалоги браузера |
| `openLink/openTelegramLink` | Открытие в новой вкладке |
| `colorScheme` | Следует системной теме |
| `themeParams` | Цветовая схема Telegram |

### Тестовый пользователь

```javascript
{
    id: 123456789,
    first_name: 'Разработчик',
    last_name: 'Тестовый',
    username: 'dev_user',
    language_code: 'ru'
}
```

### Start Parameter

Можно передать `startapp` через URL:

```
http://localhost:5173/?startapp=quiz-example
```

Это эмулирует открытие приложения через ссылку `t.me/bot?startapp=quiz-example`.

## API Endpoints

### Аутентификация (`/api/auth`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/telegram` | Аутентификация через Telegram |
| GET | `/api/auth/me` | Получить текущего пользователя |

### Тесты (`/api/tests`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/tests` | Список тестов |
| GET | `/api/tests/:id` | Тест по ID |
| POST | `/api/tests` | Создать тест |
| PUT | `/api/tests/:id` | Обновить тест |
| DELETE | `/api/tests/:id` | Удалить тест |
| POST | `/api/tests/:id/publish` | Опубликовать тест |
| GET | `/api/tests/:id/analytics` | Аналитика теста |

### Вопросы (`/api/questions`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/tests/:testId/questions` | Добавить вопрос |
| PUT | `/api/questions/:id` | Обновить вопрос |
| DELETE | `/api/questions/:id` | Удалить вопрос |
| PUT | `/api/tests/:testId/questions/reorder` | Изменить порядок |

### Ответы (`/api/answers`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/questions/:questionId/answers` | Добавить ответ |
| PUT | `/api/answers/:id` | Обновить ответ |
| DELETE | `/api/answers/:id` | Удалить ответ |

### Результаты (`/api/results`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/tests/:testId/results` | Добавить результат |
| PUT | `/api/results/:id` | Обновить результат |
| DELETE | `/api/results/:id` | Удалить результат |

### Прохождение (`/api/play`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/play/:slug` | Получить тест для прохождения |
| GET | `/api/play/:slug/session` | Проверить существующую сессию |
| POST | `/api/play/:slug/start` | Начать прохождение |
| POST | `/api/play/:slug/submit` | Отправить ответы |

## Мок-данные

### Предустановленные тесты

| ID | Тип | Название | Статус | Slug |
|----|-----|----------|--------|------|
| test-1 | quiz | Тест на знание JavaScript | published | quiz-example |
| test-2 | personality | Кто ты из программистов? | draft | - |
| test-3 | branching | Приключение программиста | published | adventure-test |

### Тестирование прохождения

```
http://localhost:5173/play/quiz-example
http://localhost:5173/play/adventure-test
```

Или через startapp:

```
http://localhost:5173/?startapp=quiz-example
```

## Расширение

### Добавление нового handler

```typescript
// src/mocks/handlers/my-handler.ts
import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const myHandlers = [
    http.get(`${API_URL}/api/my-endpoint`, () => {
        return HttpResponse.json({
            success: true,
            data: { ... }
        });
    }),
];
```

Добавьте в `handlers/index.ts`:

```typescript
import { myHandlers } from './my-handler';

export const handlers = [
    ...myHandlers,
    // ... other handlers
];
```

### Изменение тестового пользователя

Отредактируйте `data/users.ts`:

```typescript
export const mockUser: User = {
    id: 'user-1',
    telegramId: '123456789',
    username: 'my_username',
    firstName: 'Имя',
    lastName: 'Фамилия',
};
```

### Сброс данных

```typescript
import { mockStore } from '@/mocks';

// Сбросить все тесты к начальному состоянию
mockStore.reset();
```

## Unit тестирование

MSW можно использовать с vitest/jest:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```
