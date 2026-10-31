import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { Text, TitleText, SubtitleText, BodyText, ButtonText, CaptionText } from '@/components/AppText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  ChevronLeft,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useJournalStore } from '@/store/journalStore';

// Helper context-specific placeholder across all 6 data types
function getTitlePlaceholder(selectedType: string | undefined) {
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

export default function EditYourQuestionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const primaryColor = Colors.light.primary;

  const updateQuestion = useJournalStore((state) => state.updateQuestion);
  const hasTodayAnswerForQuestion = useJournalStore((state) => state.hasTodayAnswerForQuestion);
  const clearTodayAnswerForQuestion = useJournalStore((state) => state.clearTodayAnswerForQuestion);
  const setPendingReanswerKey = useJournalStore((state) => state.setPendingReanswerKey);

  const params = useLocalSearchParams<{
    key?: string;
    subtitle?: string;
    options?: string;
    dataType?: string;
    placeholderText?: string;
    scaleRange?: string;
    stepLabels?: string;
    unit?: string;
    stepSize?: string;
    maxValue?: string;
  }>();

  // Initial values
  const initialTitle = params.subtitle || 'How was your skin today?';
  const rawOptions = React.useMemo(() => {
    if (params.options) {
      try {
        const decoded = JSON.parse(params.options);
        if (Array.isArray(decoded) && decoded.length > 0) {
          return decoded.map((o: any) => (typeof o === 'string' ? o : o.label || o.value || ''));
        }
      } catch (e) {
        // fallback
      }
    }
    return [
      'Morning & evening routine',
      'Morning routine only',
      'Evening routine only',
      'Morning, evening & night routine',
      'No - Skipped routine today',
    ];
  }, [params.options]);

  // Detect data type
  const dataType = React.useMemo(() => {
    if (params.dataType) return params.dataType;
    // Heuristic fallback for preexisting questions
    if (
      rawOptions.length === 2 &&
      rawOptions[0]?.toLowerCase() === 'yes' &&
      rawOptions[1]?.toLowerCase() === 'no'
    ) {
      return 'boolean';
    }
    return 'multi_select';
  }, [params.dataType, rawOptions]);

  const [questionTitle, setQuestionTitle] = useState(initialTitle);
  const [options, setOptions] = useState<string[]>(rawOptions);

  // Text specific
  const [placeholderText, setPlaceholderText] = useState(params.placeholderText || '');

  // Scale specific
  const initialScaleRange = (params.scaleRange as '1-3' | '1-5' | '1-10') || '1-5';
  const [scaleRange, setScaleRange] = useState<'1-3' | '1-5' | '1-10'>(initialScaleRange);
  const parsedStepLabels = React.useMemo(() => {
    if (params.stepLabels) {
      try {
        const parsed = JSON.parse(params.stepLabels);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    const count = initialScaleRange === '1-3' ? 3 : initialScaleRange === '1-5' ? 5 : 10;
    return Array.from({ length: count }, () => '');
  }, [params.stepLabels, initialScaleRange]);
  const [stepLabels, setStepLabels] = useState<string[]>(parsedStepLabels);

  // Numeric specific
  const [unit, setUnit] = useState(params.unit || '');
  const [stepSize, setStepSize] = useState<number>(params.stepSize ? parseFloat(params.stepSize) || 1 : 1);
  const [maxValue, setMaxValue] = useState(params.maxValue || '');

  // Track if any changes have been made
  const hasChanges =
    questionTitle !== initialTitle ||
    (dataType === 'text' && placeholderText !== (params.placeholderText || '')) ||
    (dataType === 'scale' &&
      (scaleRange !== initialScaleRange ||
        stepLabels.some((l, i) => l !== (parsedStepLabels[i] || '')))) ||
    (dataType === 'numeric' &&
      (unit !== (params.unit || '') ||
        stepSize !== (params.stepSize ? parseFloat(params.stepSize) || 1 : 1) ||
        maxValue !== (params.maxValue || ''))) ||
    ((dataType === 'multi_select' || dataType === 'single_choice') &&
      (options.length !== rawOptions.length || options.some((opt, i) => opt !== rawOptions[i])));

  // Modal State for Adding or Editing an Option (Multi-select / Single Choice)
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // null = adding, number = editing
  const [modalOptionText, setModalOptionText] = useState('');
  const modalInputRef = useRef<TextInput>(null);

  // Delete Option Confirmation Modal State
  const [optionToDelete, setOptionToDelete] = useState<number | null>(null);

  // Save changes confirmation modal state (Scenario A: already answered today)
  const [savePromptVisible, setSavePromptVisible] = useState(false);
  const [selectedSaveOption, setSelectedSaveOption] = useState<'reset' | 'keep' | null>(null);
  const hasTodayAnswer = React.useMemo(() => {
    return params.key ? hasTodayAnswerForQuestion(params.key) : false;
  }, [params.key, hasTodayAnswerForQuestion]);

  // Scale range change confirmation modal state
  const [scaleWarningTarget, setScaleWarningTarget] = useState<'1-3' | '1-5' | '1-10' | null>(null);

  const applyScaleRangeSwitch = (targetRng: '1-3' | '1-5' | '1-10') => {
    const targetCount = targetRng === '1-3' ? 3 : targetRng === '1-5' ? 5 : 10;
    // Keep filled labels packed into the target slots:
    const filledLabels = stepLabels.filter((l) => l.trim().length > 0);
    const newLabels = Array.from({ length: targetCount }, (_, i) => filledLabels[i] || '');
    setScaleRange(targetRng);
    setStepLabels(newLabels);
    setScaleWarningTarget(null);
  };

  const handleScaleRangePress = (targetRng: '1-3' | '1-5' | '1-10') => {
    if (targetRng === scaleRange) return;
    const currentCount = scaleRange === '1-3' ? 3 : scaleRange === '1-5' ? 5 : 10;
    const targetCount = targetRng === '1-3' ? 3 : targetRng === '1-5' ? 5 : 10;

    // If decreasing size and there are filled options that would be truncated:
    if (targetCount < currentCount) {
      const filledLabels = stepLabels.filter((l) => l.trim().length > 0);
      if (filledLabels.length > targetCount) {
        setScaleWarningTarget(targetRng);
        return;
      }
    }

    applyScaleRangeSwitch(targetRng);
  };

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setModalOptionText('');
    setOptionModalVisible(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingIndex(index);
    setModalOptionText(options[index] || '');
    setOptionModalVisible(true);
  };

  const handleSaveModalOption = () => {
    const trimmed = modalOptionText.trim();
    if (!trimmed) return;

    if (editingIndex === null) {
      setOptions((prev) => [...prev, trimmed]);
    } else {
      setOptions((prev) => {
        const next = [...prev];
        next[editingIndex] = trimmed;
        return next;
      });
    }

    setOptionModalVisible(false);
    setModalOptionText('');
    setEditingIndex(null);
  };

  const promptDeleteOption = (index: number) => {
    setOptionToDelete(index);
  };

  const handleConfirmDeleteOption = () => {
    if (optionToDelete === null) return;
    setOptions((prev) => prev.filter((_, i) => i !== optionToDelete));
    setOptionToDelete(null);
  };

  const executeSaveQuestion = () => {
    if (!params.key) return;

    let finalOptions: string[] = options;

    if (dataType === 'boolean') {
      finalOptions = ['Yes', 'No'];
    } else if (dataType === 'scale') {
      const count = scaleRange === '1-3' ? 3 : scaleRange === '1-5' ? 5 : 10;
      finalOptions = Array.from({ length: count }, (_, i) => {
        const stepNum = i + 1;
        const custom = stepLabels[i]?.trim();
        return custom ? `${stepNum} - ${custom}` : `${stepNum}`;
      });
    } else if (dataType === 'numeric') {
      const unitStr = unit.trim() ? ` ${unit.trim()}` : '';
      const step = stepSize || 1;
      const parsedMax = parseFloat(maxValue);
      const limit = !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : step * 5;
      finalOptions = [
        `0${unitStr}`,
        `${step}${unitStr}`,
        `${step * 2}${unitStr}`,
        `${limit}${unitStr}+`,
      ];
    } else if (dataType === 'text') {
      finalOptions = [placeholderText.trim() || 'Notes logged'];
    }

    updateQuestion(params.key, questionTitle.trim(), finalOptions, {
      dataType: dataType as any,
      placeholderText,
      scaleRange,
      stepLabels,
      unit,
      stepSize,
      maxValue,
    });
  };

  const handleSavePress = () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    // Check if user has already answered this question today
    if (hasTodayAnswer) {
      // Scenario A: Answered today -> prompt popup with Keep vs. Reset options (none selected by default)
      setSelectedSaveOption(null);
      setSavePromptVisible(true);
    } else {
      // Scenario B: Has not answered today yet -> save and go back directly
      executeSaveQuestion();
      router.back();
    }
  };

  const handleKeepTodayAnswer = () => {
    setSavePromptVisible(false);
    executeSaveQuestion();
    router.back();
  };

  const handleResetTodayAnswer = () => {
    setSavePromptVisible(false);
    executeSaveQuestion();
    if (params.key) {
      clearTodayAnswerForQuestion(params.key);
      setPendingReanswerKey(params.key);
    }
    router.back();
  };

  const handleContinueFromSavePrompt = () => {
    if (selectedSaveOption === 'reset') {
      handleResetTodayAnswer();
    } else if (selectedSaveOption === 'keep') {
      handleKeepTodayAnswer();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}
    >
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 6,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
        </Pressable>

        <SubtitleText style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
          Edit Your Question
        </SubtitleText>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section 1: Question Title */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
            Question Title
          </Text>
          <TextInput
            defaultValue={questionTitle}
            onChangeText={setQuestionTitle}
            placeholder={getTitlePlaceholder(dataType)}
            placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
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

        {/* Section 2: TYPE-SPECIFIC EDITING */}

        {/* 1 & 3: Multi-Select / Single Choice */}
        {(dataType === 'multi_select' || dataType === 'single_choice') && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
                Options
              </Text>
              <Text style={[styles.sectionSubCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                {options.length} options
              </Text>
            </View>

            <View style={styles.optionsList}>
              {options.map((opt, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                      borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optionIndexBadge,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionIndexText,
                        { color: isDark ? '#d4d4d8' : '#71717a' },
                      ]}
                    >
                      {idx + 1}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.optionTitleText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {opt}
                  </Text>

                  <View style={styles.optionActionsRow}>
                    <Pressable
                      onPress={() => handleOpenEditModal(idx)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.actionIconButton,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5',
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Pencil size={15} color={isDark ? '#e4e4e7' : '#52525b'} strokeWidth={2} />
                    </Pressable>

                    {options.length > 2 && (
                      <Pressable
                        onPress={() => promptDeleteOption(idx)}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.actionIconButton,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5',
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Trash2 size={15} color={isDark ? '#a1a1aa' : '#71717a'} strokeWidth={2} />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 2: Yes / No (Read-only options, no edit/delete icons) */}
        {dataType === 'boolean' && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
              Response Options
            </Text>
            <Text style={[styles.helperInfoText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
              Yes and No options are fixed and cannot be edited or deleted.
            </Text>
            <View style={styles.optionsList}>
              {['Yes', 'No'].map((opt, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                      borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optionIndexBadge,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f4f4f5' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionIndexText,
                        { color: isDark ? '#d4d4d8' : '#71717a' },
                      ]}
                    >
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionTitleText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    {opt}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 4: Text / Notes */}
        {dataType === 'text' && (
          <View style={styles.section}>
            <View style={{ gap: 2 }}>
              <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
                Placeholder Text
              </Text>
              <Text style={[styles.helperInfoText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                This hint appears inside the text area when the user logs their journal.
              </Text>
            </View>
            <TextInput
              defaultValue={placeholderText}
              onChangeText={setPlaceholderText}
              placeholder="e.g., Describe your skin..."
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              maxLength={50}
              style={[
                styles.titleInput,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  color: isDark ? '#ffffff' : '#111827',
                  minHeight: 48,
                  paddingTop: 14,
                  paddingBottom: 14,
                },
              ]}
            />
          </View>
        )}

        {/* 5: Scale */}
        {dataType === 'scale' && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
              Scale Range
            </Text>
            <View style={styles.segmentedContainer}>
              {(['1-3', '1-5', '1-10'] as const).map((rng) => {
                const isSelected = scaleRange === rng;
                return (
                  <Pressable
                    key={rng}
                    onPress={() => handleScaleRangePress(rng)}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected
                          ? primaryColor
                          : isDark
                          ? '#1c1c20'
                          : '#ffffff',
                        borderColor: isSelected
                          ? primaryColor
                          : isDark
                          ? '#2b2b30'
                          : '#e5e7eb',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: isSelected ? '#ffffff' : isDark ? '#a1a1aa' : '#6b7280' },
                      ]}
                    >
                      {rng}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827', marginTop: 12 }]}>
              Step Labels
            </Text>
            <View style={{ gap: 8 }}>
              {stepLabels.map((lbl, idx) => {
                const stepNum = idx + 1;
                const placeholder =
                  idx === 0
                    ? 'e.g., None, No stress, Very low'
                    : idx === stepLabels.length - 1
                    ? 'e.g., Extreme, Severe, Very high'
                    : 'e.g., Moderate';
                return (
                  <View key={`step-${scaleRange}-${idx}`} style={styles.stepLabelRow}>
                    <View
                      style={[
                        styles.stepNumberChip,
                        { backgroundColor: isDark ? '#2b2b30' : '#f0f0f5' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepNumberText,
                          { color: isDark ? '#a1a1aa' : '#6b7280' },
                        ]}
                      >
                        {stepNum}
                      </Text>
                    </View>
                    <TextInput
                      key={`step-input-${scaleRange}-${idx}`}
                      defaultValue={lbl}
                      onChangeText={(txt) => {
                        setStepLabels((prev) => {
                          const next = [...prev];
                          next[idx] = txt;
                          return next;
                        });
                      }}
                      placeholder={placeholder}
                      placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                      maxLength={100}
                      style={[
                        styles.titleInput,
                        {
                          backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                          borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                          color: isDark ? '#ffffff' : '#111827',
                          flex: 1,
                          minHeight: 48,
                          paddingTop: 12,
                          paddingBottom: 12,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 6: Numeric */}
        {dataType === 'numeric' && (
          <View style={styles.section}>
            {/* Count Interval */}
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827' }]}>
              Count Interval
            </Text>
            <Text style={[styles.helperInfoText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
              How much each + or − tap moves the number.
            </Text>
            <TextInput
              defaultValue={String(stepSize)}
              onChangeText={(text) => {
                const parsed = parseFloat(text);
                if (!isNaN(parsed) && parsed > 0) setStepSize(parsed);
              }}
              placeholder="e.g., 0.5, 1, 5"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              keyboardType="numeric"
              maxLength={8}
              style={[
                styles.titleInput,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  color: isDark ? '#ffffff' : '#111827',
                  minHeight: 48,
                  paddingTop: 12,
                  paddingBottom: 12,
                },
              ]}
            />
            <View style={[styles.segmentedContainer, { flexWrap: 'wrap', marginTop: 4 }]}>
              {([0.5, 1, 2, 5, 10] as const).map((step) => {
                const isSelected = stepSize === step;
                return (
                  <Pressable
                    key={`step-${step}`}
                    onPress={() => setStepSize(step)}
                    style={[
                      styles.stepChipBtn,
                      {
                        backgroundColor: isSelected
                          ? primaryColor
                          : isDark
                          ? '#1c1c20'
                          : '#ffffff',
                        borderColor: isSelected
                          ? primaryColor
                          : isDark
                          ? '#2b2b30'
                          : '#e5e7eb',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: isSelected ? '#ffffff' : isDark ? '#a1a1aa' : '#6b7280' },
                      ]}
                    >
                      {step}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Unit Label */}
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827', marginTop: 12 }]}>
              Unit Label <Text style={{ fontSize: 13, fontWeight: '500' }}>(optional)</Text>
            </Text>
            <TextInput
              defaultValue={unit}
              onChangeText={setUnit}
              placeholder="e.g., glasses, hrs, mg, km"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              maxLength={10}
              style={[
                styles.titleInput,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  color: isDark ? '#ffffff' : '#111827',
                  minHeight: 48,
                  paddingTop: 12,
                  paddingBottom: 12,
                },
              ]}
            />

            {/* Max Value */}
            <Text style={[styles.sectionLabel, { color: isDark ? '#ffffff' : '#111827', marginTop: 12 }]}>
              Max Value <Text style={{ fontSize: 13, fontWeight: '500' }}>(optional)</Text>
            </Text>
            <TextInput
              defaultValue={maxValue}
              onChangeText={(text) => setMaxValue(text.replace(/[^0-9.]/g, ''))}
              placeholder="e.g., 20, 24, 100"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              keyboardType="numeric"
              maxLength={10}
              style={[
                styles.titleInput,
                {
                  backgroundColor: isDark ? '#1c1c20' : '#ffffff',
                  borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  color: isDark ? '#ffffff' : '#111827',
                  minHeight: 48,
                  paddingTop: 12,
                  paddingBottom: 12,
                },
              ]}
            />
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        pointerEvents="box-none"
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {hasChanges ? (
          dataType === 'multi_select' || dataType === 'single_choice' ? (
            /* 50/50 Layout: Add Option on left, Save Changes on right */
            <View style={styles.splitBottomRow}>
              {options.length < 99 && (
                <Pressable
                  onPress={handleOpenAddModal}
                  style={({ pressed }) => [
                    styles.pillButton,
                    styles.splitButton,
                    {
                      backgroundColor: pressed
                        ? (isDark ? '#27272a' : '#f0f0f2')
                        : (isDark ? '#1c1c1e' : '#ffffff'),
                      borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <PlusCircle size={18} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
                  <ButtonText
                    style={[
                      styles.pillButtonText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    Add Option
                  </ButtonText>
                </Pressable>
              )}

              <Pressable
                onPress={handleSavePress}
                style={({ pressed }) => [
                  styles.pillButton,
                  options.length < 99 ? styles.splitButton : styles.fullWidthButton,
                  {
                    backgroundColor: primaryColor,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <ButtonText style={[styles.pillButtonText, { color: '#ffffff' }]}>
                  Save Changes
                </ButtonText>
              </Pressable>
            </View>
          ) : (
            /* Full width Save Changes for boolean, text, scale, numeric */
            <Pressable
              onPress={handleSavePress}
              style={({ pressed }) => [
                styles.pillButton,
                styles.fullWidthButton,
                {
                  backgroundColor: primaryColor,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <ButtonText style={[styles.pillButtonText, { color: '#ffffff' }]}>
                Save Changes
              </ButtonText>
            </Pressable>
          )
        ) : dataType === 'multi_select' || dataType === 'single_choice' ? (
          /* Default: Full Width Add Option Pill — hidden at 99 options */
          options.length < 99 ? (
            <Pressable
              onPress={handleOpenAddModal}
              style={({ pressed }) => [
                styles.pillButton,
                styles.fullWidthButton,
                {
                  backgroundColor: pressed
                    ? (isDark ? '#27272a' : '#f0f0f2')
                    : (isDark ? '#1c1c1e' : '#ffffff'),
                  borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                  borderWidth: 1.5,
                },
              ]}
            >
              <PlusCircle size={20} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.2} />
              <ButtonText
                style={[
                  styles.pillButtonText,
                  { color: isDark ? '#ffffff' : '#111827' },
                ]}
              >
                Add Option
              </ButtonText>
            </Pressable>
          ) : null
        ) : (
          /* Disabled Save Changes pill when no changes */
          <View
            style={[
              styles.pillButton,
              styles.fullWidthButton,
              {
                backgroundColor: isDark ? '#27272a' : '#e5e7eb',
                opacity: 0.7,
              },
            ]}
          >
            <ButtonText
              style={[
                styles.pillButtonText,
                { color: isDark ? '#71717a' : '#9ca3af' },
              ]}
            >
              Save Changes
            </ButtonText>
          </View>
        )}
      </View>

      {/* Edit / Add Option Modal */}
      <Modal
        visible={optionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.optionModalCard,
                {
                  backgroundColor: isDark ? '#121212' : '#f5f5f7',
                  borderColor: isDark ? '#27272a' : '#e5e7eb',
                },
              ]}
            >
              {/* Modal Top Header with clean spacing */}
              <View style={[styles.modalHeader, { justifyContent: 'center' }]}>
                <SubtitleText style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#111827', textAlign: 'center' }]}>
                  {editingIndex !== null ? `Edit option ${editingIndex + 1}` : `Add option ${options.length + 1}`}
                </SubtitleText>
              </View>

              {/* Text Area for Option */}
              <Pressable
                onPress={() => modalInputRef.current?.focus()}
                style={[
                  styles.modalInputWrapper,
                  {
                    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                    borderColor: isDark ? '#2b2b30' : '#e5e7eb',
                  },
                ]}
              >
                <TextInput
                  ref={modalInputRef}
                  key={`edit-opt-${editingIndex !== null ? editingIndex : 'new'}`}
                  defaultValue={modalOptionText}
                  onChangeText={setModalOptionText}
                  placeholder="Enter your option..."
                  placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                  maxLength={125}
                  style={[
                    styles.modalTextInput,
                    {
                      color: isDark ? '#ffffff' : '#111827',
                    },
                  ]}
                  multiline
                  autoFocus
                  textAlignVertical="top"
                />
              </Pressable>

              {/* Modal Save Button */}
              <Pressable
                onPress={handleSaveModalOption}
                disabled={!modalOptionText.trim()}
                style={({ pressed }) => [
                  styles.modalSaveBtn,
                  {
                    backgroundColor: modalOptionText.trim()
                      ? primaryColor
                      : isDark
                      ? '#27272a'
                      : '#e5e7eb',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <ButtonText
                  style={[
                    styles.modalSaveBtnText,
                    {
                      color: modalOptionText.trim()
                        ? '#ffffff'
                        : isDark
                        ? '#71717a'
                        : '#9ca3af',
                    },
                  ]}
                >
                  {editingIndex !== null ? 'Update Option' : 'Add Option'}
                </ButtonText>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Option Delete Confirmation Modal with Warning Sign */}
      <Modal
        visible={optionToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionToDelete(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionToDelete(null)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.confirmDeleteCard,
                isDark ? styles.confirmDeleteCardDark : styles.confirmDeleteCardLight,
              ]}
            >
              <View style={[styles.confirmDeleteIconWrapper, isDark ? { backgroundColor: '#3f1f1f' } : { backgroundColor: '#fee2e2' }]}>
                <AlertTriangle size={28} color="#ef4444" strokeWidth={2.4} />
              </View>
              <SubtitleText style={[styles.confirmDeleteTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Delete Option?
              </SubtitleText>
              <BodyText
                style={[
                  styles.confirmDeleteSubtitle,
                  { color: isDark ? '#a1a1aa' : '#4b5563' },
                ]}
              >
                Do you really want to delete this option? You cannot undo this.
              </BodyText>
              <View style={styles.confirmDeleteActionsRow}>
                <Pressable
                  onPress={() => setOptionToDelete(null)}
                  style={({ pressed }) => [
                    styles.confirmCancelBtn,
                    isDark ? styles.confirmCancelBtnDark : styles.confirmCancelBtnLight,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <ButtonText
                    style={[
                      styles.confirmCancelText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    Cancel
                  </ButtonText>
                </Pressable>
                <Pressable
                  onPress={handleConfirmDeleteOption}
                  style={({ pressed }) => [
                    styles.confirmDeleteBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <ButtonText style={styles.confirmDeleteText}>Delete</ButtonText>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Scale Range Change Confirmation Modal with Warning Sign */}
      <Modal
        visible={scaleWarningTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setScaleWarningTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setScaleWarningTarget(null)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.confirmDeleteCard,
                isDark ? styles.confirmDeleteCardDark : styles.confirmDeleteCardLight,
              ]}
            >
              <View style={[styles.confirmDeleteIconWrapper, isDark ? { backgroundColor: '#3f1f1f' } : { backgroundColor: '#fee2e2' }]}>
                <AlertTriangle size={28} color="#ef4444" strokeWidth={2.4} />
              </View>
              <SubtitleText style={[styles.confirmDeleteTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Change Scale Range?
              </SubtitleText>
              <BodyText
                style={[
                  styles.confirmDeleteSubtitle,
                  { color: isDark ? '#a1a1aa' : '#4b5563' },
                ]}
              >
                Switching to {scaleWarningTarget} will delete the extra options beyond step{' '}
                {scaleWarningTarget === '1-3' ? 3 : 5}. Are you sure you want to continue?
              </BodyText>
              <View style={styles.confirmDeleteActionsRow}>
                <Pressable
                  onPress={() => setScaleWarningTarget(null)}
                  style={({ pressed }) => [
                    styles.confirmCancelBtn,
                    isDark ? styles.confirmCancelBtnDark : styles.confirmCancelBtnLight,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <ButtonText
                    style={[
                      styles.confirmCancelText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    Cancel
                  </ButtonText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (scaleWarningTarget) {
                      applyScaleRangeSwitch(scaleWarningTarget);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.confirmDeleteBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <ButtonText style={styles.confirmDeleteText}>Continue</ButtonText>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Save Changes Confirmation Modal (Scenario A: Answered Today) */}
      <Modal
        visible={savePromptVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSavePromptVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSavePromptVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.savePromptCard,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <View style={styles.savePromptHeader}>
                <View
                  style={[
                    styles.savePromptIconBadge,
                    {
                      backgroundColor: isDark ? 'rgba(124, 58, 237, 0.18)' : 'rgba(124, 58, 237, 0.1)',
                      borderColor: primaryColor,
                    },
                  ]}
                >
                  <RotateCcw size={22} color={primaryColor} strokeWidth={2.4} />
                </View>
                <SubtitleText style={[styles.savePromptTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                  You've Already Logged Today
                </SubtitleText>
                <BodyText style={[styles.savePromptSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                  You already answered this question in today’s check-in. How would you like to handle today’s entry?
                </BodyText>
              </View>

              <View style={styles.savePromptOptionsContainer}>
                {/* Option 1: Reset & re-answer */}
                <Pressable
                  onPress={() => setSelectedSaveOption(prev => prev === 'reset' ? null : 'reset')}
                  style={({ pressed }) => [
                    styles.savePromptOptionBtn,
                    selectedSaveOption === 'reset'
                      ? {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                          borderWidth: 1.5,
                        }
                      : {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                          borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                          borderWidth: 1,
                        },
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={styles.savePromptOptionRow}>
                    <View style={styles.savePromptOptionTextCol}>
                      <SubtitleText
                        style={[
                          styles.savePromptOptionTitle,
                          {
                            color:
                              selectedSaveOption === 'reset'
                                ? '#ffffff'
                                : isDark
                                ? '#ffffff'
                                : '#111827',
                          },
                        ]}
                      >
                        Reset & re-answer now
                      </SubtitleText>
                      <BodyText
                        style={[
                          styles.savePromptOptionDesc,
                          {
                            color:
                              selectedSaveOption === 'reset'
                                ? 'rgba(255,255,255,0.85)'
                                : isDark
                                ? '#a1a1aa'
                                : '#6b7280',
                          },
                        ]}
                      >
                        Clears today’s answer and opens the updated question so you can pick your new response right away.
                      </BodyText>
                    </View>
                  </View>
                </Pressable>

                {/* Option 2: Keep today's answer */}
                <Pressable
                  onPress={() => setSelectedSaveOption(prev => prev === 'keep' ? null : 'keep')}
                  style={({ pressed }) => [
                    styles.savePromptOptionBtn,
                    selectedSaveOption === 'keep'
                      ? {
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                          borderWidth: 1.5,
                        }
                      : {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                          borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                          borderWidth: 1,
                        },
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={styles.savePromptOptionRow}>
                    <View style={styles.savePromptOptionTextCol}>
                      <SubtitleText
                        style={[
                          styles.savePromptOptionTitle,
                          {
                            color:
                              selectedSaveOption === 'keep'
                                ? '#ffffff'
                                : isDark
                                ? '#ffffff'
                                : '#111827',
                          },
                        ]}
                      >
                        Keep today's answer
                      </SubtitleText>
                      <BodyText
                        style={[
                          styles.savePromptOptionDesc,
                          {
                            color:
                              selectedSaveOption === 'keep'
                                ? 'rgba(255,255,255,0.85)'
                                : isDark
                                ? '#a1a1aa'
                                : '#6b7280',
                          },
                        ]}
                      >
                        Preserve your existing log for today. Your edits will apply to future check-ins starting tomorrow.
                      </BodyText>
                    </View>
                  </View>
                </Pressable>
              </View>

              {/* Dynamic Action Button: Full-width Continue Editing (primary color) when unselected; Full-width Continue (primary color) when selected */}
              {selectedSaveOption === null ? (
                <Pressable
                  onPress={() => setSavePromptVisible(false)}
                  style={({ pressed }) => [
                    styles.savePromptFullCancelBtn,
                    {
                      backgroundColor: primaryColor,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <ButtonText style={styles.savePromptFullCancelText}>
                    Continue Editing
                  </ButtonText>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleContinueFromSavePrompt}
                  style={({ pressed }) => [
                    styles.savePromptFullCancelBtn,
                    {
                      backgroundColor: primaryColor,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <ButtonText style={styles.savePromptFullCancelText}>
                    Continue
                  </ButtonText>
                </Pressable>
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 88,
    maxHeight: 125,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    padding: 0,
    flex: 1,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14.5,
    minHeight: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  /* Separate Physical Horizontal Cards for Options */
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionTitleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  optionActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Sticky Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  splitBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999, // Pill-shaped
    overflow: 'hidden',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidthButton: {
    width: '100%',
  },
  splitButton: {
    flex: 1,
  },
  pillButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    paddingTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInputWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    minHeight: 110,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  modalTextInput: {
    flex: 1,
    minHeight: 82,
    fontSize: 14,
    lineHeight: 21,
    padding: 0,
    textAlignVertical: 'top',
  },
  modalSaveBtn: {
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Delete Confirmation Modal (Matches Profile Delete Account Modal UI) */
  confirmDeleteCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  confirmDeleteCardLight: {
    backgroundColor: '#FAF8F6',
    borderColor: '#e5e7eb',
  },
  confirmDeleteCardDark: {
    backgroundColor: '#121212',
    borderColor: '#2b2b30',
  },
  confirmDeleteIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmDeleteTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmDeleteSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  confirmDeleteActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 6,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmCancelBtnLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  confirmCancelBtnDark: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  confirmCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmDeleteText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  helperInfoText: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 18,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
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
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editStepInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  stepChipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePromptCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  savePromptHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  savePromptIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  savePromptTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  savePromptSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  savePromptOptionsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 14,
  },
  savePromptOptionBtn: {
    width: '100%',
    borderRadius: 16,
    padding: 14,
  },
  savePromptOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savePromptOptionTextCol: {
    flex: 1,
  },
  savePromptOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  savePromptOptionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  savePromptCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  savePromptCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  savePromptFullCancelBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savePromptFullCancelText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  savePromptSplitActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  savePromptSplitBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savePromptSplitCancelText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  savePromptSplitConfirmText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
