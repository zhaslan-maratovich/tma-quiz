/**
 * Экспорт всех API модулей
 */

export * from './client';
export * from './auth';
export * from './tests';
export * from './questions';
export * from './answers';
export * from './results';
export * from './play';

// Re-export API objects
export { authApi } from './auth';
export { testsApi } from './tests';
export { questionsApi } from './questions';
export { answersApi } from './answers';
export { resultsApi } from './results';
export { playApi } from './play';
