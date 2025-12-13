# Quiz TMA Backend

Backend для Telegram Mini App — конструктор тестов/опросников.

## Технологии

- **Runtime**: Node.js 20
- **Framework**: Fastify 4
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 (Prisma ORM)
- **Cache**: Redis 7
- **Storage**: Yandex Object Storage (S3-compatible)
- **Testing**: Vitest + Supertest

## Быстрый старт

### Требования

- Node.js >= 18.0.0
- Docker & Docker Compose
- PostgreSQL 16+ (или Docker)
- Redis 7+ (или Docker)

### Установка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd backend

# Установите зависимости
npm install

# Скопируйте переменные окружения
cp env.example .env

# Запустите PostgreSQL и Redis в Docker
docker-compose up -d

# Примените миграции
npm run prisma:push

# Запустите dev сервер
npm run dev
```

Сервер запустится на `http://localhost:3000`

## Скрипты

| Команда                   | Описание                           |
| ------------------------- | ---------------------------------- |
| `npm run dev`             | Запуск dev сервера с hot reload    |
| `npm run build`           | Сборка TypeScript в JavaScript     |
| `npm start`               | Запуск production сервера          |
| `npm test`                | Запуск тестов в watch режиме       |
| `npm run test:run`        | Однократный запуск тестов          |
| `npm run test:coverage`   | Запуск тестов с покрытием          |
| `npm run prisma:generate` | Генерация Prisma Client            |
| `npm run prisma:push`     | Применение схемы к БД              |
| `npm run prisma:migrate`  | Создание и применение миграций     |
| `npm run prisma:studio`   | Открыть Prisma Studio (GUI для БД) |
| `npm run typecheck`       | Проверка типов без компиляции      |

## Переменные окружения

```bash
# Application
NODE_ENV=development          # development | production
PORT=3000                     # Порт сервера
HOST=0.0.0.0                  # Хост сервера

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_tma

# Cache (Redis)
REDIS_URL=redis://localhost:6379

# Yandex Object Storage (S3)
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=quiz-tma-images
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
```

## Структура проекта

```
backend/
├── src/
│   ├── app.ts              # Конфигурация Fastify
│   ├── index.ts            # Точка входа
│   ├── config/             # Конфигурация приложения
│   ├── plugins/            # Fastify плагины
│   │   ├── auth.ts         # Аутентификация (Telegram initData)
│   │   ├── prisma.ts       # Prisma client
│   │   ├── redis.ts        # Redis client
│   │   └── rate-limit.ts   # Rate limiting
│   ├── routes/             # HTTP роуты
│   │   ├── auth.ts         # POST /api/auth/telegram
│   │   ├── tests.ts        # CRUD /api/tests
│   │   ├── questions.ts    # CRUD /api/questions
│   │   ├── answers.ts      # CRUD /api/answers
│   │   ├── results.ts      # CRUD /api/results
│   │   ├── play.ts         # Прохождение тестов
│   │   ├── share.ts        # Генерация share-картинок
│   │   └── upload.ts       # Загрузка изображений
│   ├── services/           # Бизнес-логика
│   ├── types/              # TypeScript типы
│   └── utils/              # Утилиты
├── prisma/
│   └── schema.prisma       # Схема базы данных
├── tests/                  # Тесты
├── deploy/                 # Файлы для деплоя
└── docker-compose.yml      # Docker для разработки
```

## API Endpoints

### Аутентификация

| Method | Endpoint             | Описание                            |
| ------ | -------------------- | ----------------------------------- |
| POST   | `/api/auth/telegram` | Авторизация через Telegram initData |

### Тесты

| Method | Endpoint                   | Описание                   |
| ------ | -------------------------- | -------------------------- |
| GET    | `/api/tests`               | Список тестов пользователя |
| POST   | `/api/tests`               | Создать тест               |
| GET    | `/api/tests/:id`           | Получить тест              |
| PUT    | `/api/tests/:id`           | Обновить тест              |
| DELETE | `/api/tests/:id`           | Удалить тест               |
| POST   | `/api/tests/:id/publish`   | Опубликовать тест          |
| GET    | `/api/tests/:id/analytics` | Аналитика теста            |

### Вопросы

