/**
 * Mock данные для сессий прохождения
 */

import type { UserSession } from '@/types';

/**
 * Хранилище сессий (эмуляция БД)
 */
export const mockSessions: Map<string, UserSession> = new Map();

/**
 * Генератор ID сессии
 */
let sessionCounter = 1;
export const generateSessionId = (): string => `session-${sessionCounter++}`;

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
    for (const session of mockSessions.values()) {
        if (session.userId === userId && session.testId === testId) {
            return session;
        }
    }
    return null;
}

/**
 * Завершение сессии
 */
export function completeSession(
    sessionId: string,
    resultId: string | null,
    score: number | null,
    maxScore: number | null
): UserSession | null {
    const session = mockSessions.get(sessionId);
    if (!session) return null;

    session.resultId = resultId;
    session.score = score;
    session.maxScore = maxScore;
    session.completedAt = new Date().toISOString();

    mockSessions.set(sessionId, session);
    return session;
}
