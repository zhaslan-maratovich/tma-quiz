# UI Компоненты

Базовые переиспользуемые UI компоненты (atoms). Не содержат бизнес-логики.

## Компоненты

### Button

Кнопка с различными вариантами стилизации.

```tsx
import { Button } from '@/components/ui';

// Варианты
<Button variant="default">По умолчанию</Button>
<Button variant="gradient">Градиент</Button>
<Button variant="secondary">Вторичная</Button>
<Button variant="destructive">Удаление</Button>
<Button variant="ghost">Прозрачная</Button>
<Button variant="outline">С рамкой</Button>
<Button variant="success">Успех</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="default">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon">🔍</Button>

// Состояния
<Button loading>Загрузка...</Button>
<Button disabled>Отключена</Button>
<Button fullWidth>На всю ширину</Button>
```

### Card

Карточка для группировки контента.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

// Базовое использование
<Card>Контент</Card>

// С интерактивностью
<Card interactive onClick={handleClick}>
  Кликабельная карточка
</Card>

// Размеры padding
<Card padding="none">Без отступов</Card>
<Card padding="sm">Маленькие отступы</Card>
<Card padding="md">Средние отступы (по умолчанию)</Card>
<Card padding="lg">Большие отступы</Card>

// С заголовком
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
  </CardHeader>
  <CardContent>Основной контент</CardContent>
  <CardFooter>Футер</CardFooter>
</Card>
```

### Input

Поле ввода текста.

```tsx
import { Input } from '@/components/ui';

<Input
  placeholder="Введите текст"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// С ошибкой
<Input error />
```

### Textarea

Многострочное поле ввода.

```tsx
import { Textarea } from "@/components/ui";

<Textarea
  placeholder="Описание"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
/>;
```

### Badge

Метка/бейдж для статусов.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">По умолчанию</Badge>
<Badge variant="success">Успех</Badge>
<Badge variant="warning">Предупреждение</Badge>
<Badge variant="destructive">Ошибка</Badge>
<Badge variant="secondary">Вторичный</Badge>
<Badge variant="gradient">Градиент</Badge>

<Badge size="sm">Маленький</Badge>
<Badge size="default">Обычный</Badge>
```

### Progress

Полоса прогресса.

```tsx
import { Progress } from '@/components/ui';

<Progress value={75} />

// Варианты
<Progress value={50} variant="default" />
<Progress value={50} variant="gradient" />
<Progress value={50} variant="success" />
<Progress value={50} variant="warning" />

// Размеры
<Progress value={50} size="sm" />
<Progress value={50} size="md" />
<Progress value={50} size="lg" />
```

### Skeleton

Заглушка для загрузки.

```tsx
import { Skeleton, SkeletonList } from '@/components/ui';

// Базовый скелетон
<Skeleton className="h-8 w-48" />

// Список скелетонов
<SkeletonList count={3} />
```

## Принципы разработки

1. **Без бизнес-логики** — только презентационный слой
2. **Типизация** — все props типизированы через TypeScript
3. **Доступность** — поддержка a11y (focus states, aria-labels)
4. **Консистентность** — единый стиль через Tailwind и CVA
5. **Haptic feedback** — интеграция с Telegram WebApp
