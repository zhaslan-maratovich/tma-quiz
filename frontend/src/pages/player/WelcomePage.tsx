/**
 * WelcomePage - Приветственный экран теста для прохождения
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Play, RotateCcw } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { playApi } from '@/api';
import { usePlayStore } from '@/stores/playStore';
import { useMainButton, useHaptic } from '@/hooks/useTelegram';
import { pluralize } from '@/lib/utils';

export function WelcomePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();

  const { setTest, startTest, loadProgress } = usePlayStore();

  // Fetch test data
  const { data: test, isLoading, error } = useQuery({
    queryKey: ['play', slug],
    queryFn: () => playApi.getTestBySlug(slug!),
    enabled: !!slug,
  });

  // Check existing session
  const { data: existingSession } = useQuery({
    queryKey: ['play', slug, 'session'],
    queryFn: () => playApi.getExistingSession(slug!),
    enabled: !!slug,
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: () => playApi.startTest(slug!),
    onSuccess: (result) => {
      // Если получили sessionId - тест успешно начат
      if (result.sessionId) {
        // Убеждаемся что test установлен в стор
        if (test) {
          setTest(test);
        }
        startTest();
        haptic.notification('success');
        navigate(`/play/${slug}/question`);
      }
    },
    onError: (error) => {
      console.error('Start test error:', error);
      haptic.notification('error');
    },
  });

  // Set test data to store
  useEffect(() => {
    if (test) {
      setTest(test);

      // Try to load saved progress
      if (loadProgress(slug!)) {
        // Has saved progress
      }
    }
  }, [test, setTest, loadProgress, slug]);

  const handleStart = () => {
    haptic.impact('medium');
    // Сначала мутируем API, потом в onSuccess делаем переход
    startTestMutation.mutate();
  };

  const handleViewResult = () => {
    haptic.impact('light');
    navigate(`/play/${slug}/result`);
  };

  // Use Telegram MainButton
  useMainButton(
    existingSession?.completedAt && !test?.allowRetake
      ? 'Посмотреть результат'
      : test?.welcomeScreen?.buttonText || 'Начать',
    existingSession?.completedAt && !test?.allowRetake
      ? handleViewResult
      : handleStart,
    { enabled: !!test && !isLoading }
  );

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center pt-8">
          <Skeleton className="w-full aspect-video rounded-2xl mb-6" />
          <Skeleton className="h-8 w-64 mb-3" />
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
      </PageContainer>
    );
  }

  if (error || !test) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-tg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-lg font-semibold text-tg-text mb-2">
            Тест не найден
          </h2>
          <p className="text-sm text-tg-hint">
            Возможно, ссылка устарела или тест был удалён
          </p>
        </div>
      </PageContainer>
    );
  }

  const hasCompletedSession = existingSession?.completedAt;
  const canRetake = test.allowRetake;

  return (
    <PageContainer gradient noPadding>
      <div className="flex flex-col min-h-screen">
        {/* Cover image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {test.welcomeScreen?.imageUrl ? (
            <img
              src={test.welcomeScreen.imageUrl}
              alt={test.welcomeScreen.title}
              className="w-full aspect-[16/9] object-cover"
            />
          ) : (
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-primary-500 via-primary-600 to-accent-violet flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
              >
                <FileText className="h-12 w-12 text-white" />
              </motion.div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-tg-bg via-transparent to-transparent" />
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-6 -mt-12 relative">
          {/* Type badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Badge variant="gradient">
              {test.type === 'quiz' && '📊 Викторина'}
              {test.type === 'personality' && '🧠 Тест личности'}
              {test.type === 'branching' && '🌳 Интерактив'}
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-tg-text mb-3"
          >
            {test.welcomeScreen?.title}
          </motion.h1>

          {/* Description */}
          {test.welcomeScreen?.description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-tg-hint mb-6"
            >
              {test.welcomeScreen.description}
            </motion.p>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 text-sm text-tg-hint"
          >
            <span className="flex items-center gap-1.5">
              📝 {test.questionsCount} {pluralize(test.questionsCount, ['вопрос', 'вопроса', 'вопросов'])}
            </span>
          </motion.div>

          {/* Previous result indicator */}
          {hasCompletedSession && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-emerald/20 flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-tg-text">Вы уже прошли этот тест</p>
                  <p className="text-sm text-tg-hint">
                    {canRetake
                      ? 'Вы можете пройти его снова'
                      : 'Посмотрите ваш результат'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 pt-4 space-y-3 safe-area-bottom"
        >
          {hasCompletedSession && !canRetake ? (
            <Button
              variant="gradient"
              size="lg"
              fullWidth
              onClick={handleViewResult}
            >
              Посмотреть результат
            </Button>
          ) : (
            <>
              <Button
                variant="gradient"
                size="lg"
                fullWidth
                onClick={handleStart}
                loading={startTestMutation.isPending}
              >
                <Play className="h-5 w-5" />
                {test.welcomeScreen?.buttonText || 'Начать'}
              </Button>

              {hasCompletedSession && canRetake && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleViewResult}
                >
                  <RotateCcw className="h-4 w-4" />
                  Посмотреть прошлый результат
                </Button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
