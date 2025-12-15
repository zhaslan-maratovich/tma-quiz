/**
 * ResultPage - Страница результата после прохождения теста
 */

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Share2,
  RotateCcw,
  Home,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { playApi } from '@/api';
import { usePlayStore } from '@/stores/playStore';
import { useHaptic } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { openTelegramLink, showAlert } from '@/lib/telegram';

export function ResultPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();

  const { reset, clearProgress } = usePlayStore();

  // Fetch session with result
  const { data: session, isLoading } = useQuery({
    queryKey: ['play', slug, 'session'],
    queryFn: () => playApi.getExistingSession(slug!),
    enabled: !!slug,
  });

  // Fetch test for retake check
  const { data: test } = useQuery({
    queryKey: ['play', slug],
    queryFn: () => playApi.getTestBySlug(slug!),
    enabled: !!slug,
  });

  const handleShare = async () => {
    haptic.impact('medium');

    if (!session || !test) return;

    const resultText = session.result?.title || `${session.score}/${session.maxScore}`;
    const shareText = `Я прошёл тест "${test.welcomeScreen?.title}"!\n\nМой результат: ${resultText}\n\nПройди и ты!`;

    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'your_bot';
    const testLink = `https://t.me/${botUsername}/app?startapp=${slug}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(testLink)}&text=${encodeURIComponent(shareText)}`;

    openTelegramLink(shareUrl);
  };

  const handleRetake = async () => {
    if (!test?.allowRetake) {
      await showAlert('Повторное прохождение недоступно');
      return;
    }

    haptic.impact('light');
    reset();
    clearProgress(slug!);
    navigate(`/play/${slug}`);
  };

  const handleHome = () => {
    haptic.impact('light');
    reset();
    clearProgress(slug!);
    navigate('/');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center pt-8">
          <Skeleton className="w-24 h-24 rounded-3xl mb-6" />
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-4 w-64 mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (!session?.completedAt) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-tg-hint mb-4">Результат не найден</p>
          <Button onClick={() => navigate(`/play/${slug}`)}>
            Пройти тест
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isQuiz = test?.type === 'quiz';
  const scorePercent = session.maxScore
    ? Math.round((session.score! / session.maxScore) * 100)
    : 0;
  const isGoodResult = scorePercent >= 70;

  return (
    <PageContainer gradient noPadding>
      <div className="flex flex-col min-h-screen">
        {/* Result header */}
        <div className="pt-8 pb-6 px-6 text-center">
          {/* Result icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="mb-6"
          >
            <div className="relative inline-block">
              <div className={cn(
                'w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl',
                isQuiz
                  ? isGoodResult
                    ? 'bg-gradient-to-br from-accent-emerald to-primary-500 shadow-accent-emerald/30'
                    : 'bg-gradient-to-br from-accent-amber to-accent-coral shadow-accent-amber/30'
                  : 'bg-gradient-to-br from-primary-500 to-accent-violet shadow-primary-500/30'
              )}>
                {isQuiz ? (
                  isGoodResult ? (
                    <Trophy className="h-12 w-12 text-white" />
                  ) : (
                    <Sparkles className="h-12 w-12 text-white" />
                  )
                ) : (
                  <span className="text-4xl">
                    {session.result?.title?.charAt(0) || '🎉'}
                  </span>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-violet opacity-20 blur-xl"
              />
            </div>
          </motion.div>

          {/* Result title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isQuiz ? (
              <>
                <h1 className="text-3xl font-bold text-tg-text mb-2">
                  {session.score} / {session.maxScore}
                </h1>
                <p className="text-lg text-tg-hint">
                  {isGoodResult ? 'Отличный результат!' : 'Неплохо!'}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-tg-text mb-2">
                  {session.result?.title}
                </h1>
                {session.result?.description && (
                  <p className="text-tg-hint">
                    {session.result.description}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Result content */}
        <div className="flex-1 px-6">
          {/* Score progress for quiz */}
          {isQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <Card>
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-tg-text">
                    {scorePercent}%
                  </span>
                  <p className="text-sm text-tg-hint mt-1">правильных ответов</p>
                </div>
                <Progress
                  value={scorePercent}
                  variant={isGoodResult ? 'success' : 'warning'}
                  size="lg"
                />
              </Card>
            </motion.div>
          )}

          {/* Result image for personality */}
          {!isQuiz && session.result?.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <img
                src={session.result.imageUrl}
                alt={session.result.title}
                className="w-full rounded-2xl shadow-lg"
              />
            </motion.div>
          )}

          {/* Answer breakdown for quiz */}
          {isQuiz && session.answers && session.answers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-tg-text mb-3">
                Разбор ответов
              </h3>
              <div className="space-y-2">
                {session.answers.map((ans, index) => {
                  const isCorrect = ans.answer?.isCorrect;
                  return (
                    <Card key={ans.questionId} padding="sm">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                          isCorrect ? 'bg-accent-emerald/10' : 'bg-tg-destructive/10'
                        )}>
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-accent-emerald" />
                          ) : (
                            <XCircle className="h-4 w-4 text-tg-destructive" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" size="sm">
                              {index + 1}
                            </Badge>
                          </div>
                          <p className="text-sm text-tg-text">
                            {ans.question?.text}
                          </p>
                          <p className={cn(
                            'text-sm mt-1',
                            isCorrect ? 'text-accent-emerald' : 'text-tg-destructive'
                          )}>
                            {ans.answer?.text}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 space-y-3 safe-area-bottom"
        >
          <Button
            variant="gradient"
            size="lg"
            fullWidth
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
            Поделиться результатом
          </Button>

          <div className="flex gap-3">
            {test?.allowRetake && (
              <Button
                variant="secondary"
                fullWidth
                onClick={handleRetake}
              >
                <RotateCcw className="h-4 w-4" />
                Пройти снова
              </Button>
            )}
            <Button
              variant="ghost"
              fullWidth
              onClick={handleHome}
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
