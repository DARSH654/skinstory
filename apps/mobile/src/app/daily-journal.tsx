import React, { useRef, useCallback, useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions,
  Image
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { 
  ChevronLeft, 
  ChevronRight, 
  History as HistoryIcon,
  HelpCircle,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  Check,
  Calendar,
  ArrowUpDown,
  ImageIcon,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Droplets,
  Moon,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react-native';
import { 
  BottomSheetModal, 
  BottomSheetScrollView, 
  BottomSheetBackdrop, 
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';
import Animated, { 
  FadeIn, 
  FadeOut, 
  FadeInDown,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { MOCK_SCANS } from '@/constants/mockScans';
import { useJournalStore } from '@/store/journalStore';

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
    subtitle: 'Did you complete your daily AM & PM skincare steps today?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    options: [
      { label: 'Morning & evening routine fully completed with moisturizer and active serums', value: 'Morning & Evening' },
      { label: 'Morning routine only before heading out for work', value: 'Morning' },
      { label: 'Evening routine only before sleeping', value: 'Evening' },
      { label: 'Full AM, PM & night double-cleanse complete routine', value: 'Morning, Evening & Night' },
      { label: 'No routine today - completely skipped', value: 'No' },
    ],
  },
  {
    key: 'q_water',
    prefix: 'Water ',
    highlight: 'Intake',
    subtitle: 'Daily hydration?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    options: [
      { label: 'Under 500ml total intake', value: 'Less than 500ml' },
      { label: 'Around 1 Liter throughout the day', value: 'Around 1L' },
      { label: 'Around 1.5 Liters of water and electrolytes', value: 'Around 1.5L' },
      { label: 'Around 2 Liters healthy goal reached', value: 'Around 2L' },
      { label: 'Over 2.5 Liters fully hydrated and tracking', value: 'More than 2L' },
    ],
  },
  {
    key: 'q_sleep',
    prefix: 'Sleep ',
    highlight: 'Quality',
    subtitle: 'How many continuous hours of restful, undisturbed deep sleep did you manage to get throughout the entire night?',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    options: [
      { label: 'Under 5 hours, woke up feeling fatigued and unrested', value: 'Less than 5 hours' },
      { label: '5 to 6 hours with intermittent wakeups and restlessness', value: '5–6 hours, restless' },
      { label: '6 to 7 hours of standard adequate sleep', value: '6–7 hours, okay' },
      { label: '7 to 8 hours of solid uninterrupted deep restorative rest', value: '7–8 hours, good' },
      { label: '8+ hours of perfect, high quality rejuvenating deep sleep', value: '8+ hours, excellent' },
    ],
  },
  {
    key: 'q_stress',
    prefix: 'Stress ',
    highlight: 'Check',
    subtitle: 'Reflecting across your entire day from morning until right now, how would you gauge your overall mental stress, work pressure, and cognitive exhaustion levels?',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    options: [
      { label: 'Completely calm, peaceful, grounded and relaxed all day', value: 'Completely calm & relaxed' },
      { label: 'Mild everyday stress, entirely manageable without issue', value: 'Mild stress, manageable' },
      { label: 'Moderately stressed with occasional moments of anxiety', value: 'Moderately stressed' },
      { label: 'Quite stressed with noticeable mental and physical tension', value: 'Quite stressed today' },
      { label: 'Extremely overwhelmed, high burnout and exhaustion felt', value: 'Extremely overwhelmed' },
    ],
  },
  {
    key: 'q_sunscreen',
    prefix: 'Sunscreen ',
    highlight: 'Application',
    subtitle: 'Did you apply SPF?',
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    options: [
      { label: 'Applied broad-spectrum SPF 50+ and regularly reapplied every 2 hours outdoors', value: 'Applied & Reapplied' },
      { label: 'Applied once in the morning before leaving', value: 'Applied once' },
      { label: 'Stayed indoors all day with minimal UV exposure', value: 'Indoors' },
      { label: 'Completely forgot sunscreen today', value: 'Forgot' },
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

// ---------------------------------------------------------------------------
// MarqueeText — scrolls text horizontally when it overflows the pill
// ---------------------------------------------------------------------------
function MarqueeText({ text, style }: { text: string; style?: any }) {
  const containerWidth = useSharedValue(0);
  const textWidth = useSharedValue(0);
  const translateX = useSharedValue(0);
  const [shouldScroll, setShouldScroll] = useState(false);

  const onContainerLayout = (e: any) => {
    containerWidth.value = e.nativeEvent.layout.width;
  };

  const onTextLayout = (e: any) => {
    const w = e.nativeEvent.lines.reduce((max: number, line: any) => Math.max(max, line.width), 0);
    textWidth.value = w;
    const overflow = w > containerWidth.value + 2;
    setShouldScroll(overflow);
    if (overflow) {
      const distance = w - containerWidth.value + 16;
      translateX.value = 0;
      translateX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 800, easing: Easing.linear }),
          withTiming(-distance, { duration: distance * 22, easing: Easing.linear }),
          withTiming(-distance, { duration: 700, easing: Easing.linear }),
          withTiming(0, { duration: distance * 14, easing: Easing.linear }),
        ),
        -1,
        false,
      );
    } else {
      translateX.value = 0;
    }
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ flex: 1, overflow: 'hidden' }} onLayout={onContainerLayout}>
      <Animated.Text
        numberOfLines={shouldScroll ? 1 : 2}
        onTextLayout={onTextLayout}
        style={[style, animStyle, shouldScroll ? { width: 9999 } : {}]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

export default function DailyJournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const screenWidth = Dimensions.get('window').width;
  const responsivePadding = Math.max(16, screenWidth * 0.05);

  const primaryColor = Colors.light.primary;

  // Tabs: History on left (page 0), Questionnaire on right (page 1)
  const [activeTab, setActiveTab] = useState<'history' | 'questionnaire'>('history');
  const horizontalPagerRef = useRef<ScrollView>(null);

  const handleTabPress = (tab: 'history' | 'questionnaire') => {
    setActiveTab(tab);
    if (tab === 'history') {
      horizontalPagerRef.current?.scrollTo({ x: 0, animated: true });
    } else {
      horizontalPagerRef.current?.scrollTo({ x: screenWidth, animated: true });
    }
  };

  const handleHorizontalScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    if (pageIndex === 0 && activeTab !== 'history') {
      setActiveTab('history');
    } else if (pageIndex === 1 && activeTab !== 'questionnaire') {
      setActiveTab('questionnaire');
    }
  };

  // Filter Timeline state for history
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const dateFilterRef = useRef({ from: '', till: '' });
  const [dateSwapKey, setDateSwapKey] = useState(0);
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedTillDate, setAppliedTillDate] = useState('');

  // Questions State: Selected/Active Questions (Top Box) & Available Questions (Bottom Box)
  const questions = useJournalStore((state) => state.questions);
  const availableQuestions = useJournalStore((state) => state.availableQuestions);
  const setQuestions = useJournalStore((state) => state.setQuestions);
  const setAvailableQuestions = useJournalStore((state) => state.setAvailableQuestions);

  // Context Menu Popup State on Long Press
  const [contextMenu, setContextMenu] = useState<{
    question: QuestionDef;
    from: 'active' | 'available';
    anchorX: number;
    anchorY: number;
  } | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    question: QuestionDef;
    from: 'active' | 'available';
  } | null>(null);

  // Move question from selected list to available list (Clicking Minus)
  const handleRemoveQuestion = (qToRemove: QuestionDef) => {
    setQuestions((prev) => prev.filter((q) => q.key !== qToRemove.key));
    setAvailableQuestions((prev) => [qToRemove, ...prev]);
  };

  // Move question from available list back to selected list (Clicking Plus on enabled question)
  // If clicked while disabled, it does NOT automatically enable; it opens the modal where they need to enable it
  const handleAddQuestion = (qToAdd: QuestionDef, e?: any) => {
    if (qToAdd.disabled) {
      const pageX = e?.nativeEvent?.pageX || screenWidth / 2;
      const pageY = e?.nativeEvent?.pageY || 300;
      setContextMenu({
        question: qToAdd,
        from: 'available',
        anchorX: pageX,
        anchorY: pageY,
      });
      return;
    }

    setAvailableQuestions((prev) => prev.filter((q) => q.key !== qToAdd.key));
    setQuestions((prev) => [...prev, qToAdd]);
  };

  const handleRowLongPress = (q: QuestionDef, from: 'active' | 'available', e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    setContextMenu({
      question: q,
      from,
      anchorX: pageX || screenWidth / 2,
      anchorY: pageY || 300,
    });
  };

  const handleEditQuestion = (q: QuestionDef) => {
    setContextMenu(null);
    router.push({
      pathname: '/edit-your-question' as any,
      params: {
        key: q.key,
        subtitle: q.subtitle,
        options: JSON.stringify(q.options),
      },
    });
  };

  // Triggers delete confirmation modal with warning sign
  const promptDeleteQuestion = (qToDelete: QuestionDef, from: 'active' | 'available') => {
    setContextMenu(null);
    setDeleteConfirmTarget({ question: qToDelete, from });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    const { question, from } = deleteConfirmTarget;
    if (from === 'active') {
      setQuestions((prev) => prev.filter((q) => q.key !== question.key));
    } else {
      setAvailableQuestions((prev) => prev.filter((q) => q.key !== question.key));
    }
    setDeleteConfirmTarget(null);
  };

  // When disabled: moves to the very bottom of Available Questions and is marked disabled (gray plus icon, faded text).
  // When enabled via modal: becomes available again inside Available Questions.
  const handleDisableQuestion = (qTarget: QuestionDef, from: 'active' | 'available') => {
    setContextMenu(null);

    if (qTarget.disabled) {
      // Re-enable it within Available Questions (now active in available pool)
      setAvailableQuestions((prev) =>
        prev.map((item) => (item.key === qTarget.key ? { ...item, disabled: false } : item))
      );
    } else {
      // Disable it and place at the very bottom of Available Questions
      const disabledItem: QuestionDef = { ...qTarget, disabled: true };
      if (from === 'active') {
        setQuestions((prev) => prev.filter((q) => q.key !== qTarget.key));
        setAvailableQuestions((prev) => [...prev.filter((q) => q.key !== qTarget.key), disabledItem]);
      } else {
        setAvailableQuestions((prev) => [...prev.filter((q) => q.key !== qTarget.key), disabledItem]);
      }
    }
  };

  // History Records State
  const [historyRecords, setHistoryRecords] = useState<JournalHistoryRecord[]>(DEMO_HISTORY_RECORDS);

  // Active entry being edited in bottom sheet slide
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({});
  const [isViewingCompleted, setIsViewingCompleted] = useState(false);

  const snapPoints = useMemo(() => ['62%'], []);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const currentQ = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswer = currentQ ? editingAnswers[currentQ.key] || null : null;

  // Open edit slide for a history record
  const handleOpenEdit = (record: JournalHistoryRecord) => {
    setActiveRecordId(record.id);
    const recordAnswers = { ...(record.answers || {}) };
    setEditingAnswers(recordAnswers);
    setSlideDirection('forward');

    // Count how many of the currently active questions are answered
    const answeredCount = questions.filter((q) => Boolean(recordAnswers[q.key])).length;
    const isCompleted = answeredCount >= questions.length && questions.length > 0;

    if (isCompleted) {
      // Completed state: show the big tick completion screen with "Edit answers" option
      setIsViewingCompleted(true);
      setCurrentIndex(0);
    } else {
      setIsViewingCompleted(false);
      // In Progress / Missed: find the index of the first question that has no answer
      const firstUnansweredIndex = questions.findIndex((q) => !recordAnswers[q.key]);
      setCurrentIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
    }

    bottomSheetModalRef.current?.present();
  };

  const handleStartEditFromBeginning = () => {
    setIsViewingCompleted(false);
    setCurrentIndex(0);
    setSlideDirection('forward');
  };

  const selectAnswer = (qKey: string, val: string) => {
    const updatedAnswers = {
      ...editingAnswers,
      [qKey]: val,
    };
    setEditingAnswers(updatedAnswers);

    // Auto-advance to next question or complete on selection
    setTimeout(() => {
      if (isLastQuestion) {
        if (activeRecordId) {
          setHistoryRecords((prev) =>
            prev.map((item) =>
              item.id === activeRecordId ? { ...item, answers: { ...updatedAnswers } } : item
            )
          );
        }
        bottomSheetModalRef.current?.dismiss();
        setCurrentIndex(0);
        setActiveRecordId(null);
      } else {
        setSlideDirection('forward');
        setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
      }
    }, 220);
  };

  const handlePrevious = () => {
    setSlideDirection('backward');
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSwapDates = () => {
    const temp = dateFilterRef.current.from;
    dateFilterRef.current.from = dateFilterRef.current.till;
    dateFilterRef.current.till = temp;
    setDateSwapKey((prev) => prev + 1);
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

  // Filtered History Records by timeline
  const filteredHistory = useMemo(() => {
    return historyRecords.filter((item) => {
      if (appliedFromDate && item.isoDate < appliedFromDate) return false;
      if (appliedTillDate && item.isoDate > appliedTillDate) return false;
      return true;
    });
  }, [historyRecords, appliedFromDate, appliedTillDate]);

  const hasTimelineFilter = Boolean(appliedFromDate || appliedTillDate);

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      {/* 1. Main Header: Back | "Your Daily Journal" | Filter pill (in History) or "Add new" pill (in Questionnaire) */}
      <View style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: responsivePadding }]}>
        <View style={styles.headerLeft}>
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

          <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]} numberOfLines={1}>
            Your Daily Journal
          </Text>
        </View>

        {/* Dynamic Action Pill: Filter for History, Add New for Questionnaire */}
        {activeTab === 'history' ? (
          <Pressable
            onPress={() => {
              dateFilterRef.current.from = appliedFromDate;
              dateFilterRef.current.till = appliedTillDate;
              setDateSwapKey((prev) => prev + 1);
              setIsFilterModalOpen(true);
            }}
            style={({ pressed }) => [
              styles.actionPillBtn,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                borderColor: hasTimelineFilter
                  ? (isDark ? '#c084fc' : primaryColor)
                  : isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                borderWidth: hasTimelineFilter ? 1.5 : 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            hitSlop={8}
          >
            <SlidersHorizontal 
              size={15} 
              color={hasTimelineFilter ? (isDark ? '#c084fc' : primaryColor) : (isDark ? '#ffffff' : '#111827')} 
              strokeWidth={2.2} 
            />
            <Text 
              style={[
                styles.actionPillText, 
                { 
                  color: hasTimelineFilter ? (isDark ? '#c084fc' : primaryColor) : (isDark ? '#ffffff' : '#111827') 
                }
              ]}
            >
              {hasTimelineFilter ? 'Filtered' : 'Filter'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              router.push('/add-journal-question' as any);
            }}
            style={({ pressed }) => [
              styles.actionPillBtn,
              {
                backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                borderColor: isDark ? '#27272a' : 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            hitSlop={8}
          >
            <Plus size={15} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
            <Text style={[styles.actionPillText, { color: isDark ? '#ffffff' : '#111827' }]}>
              Add new
            </Text>
          </Pressable>
        )}
      </View>

      {/* 2. Top Segmented Pill Toggle: History (left) | Questionnaire (right) */}
      <View style={[styles.toggleContainer, { paddingHorizontal: responsivePadding }]}>
        <View style={[styles.toggleTrack, isDark ? styles.toggleTrackDark : styles.toggleTrackLight]}>
          <Pressable
            onPress={() => handleTabPress('history')}
            style={[
              styles.toggleTab,
              activeTab === 'history' && (isDark ? styles.toggleActiveDark : styles.toggleActiveLight),
            ]}
          >
            <HistoryIcon 
              size={15} 
              color={activeTab === 'history' ? (isDark ? '#ffffff' : '#111827') : (isDark ? '#a1a1aa' : '#6b7280')} 
              strokeWidth={2.4} 
            />
            <Text
              style={[
                styles.toggleTabText,
                activeTab === 'history'
                  ? [styles.toggleActiveText, { color: isDark ? '#ffffff' : '#111827' }]
                  : [styles.toggleInactiveText, { color: isDark ? '#a1a1aa' : '#6b7280' }],
              ]}
            >
              History
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleTabPress('questionnaire')}
            style={[
              styles.toggleTab,
              activeTab === 'questionnaire' && (isDark ? styles.toggleActiveDark : styles.toggleActiveLight),
            ]}
          >
            <HelpCircle 
              size={15} 
              color={activeTab === 'questionnaire' ? (isDark ? '#ffffff' : '#111827') : (isDark ? '#a1a1aa' : '#6b7280')} 
              strokeWidth={2.4} 
            />
            <Text
              style={[
                styles.toggleTabText,
                activeTab === 'questionnaire'
                  ? [styles.toggleActiveText, { color: isDark ? '#ffffff' : '#111827' }]
                  : [styles.toggleInactiveText, { color: isDark ? '#a1a1aa' : '#6b7280' }],
              ]}
            >
              Questionnaire
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 3. Main Content Views (Horizontally Slideable Pager) */}
      <ScrollView
        ref={horizontalPagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleHorizontalScrollEnd}
        style={{ flex: 1 }}
      >
        {/* Page 1: History Tab */}
        <View style={{ width: screenWidth }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingHorizontal: responsivePadding, paddingBottom: insets.bottom + 28 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.historyList}>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const answeredCount = questions.filter((q) => Boolean(item.answers?.[q.key])).length;
                  const totalQuestions = questions.length;
                  
                  // Only 3 statuses: 'Completed', 'In Progress', 'Missed'
                  let statusText: 'Completed' | 'In Progress' | 'Missed' = 'Completed';
                  if (answeredCount >= totalQuestions && totalQuestions > 0) {
                    statusText = 'Completed';
                  } else if (answeredCount === 0) {
                    statusText = 'Missed';
                  } else {
                    statusText = 'In Progress';
                  }

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleOpenEdit(item)}
                      style={({ pressed }) => [
                        styles.historyCardBox,
                        isDark ? styles.historyCardBoxDark : styles.historyCardBoxLight,
                        { opacity: pressed ? 0.75 : 1 },
                      ]}
                    >
                      {/* Left Column: Date & Status Pill on top, Day & Answered count below */}
                      <View style={styles.historyRowLeft}>
                        {/* Top row: Date + Status pill */}
                        <View style={styles.historyTopRow}>
                          <Text style={[styles.historyRowDate, { color: isDark ? '#ffffff' : '#111827' }]}>
                            {item.dateStr}
                          </Text>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                { color: isDark ? '#a1a1aa' : '#6b7280' },
                              ]}
                            >
                              {statusText}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Bottom row: Day name + X of Y answered */}
                        <View style={styles.historyMetaContainer}>
                          <Text style={[styles.historyRowSubDate, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                            {item.dayName}
                          </Text>
                          <View style={[styles.dotSeparator, { backgroundColor: isDark ? '#52525b' : '#d1d5db' }]} />
                          <Text
                            style={[
                              styles.historyRowAnswersCount,
                              { color: isDark ? '#a1a1aa' : '#6b7280' },
                            ]}
                          >
                            {answeredCount} of {totalQuestions} answered
                          </Text>
                        </View>
                      </View>

                      {/* Right Column: Circle with status icon & matching BG */}
                      <View style={styles.historyRightSlot}>
                        {statusText === 'Completed' && (
                          <View
                            style={[
                              styles.statusCircleBadge,
                              {
                                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.12)',
                                borderColor: isDark ? '#22c55e' : '#16a34a',
                                borderStyle: 'solid',
                              },
                            ]}
                          >
                            <Check 
                              size={20} 
                              color={isDark ? '#4ade80' : '#16a34a'} 
                              strokeWidth={3} 
                            />
                          </View>
                        )}

                        {statusText === 'In Progress' && (
                          <View
                            style={[
                              styles.statusCircleBadge,
                              {
                                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.16)' : 'rgba(124, 58, 237, 0.10)',
                                borderColor: isDark ? '#c084fc' : primaryColor,
                                borderStyle: 'dashed',
                              },
                            ]}
                          >
                            <Check 
                              size={20} 
                              color={isDark ? '#c084fc' : primaryColor} 
                              strokeWidth={3} 
                            />
                          </View>
                        )}

                        {statusText === 'Missed' && (
                          <View
                            style={[
                              styles.statusCircleBadge,
                              {
                                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.12)',
                                borderColor: isDark ? '#ef4444' : '#dc2626',
                                borderStyle: 'solid',
                              },
                            ]}
                          >
                            <X 
                              size={20} 
                              color={isDark ? '#f87171' : '#dc2626'} 
                              strokeWidth={3} 
                            />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    {hasTimelineFilter ? 'No records in timeline' : 'No journal history yet'}
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    {hasTimelineFilter 
                      ? 'No entries match your timeline filter. Try resetting.'
                      : 'Your completed daily routines and check-ins will appear here.'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Page 2: Questionnaire Tab */}
        <View style={{ width: screenWidth }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingHorizontal: responsivePadding, paddingBottom: insets.bottom + 32 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Active / Selected Questions Container */}
            <View style={styles.categoriesSectionHeader}>
              <Text style={[styles.categoriesSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Active Questions
              </Text>
              <Text style={[styles.categoriesSectionCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                {questions.length} included
              </Text>
            </View>

            <View style={[styles.categoriesCard, isDark ? styles.categoriesCardDark : styles.categoriesCardLight]}>
              {questions.length > 0 ? (
                questions.map((q, idx) => {
                  const isLastItem = idx === questions.length - 1;
                  return (
                    <Animated.View
                      key={`active-${q.key}`}
                      entering={FadeIn.duration(200)}
                    >
                      <Pressable
                        onPress={() => handleRemoveQuestion(q)}
                        onLongPress={(e) => handleRowLongPress(q, 'active', e)}
                        delayLongPress={350}
                        style={({ pressed }) => [
                          styles.categoryItemRow,
                          !isLastItem && [
                            styles.categoryItemDivider,
                            { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' },
                          ],
                          { opacity: pressed ? 0.75 : 1 },
                        ]}
                      >
                        {({ pressed }) => (
                          <>
                            {/* Minus Action Button with Primary Color & tactile scale */}
                            <View
                              style={[
                                styles.actionIconCircle,
                                {
                                  backgroundColor: primaryColor,
                                  transform: [{ scale: pressed ? 0.88 : 1 }],
                                },
                              ]}
                            >
                              <Minus size={14} color="#ffffff" strokeWidth={3} />
                            </View>

                            {/* Question / Category Label */}
                            <View style={styles.categoryLabelWrapper}>
                              <Text style={[styles.categoryTitleText, { color: isDark ? '#ffffff' : '#111827' }]}>
                                {q.subtitle}
                              </Text>
                            </View>
                          </>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })
              ) : (
                <View style={styles.emptyCategoriesBox}>
                  <Text style={[styles.emptyCategoriesText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    No active questions. Tap + below to add.
                  </Text>
                </View>
              )}
            </View>

            {/* Section 2: Available Questions (Add to Questionnaire) Container */}
            {availableQuestions.length > 0 && (
              <>
                <View style={[styles.categoriesSectionHeader, { marginTop: 24 }]}>
                  <Text style={[styles.categoriesSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Available Questions
                  </Text>
                  <Text style={[styles.categoriesSectionCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    {availableQuestions.length} available
                  </Text>
                </View>

                <View style={[styles.categoriesCard, isDark ? styles.categoriesCardDark : styles.categoriesCardLight]}>
                  {availableQuestions.map((q, idx) => {
                    const isLastItem = idx === availableQuestions.length - 1;
                    const isDisabled = Boolean(q.disabled);

                    return (
                      <Animated.View
                        key={`avail-${q.key}`}
                        entering={FadeIn.duration(200)}
                      >
                        <Pressable
                          onPress={(e) => handleAddQuestion(q, e)}
                          onLongPress={(e) => handleRowLongPress(q, 'available', e)}
                          delayLongPress={350}
                          style={({ pressed }) => [
                            styles.categoryItemRow,
                            !isLastItem && [
                              styles.categoryItemDivider,
                              { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' },
                            ],
                            isDisabled && styles.disabledCategoryRow,
                            { opacity: pressed ? 0.75 : isDisabled ? 0.6 : 1 },
                          ]}
                        >
                          {({ pressed }) => (
                            <>
                              {/* Plus Action Button (Primary Color if enabled, Gray if disabled) & tactile scale */}
                              <View
                                style={[
                                  styles.actionIconCircle,
                                  {
                                    backgroundColor: isDisabled ? '#9ca3af' : primaryColor,
                                    transform: [{ scale: pressed ? 0.88 : 1 }],
                                  },
                                ]}
                              >
                                <Plus size={14} color="#ffffff" strokeWidth={3} />
                              </View>

                              {/* Question / Category Label */}
                              <View style={styles.categoryLabelWrapper}>
                                <Text
                                  style={[
                                    styles.categoryTitleText,
                                    {
                                      color: isDisabled
                                        ? isDark
                                          ? '#71717a'
                                          : '#9ca3af'
                                        : isDark
                                        ? '#ffffff'
                                        : '#111827',
                                    },
                                  ]}
                                >
                                  {q.subtitle}
                                </Text>
                              </View>
                            </>
                          )}
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Timeline Filter Modal: Date, Day, Cross & Two Boxes with In-Between Opposite Arrows */}
      <Modal
        visible={isFilterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setIsFilterModalOpen(false)}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.timelineModalCard, isDark ? styles.modalDark : styles.modalLight]}>
              {/* Top Row: Date, Day, Cross */}
              <View style={styles.timelineTopBar}>
                <View style={styles.timelineHeaderInfo}>
                  <Calendar size={18} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
                  <Text style={[styles.timelineDateText, { color: isDark ? '#ffffff' : '#111827' }]}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={[styles.timelineDayText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </Text>
                </View>

                <Pressable 
                  onPress={() => setIsFilterModalOpen(false)} 
                  hitSlop={10}
                  style={styles.timelineCloseBtn}
                >
                  <X size={18} color={isDark ? '#a1a1aa' : '#6b7280'} strokeWidth={2.4} />
                </Pressable>
              </View>

              {/* Timeline Container: From Box, Opposite Arrows, Till Box */}
              <View style={styles.timelineBoxesWrapper}>
                <View style={[styles.dateInputBox, isDark ? styles.inputBoxDark : styles.inputBoxLight]}>
                  <Text style={[styles.dateBoxLabel, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    From
                  </Text>
                  <TextInput
                    key={`timeline-from-${isFilterModalOpen ? 'open' : 'closed'}-${dateSwapKey}`}
                    defaultValue={dateFilterRef.current.from}
                    onChangeText={(val) => { dateFilterRef.current.from = val; }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                    style={[styles.dateBoxInput, { color: isDark ? '#ffffff' : '#111827' }]}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.arrowsBetweenRow}>
                  <Pressable 
                    onPress={handleSwapDates}
                    style={({ pressed }) => [
                      styles.oppositeArrowsBtn,
                      {
                        backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                    hitSlop={8}
                  >
                    <ArrowUpDown size={17} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
                  </Pressable>
                </View>

                <View style={[styles.dateInputBox, isDark ? styles.inputBoxDark : styles.inputBoxLight]}>
                  <Text style={[styles.dateBoxLabel, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    Till
                  </Text>
                  <TextInput
                    key={`timeline-till-${isFilterModalOpen ? 'open' : 'closed'}-${dateSwapKey}`}
                    defaultValue={dateFilterRef.current.till}
                    onChangeText={(val) => { dateFilterRef.current.till = val; }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                    style={[styles.dateBoxInput, { color: isDark ? '#ffffff' : '#111827' }]}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Actions: Reset & Apply */}
              <View style={styles.timelineActionsRow}>
                <Pressable
                  onPress={() => {
                    dateFilterRef.current.from = '';
                    dateFilterRef.current.till = '';
                    setAppliedFromDate('');
                    setAppliedTillDate('');
                    setIsFilterModalOpen(false);
                  }}
                  style={[styles.timelineBtnSecondary, isDark ? styles.btnSecDark : styles.btnSecLight]}
                >
                  <Text style={[styles.timelineBtnSecondaryText, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Reset
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setAppliedFromDate(dateFilterRef.current.from.trim());
                    setAppliedTillDate(dateFilterRef.current.till.trim());
                    setIsFilterModalOpen(false);
                  }}
                  style={[styles.timelineBtnPrimary, { backgroundColor: isDark ? '#ffffff' : '#111827' }]}
                >
                  <Text style={[styles.timelineBtnPrimaryText, { color: isDark ? '#000000' : '#ffffff' }]}>
                    Apply Timeline
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Slide Modal with Step-by-Step Questions */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        bottomInset={insets.bottom}
        backdropComponent={renderBackdrop}
        handleStyle={styles.handleContainer}
        handleIndicatorStyle={[
          styles.dragHandle,
          isDark ? styles.dragHandleDark : styles.dragHandleLight,
        ]}
        backgroundStyle={[isDark ? styles.bgDark : styles.bgLight, styles.roundedTop]}
      >
        <BottomSheetScrollView
          contentContainerStyle={[styles.sheetScrollContent, { paddingBottom: 28 }]}
          showsVerticalScrollIndicator={false}
        >
          {isViewingCompleted ? (
            /* Completed Screen UI: Big Tick, "You have completed it", and "Edit answers" Pill */
            <View style={styles.completedSheetContainer}>
              <View style={styles.completedTopRow}>
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={handleStartEditFromBeginning}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.editAnswersPill,
                    isDark ? styles.editAnswersPillDark : styles.editAnswersPillLight,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.editAnswersPillText,
                      { color: isDark ? '#ffffff' : '#111827' },
                    ]}
                  >
                    Edit answers
                  </Text>
                </Pressable>
              </View>

              <View style={styles.completedCenterContent}>
                {/* Big Tick Circle */}
                <View
                  style={[
                    styles.completedBigCircle,
                    {
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.16)' : 'rgba(34, 197, 94, 0.12)',
                      borderColor: isDark ? '#22c55e' : '#16a34a',
                    },
                  ]}
                >
                  <Check
                    size={48}
                    color={isDark ? '#4ade80' : '#16a34a'}
                    strokeWidth={3.5}
                  />
                </View>

                <Text style={[styles.completedHeading, { color: isDark ? '#ffffff' : '#111827' }]}>
                  You have completed it
                </Text>
                <Text style={[styles.completedSubheading, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                  All daily check-in questions were logged successfully.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Progress / Step header */}
              <View style={styles.stepHeaderRow}>
                <Text
                  style={[
                    styles.stepCounterText,
                    { color: isDark ? '#a1a1aa' : '#6b7280' },
                  ]}
                >
                  {`Question ${currentIndex + 1} of ${questions.length}`}
                </Text>
                {currentIndex > 0 ? (
                  <Pressable
                    onPress={handlePrevious}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.prevPill,
                      isDark ? styles.prevPillDark : styles.prevPillLight,
                      { opacity: pressed ? 0.75 : 1 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.prevPillText,
                        isDark ? styles.prevTextDark : styles.prevTextLight,
                      ]}
                    >
                      Previous
                    </Text>
                  </Pressable>
                ) : (
                  <View style={{ height: 28 }} />
                )}
              </View>

              {/* Question Title & Options (Animated Slide) */}
              {currentQ && (
                <Animated.View
                  key={`q-slide-${currentIndex}`}
                  entering={
                    slideDirection === 'forward'
                      ? SlideInRight.duration(240)
                      : SlideInLeft.duration(240)
                  }
                  exiting={
                    slideDirection === 'forward'
                      ? SlideOutLeft.duration(180)
                      : SlideOutRight.duration(180)
                  }
                >
                  {/* Question Text */}
              <Text style={[styles.pureQuestionText, { color: isDark ? '#ffffff' : '#111827' }]}>
                {currentQ.subtitle}
              </Text>

              {/* Pill-shaped 3D Option Choices */}
              <View style={styles.pillOptionsList}>
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer === opt.value;
                  const shadowColor = isSelected
                    ? isDark
                      ? '#4e2d8a'
                      : '#735b9c'
                    : isDark
                    ? 'rgba(255,255,255,0.75)'
                    : '#111111';
                  const borderColor = isSelected
                    ? isDark
                      ? '#cdb4f0'
                      : primaryColor
                    : isDark
                    ? 'rgba(255,255,255,0.75)'
                    : '#111111';
                  const faceBg = isSelected
                    ? isDark
                      ? '#937abd'
                      : '#f0ebf8'
                    : isDark
                    ? '#2c2c31'
                    : '#ffffff';
                  const textColor = isDark ? '#ffffff' : '#111111';

                  return (
                    <View key={opt.value} style={styles.optionContainer}>
                      <Pressable
                        style={styles.optionPressable}
                        onPress={() => selectAnswer(currentQ.key, opt.value)}
                      >
                        {({ pressed }) => (
                          <>
                            <View
                              style={[
                                styles.optionShadow,
                                { backgroundColor: shadowColor },
                              ]}
                            />
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
                                <MarqueeText
                                  text={opt.label}
                                  style={[styles.optionText, { color: textColor }]}
                                />
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
            </Animated.View>
          )}
          </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Floating Context Menu Popup on Long Press */}
      {contextMenu && (
        <View style={styles.contextMenuOverlay}>
          <TouchableOpacity
            style={styles.contextMenuBackdrop}
            onPress={() => setContextMenu(null)}
            activeOpacity={1}
          />
          <Animated.View
            entering={FadeInDown.duration(160)}
            exiting={FadeOutUp.duration(100)}
            style={[
              styles.contextMenuCard,
              {
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                top: Math.min(Math.max(contextMenu.anchorY - 30, insets.top + 40), Dimensions.get('window').height - 180),
                left: Math.min(Math.max(contextMenu.anchorX - 50, 16), Dimensions.get('window').width - 150),
              },
            ]}
          >
            {/* Menu Options: Edit, Disable/Enable, Delete */}
            <View style={styles.itemsWrapper}>
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => handleEditQuestion(contextMenu.question)}
                activeOpacity={0.7}
              >
                <Pencil size={16} color={isDark ? '#fafafa' : '#18181b'} />
                <Text style={[styles.contextMenuText, { color: isDark ? '#fafafa' : '#18181b' }]}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => handleDisableQuestion(contextMenu.question, contextMenu.from)}
                activeOpacity={0.7}
              >
                {contextMenu.question.disabled ? (
                  <CheckCircle2 size={16} color={isDark ? '#fafafa' : '#18181b'} />
                ) : (
                  <Ban size={16} color={isDark ? '#fafafa' : '#18181b'} />
                )}
                <Text style={[styles.contextMenuText, { color: isDark ? '#fafafa' : '#18181b' }]}>
                  {contextMenu.question.disabled ? 'Enable' : 'Disable'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => promptDeleteQuestion(contextMenu.question, contextMenu.from)}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text style={[styles.contextMenuText, { color: '#ef4444' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Delete Confirmation Modal with Warning Sign */}
      <Modal
        visible={deleteConfirmTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteConfirmTarget(null)}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.confirmDeleteCard, isDark ? styles.modalDark : styles.modalLight]}>
              <View style={styles.confirmDeleteIconWrapper}>
                <AlertTriangle size={28} color="#ef4444" strokeWidth={2.4} />
              </View>
              <Text style={[styles.confirmDeleteTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Delete Question?
              </Text>
              <Text style={[styles.confirmDeleteSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                Do you really want to delete this question? You cannot undo this.
              </Text>
              <View style={styles.confirmDeleteActionsRow}>
                <Pressable
                  onPress={() => setDeleteConfirmTarget(null)}
                  style={({ pressed }) => [
                    styles.confirmCancelBtn,
                    isDark ? styles.confirmCancelBtnDark : styles.confirmCancelBtnLight,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text style={[styles.confirmCancelText, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmDelete}
                  style={({ pressed }) => [
                    styles.confirmDeleteBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.confirmDeleteText}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
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
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Segmented Toggle Bar */
  toggleContainer: {
    paddingBottom: 14,
  },
  toggleTrack: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 30,
  },
  toggleTrackLight: {
    backgroundColor: '#e5e7eb',
  },
  toggleTrackDark: {
    backgroundColor: '#27272a',
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 26,
  },
  toggleActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleActiveDark: {
    backgroundColor: '#18181b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleTabText: {
    fontSize: 14,
  },
  toggleActiveText: {
    fontWeight: '700',
  },
  toggleInactiveText: {
    fontWeight: '500',
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 4,
  },

  /* History List */
  historyList: {
    paddingVertical: 6,
    gap: 12,
  },
  historyCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  historyCardBoxLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  historyCardBoxDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  historyRowLeft: {
    flex: 1,
    paddingRight: 14,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  historyRowDate: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  historyMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyRowSubDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  historyRowAnswersCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },

  /* Right Slot & Status Circle Badge */
  historyRightSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  statusCircleBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },

  /* Empty state */
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Questionnaire Edit Categories Layout */
  categoriesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 10,
    marginTop: 4,
  },
  categoriesSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  categoriesSectionCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  categoriesCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  categoriesCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  categoryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  categoryItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  removeIconCircle: {
    backgroundColor: '#ef4444',
  },
  addIconCircle: {
    backgroundColor: '#10b981',
  },
  disabledIconCircle: {
    backgroundColor: '#9ca3af',
  },
  disabledCategoryRow: {
    opacity: 0.65,
  },
  categoryLabelWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryTitleText: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 21,
    flexWrap: 'wrap',
  },
  categorySubtitleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCategoriesBox: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCategoriesText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Timeline Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  modalDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  timelineModalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
  },
  timelineTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  timelineHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineDateText: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineDayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timelineCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBoxesWrapper: {
    paddingVertical: 16,
    gap: 10,
    alignItems: 'center',
  },
  dateInputBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputBoxLight: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  inputBoxDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  dateBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateBoxInput: {
    fontSize: 15,
    fontWeight: '700',
    padding: 0,
  },
  arrowsBetweenRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -2,
    zIndex: 10,
  },
  oppositeArrowsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  timelineBtnSecondary: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnSecLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  btnSecDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  timelineBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineBtnPrimary: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBtnPrimaryText: {
    fontSize: 14,
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
  /* Completed State UI in Sheet */
  completedSheetContainer: {
    paddingTop: 2,
    paddingBottom: 20,
  },
  completedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 32,
    marginBottom: 20,
  },
  editAnswersPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAnswersPillLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  editAnswersPillDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  editAnswersPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  completedBigCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  completedHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  completedSubheading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
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
  pureQuestionText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
    marginBottom: 18,
    paddingTop: 4,
  },
  pillOptionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  optionPillSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  optionPillUnselected: {
  },
  optionPillText: {
    fontSize: 14,
    flex: 1,
    paddingRight: 10,
  },
  optionPillCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    borderRadius: 24,
    position: 'absolute',
    top: 3,
    left: 3,
  },
  optionMid: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  optionTop: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: 18,
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

  /* Context Menu Popup Styles (Exact replica of new-chat MessageContextMenu) */
  contextMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  contextMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contextMenuCard: {
    position: 'absolute',
    minWidth: 135,
    maxWidth: 180,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  itemsWrapper: {
    paddingVertical: 2,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9.5,
  },
  contextMenuText: {
    fontSize: 14,
    fontWeight: '500',
  },

  /* Delete Confirmation Modal Styles */
  confirmDeleteCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmDeleteIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmDeleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmDeleteSubtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmDeleteActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  confirmCancelBtnDark: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  confirmCancelText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
