# Компоненты

## Архитектура

Проект использует **Container/View паттерн** для разделения бизнес-логики и представления.

### Структура папок

```
components/
├── ui/                    # Базовые UI компоненты (atoms)
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── ...
│
├── layout/                # Компоненты макета
│   ├── PageContainer/
│   ├── Header/
│   └── EmptyState/
│
├── shared/                # Переиспользуемые бизнес-компоненты
│   ├── LoadingScreen/
│   ├── ErrorScreen/
│   └── ...
│
└── features/              # Компоненты фич (Container/View)
    ├── test/
    │   ├── TestCard/
    │   │   ├── TestCard.container.tsx
    │   │   ├── TestCard.view.tsx
    │   │   ├── TestCard.types.ts
    │   │   └── index.ts
    │   └── TestTypeSelector/
    │
    └── question/
        ├── QuestionCard/
        └── AnswerItem/
```

### Container/View паттерн

#### Container (контейнер)
- Содержит бизнес-логику
- Работает с данными (API, stores)
- Управляет состоянием
- Передает данные и колбэки во View

#### View (представление)
- Только отображение (JSX)
- Получает данные через props
- Не содержит бизнес-логики
- Легко тестировать

### Пример использования

```tsx
// TestCard.types.ts
export interface TestCardViewProps {
  title: string;
  description?: string;
  onEdit: () => void;
  onDelete: () => void;
}

// TestCard.view.tsx
export function TestCardView({ title, description, onEdit, onDelete }: TestCardViewProps) {
  return (
    <Card>
      <h3>{title}</h3>
      <p>{description}</p>
      <Button onClick={onEdit}>Редактировать</Button>
      <Button onClick={onDelete}>Удалить</Button>
    </Card>
  );
}

// TestCard.container.tsx
export function TestCard({ testId }: { testId: string }) {
  const { data: test } = useTest(testId);
  const navigate = useNavigate();
  const deleteTest = useDeleteTest();

  const handleEdit = () => navigate(`/tests/${testId}/edit`);
  const handleDelete = () => deleteTest.mutate(testId);

  return (
    <TestCardView
      title={test.title}
      description={test.description}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

// index.ts
export { TestCard } from './TestCard.container';
export { TestCardView } from './TestCard.view';
export type { TestCardViewProps } from './TestCard.types';
```

## Правила именования

| Файл | Содержимое |
|------|------------|
| `*.view.tsx` | Презентационный компонент |
| `*.container.tsx` | Контейнер с логикой |
| `*.types.ts` | TypeScript типы |
| `*.hooks.ts` | Кастомные хуки компонента |
| `index.ts` | Реэкспорты |
