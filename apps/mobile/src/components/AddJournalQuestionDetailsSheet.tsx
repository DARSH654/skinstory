import React, { 
  useState, 
  useRef, 
  useCallback, 
  useImperativeHandle, 
  forwardRef,
  useEffect
} from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Dimensions, 
  Keyboard, 
  Modal,
  BackHandler
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  PlusCircle,
  X
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { QuestionDataType } from '@/app/add-journal-question';

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
  lowLabel: string;
  highLabel: string;
  unit: string;
  numberType: 'whole' | 'decimal';
}

const DEFAULT_DRAFTS: Record<QuestionDataType, DataTypeDraft> = {
  multi_select: {
    title: '',
    options: ['', ''],
    placeholderText: '',
    scaleRange: '1-5',
    lowLabel: '',
    highLabel: '',
    unit: '',
    numberType: 'whole',
  },
  boolean: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    lowLabel: '',
    highLabel: '',
    unit: '',
    numberType: 'whole',
  },
  single_choice: {
    title: '',
    options: ['', ''],
    placeholderText: '',
    scaleRange: '1-5',
    lowLabel: '',
    highLabel: '',
    unit: '',
    numberType: 'whole',
  },
  text: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    lowLabel: '',
    highLabel: '',
    unit: '',
    numberType: 'whole',
  },
  scale: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    lowLabel: '',
    highLabel: '',
    unit: '',
    numberType: 'whole',
  },
  numeric: {
    title: '',
    options: [],
    placeholderText: '',
    scaleRange: '1-5',
    lowLabel: '',
    highLabel: '',
    unit: '',
    numberType: 'whole',
  },
};

// Helper context-specific placeholder
function getTitlePlaceholder(selectedType: QuestionDataType | null) {
  switch (selectedType) {
    case 'multi_select':
      return 'e.g., Which symptoms do you have?';
    case 'boolean':
      return 'e.g., Did you drink 2L of water?';
    case 'single_choice':
      return 'e.g., What is your skin type today?';
    case 'text':
      return 'e.g., How does your skin feel?';
    case 'scale':
      return 'e.g., How stressed are you?';
    case 'numeric':
      return 'e.g., How much water did you drink?';
    default:
      return 'Enter your question title...';
  }
}

/**
 * Slide Component (Bottom Sheet)
 */
export const AddJournalQuestionDetailsSheet = forwardRef<
  AddJournalQuestionDetailsSheetRef, 
  AddJournalQuestionDetailsSheetProps
