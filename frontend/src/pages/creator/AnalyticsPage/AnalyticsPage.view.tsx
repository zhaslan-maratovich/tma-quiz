/**
 * AnalyticsPage View - презентационный компонент
 */

import { motion } from 'framer-motion';
import { Users, CheckCircle, Share2, TrendingUp, BarChart3 } from 'lucide-react';
import { PageContainer, Header } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/features/analytics';
import { pluralize } from '@/lib/utils';
import type { AnalyticsPageViewProps } from './AnalyticsPage.types';

export function AnalyticsPageView({ test, analytics, isLoading, onShare }: AnalyticsPageViewProps) {
    if (isLoading) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                    </div>
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
            </PageContainer>
        );
    }

    if (!test || !analytics) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <p className="text-tg-hint">Данные не найдены</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            header={
                <Header
                    title="Аналитика"
                    subtitle={test.welcomeScreen?.title}
                    showBack
                    rightAction={
                        <Button variant="ghost" size="icon-sm" onClick={onShare}>
                            <Share2 className="h-5 w-5" />
                        </Button>
                    }
                />
            }
        >
            <div className="space-y-6">
                {/* Stats cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <StatCard
                        icon={<Users className="h-5 w-5 text-primary-500" />}
                        value={analytics.totalSessions}
                        label={pluralize(analytics.totalSessions, [
                            'прохождение',
                            'прохождения',
                            'прохождений',
                        ])}
                        color="primary"
                    />
                    <StatCard
                        icon={<CheckCircle className="h-5 w-5 text-accent-emerald" />}
                        value={`${Math.round(analytics.completionRate)}%`}
                        label="завершили"
                        color="emerald"
                    />
                </motion.div>

                {/* Question stats */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-5 w-5 text-tg-hint" />
                        <h2 className="text-lg font-semibold text-tg-text">
                            Распределение ответов
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {analytics.questionStats.map((stat, index) => (
                            <Card key={stat.questionId}>
                                <div className="mb-3">
                                    <Badge variant="secondary" size="sm">
                                        Вопрос {index + 1}
                                    </Badge>
                                    <p className="text-sm font-medium text-tg-text mt-2">
                                        {stat.questionText}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    {stat.answerDistribution.map((answer) => (
                                        <div key={answer.answerId} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-tg-text flex items-center gap-2">
                                                    {answer.answerText}
                                                    {answer.isCorrect && (
                                                        <CheckCircle className="h-4 w-4 text-accent-emerald" />
                                                    )}
                                                </span>
                                                <span className="text-tg-hint font-medium">
                                                    {answer.percentage}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={answer.percentage}
                                                variant={answer.isCorrect ? 'success' : 'default'}
                                                size="sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {analytics.questionStats.length === 0 && (
                        <Card>
                            <div className="text-center py-6">
                                <TrendingUp className="h-12 w-12 text-tg-hint mx-auto mb-3" />
                                <p className="text-tg-hint">
                                    Пока нет данных. Поделитесь тестом, чтобы получить статистику.
                                </p>
                                <Button variant="gradient" onClick={onShare} className="mt-4">
                                    <Share2 className="h-4 w-4" />
                                    Поделиться тестом
                                </Button>
                            </div>
                        </Card>
                    )}
                </motion.section>

                {/* Result stats for personality tests */}
                {test.type === 'personality' && analytics.resultStats.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-lg font-semibold text-tg-text mb-3">
                            Распределение результатов
                        </h2>

                        <Card>
                            <div className="space-y-3">
                                {analytics.resultStats.map((result) => (
                                    <div key={result.resultId} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-tg-text font-medium">
                                                {result.resultTitle}
                                            </span>
                                            <span className="text-tg-hint">
                                                {result.count} ({result.percentage}%)
                                            </span>
                                        </div>
                                        <Progress
                                            value={result.percentage}
                                            variant="gradient"
                                            size="sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.section>
                )}
            </div>
        </PageContainer>
    );
}
