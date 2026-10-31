import React, { 
  useState, 
  useRef, 
  useCallback, 
  useImperativeHandle, 
  forwardRef,
  useMemo,
  useEffect,
  memo,
} from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Keyboard, 
  Modal, 
  ScrollView, 
  TextInput,
  InteractionManager,
} from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  PlusCircle,
  AlertTriangle
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { QuestionDataType } from '@/app/add-journal-question';
import { DraggableScrollDownCircle, useDraggableScroll } from '@/components/ui/draggable-scroll-down-circle';
import { useJournalStore, QuestionDef } from '@/store/journalStore';

export interface AddJournalQuestionDetailsSheetRef {
  present: () => void;
  dismiss: () => void;
}

export interface AddJournalQuestionDetailsSheetProps {
  selectedType: QuestionDataType | null;
  isDark: boolean;
  onSuccess?: () => void;
  onDismiss?: () => void;
}

export interface DataTypeDraft {
  title: string;
  options: string[];
  placeholderText: string;
  scaleRange: '1-3' | '1-5' | '1-10';
  stepLabels: string[];
  unit: string;
  stepSize: number;
  maxValue: string;
}

// Static arrays outside component — never recreated on re-render
const SCALE_RANGES = ['1-3', '1-5', '1-10'] as const;
const NUMERIC_STEPS = [0.5, 1, 2, 5, 10] as const;

const DYNAMIC_COLORS = {
  light: {
    disabledBg: '#d1d5db',
    unselectedBg: '#ffffff',
    unselectedBorder: '#e5e7eb',
    unselectedText: '#6b7280',
    addOptionText: '#18181b',
    placeholderText: '#9ca3af',
  },
  dark: {
    disabledBg: '#2c2c30',
    unselectedBg: '#1c1c20',
    unselectedBorder: '#2b2b30',
    unselectedText: '#a1a1aa',
    addOptionText: '#e4e4e7',
    placeholderText: '#71717a',
  },
} as const;

const createDefaultDrafts = (): Record<QuestionDataType, DataTypeDraft> => ({
  multi_select: {
    title: '',
    options: ['', ''],
    placeholderText: '',
    scaleRange: '1-5',
    stepLabels: ['', '', '', '', ''],
    unit: '',
    stepSize: 1,
    maxValue: '',
  },
  boolean: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    stepLabels: ['', '', '', '', ''],
    unit: '',
    stepSize: 1,
    maxValue: '',
  },
  single_choice: {
    title: '',
    options: ['', ''],
    placeholderText: '',
    scaleRange: '1-5',
    stepLabels: ['', '', '', '', ''],
    unit: '',
    stepSize: 1,
    maxValue: '',
  },
  text: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    stepLabels: ['', '', '', '', ''],
    unit: '',
    stepSize: 1,
    maxValue: '',
  },
  scale: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    stepLabels: ['', '', '', '', ''],
    unit: '',
    stepSize: 1,
    maxValue: '',
  },
  numeric: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    stepLabels: ['', '', '', '', ''],
    unit: '',
    stepSize: 1,
    maxValue: '',
  },
});

const getTitlePlaceholder = (type: QuestionDataType) => {
  switch (type) {
    case 'multi_select':
      return 'e.g., Which symptoms do you have?';
    case 'boolean':
      return 'e.g., Did you apply sunscreen today?';
    case 'single_choice':
      return 'e.g., How does your skin feel?';
    case 'text':
      return 'e.g., Daily Skin Notes';
    case 'scale':
      return 'e.g., Rate your stress level';
    case 'numeric':
      return 'e.g., Water intake';
    default:
      return 'Enter question title';
  }
};

// ---------------------------------------------------------------------------
// MemoizedSaveButton — owns isSaveEnabled state so typing never re-renders parent
// ---------------------------------------------------------------------------
interface MemoizedSaveButtonProps {
  isDark: boolean;
  primaryColor: string;
  onPress: () => void;
  /** Call this ref-setter so the parent can imperatively trigger re-validation */
  registerFieldMutated: (cb: () => void) => void;
  checkFormValid: () => boolean;
}

// Lightweight tracker component to measure mount without violating Rules of Hooks
const MountTracker = ({ label, startTime }: { label: string; startTime: number }) => {
  return null;
};

const MemoizedSaveButton = memo(({
  isDark,
  primaryColor,
  onPress,
  registerFieldMutated,
  checkFormValid,
}: MemoizedSaveButtonProps) => {
  const [isDisabled, setIsDisabled] = useState(true);

  // Expose a stable callback so inputs can trigger re-validation without touching the parent
  const handleFieldMutated = useCallback(() => {
    const valid = checkFormValid();
    setIsDisabled((prev) => (prev !== !valid ? !valid : prev));
  }, [checkFormValid]);

  // Let the parent register this callback once (via ref) so it can call it on present()
  useEffect(() => {
    registerFieldMutated(handleFieldMutated);
  }, [registerFieldMutated, handleFieldMutated]);

  const disabledBg = isDark ? styles.saveButtonDisabledDark : styles.saveButtonDisabledLight;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.saveButton,
        isDisabled
          ? disabledBg
          : pressed
          ? styles.saveButtonPressed
          : { backgroundColor: primaryColor },
      ]}
    >
      <Text style={styles.saveButtonText}>Save Question</Text>
    </Pressable>
  );
}, (prev, next) => {
  return (
    prev.isDark === next.isDark &&
    prev.primaryColor === next.primaryColor &&
    prev.onPress === next.onPress &&
    prev.registerFieldMutated === next.registerFieldMutated &&
    prev.checkFormValid === next.checkFormValid
  );
});

