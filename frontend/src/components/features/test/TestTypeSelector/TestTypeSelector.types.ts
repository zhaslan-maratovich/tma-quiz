/**
 * Типы для TestTypeSelector компонента
 */

import type { TestType } from '@/types';

/**
 * Опция типа теста для отображения
 */
export interface TestTypeOption {
    type: TestType;
    icon: React.ReactNode;
    title: string;
    description: string;
    features: string[];
    color: string;
    bgColor: string;
}

/**
 * Props для View компонента
 */
export interface TestTypeSelectorViewProps {
    /** Список опций для выбора */
    options: TestTypeOption[];
    /** Обработчик выбора типа */
    onSelect: (type: TestType) => void;
}

/**
 * Props для Container компонента
 */
export interface TestTypeSelectorContainerProps {
    /** Обработчик выбора типа */
    onSelect: (type: TestType) => void;
}
