import { create } from 'zustand';

interface OnboardingState {
  name: string;
  setName: (name: string) => void;
  goodDayFeeling: string[];
  setGoodDayFeeling: (feeling: string[]) => void;
  answers: Record<string, any>;
  setAnswer: (key: string, value: any) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  name: '',
  setName: (name) => set({ name }),
  goodDayFeeling: [],
  setGoodDayFeeling: (goodDayFeeling) => set({ goodDayFeeling }),
  answers: {},
  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),
}));
