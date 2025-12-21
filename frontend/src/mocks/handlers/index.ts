/**
 * Экспорт всех MSW handlers
 * Объединяет все handlers в один массив для использования с setupWorker
 */

import { authHandlers } from './auth';
import { testsHandlers } from './tests';
import { questionsHandlers } from './questions';
import { answersHandlers } from './answers';
import { resultsHandlers } from './results';
import { playHandlers } from './play';
import { healthHandlers } from './health';

/**
 * Все handlers для MSW
 */
export const handlers = [
    ...healthHandlers,
    ...authHandlers,
    ...testsHandlers,
    ...questionsHandlers,
    ...answersHandlers,
    ...resultsHandlers,
    ...playHandlers,
];

// Реэкспорт отдельных handlers для возможности использования в тестах
export { authHandlers } from './auth';
export { testsHandlers } from './tests';
export { questionsHandlers } from './questions';
export { answersHandlers } from './answers';
export { resultsHandlers } from './results';
export { playHandlers } from './play';
export { healthHandlers } from './health';
