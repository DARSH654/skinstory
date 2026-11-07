import { create } from 'zustand';
import { MOCK_SCANS } from '@/constants/mockScans';

export interface QuestionDef {
  key: string;
  prefix: string;
  highlight: string;
  subtitle: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  createdAt?: number;
  dataType?: 'multi_select' | 'boolean' | 'single_choice' | 'text' | 'scale' | 'numeric' | 'image';
  placeholderText?: string;
  scaleRange?: '1-3' | '1-5' | '1-10';
  stepLabels?: string[];
  unit?: string;
  stepSize?: number;
  maxValue?: string;
}

export const INITIAL_QUESTIONS: QuestionDef[] = [
  {
    key: 'q_routine',
    prefix: 'Routine ',
    highlight: 'Compliance',
    subtitle: 'Are you following your skincare routine today?',
    dataType: 'single_choice',
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
    dataType: 'numeric',
    unit: 'glasses',
    stepSize: 1,
    maxValue: '20',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    options: [
      { label: '0 glasses', value: '0 glasses' },
      { label: '1 glasses', value: '1 glasses' },
      { label: '2 glasses', value: '2 glasses' },
      { label: '20 glasses+', value: '20 glasses+' },
    ],
  },
  {
    key: 'q_sleep',
    prefix: 'Sleep ',
    highlight: 'Quality',
    subtitle: 'How was your sleep last night?',
    dataType: 'scale',
    scaleRange: '1-5',
    stepLabels: [
      'Less than 5 hrs (very poor)',
      '5–6 hrs, restless',
      '6–7 hrs, fair',
      '7–8 hrs, good',
      '8+ hrs, deep and refreshing',
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    options: [
      { label: '1 - Less than 5 hrs (very poor)', value: '1' },
      { label: '2 - 5–6 hrs, restless', value: '2' },
      { label: '3 - 6–7 hrs, fair', value: '3' },
      { label: '4 - 7–8 hrs, good', value: '4' },
      { label: '5 - 8+ hrs, deep and refreshing', value: '5' },
    ],
  },
  {
    key: 'q_stress',
    prefix: 'Stress ',
    highlight: 'Check',
    subtitle: 'How stressed have you been today?',
    dataType: 'scale',
    scaleRange: '1-5',
    stepLabels: [
      'Completely calm & relaxed',
      'Mild stress, manageable',
      'Moderately stressed',
      'Quite stressed today',
      'Extremely overwhelmed',
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    options: [
      { label: '1 - Completely calm & relaxed', value: '1' },
      { label: '2 - Mild stress, manageable', value: '2' },
      { label: '3 - Moderately stressed', value: '3' },
      { label: '4 - Quite stressed today', value: '4' },
      { label: '5 - Extremely overwhelmed', value: '5' },
    ],
  },
  {
    key: 'q_sunscreen',
    prefix: 'Sunscreen ',
    highlight: 'Application',
    subtitle: 'Did you apply and reapply SPF today?',
    dataType: 'boolean',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
];

export const INITIAL_AVAILABLE_QUESTIONS: QuestionDef[] = [
  {
    key: 'q_junk',
    prefix: "Today's ",
    highlight: 'Diet',
    subtitle: 'How clean was your diet today?',
    dataType: 'scale',
    scaleRange: '1-5',
    stepLabels: [
      'Ate a lot of junk food',
      'Mostly junk, some healthy',
      'Mix of both',
      'Mostly healthy meals',
      'Extremely clean & nutrient-rich',
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
    options: [
      { label: '1 - Ate a lot of junk food', value: '1' },
      { label: '2 - Mostly junk, some healthy', value: '2' },
      { label: '3 - Mix of both', value: '3' },
      { label: '4 - Mostly healthy meals', value: '4' },
      { label: '5 - Extremely clean & nutrient-rich', value: '5' },
    ],
  },
  {
    key: 'q_breakouts',
    prefix: 'Breakouts & ',
    highlight: 'Acne',
    subtitle: 'Did you notice any new breakouts or pimples?',
    dataType: 'multi_select',
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
    dataType: 'multi_select',
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
    dataType: 'single_choice',
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
    dataType: 'boolean',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    options: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  },
];

export interface JournalHistoryRecord {
  id: string;
  dateStr: string;
  dayName: string;
  isoDate: string;
  image?: any;
  answers: Record<string, string>;
}

export const DEMO_HISTORY_RECORDS: JournalHistoryRecord[] = [
  {
    id: 'rec-1',
    dateStr: 'Today',
    dayName: 'Saturday',
    isoDate: '2026-10-18',
    image: MOCK_SCANS[0]?.image,
    answers: {
      q_routine: 'Morning & Evening',
      q_water: 'Around 2L',
    },
  },
  {
    id: 'rec-2',
    dateStr: 'Yesterday',
    dayName: 'Friday',
    isoDate: '2026-10-17',
    image: MOCK_SCANS[1]?.image,
    answers: {
      q_routine: 'Morning',
      q_water: 'Around 1.5L',
      q_sleep: '6–7 hours, okay',
      q_stress: 'Mild stress, manageable',
      q_sunscreen: 'Applied once',
    },
  },
  {
    id: 'rec-3',
    dateStr: 'Oct 15, 2026',
    dayName: 'Wednesday',
    isoDate: '2026-10-15',
    image: MOCK_SCANS[2]?.image,
    answers: {},
  },
  {
    id: 'rec-4',
    dateStr: 'Oct 12, 2026',
    dayName: 'Sunday',
    isoDate: '2026-10-12',
    image: MOCK_SCANS[3]?.image,
    answers: {
      q_routine: 'Morning & Evening',
      q_water: 'More than 2L',
    },
  },
  {
    id: 'rec-5',
    dateStr: 'Oct 09, 2026',
    dayName: 'Thursday',
    isoDate: '2026-10-09',
    image: MOCK_SCANS[4]?.image,
    answers: {
      q_routine: 'Evening',
      q_water: 'Around 1L',
      q_sleep: 'Less than 5 hours',
      q_stress: 'Quite stressed today',
      q_sunscreen: 'Applied once',
    },
  },
  {
    id: 'rec-6',
    dateStr: 'Oct 04, 2026',
    dayName: 'Saturday',
    isoDate: '2026-10-04',
    image: MOCK_SCANS[0]?.image,
    answers: {
      q_routine: 'Morning & Evening',
      q_water: 'Around 2L',
      q_sleep: '7–8 hours, good',
    },
  },
  {
    id: 'rec-7',
    dateStr: 'Oct 01, 2026',
    dayName: 'Wednesday',
    isoDate: '2026-10-01',
    image: MOCK_SCANS[1]?.image,
    answers: {
      q_routine: 'Morning & Evening',
      q_water: 'More than 2L',
      q_sleep: '8+ hours, great',
      q_stress: 'Relaxed, no stress',
      q_sunscreen: 'Applied twice',
    },
  },
  {
    id: 'rec-8',
    dateStr: 'Sep 27, 2026',
    dayName: 'Saturday',
    isoDate: '2026-09-27',
    image: MOCK_SCANS[2]?.image,
    answers: {},
  },
  {
    id: 'rec-9',
    dateStr: 'Sep 23, 2026',
    dayName: 'Tuesday',
    isoDate: '2026-09-23',
    image: MOCK_SCANS[3]?.image,
    answers: {
      q_routine: 'Evening',
      q_water: 'Less than 1L',
      q_sleep: '5–6 hours, tired',
    },
  },
  {
    id: 'rec-10',
    dateStr: 'Sep 18, 2026',
    dayName: 'Thursday',
    isoDate: '2026-09-18',
    image: MOCK_SCANS[4]?.image,
    answers: {
      q_routine: 'Morning & Evening',
      q_water: 'Around 2L',
      q_sleep: '7–8 hours, good',
      q_stress: 'Mild stress, manageable',
      q_sunscreen: 'Applied once',
    },
  },
  {
    id: 'rec-11',
    dateStr: 'Sep 14, 2026',
    dayName: 'Sunday',
    isoDate: '2026-09-14',
    image: MOCK_SCANS[0]?.image,
    answers: {
      q_routine: 'Morning',
      q_water: 'Around 1.5L',
    },
  },
];

interface JournalState {
  questions: QuestionDef[];
  availableQuestions: QuestionDef[];
  historyRecords: JournalHistoryRecord[];
  pendingReanswerKey: string | null;
  // Hand-off slot: when a photo is captured from the journal "Image" question,
  // the camera page drops the locally-saved uri here so the journal sheet can
  // pick it up on return and advance to the next question.
  pendingImageCapture: { key: string; uri: string } | null;
  setPendingImageCapture: (value: { key: string; uri: string } | null) => void;
  setQuestions: (updater: QuestionDef[] | ((prev: QuestionDef[]) => QuestionDef[])) => void;
  setAvailableQuestions: (updater: QuestionDef[] | ((prev: QuestionDef[]) => QuestionDef[])) => void;
  setHistoryRecords: (updater: JournalHistoryRecord[] | ((prev: JournalHistoryRecord[]) => JournalHistoryRecord[])) => void;
  clearTodayAnswerForQuestion: (key: string) => void;
  hasTodayAnswerForQuestion: (key: string) => boolean;
  setPendingReanswerKey: (key: string | null) => void;
  addQuestion: (q: QuestionDef) => void;
  updateQuestion: (
    key: string,
    newTitle: string,
    newOptions: string[],
    extraMeta?: Partial<Omit<QuestionDef, 'key' | 'subtitle' | 'options'>>
  ) => void;
  deleteQuestion: (key: string, from: 'active' | 'available') => void;
  disableOrEnableQuestion: (qTarget: QuestionDef, from: 'active' | 'available') => void;
  moveToAvailable: (q: QuestionDef) => void;
  moveToActive: (q: QuestionDef) => void;
  deleteHistoryRecord: (id: string) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  questions: INITIAL_QUESTIONS,
  availableQuestions: INITIAL_AVAILABLE_QUESTIONS,
  historyRecords: DEMO_HISTORY_RECORDS,
  pendingReanswerKey: null,
  pendingImageCapture: null,

  setPendingImageCapture: (value) => set({ pendingImageCapture: value }),

  setQuestions: (updater) =>
    set((state) => ({
      questions: typeof updater === 'function' ? updater(state.questions) : updater,
    })),

  setAvailableQuestions: (updater) =>
    set((state) => ({
      availableQuestions:
        typeof updater === 'function' ? updater(state.availableQuestions) : updater,
    })),

  setHistoryRecords: (updater) =>
    set((state) => ({
      historyRecords:
        typeof updater === 'function' ? updater(state.historyRecords) : updater,
    })),

  clearTodayAnswerForQuestion: (key: string) =>
    set((state) => ({
      historyRecords: state.historyRecords.map((r) => {
        if (r.dateStr.toLowerCase() === 'today' || r.id === 'rec-1') {
          const updatedAnswers = { ...(r.answers || {}) };
          delete updatedAnswers[key];
          return { ...r, answers: updatedAnswers };
        }
        return r;
      }),
    })),

  hasTodayAnswerForQuestion: (key: string) => {
    const today = get().historyRecords.find(
      (r) => r.dateStr.toLowerCase() === 'today' || r.id === 'rec-1'
    );
    return Boolean(today?.answers && today.answers[key]);
  },

  setPendingReanswerKey: (key: string | null) =>
    set({ pendingReanswerKey: key }),

  addQuestion: (q) =>
    set((state) => ({
      questions: [q, ...state.questions.filter((item) => item.key !== q.key)],
    })),

  updateQuestion: (key, newTitle, newOptions, extraMeta) =>
    set((state) => {
      const transformQuestion = (q: QuestionDef) => {
        if (q.key !== key) return q;
        return {
          ...q,
          ...extraMeta,
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
    set((state) => {
      // Default system questions can never be permanently deleted
      if (key.startsWith('q_')) return state;
      return {
        questions: from === 'active' ? state.questions.filter((q) => q.key !== key) : state.questions,
        availableQuestions:
          from === 'available'
            ? state.availableQuestions.filter((q) => q.key !== key)
            : state.availableQuestions,
      };
    }),

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
      availableQuestions: [
        qToRemove,
        ...state.availableQuestions.filter((q) => q.key !== qToRemove.key),
      ],
    })),

  moveToActive: (qToAdd) =>
    set((state) => ({
      availableQuestions: state.availableQuestions.filter((q) => q.key !== qToAdd.key),
      questions: [
        ...state.questions.filter((q) => q.key !== qToAdd.key),
        qToAdd,
      ],
    })),

  deleteHistoryRecord: (id) =>
    set((state) => ({
      historyRecords: state.historyRecords.filter((r) => r.id !== id),
    })),
}));
