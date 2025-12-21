import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { enableMocking } from './mocks';

/**
 * Инициализация приложения
 * Сначала запускаем MSW (если включено), затем рендерим React
 */
async function init() {
    // Запускаем MSW для мокирования API (только в dev режиме при VITE_ENABLE_MOCKS=true)
    await enableMocking();

    // Рендерим приложение
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

init();
