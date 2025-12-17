/**
 * CreatePage View - презентационный компонент
 */

import { motion } from 'framer-motion';
import { PageContainer, Header } from '@/components/layout';
import { TestTypeSelector } from '@/components/features/test';
import type { CreatePageViewProps } from './CreatePage.types';

export function CreatePageView({ isCreating, onSelectType }: CreatePageViewProps) {
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
        <TestTypeSelector onSelect={onSelectType} />

        {/* Loading state */}
        {isCreating && (
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
