export interface ZoneConfig {
  id: string;
  name: string;
  conditions: string[];
  severity: number;
  isCustom?: boolean;
}

export interface SkinExperienceQuestionViewProps {
  isDark: boolean;
  primaryColor: string;
  currentAnswer?: string;
  onSelect: (val: string) => void;
  onContinue: () => void;
}

export interface ClarificationModalState {
  visible: boolean;
  type?: 'condition' | 'zone' | 'severity';
  title?: string;
  userInput: string;
  suggestions: string[];
  selectedSuggestion: string | null;
  targetZoneId?: string | null;
  replaceOldCondition?: string | null;
  replaceOldZoneId?: string | null;
  scaleLevel?: number;
}

export const INITIAL_CLARIFICATION_MODAL: ClarificationModalState = {
  visible: false,
  type: 'condition',
  title: "We couldn't recognize this condition",
  userInput: '',
  suggestions: [],
  selectedSuggestion: null,
  targetZoneId: null,
  replaceOldCondition: null,
  replaceOldZoneId: null,
  scaleLevel: undefined,
};

export const DEFAULT_ZONES: { id: string; name: string; isCustom?: boolean }[] = [
  { id: 'forehead', name: 'Forehead' },
  { id: 'temples', name: 'Temples' },
  { id: 'nose', name: 'Nose' },
  { id: 'under_eye', name: 'Under-eye' },
  { id: 'cheeks', name: 'Cheeks' },
  { id: 'chin', name: 'Chin' },
  { id: 'jawline', name: 'Jawline' },
];

export const DEFAULT_ZONE_CONDITIONS: Record<string, string[]> = {
  forehead: [
    'Active breakouts / pimples',
    'Excess oil & shine',
    'Flaky dry patches',
    'Hyperpigmentation',
  ],
  temples: [
    'Active pimples',
    'Dryness & peeling',
    'Subsurface texture',
  ],
  nose: [
    'Stubborn blackheads',
    'Enlarged visible pores',
    'Excess oiliness',
    'Redness around nostrils',
  ],
  under_eye: [
    'Puffy eyes',
    'Under-eye bags',
    'Dark circles',
    'Under-eye redness',
  ],
  cheeks: [
    'Redness & flushing',
    'Acne breakouts',
    'Dark spots / Melasma',
    'Enlarged pores',
  ],
  chin: [
    'Hormonal breakouts',
    'Deep painful cysts',
    'Post-acne marks',
    'Excess oil',
  ],
  jawline: [
    'Cystic acne',
    'Subsurface bumps',
    'Rough dry patches',
  ],
};

export const DEFAULT_SEVERITY_LEVELS: { level: number; label: string }[] = [
  { level: 1, label: 'Minimal / Barely noticeable' },
  { level: 2, label: 'Just a bit / Mild' },
  { level: 3, label: 'Medium / Moderate' },
  { level: 4, label: 'Difficult / Strong' },
  { level: 5, label: 'Very severe' },
];
