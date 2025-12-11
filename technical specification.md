# Инструкция для разработки Backend

## Контекст проекта

Ты разрабатываешь backend для Telegram Mini App — конструктора тестов и опросов. Ниже полное ТЗ и технические требования.

---

## Технологический стек

| Компонент                | Технология                            |
| ------------------------ | ------------------------------------- |
| Runtime                  | Node.js 24                            |
| Язык                     | TypeScript                            |
| HTTP Framework           | Fastify                               |
| ORM                      | Prisma                                |
| База данных              | PostgreSQL (Yandex Managed)           |
| Кэш                      | Redis                                 |
| Обработка изображений    | Sharp                                 |
| Генерация share-картинок | Satori + Resvg                        |
| Object Storage           | Yandex Object Storage (S3-compatible) |
| Тестирование             | Vitest + Supertest                    |
| Логирование              | Pino (встроен в Fastify)              |

---

## Типы тестов

### 1. Quiz Classic (Викторина)

- Линейная структура: все вопросы по порядку
- У каждого вопроса есть один правильный ответ
- Финал: экран с результатом \"X из Y правильно\" + разбор ответов

### 2. Quiz Personality (Тест-типология)

- Линейная структура: все вопросы по порядку
- Каждый ответ добавляет очки к одному или нескольким результатам
- Финал: экран результата с максимальным количеством очков

### 3. Branching Story (Разветвлённый сюжет)

- Древовидная структура: каждый ответ ведёт к определённому следующему вопросу или финалу
- Нет правильных ответов
- Финал: один из нескольких финальных экранов

---

## Структура теста

```text
Welcome Screen (обязательный)
├── title: string
├── description?: string
├── imageUrl?: string
└── buttonText: string (default: \"Начать\")

Questions (1-50)
├── text: string
├── imageUrl?: string
└── answers (1-N)
    ├── text: string
    ├── imageUrl?: string
    ├── isCorrect?: boolean (для Quiz Classic)
    ├── nextQuestionId?: string (для Branching)
    ├── resultId?: string (для Branching — ведёт к финалу)
    └── resultPoints?: [{resultId, points}] (для Personality)

Results (финальные экраны, 1-N)
├── title: string
├── description?: string
└── imageUrl?: string
```

---

## Бизнес-правила

### Лимиты

- Тестов на пользователя: 20
- Вопросов в тесте: 50
- Картинок в тесте: 100
- Размер картинки: 2 MB (до сжатия)
- Формат хранения: WebP

### Жизненный цикл теста

- `draft` — можно редактировать, нельзя проходить
- `published` — нельзя редактировать, можно проходить

### Перепрохождение

- Настройка `allowRetake` на уровне теста
- `false`: участник видит свой предыдущий результат
- `true`: участник может пройти заново, результат перезаписывается

### Авторизация

- Через Telegram Mini App initData
- Верификация подписи от Telegram

---

## Схема базы данных (Prisma)

