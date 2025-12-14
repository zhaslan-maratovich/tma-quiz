/**
 * Seed script для создания тестовых данных
 * Запуск: npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Тестовый пользователь для локальной разработки
 * Используй этот telegramId в заголовке X-Dev-User-Id
 */
const DEV_USER = {
  telegramId: BigInt(123456789),
  username: 'dev_user',
  firstName: 'Dev',
  lastName: 'User',
  languageCode: 'ru',
};

async function main() {
  console.log('🌱 Seeding database...\n');

  // Создаём или обновляем тестового пользователя
  const user = await prisma.user.upsert({
    where: { telegramId: DEV_USER.telegramId },
    update: {
      username: DEV_USER.username,
      firstName: DEV_USER.firstName,
      lastName: DEV_USER.lastName,
    },
    create: DEV_USER,
  });

  console.log('✅ Dev user created/updated:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Telegram ID: ${user.telegramId}`);
  console.log(`   Username: @${user.username}`);
  console.log(`   Name: ${user.firstName} ${user.lastName}\n`);

  // Создаём тестовый тест (quiz)
  const existingTest = await prisma.test.findFirst({
    where: { ownerId: user.id },
  });

  if (!existingTest) {
    const test = await prisma.test.create({
      data: {
        ownerId: user.id,
        type: 'quiz',
        status: 'draft',
        welcomeScreen: {
          create: {
            title: 'Тестовый квиз',
            description: 'Это тестовый квиз для разработки',
            buttonText: 'Начать тест',
          },
        },
        questions: {
          create: [
            {
              order: 0,
              text: 'Какой язык используется в этом проекте?',
              answers: {
                create: [
                  { order: 0, text: 'JavaScript', isCorrect: false },
                  { order: 1, text: 'TypeScript', isCorrect: true },
                  { order: 2, text: 'Python', isCorrect: false },
                ],
              },
            },
            {
              order: 1,
              text: 'Какой фреймворк используется?',
              answers: {
                create: [
                  { order: 0, text: 'Express', isCorrect: false },
                  { order: 1, text: 'Fastify', isCorrect: true },
                  { order: 2, text: 'Koa', isCorrect: false },
                ],
              },
            },
          ],
        },
        results: {
          create: [
            {
              title: 'Отлично!',
              description: 'Ты ответил правильно на все вопросы!',
            },
            {
              title: 'Неплохо',
              description: 'Можешь лучше!',
            },
          ],
        },
      },
      include: {
        welcomeScreen: true,
        questions: { include: { answers: true } },
        results: true,
      },
    });

    console.log('✅ Test quiz created:');
    console.log(`   ID: ${test.id}`);
    console.log(`   Title: ${test.welcomeScreen?.title}`);
    console.log(`   Questions: ${test.questions.length}`);
    console.log(`   Results: ${test.results.length}\n`);
  } else {
    console.log('ℹ️  Test already exists, skipping...\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed completed!\n');
  console.log('📝 Для тестирования API используй заголовок:');
  console.log(`   X-Dev-User-Id: ${DEV_USER.telegramId}\n`);
  console.log('Пример cURL:');
  console.log(`   curl -H "X-Dev-User-Id: ${DEV_USER.telegramId}" http://localhost:3000/api/tests`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
