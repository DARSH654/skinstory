import { create } from 'zustand';

export interface QuestionDef {
  key: string;
  prefix: string;
  highlight: string;
  subtitle: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  createdAt?: number;
}

export const INITIAL_QUESTIONS: QuestionDef[] = [
  {
    key: 'q_routine',
    prefix: 'Routine ',
    highlight: 'Compliance',
    subtitle: 'Are you following your skincare routine today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    options: [
      { label: 'Morning & evening routine', value: 'Morning & Evening' },
      { label: 'Morning routine only', value: 'Morning' },
      { label: 'Evening routine only', value: 'Evening' },
      { label: 'Morning, evening & night routine', value: 'Morning, Evening & Night' },
      { label: 'No - Skipped routine today', value: 'No' },
    ],
  },
  {
    key: 'q_water',
    prefix: 'Water ',
    highlight: 'Intake',
    subtitle: 'How much water have you had today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    options: [
      { label: 'Less than 500ml', value: 'Less than 500ml' },
      { label: 'Around 1L', value: 'Around 1L' },
      { label: 'Around 1.5L', value: 'Around 1.5L' },
      { label: 'Around 2L', value: 'Around 2L' },
      { label: 'More than 2L', value: 'More than 2L' },
    ],
  },
  {
    key: 'q_sleep',
    prefix: 'Sleep ',
    highlight: 'Quality',
    subtitle: 'How was your sleep last night?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    options: [
      { label: 'Less than 5 hours', value: 'Less than 5 hours' },
      { label: '5–6 hours, restless', value: '5–6 hours, restless' },
      { label: '6–7 hours, okay', value: '6–7 hours, okay' },
      { label: '7–8 hours, good', value: '7–8 hours, good' },
      { label: '8+ hours, excellent', value: '8+ hours, excellent' },
    ],
  },
  {
    key: 'q_stress',
    prefix: 'Stress ',
    highlight: 'Check',
    subtitle: 'How stressed have you been today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    options: [
      { label: 'Completely calm & relaxed', value: 'Completely calm & relaxed' },
      { label: 'Mild stress, manageable', value: 'Mild stress, manageable' },
      { label: 'Moderately stressed', value: 'Moderately stressed' },
      { label: 'Quite stressed today', value: 'Quite stressed today' },
      { label: 'Extremely overwhelmed', value: 'Extremely overwhelmed' },
    ],
  },
  {
    key: 'q_sunscreen',
    prefix: 'Sunscreen ',
    highlight: 'Application',
    subtitle: 'Did you apply and reapply SPF today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    options: [
      { label: 'Applied & reapplied every 2 hrs', value: 'Applied & Reapplied' },
      { label: 'Applied once in morning', value: 'Applied once' },
      { label: 'Stayed indoors all day', value: 'Indoors' },
      { label: 'Forgot sunscreen today', value: 'Forgot' },
    ],
  },
];

export const INITIAL_AVAILABLE_QUESTIONS: QuestionDef[] = [
  {
    key: 'q_junk',
    prefix: "Today's ",
    highlight: 'Diet',
    subtitle: 'How clean was your diet today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
    options: [
      { label: 'Ate a lot of junk food', value: 'Ate a lot of junk food' },
      { label: 'Mostly junk, some healthy', value: 'Mostly junk, some healthy' },
      { label: 'Mix of both', value: 'Mix of both' },
      { label: 'Mostly healthy', value: 'Mostly healthy' },
      { label: 'Very clean diet', value: 'Very clean diet' },
    ],
  },
  {
    key: 'q_breakouts',
    prefix: 'Breakouts & ',
    highlight: 'Acne',
    subtitle: 'Did you notice any new breakouts or pimples?',
    createdAt: Date.now() - 1000 * 60 * 60 * 15,
    options: [
      { label: 'Completely clear skin', value: 'Clear' },
      { label: 'Minor tiny whiteheads', value: 'Minor whiteheads' },
      { label: 'Red inflamed pimples', value: 'Inflamed acne' },
      { label: 'Deep painful cysts', value: 'Cystic acne' },
      { label: 'Healing past blemishes', value: 'Healing' },
    ],
  },
  {
    key: 'q_irritation',
    prefix: 'Skin ',
    highlight: 'Sensitivity',
    subtitle: 'Did your skin experience burning, redness, or peeling?',
    createdAt: Date.now() - 1000 * 60 * 60 * 10,
    options: [
      { label: 'No irritation at all', value: 'None' },
      { label: 'Mild stinging with actives', value: 'Mild stinging' },
      { label: 'Flaking and dry patches', value: 'Dry & peeling' },
      { label: 'Redness and burning', value: 'Red & burning' },
    ],
  },
  {
    key: 'q_oiliness',
    prefix: 'Skin ',
    highlight: 'Hydration',
    subtitle: 'How did your skin feel midday?',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    options: [
      { label: 'Balanced and comfortable', value: 'Balanced' },
      { label: 'Very dry and tight', value: 'Dry & tight' },
      { label: 'Oily T-zone only', value: 'Combo' },
      { label: 'Greasy across whole face', value: 'Very oily' },
    ],
  },
  {
    key: 'q_activity',
    prefix: 'Physical ',
    highlight: 'Activity',
    subtitle: 'Did you sweat or workout today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    options: [
      { label: 'Intense workout & washed face', value: 'Intense workout' },
      { label: 'Moderate exercise / walk', value: 'Moderate' },
      { label: 'Light daily movement', value: 'Light' },
      { label: 'Rest day / no workout', value: 'Rest day' },
    ],
  },
];

