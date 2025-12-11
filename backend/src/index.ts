/**
 * Entry point приложения
 */

import { buildApp, startApp } from './app.js';

/**
 * Главная функция запуска
 */
async function main(): Promise<void> {
  const app = await buildApp();
  await startApp(app);

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  });
}

// Запуск приложения
main().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