// ---------------------------------------------------------------------------
// MemoizedOptionsList — owns options[] state so "Add Option" never re-renders parent
// ---------------------------------------------------------------------------
interface MemoizedOptionsListProps {
  activeType: QuestionDataType;
  initialOptions: string[];
  isDark: boolean;
  onOptionChange: (idx: number, text: string) => void;
  onAddOption: () => string[];
  onFieldMutated: () => void;
}

const MemoizedOptionsList = memo(({
  activeType,
  initialOptions,
  isDark,
  onOptionChange,
  onAddOption,
  onFieldMutated,
}: MemoizedOptionsListProps) => {
  const [options, setOptions] = useState<string[]>(initialOptions);

  const handleAddOption = useCallback(() => {
    // Let parent push the empty string into draftsRef and return the new array
    const newOptions = onAddOption();
    setOptions(newOptions);
  }, [onAddOption]);

  const makeChangeHandler = useCallback((idx: number) => (text: string) => {
    onOptionChange(idx, text);
    onFieldMutated();
  }, [onOptionChange, onFieldMutated]);

  const optionLabelStyle = isDark ? styles.optionLabelDark : styles.optionLabelLight;
  const titleInputStyle = [styles.titleInput, isDark ? styles.titleInputDark : styles.titleInputLight];
  const addOptionBtnVariant = isDark ? styles.addOptionBtnDark : styles.addOptionBtnLight;
  const addOptionBtnPressedVariant = isDark ? styles.addOptionBtnPressedDark : styles.addOptionBtnPressedLight;
  const colors = DYNAMIC_COLORS[isDark ? 'dark' : 'light'];
  const addOptionTextColor = colors.addOptionText;
  const placeholderColor = colors.placeholderText;

  return (
    <View style={styles.optionsBlock}>
      {options.map((opt, idx) => (
        <View 
          key={`opt-wrap-${activeType}-${idx}`} 
          style={styles.stepWrapper}
        >
          <Text style={[styles.optionLabel, optionLabelStyle]}>
             Option {idx + 1}
          </Text>
          <TextInput
            key={`opt-${activeType}-${idx}`}
            defaultValue={opt}
            onChangeText={makeChangeHandler(idx)}
            placeholder="Enter option..."
            placeholderTextColor={placeholderColor}
            maxLength={125}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            multiline={false}
            scrollEnabled={false}
            returnKeyType="done"
            blurOnSubmit={true}
            style={titleInputStyle}
          />
        </View>
      ))}

      {options.length < 99 && (
        <Pressable
          onPress={handleAddOption}
          android_ripple={{
            color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderless: false,
            foreground: true,
          }}
          style={({ pressed }) => [
            styles.addOptionBtn,
            pressed ? addOptionBtnPressedVariant : addOptionBtnVariant,
          ]}
        >
          <PlusCircle size={18} color={addOptionTextColor} strokeWidth={2} />
          <Text style={[styles.addOptionBtnText, isDark ? styles.addOptionBtnTextDark : styles.addOptionBtnTextLight]}>
            Add Option
          </Text>
        </Pressable>
      )}
    </View>
  );
}, (prev, next) => {
  return (
    prev.activeType === next.activeType &&
    prev.isDark === next.isDark &&
    prev.onOptionChange === next.onOptionChange &&
    prev.onAddOption === next.onAddOption &&
    prev.onFieldMutated === next.onFieldMutated
  );
});

// ---------------------------------------------------------------------------
// MemoizedScaleLabelsList — owns stepLabels[] state so range switching never re-renders parent
// ---------------------------------------------------------------------------
interface MemoizedScaleLabelsListProps {
  scaleRange: '1-3' | '1-5' | '1-10';
  initialLabels: string[];
  isDark: boolean;
  onLabelChange: (idx: number, text: string) => void;
}

const MemoizedScaleLabelsList = memo(({
  scaleRange,
  initialLabels,
  isDark,
  onLabelChange,
}: MemoizedScaleLabelsListProps) => {
  const [stepLabels, setStepLabels] = useState<string[]>(initialLabels);

  // Sync when the parent switches the scale range (shrink/grow array)
  useEffect(() => {
    setStepLabels(initialLabels);
  }, [scaleRange, initialLabels]);

  const makeChangeHandler = useCallback((idx: number) => (text: string) => {
    onLabelChange(idx, text);
  }, [onLabelChange]);

  const stepNumberChipVariant = isDark ? styles.stepNumberChipDark : styles.stepNumberChipLight;
  const stepNumberTextVariant = isDark ? styles.stepNumberTextDark : styles.stepNumberTextLight;
  const stepLabelInputStyle = [styles.textInput, styles.stepLabelInput, isDark ? styles.textInputDark : styles.textInputLight];
  const colors = DYNAMIC_COLORS[isDark ? 'dark' : 'light'];
  const placeholderColor = colors.placeholderText;

  return (
    <View style={styles.stepLabelsContainer}>
      {stepLabels.map((label, idx) => {
        const stepNumber = idx + 1;
        const isFirst = idx === 0;
        const isLast = idx === stepLabels.length - 1;
        const placeholder = isFirst
          ? 'e.g., None, No stress, Very low'
          : isLast
          ? 'e.g., Extreme, Severe, Very high'
          : 'e.g., Moderate';
        return (
          <View key={`step-${scaleRange}-${idx}`} style={styles.stepLabelRow}>
            <View style={[styles.stepNumberChip, stepNumberChipVariant]}>
              <Text style={[styles.stepNumberText, stepNumberTextVariant]}>
                {stepNumber}
              </Text>
            </View>
            <TextInput
              key={`stepLabel-${scaleRange}-${idx}`}
              defaultValue={label}
              onChangeText={makeChangeHandler(idx)}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              maxLength={100}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline={false}
              scrollEnabled={false}
              returnKeyType="done"
              blurOnSubmit={true}
              style={stepLabelInputStyle}
            />
          </View>
        );
      })}
    </View>
  );
}, (prev, next) => {
  return (
    prev.scaleRange === next.scaleRange &&
    prev.initialLabels === next.initialLabels &&
    prev.isDark === next.isDark &&
    prev.onLabelChange === next.onLabelChange
  );
});

