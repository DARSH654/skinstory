import React, { useRef, useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChevronLeft, Sparkles, Check } from 'lucide-react-native';
import { 
  BottomSheetModal, 
  BottomSheetScrollView, 
  BottomSheetBackdrop, 
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/theme';

interface QuestionDef {
  key: string;
  prefix: string;
  highlight: string;
  subtitle: string;
  options: { label: string; value: string }[];
}

const DAILY_QUESTIONS: QuestionDef[] = [
  {
    key: 'q_stress',
    prefix: 'Stress ',
    highlight: 'Check',
    subtitle: 'How stressed have you been today?',
    options: [
      { label: 'Completely calm & relaxed', value: 'Completely calm & relaxed' },
      { label: 'Mild stress, manageable', value: 'Mild stress, manageable' },
      { label: 'Moderately stressed', value: 'Moderately stressed' },
      { label: 'Quite stressed today', value: 'Quite stressed today' },
      { label: 'Extremely overwhelmed', value: 'Extremely overwhelmed' },
    ],
  },
  {
    key: 'q_water',
    prefix: 'Water ',
    highlight: 'Intake',
    subtitle: 'How much water have you had today?',
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
    options: [
      { label: 'Less than 5 hours', value: 'Less than 5 hours' },
      { label: '5–6 hours, restless', value: '5–6 hours, restless' },
      { label: '6–7 hours, okay', value: '6–7 hours, okay' },
      { label: '7–8 hours, good', value: '7–8 hours, good' },
      { label: '8+ hours, excellent', value: '8+ hours, excellent' },
    ],
  },
  {
    key: 'q_junk',
    prefix: "Today's ",
    highlight: 'Diet',
    subtitle: 'How clean was your diet today?',
    options: [
      { label: 'Ate a lot of junk food', value: 'Ate a lot of junk food' },
      { label: 'Mostly junk, some healthy', value: 'Mostly junk, some healthy' },
      { label: 'Mix of both', value: 'Mix of both' },
      { label: 'Mostly healthy', value: 'Mostly healthy' },
      { label: 'Very clean diet', value: 'Very clean diet' },
    ],
  },
  {
    key: 'q_routine',
    prefix: 'Routine ',
    highlight: 'Compliance',
    subtitle: 'Are you following your skincare routine today?',
    options: [
      { label: 'Morning & evening routine', value: 'Morning & Evening' },
      { label: 'Morning routine only', value: 'Morning' },
      { label: 'Evening routine only', value: 'Evening' },
      { label: 'Morning, evening & night routine', value: 'Morning, Evening & Night' },
      { label: 'No - Skipped routine today', value: 'No' },
    ],
  },
];

export default function DailyJournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Snap point: 68% gives comfortable space so the question + all options + Next button are in full view
  const snapPoints = useMemo(() => ['68%'], []);

  const currentQ = DAILY_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === DAILY_QUESTIONS.length - 1;
  const currentAnswer = answers[currentQ.key] || null;

  const selectAnswer = (qKey: string, val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qKey]: val,
    }));
  };

  const handleNextOrDone = () => {
    if (isLastQuestion) {
      bottomSheetModalRef.current?.dismiss();
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, DAILY_QUESTIONS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const primaryColor = Colors.light.primary;

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          hitSlop={12}
        >
          <ChevronLeft size={22} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
          Daily Journal
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.content}>
        {/* Card with Slide Button */}
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconCircle, isDark ? styles.iconCircleDark : styles.iconCircleLight]}>
              <Sparkles size={20} color={isDark ? '#a855f7' : primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>
                Daily Skin Check
              </Text>
              <Text style={[styles.cardSubtitle, isDark ? styles.textMutedDark : styles.textMutedLight]}>
                {Object.keys(answers).length > 0
                  ? `${Object.keys(answers).length} of ${DAILY_QUESTIONS.length} answered`
                  : 'Tap below to complete your daily check-in.'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => bottomSheetModalRef.current?.present()}
            style={({ pressed }) => [
              styles.slideBtn,
              { backgroundColor: primaryColor, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.slideBtnText}>Slide</Text>
          </Pressable>
        </View>
      </View>

      {/* Slide Modal with Step-by-Step Questions */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        bottomInset={insets.bottom}
        backdropComponent={renderBackdrop}
        handleStyle={styles.handleContainer}
        handleIndicatorStyle={[styles.dragHandle, isDark ? styles.dragHandleDark : styles.dragHandleLight]}
        backgroundStyle={[isDark ? styles.bgDark : styles.bgLight, styles.roundedTop]}
      >
        <BottomSheetScrollView 
          contentContainerStyle={[styles.sheetScrollContent, { paddingBottom: 28 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress / Step header */}
          <View style={styles.stepHeaderRow}>
            <Text style={[styles.stepCounterText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
              {`Question ${currentIndex + 1} of ${DAILY_QUESTIONS.length}`}
            </Text>
            {currentIndex > 0 ? (
              <Pressable 
                onPress={handlePrevious} 
                hitSlop={8}
                style={({ pressed }) => [
                  styles.prevPill,
                  isDark ? styles.prevPillDark : styles.prevPillLight,
                  { opacity: pressed ? 0.75 : 1 }
                ]}
              >
                <Text style={[styles.prevPillText, isDark ? styles.prevTextDark : styles.prevTextLight]}>
                  Previous
                </Text>
              </Pressable>
            ) : (
              <View style={{ height: 28 }} />
            )}
          </View>

          {/* Question Title */}
          <View style={styles.qTitleRow}>
            <Text style={[styles.qPrefix, { color: isDark ? '#ffffff' : '#111827' }]}>
              {currentQ.prefix}
            </Text>
            <View style={styles.highlightWrapper}>
              <View 
                style={[
                  styles.highlightStripe, 
                  { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.45)' : '#d6cbe8' }
                ]} 
              />
              <Text style={[styles.qHighlight, { color: isDark ? '#ffffff' : '#111827' }]}>
                {currentQ.highlight}
              </Text>
            </View>
          </View>

          <Text style={[styles.qSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
            {currentQ.subtitle}
          </Text>

          {/* 3D Option Buttons */}
          <View style={styles.optionsList}>
            {currentQ.options.map((opt) => {
              const isSelected = currentAnswer === opt.value;
              const shadowColor = isSelected
                ? (isDark ? '#4e2d8a' : '#735b9c')
                : (isDark ? 'rgba(255,255,255,0.75)' : '#111111');
              const borderColor = isSelected
                ? (isDark ? '#cdb4f0' : primaryColor)
                : (isDark ? 'rgba(255,255,255,0.75)' : '#111111');
              const faceBg = isSelected
                ? (isDark ? '#937abd' : '#f0ebf8')
                : (isDark ? '#2c2c31' : '#ffffff');
              const textColor = isDark ? '#ffffff' : '#111111';

              return (
                <View key={opt.value} style={styles.optionContainer}>
                  <Pressable 
                    style={styles.optionPressable} 
                    onPress={() => selectAnswer(currentQ.key, opt.value)}
                  >
                    {({ pressed }) => (
                      <>
                        <View style={[styles.optionShadow, { backgroundColor: shadowColor }]} />
                        <View
                          style={[
                            styles.optionMid,
                            {
                              borderColor: shadowColor,
                              top: pressed ? 1 : 1.5,
                              left: pressed ? 1 : 1.5,
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.optionTop,
                            {
                              backgroundColor: faceBg,
                              borderColor: borderColor,
                              top: pressed ? 2 : 0,
                              left: pressed ? 2 : 0,
                            },
                          ]}
                        >
                          <View style={styles.optionRow}>
                            <Text style={[styles.optionText, { color: textColor }]}>
                              {opt.label}
                            </Text>
                            {isSelected && (
                              <Check size={20} color={textColor} strokeWidth={3.5} />
                            )}
                          </View>
                        </View>
                      </>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Next / Done Button — Always visible */}
          <Pressable
            disabled={!currentAnswer}
            onPress={handleNextOrDone}
            style={({ pressed }) => [
              styles.navBtn,
              {
                backgroundColor: currentAnswer ? primaryColor : (isDark ? '#27272a' : '#e5e7eb'),
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text 
              style={[
                styles.navBtnText, 
                { color: currentAnswer ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') }
              ]}
            >
              {isLastQuestion ? 'Done' : 'Next'}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  /* Outer Card */
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleLight: {
    backgroundColor: 'rgba(147, 122, 189, 0.12)',
  },
  iconCircleDark: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  textMutedLight: {
    color: '#6b7280',
  },
  textMutedDark: {
    color: '#a1a1aa',
  },
  slideBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  /* Bottom Sheet Styling */
  roundedTop: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bgLight: { backgroundColor: '#FAF8F6' },
  bgDark: { backgroundColor: '#121212' },
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
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 28,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  /* Previous Pill Button */
  prevPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevPillLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  prevPillDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  prevPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  prevTextLight: {
    color: '#111827',
  },
  prevTextDark: {
    color: '#ffffff',
  },
  qTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  qPrefix: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: 2,
    left: -2,
    right: -2,
    height: 8,
    borderRadius: 2,
    zIndex: -1,
  },
  qHighlight: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  qSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsList: {
    gap: 8,
    marginBottom: 14,
  },
  /* 3D Option Buttons */
  optionContainer: {
    width: '100%',
    height: 44,
    position: 'relative',
  },
  optionPressable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  optionShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    position: 'absolute',
    top: 3,
    left: 3,
  },
  optionMid: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  optionTop: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 2.5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  navBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
