/**
 * LoadingScreen - экран загрузки приложения
 */

import { motion } from 'framer-motion';

interface LoadingScreenProps {
  /** Текст под логотипом */
  title?: string;
  /** Подзаголовок */
  subtitle?: string;
}

export function LoadingScreen({
  title = 'Quiz Creator',
  subtitle = 'Загрузка...',
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-tg-bg flex items-center justify-center gradient-mesh">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Logo / Loader */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-xl shadow-primary-500/30 mx-auto">
            <span className="text-4xl">🧪</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-violet opacity-20 blur-xl animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-tg-text mb-2">{title}</h1>
        <p className="text-sm text-tg-hint">{subtitle}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