```prisma
generator client {
  provider = \"prisma-client-js\"
}

datasource db {
  provider = \"postgresql\"
  url      = env(\"DATABASE_URL\")
}

model User {
  id           String   @id @default(uuid())
  telegramId   BigInt   @unique @map(\"telegram_id\")
  username     String?
  firstName    String?  @map(\"first_name\")
  lastName     String?  @map(\"last_name\")
  languageCode String?  @map(\"language_code\")
  createdAt    DateTime @default(now()) @map(\"created_at\")
  updatedAt    DateTime @updatedAt @map(\"updated_at\")

  tests    Test[]
  sessions UserSession[]

  @@map(\"users\")
}

enum TestType {
  branching
  quiz
  personality
}

enum TestStatus {
  draft
  published
}

model Test {
  id          String     @id @default(uuid())
  ownerId     String     @map(\"owner_id\")
  type        TestType
  status      TestStatus @default(draft)
  slug        String?    @unique
  allowRetake Boolean    @default(false) @map(\"allow_retake\")
  createdAt   DateTime   @default(now()) @map(\"created_at\")
  updatedAt   DateTime   @updatedAt @map(\"updated_at\")
  publishedAt DateTime?  @map(\"published_at\")

  owner         User               @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  welcomeScreen TestWelcomeScreen?
  questions     Question[]
  results       TestResult[]
  sessions      UserSession[]

  @@index([ownerId])
  @@map(\"tests\")
}

model TestWelcomeScreen {
  id          String  @id @default(uuid())
  testId      String  @unique @map(\"test_id\")
  title       String
  description String?
  imageUrl    String? @map(\"image_url\")
  buttonText  String  @default(\"Начать\") @map(\"button_text\")

  test Test @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@map(\"test_welcome_screens\")
}

model Question {
  id       String  @id @default(uuid())
  testId   String  @map(\"test_id\")
  order    Int     @db.SmallInt
  text     String
  imageUrl String? @map(\"image_url\")

  test        Test         @relation(fields: [testId], references: [id], onDelete: Cascade)
  answers     Answer[]
  userAnswers UserAnswer[]

  @@unique([testId, order])
  @@index([testId])
  @@map(\"questions\")
}

model Answer {
  id             String  @id @default(uuid())
  questionId     String  @map(\"question_id\")
  order          Int     @db.SmallInt
  text           String
  imageUrl       String? @map(\"image_url\")
  nextQuestionId String? @map(\"next_question_id\")
  resultId       String? @map(\"result_id\")
  isCorrect      Boolean @default(false) @map(\"is_correct\")

  question     Question            @relation(fields: [questionId], references: [id], onDelete: Cascade)
  nextQuestion Question?           @relation(\"AnswerToNextQuestion\", fields: [nextQuestionId], references: [id], onDelete: SetNull)
  result       TestResult?         @relation(fields: [resultId], references: [id], onDelete: SetNull)
  resultPoints AnswerResultPoint[]
  userAnswers  UserAnswer[]

  previousAnswers Answer[] @relation(\"AnswerToNextQuestion\")

  @@unique([questionId, order])
  @@index([questionId])
  @@map(\"answers\")
}

model TestResult {
  id          String  @id @default(uuid())
  testId      String  @map(\"test_id\")
  title       String
  description String?
  imageUrl    String? @map(\"image_url\")

  test         Test                @relation(fields: [testId], references: [id], onDelete: Cascade)
  answers      Answer[]
  resultPoints AnswerResultPoint[]
  sessions     UserSession[]

  @@index([testId])
  @@map(\"test_results\")
}

model AnswerResultPoint {
  id       String @id @default(uuid())
  answerId String @map(\"answer_id\")
  resultId String @map(\"result_id\")
  points   Int    @default(1) @db.SmallInt

  answer Answer     @relation(fields: [answerId], references: [id], onDelete: Cascade)
  result TestResult @relation(fields: [resultId], references: [id], onDelete: Cascade)

  @@unique([answerId, resultId])
  @@map(\"answer_result_points\")
}

model UserSession {
  id          String    @id @default(uuid())
  userId      String    @map(\"user_id\")
  testId      String    @map(\"test_id\")
  resultId    String?   @map(\"result_id\")
  score       Int?      @db.SmallInt
  maxScore    Int?      @map(\"max_score\") @db.SmallInt
  startedAt   DateTime  @default(now()) @map(\"started_at\")
  completedAt DateTime? @map(\"completed_at\")

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  test         Test           @relation(fields: [testId], references: [id], onDelete: Cascade)
  result       TestResult?    @relation(fields: [resultId], references: [id])
  answers      UserAnswer[]
  sharedResult SharedResult[]

  @@unique([userId, testId])
  @@index([testId])
  @@index([userId])
  @@map(\"user_sessions\")
}

model UserAnswer {
  id         String   @id @default(uuid())
  sessionId  String   @map(\"session_id\")
  questionId String   @map(\"question_id\")
  answerId   String   @map(\"answer_id\")
  answeredAt DateTime @default(now()) @map(\"answered_at\")

  session  UserSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id])
  answer   Answer      @relation(fields: [answerId], references: [id])

  @@unique([sessionId, questionId])
  @@index([sessionId])
  @@index([questionId])
  @@map(\"user_answers\")
}

model SharedResult {
  id        String   @id @default(uuid())
  sessionId String   @map(\"session_id\")
  imageUrl  String   @map(\"image_url\")
  createdAt DateTime @default(now()) @map(\"created_at\")

  session UserSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@map(\"shared_results\")
}
```

---

## API Endpoints

### Аутентификация

| Method | Endpoint             | Описание                            |
| ------ | -------------------- | ----------------------------------- |
| POST   | `/api/auth/telegram` | Авторизация через Telegram initData |

### Тесты (для создателя)

| Method | Endpoint                   | Описание                     |
| ------ | -------------------------- | ---------------------------- |
| GET    | `/api/tests`               | Список своих тестов          |
| POST   | `/api/tests`               | Создать новый тест           |
| GET    | `/api/tests/:id`           | Получить тест по ID          |
| PUT    | `/api/tests/:id`           | Обновить тест (только draft) |
| DELETE | `/api/tests/:id`           | Удалить тест                 |
| POST   | `/api/tests/:id/publish`   | Опубликовать тест            |
| GET    | `/api/tests/:id/analytics` | Аналитика по тесту           |

