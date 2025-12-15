# Quiz Creator - Telegram Mini App Frontend

Фронтенд для Telegram Mini App конструктора тестов и опросов.

## 🚀 Технологии

| Технология | Назначение |
|------------|------------|
| React 18+ | UI Framework |
| TypeScript | Типизация |
| Vite | Сборка |
| React Router v7 | Маршрутизация |
| TanStack Query | Работа с API |
| Zustand | State Management |
| Tailwind CSS | Стилизация |
| Radix UI | Headless компоненты |
| Framer Motion | Анимации |
| Lucide React | Иконки |

## 📁 Структура проекта

```
src/
├── api/                    # API слой
│   ├── client.ts          # HTTP клиент
│   ├── auth.ts            # Auth API
│   ├── tests.ts           # Tests API
│   ├── questions.ts       # Questions API
│   ├── answers.ts         # Answers API
│   ├── results.ts         # Results API
│   └── play.ts            # Play API
│
├── components/            # Компоненты
│   ├── ui/               # Base UI компоненты
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Progress.tsx
│   │   └── Skeleton.tsx
│   ├── layout/           # Layout компоненты
│   │   ├── PageContainer.tsx
│   │   ├── Header.tsx
│   │   └── EmptyState.tsx
│   └── test/             # Test компоненты
│       ├── TestCard.tsx
│       └── TestTypeSelector.tsx
│
├── pages/                # Страницы
│   ├── creator/         # Режим создателя
│   │   ├── HomePage.tsx
│   │   ├── CreatePage.tsx
│   │   ├── EditTestPage.tsx
│   │   ├── SharePage.tsx
│   │   └── AnalyticsPage.tsx
│   └── player/          # Режим игрока
│       ├── WelcomePage.tsx
│       ├── QuestionPage.tsx
│       └── ResultPage.tsx
│
├── hooks/               # Custom hooks
│   ├── useTelegram.ts
│   ├── useAuth.ts
│   └── useTests.ts
│
├── stores/              # Zustand stores
│   ├── authStore.ts
│   └── playStore.ts
│
├── lib/                 # Утилиты
│   ├── telegram.ts      # Telegram SDK helpers
│   └── utils.ts         # Общие утилиты
│
├── types/               # TypeScript типы
│   └── index.ts
│
├── App.tsx              # Root компонент
├── main.tsx             # Entry point
└── index.css            # Глобальные стили
```

## 🛠 Установка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр собранной версии
npm run preview
```

## ⚙️ Настройка

Создайте файл `.env` на основе `.env.example`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000

# Telegram Bot Username (для генерации ссылок)
VITE_BOT_USERNAME=your_bot_username

# Development mode init data (опционально)
VITE_DEV_INIT_DATA=
```

## 🎨 Особенности дизайна

### Telegram Theme Integration

Приложение автоматически адаптируется к цветовой схеме Telegram:
- Использует CSS переменные Telegram (`--tg-theme-*`)
- Поддерживает светлую и тёмную темы
- Учитывает Safe Area для разных устройств

### Анимации

- **Framer Motion** для сложных анимаций
- Плавные переходы между экранами
- Haptic feedback при взаимодействии
- Skeleton loading для контента

### Компоненты

UI компоненты построены с использованием:
- **Radix UI** для доступности
- **class-variance-authority** для вариантов стилей
- **tailwind-merge** для объединения классов

## 📱 Режимы работы

### Creator Mode (Создатель)
- `/` - Список тестов
- `/create` - Выбор типа теста
- `/tests/:id/edit` - Редактор теста
- `/tests/:id/analytics` - Аналитика
- `/tests/:id/share` - Шеринг

### Player Mode (Игрок)
- `/play/:slug` - Welcome Screen
- `/play/:slug/question` - Прохождение
- `/play/:slug/result` - Результат

## 🔗 API Интеграция

Все запросы к API проходят через `src/api/client.ts`:

```typescript
// Авторизация через Telegram initData
const initData = window.Telegram.WebApp.initData;
headers['Authorization'] = `tma ${initData}`;
```

## 📦 Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`.

## 🧪 Разработка без Telegram

Для тестирования без Telegram можно:

1. Установить `VITE_DEV_INIT_DATA` в `.env`
2. Приложение будет использовать dev-токен для авторизации

## 📄 Лицензия

MIT
