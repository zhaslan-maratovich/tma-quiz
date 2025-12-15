/**
 * HomePage - Главный экран со списком тестов
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { PageContainer, Header, EmptyState } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { SkeletonList } from '@/components/ui/Skeleton';
import { TestCard } from '@/components/test/TestCard';
import { useTests, useDeleteTest } from '@/hooks/useTests';
import { useAuth } from '@/hooks/useAuth';
import { haptic, showConfirm } from '@/lib/telegram';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tests, isLoading, error } = useTests();
  const deleteTest = useDeleteTest();

  const handleCreateTest = () => {
    haptic.impact('medium');
    navigate('/create');
  };

  const handleDeleteTest = async (id: string) => {
    const confirmed = await showConfirm('Удалить этот тест? Это действие нельзя отменить.');
    if (confirmed) {
      haptic.notification('warning');
      deleteTest.mutate(id);
    }
  };

  const greeting = user?.firstName ? `Привет, ${user.firstName}!` : 'Привет!';

  return (
    <PageContainer
      gradient
      header={
        <Header
          rightAction={
            <Button
              variant="gradient"
              size="sm"
              onClick={handleCreateTest}
            >
              <Plus className="h-4 w-4" />
              Создать
            </Button>
          }
        />
      }
    >
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-tg-text mb-1">
          {greeting}
        </h1>
        <p className="text-tg-hint">
          Создавайте тесты и делитесь ими с аудиторией
        </p>
      </motion.div>

      {/* Quick create card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onClick={handleCreateTest}
        className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-accent-violet cursor-pointer transition-transform active:scale-[0.98] shadow-lg shadow-primary-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-0.5">
              Создать новый тест
            </h3>
            <p className="text-sm text-white/80">
              Викторина, тест личности или сюжет
            </p>
          </div>
          <Plus className="h-6 w-6 text-white" />
        </div>
      </motion.div>

      {/* Tests section */}
      <div>
        <h2 className="text-lg font-semibold text-tg-text mb-4">
          Мои тесты
        </h2>

        {isLoading && <SkeletonList count={3} />}

        {error && (
          <div className="text-center py-8">
            <p className="text-tg-destructive mb-4">Ошибка загрузки</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        )}

        {!isLoading && !error && tests?.length === 0 && (
          <EmptyState
            icon={<FileText className="h-16 w-16" />}
            title="Пока нет тестов"
            description="Создайте свой первый тест и поделитесь им с аудиторией"
            action={{
              label: 'Создать тест',
              onClick: handleCreateTest,
            }}
          />
        )}

        {!isLoading && !error && tests && tests.length > 0 && (
          <div className="space-y-3">
            {tests.map((test, index) => (
              <TestCard
                key={test.id}
                test={test}
                index={index}
                onDelete={handleDeleteTest}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
