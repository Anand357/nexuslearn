import { create } from 'zustand'

export const useQuizStore = create((set, get) => ({
  activeSession: null,
  currentQuestion: null,
  currentIndex: 0,
  score: 0,
  answers: [],
  isGenerating: false,

  startSession: (concepts) => set({ activeSession: concepts, currentIndex: 0, score: 0, answers: [], currentQuestion: null }),
  setQuestion: (q) => set({ currentQuestion: q }),
  setGenerating: (v) => set({ isGenerating: v }),
  answerQuestion: (correct) => set(s => ({
    score: correct ? s.score + 1 : s.score,
    answers: [...s.answers, correct],
    currentIndex: s.currentIndex + 1,
  })),
  endSession: () => set({ activeSession: null, currentQuestion: null, currentIndex: 0, score: 0, answers: [] }),
}))
