# Feature Компоненты

Компоненты бизнес-логики, реализованные по паттерну **Container/View**.

## Структура

```
features/
├── test/                    # Компоненты для работы с тестами
│   ├── TestCard/            # Карточка теста в списке
│   ├── TestTypeSelector/    # Выбор типа теста при создании
│   └── index.ts
│
├── question/                # Компоненты вопросов/ответов
│   ├── QuestionCard/        # Карточка вопроса в редакторе
│   ├── AnswerItem/          # Элемент ответа
│   └── index.ts
│
├── analytics/               # Компоненты аналитики
│   ├── StatCard/            # Карточка статистики
│   └── index.ts
│
└── index.ts
```

## Container/View паттерн

Каждый feature-компонент состоит из:

| Файл | Назначение |
|------|------------|
| `*.types.ts` | TypeScript интерфейсы |
| `*.view.tsx` | Презентационный компонент (только JSX) |
| `*.container.tsx` | Логика, данные, обработчики |
| `*.hooks.ts` | Локальные хуки компонента (опционально) |
| `index.ts` | Реэкспорты |

### Пример структуры

```
TestCard/
├── TestCard.types.ts      # Типы props
├── TestCard.view.tsx      # View компонент
├── TestCard.container.tsx # Container с логикой
├── TestCard.hooks.ts      # Хуки (опционально)
└── index.ts               # export { TestCard } from './TestCard.container'
```

## Компоненты

### TestCard

Карточка теста в списке на главной странице.

```tsx
import { TestCard } from '@/components/features/test';

// Container - сам получает данные по id
<TestCard testId="123" />

// Или с переданными данными
<TestCard test={testData} onDelete={handleDelete} />
```

**Функциональность:**
- Отображение информации о тесте
- Навигация на редактирование/аналитику/шеринг
- Удаление теста
- Меню быстрых действий

---

### TestTypeSelector

Выбор типа теста при создании.

```tsx
import { TestTypeSelector } from '@/components/features/test';

<TestTypeSelector onSelect={(type) => handleCreate(type)} />
```

**Типы тестов:**
- `quiz` — Викторина с правильными ответами
- `personality` — Тест-типология
- `branching` — Разветвлённый сюжет

---

### QuestionCard

Редактируемая карточка вопроса.

```tsx
import { QuestionCard } from '@/components/features/question';

<QuestionCard
  question={questionData}
  index={0}
  testType="quiz"
  isExpanded={true}
  onToggle={handleToggle}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  disabled={isPublished}
/>
```

---

### AnswerItem

Элемент ответа внутри карточки вопроса.

```tsx
import { AnswerItem } from '@/components/features/question';

<AnswerItem
  answer={answerData}
  testType="quiz"
  isSelected={selectedId === answer.id}
  onUpdate={handleUpdate}
  onToggleCorrect={handleToggle}
  onDelete={handleDelete}
/>
```

---

### StatCard

Карточка статистики для страницы аналитики.

```tsx
import { StatCard } from '@/components/features/analytics';

<StatCard
  icon={<Users />}
  value={150}
  label="прохождений"
  color="primary"
/>
```

## Правила разработки

1. **Container** содержит:
   - Хуки для данных (useQuery, useMutation)
   - Обработчики событий
   - Навигацию
   - Локальное состояние

2. **View** содержит:
   - Только JSX разметку
   - Стили через props/className
   - Вызов переданных колбэков

3. **View должен быть чистым**:
   - Получает всё через props
   - Не вызывает хуки с side effects
   - Легко тестируется
