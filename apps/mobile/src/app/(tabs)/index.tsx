import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';
import { Flame, ChevronLeft, ChevronRight, Sparkles, Moon, Sun, CalendarDays, User, Plus, ScanFace, Clock } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { CustomClockIcon } from '@/components/custom-icons';
import LottieView from 'lottie-react-native';
import fireAnimation from '../../../assets/animations/fire.json';
import { BlurView } from 'expo-blur';
import { useScanStore } from '@/store/scanStore';
import * as Clipboard from 'expo-clipboard';
import RoutineCard from '@/components/routine/RoutineCard';
import RoutineDeleteModal from '@/components/routine/RoutineDeleteModal';
import { MOCK_SCANS } from '@/constants/mockScans';
import ConnectingDots from '@/components/ConnectingDots';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  Easing,
} from 'react-native-reanimated';

// Created once at module level — never recreated on render
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const METRIC_NAMES = [
  { name: 'Forehead', accent: '#a855f7' },
  { name: 'Nose',     accent: '#ec4899' },
  { name: 'Chin',     accent: '#14b8a6' },
  { name: 'L Cheek',  accent: '#f59e0b' },
  { name: 'R Cheek',  accent: '#10b981' },
  { name: 'Jawline',  accent: '#3b82f6' },
  { name: 'T-Zone',   accent: '#6366f1' },
  { name: 'U-Zone',   accent: '#8b5cf6' },
  { name: 'Under Eye',accent: '#ef4444' },
];

const SCORES_BY_DAY = [
  { overall: 81, metrics: [72, 65, 78, 80, 85, 89, 74, 82, 68] }, // Monday
  { overall: 85, metrics: [74, 68, 80, 82, 88, 91, 76, 85, 70] }, // Tuesday (Today)
  { overall: 78, metrics: [69, 62, 73, 76, 81, 84, 70, 78, 64] }, // Wednesday
  { overall: 83, metrics: [72, 66, 78, 80, 86, 89, 74, 83, 69] }, // Thursday
  { overall: 86, metrics: [75, 70, 82, 84, 89, 92, 78, 86, 72] }, // Friday
  { overall: 89, metrics: [78, 73, 85, 87, 92, 95, 81, 89, 75] }, // Saturday
  { overall: 87, metrics: [76, 71, 83, 85, 90, 93, 79, 87, 73] }  // Sunday
];

const getSkinFeedback = (score: number) => {
  if (score >= 85) {
    return "“You have a glowing skin. Keep up your current routine to maintain this healthy radiance!”";
  } else if (score >= 75) {
    return "“Your skin is in good condition. Just a little more hydration will make it perfect!”";
  } else {
    return "“Your skin score is a bit low today. Make sure to follow your routines and stay hydrated.”";
  }
};

const getMetricColor = (score: number) => {
  if (score >= 80) return '#22c55e'; // Green
  if (score >= 65) return '#f59e0b'; // Yellow/Orange
  return '#ef4444'; // Red
};

