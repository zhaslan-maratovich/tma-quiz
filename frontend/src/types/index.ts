/**
 * Типы для Telegram Mini App Quiz
 */

// ==================== Типы тестов ====================

export type TestType = 'branching' | 'quiz' | 'personality';
export type TestStatus = 'draft' | 'published';

// ==================== API Response ====================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

// ==================== User ====================

export interface User {
    id: string;
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
}

// ==================== Test ====================

export interface WelcomeScreen {
    id: string;
    testId: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    buttonText: string;
}

export interface Answer {
    id: string;
    questionId: string;
    order: number;
    text: string;
    imageUrl: string | null;
    isCorrect: boolean;
    nextQuestionId: string | null;
    resultId: string | null;
    resultPoints?: AnswerResultPoint[];
}

export interface AnswerResultPoint {
    id: string;
    answerId: string;
    resultId: string;
    points: number;
}

export interface Question {
    id: string;
    testId: string;
    order: number;
    text: string;
    imageUrl: string | null;
    answers: Answer[];
}

export interface TestResult {
    id: string;
    testId: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
}

export interface Test {
    id: string;
    ownerId: string;
    type: TestType;
    status: TestStatus;
    slug: string | null;
    allowRetake: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    welcomeScreen: WelcomeScreen | null;
    questions: Question[];
    results: TestResult[];
    _count?: {
        sessions: number;
    };
}

// ==================== Play (Прохождение) ====================

export interface PlayTest {
    id: string;
    type: TestType;
    slug: string;
    allowRetake: boolean;
    welcomeScreen: WelcomeScreen | null;
    questions: PlayQuestion[];
    questionsCount: number;
}

export interface PlayQuestion {
    id: string;
    order: number;
    text: string;
    imageUrl: string | null;
    answers: PlayAnswer[];
}

export interface PlayAnswer {
    id: string;
    order: number;
    text: string;
    imageUrl: string | null;
}

export interface UserSession {
    id: string;
    userId: string;
    testId: string;
    resultId: string | null;
    score: number | null;
    maxScore: number | null;
    startedAt: string;
    completedAt: string | null;
    result?: TestResult | null;
    answers?: UserAnswerRecord[];
}

export interface UserAnswerRecord {
    questionId: string;
    answerId: string;
    question?: Question;
    answer?: Answer;
}

// ==================== Analytics ====================

export interface TestAnalytics {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    questionStats: QuestionStat[];
    resultStats: ResultStat[];
}

export interface QuestionStat {
    questionId: string;
    questionText: string;
    totalAnswers: number;
    answerDistribution: AnswerDistribution[];
}

export interface AnswerDistribution {
    answerId: string;
    answerText: string;
    count: number;
    percentage: number;
    isCorrect: boolean;
}

export interface ResultStat {
    resultId: string;
    resultTitle: string;
    count: number;
    percentage: number;
}

// ==================== Create/Update DTOs ====================

export interface CreateTestInput {
    type: TestType;
    allowRetake?: boolean;
    welcomeScreen: {
        title: string;
        description?: string;
        imageUrl?: string;
        buttonText?: string;
    };
}

export interface UpdateTestInput {
    allowRetake?: boolean;
    welcomeScreen?: {
        title?: string;
        description?: string | null;
        imageUrl?: string | null;
        buttonText?: string;
    };
}

export interface CreateQuestionInput {
    text: string;
    imageUrl?: string;
}

export interface UpdateQuestionInput {
    text?: string;
    imageUrl?: string | null;
}

export interface CreateAnswerInput {
    text: string;
    imageUrl?: string;
    isCorrect?: boolean;
    nextQuestionId?: string;
    resultId?: string;
    resultPoints?: { resultId: string; points: number }[];
}

export interface UpdateAnswerInput {
    text?: string;
    imageUrl?: string | null;
    isCorrect?: boolean;
    nextQuestionId?: string | null;
    resultId?: string | null;
    resultPoints?: { resultId: string; points: number }[];
}

export interface CreateResultInput {
    title: string;
    description?: string;
    imageUrl?: string;
}

export interface UpdateResultInput {
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
}

export interface SubmitAnswersInput {
    answers: { questionId: string; answerId: string }[];
}