| Method | Endpoint                               | Описание                  |
| ------ | -------------------------------------- | ------------------------- |
| POST   | `/api/tests/:testId/questions`         | Добавить вопрос           |
| PUT    | `/api/questions/:id`                   | Обновить вопрос           |
| DELETE | `/api/questions/:id`                   | Удалить вопрос            |
| PUT    | `/api/tests/:testId/questions/reorder` | Изменить порядок вопросов |

### Ответы

| Method | Endpoint                             | Описание       |
| ------ | ------------------------------------ | -------------- |
| POST   | `/api/questions/:questionId/answers` | Добавить ответ |
| PUT    | `/api/answers/:id`                   | Обновить ответ |
| DELETE | `/api/answers/:id`                   | Удалить ответ  |

### Результаты

| Method | Endpoint                     | Описание           |
| ------ | ---------------------------- | ------------------ |
| POST   | `/api/tests/:testId/results` | Добавить результат |
| PUT    | `/api/results/:id`           | Обновить результат |
| DELETE | `/api/results/:id`           | Удалить результат  |

### Прохождение тестов

| Method | Endpoint                  | Описание                      |
| ------ | ------------------------- | ----------------------------- |
| GET    | `/api/play/:slug`         | Получить тест для прохождения |
| GET    | `/api/play/:slug/session` | Получить текущую сессию       |
| POST   | `/api/play/:slug/start`   | Начать прохождение            |
| POST   | `/api/play/:slug/submit`  | Отправить ответ               |

### Другое

| Method | Endpoint                  | Описание                     |
| ------ | ------------------------- | ---------------------------- |
| POST   | `/api/upload/image`       | Загрузить изображение        |
| POST   | `/api/sessions/:id/share` | Сгенерировать share-картинку |
| GET    | `/health`                 | Health check                 |

## Типы тестов

### 1. Quiz (Викторина)

- Есть правильные/неправильные ответы
- Подсчитывается score (количество правильных)
- Результат: "Вы ответили правильно на X из Y"

### 2. Personality (Личностный тест)

- Каждый ответ даёт баллы к определённым результатам
- Результат с максимальным количеством баллов — итоговый
- Пример: "Какой вы тип личности?"

### 3. Branching (Ветвящаяся история)

- Каждый ответ ведёт к конкретному следующему вопросу или результату
- Нелинейное прохождение
- Пример: "Выбери своё приключение"

## База данных

### Основные модели

- **User** — пользователи Telegram
- **Test** — тесты/опросы
- **TestWelcomeScreen** — экран приветствия
- **Question** — вопросы
- **Answer** — варианты ответов
- **TestResult** — результаты теста
- **AnswerResultPoint** — баллы ответа к результату (для personality)
- **UserSession** — сессия прохождения
- **UserAnswer** — ответы пользователя
- **SharedResult** — сохранённые share-картинки

### Диаграмма связей

```
User 1───* Test 1───1 TestWelcomeScreen
              │
              ├───* Question 1───* Answer
              │         │             │
              │         │             ├─── nextQuestion (branching)
              │         │             └─── result / resultPoints
              │         │
              │         └───* UserAnswer
              │
              ├───* TestResult
              │
              └───* UserSession 1───* UserAnswer
                         │
                         └───* SharedResult
```

## Rate Limiting

- Глобальный лимит: 100 запросов / минута
- На эндпоинт авторизации: 5 запросов / минута
- На загрузку файлов: 10 запросов / минута

## Деплой

Подробная инструкция по деплою в Yandex Cloud:
[deploy/yandex-cloud-setup.md](./deploy/yandex-cloud-setup.md)

### Docker

```bash
# Сборка образа
docker build -t quiz-tma-backend .

# Запуск
docker run -p 3000:3000 --env-file .env quiz-tma-backend
```

### Docker Compose (Production)

```bash
cd deploy
docker compose -f docker-compose.prod.yml up -d
```

## Локальная разработка с Docker

```bash
# Запуск PostgreSQL + Redis
docker-compose up -d

# Применить схему БД
npm run prisma:push

# Запуск dev сервера
npm run dev
```

## Тестирование

```bash
# Запуск тестов
npm test

# Однократный запуск
npm run test:run

# С покрытием
npm run test:coverage
```

## Полезные команды Prisma

```bash
# Открыть GUI для БД
npm run prisma:studio

# Сгенерировать клиент после изменения схемы
npm run prisma:generate

# Применить схему к БД (dev)
npm run prisma:push

# Создать миграцию
npm run prisma:migrate
```

## Лицензия

MIT
