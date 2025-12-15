/**
 * App - Главный компонент приложения
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import {
  HomePage,
  CreatePage,
  EditTestPage,
  SharePage,
  AnalyticsPage
} from '@/pages/creator';
import {
  WelcomePage,
  QuestionPage,
  ResultPage
} from '@/pages/player';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Lib
import { initTelegramApp, getStartParam } from '@/lib/telegram';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30, // 30 секунд
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Loading Screen
 */
function LoadingScreen() {
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
        <h1 className="text-xl font-bold text-tg-text mb-2">Quiz Creator</h1>
        <p className="text-sm text-tg-hint">Загрузка...</p>

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

/**
 * Error Screen
 */
function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-tg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-xs"
      >
        <div className="w-16 h-16 rounded-2xl bg-tg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">😕</span>
        </div>
        <h2 className="text-lg font-semibold text-tg-text mb-2">
          Ошибка подключения
        </h2>
        <p className="text-sm text-tg-hint mb-6">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-tg-button text-tg-button-text rounded-xl font-medium"
        >
          Попробовать снова
        </button>
      </motion.div>
    </div>
  );
}

/**
 * StartParamRedirect - Обрабатывает startapp параметр из Telegram
 */
function StartParamRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const startParam = getStartParam();
    if (startParam) {
      // Если есть start_param, это slug теста - редиректим на страницу прохождения
      navigate(`/play/${startParam}`, { replace: true });
    }
  }, [navigate]);

  return null;
}

/**
 * Authenticated Routes
 */
function AuthenticatedApp() {
  const { isLoading, isAuthenticated, error } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !isAuthenticated) {
    return <ErrorScreen message={error || 'Не удалось авторизоваться'} />;
  }

  return (
    <AnimatePresence mode="wait">
      {/* Обрабатываем startapp параметр */}
      <StartParamRedirect />
      <Routes>
        {/* Creator routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/tests/:id/edit" element={<EditTestPage />} />
        <Route path="/tests/:id/preview" element={<PlaceholderPage title="Предпросмотр" />} />
        <Route path="/tests/:id/analytics" element={<AnalyticsPage />} />
        <Route path="/tests/:id/share" element={<SharePage />} />

        {/* Player routes */}
        <Route path="/play/:slug" element={<WelcomePage />} />
        <Route path="/play/:slug/question" element={<QuestionPage />} />
        <Route path="/play/:slug/result" element={<ResultPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Placeholder page for unimplemented routes
 */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-tg-bg flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-tg-secondary-bg flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚧</span>
        </div>
        <h2 className="text-lg font-semibold text-tg-text mb-2">{title}</h2>
        <p className="text-sm text-tg-hint">Страница в разработке</p>
          </div>
    </div>
  );
}

/**
 * App Root
 */
function App() {
  // Initialize Telegram Mini App
  useEffect(() => {
    initTelegramApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
