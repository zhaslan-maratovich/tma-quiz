/**
 * QuestionPage View - презентационный компонент
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { QuestionPageViewProps } from './QuestionPage.types';

export function QuestionPageView({
    test,
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    selectedAnswerId,
    canGoBack,
    isLastQuestion,
    isSubmitting,
    onSelectAnswer,
    onNext,
    onPrevious,
}: QuestionPageViewProps) {
    if (!test || !currentQuestion) {
        return null;
    }

    const hasAnswer = !!selectedAnswerId;

    return (
        <PageContainer noPadding>
            <div className="flex flex-col min-h-screen">
                {/* Header with progress */}
                <div className="sticky top-0 z-10 bg-tg-bg/80 backdrop-blur-xl border-b border-tg-separator safe-area-top">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-tg-text">
                                Вопрос {currentIndex + 1} из {totalQuestions}
                            </span>
                            <span className="text-sm text-tg-hint">{Math.round(progress)}%</span>
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
                                        onClick={() => onSelectAnswer(answer)}
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
                            onClick={onPrevious}
                            disabled={!canGoBack}
                            className="w-14"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        {/* Next/Submit button */}
                        <Button
                            variant="gradient"
                            size="lg"
                            fullWidth
                            onClick={onNext}
                            disabled={!hasAnswer}
                            loading={isSubmitting}
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

QuestionPageView.Skeleton = function QuestionPageSkeleton() {
    return (
        <PageContainer noPadding>
            <div className="flex flex-col min-h-screen">
                {/* Header skeleton */}
                <div className="sticky top-0 z-10 bg-tg-bg/80 backdrop-blur-xl border-b border-tg-separator safe-area-top">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                </div>

                {/* Question skeleton */}
                <div className="flex-1 px-4 py-6">
                    <Skeleton className="h-8 w-3/4 mb-6" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>

                {/* Bottom skeleton */}
                <div className="sticky bottom-0 bg-tg-bg/80 backdrop-blur-xl border-t border-tg-separator safe-area-bottom">
                    <div className="px-4 py-4 flex gap-3">
                        <Skeleton className="h-12 w-14 rounded-xl" />
                        <Skeleton className="h-12 flex-1 rounded-xl" />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};
