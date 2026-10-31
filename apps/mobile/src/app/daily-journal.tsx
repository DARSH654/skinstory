
import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
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
  Image,
  PanResponder,
  Platform
} from 'react-native';
import { Text } from '@/components/AppText';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
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
  ArrowLeftRight,
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
  Loader2,
  SearchX
} from 'lucide-react-native';
import { JournalQuestionSheet, JournalQuestionSheetRef } from '@/components/journal/JournalQuestionSheet';
import { JournalTimelineFilterModal } from '@/components/journal/JournalTimelineFilterModal';
import Animated, { 
  FadeIn, 
  FadeOut, 
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { MOCK_SCANS } from '@/constants/mockScans';
import { useJournalStore, QuestionDef } from '@/store/journalStore';
import { styles } from '@/styles/daily-journal.styles';

// Static Reanimated transitions defined at module level for optimal 60fps performance
const questionRowLayoutTransition = LinearTransition.duration(220).easing(Easing.out(Easing.quad));
const questionRowEntering = FadeIn.duration(180);
const questionRowExiting = FadeOut.duration(140);

export { INITIAL_QUESTIONS, INITIAL_AVAILABLE_QUESTIONS } from '@/store/journalStore';
export { JournalHistoryRecord, DEMO_HISTORY_RECORDS } from '@/store/journalStore';
import { JournalHistoryRecord } from '@/store/journalStore';

// ---------------------------------------------------------------------------
// MarqueeText â€” scrolls text horizontally when it overflows the pill
// ---------------------------------------------------------------------------
function MarqueeText({ text, style }: { text: string; style?: any }) {
  const containerWidthRef = useRef(0);
  const translateX = useSharedValue(0);
  const [shouldScroll, setShouldScroll] = useState(false);

  const onContainerLayout = (e: any) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
  };

  const onTextLayout = (e: any) => {
    const w = e.nativeEvent.lines.reduce((max: number, line: any) => Math.max(max, line.width), 0);
    const containerW = containerWidthRef.current;
    const overflow = containerW > 0 && w > containerW + 2;
    setShouldScroll(overflow);
    if (overflow) {
      const distance = w - containerW + 16;
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

// ---------------------------------------------------------------------------
// HistoryCardSkeleton â€” Matching exact height and layout of historyCardBox
// ---------------------------------------------------------------------------
function HistoryCardSkeleton({ isDark }: { isDark: boolean }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const placeholderBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e5e7eb';

  return (
    <View
      style={[
        styles.historyCardBox,
        isDark ? styles.historyCardBoxDark : styles.historyCardBoxLight,
      ]}
    >
      <Animated.View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, animStyle]}>
        <View style={styles.historyRowLeft}>
          <View style={styles.historyTopRow}>
            <View style={{ width: 115, height: 17, borderRadius: 5, backgroundColor: placeholderBg }} />
            <View style={{ width: 72, height: 20, borderRadius: 999, backgroundColor: placeholderBg }} />
          </View>
          <View style={[styles.historyMetaContainer, { marginTop: 6 }]}>
            <View style={{ width: 65, height: 12, borderRadius: 4, backgroundColor: placeholderBg }} />
            <View style={[styles.dotSeparator, { backgroundColor: isDark ? '#52525b' : '#d1d5db' }]} />
            <View style={{ width: 110, height: 12, borderRadius: 4, backgroundColor: placeholderBg }} />
          </View>
        </View>
        <View style={styles.historyRightSlot}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: placeholderBg }} />
        </View>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// QuestionnaireSkeleton – Matches the 2-card layout (Active + Available) each with 5 rows
// ---------------------------------------------------------------------------
function QuestionnaireSkeleton({ isDark, responsivePadding, questions, availableQuestions }: { isDark: boolean; responsivePadding: number; questions: any[]; availableQuestions: any[] }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const placeholderBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e5e7eb';
  const cardBg = isDark ? '#18181b' : '#ffffff';
  const cardBorder = isDark ? '#27272a' : '#e5e7eb';
  const circleBg = placeholderBg;

  // A single skeleton question row: circle icon + label placeholder
  const SkeletonRow = ({ isLast }: { isLast: boolean }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
      }}
    >
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: circleBg }} />
      <View style={{ flex: 1, height: 14, borderRadius: 5, backgroundColor: placeholderBg }} />
    </View>
  );

  return (
    <View style={{ paddingHorizontal: responsivePadding }}>
      {/* Section 1: Active Questions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 10, marginTop: 24 }}>
        <Text style={[styles.categoriesSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>Active Questions</Text>
        <Text style={[styles.categoriesSectionCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>{questions.length} included</Text>
      </View>
      <View style={[styles.categoriesCard, isDark ? styles.categoriesCardDark : styles.categoriesCardLight]}>
        <Animated.View style={animStyle}>
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={true} />
        </Animated.View>
      </View>

      {/* Section 2: Available Questions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 10, marginTop: 24 }}>
        <Text style={[styles.categoriesSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>Available Questions</Text>
        <Text style={[styles.categoriesSectionCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>{availableQuestions.length} available</Text>
      </View>
      <View style={[styles.categoriesCard, isDark ? styles.categoriesCardDark : styles.categoriesCardLight]}>
        <Animated.View style={animStyle}>
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={false} />
          <SkeletonRow isLast={true} />
        </Animated.View>
      </View>
    </View>
  );
}


export default function DailyJournalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const screenWidth = Dimensions.get('window').width;
  const responsivePadding = Math.max(16, screenWidth * 0.05);

  const primaryColor = Colors.light.primary;

  const [isJournalReady, setIsJournalReady] = useState(true);
  const [isQuestionnaireReady, setIsQuestionnaireReady] = useState(true);


  // Tabs: History on left (page 0), Questionnaire on right (page 1)
  const initialTab = params.tab === 'questionnaire' ? 'questionnaire' : 'history';
  const [activeTab, setActiveTab] = useState<'history' | 'questionnaire'>(initialTab);
  const horizontalPagerRef = useRef<ScrollView>(null);
  // Permanent lock against Android momentum scroll race condition during programmatic transitions
  const programmaticTargetRef = useRef<'history' | 'questionnaire' | null>(null);
  const programmaticTimerRef = useRef<any>(null);
  const isUserSwipingRef = useRef(false);

  // If navigated with tab='questionnaire', smoothly scroll the pager to page 1
  useFocusEffect(
    useCallback(() => {
      if (params.tab === 'questionnaire') {
        setActiveTab('questionnaire');
        setTimeout(() => {
          horizontalPagerRef.current?.scrollTo({ x: screenWidth, animated: false });
        }, 50);
      }
    }, [params.tab, screenWidth])
  );




  const handleTabPress = (tab: 'history' | 'questionnaire') => {
    // 1. Immediately update UI state so Header button (Filter vs Add New) & segmented pill update without delay
    setActiveTab(tab);
    programmaticTargetRef.current = tab;

    if (programmaticTimerRef.current) {
      clearTimeout(programmaticTimerRef.current);
    }
    // Safety release: unlock after 400ms even if Android drops onMomentumScrollEnd
    programmaticTimerRef.current = setTimeout(() => {
      programmaticTargetRef.current = null;
    }, 400);

    const targetX = tab === 'history' ? 0 : screenWidth;
    horizontalPagerRef.current?.scrollTo({ x: targetX, animated: true });
  };

  const handleScrollBeginDrag = () => {
    // User is manually swiping with their finger
    isUserSwipingRef.current = true;
    programmaticTargetRef.current = null;
    if (programmaticTimerRef.current) {
      clearTimeout(programmaticTimerRef.current);
    }
  };

  const handleHorizontalScrollEnd = (e: any) => {
    const offsetX = e?.nativeEvent?.contentOffset?.x ?? 0;
    const pageIndex = Math.round(offsetX / screenWidth);
    const resolvedTab = pageIndex === 0 ? 'history' : 'questionnaire';

    // If a programmatic tab transition is currently in flight:
    if (programmaticTargetRef.current !== null) {
      // Only release lock if the scroll has arrived at our desired target
      if (resolvedTab === programmaticTargetRef.current) {
        programmaticTargetRef.current = null;
        if (programmaticTimerRef.current) {
          clearTimeout(programmaticTimerRef.current);
        }
      } else {
        // Discard stale momentum events from previously queued animations
        return;
      }
    }

    isUserSwipingRef.current = false;
    setActiveTab(resolvedTab);
  };

  // Filter Timeline state for history
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedTillDate, setAppliedTillDate] = useState('');

  // Questions State: Selected/Active Questions (Top Box) & Available Questions (Bottom Box)
  const questions = useJournalStore((state) => state.questions);
  const availableQuestions = useJournalStore((state) => state.availableQuestions);
  const setQuestions = useJournalStore((state) => state.setQuestions);
  const setAvailableQuestions = useJournalStore((state) => state.setAvailableQuestions);

  // Reorder Active Questions Mode State
  const [isReordering, setIsReordering] = useState(false);
  const [reorderDraftQuestions, setReorderDraftQuestions] = useState<QuestionDef[]>([]);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const dragStartPageYRef = useRef<number>(0);
  const lastSwapPageYRef = useRef<number>(0);

  // Context Menu Popup State on Long Press
  const [contextMenu, setContextMenu] = useState<{
    question: QuestionDef;
    from: 'active' | 'available';
    anchorX: number;
    anchorY: number;
  } | null>(null);

  // History Context Menu Popup State on Long Press
  const [historyContextMenu, setHistoryContextMenu] = useState<{
    record: JournalHistoryRecord;
    anchorX: number;
    anchorY: number;
  } | null>(null);

  // Delete Confirmation Modal State (Questionnaire)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    question: QuestionDef;
    from: 'active' | 'available';
  } | null>(null);
  const deleteQuestionInputRef = useRef('');
  const [canDeleteQuestion, setCanDeleteQuestion] = useState(false);

  // History Log Delete State
  const [deleteLogTarget, setDeleteLogTarget] = useState<JournalHistoryRecord | null>(null);
  const deleteLogInputRef = useRef('');
  const [canDeleteLog, setCanDeleteLog] = useState(false);

  const moveToAvailable = useJournalStore((state) => state.moveToAvailable);
  const moveToActive = useJournalStore((state) => state.moveToActive);

  // Move question from selected list to available list (Clicking Minus)
  const handleRemoveQuestion = (qToRemove: QuestionDef) => {
    moveToAvailable(qToRemove);
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

    if (isReordering) {
      initialReorderKeysRef.current = [...initialReorderKeysRef.current, qToAdd.key];
      setReorderDraftQuestions((prev) => [...prev, qToAdd]);
      setAvailableQuestions(availableQuestions.filter((item) => item.key !== qToAdd.key));
      return;
    }

    moveToActive(qToAdd);
  };

  const handleRowLongPress = (q: QuestionDef, from: 'active' | 'available', e: any) => {
    if (isReordering) return;
    const { pageX, pageY } = e.nativeEvent;
    setContextMenu({
      question: q,
      from,
      anchorX: pageX || screenWidth / 2,
      anchorY: pageY || 300,
    });
  };

  const initialReorderKeysRef = useRef<string[]>([]);
  const initialAvailableQuestionsRef = useRef<QuestionDef[]>([]);

  const handleStartReorder = () => {
    setContextMenu(null);
    const initialList = [...questions];
    initialReorderKeysRef.current = initialList.map((q) => q.key);
    initialAvailableQuestionsRef.current = [...availableQuestions];
    setReorderDraftQuestions(initialList);
    setIsReordering(true);
  };

  const moveQuestionIndex = useCallback((fromIndex: number, toIndex: number) => {
    setReorderDraftQuestions((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  }, []);

  const handleSaveReorder = () => {
    setQuestions(reorderDraftQuestions);
    setIsReordering(false);
    setDraggingKey(null);
    initialReorderKeysRef.current = [];
    initialAvailableQuestionsRef.current = [];
  };

  const handleCancelReorder = () => {
    if (initialAvailableQuestionsRef.current.length > 0) {
      setAvailableQuestions(initialAvailableQuestionsRef.current);
    }
    setIsReordering(false);
    setDraggingKey(null);
    initialReorderKeysRef.current = [];
    initialAvailableQuestionsRef.current = [];
  };

  const handleHistoryLongPress = (record: JournalHistoryRecord, e: any) => {
    const { pageX, pageY } = e.nativeEvent;
    setHistoryContextMenu({
      record,
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
        dataType: q.dataType || '',
        placeholderText: q.placeholderText || '',
        scaleRange: q.scaleRange || '',
        stepLabels: q.stepLabels ? JSON.stringify(q.stepLabels) : '',
        unit: q.unit || '',
        stepSize: q.stepSize !== undefined ? String(q.stepSize) : '',
        maxValue: q.maxValue || '',
      },
    });
  };

  // Triggers delete confirmation modal with warning sign for question (custom questions only)
  const promptDeleteQuestion = (qToDelete: QuestionDef, from: 'active' | 'available') => {
    setContextMenu(null);
    // Safety guard: default system questions can only be disabled, never deleted
    if (qToDelete.key.startsWith('q_')) return;
    deleteQuestionInputRef.current = '';
    setCanDeleteQuestion(false);
    setDeleteConfirmTarget({ question: qToDelete, from });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget || !canDeleteQuestion) return;
    const { question, from } = deleteConfirmTarget;
    if (from === 'active') {
      setQuestions((prev) => prev.filter((q) => q.key !== question.key));
    } else {
      setAvailableQuestions((prev) => prev.filter((q) => q.key !== question.key));
    }
    deleteQuestionInputRef.current = '';
    setCanDeleteQuestion(false);
    setDeleteConfirmTarget(null);
  };

  // Opens delete log flow (single modal with "delete" verification)
  const promptDeleteLog = (record: JournalHistoryRecord) => {
    setHistoryContextMenu(null);
    deleteLogInputRef.current = '';
    setCanDeleteLog(false);
    setDeleteLogTarget(record);
  };

  // User typed "delete" correctly -> actually delete the record
  const handleDeleteLogConfirm = () => {
    if (!deleteLogTarget || !canDeleteLog) return;
    deleteHistoryRecord(deleteLogTarget.id);
    deleteLogInputRef.current = '';
    setCanDeleteLog(false);
    setDeleteLogTarget(null);
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

  // History Records State from Store
  const historyRecords = useJournalStore((state) => state.historyRecords);
  const setHistoryRecords = useJournalStore((state) => state.setHistoryRecords);
  const deleteHistoryRecord = useJournalStore((state) => state.deleteHistoryRecord);
  const pendingReanswerKey = useJournalStore((state) => state.pendingReanswerKey);
  const setPendingReanswerKey = useJournalStore((state) => state.setPendingReanswerKey);

  // Auto-open slide for re-answering today's reset question
  const journalSheetRef = useRef<JournalQuestionSheetRef>(null);

  useEffect(() => {
    if (!pendingReanswerKey) return;
    const targetKey = pendingReanswerKey;
    setPendingReanswerKey(null);

    const todayRecord = historyRecords.find(
      (r) => r.dateStr.toLowerCase() === 'today' || r.id === 'rec-1'
    );
    if (!todayRecord) return;

    const updatedAnswers = { ...(todayRecord.answers || {}) };
    delete updatedAnswers[targetKey];
    const modifiedRecord = { ...todayRecord, answers: updatedAnswers };

    setTimeout(() => {
      journalSheetRef.current?.present(modifiedRecord, targetKey);
    }, 250);
  }, [pendingReanswerKey, questions, historyRecords]);



  // Filtered History Records by timeline
  const filteredHistory = useMemo(() => {
    return historyRecords.filter((item) => {
      if (appliedFromDate && item.isoDate < appliedFromDate) return false;
      if (appliedTillDate && item.isoDate > appliedTillDate) return false;
      return true;
    });
  }, [historyRecords, appliedFromDate, appliedTillDate]);

  const hasTimelineFilter = Boolean(appliedFromDate || appliedTillDate);

  const hasReorderChanged = useMemo(() => {
    if (!isReordering) return false;
    const initialKeys = initialReorderKeysRef.current;
    if (initialKeys.length === 0) return false;
    // Check if initial items changed their relative positions
    for (let i = 0; i < Math.min(initialKeys.length, reorderDraftQuestions.length); i++) {
      if (reorderDraftQuestions[i].key !== initialKeys[i]) {
        return true;
      }
    }
    return false;
  }, [isReordering, reorderDraftQuestions]);

  const renderHeaderAndToggle = () => (
    <>
      {/* 1. Main Header: Back | "Your Daily Journal" | Filter pill (in History) or "Add new" pill (in Questionnaire) */}
      <View 
        style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: responsivePadding }]}
      >
        <View style={styles.headerLeft}>
          {router.canGoBack() && (
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
          )}

          <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111827' }]} numberOfLines={1}>
            Your Daily Journal
          </Text>
        </View>

        {/* Dynamic Action Pill: Filter for History, Add New / Cancel Reorder for Questionnaire */}
        {activeTab === 'history' ? (
          <Pressable
            onPress={() => setIsFilterModalOpen(true)}
            style={({ pressed }) => [
              styles.actionPillBtn,
              {
                backgroundColor: hasTimelineFilter ? primaryColor : (isDark ? '#1c1c1e' : '#ffffff'),
                borderColor: hasTimelineFilter ? primaryColor : (isDark ? '#27272a' : 'rgba(0,0,0,0.1)'),
                borderWidth: 1,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            hitSlop={8}
          >
            <SlidersHorizontal 
              size={15} 
              color={hasTimelineFilter ? '#ffffff' : (isDark ? '#ffffff' : '#111827')} 
              strokeWidth={2.2} 
            />
            <Text 
              style={[
                styles.actionPillText, 
                { 
                  color: hasTimelineFilter ? '#ffffff' : (isDark ? '#ffffff' : '#111827')
                }
              ]}
            >
              Filter
            </Text>
          </Pressable>
        ) : isReordering ? (
          hasReorderChanged ? (
            <Pressable
              onPress={handleSaveReorder}
              style={({ pressed }) => [
                styles.actionPillBtn,
                {
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  borderWidth: 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              hitSlop={8}
            >
              <Check size={15} color="#ffffff" strokeWidth={2.6} />
              <Text style={[styles.actionPillText, { color: '#ffffff' }]}>
                Save
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleCancelReorder}
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
              <X size={15} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.4} />
              <Text style={[styles.actionPillText, { color: isDark ? '#ffffff' : '#111827' }]}>
                Cancel
              </Text>
            </Pressable>
          )
        ) : (
          <Pressable
            onPress={() => {
              try {
                router.navigate('/add-journal-question' as any);
              } catch (err) {
                console.error('Navigation error:', err);
              }
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
      <View 
        style={[styles.toggleContainer, { paddingHorizontal: responsivePadding }]}
      >
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
    </>
  );

  return (
    <View 
      style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}
    >
      {/* Unified Header & Toggle (Stays in place, display below switches) */}
      {renderHeaderAndToggle()}

      {/* 3. Main Content Views (Horizontally Slideable Pager) */}
      <ScrollView
        ref={horizontalPagerRef}
        horizontal
        pagingEnabled
        scrollEnabled={!draggingKey}
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleHorizontalScrollEnd}
        style={{ flex: 1 }}
      >
        {/* Page 1: History Tab */}
        <View style={{ width: screenWidth, flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingHorizontal: responsivePadding, paddingTop: 0, paddingBottom: 16 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View 
              style={[styles.historyList, filteredHistory.length === 0 && { flex: 1, justifyContent: 'center' }]}
            >
              {!isJournalReady ? (
                <>
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                  <HistoryCardSkeleton isDark={isDark} />
                </>
              ) : filteredHistory.length > 0 ? (
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
                      onPress={() => journalSheetRef.current?.present(item)}
                      onLongPress={(e) => handleHistoryLongPress(item, e)}
                      delayLongPress={300}
                      style={({ pressed }) => [
                        styles.historyCardBox,
                        isDark ? styles.historyCardBoxDark : styles.historyCardBoxLight,
                        pressed && {
                          backgroundColor: isDark ? '#27272a' : '#f0f0f2',
                        },
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
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                                borderStyle: 'solid',
                              },
                            ]}
                          >
                            <Check 
                              size={20} 
                              color='#ffffff' 
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
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                                borderStyle: 'solid',
                              },
                            ]}
                          >
                            <X 
                              size={20} 
                              color='#ffffff' 
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
                    {hasTimelineFilter ? 'No result found' : 'No journal history yet'}
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                    {hasTimelineFilter
                      ? 'Try adjusting your filter.'
                      : 'Your completed daily routines and check-ins will appear here.'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Page 2: Questionnaire Tab */}
        <View style={{ width: screenWidth, flex: 1 }}>
          {!isQuestionnaireReady ? (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent, 
                { paddingHorizontal: responsivePadding, paddingTop: 0, paddingBottom: 16 }
              ]}
              showsVerticalScrollIndicator={false}
            >
              <QuestionnaireSkeleton isDark={isDark} responsivePadding={responsivePadding} questions={questions} availableQuestions={availableQuestions} />
            </ScrollView>
          ) : (
            <ScrollView
              scrollEnabled={!draggingKey}
              contentContainerStyle={[
                styles.scrollContent, 
                { paddingHorizontal: responsivePadding, paddingTop: 0, paddingBottom: 16 }
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Section 1: Active / Selected Questions Container */}
            <View style={styles.categoriesSectionHeader}>
              <Text style={[styles.categoriesSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                {isReordering ? 'Reorder Questions' : 'Active Questions'}
              </Text>
              <Text style={[styles.categoriesSectionCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                {isReordering ? 'Hold & move around' : `${questions.length} included`}
              </Text>
            </View>

            <View 
              style={[
                styles.categoriesCard, 
                isDark ? styles.categoriesCardDark : styles.categoriesCardLight,
                isReordering && { overflow: 'visible' }
              ]}
            >
              {isReordering ? (
                reorderDraftQuestions.map((q, idx) => {
                  const isLastItem = idx === reorderDraftQuestions.length - 1;
                  const isBeingDragged = draggingKey === q.key;

                  return (
                    <Animated.View
                      key={`reorder-${q.key}`}
                      layout={questionRowLayoutTransition}
                      style={[
                        isBeingDragged && { zIndex: 9999, elevation: 20 }
                      ]}
                    >
                      <View
                        onStartShouldSetResponder={() => true}
                        onMoveShouldSetResponder={() => true}
                        onStartShouldSetResponderCapture={() => true}
                        onMoveShouldSetResponderCapture={() => true}
                        onResponderTerminationRequest={() => false}
                        onResponderGrant={(evt) => {
                          const startY = evt.nativeEvent.pageY;
                          dragStartPageYRef.current = startY;
                          lastSwapPageYRef.current = startY;
                          setDraggingKey(q.key);
                        }}
                        onResponderMove={(evt) => {
                          const currentKey = draggingKey || q.key;
                          if (!currentKey) return;
                          const currentIdx = reorderDraftQuestions.findIndex((item) => item.key === currentKey);
                          if (currentIdx === -1) return;

                          const currentY = evt.nativeEvent.pageY;
                          const diffFromLastSwap = currentY - lastSwapPageYRef.current;
                          const ROW_HEIGHT = 44;

                          if (diffFromLastSwap < -ROW_HEIGHT && currentIdx > 0) {
                            lastSwapPageYRef.current = currentY;
                            moveQuestionIndex(currentIdx, currentIdx - 1);
                          } else if (diffFromLastSwap > ROW_HEIGHT && currentIdx < reorderDraftQuestions.length - 1) {
                            lastSwapPageYRef.current = currentY;
                            moveQuestionIndex(currentIdx, currentIdx + 1);
                          }
                        }}
                        onResponderRelease={() => {
                          setDraggingKey(null);
                        }}
                        onResponderTerminate={() => {
                          setDraggingKey(null);
                        }}
                        style={[
                          styles.categoryItemRow,
                          !isLastItem && !isBeingDragged && [
                            styles.categoryItemDivider,
                            { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' },
                          ],
                          isBeingDragged && [
                            styles.reorderRowDragging,
                            {
                              backgroundColor: isDark ? '#27272a' : '#ffffff',
                              borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                              borderWidth: 1,
                              transform: [{ scale: 1.03 }],
                            },
                          ],
                        ]}
                      >
                        {/* 1, 2, 3, 4, 5, 6 Circle in place of Minus icon with primaryColor background */}
                        <View
                          style={[
                            styles.actionIconCircle,
                            {
                              backgroundColor: primaryColor,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.reorderIndexText,
                              { color: '#ffffff' },
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        </View>

                        {/* Question Subtitle / Title */}
                        <View style={styles.categoryLabelWrapper}>
                          <Text style={[styles.categoryTitleText, { color: isDark ? '#ffffff' : '#111827' }]}>
                            {q.subtitle}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })
              ) : questions.length > 0 ? (
                questions.map((q, idx) => {
                  const isLastItem = idx === questions.length - 1;
                  return (
                    <Animated.View
                      key={`active-${q.key}`}
                      layout={questionRowLayoutTransition}
                      entering={questionRowEntering}
                      exiting={questionRowExiting}
                    >
                      <Pressable
                        onPress={() => handleRemoveQuestion(q)}
                        onLongPress={(e) => handleRowLongPress(q, 'active', e)}
                        delayLongPress={350}
                        unstable_pressDelay={0}
                        style={({ pressed }) => [
                          styles.categoryItemRow,
                          !isLastItem && [
                            styles.categoryItemDivider,
                            { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' },
                          ],
                          { opacity: pressed ? 0.75 : 1 },
                        ]}
                      >
                        {/* Minus Action Button with Primary Color */}
                        <View
                          style={[
                            styles.actionIconCircle,
                            {
                              backgroundColor: primaryColor,
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
            <View style={styles.categoriesSectionHeader}>
              <Text style={[styles.categoriesSectionTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                Available Questions
              </Text>
              <Text style={[styles.categoriesSectionCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                {availableQuestions.length} available
              </Text>
            </View>

            <View style={[styles.categoriesCard, isDark ? styles.categoriesCardDark : styles.categoriesCardLight]}>
              {availableQuestions.length > 0 ? (
                availableQuestions.map((q, idx) => {
                  const isLastItem = idx === availableQuestions.length - 1;
                    const isDisabled = Boolean(q.disabled);

                    return (
                      <Animated.View
                        key={`avail-${q.key}`}
                        layout={questionRowLayoutTransition}
                        entering={questionRowEntering}
                        exiting={questionRowExiting}
                      >
                        <Pressable
                          onPress={(e) => handleAddQuestion(q, e)}
                          onLongPress={(e) => handleRowLongPress(q, 'available', e)}
                          delayLongPress={350}
                          unstable_pressDelay={0}
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
                          {/* Plus Action Button (Primary Color if enabled, Gray if disabled) */}
                          <View
                            style={[
                              styles.actionIconCircle,
                              {
                                backgroundColor: isDisabled ? '#9ca3af' : primaryColor,
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
                        </Pressable>
                      </Animated.View>
                    );
                  })
                ) : (
                  <Animated.View
                    entering={questionRowEntering}
                    style={styles.emptyCategoriesBox}
                  >
                    <Text style={[styles.emptyCategoriesText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                      No available questions
                    </Text>
                  </Animated.View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Timeline Filter Modal (Isolated Component) */}
      {isFilterModalOpen && (
        <JournalTimelineFilterModal
          visible={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          isDark={isDark}
          primaryColor={primaryColor}
          appliedFrom={appliedFromDate}
          appliedTill={appliedTillDate}
          onApply={(from, till) => {
            setAppliedFromDate(from);
            setAppliedTillDate(till);
          }}
        />
      )}

      {isJournalReady && <JournalQuestionSheet ref={journalSheetRef} />}

      {/* Floating Context Menu Popup on Long Press */}
      <Modal
        visible={contextMenu !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setContextMenu(null)}
      >
        <View style={styles.contextMenuOverlay}>
          <TouchableOpacity
            style={styles.contextMenuBackdrop}
            onPress={() => setContextMenu(null)}
            activeOpacity={1}
          />
          {contextMenu && (
            <Animated.View
              entering={Platform.OS !== 'android' ? FadeInDown.duration(160) : undefined}
              exiting={Platform.OS !== 'android' ? FadeOutUp.duration(100) : undefined}
              style={[
                styles.contextMenuCard,
                {
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e5e7eb',
                  top: Math.min(
                    Math.max(contextMenu.anchorY - 30, insets.top + 40),
                    Dimensions.get('window').height - insets.bottom - 210
                  ),
                  left: Math.min(Math.max(contextMenu.anchorX - 50, 16), Dimensions.get('window').width - 165),
                },
              ]}
            >
              {/* Menu Options: Edit, Reorder (active only), Disable/Enable, Delete */}
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

                {contextMenu.from === 'active' && questions.length > 1 && (
                  <TouchableOpacity
                    style={styles.contextMenuItem}
                    onPress={handleStartReorder}
                    activeOpacity={0.7}
                  >
                    <ArrowUpDown size={16} color={isDark ? '#fafafa' : '#18181b'} />
                    <Text style={[styles.contextMenuText, { color: isDark ? '#fafafa' : '#18181b' }]}>
                      Reorder
                    </Text>
                  </TouchableOpacity>
                )}

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

                {/* Delete Option: Only visible for custom user-created questions, never default system questions */}
                {!contextMenu.question.key.startsWith('q_') && (
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
                )}
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* Floating History Context Menu Popup on Long Press */}
      <Modal
        visible={historyContextMenu !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setHistoryContextMenu(null)}
      >
        <View style={styles.contextMenuOverlay}>
          <TouchableOpacity
            style={styles.contextMenuBackdrop}
            onPress={() => setHistoryContextMenu(null)}
            activeOpacity={1}
          />
          {historyContextMenu && (
            <Animated.View
              entering={Platform.OS !== 'android' ? FadeInDown.duration(160) : undefined}
              exiting={Platform.OS !== 'android' ? FadeOutUp.duration(100) : undefined}
              style={[
                styles.contextMenuCard,
                {
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e5e7eb',
                  top: Math.min(
                    Math.max(historyContextMenu.anchorY - 30, insets.top + 40),
                    Dimensions.get('window').height - insets.bottom - 170
                  ),
                  left: Math.min(Math.max(historyContextMenu.anchorX - 50, 16), Dimensions.get('window').width - 165),
                },
              ]}
            >
              {/* Menu Options: Edit & Delete (No disable) */}
              <View style={styles.itemsWrapper}>
                <TouchableOpacity
                  style={styles.contextMenuItem}
                  onPress={() => {
                    const record = historyContextMenu.record;
                    setHistoryContextMenu(null);
                    journalSheetRef.current?.present(record);
                  }}
                  activeOpacity={0.7}
                >
                  <Pencil size={16} color={isDark ? '#fafafa' : '#18181b'} />
                  <Text style={[styles.contextMenuText, { color: isDark ? '#fafafa' : '#18181b' }]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contextMenuItem}
                  onPress={() => {
                    promptDeleteLog(historyContextMenu.record);
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={[styles.contextMenuText, { color: '#ef4444' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* Delete Question Confirmation Modal (Matches Profile Delete Account Modal UI) */}
      <Modal
        visible={deleteConfirmTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmTarget(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeleteConfirmTarget(null)}
        >
          <Pressable
            style={[styles.confirmDeleteCard, isDark ? styles.confirmDeleteCardDark : styles.confirmDeleteCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.confirmDeleteIconWrapper, isDark ? { backgroundColor: '#3f1f1f' } : { backgroundColor: '#fee2e2' }]}>
              <AlertTriangle size={28} color="#ef4444" strokeWidth={2.2} />
            </View>

            <Text style={[styles.confirmDeleteTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Delete Question
            </Text>

            <Text style={[styles.confirmDeleteSubtitle, { color: isDark ? '#a1a1aa' : '#4b5563' }]}>
              Are you sure you want to delete this question? You will lose all your data and past responses for it.
            </Text>

            <Text style={[styles.deleteInstruction, { color: isDark ? '#e4e4e7' : '#374151' }]}>
              Type <Text style={{ fontWeight: '700', color: '#ef4444' }}>delete</Text> below to confirm:
            </Text>

            <TextInput
              key={`delete-q-${deleteConfirmTarget ? deleteConfirmTarget.question.key : 'closed'}`}
              style={[styles.deleteConfirmationInput, isDark ? styles.deleteConfirmationInputDark : styles.deleteConfirmationInputLight]}
              placeholder="delete"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              defaultValue={deleteQuestionInputRef.current}
              onChangeText={(val) => {
                deleteQuestionInputRef.current = val;
                const matches = val.trim().toLowerCase() === 'delete';
                if (matches !== canDeleteQuestion) {
                  setCanDeleteQuestion(matches);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline={false}
              scrollEnabled={false}
              returnKeyType="done"
              blurOnSubmit={true}
            />

            <View style={styles.confirmDeleteActionsRow}>
              <Pressable
                style={({ pressed }) => [styles.confirmCancelBtn, isDark ? styles.confirmCancelBtnDark : styles.confirmCancelBtnLight, { opacity: pressed ? 0.75 : 1 }]}
                onPress={() => {
                  deleteQuestionInputRef.current = '';
                  setCanDeleteQuestion(false);
                  setDeleteConfirmTarget(null);
                }}
              >
                <Text style={[styles.confirmCancelText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmDeleteBtn,
                  { backgroundColor: canDeleteQuestion ? '#ef4444' : (isDark ? '#27272a' : '#e5e7eb'), opacity: pressed ? 0.85 : 1 },
                ]}
                disabled={!canDeleteQuestion}
                onPress={handleConfirmDelete}
              >
                <Text style={[styles.confirmDeleteText, { color: canDeleteQuestion ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Log Confirmation Modal (Matches Profile Delete Account Modal UI) */}
      <Modal
        visible={deleteLogTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteLogTarget(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDeleteLogTarget(null)}
        >
          <Pressable
            style={[styles.confirmDeleteCard, isDark ? styles.confirmDeleteCardDark : styles.confirmDeleteCardLight]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.confirmDeleteIconWrapper, isDark ? { backgroundColor: '#3f1f1f' } : { backgroundColor: '#fee2e2' }]}>
              <AlertTriangle size={28} color="#ef4444" strokeWidth={2.2} />
            </View>

            <Text style={[styles.confirmDeleteTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
              Delete Log
            </Text>

            <Text style={[styles.confirmDeleteSubtitle, { color: isDark ? '#a1a1aa' : '#4b5563' }]}>
              Are you sure you want to delete this journal entry for {deleteLogTarget?.dateStr}? You will lose your current log data.
            </Text>

            <Text style={[styles.deleteInstruction, { color: isDark ? '#e4e4e7' : '#374151' }]}>
              Type <Text style={{ fontWeight: '700', color: '#ef4444' }}>delete</Text> below to confirm:
            </Text>

            <TextInput
              key={`delete-log-${deleteLogTarget ? deleteLogTarget.id : 'closed'}`}
              style={[styles.deleteConfirmationInput, isDark ? styles.deleteConfirmationInputDark : styles.deleteConfirmationInputLight]}
              placeholder="delete"
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              defaultValue={deleteLogInputRef.current}
              onChangeText={(val) => {
                deleteLogInputRef.current = val;
                const matches = val.trim().toLowerCase() === 'delete';
                if (matches !== canDeleteLog) {
                  setCanDeleteLog(matches);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              multiline={false}
              scrollEnabled={false}
              returnKeyType="done"
              blurOnSubmit={true}
            />

            <View style={styles.confirmDeleteActionsRow}>
              <Pressable
                style={({ pressed }) => [styles.confirmCancelBtn, isDark ? styles.confirmCancelBtnDark : styles.confirmCancelBtnLight, { opacity: pressed ? 0.75 : 1 }]}
                onPress={() => {
                  deleteLogInputRef.current = '';
                  setCanDeleteLog(false);
                  setDeleteLogTarget(null);
                }}
              >
                <Text style={[styles.confirmCancelText, { color: isDark ? '#ffffff' : '#111827' }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmDeleteBtn,
                  { backgroundColor: canDeleteLog ? '#ef4444' : (isDark ? '#27272a' : '#e5e7eb'), opacity: pressed ? 0.85 : 1 },
                ]}
                disabled={!canDeleteLog}
                onPress={handleDeleteLogConfirm}
              >
                <Text style={[styles.confirmDeleteText, { color: canDeleteLog ? '#ffffff' : (isDark ? '#71717a' : '#9ca3af') }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

