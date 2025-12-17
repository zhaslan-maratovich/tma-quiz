/**
 * EditTestPage View - презентационный компонент
 */

import { AnimatePresence } from 'framer-motion';
import { Plus, Image as ImageIcon, Eye, Rocket, AlertCircle } from 'lucide-react';
import { PageContainer, Header } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuestionCard } from '@/components/features/question';
import { haptic } from '@/lib/telegram';
import type { EditTestPageViewProps } from './EditTestPage.types';

/**
 * Заголовок секции
 */
function SectionHeader({ title, badge }: { title: string; badge?: string }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-tg-text">{title}</h2>
            {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
    );
}

export function EditTestPageView({
    test,
    isLoading,
    error,
    title,
    description,
    buttonText,
    editingQuestionId,
    isSaving,
    hasChanges,
    isPublishing,
    onTitleChange,
    onDescriptionChange,
    onButtonTextChange,
    onAddQuestion,
    onUpdateQuestion,
    onDeleteQuestion,
    onToggleQuestion,
    onAddAnswer,
    onUpdateAnswer,
    onToggleCorrect,
    onDeleteAnswer,
    onPublish,
    onPreview,
    onGoHome,
}: EditTestPageViewProps) {
    // Состояние загрузки
    if (isLoading) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </PageContainer>
        );
    }

    // Состояние ошибки
    if (error || !test) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-tg-destructive mx-auto mb-4" />
                    <h2 className="text-lg font-semibold mb-2">Тест не найден</h2>
                    <Button onClick={onGoHome}>На главную</Button>
                </div>
            </PageContainer>
        );
    }

    const isPublished = test.status === 'published';
    const questions = test.questions || [];

    return (
        <PageContainer
            header={
                <Header
                    title="Редактор"
                    subtitle={isSaving ? 'Сохранение...' : hasChanges ? 'Изменения' : 'Сохранено'}
                    showBack
                    rightAction={
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={onPreview}>
                                <Eye className="h-5 w-5" />
                            </Button>
                            {!isPublished && (
                                <Button variant="gradient" size="sm" onClick={onPublish}>
                                    <Rocket className="h-4 w-4" />
                                    Публикация
                                </Button>
                            )}
                        </div>
                    }
                />
            }
            footer={
                !isPublished && (
                    <div className="p-4 bg-tg-bg/80 backdrop-blur-xl border-t border-tg-separator">
                        <Button
                            variant="gradient"
                            fullWidth
                            onClick={onPublish}
                            loading={isPublishing}
                        >
                            <Rocket className="h-5 w-5" />
                            Опубликовать тест
                        </Button>
                    </div>
                )
            }
        >
            <div className="space-y-6 pb-24">
                {/* Welcome Screen Section */}
                <section>
                    <SectionHeader title="Приветствие" />
                    <Card>
                        <div className="space-y-4">
                            {/* Cover image placeholder */}
                            <button
                                className="w-full aspect-video rounded-xl bg-tg-secondary-bg flex flex-col items-center justify-center gap-2 text-tg-hint hover:bg-tg-secondary-bg/80 transition-colors"
                                onClick={() => haptic.impact('light')}
                            >
                                <ImageIcon className="h-8 w-8" />
                                <span className="text-sm">Добавить обложку</span>
                            </button>

                            <div>
                                <label className="text-sm font-medium text-tg-text mb-2 block">
                                    Название теста *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => onTitleChange(e.target.value)}
                                    placeholder="Введите название"
                                    disabled={isPublished}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-tg-text mb-2 block">
                                    Описание
                                </label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => onDescriptionChange(e.target.value)}
                                    placeholder="Опишите ваш тест"
                                    rows={3}
                                    disabled={isPublished}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-tg-text mb-2 block">
                                    Текст кнопки
                                </label>
                                <Input
                                    value={buttonText}
                                    onChange={(e) => onButtonTextChange(e.target.value)}
                                    placeholder="Начать"
                                    disabled={isPublished}
                                />
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Questions Section */}
                <section>
                    <SectionHeader title="Вопросы" badge={`${questions.length}`} />

                    <div className="space-y-3">
                        <AnimatePresence>
                            {questions.map((question, index) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    testType={test.type}
                                    isExpanded={editingQuestionId === question.id}
                                    onToggle={() => onToggleQuestion(question.id)}
                                    onUpdateQuestion={onUpdateQuestion}
                                    onDelete={() => onDeleteQuestion(question.id)}
                                    onAddAnswer={() => onAddAnswer(question.id)}
                                    onUpdateAnswer={onUpdateAnswer}
                                    onToggleCorrect={onToggleCorrect}
                                    onDeleteAnswer={onDeleteAnswer}
                                    disabled={isPublished}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {!isPublished && (
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={onAddQuestion}
                            className="mt-4"
                        >
                            <Plus className="h-5 w-5" />
                            Добавить вопрос
                        </Button>
                    )}
                </section>

                {/* Results Section - for personality tests */}
                {test.type === 'personality' && (
                    <section>
                        <SectionHeader title="Результаты" badge={`${test.results?.length || 0}`} />
                        <Card>
                            <p className="text-sm text-tg-hint">
                                Результаты для теста-типологии (в разработке)
                            </p>
                        </Card>
                    </section>
                )}
            </div>
        </PageContainer>
    );
}