### Вопросы

| Method | Endpoint                               | Описание         |
| ------ | -------------------------------------- | ---------------- |
| POST   | `/api/tests/:testId/questions`         | Добавить вопрос  |
| PUT    | `/api/questions/:id`                   | Обновить вопрос  |
| DELETE | `/api/questions/:id`                   | Удалить вопрос   |
| PUT    | `/api/tests/:testId/questions/reorder` | Изменить порядок |

### Ответы

| Method | Endpoint                             | Описание       |
| ------ | ------------------------------------ | -------------- |
| POST   | `/api/questions/:questionId/answers` | Добавить ответ |
| PUT    | `/api/answers/:id`                   | Обновить ответ |
| DELETE | `/api/answers/:id`                   | Удалить ответ  |

### Результаты (финальные экраны)

| Method | Endpoint                     | Описание           |
| ------ | ---------------------------- | ------------------ |
| POST   | `/api/tests/:testId/results` | Добавить результат |
| PUT    | `/api/results/:id`           | Обновить результат |
| DELETE | `/api/results/:id`           | Удалить результат  |

### Прохождение (для участника)

| Method | Endpoint                  | Описание                      |
| ------ | ------------------------- | ----------------------------- |
| GET    | `/api/play/:slug`         | Получить тест для прохождения |
| GET    | `/api/play/:slug/session` | Проверить существующую сессию |
| POST   | `/api/play/:slug/start`   | Начать прохождение            |
| POST   | `/api/play/:slug/submit`  | Отправить все ответы          |

### Шеринг

| Method | Endpoint                  | Описание                          |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/api/sessions/:id/share` | Сгенерировать картинку результата |

### Загрузка файлов

| Method | Endpoint            | Описание           |
| ------ | ------------------- | ------------------ |
| POST   | `/api/upload/image` | Загрузить картинку |

### Служебные

| Method | Endpoint  | Описание     |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

---

## Переменные окружения

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://user:password@host:6432/dbname?sslmode=require

REDIS_URL=redis://localhost:6379

S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=quiz-tma-images
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx

TELEGRAM_BOT_TOKEN=xxx
```

---

## Структура проекта

```text
backend/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Fastify app setup
│   ├── config/
│   │   └── index.ts             # Environment config
│   ├── plugins/
│   │   ├── prisma.ts            # Prisma plugin
│   │   ├── redis.ts             # Redis plugin
│   │   └── auth.ts              # Auth decorator
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── tests.ts
│   │   ├── questions.ts
│   │   ├── answers.ts
│   │   ├── results.ts
│   │   ├── play.ts
│   │   ├── upload.ts
│   │   └── share.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── test.service.ts
│   │   ├── question.service.ts
│   │   ├── answer.service.ts
│   │   ├── result.service.ts
│   │   ├── play.service.ts
│   │   ├── upload.service.ts
│   │   ├── share.service.ts
│   │   └── analytics.service.ts
│   ├── utils/
│   │   ├── telegram.ts          # Telegram initData verification
│   │   ├── slug.ts              # Slug generation
│   │   └── errors.ts            # Custom errors
│   └── types/
│       └── index.ts             # TypeScript types
├── tests/
│   ├── setup.ts                 # Test setup
│   ├── helpers.ts               # Test helpers
│   ├── auth.test.ts
│   ├── tests.test.ts
│   ├── questions.test.ts
│   ├── answers.test.ts
│   ├── results.test.ts
│   ├── play.test.ts
│   └── upload.test.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── Dockerfile
└── .env.example
```

---

## Пошаговый план разработки

### Этап 1: Инициализация проекта

**Задачи:**

1. Создать package.json с зависимостями
2. Настроить TypeScript (tsconfig.json)
3. Настроить Vitest (vitest.config.ts)
4. Создать базовую структуру папок
5. Создать конфиг окружения (src/config/index.ts)
6. Создать entry point (src/index.ts) и app setup (src/app.ts)
7. Добавить health endpoint

**Проверка:**

```bash
npm run dev
curl http://localhost:3000/health
# Должен вернуть: {\"status\":\"ok\"}
```

**Тесты:**

- Health endpoint возвращает 200

---

### Этап 2: Подключение базы данных

**Задачи:**

1. Создать prisma/schema.prisma (схема выше)
2. Создать Prisma plugin для Fastify
3. Применить миграции
4. Добавить проверку БД в health endpoint

**Проверка:**

