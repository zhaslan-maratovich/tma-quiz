/**
 * QuestionPage - Страница вопроса при прохождении теста
 */

import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { playApi } from '@/api';
import { usePlayStore } from '@/stores/playStore';
import { useBackButton, useHaptic } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import type { PlayAnswer } from '@/types';

export function QuestionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const haptic = useHaptic();

  const {
    test,
    currentQuestionIndex,
    answers,
    getCurrentQuestion,
    getSelectedAnswer,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    canGoPrevious,
    getProgress,
    saveProgress,
    completeTest,
  } = usePlayStore();

  const currentQuestion = getCurrentQuestion();
  const selectedAnswerId = currentQuestion ? getSelectedAnswer(currentQuestion.id) : null;
  const progress = getProgress();
  const isLastQuestion = test ? currentQuestionIndex === test.questions.length - 1 : false;
  const hasAnswer = !!selectedAnswerId;

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () => playApi.submitAnswers(slug!, { answers }),
    onSuccess: () => {
      completeTest();
      haptic.notification('success');
      navigate(`/play/${slug}/result`);
    },
    onError: () => {
      haptic.notification('error');
    },
  });

  // Save progress periodically
  useEffect(() => {
    if (slug) {
      saveProgress(slug);
    }
  }, [currentQuestionIndex, answers, slug, saveProgress]);

  // Back button handler
  useBackButton(
    useCallback(() => {
      if (canGoPrevious()) {
        previousQuestion();
        haptic.impact('light');
      } else {
        navigate(`/play/${slug}`);
      }
    }, [canGoPrevious, previousQuestion, navigate, slug, haptic]),
    true
  );

  // Redirect if no test
  useEffect(() => {
    if (!test) {
      navigate(`/play/${slug}`);
    }
  }, [test, navigate, slug]);

  const handleSelectAnswer = (answer: PlayAnswer) => {
    if (!currentQuestion) return;

    haptic.selection();
    selectAnswer(currentQuestion.id, answer.id);
  };

  const handleNext = () => {
    if (!hasAnswer) return;

    haptic.impact('light');

    if (isLastQuestion) {
      // Submit answers
      submitMutation.mutate();
    } else {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      haptic.impact('light');
      previousQuestion();
    }
  };

  if (!test || !currentQuestion) {
    return null;
  }

  return (
    <PageContainer noPadding>
      <div className="flex flex-col min-h-screen">
        {/* Header with progress */}
        <div className="sticky top-0 z-10 bg-tg-bg/80 backdrop-blur-xl border-b border-tg-separator safe-area-top">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tg-text">
                Вопрос {currentQuestionIndex + 1} из {test.questions.length}
              </span>
              <span className="text-sm text-tg-hint">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} variant="gradient" size="sm" />
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              {/* Question image */}
              {currentQuestion.imageUrl && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={currentQuestion.imageUrl}
                  alt=""
                  className="w-full aspect-video object-cover rounded-2xl mb-6"
                />
              )}

              {/* Question text */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-tg-text mb-6"
              >
                {currentQuestion.text}
              </motion.h2>

              {/* Answers */}
              <div className="space-y-3">
                {currentQuestion.answers.map((answer, index) => (
                  <motion.button
                    key={answer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    onClick={() => handleSelectAnswer(answer)}
                    className={cn(
                      'w-full p-4 rounded-2xl text-left transition-all duration-200',
                      'border-2',
                      selectedAnswerId === answer.id
                        ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/10'
                        : 'bg-tg-section border-transparent hover:bg-tg-secondary-bg active:scale-[0.98]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Answer indicator */}
                      <div
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                          selectedAnswerId === answer.id
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-tg-hint'
                        )}
                      >
                        {selectedAnswerId === answer.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2.5 h-2.5 rounded-full bg-white"
                          />
                        )}
                      </div>

                      {/* Answer content */}
                      <div className="flex-1 min-w-0">
                        {answer.imageUrl && (
                          <img
                            src={answer.imageUrl}
                            alt=""
                            className="w-full aspect-video object-cover rounded-xl mb-2"
                          />
                        )}
                        <span
                          className={cn(
                            'text-base',
                            selectedAnswerId === answer.id
                              ? 'font-medium text-tg-text'
                              : 'text-tg-text'
                          )}
                        >
                          {answer.text}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className="sticky bottom-0 bg-tg-bg/80 backdrop-blur-xl border-t border-tg-separator safe-area-bottom">
          <div className="px-4 py-4 flex gap-3">
            {/* Back button */}
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePrevious}
              disabled={!canGoPrevious()}
              className="w-14"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Next/Submit button */}
            <Button
              variant="gradient"
              size="lg"
              fullWidth
              onClick={handleNext}
              disabled={!hasAnswer}
              loading={submitMutation.isPending}
            >
              {isLastQuestion ? (
                'Завершить'
              ) : (
                <>
                  Далее
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
