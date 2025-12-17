/**
 * App - Главный компонент приложения
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

// Pages
import { HomePage, CreatePage, EditTestPage, SharePage, AnalyticsPage } from '@/pages/creator';
import { WelcomePage, QuestionPage, ResultPage } from '@/pages/player';

// Shared components
import { LoadingScreen, ErrorScreen, PlaceholderPage } from '@/components/shared';

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
                <Route
                    path="/tests/:id/preview"
                    element={<PlaceholderPage title="Предпросмотр" />}
                />
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
