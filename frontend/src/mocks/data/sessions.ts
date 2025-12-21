/**
 * Mock данные для сессий прохождения
 */

import type { UserSession } from '@/types';

// Объявляем глобальный тип для хранения сессий
declare global {
    interface Window {
        __mockSessions?: Map<string, UserSession>;
        __sessionCounter?: number;
    }
}

/**
 * Хранилище сессий (эмуляция БД)
 * Используем window для сохранения между HMR обновлениями
 */
if (!window.__mockSessions) {
    window.__mockSessions = new Map<string, UserSession>();
}
export const mockSessions: Map<string, UserSession> = window.__mockSessions;

/**
 * Генератор ID сессии
 */
if (window.__sessionCounter === undefined) {
    window.__sessionCounter = 1;
}
export const generateSessionId = (): string => `session-${window.__sessionCounter!++}`;

/**
 * Создание новой сессии
 */
export function createSession(userId: string, testId: string): UserSession {
    const session: UserSession = {
        id: generateSessionId(),
        userId,
        testId,
        resultId: null,
        score: null,
        maxScore: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
        result: null,
        answers: [],
    };

    mockSessions.set(session.id, session);
    return session;
}

/**
 * Получение сессии пользователя для теста
 */
export function getSessionByUserAndTest(userId: string, testId: string): UserSession | null {
    console.log('[MSW Sessions] Looking for session:', { userId, testId });
    console.log('[MSW Sessions] Total sessions in map:', mockSessions.size);

    for (const session of mockSessions.values()) {
        console.log('[MSW Sessions] Checking session:', session.id, {
            sessionUserId: session.userId,
            sessionTestId: session.testId,
            completedAt: session.completedAt
        });
        if (session.userId === userId && session.testId === testId) {
            console.log('[MSW Sessions] Found matching session:', session.id);
            return session;
        }
    }
    console.log('[MSW Sessions] No session found');
    return null;
}

/**
 * Завершение сессии
 */
export function completeSession(
    sessionId: string,
    resultId: string | null,
    score: number | null,
    maxScore: number | null,
    answers?: { questionId: string; answerId: string }[]
): UserSession | null {
    const session = mockSessions.get(sessionId);
    if (!session) return null;

    session.resultId = resultId;
    session.score = score;
    session.maxScore = maxScore;
    session.completedAt = new Date().toISOString();
    if (answers) {
        session.answers = answers;
    }

    mockSessions.set(sessionId, session);
    return session;
}
