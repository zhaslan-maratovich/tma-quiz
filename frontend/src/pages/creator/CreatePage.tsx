/**
 * CreatePage - Страница создания теста (выбор типа)
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer, Header } from '@/components/layout';
import { TestTypeSelector } from '@/components/test/TestTypeSelector';
import { useCreateTest } from '@/hooks/useTests';
import { useBackButton } from '@/hooks/useTelegram';
import { haptic } from '@/lib/telegram';
import type { TestType } from '@/types';

export function CreatePage() {
  const navigate = useNavigate();
  const createTest = useCreateTest();

  useBackButton(() => navigate(-1));

  const handleSelectType = async (type: TestType) => {
    haptic.impact('medium');

    try {
      const test = await createTest.mutateAsync({
        type,
        welcomeScreen: {
          title: getDefaultTitle(type),
          buttonText: 'Начать',
        },
      });

      haptic.notification('success');
      navigate(`/tests/${test.id}/edit`);
    } catch (error) {
      haptic.notification('error');
      console.error('Failed to create test:', error);
    }
  };

  return (
    <PageContainer
      header={
        <Header
          title="Новый тест"
          subtitle="Выберите тип теста"
          showBack
        />
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-8"
      >
        {/* Info section */}
        <div className="mb-6">
          <p className="text-sm text-tg-hint">
            Выберите подходящий тип теста. Вы сможете изменить настройки после создания.
          </p>
        </div>

        {/* Type selector */}
        <TestTypeSelector onSelect={handleSelectType} />

        {/* Loading state */}
        {createTest.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-tg-bg/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-tg-text font-medium">Создаём тест...</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageContainer>
  );
}

function getDefaultTitle(type: TestType): string {
  switch (type) {
    case 'quiz':
      return 'Новая викторина';
    case 'personality':
      return 'Тест личности';
    case 'branching':
      return 'Интерактивная история';
    default:
      return 'Новый тест';
  }
}
