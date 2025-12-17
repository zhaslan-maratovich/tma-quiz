# Layout Компоненты

Компоненты для построения макета страницы.

## Компоненты

### PageContainer

Обёртка для страницы с поддержкой header, footer и safe areas.

```tsx
import { PageContainer } from '@/components/layout';

// Базовое использование
<PageContainer>
  <h1>Контент страницы</h1>
</PageContainer>

// С header и footer
<PageContainer
  header={<Header title="Заголовок" showBack />}
  footer={<Button fullWidth>Действие</Button>}
>
  Контент
</PageContainer>

// Props
<PageContainer
  gradient       // Добавить градиентный фон
  noPadding      // Убрать внутренние отступы
  className=""   // Дополнительные классы
>
  Контент
</PageContainer>
```

**Props:**

| Prop        | Тип         | По умолчанию | Описание         |
| ----------- | ----------- | ------------ | ---------------- |
| `children`  | `ReactNode` | —            | Контент страницы |
| `header`    | `ReactNode` | —            | Шапка страницы   |
| `footer`    | `ReactNode` | —            | Подвал страницы  |
| `gradient`  | `boolean`   | `false`      | Градиентный фон  |
| `noPadding` | `boolean`   | `false`      | Без отступов     |
| `className` | `string`    | —            | CSS классы       |

---

### Header

Шапка страницы с поддержкой навигации и действий.

```tsx
import { Header } from '@/components/layout';

// Базовый
<Header title="Заголовок" />

// С подзаголовком
<Header title="Заголовок" subtitle="Подзаголовок" />

// С кнопкой назад
<Header title="Редактор" showBack />

// С кастомным обработчиком назад
<Header title="Редактор" showBack onBack={() => navigate('/')} />

// С действием справа
<Header
  title="Аналитика"
  showBack
  rightAction={
    <Button variant="ghost" size="icon-sm">
      <Share2 />
    </Button>
  }
/>

// Прозрачный
<Header title="Страница" transparent />
```

**Props:**

| Prop          | Тип          | По умолчанию   | Описание               |
| ------------- | ------------ | -------------- | ---------------------- |
| `title`       | `string`     | —              | Заголовок              |
| `subtitle`    | `string`     | —              | Подзаголовок           |
| `showBack`    | `boolean`    | `false`        | Показать кнопку назад  |
| `onBack`      | `() => void` | `navigate(-1)` | Обработчик клика назад |
| `rightAction` | `ReactNode`  | —              | Элемент справа         |
| `transparent` | `boolean`    | `false`        | Прозрачный фон         |
| `className`   | `string`     | —              | CSS классы             |

---

### EmptyState

Состояние пустого списка с иконкой, текстом и действием.

```tsx
import { EmptyState } from '@/components/layout';

// Базовое использование
<EmptyState
  title="Пока нет тестов"
  description="Создайте свой первый тест"
/>

// С иконкой
<EmptyState
  icon={<FileText className="h-16 w-16" />}
  title="Пока нет тестов"
  description="Создайте свой первый тест и поделитесь им"
/>

// С действием
<EmptyState
  icon={<FileText className="h-16 w-16" />}
  title="Пока нет тестов"
  description="Создайте свой первый тест"
  action={{
    label: 'Создать тест',
    onClick: handleCreate,
  }}
/>
```

**Props:**

| Prop          | Тип                  | По умолчанию | Описание        |
| ------------- | -------------------- | ------------ | --------------- |
| `icon`        | `ReactNode`          | —            | Иконка          |
| `title`       | `string`             | —            | Заголовок       |
| `description` | `string`             | —            | Описание        |
| `action`      | `{ label, onClick }` | —            | Кнопка действия |
| `className`   | `string`             | —            | CSS классы      |

---

## Паттерны использования

### Типичная структура страницы

```tsx
function MyPage() {
  return (
    <PageContainer
      header={<Header title="Моя страница" showBack />}
      footer={<FooterActions />}
    >
      <MainContent />
    </PageContainer>
  );
}
```

### Страница с пустым состоянием

```tsx
function ListPage() {
  const { data, isLoading } = useItems();

  return (
    <PageContainer header={<Header title="Список" />}>
      {isLoading && <Skeleton />}

      {!isLoading && data?.length === 0 && (
        <EmptyState
          title="Список пуст"
          action={{ label: "Добавить", onClick: handleAdd }}
        />
      )}

      {!isLoading && data?.length > 0 && <ItemList items={data} />}
    </PageContainer>
  );
}
```