```bash
npx prisma db push
npm run dev
curl http://localhost:3000/health
# Должен вернуть: {\"status\":\"ok\",\"database\":\"connected\"}
```

**Тесты:**

- Prisma client подключается
- Health показывает статус БД

---

### Этап 3: Подключение Redis

**Задачи:**

1. Создать Redis plugin для Fastify
2. Добавить проверку Redis в health endpoint
3. Создать утилиты для rate limiting

**Проверка:**

```bash
npm run dev
curl http://localhost:3000/health
# Должен вернуть: {\"status\":\"ok\",\"database\":\"connected\",\"redis\":\"connected\"}
```

**Тесты:**

- Redis client подключается
- Health показывает статус Redis

---

### Этап 4: Аутентификация Telegram

**Задачи:**

1. Создать утилиту верификации Telegram initData (src/utils/telegram.ts)
2. Создать auth service (src/services/auth.service.ts)
3. Создать auth route POST /api/auth/telegram
4. Создать auth plugin/decorator для защищённых роутов

**Проверка:**

```bash
# Требует валидный initData от Telegram
curl -X POST http://localhost:3000/api/auth/telegram \\
  -H \"Content-Type: application/json\" \\
  -d '{\"initData\":\"...\"}'
```

**Тесты:**

- Валидный initData создаёт/возвращает пользователя
- Невалидный initData возвращает 401
- Истёкший initData возвращает 401
- Повторная авторизация возвращает того же пользователя

---

### Этап 5: CRUD тестов

**Задачи:**

1. Создать test service (src/services/test.service.ts)
2. Создать tests routes (src/routes/tests.ts):

- GET /api/tests (список своих)
- POST /api/tests (создание)
- GET /api/tests/:id (получение)
- PUT /api/tests/:id (обновление)
- DELETE /api/tests/:id (удаление)

3. Добавить валидацию входных данных (JSON Schema)
4. Добавить проверку лимитов (20 тестов)

**Проверка:**

```bash
# С авторизацией
curl http://localhost:3000/api/tests \\
  -H \"Authorization: Bearer <token>\"
```

**Тесты:**

- Создание теста каждого типа
- Получение списка только своих тестов
- Обновление draft теста
- Нельзя обновить published тест
- Удаление теста
- Лимит 20 тестов
- 404 для чужого теста
- 401 без авторизации

---

### Этап 6: Welcome Screen

**Задачи:**

1. Добавить создание welcome screen при создании теста
2. Добавить обновление welcome screen в PUT /api/tests/:id
3. Добавить welcome screen в ответ GET /api/tests/:id

**Тесты:**

- Welcome screen создаётся вместе с тестом
- Welcome screen обновляется
- Welcome screen возвращается с тестом

---

### Этап 7: CRUD вопросов

**Задачи:**

1. Создать question service (src/services/question.service.ts)
2. Создать questions routes (src/routes/questions.ts):

- POST /api/tests/:testId/questions
- PUT /api/questions/:id
- DELETE /api/questions/:id
- PUT /api/tests/:testId/questions/reorder

3. Добавить валидацию лимита (50 вопросов)
4. Автоматическое управление order

**Тесты:**

- Создание вопроса
- Обновление вопроса
- Удаление вопроса (order пересчитывается)
- Reorder вопросов
- Лимит 50 вопросов
- Нельзя добавить вопрос к чужому тесту
- Нельзя добавить вопрос к published тесту

---

### Этап 8: CRUD ответов

**Задачи:**

1. Создать answer service (src/services/answer.service.ts)
2. Создать answers routes (src/routes/answers.ts):

- POST /api/questions/:questionId/answers
- PUT /api/answers/:id
- DELETE /api/answers/:id

3. Поддержка полей для разных типов тестов:

- Quiz: isCorrect
- Branching: nextQuestionId, resultId
- Personality: resultPoints

**Тесты:**

- Создание ответа для каждого типа теста
- Обновление ответа
- Удаление ответа
- Установка isCorrect для quiz
- Установка nextQuestionId для branching
- Установка resultPoints для personality

---

### Этап 9: CRUD результатов

**Задачи:**

1. Создать result service (src/services/result.service.ts)
2. Создать results routes (src/routes/results.ts):

- POST /api/tests/:testId/results
- PUT /api/results/:id
- DELETE /api/results/:id

**Тесты:**

- Создание результата
- Обновление результата
- Удаление результата
- Нельзя удалить результат, на который ссылаются ответы

---

### Этап 10: Публикация теста

**Задачи:**

1. Добавить POST /api/tests/:id/publish
2. Генерация уникального slug
3. Валидация теста перед публикацией:

- Есть welcome screen с title
- Есть минимум 1 вопрос
- У каждого вопроса есть минимум 2 ответа
- Quiz: есть минимум 1 правильный ответ на каждый вопрос
- Personality: есть минимум 1 результат, все ответы имеют points
- Branching: все ветки ведут к результату

**Тесты:**

- Успешная публикация валидного теста
- Ошибка при отсутствии welcome screen
- Ошибка при отсутствии вопросов
- Ошибка при невалидной структуре для каждого типа
- Нельзя опубликовать уже опубликованный тест
- Slug генерируется и уникален

---

### Этап 11: Загрузка изображений

**Задачи:**

1. Создать upload service (src/services/upload.service.ts)
2. Создать upload routes (src/routes/upload.ts):

- POST /api/upload/image

3. Интеграция с Yandex Object Storage (S3)
4. Обработка изображений через Sharp:

- Валидация формата (jpg, png, gif, webp)
- Валидация размера (max 2MB)
- Конвертация в WebP
- Сжатие (quality: 80)
- Resize если > 1920px

**Проверка:**

```bash
curl -X POST http://localhost:3000/api/upload/image \\
  -H \"Authorization: Bearer <token>\" \\
  -F \"file=@test.jpg\"
# Должен вернуть: {\"url\":\"https://...\"}
```

**Тесты:**

- Успешная загрузка JPG
- Успешная загрузка PNG
- Успешная загрузка WebP
- Ошибка при слишком большом файле
- Ошибка при неподдерживаемом формате
- Файл конвертируется в WebP
- Лимит 100 картинок на тест

---

### Этап 12: Прохождение теста

**Задачи:**

1. Создать play service (src/services/play.service.ts)
2. Создать play routes (src/routes/play.ts):

- GET /api/play/:slug (получить тест)
- GET /api/play/:slug/session (проверить сессию)
- POST /api/play/:slug/start (начать)
- POST /api/play/:slug/submit (отправить ответы)

3. Логика подсчёта результата для каждого типа теста
4. Логика allowRetake

**Тесты:**

**Quiz Classic:**

- Получение теста по slug
- Создание сессии
- Подсчёт правильных ответов
- Возврат score и разбора

**Quiz Personality:**

- Подсчёт очков по результатам
- Возврат результата с макс. очками

**Branching:**

- Следование по веткам
- Возврат правильного финала

**Общее:**

- allowRetake=false: возврат существующего результата
- allowRetake=true: перезапись результата
- 404 для несуществующего slug
- 404 для неопубликованного теста

---

### Этап 13: Аналитика

**Задачи:**

1. Создать analytics service (src/services/analytics.service.ts)
2. Добавить GET /api/tests/:id/analytics
3. Метрики:

- Всего прохождений
- Распределение по каждому вопросу (%)
- Распределение по результатам (%)

**Тесты:**

- Возврат корректного количества прохождений
- Корректные проценты по ответам
- Корректные проценты по результатам
- Пустая аналитика для теста без прохождений

---

### Этап 14: Генерация share-картинки

**Задачи:**

1. Создать share service (src/services/share.service.ts)
2. Создать share routes (src/routes/share.ts):

- POST /api/sessions/:id/share

3. Генерация картинки через Satori + Resvg
4. Загрузка в Object Storage
5. Кэширование (не генерировать повторно)

**Тесты:**

- Генерация картинки для quiz результата
- Генерация картинки для personality результата
- Генерация картинки для branching результата
- Повторный запрос возвращает существующую картинку
- Картинка загружается в S3

---

### Этап 15: Rate Limiting

**Задачи:**

1. Добавить rate limiting middleware
2. Лимиты:

- Глобально: 100 req/min на IP
- Создание теста: 20 req/hour на user
- Загрузка картинки: 50 req/hour на user
- Прохождение: 200 req/hour на user

**Тесты:**

- Превышение лимита возвращает 429
- Разные лимиты для разных endpoints
- Лимит сбрасывается через время

---

### Этап 16: Финальная интеграция и документация

**Задачи:**

1. Проверить все endpoints работают вместе
2. Добавить OpenAPI/Swagger документацию
3. Создать Dockerfile
4. Создать .env.example
5. Написать README с инструкцией запуска

**Проверка:**

- Полный flow: создание теста → публикация → прохождение → аналитика → шеринг
- Все тесты проходят
- Docker build успешен

---

## Формат работы

После каждого этапа:

1. Покажи полный код всех созданных/изменённых файлов
2. Покажи команды для проверки
3. Покажи код тестов
4. Дождись подтверждения что этап работает

Начни с **Этапа 1: Инициализация проекта**.

```

```