function AnimatedScoreItem({
  dayIndex,
  scoreVal,
  dayMeta,
  feedbackText,
  isDark,
  itemWidth,
  shouldAnimate,
  animationKey,
}: {
  dayIndex: number;
  scoreVal: number;
  dayMeta: { label: string; dateStr: string };
  feedbackText: string;
  isDark: boolean;
  itemWidth: number;
  shouldAnimate: boolean;
  animationKey: number;
}) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  // Shared value lives on the UI thread — never touches JS thread during animation
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (shouldAnimate) {
      progress.value = 0;
      opacity.value = 0;
      
      // Smooth fade-in so initial zero is never seen frozen
      opacity.value = withTiming(1, { duration: 250 });
      progress.value = withTiming(1, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = 1;
      opacity.value = 1;
    }
  }, [scoreVal, shouldAnimate, animationKey]);

  // useAnimatedProps runs on the UI thread — zero React re-renders
  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value * scoreVal / 100),
  }));

  // Number counter also runs on UI thread via AnimatedTextInput
  const animatedScoreTextProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value * scoreVal)}`,
    defaultValue: `${Math.round(progress.value * scoreVal)}`,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ width: itemWidth, height: 355, alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Dynamic Guidance Header inside slidable card */}
      <View style={{ justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 10, marginTop: 5, marginBottom: 15, height: 95 }}>
        <View style={{
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)',
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 12,
          marginBottom: 8,
        }}>
          <Text style={{ color: isDark ? '#ffffff' : '#1a1a1a', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {dayMeta.label}
          </Text>
        </View>
        <Text style={{
          color: isDark ? '#ffffff' : '#1a1a1a',
          fontSize: 17,
          fontWeight: '800',
          textAlign: 'center',
          lineHeight: 23,
          fontStyle: 'italic',
          paddingHorizontal: 12,
        }}>
          {feedbackText}
        </Text>
      </View>

      {/* Overall Skin Score Arc Circle */}
      <View style={{ alignItems: 'center', justifyContent: 'center', width: 240, height: 240 }}>
        <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute' }}>
          <Defs>
            <LinearGradient id={`scoreGrad-${dayIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#937abd" />
              <Stop offset="100%" stopColor="#d6cbe8" />
            </LinearGradient>
          </Defs>
          {/* Background Track Circle */}
          <Circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={isDark ? 'rgba(147, 122, 189, 0.2)' : '#e8e3f1'}
            strokeWidth={16}
          />
          {/* Animated Active Progress Circle — driven by UI thread */}
          <AnimatedCircle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={`url(#scoreGrad-${dayIndex})`}
            strokeWidth={16}
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform="rotate(-90 120 120)"
            animatedProps={animatedArcProps}
          />
        </Svg>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <AnimatedTextInput
            animatedProps={animatedScoreTextProps}
            editable={false}
            underlineColorAndroid="transparent"
            style={[
              {
                color: isDark ? '#ffffff' : '#1a1a1a',
                fontSize: 72,
                fontWeight: '300',
                lineHeight: 80,
                textAlign: 'center',
                padding: 0,
                margin: 0,
                minWidth: 120,
                backgroundColor: 'transparent',
              },
              animatedTextStyle,
            ]}
          />
          <Text style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontSize: 13, fontWeight: '400', marginTop: 5 }}>
            Overall Skin Score
          </Text>
        </View>
      </View>
    </View>
  );
}

