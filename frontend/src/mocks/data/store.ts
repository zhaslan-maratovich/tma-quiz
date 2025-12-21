/**
 * Централизованное хранилище для MSW handlers
 *
 * Все handlers используют одно хранилище для синхронизации данных
 */

import type { Test } from '@/types';
import { mockTests } from './tests';

/**
 * Singleton store для тестов
 * Все handlers импортируют это хранилище
 */
class MockStore {
    private _tests: Test[] = [...mockTests];

    /**
     * Получить все тесты
     */
    get tests(): Test[] {
        return this._tests;
    }

    /**
     * Установить тесты
     */
    set tests(value: Test[]) {
        this._tests = value;
    }

    /**
     * Найти тест по ID
     */
    findTestById(id: string): Test | undefined {
        return this._tests.find((t) => t.id === id);
    }

    /**
     * Найти тест по slug
     */
    findTestBySlug(slug: string): Test | undefined {
        return this._tests.find((t) => t.slug === slug && t.status === 'published');
    }

    /**
     * Найти индекс теста
     */
    findTestIndex(id: string): number {
        return this._tests.findIndex((t) => t.id === id);
    }

    /**
     * Добавить тест
     */
    addTest(test: Test): void {
        this._tests.push(test);
    }

    /**
     * Обновить тест
     */
    updateTest(index: number, test: Test): void {
        this._tests[index] = test;
    }

    /**
     * Удалить тест
     */
    removeTest(index: number): void {
        this._tests.splice(index, 1);
    }

    /**
     * Сбросить хранилище к начальному состоянию
     */
    reset(): void {
        this._tests = [...mockTests];
    }
}

/**
 * Единственный экземпляр store
 */
export const mockStore = new MockStore();
