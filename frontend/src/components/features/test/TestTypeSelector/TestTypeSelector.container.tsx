/**
 * TestTypeSelector Container - компонент с логикой
 */

import { FileText, Brain, GitBranch } from 'lucide-react';
import { haptic } from '@/lib/telegram';
import { TestTypeSelectorView } from './TestTypeSelector.view';
import type { TestTypeSelectorContainerProps, TestTypeOption } from './TestTypeSelector.types';
import type { TestType } from '@/types';

/**
 * Конфигурация доступных типов тестов
 */
const testTypeOptions: TestTypeOption[] = [
  {
    type: 'quiz',
    icon: <FileText className="h-7 w-7" />,
    title: 'Викторина',
    description: 'Классический тест с правильными ответами',
    features: ['Один правильный ответ', 'Подсчёт баллов', 'Разбор ошибок'],
    color: 'text-primary-500',
    bgColor: 'bg-primary-500/10',
  },
  {
    type: 'personality',
    icon: <Brain className="h-7 w-7" />,
    title: 'Тест-типология',
    description: 'Определяет тип личности или характер',
    features: ['Очки за ответы', 'Несколько результатов', 'Личностный профиль'],
    color: 'text-accent-violet',
    bgColor: 'bg-accent-violet/10',
  },
  {
    type: 'branching',
    icon: <GitBranch className="h-7 w-7" />,
    title: 'Разветвлённый сюжет',
    description: 'Интерактивная история с выборами',
    features: ['Ветвление сюжета', 'Множество концовок', 'Уникальный путь'],
    color: 'text-accent-emerald',
    bgColor: 'bg-accent-emerald/10',
  },
];

export function TestTypeSelector({ onSelect }: TestTypeSelectorContainerProps) {
  const handleSelect = (type: TestType) => {
    haptic.impact('medium');
    onSelect(type);
  };

  return (
    <TestTypeSelectorView
      options={testTypeOptions}
      onSelect={handleSelect}
    />
  );
}
