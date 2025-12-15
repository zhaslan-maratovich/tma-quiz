import { useState, useEffect } from 'react';
import {
  checkHealth,
  authenticate,
  getTests,
  createSampleTest,
  deleteTest,
  getTelegramInfo
} from './api';
import './App.css';

interface Test {
  id: string;
  type: string;
  status: string;
  welcomeScreen?: {
    title: string;
    description?: string;
  };
  createdAt: string;
}

function App() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>('checking...');
  const [authStatus, setAuthStatus] = useState<string>('not authenticated');
  const [telegramInfo, setTelegramInfo] = useState<any>(null);

  // При загрузке проверяем API и авторизуемся
  useEffect(() => {
    init();
  }, []);

  async function init() {
    // Получаем информацию о Telegram
    const tgInfo = getTelegramInfo();
    setTelegramInfo(tgInfo);

    // Проверяем здоровье API
    try {
      const health = await checkHealth();
      setHealthStatus(`✅ ${health.status} | DB: ${health.database} | Redis: ${health.redis}`);
    } catch (e) {
      setHealthStatus(`❌ API недоступен`);
      setError('Не удалось подключиться к API. Убедитесь, что backend запущен.');
      return;
    }

    // Авторизуемся
    try {
      const auth = await authenticate();
      if (auth.success) {
        setAuthStatus(`✅ Авторизован (ID: ${auth.data.user.telegramId})`);
      }
    } catch (e: any) {
      setAuthStatus(`❌ Ошибка: ${e.message}`);
    }
  }

  // Загрузить список тестов
  async function handleLoadTests() {
    setLoading(true);
    setError(null);
    try {
      const response = await getTests();
      setTests(response.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Создать тест
  async function handleCreateTest() {
    setLoading(true);
    setError(null);
    try {
      const response = await createSampleTest();
      alert(`✅ Тест создан!\n\nID: ${response.data.id}\nTitle: ${response.data.welcomeScreen?.title}`);
      // Перезагружаем список
      handleLoadTests();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Удалить тест
  async function handleDeleteTest(testId: string) {
    if (!confirm('Удалить этот тест?')) return;

    setLoading(true);
    setError(null);
    try {
      await deleteTest(testId);
      // Перезагружаем список
      handleLoadTests();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>🧪 TMA Test Client</h1>

      {/* Статус */}
      <section className="status-section">
        <h2>📊 Статус</h2>
        <div className="status-item">
          <strong>API:</strong> {healthStatus}
        </div>
        <div className="status-item">
          <strong>Auth:</strong> {authStatus}
        </div>
        <div className="status-item">
          <strong>Mode:</strong> {telegramInfo?.available ? '📱 Telegram' : '🌐 Browser (dev)'}
        </div>
        {telegramInfo?.user && (
          <div className="status-item">
            <strong>User:</strong> {telegramInfo.user.first_name} (@{telegramInfo.user.username})
          </div>
        )}
      </section>

      {/* Ошибка */}
      {error && (
        <div className="error-box">
          ❌ {error}
        </div>
      )}

      {/* Кнопки */}
      <section className="actions-section">
        <h2>🎮 Действия</h2>
        <div className="buttons">
          <button
            onClick={handleCreateTest}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳...' : '➕ Создать тест'}
          </button>

          <button
            onClick={handleLoadTests}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? '⏳...' : '📋 Загрузить тесты'}
          </button>
        </div>
      </section>

      {/* Список тестов */}
      <section className="tests-section">
        <h2>📝 Мои тесты ({tests.length})</h2>

        {tests.length === 0 ? (
          <div className="empty-state">
            Нет тестов. Нажмите "Загрузить тесты" или "Создать тест".
          </div>
        ) : (
          <div className="tests-list">
            {tests.map((test) => (
              <div key={test.id} className="test-card">
                <div className="test-header">
                  <span className="test-type">{test.type}</span>
                  <span className={`test-status ${test.status}`}>{test.status}</span>
                </div>
                <div className="test-title">
                  {test.welcomeScreen?.title || 'Без названия'}
                </div>
                <div className="test-description">
                  {test.welcomeScreen?.description || '—'}
                </div>
                <div className="test-footer">
                  <span className="test-id">ID: {test.id.slice(0, 8)}...</span>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="btn btn-danger btn-small"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Debug info */}
      <details className="debug-section">
        <summary>🔧 Debug Info</summary>
        <pre>{JSON.stringify(telegramInfo, null, 2)}</pre>
      </details>
    </div>
  );
}

export default App;
