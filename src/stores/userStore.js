import { create } from 'zustand'

export const useUserStore = create((set) => ({
  user: { name: 'Anand Raj', email: 'anand@nexuslearn.app', plan: 'free', streakDays: 7, xp: 1240 },
  apiKeys: { gemini: '', groq: '' },
  setApiKeys: (keys) => set(s => ({ apiKeys: { ...s.apiKeys, ...keys } })),
  addXP: (amount) => set(s => ({ user: { ...s.user, xp: s.user.xp + amount } })),
}))