>(({
  selectedType = 'multi_select',
  isDark,
  onSuccess,
  onDismiss,
}, ref) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const scrollViewRef = useRef<any>(null);

  const primaryColor = Colors.light.primary;

  // Session-isolated Draft State for all 6 data types
  const draftsRef = useRef<Record<QuestionDataType, DataTypeDraft>>(DEFAULT_DRAFTS);
  const [draftsVersion, setDraftsVersion] = useState(0); // Only incremented when structural changes happen (like adding an option or switching type)
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // Active draft for the currently selected data type
  const activeType: QuestionDataType = selectedType || 'multi_select';
  const currentDraft = draftsRef.current[activeType] || DEFAULT_DRAFTS[activeType];

  const checkFormValid = useCallback(() => {
    if (!selectedType) return false;
    const current = draftsRef.current[selectedType];
    if (!current.title.trim()) return false;
    if (selectedType === 'multi_select' || selectedType === 'single_choice') {
      const filled = current.options.filter((o) => o.trim().length > 0);
      return filled.length >= 2;
    }
    return true;
  }, [selectedType]);

  const updateActiveDraftField = useCallback(<K extends keyof DataTypeDraft>(field: K, value: DataTypeDraft[K]) => {
    if (!selectedType) return;
    draftsRef.current[selectedType][field] = value;
    const valid = checkFormValid();
    setIsSaveEnabled((prev) => (prev !== valid ? valid : prev));
  }, [selectedType, checkFormValid]);

  // Sheet open state
  const [isPresented, setIsPresented] = useState(false);

  // Hardware back button inside the sheet
  useEffect(() => {
    if (!isPresented) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      bottomSheetModalRef.current?.dismiss();
      setIsPresented(false);
      return true;
    });
    return () => sub.remove();
  }, [isPresented]);

  useImperativeHandle(ref, () => ({
    present: () => {
      setIsPresented(true);
      setIsSaveEnabled(checkFormValid());
      bottomSheetModalRef.current?.present();
    },
    dismiss: () => {
      Keyboard.dismiss();
      setIsPresented(false);
      bottomSheetModalRef.current?.dismiss();
    },
  }));

  const handleSave = () => {
    if (!checkFormValid()) return;
    Keyboard.dismiss();
    setIsPresented(false);
    bottomSheetModalRef.current?.dismiss();
    if (onSuccess) {
      onSuccess();
    } else {
      router.dismissTo('/daily-journal');
    }
  };

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 35,
    stiffness: 350,
    mass: 1,
    overshootClamping: true,
  });

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => {
      return (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={-0.5}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      );
    },
    []
  );

  const renderBackground = useCallback(
    ({ style }: BottomSheetBackgroundProps) => (
      <View
        pointerEvents="none"
        style={[
          style,
          styles.roundedTop,
          {
            backgroundColor: isDark ? '#121212' : '#FAF8F6',
            bottom: -600,
          },
        ]}
      />
    ),
    [isDark]
  );

  const isValid = isSaveEnabled;

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        topInset={insets.top}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundComponent={renderBackground}
        animationConfigs={animationConfigs}
        handleStyle={styles.handleContainer}
        handleIndicatorStyle={[
          styles.dragHandle,
          isDark ? styles.dragHandleDark : styles.dragHandleLight,
        ]}
        onDismiss={() => {
          Keyboard.dismiss();
          setIsPresented(false);
          onDismiss?.();
        }}
      >
        <BottomSheetScrollView
          ref={scrollViewRef}
          style={{ backgroundColor: isDark ? '#121212' : '#FAF8F6' }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 12) + 10 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header: Center-aligned Title only */}
          <Text style={[styles.sheetTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            Add Question Details
          </Text>

          {/* Common: Question Title Box */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
              Question Title
            </Text>
            <BottomSheetTextInput
              key={`title-${selectedType}`}
              defaultValue={currentDraft.title}
              onChangeText={(text) => {
                updateActiveDraftField('title', text);
              }}
              placeholder={getTitlePlaceholder(selectedType)}
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              maxLength={200}
              style={[
                styles.titleInput,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  color: isDark ? '#ffffff' : '#111827',
                },
              ]}
            />

            {/* Yes/No Helper Text */}
            {selectedType === 'boolean' && (
              <Text style={[styles.helperText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                This will appear as a simple toggle switch in your journal.
              </Text>
            )}
          </View>

          {/* 1 & 3: Multi-Select / Single Choice Specific UI */}
          {(selectedType === 'multi_select' || selectedType === 'single_choice') && (
            <View style={styles.sectionBlock}>
              <View style={styles.stepsContainer}>
                {currentDraft.options.map((opt, idx) => (
                  <View key={`opt-wrap-${idx}`} style={styles.stepWrapper}>
                    <Text style={[styles.optionLabel, { color: isDark ? '#a1a1aa' : '#9ca3af' }]}>
                      Option {idx + 1}
                    </Text>

                    <BottomSheetTextInput
                      key={`opt-${selectedType}-${idx}`}
                      defaultValue={opt}
                      onChangeText={(text) => {
                        if (!selectedType) return;
                        draftsRef.current[selectedType].options[idx] = text;
                        const valid = checkFormValid();
                        setIsSaveEnabled((prev) => (prev !== valid ? valid : prev));
                      }}
                      placeholder="Enter option..."
                      placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                      maxLength={125}
                      style={[
                        styles.titleInput,
                        {
                          backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                          borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                          color: isDark ? '#ffffff' : '#111827',
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* + Add Option Button */}
              <Pressable
                onPress={() => {
                  if (!selectedType) return;
                  draftsRef.current[selectedType].options.push('');
                  setDraftsVersion((v) => v + 1);
                }}
                style={({ pressed }) => [
                  styles.addOptionBtn,
                  {
                    backgroundColor: pressed
                      ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                      : (isDark ? '#1c1c20' : '#ffffff'),
                    borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  }
                ]}
              >
                <PlusCircle size={18} color={isDark ? '#e4e4e7' : '#18181b'} strokeWidth={2} />
                <Text style={[styles.addOptionBtnText, { color: isDark ? '#e4e4e7' : '#18181b' }]}>
                  Add Option
                </Text>
              </Pressable>
            </View>
          )}


          {/* 4: Text / Notes Builder Specific UI */}
          {selectedType === 'text' && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                What should the placeholder say?
              </Text>
              <Text style={[styles.helperText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                This text will appear inside the text area when the user is actually logging their journal.
              </Text>
              <BottomSheetTextInput
                key={`placeholder-${selectedType}`}
                defaultValue={currentDraft.placeholderText}
                onChangeText={(text) => updateActiveDraftField('placeholderText', text)}
                placeholder="e.g., Describe your skin..."
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                    borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                    color: isDark ? '#ffffff' : '#111827',
                  },
                ]}
              />
            </View>
          )}

          {/* 5: Scale (1-5) Builder Specific UI */}
          {selectedType === 'scale' && (
            <View style={styles.sectionBlock}>
              {/* Range Selector */}
              <Text style={[styles.sectionHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                Scale Range
              </Text>
              <View style={styles.segmentedContainer}>
                {(['1-3', '1-5', '1-10'] as const).map((rng) => {
                  const isSelected = currentDraft.scaleRange === rng;
                  return (
                    <Pressable
                      key={rng}
                      onPress={() => {
                        updateActiveDraftField('scaleRange', rng);
                        setDraftsVersion((v) => v + 1);
                      }}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor: isSelected 
                            ? primaryColor 
                            : (isDark ? '#1c1c20' : '#ffffff'),
                          borderColor: isSelected 
                            ? primaryColor 
                            : (isDark ? '#2b2b30' : '#e5e7eb'),
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.segmentBtnText, 
                          { color: isSelected ? '#ffffff' : (isDark ? '#a1a1aa' : '#6b7280') }
                        ]}
                      >
                        [{rng}]
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Low Label Input */}
              <View style={{ gap: 6, marginTop: 10 }}>
                <Text style={[styles.inputSubHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Lowest Value Label
                </Text>
                <BottomSheetTextInput
                  key={`lowLabel-${selectedType}`}
                  defaultValue={currentDraft.lowLabel}
                  onChangeText={(text) => updateActiveDraftField('lowLabel', text)}
                  placeholder="e.g., Not stressed, Calm, None"
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                      borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                      color: isDark ? '#ffffff' : '#111827',
                    },
                  ]}
                />
              </View>

              {/* High Label Input */}
              <View style={{ gap: 6, marginTop: 10 }}>
                <Text style={[styles.inputSubHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Highest Value Label
                </Text>
                <BottomSheetTextInput
                  key={`highLabel-${selectedType}`}
                  defaultValue={currentDraft.highLabel}
                  onChangeText={(text) => updateActiveDraftField('highLabel', text)}
                  placeholder="e.g., Extremely stressed, Severe, High"
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                      borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                      color: isDark ? '#ffffff' : '#111827',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* 6: Numeric Builder Specific UI */}
          {selectedType === 'numeric' && (
            <View style={styles.sectionBlock}>
              {/* Unit Input */}
              <Text style={[styles.sectionHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                Measurement Unit
              </Text>
              <BottomSheetTextInput
                key={`unit-${selectedType}`}
                defaultValue={currentDraft.unit}
                onChangeText={(text) => updateActiveDraftField('unit', text)}
                placeholder="e.g., glasses, liters, hours, mg"
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                    borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                    color: isDark ? '#ffffff' : '#111827',
                  },
                ]}
              />

              {/* Keyboard Type Toggle */}
              <View style={{ gap: 8, marginTop: 10 }}>
                <Text style={[styles.sectionHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Allowed Number Type
                </Text>
                <View style={styles.segmentedContainer}>
                  <Pressable
                    onPress={() => {
                      updateActiveDraftField('numberType', 'whole');
                      setDraftsVersion((v) => v + 1);
                    }}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: currentDraft.numberType === 'whole' 
                          ? primaryColor 
                          : (isDark ? '#1c1c20' : '#ffffff'),
                        borderColor: currentDraft.numberType === 'whole' 
                          ? primaryColor 
                          : (isDark ? '#2b2b30' : '#e5e7eb'),
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.segmentBtnText, 
                        { color: currentDraft.numberType === 'whole' ? '#ffffff' : (isDark ? '#a1a1aa' : '#6b7280') }
                      ]}
                    >
                      Whole Numbers
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      updateActiveDraftField('numberType', 'decimal');
                      setDraftsVersion((v) => v + 1);
                    }}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: currentDraft.numberType === 'decimal' 
                          ? primaryColor 
                          : (isDark ? '#1c1c20' : '#ffffff'),
                        borderColor: currentDraft.numberType === 'decimal' 
                          ? primaryColor 
                          : (isDark ? '#2b2b30' : '#e5e7eb'),
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.segmentBtnText, 
                        { color: currentDraft.numberType === 'decimal' ? '#ffffff' : (isDark ? '#a1a1aa' : '#6b7280') }
                      ]}
                    >
                      Decimals
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Save Button (tight spacing matching BadFeedbackSheet) */}
          <Pressable
            disabled={!isValid}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: !isValid 
                  ? (isDark ? '#2c2c30' : '#d1d5db') 
                  : (pressed ? '#a98fcc' : primaryColor),
              },
            ]}
          >
            <Text style={styles.saveButtonText}>Save Question</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>



    </>
  );
});

export default AddJournalQuestionDetailsSheet;

const styles = StyleSheet.create({
  roundedTop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bgLight: {
    backgroundColor: '#FAF8F6',
  },
  bgDark: {
    backgroundColor: '#121212',
  },
  handleContainer: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 52,
    height: 6,
    borderRadius: 999,
  },
  dragHandleLight: {
    backgroundColor: '#d1d5db',
  },
  dragHandleDark: {
    backgroundColor: '#3f3f46',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10, // Matching BadFeedbackSheet tight 10px bottom padding
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionBlock: {
    gap: 6,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  inputSubHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 2,
  },
  titleInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    height: 48,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },

  /* Option styles matching reference screenshot */
  stepsContainer: {
    gap: 8,
  },
  stepWrapper: {
    gap: 3,
  },
  optionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  textSubLight: {
    color: '#6b7280',
  },
  textSubDark: {
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
    marginTop: 4,
  },
  addOptionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  segmentedContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 999, // Matching BadFeedbackSheet button shape
    marginTop: 2,
    marginBottom: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
