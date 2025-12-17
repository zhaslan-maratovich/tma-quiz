/**
 * SharePage View - презентационный компонент
 */

import { motion } from 'framer-motion';
import { Copy, Check, Share2, ExternalLink, PartyPopper, QrCode } from 'lucide-react';
import { PageContainer, Header } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SharePageViewProps } from './SharePage.types';

export function SharePageView({
    test,
    isLoading,
    testLink,
    copied,
    onCopyLink,
    onShareTelegram,
    onOpenTest,
    onShowQR,
    onGoToEdit,
}: SharePageViewProps) {
    if (isLoading) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </div>
            </PageContainer>
        );
    }

    if (!test) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <p className="text-tg-hint">Тест не найден</p>
                </div>
            </PageContainer>
        );
    }

    const isPublished = test.status === 'published';

    return (
        <PageContainer gradient header={<Header title="Поделиться" showBack />}>
            <div className="flex flex-col items-center">
                {/* Success animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-emerald to-primary-500 flex items-center justify-center shadow-xl shadow-accent-emerald/30">
                            <PartyPopper className="h-12 w-12 text-white" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent-emerald to-primary-500 opacity-20 blur-xl"
                        />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl font-bold text-tg-text mb-2">
                        {isPublished ? 'Тест опубликован!' : 'Готов к публикации'}
                    </h1>
                    <p className="text-tg-hint">
                        {isPublished
                            ? 'Поделитесь ссылкой с вашей аудиторией'
                            : 'Опубликуйте тест, чтобы получить ссылку'}
                    </p>
                </motion.div>

                {isPublished && (
                    <>
                        {/* Test info card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full mb-6"
                        >
                            <Card>
                                <div className="text-center">
                                    <h3 className="font-semibold text-tg-text mb-1">
                                        {test.welcomeScreen?.title}
                                    </h3>
                                    {test.welcomeScreen?.description && (
                                        <p className="text-sm text-tg-hint line-clamp-2">
                                            {test.welcomeScreen.description}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Link card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="w-full mb-6"
                        >
                            <Card>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-tg-hint mb-1">Ссылка на тест</p>
                                        <p className="text-sm text-tg-text truncate font-mono">
                                            {testLink}
                                        </p>
                                    </div>
                                    <Button
                                        variant={copied ? 'success' : 'secondary'}
                                        size="icon"
                                        onClick={onCopyLink}
                                    >
                                        {copied ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <Copy className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="w-full space-y-3"
                        >
                            <Button variant="gradient" fullWidth onClick={onShareTelegram}>
                                <Share2 className="h-5 w-5" />
                                Отправить в Telegram
                            </Button>

                            <Button variant="secondary" fullWidth onClick={onOpenTest}>
                                <ExternalLink className="h-5 w-5" />
                                Открыть тест
                            </Button>

                            <Button variant="ghost" fullWidth onClick={onShowQR}>
                                <QrCode className="h-5 w-5" />
                                QR-код
                            </Button>
                        </motion.div>
                    </>
                )}

                {!isPublished && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full"
                    >
                        <Button variant="gradient" fullWidth onClick={onGoToEdit}>
                            Перейти к редактированию
                        </Button>
                    </motion.div>
                )}
            </div>
        </PageContainer>
    );
}