interface JournalState {
  questions: QuestionDef[];
  availableQuestions: QuestionDef[];
  setQuestions: (updater: QuestionDef[] | ((prev: QuestionDef[]) => QuestionDef[])) => void;
  setAvailableQuestions: (updater: QuestionDef[] | ((prev: QuestionDef[]) => QuestionDef[])) => void;
  updateQuestion: (key: string, newTitle: string, newOptions: string[]) => void;
  deleteQuestion: (key: string, from: 'active' | 'available') => void;
  disableOrEnableQuestion: (qTarget: QuestionDef, from: 'active' | 'available') => void;
  moveToAvailable: (q: QuestionDef) => void;
  moveToActive: (q: QuestionDef) => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  questions: INITIAL_QUESTIONS,
  availableQuestions: INITIAL_AVAILABLE_QUESTIONS,

  setQuestions: (updater) =>
    set((state) => ({
      questions: typeof updater === 'function' ? updater(state.questions) : updater,
    })),

  setAvailableQuestions: (updater) =>
    set((state) => ({
      availableQuestions:
        typeof updater === 'function' ? updater(state.availableQuestions) : updater,
    })),

  updateQuestion: (key, newTitle, newOptions) =>
    set((state) => {
      const transformQuestion = (q: QuestionDef) => {
        if (q.key !== key) return q;
        return {
          ...q,
          subtitle: newTitle,
          options: newOptions.map((opt) => ({ label: opt, value: opt })),
        };
      };

      return {
        questions: state.questions.map(transformQuestion),
        availableQuestions: state.availableQuestions.map(transformQuestion),
      };
    }),

  deleteQuestion: (key, from) =>
    set((state) => ({
      questions: from === 'active' ? state.questions.filter((q) => q.key !== key) : state.questions,
      availableQuestions:
        from === 'available'
          ? state.availableQuestions.filter((q) => q.key !== key)
          : state.availableQuestions,
    })),

  disableOrEnableQuestion: (qTarget, from) =>
    set((state) => {
      if (qTarget.disabled) {
        return {
          availableQuestions: state.availableQuestions.map((item) =>
            item.key === qTarget.key ? { ...item, disabled: false } : item
          ),
        };
      } else {
        const disabledItem: QuestionDef = { ...qTarget, disabled: true };
        if (from === 'active') {
          return {
            questions: state.questions.filter((q) => q.key !== qTarget.key),
            availableQuestions: [
              ...state.availableQuestions.filter((q) => q.key !== qTarget.key),
              disabledItem,
            ],
          };
        } else {
          return {
            availableQuestions: [
              ...state.availableQuestions.filter((q) => q.key !== qTarget.key),
              disabledItem,
            ],
          };
        }
      }
    }),

  moveToAvailable: (qToRemove) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.key !== qToRemove.key),
      availableQuestions: [qToRemove, ...state.availableQuestions],
    })),

  moveToActive: (qToAdd) =>
    set((state) => ({
      availableQuestions: state.availableQuestions.filter((q) => q.key !== qToAdd.key),
      questions: [...state.questions, qToAdd],
    })),
}));
