# Quiz TMA - Test Frontend

Простое тестовое приложение для проверки интеграции с бэкендом.

## Быстрый старт

### 1. Запусти бэкенд

```bash
cd ../backend
docker-compose up -d          # PostgreSQL + Redis
npm run prisma:push           # Применить схему
npm run prisma:seed           # Создать тестового пользователя
npm run dev                   # Запустить сервер на :3000
```

### 2. Запусти фронтенд

```bash
npm install
npm run dev                   # Запустить на :5173
```

### 3. Открой в браузере

```
http://localhost:5173
```

## Что умеет

- ✅ Проверка подключения к API
- ✅ Автоматическая авторизация (dev-режим с X-Dev-User-Id)
- ✅ Создание теста с заготовленными данными
- ✅ Просмотр списка тестов
- ✅ Удаление тестов

## Dev-режим vs Telegram

| Режим         | Авторизация                     | Как запустить             |
| ------------- | ------------------------------- | ------------------------- |
| Browser (dev) | `X-Dev-User-Id: 123456789`      | Просто открыть в браузере |
| Telegram      | `Authorization: tma {initData}` | Открыть через бота        |

## Файлы

```
frontend/
├── src/
│   ├── App.tsx     # Главный компонент
│   ├── api.ts      # API клиент
│   └── App.css     # Стили
├── index.html      # HTML с Telegram WebApp SDK
└── .env            # VITE_API_URL=http://localhost:3000
```