function AnimatedMetricNode({
  metric,
  isDark,
  pageWidth,
}: {
  metric: { id: string; name: string; score: number; accent: string };
  isDark: boolean;
  pageWidth: number;
}) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  // Shared value lives on the UI thread
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
  }, [metric.score]);

  // Both props computed on UI thread — zero React re-renders
  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value * metric.score / 100),
  }));

  const animatedTextProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value * metric.score)}%`,
    defaultValue: `${Math.round(progress.value * metric.score)}%`,
  }));

  return (
    <View style={{ alignItems: 'center', width: (pageWidth - 20) / 3 }}>
      <View style={{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Defs>
            <LinearGradient id={`metricGrad-${metric.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#937abd" />
              <Stop offset="100%" stopColor="#d6cbe8" />
            </LinearGradient>
          </Defs>
          {/* Background track circle */}
          <Circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={isDark ? 'rgba(147, 122, 189, 0.2)' : '#e8e3f1'}
            strokeWidth={7}
          />
          {/* Animated progress arc — driven by UI thread */}
          <AnimatedCircle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={`url(#metricGrad-${metric.id})`}
            strokeWidth={7}
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            animatedProps={animatedArcProps}
          />
        </Svg>
        <AnimatedTextInput
          animatedProps={animatedTextProps}
          editable={false}
          underlineColorAndroid="transparent"
          style={{
            position: 'absolute',
            color: isDark ? '#ffffff' : '#1a1a1a',
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
            padding: 0,
            margin: 0,
            backgroundColor: 'transparent',
            minWidth: 44,
          }}
        />
      </View>
      <Text style={{ color: isDark ? '#ffffff' : '#1a1a1a', fontSize: 13, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
        {metric.name}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const imageUri = useScanStore((state) => state.imageUri);
  const scanResult = useScanStore((state) => state.scanResult);

  const flatRef = useRef<FlatList>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const metricsScrollX = useSharedValue(0);
  const metricsScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      metricsScrollX.value = e.contentOffset.x;
    },
  });
  const [routines, setRoutines] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; avatarUri: string | null } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<any>(null);

  // Scroll lock: only one horizontal carousel scrolls at a time
  const activeScrollRef = useRef<'routines' | 'scans' | null>(null);


  const handleDeleteClick = (routine: any) => {
    setRoutineToDelete(routine);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (routineToDelete) {
      const newRoutines = routines.filter((r: any) => r.id !== routineToDelete.id);
      setRoutines(newRoutines);
      try {
        await AsyncStorage.setItem('routines', JSON.stringify(newRoutines));
      } catch (e) {
        console.error("Failed to delete routine", e);
      }
    }
    setDeleteConfirmOpen(false);
    setRoutineToDelete(null);
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Load stored routines and profile on screen focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const stored = await AsyncStorage.getItem('routines');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.sort((a: any, b: any) => {
              const timeA = new Date(a.createdAt || a.updatedAt || parseInt(a.id) || 0).getTime();
              const timeB = new Date(b.createdAt || b.updatedAt || parseInt(b.id) || 0).getTime();
              return timeB - timeA;
            });
            setRoutines(parsed);
          } else {
            setRoutines([]);
          }
          const storedProfile = await AsyncStorage.getItem('user_profile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          }
        } catch (e) {
          console.error("Failed to load routines on home", e);
        }
      };
      loadData();
    }, [])
  );

  // Generate current week dates dynamically
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);

    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: dayLabels[i],
        dateNum: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Find index of today in weekDays (0 to 6)
  const today = new Date();
  const currentDay = today.getDay();
  const todayIdx = currentDay === 0 ? 6 : currentDay - 1;
  const [selectedDayIdx, setSelectedDayIdx] = useState(todayIdx);

  // Dynamically calculate metadata and date string for any day index (0=Mon .. 6=Sun) based on current device time
  const getDayMetadata = (dayIdx: number) => {
    const todayDate = new Date();
    const currentDayVal = todayDate.getDay();
    const distanceToMon = currentDayVal === 0 ? -6 : 1 - currentDayVal;
    
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() + distanceToMon + dayIdx);
    
    const dayNum = targetDate.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = monthNames[targetDate.getMonth()];
    const yearNum = targetDate.getFullYear();
    const dateStr = `${dayNum} ${monthStr} ${yearNum}`;
    
    const todayIndexVal = currentDayVal === 0 ? 6 : currentDayVal - 1;
    
    let label = `guidance ${dateStr}`;
    if (dayIdx === todayIndexVal) {
      label = `TODAY'S GUIDANCE`;
    } else if (dayIdx === todayIndexVal - 1) {
      label = `YESTERDAY'S GUIDANCE`;
    }
    
    return { label, dateStr };
  };

  const dayMeta = getDayMetadata(selectedDayIdx);

  // Generate an array of day indices [0..6] for the overall score flatlist/pager
  const daysArray = [0, 1, 2, 3, 4, 5, 6];

  // Ref to synchronize or scroll to today on load
  const scorePagerRef = useRef<FlatList>(null);
  
  // Callback when user slides the main score block
  const handleScoreScrollEnd = (e: any) => {
    const slideWidth = SCREEN_WIDTH - 40; // width of the slidable container
    const xOffset = e.nativeEvent.contentOffset.x;
    const newIdx = Math.round(xOffset / slideWidth);
    if (newIdx >= 0 && newIdx < 7) {
      setSelectedDayIdx(newIdx);
    }
  };

  const currentDayData = SCORES_BY_DAY[selectedDayIdx] || SCORES_BY_DAY[todayIdx];

  const dynamicMetricsPages = [
    [
      { id: '1', name: METRIC_NAMES[0].name, score: currentDayData.metrics[0], accent: METRIC_NAMES[0].accent },
      { id: '2', name: METRIC_NAMES[1].name, score: currentDayData.metrics[1], accent: METRIC_NAMES[1].accent },
      { id: '3', name: METRIC_NAMES[2].name, score: currentDayData.metrics[2], accent: METRIC_NAMES[2].accent },
    ],
    [
      { id: '4', name: METRIC_NAMES[3].name, score: currentDayData.metrics[3], accent: METRIC_NAMES[3].accent },
      { id: '5', name: METRIC_NAMES[4].name, score: currentDayData.metrics[4], accent: METRIC_NAMES[4].accent },
      { id: '6', name: METRIC_NAMES[5].name, score: currentDayData.metrics[5], accent: METRIC_NAMES[5].accent },
    ],
    [
      { id: '7', name: METRIC_NAMES[6].name, score: currentDayData.metrics[6], accent: METRIC_NAMES[6].accent },
      { id: '8', name: METRIC_NAMES[7].name, score: currentDayData.metrics[7], accent: METRIC_NAMES[7].accent },
      { id: '9', name: METRIC_NAMES[8].name, score: currentDayData.metrics[8], accent: METRIC_NAMES[8].accent },
    ]
  ];

  const nudgePage = (dir: number) => {
    const next = Math.min(Math.max(pageIndex + dir, 0), dynamicMetricsPages.length - 1);
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setPageIndex(next);
  };

  const PAGE_WIDTH = SCREEN_WIDTH - 40;



  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>

        {/* ── HERO ───────────────────────────────────── */}
        <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>

          <View style={{ paddingHorizontal: 20 }}>
            {/* Header row: Hi User + Streak pill on right */}
            <View style={styles.greetRow}>
              <View>
                <Text style={[styles.greetHi, { color: isDark ? '#ffffff' : '#1a1a1a' }]}>Hi User,</Text>
                <Text style={[styles.greetSub, { color: isDark ? 'rgba(255,255,255,0.68)' : 'rgba(0,0,0,0.6)' }]}>your overall skin today</Text>
              </View>
              <View style={[styles.streakPill, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <LottieView
                  source={fireAnimation}
                  autoPlay={true}
                  loop={true}
                  speed={1.5}
                  style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
                />
                <Text style={[styles.streakTxt, { fontSize: 15, color: isDark ? '#ffffff' : '#1a1a1a' }]}>Day 5</Text>
              </View>
            </View>

            {/* Horizontally Slidable Score + Guidance block (Optimized FlatList) */}
            <View style={{ height: 355, width: SCREEN_WIDTH - 40, alignSelf: 'center', marginBottom: 20 }}>
              <FlatList
                ref={scorePagerRef}
                data={daysArray}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH - 40}
                snapToAlignment="center"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={true}
                keyExtractor={(item) => item.toString()}
                initialScrollIndex={todayIdx}
                contentOffset={{ x: (SCREEN_WIDTH - 40) * todayIdx, y: 0 }}
                getItemLayout={(_, index) => (
                  { length: SCREEN_WIDTH - 40, offset: (SCREEN_WIDTH - 40) * index, index }
                )}
                onMomentumScrollEnd={handleScoreScrollEnd}
                renderItem={({ item: dayIndex }) => {
                  const scoreData = SCORES_BY_DAY[dayIndex] || SCORES_BY_DAY[todayIdx];
                  const scoreVal = scoreData.overall;
                  const itemMeta = getDayMetadata(dayIndex);
                  const feedbackText = getSkinFeedback(scoreVal);
                  return (
                    <AnimatedScoreItem
                      dayIndex={dayIndex}
                      scoreVal={scoreVal}
                      dayMeta={itemMeta}
                      feedbackText={feedbackText}
                      isDark={isDark}
                      itemWidth={SCREEN_WIDTH - 40}
                      shouldAnimate={dayIndex === selectedDayIdx}
                      animationKey={selectedDayIdx}
                    />
                  );
                }}
              />
            </View>

            {/* Slideable metrics grid (3 circles in a row per page) */}
            <View style={styles.metricsWrapper}>
              <Animated.FlatList
                ref={flatRef as any}
                data={dynamicMetricsPages}
                keyExtractor={(_, idx) => idx.toString()}
                horizontal
                pagingEnabled
                snapToInterval={PAGE_WIDTH}
                snapToAlignment="center"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={metricsScrollHandler}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={true}
                getItemLayout={(_, index) => (
                  { length: PAGE_WIDTH, offset: PAGE_WIDTH * index, index }
                )}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
                  setPageIndex(Math.min(Math.max(idx, 0), dynamicMetricsPages.length - 1));
                }}
                style={{ width: PAGE_WIDTH, flexGrow: 0 }}
                renderItem={({ item }) => (
                  <View style={{ width: PAGE_WIDTH, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 4 }}>
                    {item.map((metric: { id: string; name: string; score: number; accent: string }) => (
                      <AnimatedMetricNode
                        key={metric.id}
                        metric={metric}
                        isDark={isDark}
                        pageWidth={PAGE_WIDTH}
                      />
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Connecting Dots */}
            <View style={styles.dotsRow}>
              <ConnectingDots
                count={dynamicMetricsPages.length}
                scrollX={metricsScrollX}
                itemWidth={PAGE_WIDTH}
                isDark={isDark}
              />
            </View>
            
            {/* Your Routines Header & Empty/Filled Cards */}
            <View style={{ marginTop: 28, paddingHorizontal: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  letterSpacing: -0.4,
                }}>Your Routines</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/routine')}
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#ffffff' : '#000000' }}>See all</Text>
                </Pressable>
              </View>

              {routines.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4, gap: 14 }}
                  decelerationRate="fast"
                  snapToInterval={routines.length === 1 ? undefined : SCREEN_WIDTH - 40 + 14}
                  snapToAlignment="start"
                  scrollEnabled={activeScrollRef.current === null || activeScrollRef.current === 'routines'}
                  onScrollBeginDrag={() => { activeScrollRef.current = 'routines'; }}
                  onScrollEndDrag={() => { activeScrollRef.current = null; }}
                  onMomentumScrollEnd={() => { activeScrollRef.current = null; }}
                >
                  {routines.map((routine: any) => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isDark={isDark}
                      userProfile={userProfile}
                      copiedId={copiedId}
                      onCopyCode={handleCopyCode}
                      onEdit={() => router.push(`/routine/create?edit=${routine.id}`)}
                      onDelete={() => handleDeleteClick(routine)}
                      onPress={() => router.push(`/routine/${routine.id}`)}
                      onStartRoutine={() => router.push(`/routine/start?id=${routine.id}`)}
                      cardWidth={SCREEN_WIDTH - 40}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={[styles.emptyRoutineCard, isDark ? styles.cardDark : styles.cardLight]}>
                  <View style={[styles.emptyIconCircle, isDark ? styles.iconBgDark : styles.iconBgLight]}>
                    <CustomClockIcon size={26} color={isDark ? "#a1a1aa" : "#6b7280"} />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.emptyRoutineTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                      No routine added
                    </Text>
                    <Text style={[styles.emptyRoutineSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                      Start building your daily regimen to track progress.
                    </Text>
                  </View>
                  <Pressable 
                    style={[styles.createRoutineBtnSmall, { backgroundColor: Colors.light.primary }]}
                    onPress={() => router.push('/(tabs)/routine')}
                  >
                    <Plus size={14} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.createRoutineBtnTextSmall}>Create</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* ── Recent Scans Section ───────────────────── */}
            <View style={{ marginTop: 28, paddingHorizontal: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 0 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  letterSpacing: -0.4,
                }}>Recent Scans</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/scan')}
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#ffffff' : '#000000' }}>View all</Text>
                </Pressable>
              </View>

              {/* Slideable Horizontal Carousel of Recent Scans — one at a time, no skipping */}
              <FlatList
                data={MOCK_SCANS.slice(0, 6)}
                keyExtractor={(scan) => scan.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH - 40 + 14}
                snapToAlignment="start"
                disableIntervalMomentum={true}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH - 40 + 14,
                  offset: (SCREEN_WIDTH - 40 + 14) * index,
                  index,
                })}
                ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
                style={{ width: SCREEN_WIDTH - 40, overflow: 'visible' }}
                onScrollBeginDrag={() => { activeScrollRef.current = 'scans'; }}
                onScrollEndDrag={() => { activeScrollRef.current = null; }}
                onMomentumScrollEnd={() => { activeScrollRef.current = null; }}
                scrollEnabled={activeScrollRef.current === null || activeScrollRef.current === 'scans'}
                renderItem={({ item: scan }) => (
                  <Pressable
                    onPress={() => router.push(`/scan/${scan.id}` as any)}
                    style={[
                      styles.recentScanSlideCard,
                      isDark ? styles.cardDark : styles.cardLight,
                    ]}
                  >
                    <View style={styles.recentScanSlideImageWrapper}>
                      <Image
                        source={scan.image}
                        style={styles.recentScanSlideImage}
                        resizeMode="cover"
                      />

                      {/* Top-Right "View More" pill */}
                      <Pressable
                        onPress={() => router.push(`/scan/${scan.id}` as any)}
                        style={[
                          styles.viewMorePillTopRight,
                          { backgroundColor: isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.9)' }
                        ]}
                      >
                        <Text style={[styles.viewMorePillText, { color: isDark ? '#ffffff' : '#111827' }]}>
                          View More
                        </Text>
                        <ChevronRight size={12} color={isDark ? '#ffffff' : '#111827'} strokeWidth={2.5} />
                      </Pressable>

                      {/* Bottom-Left Blackish Date pill */}
                      <View style={styles.datePillBottomLeft}>
                        <Text style={styles.datePillText}>{scan.date}</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            </View>


          </View>
        </View>

      </ScrollView>

      {/* Delete Confirmation Modal */}
      <RoutineDeleteModal
        visible={deleteConfirmOpen}
        isDark={isDark}
        onClose={() => setDeleteConfirmOpen(false)}
        onDelete={executeDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Hero */
  hero: {
    paddingBottom: 16, // Reduced from 40 to eliminate extra gap below Recent Scans
    overflow: 'visible',
  },
  greetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  greetHi: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  greetSub: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.68)',
    marginTop: 0,
  },

  /* Streak pill */
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
  },
  streakPillLight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  streakPillDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  streakSep: {
    width: 1,
    height: 13,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  streakTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Score */
  scoreBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  scoreBig: {
    fontSize: 124, // Bigger size
    fontWeight: '500', // Medium thin weight
    color: '#ffffff',
    letterSpacing: -2,
    lineHeight: 128,
  },
  scoreCaption: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.58)',
    letterSpacing: 0.3,
    marginTop: -2,
  },

  /* Metrics Slider */
  metricsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  metricCard: {
    width: 100, // Fallback base size
    aspectRatio: 1.25,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  metricScore: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    zIndex: 1,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },

  /* Section */
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  /* Tangle rectangles */
  tangleContainer: {
    gap: 12,
  },
  tangleCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tangleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Nutrition-style card */
  nutritionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  feedbackQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  nutritionSubtitle: {
    fontSize: 12,
    color: 'rgba(128, 128, 128, 0.6)',
    marginTop: 2,
  },
  nutritionPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionPlusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: -2,
  },
  nutritionTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* Card Dark / Light styles */
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderWidth: 1,
  },
  iconBgLight: { backgroundColor: '#f4f4f5' },
  iconBgDark: { backgroundColor: '#27272a' },

  /* Empty Routine Card */
  emptyRoutineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyRoutineTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyRoutineSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  createRoutineBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createRoutineBtnTextSmall: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Routine Card Preview */
  routineCardPreview: {
    padding: 14,
    borderRadius: 14,
  },
  routineTitlePreview: {
    fontSize: 15,
    fontWeight: '600',
  },

  /* Slideable Recent Scan Card */
  recentScanSlideCard: {
    width: '100%',
    height: 280,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  recentScanSlideImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  recentScanSlideImage: {
    width: '100%',
    height: '100%',
  },
  viewMorePillTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  viewMorePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  datePillBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  datePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});