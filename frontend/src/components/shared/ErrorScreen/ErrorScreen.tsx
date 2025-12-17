/**
 * ErrorScreen - экран ошибки
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface ErrorScreenProps {
  /** Сообщение об ошибке */
  message: string;
  /** Заголовок (опционально) */
  title?: string;
  /** Эмодзи или иконка */
  emoji?: string;
  /** Текст кнопки */
  actionLabel?: string;
  /** Обработчик действия */
  onAction?: () => void;
}

export function ErrorScreen({
  message,
  title = 'Ошибка подключения',
  emoji = '😕',
  actionLabel = 'Попробовать снова',
  onAction = () => window.location.reload(),
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-tg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-xs"
      >
        <div className="w-16 h-16 rounded-2xl bg-tg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">{emoji}</span>
        </div>
        <h2 className="text-lg font-semibold text-tg-text mb-2">
          {title}
        </h2>
        <p className="text-sm text-tg-hint mb-6">{message}</p>
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      </motion.div>
    </div>
  );
}