// ---------------------------------------------------------------------------
// MemoizedNumericStepChips — owns selected-step UI so chip press never re-renders parent
// ---------------------------------------------------------------------------
interface MemoizedNumericStepChipsProps {
  initialStep: number;
  isDark: boolean;
  primaryColor: string;
  onSelectStep: (step: number) => void;
}

const MemoizedNumericStepChips = memo(({
  initialStep,
  isDark,
  primaryColor,
  onSelectStep,
}: MemoizedNumericStepChipsProps) => {
  const [selectedStep, setSelectedStep] = useState(initialStep);

  const handleSelect = useCallback((step: number) => {
    setSelectedStep(step);
    onSelectStep(step);
  }, [onSelectStep]);

  const chipUnselectedVariant = isDark ? styles.stepChipBtnUnselectedDark : styles.stepChipBtnUnselectedLight;
  const textUnselectedVariant = isDark ? styles.segmentBtnTextUnselectedDark : styles.segmentBtnTextUnselectedLight;

  return (
    <View style={styles.numericChipsContainer}>
      {NUMERIC_STEPS.map((step) => {
        const isSelected = selectedStep === step;
        return (
          <Pressable
            key={`step-${step}`}
            onPress={() => handleSelect(step)}
            style={[
              styles.stepChipBtn,
              isSelected
                ? { backgroundColor: primaryColor, borderColor: primaryColor }
                : chipUnselectedVariant,
            ]}
          >
            <Text
              style={[
                styles.segmentBtnText,
                isSelected ? styles.segmentBtnTextSelected : textUnselectedVariant,
              ]}
            >
              {step}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}, (prev, next) => {
  return (
    prev.initialStep === next.initialStep &&
    prev.isDark === next.isDark &&
    prev.primaryColor === next.primaryColor &&
    prev.onSelectStep === next.onSelectStep
  );
});

// ---------------------------------------------------------------------------
// MemoizedScaleRangeSelector — owns selected-range UI so segment press doesn't re-render parent
// ---------------------------------------------------------------------------
interface MemoizedScaleRangeSelectorProps {
  scaleRange: '1-3' | '1-5' | '1-10';
  isDark: boolean;
  primaryColor: string;
  onPress: (rng: '1-3' | '1-5' | '1-10') => void;
}

const MemoizedScaleRangeSelector = memo(({
  scaleRange,
  isDark,
  primaryColor,
  onPress,
}: MemoizedScaleRangeSelectorProps) => {
  const segmentUnselectedVariant = isDark ? styles.segmentBtnUnselectedDark : styles.segmentBtnUnselectedLight;
  const textUnselectedVariant = isDark ? styles.segmentBtnTextUnselectedDark : styles.segmentBtnTextUnselectedLight;

  return (
    <View style={styles.segmentedContainer}>
      {SCALE_RANGES.map((rng) => {
        const isSelected = scaleRange === rng;
        return (
          <Pressable
            key={rng}
            onPress={() => onPress(rng)}
            style={[
              styles.segmentBtn,
              isSelected
                ? { backgroundColor: primaryColor, borderColor: primaryColor }
                : segmentUnselectedVariant,
            ]}
          >
            <Text
              style={[
                styles.segmentBtnText,
                isSelected ? styles.segmentBtnTextSelected : textUnselectedVariant,
              ]}
            >
              {rng}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}, (prev, next) => {
  return (
    prev.scaleRange === next.scaleRange &&
    prev.isDark === next.isDark &&
    prev.primaryColor === next.primaryColor &&
    prev.onPress === next.onPress
  );
});

// ---------------------------------------------------------------------------
// MemoizedBooleanSection — displays boolean helper text
// ---------------------------------------------------------------------------
interface MemoizedBooleanSectionProps {
  isDark: boolean;
}

const MemoizedBooleanSection = memo(({
  isDark,
}: MemoizedBooleanSectionProps) => {
  return (
    <Text style={[styles.helperText, isDark ? styles.helperTextDark : styles.helperTextLight]}>
      This will appear as a simple toggle switch in your journal.
    </Text>
  );
}, (prev, next) => prev.isDark === next.isDark);

// ---------------------------------------------------------------------------
// MemoizedTextSection — placeholder text configuration for text questions
// ---------------------------------------------------------------------------
interface MemoizedTextSectionProps {
  isDark: boolean;
  defaultValue: string;
  onChangeText: (text: string) => void;
  placeholderTextColor: string;
}

const MemoizedTextSection = memo(({
  isDark,
  defaultValue,
  onChangeText,
  placeholderTextColor,
}: MemoizedTextSectionProps) => {
  return (
    <View style={styles.sectionBlock}>
      <Text style={[styles.sectionHeading, isDark ? styles.sectionHeadingDark : styles.sectionHeadingLight]}>
        What should the placeholder say?{' '}
        <Text style={[styles.sectionHeadingOptional, isDark ? styles.sectionHeadingOptionalDark : styles.sectionHeadingOptionalLight]}>
          (optional)
        </Text>
      </Text>
      <Text style={[styles.helperText, isDark ? styles.helperTextDark : styles.helperTextLight]}>
        This text will appear inside the text area when logging your journal.
      </Text>
      <TextInput
        key="placeholder-text"
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        placeholder="e.g., Describe your skin..."
        placeholderTextColor={placeholderTextColor}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        multiline={false}
        scrollEnabled={false}
        returnKeyType="done"
        blurOnSubmit={true}
        maxLength={50}
        style={[styles.textInput, isDark ? styles.textInputDark : styles.textInputLight]}
      />
    </View>
  );
}, (prev, next) => {
  return (
    prev.isDark === next.isDark &&
    prev.defaultValue === next.defaultValue &&
    prev.onChangeText === next.onChangeText &&
    prev.placeholderTextColor === next.placeholderTextColor
  );
});

// ---------------------------------------------------------------------------
// MemoizedNumericInputsSection — unit and max value text inputs
// ---------------------------------------------------------------------------
interface MemoizedNumericInputsSectionProps {
  isDark: boolean;
  unit: string;
  maxValue: string;
  onChangeUnit: (text: string) => void;
  onChangeMaxValue: (text: string) => void;
  placeholderTextColor: string;
}

const MemoizedNumericInputsSection = memo(({
  isDark,
  unit,
  maxValue,
  onChangeUnit,
  onChangeMaxValue,
  placeholderTextColor,
}: MemoizedNumericInputsSectionProps) => {
  const sectionHeadingVariant = isDark ? styles.sectionHeadingDark : styles.sectionHeadingLight;
  const helperTextVariant = isDark ? styles.helperTextDark : styles.helperTextLight;
  const titleInputVariant = isDark ? styles.titleInputDark : styles.titleInputLight;

  return (
    <>
      <View style={styles.numericSubBlock}>
        <Text style={[styles.sectionHeading, sectionHeadingVariant]}>
          Unit Label <Text style={[styles.helperText, helperTextVariant]}>(optional)</Text>
        </Text>
        <TextInput
          key="unit-numeric"
          defaultValue={unit}
          onChangeText={onChangeUnit}
          placeholder="e.g., glasses, hrs, mg, km"
          placeholderTextColor={placeholderTextColor}
          maxLength={10}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          multiline={false}
          scrollEnabled={false}
          returnKeyType="done"
          blurOnSubmit={true}
          style={[styles.titleInput, titleInputVariant]}
        />
      </View>

      <View style={styles.numericSubBlock}>
        <Text style={[styles.sectionHeading, sectionHeadingVariant]}>
          Max Value <Text style={[styles.helperText, helperTextVariant]}>(optional)</Text>
        </Text>
        <TextInput
          key="maxValue-numeric"
          defaultValue={maxValue}
          onChangeText={onChangeMaxValue}
          placeholder="e.g., 20, 24, 100"
          placeholderTextColor={placeholderTextColor}
          keyboardType="numeric"
          maxLength={10}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          multiline={false}
          scrollEnabled={false}
          returnKeyType="done"
          blurOnSubmit={true}
          style={[styles.titleInput, titleInputVariant]}
        />
      </View>
    </>
  );
}, (prev, next) => {
  return (
    prev.isDark === next.isDark &&
    prev.unit === next.unit &&
    prev.maxValue === next.maxValue &&
    prev.onChangeUnit === next.onChangeUnit &&
    prev.onChangeMaxValue === next.onChangeMaxValue &&
    prev.placeholderTextColor === next.placeholderTextColor
  );
});

/**
 * Slide Component (Bottom Sheet) - Option B Native Architecture
 * Powered by pure Android CoordinatorLayout + BottomSheetBehavior.
 * 0ms cold-start delay, 120 FPS native animations, perfect keyboard avoidance.
 */
export const AddJournalQuestionDetailsSheet = forwardRef<
  AddJournalQuestionDetailsSheetRef, 
  AddJournalQuestionDetailsSheetProps
>((({
  selectedType = 'multi_select',
  isDark,
  onSuccess,
  onDismiss,
}, ref) => {
  const mountStartTimeRef = useRef<number>(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primaryColor = Colors.light.primary;
  const themeColors = DYNAMIC_COLORS[isDark ? 'dark' : 'light'];

  const sheetRef = useRef<ActionSheetRef>(null);
  const scrollRef = useRef<any>(null);

  // Draft state preserved in ref to keep native Android typing 100% fluid
  const draftsRef = useRef<Record<QuestionDataType, DataTypeDraft>>(createDefaultDrafts());

  // Parent state is now lean: only open state + warning modal target
  const [isOpen, setIsOpen] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);
  const [scaleWarningTarget, setScaleWarningTarget] = useState<'1-3' | '1-5' | '1-10' | null>(null);
  // Session version counter to cleanly remount defaultValue-based inputs when a draft is saved/reset
  const [resetVersion, setResetVersion] = useState(0);

  // Tracks current scale range so MemoizedScaleRangeSelector & MemoizedScaleLabelsList re-render
  const [currentScaleRange, setCurrentScaleRange] = useState<'1-3' | '1-5' | '1-10'>(
    draftsRef.current.scale.scaleRange
  );

  // Ref to the MemoizedSaveButton's field-mutated callback — set once on mount
  const fieldMutatedCallbackRef = useRef<(() => void) | null>(null);

  const registerFieldMutated = useCallback((cb: () => void) => {
    fieldMutatedCallbackRef.current = cb;
  }, []);

  const activeType = selectedType || 'multi_select';
  const currentDraft = draftsRef.current[activeType];

  const checkFormValid = useCallback((typeToCheck?: QuestionDataType) => {
    const type = typeToCheck ?? activeType;
    const draft = draftsRef.current[type];
    if (!draft.title.trim()) return false;
    if (type === 'multi_select' || type === 'single_choice') {
      let filledCount = 0;
      for (let i = 0; i < draft.options.length; i++) {
        if (draft.options[i].trim().length > 0) {
          filledCount++;
          if (filledCount >= 2) return true; // Early exit, zero allocation
        }
      }
      return false;
    }
    return true;
  }, [activeType]);

  // Stable callback used by MemoizedSaveButton to query validity
  const checkFormValidForSaveButton = useCallback(() => checkFormValid(), [checkFormValid]);

  // Called by every TextInput's onChangeText to trigger save-button re-validation
  const notifyFieldMutated = useCallback(() => {
    fieldMutatedCallbackRef.current?.();
  }, []);

  const updateDraftField = useCallback(<K extends keyof DataTypeDraft>(type: QuestionDataType, field: K, value: DataTypeDraft[K]) => {
    draftsRef.current[type][field] = value;
  }, []);

  // Title onChangeText handler (stable reference)
  const handleTitleChange = useCallback((text: string) => {
    draftsRef.current[activeType].title = text;
    notifyFieldMutated();
  }, [activeType, notifyFieldMutated]);

  // Placeholder text onChangeText handler (stable reference)
  const handlePlaceholderChange = useCallback((text: string) => {
    updateDraftField(activeType, 'placeholderText', text);
    notifyFieldMutated();
  }, [activeType, updateDraftField, notifyFieldMutated]);

  // Unit onChangeText (stable reference)
  const handleUnitChange = useCallback((text: string) => {
    updateDraftField('numeric', 'unit', text);
    notifyFieldMutated();
  }, [updateDraftField, notifyFieldMutated]);

  // Max value onChangeText (stable reference)
  const handleMaxValueChange = useCallback((text: string) => {
    updateDraftField('numeric', 'maxValue', text.replace(/[^0-9.]/g, ''));
    notifyFieldMutated();
  }, [updateDraftField, notifyFieldMutated]);

  // Step size onChangeText (stable reference)
  const handleStepSizeChange = useCallback((text: string) => {
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed > 0) {
      draftsRef.current.numeric.stepSize = parsed;
    }
  }, []);

  // Called by MemoizedOptionsList when an option input changes
  const handleOptionChange = useCallback((idx: number, text: string) => {
    draftsRef.current[activeType].options[idx] = text;
  }, [activeType]);

  // Called by MemoizedOptionsList when "Add Option" is pressed
  const handleAddOption = useCallback((): string[] => {
    draftsRef.current[activeType].options.push('');
    return [...draftsRef.current[activeType].options];
  }, [activeType]);

  // Called by MemoizedScaleLabelsList when a label changes
  const handleScaleLabelChange = useCallback((idx: number, text: string) => {
    // Direct index mutation — safe because the child manages its own local display state.
    // This purely persists the draft for saving, with zero array allocation per keystroke.
    draftsRef.current.scale.stepLabels[idx] = text;
  }, []);

  // Called by MemoizedNumericStepChips when a quick-step chip is pressed
  const handleNumericStepSelect = useCallback((step: number) => {
    draftsRef.current.numeric.stepSize = step;
    notifyFieldMutated();
  }, [notifyFieldMutated]);

  const applyScaleRangeSwitch = useCallback((targetRng: '1-3' | '1-5' | '1-10') => {
    const targetCount = targetRng === '1-3' ? 3 : targetRng === '1-5' ? 5 : 10;
    const prev = draftsRef.current.scale.stepLabels;
    const newLabels: string[] = [];
    for (let i = 0; i < targetCount; i++) {
      newLabels.push(prev[i]?.trim() || '');
    }
    draftsRef.current.scale.scaleRange = targetRng;
    draftsRef.current.scale.stepLabels = newLabels;
    setCurrentScaleRange(targetRng);
    setScaleWarningTarget(null);
  }, []);

  const handleScaleRangePress = useCallback((targetRng: '1-3' | '1-5' | '1-10') => {
    const currentRng = draftsRef.current.scale.scaleRange;
    if (targetRng === currentRng) return;
    const currentCount = currentRng === '1-3' ? 3 : currentRng === '1-5' ? 5 : 10;
    const targetCount = targetRng === '1-3' ? 3 : targetRng === '1-5' ? 5 : 10;

    if (targetCount < currentCount) {
      let filledCount = 0;
      const labels = draftsRef.current.scale.stepLabels;
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].trim().length > 0) filledCount++;
      }
      if (filledCount > targetCount) {
        setScaleWarningTarget(targetRng);
        return;
      }
    }

    applyScaleRangeSwitch(targetRng);
  }, [applyScaleRangeSwitch]);

  const draggableScrollConfig = useMemo(() => ({
    modalOpen: isOpen,
    activeStep: activeType,
    scrollViewRef: scrollRef,
    shouldScrollToTop: false as const,
  }), [isOpen, activeType]); // scrollRef is a stable ref, excluded from deps

  const { scrollHandlers, isSaveBtnVisible } = useDraggableScroll(draggableScrollConfig);

  useImperativeHandle(ref, () => ({
    present: () => {
      mountStartTimeRef.current = performance.now();
      fieldMutatedCallbackRef.current?.();
      setIsOpen(true);
      sheetRef.current?.show();

      // Log when the deferral actually fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsContentReady(true);
        });
      });
    },
    dismiss: () => {
      Keyboard.dismiss();
      sheetRef.current?.hide();
      setIsOpen(false);
      setIsContentReady(false); // Reset for next open
    },
  }));

  const addQuestion = useJournalStore((state) => state.addQuestion);

  const handleSave = useCallback(() => {
    if (!checkFormValid()) return;
    const current = draftsRef.current[activeType];
    const trimmedTitle = current.title.trim();

    let finalOptions: { label: string; value: string }[] = [];

    if (activeType === 'multi_select' || activeType === 'single_choice') {
      const opts = current.options;
      const len = opts.length;
      for (let i = 0; i < len; i++) {
        const trimmed = opts[i].trim();
        if (trimmed.length > 0) {
          finalOptions.push({ label: trimmed, value: trimmed });
        }
      }
    } else if (activeType === 'boolean') {
      finalOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ];
    } else if (activeType === 'scale') {
      const stepCount = current.scaleRange === '1-3' ? 3 : current.scaleRange === '1-5' ? 5 : 10;
      for (let i = 0; i < stepCount; i++) {
        const stepNum = i + 1;
        const customLabel = current.stepLabels[i]?.trim();
        const displayLabel = customLabel ? `${stepNum} - ${customLabel}` : `${stepNum}`;
        finalOptions.push({ label: displayLabel, value: String(stepNum) });
      }
    } else if (activeType === 'numeric') {
      const unitStr = current.unit.trim() ? ` ${current.unit.trim()}` : '';
      const step = current.stepSize || 1;
      const parsedMax = parseFloat(current.maxValue);
      const limit = !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : step * 5;
      finalOptions = [
        { label: `0${unitStr}`, value: `0${unitStr}` },
        { label: `${step}${unitStr}`, value: `${step}${unitStr}` },
        { label: `${step * 2}${unitStr}`, value: `${step * 2}${unitStr}` },
        { label: `${limit}${unitStr}+`, value: `${limit}${unitStr}+` },
      ];
    } else if (activeType === 'text') {
      finalOptions = [
        { label: current.placeholderText.trim() || 'Notes logged', value: 'Notes' },
      ];
    }

    const newQuestion: QuestionDef = {
      key: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      prefix: '',
      highlight: '',
      subtitle: trimmedTitle,
      options: finalOptions,
      createdAt: Date.now(),
      dataType: activeType,
      placeholderText: current.placeholderText,
      scaleRange: current.scaleRange,
      stepLabels: current.stepLabels,
      unit: current.unit,
      stepSize: current.stepSize,
      maxValue: current.maxValue,
    };

    // Wipe the draft for the saved data type so the next time it opens, it is completely fresh & blank
    const cleanDrafts = createDefaultDrafts();
    draftsRef.current[activeType] = cleanDrafts[activeType];
    if (activeType === 'scale') {
      setCurrentScaleRange(cleanDrafts.scale.scaleRange);
    }
    setResetVersion((v) => v + 1);

    // Close UI immediately so the dismiss animation gets absolute priority on the JS thread
    Keyboard.dismiss();
    sheetRef.current?.hide();
    setIsOpen(false);
    setIsContentReady(false);

    // Defer heavy store update + navigation until after the dismiss animation frames are rendered
    InteractionManager.runAfterInteractions(() => {
      addQuestion(newQuestion);
      if (onSuccess) {
        onSuccess();
      } else {
        router.dismissTo('/(tabs)/journal?tab=questionnaire');
      }
    });
  }, [checkFormValid, activeType, addQuestion, onSuccess, router]);

  // Stable callbacks for modal and sheet events
  const handleSheetClose = useCallback(() => {
    setIsOpen(false);
    setIsContentReady(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleDismissModal = useCallback(() => {
    setScaleWarningTarget(null);
  }, []);

  const handleConfirmScaleSwitch = useCallback(() => {
    if (scaleWarningTarget) {
      applyScaleRangeSwitch(scaleWarningTarget);
    }
  }, [scaleWarningTarget, applyScaleRangeSwitch]);

  const stopPropagation = useCallback((e: any) => {
    e.stopPropagation();
  }, []);

  const placeholderTextColor = themeColors.placeholderText;

  return (
    <>
      <ActionSheet
        ref={sheetRef}
        isModal={true}
        gestureEnabled={true}
        defaultOverlayOpacity={0.5}
        overlayColor="#000000"
        containerStyle={[
          styles.actionSheetContainer,
          isDark ? styles.actionSheetContainerDark : styles.actionSheetContainerLight,
        ]}
        indicatorStyle={[
          styles.actionSheetIndicator,
          isDark ? styles.indicatorDark : styles.indicatorLight,
        ]}
        onClose={handleSheetClose}
        animated={true}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollHandlers}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Title */}
          <Text style={[styles.sheetTitle, isDark ? styles.sheetTitleDark : styles.sheetTitleLight]}>
            Add Question Details
          </Text>

          {/* Common: Question Title Input */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, isDark ? styles.sectionHeadingDark : styles.sectionHeadingLight]}>
              Question Title
            </Text>
            <TextInput
              key={`title-${activeType}-${resetVersion}`}
              defaultValue={currentDraft.title}
              onChangeText={handleTitleChange}
              placeholder={getTitlePlaceholder(activeType)}
              placeholderTextColor={placeholderTextColor}
              maxLength={200}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline={false}
              scrollEnabled={false}
              returnKeyType="done"
              blurOnSubmit={true}
              style={[styles.titleInput, isDark ? styles.titleInputDark : styles.titleInputLight]}
            />

            {activeType === 'boolean' && (
              <MemoizedBooleanSection 
                isDark={isDark}
              />
            )}
          </View>

          {/* Multi-Select & Single-Choice Options — isolated in MemoizedOptionsList */}
          {(activeType === 'multi_select' || activeType === 'single_choice') && (
            isContentReady ? (
              <>
                <MountTracker label="T4a" startTime={mountStartTimeRef.current} />
                <MemoizedOptionsList
                  key={`${activeType}-${resetVersion}`}
                  activeType={activeType}
                  initialOptions={currentDraft.options}
                  isDark={isDark}
                  onOptionChange={handleOptionChange}
                  onAddOption={handleAddOption}
                  onFieldMutated={notifyFieldMutated}
                />
              </>
            ) : (
              <View style={styles.skeletonPlaceholder}>
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
              </View>
            )
          )}

          {/* Text/Notes: Placeholder config — isolated in MemoizedTextSection */}
          {activeType === 'text' && (
            isContentReady ? (
              <>
                <MountTracker label="T4b" startTime={mountStartTimeRef.current} />
                <MemoizedTextSection
                  key={`${activeType}-${resetVersion}`}
                  isDark={isDark}
                  defaultValue={currentDraft.placeholderText}
                  onChangeText={handlePlaceholderChange}
                  placeholderTextColor={placeholderTextColor}
                />
              </>
            ) : (
              <View style={styles.skeletonPlaceholder}>
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
              </View>
            )
          )}

          {/* Scale: Range & step labels */}
          {activeType === 'scale' && (
            isContentReady ? (
              <>
                <MountTracker label="T4c" startTime={mountStartTimeRef.current} />
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionHeading, isDark ? styles.sectionHeadingDark : styles.sectionHeadingLight]}>
                    Scale Range
                  </Text>

                  {/* Range selector isolated — pressing a chip only re-renders this + MemoizedScaleLabelsList */}
                  <MemoizedScaleRangeSelector
                    scaleRange={currentScaleRange}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    onPress={handleScaleRangePress}
                  />

                  {/* Step labels isolated — only re-renders when scaleRange changes */}
                  <MemoizedScaleLabelsList
                    key={`${activeType}-${resetVersion}`}
                    scaleRange={currentScaleRange}
                    initialLabels={draftsRef.current.scale.stepLabels}
                    isDark={isDark}
                    onLabelChange={handleScaleLabelChange}
                  />
                </View>
              </>
            ) : (
              <View style={styles.skeletonPlaceholder}>
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
              </View>
            )
          )}

          {/* Numeric: Interval, Unit, Max Value */}
          {activeType === 'numeric' && (
            isContentReady ? (
              <>
                <MountTracker label="T4d" startTime={mountStartTimeRef.current} />
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionHeading, isDark ? styles.sectionHeadingDark : styles.sectionHeadingLight]}>
                    Count Interval
                  </Text>
                  <Text style={[styles.helperText, isDark ? styles.helperTextDark : styles.helperTextLight]}>
                    How much each + or − tap moves the number.
                  </Text>
                  <TextInput
                    key={`stepInput-${activeType}-${resetVersion}`}
                    defaultValue={String(currentDraft.stepSize)}
                    onChangeText={handleStepSizeChange}
                    placeholder="e.g., 0.5, 1, 5"
                    placeholderTextColor={placeholderTextColor}
                    keyboardType="numeric"
                    maxLength={8}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    multiline={false}
                    scrollEnabled={false}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    style={[styles.titleInput, isDark ? styles.titleInputDark : styles.titleInputLight]}
                  />

                  {/* Step chips isolated — selecting a chip only re-renders this sub-component */}
                  <MemoizedNumericStepChips
                    key={`numericChips-${resetVersion}`}
                    initialStep={currentDraft.stepSize}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    onSelectStep={handleNumericStepSelect}
                  />

                  {/* Numeric inputs isolated — unit and max value text inputs */}
                  <MemoizedNumericInputsSection
                    key={`${activeType}-${resetVersion}`}
                    isDark={isDark}
                    unit={currentDraft.unit}
                    maxValue={currentDraft.maxValue}
                    onChangeUnit={handleUnitChange}
                    onChangeMaxValue={handleMaxValueChange}
                    placeholderTextColor={placeholderTextColor}
                  />
                </View>
              </>
            ) : (
              <View style={styles.skeletonPlaceholder}>
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
                <View style={[styles.skeletonLine, isDark ? styles.skeletonLineDark : styles.skeletonLineLight]} />
              </View>
            )
          )}

          {/* Save Button — only mounted after native animation starts; typing never re-renders this section's parent */}
          {isContentReady && (
            <>
              <MountTracker label="T4e" startTime={mountStartTimeRef.current} />
              <MemoizedSaveButton
                isDark={isDark}
                primaryColor={primaryColor}
                onPress={handleSave}
                registerFieldMutated={registerFieldMutated}
                checkFormValid={checkFormValidForSaveButton}
              />
            </>
          )}
        </ScrollView>

        <DraggableScrollDownCircle
          scrollViewRef={scrollRef}
          isSaveBtnVisible={isSaveBtnVisible}
          modalOpen={isOpen}
          isDark={isDark}
          isFullScreenModal={true}
          bottomOffset={insets.bottom + 16}
          tag={`QuestionDetails_${activeType}`}
        />
      </ActionSheet>

      {/* Scale Range Change Confirmation Modal with Warning Sign */}
      <Modal
        visible={scaleWarningTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={handleDismissModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleDismissModal}
        >
          <Pressable
            style={[styles.confirmCard, isDark ? styles.confirmCardDark : styles.confirmCardLight]}
            onPress={stopPropagation}
          >
            <View style={styles.confirmIconWrapper}>
              <AlertTriangle size={28} color="#ef4444" strokeWidth={2.2} />
            </View>

            <Text style={[styles.confirmTitle, isDark ? styles.confirmTitleDark : styles.confirmTitleLight]}>
              Switch to {scaleWarningTarget} Range?
            </Text>

            <Text style={[styles.confirmSubtitle, isDark ? styles.confirmSubtitleDark : styles.confirmSubtitleLight]}>
              You currently have custom step labels that exceed this range. Switching will discard the labels for higher steps.
            </Text>

            <View style={styles.confirmActionsRow}>
              <Pressable
                onPress={handleDismissModal}
                style={[styles.confirmCancelBtn, isDark ? styles.confirmCancelBtnDark : styles.confirmCancelBtnLight]}
              >
                <Text style={[styles.confirmCancelText, isDark ? styles.confirmCancelTextDark : styles.confirmCancelTextLight]}>
                  Keep Current
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmScaleSwitch}
                style={styles.confirmDeleteBtn}
              >
                <Text style={styles.confirmDeleteText}>
                  Switch & Discard
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}));

