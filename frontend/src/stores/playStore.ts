/**
 * Store для прохождения теста
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayTest, PlayQuestion } from '@/types';

interface PlayProgress {
  slug: string;
  currentQuestionIndex: number;
  answers: { questionId: string; answerId: string }[];
  startedAt: string;
}

interface PlayState {
  // Текущий тест
  test: PlayTest | null;
  currentQuestionIndex: number;
  answers: { questionId: string; answerId: string }[];
  startedAt: string | null;
  isCompleted: boolean;

  // Actions
  setTest: (test: PlayTest) => void;
  startTest: () => void;
  selectAnswer: (questionId: string, answerId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  completeTest: () => void;
  reset: () => void;

  // Helpers
  getCurrentQuestion: () => PlayQuestion | null;
  getSelectedAnswer: (questionId: string) => string | null;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  getProgress: () => number;

  // Persistence
  saveProgress: (slug: string) => void;
  loadProgress: (slug: string) => boolean;
  clearProgress: (slug: string) => void;
}

export const usePlayStore = create<PlayState>()(
  persist(
    (set, get) => ({
      test: null,
      currentQuestionIndex: 0,
      answers: [],
      startedAt: null,
      isCompleted: false,

      setTest: (test) => set({ test }),

      startTest: () => set({
        currentQuestionIndex: 0,
        answers: [],
        startedAt: new Date().toISOString(),
        isCompleted: false,
      }),

      selectAnswer: (questionId, answerId) => {
        const { answers } = get();
        const existing = answers.findIndex(a => a.questionId === questionId);

        if (existing >= 0) {
          const newAnswers = [...answers];
          newAnswers[existing] = { questionId, answerId };
          set({ answers: newAnswers });
        } else {
          set({ answers: [...answers, { questionId, answerId }] });
        }
      },

      nextQuestion: () => {
        const { currentQuestionIndex, test } = get();
        if (test && currentQuestionIndex < test.questions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      goToQuestion: (index) => set({ currentQuestionIndex: index }),

      completeTest: () => set({ isCompleted: true }),

      reset: () => set((state) => ({
        // Не сбрасываем test - он нужен для прохождения
        test: state.test,
        currentQuestionIndex: 0,
        answers: [],
        startedAt: null,
        isCompleted: false,
      })),

      getCurrentQuestion: () => {
        const { test, currentQuestionIndex } = get();
        return test?.questions[currentQuestionIndex] ?? null;
      },

      getSelectedAnswer: (questionId) => {
        const { answers } = get();
        return answers.find(a => a.questionId === questionId)?.answerId ?? null;
      },

      canGoNext: () => {
        const { test, currentQuestionIndex } = get();
        return !!test && currentQuestionIndex < test.questions.length - 1;
      },

      canGoPrevious: () => {
        const { currentQuestionIndex } = get();
        return currentQuestionIndex > 0;
      },

      getProgress: () => {
        const { test, currentQuestionIndex } = get();
        if (!test || test.questions.length === 0) return 0;
        return ((currentQuestionIndex + 1) / test.questions.length) * 100;
      },

      saveProgress: (slug) => {
        const { currentQuestionIndex, answers, startedAt } = get();
        const progress: PlayProgress = {
          slug,
          currentQuestionIndex,
          answers,
          startedAt: startedAt || new Date().toISOString(),
        };
        localStorage.setItem(`quiz_progress_${slug}`, JSON.stringify(progress));
      },

      loadProgress: (slug) => {
        const saved = localStorage.getItem(`quiz_progress_${slug}`);
        if (!saved) return false;

        try {
          const progress: PlayProgress = JSON.parse(saved);
          if (progress.slug === slug) {
            set({
              currentQuestionIndex: progress.currentQuestionIndex,
              answers: progress.answers,
              startedAt: progress.startedAt,
            });
            return true;
          }
        } catch {
          // Invalid data
        }
        return false;
      },

      clearProgress: (slug) => {
        localStorage.removeItem(`quiz_progress_${slug}`);
      },
    }),
    {
      name: 'play-storage',
      partialize: () => ({}), // Не сохраняем автоматически
    }
  )
);