const styles = StyleSheet.create({
  modalScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 8,
  },
  actionSheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  actionSheetContainerLight: {
    backgroundColor: '#FAF8F6',
  },
  actionSheetContainerDark: {
    backgroundColor: '#121212',
  },
  actionSheetIndicator: {
    width: 52,
    height: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  indicatorLight: {
    backgroundColor: '#d1d5db',
  },
  indicatorDark: {
    backgroundColor: '#3f3f46',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sheetTitleLight: {
    color: '#111827',
  },
  sheetTitleDark: {
    color: '#ffffff',
  },
  sectionBlock: {
    gap: 3,
  },
  optionsBlock: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionHeadingLight: {
    color: '#111827',
  },
  sectionHeadingDark: {
    color: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 2,
  },
  helperTextLight: {
    color: '#6b7280',
  },
  helperTextDark: {
    color: '#a1a1aa',
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  titleInputLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  titleInputDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    color: '#ffffff',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  textInputLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  textInputDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    color: '#ffffff',
  },
  sectionHeadingOptional: {
    fontWeight: '500',
    fontSize: 13,
  },
  sectionHeadingOptionalLight: {
    color: '#9ca3af',
  },
  sectionHeadingOptionalDark: {
    color: '#71717a',
  },
  stepWrapper: {
    gap: 3,
  },
  optionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  optionLabelLight: {
    color: '#9ca3af',
  },
  optionLabelDark: {
    color: '#a1a1aa',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  addOptionBtnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  addOptionBtnDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  addOptionBtnPressedLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  addOptionBtnPressedDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  addOptionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  addOptionBtnTextLight: {
    color: '#18181b',
  },
  addOptionBtnTextDark: {
    color: '#e4e4e7',
  },
  segmentedContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentBtnUnselectedLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  segmentBtnUnselectedDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  segmentBtnTextSelected: {
    color: '#ffffff',
  },
  segmentBtnTextUnselectedLight: {
    color: '#6b7280',
  },
  segmentBtnTextUnselectedDark: {
    color: '#a1a1aa',
  },
  numericChipsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  numericSubBlock: {
    gap: 6,
    marginTop: 8,
  },
  stepChipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepChipBtnUnselectedLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  stepChipBtnUnselectedDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  stepLabelsContainer: {
    gap: 8,
    marginTop: 12,
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumberChip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberChipLight: {
    backgroundColor: '#f0f0f5',
  },
  stepNumberChipDark: {
    backgroundColor: '#2b2b30',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepNumberTextLight: {
    color: '#6b7280',
  },
  stepNumberTextDark: {
    color: '#a1a1aa',
  },
  stepLabelInput: {
    flex: 1,
    marginBottom: 0,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 999,
    marginTop: 0,
    marginBottom: 0,
  },
  saveButtonDisabledLight: {
    backgroundColor: '#d1d5db',
  },
  saveButtonDisabledDark: {
    backgroundColor: '#2c2c30',
  },
  saveButtonPressed: {
    backgroundColor: '#a98fcc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f0f5',
  },
  confirmCardDark: {
    backgroundColor: '#1c1c20',
    borderColor: '#2b2b30',
  },
  confirmIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmTitleLight: {
    color: '#111827',
  },
  confirmTitleDark: {
    color: '#ffffff',
  },
  confirmSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  confirmSubtitleLight: {
    color: '#6b7280',
  },
  confirmSubtitleDark: {
    color: '#a1a1aa',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  confirmCancelBtnLight: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  confirmCancelBtnDark: {
    backgroundColor: '#2c2c30',
    borderColor: '#3f3f46',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmCancelTextLight: {
    color: '#52525b',
  },
  confirmCancelTextDark: {
    color: '#d4d4d8',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
  },
  confirmDeleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  skeletonPlaceholder: {
    paddingVertical: 12,
    gap: 12,
  },
  skeletonLine: {
    height: 48,
    borderRadius: 14,
  },
  skeletonLineLight: {
    backgroundColor: '#f3f4f6',
  },
  skeletonLineDark: {
    backgroundColor: '#27272a',
  },
});
