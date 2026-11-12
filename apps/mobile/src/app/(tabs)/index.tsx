import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  FlatList,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Text } from '@/components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';
import { Flame, ChevronLeft, ChevronRight, Sparkles, Moon, Sun, CalendarDays, Calendar, User, Plus, ScanFace, Clock, BookOpen, Check, X } from 'lucide-react-native';
import FutureLockModal from '@/components/home/FutureLockModal';
import {
  useForecastStore,
  initJournalForecastSync,
  ForecastHeroCardData,
  getInitialDayGlobalIndex,
  getDateForGlobalIndex,
  toDateKey,
  resolveRecordDate,
} from '@/store/forecastStore';

// Initialize global auto-listener between journal store edits and the forecast rules engine
initJournalForecastSync();
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { CustomClockIcon } from '@/components/custom-icons';
import LottieView from 'lottie-react-native';
import fireAnimation from '../../../assets/animations/fire.json';
import { BlurView } from 'expo-blur';
import { useScanStore } from '@/store/scanStore';
import { useJournalStore } from '@/store/journalStore';
import * as Clipboard from 'expo-clipboard';
import { JournalQuestionSheet, JournalQuestionSheetRef } from '@/components/journal/JournalQuestionSheet';
import { MOCK_SCANS } from '@/constants/mockScans';
import ConnectingDots from '@/components/ConnectingDots';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
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

const getForecastForDay = (globalIndex: number): ForecastHeroCardData => {
  return useForecastStore.getState().getForecastForDay(globalIndex);
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
  onInfoPress,
}: {
  dayIndex: number;
  scoreVal: number;
  dayMeta: { label: string; dateStr: string };
  feedbackText: string;
  isDark: boolean;
  itemWidth: number;
  shouldAnimate: boolean;
  animationKey: number;
  onInfoPress: (logDays: number, origin: { x: number; y: number }) => void;
}) {
  const iconRef = useRef<View>(null);
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

  const historyRecords = useJournalStore((state) => state.historyRecords);
  const todayGlobalIdx = getInitialDayGlobalIndex();
  const isToday = dayIndex === todayGlobalIdx;

  const hasLogForDay = useMemo(() => {
    if (isToday) return true; // Today is always normal / live
    const targetDate = getDateForGlobalIndex(dayIndex);
    const targetKey = toDateKey(targetDate);

    return historyRecords.some((r) => {
      if (r.isoDate && r.isoDate === targetKey) {
        return Object.keys(r.answers || {}).length > 0;
      }
      if (r.dateStr) {
        const d = resolveRecordDate(r);
        if (toDateKey(d) === targetKey) {
          return Object.keys(r.answers || {}).length > 0;
        }
      }
      return false;
    });
  }, [dayIndex, isToday, historyRecords]);

  // If a past day has NO log recorded, render the uplifted card
  if (!hasLogForDay) {
    return (
      <View style={{ width: itemWidth, height: 240, alignItems: 'center', justifyContent: 'center' }} pointerEvents="box-none">
        <View
          style={[
            styles.emptyPastForecastCard,
            isDark ? styles.emptyPastForecastCardDark : styles.emptyPastForecastCardLight,
          ]}
        >
          {/* Title centered */}
          <Text style={[styles.emptyPastTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
            No Data Logged for This Day
          </Text>

          {/* Subtitle filling the space properly */}
          <Text style={[styles.emptyPastSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
            No journal entries were recorded for this date. Complete your daily logs to generate skin forecasts.
          </Text>
        </View>
      </View>
    );
  }

  const forecastFromStore = useForecastStore((state) => state.forecastCardsByDay[dayIndex]);
  const forecast = forecastFromStore || getForecastForDay(dayIndex);

  return (
    <View style={{ width: itemWidth, height: 240, alignItems: 'center', justifyContent: 'center' }} pointerEvents="box-none">
      <View
        style={{
          width: '100%',
          height: 240,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Text style={[styles.forecastSubTitle, { color: isDark ? '#9ca3af' : '#4b5563' }]}>
          {forecast.prefix}
        </Text>
        
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, marginVertical: 4 }}>
          <Text 
            style={[
              styles.forecastBigNumber, 
              { 
                color: isDark ? '#ffffff' : '#000000',
                fontSize: forecast.highlight.length > 14 ? 26 : (forecast.highlight.length > 10 ? 30 : (forecast.highlight.length > 7 ? 38 : 46)),
              }
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {forecast.highlight}
          </Text>
        </View>

        {forecast.suffix ? (
          <Text style={[styles.forecastSubTitle, { color: isDark ? '#9ca3af' : '#4b5563', marginTop: -2, marginBottom: 8 }]}>
            {forecast.suffix}
          </Text>
        ) : null}

        <View style={styles.forecastMetaRow}>
          <Text style={[styles.forecastMetaText, { color: isDark ? '#9ca3af' : '#4b5563' }]}>
            {forecast.meta}
          </Text>
          <View ref={iconRef} collapsable={false}>
            <Pressable 
              onPress={() => {
                iconRef.current?.measureInWindow((x, y, width, height) => {
                  onInfoPress(forecast.logDays, {
                    x: x + width / 2,
                    y: y + height / 2,
                  });
                });
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.forecastInfoCircle, 
                { borderColor: isDark ? '#9ca3af' : '#4b5563', opacity: pressed ? 0.6 : 1 }
              ]}
            >
              <Text style={[styles.forecastInfoText, { color: isDark ? '#9ca3af' : '#4b5563' }]}>i</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AnalyzingDataCircle: Bigger Disc + Dynamic Dual-Rotating Organic Aura Rings
// ---------------------------------------------------------------------------
function AnalyzingDataCircle({ isDark }: { isDark: boolean }) {
  const rotateClockwise = useSharedValue(0);
  const rotateCounter = useSharedValue(0);
  const morphPulse1 = useSharedValue(0);
  const morphPulse2 = useSharedValue(0);
  const centerBreathing = useSharedValue(0);

  React.useEffect(() => {
    // Smooth continuous rotations in opposite directions
    rotateClockwise.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
    rotateCounter.value = withRepeat(
      withTiming(-360, { duration: 16000, easing: Easing.linear }),
      -1,
      false
    );

    // Organic morphing scales
    morphPulse1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    morphPulse2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Center disc subtle micro-breathing
    centerBreathing.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Outer rotating organic wave
  const outerAuraStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(morphPulse1.value, [0, 1], [0.96, 1.14]);
    const scaleY = interpolate(morphPulse2.value, [0, 1], [1.14, 0.96]);
    return {
      transform: [
        { rotate: `${rotateClockwise.value}deg` },
        { scaleX },
        { scaleY },
      ],
      opacity: interpolate(morphPulse1.value, [0, 1], [0.55, 0.85]),
    };
  });

  // Inner counter-rotating organic wave
  const innerAuraStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(morphPulse2.value, [0, 1], [1.12, 0.95]);
    const scaleY = interpolate(morphPulse1.value, [0, 1], [0.95, 1.12]);
    return {
      transform: [
        { rotate: `${rotateCounter.value}deg` },
        { scaleX },
        { scaleY },
      ],
      opacity: interpolate(morphPulse2.value, [0, 1], [0.65, 0.95]),
    };
  });

  // Center disc breathing style
  const centerDiscStyle = useAnimatedStyle(() => {
    const scale = interpolate(centerBreathing.value, [0, 1], [0.98, 1.015]);
    return {
      transform: [{ scale }],
    };
  });

  const primaryColor = Colors.light.primary; // '#937abd'
  const secondaryColor = Colors.light.secondary; // '#d6cbe8'

  const grad1A = primaryColor;
  const grad1B = secondaryColor;
  const grad2A = primaryColor;
  const grad2B = secondaryColor;

  return (
    <View style={styles.analyzingWrapper}>
      {/* Outer Rotating Fluid Organic Wave (SVG Path) */}
      <Animated.View style={[styles.ambientRing2, outerAuraStyle]}>
        <Svg width={270} height={270} viewBox="0 0 270 270">
          <Defs>
            <LinearGradient id="fluidGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={grad1A} stopOpacity={isDark ? 0.45 : 0.4} />
              <Stop offset="50%" stopColor={grad1B} stopOpacity={isDark ? 0.3 : 0.25} />
              <Stop offset="100%" stopColor={grad1A} stopOpacity={isDark ? 0.15 : 0.1} />
            </LinearGradient>
          </Defs>
          {/* Organic fluid aura shape */}
          <Path
            d="M 135 15 
               C 185 18, 235 55, 252 105 
               C 268 155, 232 215, 185 242 
               C 135 265, 75 248, 32 205 
               C -5 160, 2 95, 45 52 
               C 85 12, 115 14, 135 15 Z"
            fill="url(#fluidGrad1)"
          />
        </Svg>
      </Animated.View>

      {/* Inner Counter-Rotating Fluid Organic Blob (Opposite Path) */}
      <Animated.View style={[styles.ambientRing1, innerAuraStyle]}>
        <Svg width={250} height={250} viewBox="0 0 250 250">
          <Defs>
            <LinearGradient id="fluidGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={grad2A} stopOpacity={isDark ? 0.6 : 0.55} />
              <Stop offset="60%" stopColor={grad2B} stopOpacity={isDark ? 0.4 : 0.35} />
              <Stop offset="100%" stopColor={grad2A} stopOpacity={isDark ? 0.2 : 0.15} />
            </LinearGradient>
          </Defs>
          {/* Asymmetric swirling organic contour */}
          <Path
            d="M 125 22 
               C 178 12, 228 62, 238 118 
               C 248 175, 198 228, 142 238 
               C 85 245, 30 205, 18 148 
               C 8 92, 58 35, 125 22 Z"
            fill="url(#fluidGrad2)"
          />
        </Svg>
      </Animated.View>

      {/* Center Disc */}
      <Animated.View
        style={[
          styles.analyzingCenterDisc,
          isDark ? styles.analyzingCenterDiscDark : styles.analyzingCenterDiscLight,
          centerDiscStyle,
        ]}
      >
        <Text
          style={[
            styles.analyzingText,
            { color: isDark ? '#ffffff' : '#111827' },
          ]}
        >
          Analyzing your data.
        </Text>
      </Animated.View>
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
    <View style={{ alignItems: 'center', width: (pageWidth - 20) / 3 }} pointerEvents="none">
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
          pointerEvents="none"
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

// ---------------------------------------------------------------------------
// CalendarDayPill: Week Day Item with Future Date Lock Interception
// ---------------------------------------------------------------------------
function CalendarDayPill({
  item,
  globalDayIdx,
  isSelected,
  isToday,
  isFuture,
  isDark,
  onSelectDay,
  onFutureLockPress,
}: {
  item: { label: string; dateNum: number; isToday: boolean };
  globalDayIdx: number;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  isDark: boolean;
  onSelectDay: (idx: number) => void;
  onFutureLockPress: (origin: { x: number; y: number }) => void;
}) {
  const pillRef = useRef<View>(null);

  const handlePress = (e: any) => {
    if (isFuture) {
      const fallbackX = e?.nativeEvent?.pageX || 200;
      const fallbackY = e?.nativeEvent?.pageY || 200;
      if (pillRef.current?.measureInWindow) {
        pillRef.current.measureInWindow((x, y, width, height) => {
          if (width > 0 && height > 0) {
            onFutureLockPress({
              x: x + width / 2,
              y: y + height / 2,
            });
          } else {
            onFutureLockPress({ x: fallbackX, y: fallbackY });
          }
        });
      } else {
        onFutureLockPress({ x: fallbackX, y: fallbackY });
      }
      return;
    }
    onSelectDay(globalDayIdx);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.dayColumn,
      ]}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
    >
      <View ref={pillRef} collapsable={false} style={{ alignItems: 'center', width: '100%' }}>
        {/* Day Label / "TODAY" */}
        <Text
          style={[
            styles.dayColumnLabel,
            {
              color: isToday
                ? isDark
                  ? '#ffffff'
                  : '#111827'
                : isDark
                ? '#a1a1aa'
                : '#6b7280',
              fontWeight: isToday ? '800' : '600',
              fontSize: isToday ? 10 : 12,
            },
          ]}
        >
          {isToday ? 'TODAY' : item.label}
        </Text>

        {/* Day Number Circle */}
        <View style={styles.dayNumberCircle}>
          {/* Filled circle for selected day */}
          {isSelected && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 999,
                  backgroundColor: isDark ? '#ffffff' : Colors.light.primary,
                },
              ]}
            />
          )}
          {/* Outlined circle for today (when not selected) */}
          {!isSelected && isToday && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                  backgroundColor: 'transparent',
                },
              ]}
            />
          )}
          <Text
            style={[
              styles.dayNumberText,
              {
                color: isSelected
                  ? isDark
                    ? '#111827'
                    : '#ffffff'
                  : isDark
                  ? '#ffffff'
                  : '#111827',
                fontWeight: isSelected ? '800' : '600',
              },
            ]}
          >
            {String(item.dateNum)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { navigate: guardedNavigate } = useNavigationGuard();

  // Official React Navigation 7 native preload: instantiates Android Fragment in background
  React.useEffect(() => {
    try {
      if (navigation?.preload) {
        navigation.preload('daily-journal');
      }
    } catch (e) {
      // preload not supported on this navigator
    }
  }, [navigation]);

  const imageUri = useScanStore((state) => state.imageUri);
  const scanResult = useScanStore((state) => state.scanResult);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const flatRef = useRef<FlatList>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const metricsScrollX = useSharedValue(0);
  const metricsScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      metricsScrollX.value = e.contentOffset.x;
    },
  });
  const [userProfile, setUserProfile] = useState<{ name: string; avatarUri: string | null } | null>(null);
  const [forecastModalVisible, setForecastModalVisible] = useState(false);
  const [forecastModalDays, setForecastModalDays] = useState(7);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const modalProgress = useSharedValue(0);

  const openForecastModal = useCallback((days: number, origin: { x: number; y: number }) => {
    setModalOrigin(origin);
    setForecastModalDays(days);
    setForecastModalVisible(true);
    modalProgress.value = 0;
    modalProgress.value = withTiming(1, {
      duration: 340,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, []);

  const closeForecastModal = useCallback(() => {
    modalProgress.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
    setTimeout(() => {
      setForecastModalVisible(false);
    }, 220);
  }, []);

  // Future Date Lock Modal State
  const [futureLockModalVisible, setFutureLockModalVisible] = useState(false);
  const [futureModalOrigin, setFutureModalOrigin] = useState({ x: 0, y: 0 });

  const openFutureLockModal = useCallback((origin: { x: number; y: number }) => {
    setFutureModalOrigin(origin);
    setFutureLockModalVisible(true);
  }, []);

  const closeFutureLockModal = useCallback(() => {
    setFutureLockModalVisible(false);
  }, []);

  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const animatedModalPillStyle = useAnimatedStyle(() => {
    const targetX = SCREEN_WIDTH / 2;
    const targetY = SCREEN_HEIGHT / 2;
    const originX = modalOrigin.x || targetX;
    const originY = modalOrigin.y || targetY;

    const translateX = interpolate(modalProgress.value, [0, 1], [originX - targetX, 0]);
    const translateY = interpolate(modalProgress.value, [0, 1], [originY - targetY, 0]);
    const scale = interpolate(modalProgress.value, [0, 1], [0.12, 1]);
    const opacity = interpolate(modalProgress.value, [0, 0.25, 1], [0, 1, 1]);

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(modalProgress.value, [0, 1], [0, 1]),
  }));

  // Journal Store: live daily tracking entries
  const historyRecords = useJournalStore((state) => state.historyRecords);
  const questions = useJournalStore((state) => state.questions);

  // Derive today's record and completion status for Future Lock Modal
  const todayRecord = useMemo(() => {
    return historyRecords.find(
      (r) => r.dateStr?.toLowerCase() === 'today' || r.id === 'rec-1'
    ) || historyRecords[0];
  }, [historyRecords]);

  const isTodayIncomplete = useMemo(() => {
    if (!todayRecord) return true;
    const answeredCount = questions.filter((q) => Boolean(todayRecord.answers?.[q.key])).length;
    return answeredCount < questions.length;
  }, [todayRecord, questions]);

  // Scroll lock: only one horizontal carousel scrolls at a time
  const activeScrollRef = useRef<'scans' | 'journals' | 'score' | null>(null);

  // Journal Question Sheet ref for live daily tracking
  const journalSheetRef = useRef<JournalQuestionSheetRef>(null);

  // Analyzing transition state & shared values (0 = Normal Hero, 1 = Fully Analyzing)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyzingTransition = useSharedValue(0);
  const isAnalyzingActive = useSharedValue(false);
  const analyzingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAnalyzing = useCallback(() => {
    // Prevent re-triggering mid-animation
    if (isAnalyzingActive.value) return;

    if (analyzingTimerRef.current) clearTimeout(analyzingTimerRef.current);
    
    // Start transition into Analyzing state
    setIsAnalyzing(true);
    isAnalyzingActive.value = true;
    analyzingTransition.value = withTiming(1, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    // Stay in analyzing state for 3.2 seconds, then smoothly transition back
    analyzingTimerRef.current = setTimeout(() => {
      // Transition back to normal hero curves
      analyzingTransition.value = withTiming(0, {
        duration: 700,
        easing: Easing.inOut(Easing.cubic),
      }, (finished) => {
        if (finished) {
          isAnalyzingActive.value = false;
        }
      });
      // Defer unmounting after transition completes
      setTimeout(() => {
        setIsAnalyzing(false);
        isAnalyzingActive.value = false;
        analyzingTimerRef.current = null;
      }, 720);
    }, 3200);
  }, []);

  // Subtle living wave animations for the 3 background curves
  const waveBreath1 = useSharedValue(0);
  const waveBreath2 = useSharedValue(0);
  const waveBreath3 = useSharedValue(0);

  React.useEffect(() => {
    // Curve 1 gentle floating breath (up-down, slight pulse)
    waveBreath1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    // Curve 2 gentle floating wave (horizontal sway, slight scale)
    waveBreath2.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 5200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    // Curve 3 gentle floating wave (diagonal sway, slight stretch)
    waveBreath3.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 4800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  // Curve 1 (Top-Right): Alive wave sway + smooth transition exit
  const curve1AnimStyle = useAnimatedStyle(() => {
    // Living idle sway
    const idleTranslateX = interpolate(waveBreath1.value, [0, 1], [-4, 6]);
    const idleTranslateY = interpolate(waveBreath1.value, [0, 1], [5, -5]);
    const idleScale = interpolate(waveBreath1.value, [0, 1], [0.99, 1.02]);

    // Transition exit displacement
    const exitTranslateX = interpolate(analyzingTransition.value, [0, 1], [0, 50]);
    const exitTranslateY = interpolate(analyzingTransition.value, [0, 1], [0, -35]);

    return {
      opacity: interpolate(analyzingTransition.value, [0, 0.8], [1, 0]),
      transform: [
        { translateX: idleTranslateX + exitTranslateX },
        { translateY: idleTranslateY + exitTranslateY },
        { scale: idleScale },
      ],
    };
  });

  // Curve 2 (Mid-Left): Alive wave sway + smooth transition exit
  const curve2AnimStyle = useAnimatedStyle(() => {
    // Living idle sway
    const idleTranslateX = interpolate(waveBreath2.value, [0, 1], [-6, 6]);
    const idleTranslateY = interpolate(waveBreath2.value, [0, 1], [-4, 5]);
    const idleScale = interpolate(waveBreath2.value, [0, 1], [1.02, 0.98]);

    // Transition exit displacement
    const exitTranslateX = interpolate(analyzingTransition.value, [0, 1], [0, -60]);
    const exitTranslateY = interpolate(analyzingTransition.value, [0, 1], [0, 20]);

    return {
      opacity: interpolate(analyzingTransition.value, [0, 0.8], [1, 0]),
      transform: [
        { translateX: idleTranslateX + exitTranslateX },
        { translateY: idleTranslateY + exitTranslateY },
        { scale: idleScale },
      ],
    };
  });

  // Curve 3 (Lower-Right): Alive wave sway + smooth transition exit
  const curve3AnimStyle = useAnimatedStyle(() => {
    // Living idle sway
    const idleTranslateX = interpolate(waveBreath3.value, [0, 1], [5, -5]);
    const idleTranslateY = interpolate(waveBreath3.value, [0, 1], [-5, 6]);
    const idleScale = interpolate(waveBreath3.value, [0, 1], [0.985, 1.02]);

    // Transition exit displacement
    const exitTranslateX = interpolate(analyzingTransition.value, [0, 1], [0, 60]);
    const exitTranslateY = interpolate(analyzingTransition.value, [0, 1], [0, 45]);

    return {
      opacity: interpolate(analyzingTransition.value, [0, 0.8], [1, 0]),
      transform: [
        { translateX: idleTranslateX + exitTranslateX },
        { translateY: idleTranslateY + exitTranslateY },
        { scale: idleScale },
      ],
    };
  });

  // Score/Forecast block animation: Cleanly fades out to 0 between [0, 0.4] of the transition
  const scoreBlockAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(analyzingTransition.value, [0, 0.35], [1, 0], 'clamp'),
      transform: [
        { scale: interpolate(analyzingTransition.value, [0, 0.4], [1, 0.92], 'clamp') },
      ],
    };
  });

  // Dedicated Centroidic Analyzing Background:
  // Smoothly fades and expands in as the 3 hero curves exit, creating a central focus vignette
  const analyzingBgAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(analyzingTransition.value, [0.2, 0.8], [0, 1], 'clamp'),
      transform: [
        { scale: interpolate(analyzingTransition.value, [0.2, 1], [0.92, 1], 'clamp') },
      ],
    };
  });

  // Analyzing Circle container: ONLY starts appearing at 0.4 AFTER the score text is 100% gone!
  // This completely eliminates any overlap, bleed-through, or double-vision.
  const analyzingCircleAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(analyzingTransition.value, [0.4, 0.85], [0, 1], 'clamp'),
      transform: [
        { scale: interpolate(analyzingTransition.value, [0.4, 1], [0.8, 1], 'clamp') },
      ],
    };
  });

  // Load user profile on screen focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const storedProfile = await AsyncStorage.getItem('user_profile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          }
        } catch (e) {
          console.error("Failed to load user profile on home", e);
        }
      };
      loadData();
    }, [])
  );

  // Current date constants
  const today = new Date();
  const currentDay = today.getDay();
  const todayIdx = currentDay === 0 ? 6 : currentDay - 1; // 0=Mon..6=Sun

  // Multi-week calendar setup (-4 to +4 weeks = 9 weeks total, index 4 is current week)
  const WEEKS_RANGE = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const INITIAL_WEEK_INDEX = 4; // index of week offset 0
  const TOTAL_DAYS = WEEKS_RANGE.length * 7; // 63 days total
  const INITIAL_DAY_GLOBAL_INDEX = INITIAL_WEEK_INDEX * 7 + todayIdx; // today's index in the 63-day sequence

  // Track viewing week independently from selected date
  const [visibleWeekIndex, setVisibleWeekIndex] = useState(INITIAL_WEEK_INDEX);
  const [selectedGlobalDayIdx, setSelectedGlobalDayIdx] = useState(INITIAL_DAY_GLOBAL_INDEX);

  // Initialize and sync forecast store with live journal data
  React.useEffect(() => {
    useForecastStore.getState().init(questions, historyRecords);
  }, [questions, historyRecords]);

  // Ensure forecast exists when sliding to any past day
  React.useEffect(() => {
    useForecastStore.getState().ensureForecastForDay(selectedGlobalDayIdx, questions, historyRecords);
  }, [selectedGlobalDayIdx, questions, historyRecords]);

  // Helper to convert global index (0..62) to week offset and day index (0..6)
  const getWeekOffsetAndDay = (globalIdx: number) => {
    const weekIdx = Math.floor(globalIdx / 7);
    const dayIdx = globalIdx % 7;
    const weekOffset = WEEKS_RANGE[weekIdx] ?? 0;
    return { weekIdx, dayIdx, weekOffset };
  };

  const { weekOffset: selectedWeekOffset, dayIdx: selectedDayIdx } = getWeekOffsetAndDay(selectedGlobalDayIdx);

  // Generate week days dynamically for any week offset
  const getWeekDaysForOffset = (weekOffset: number) => {
    const days = [];
    const baseDate = new Date();
    const currDay = baseDate.getDay();
    const distanceToMon = currDay === 0 ? -6 : 1 - currDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMon + weekOffset * 7);

    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: dayLabels[i],
        dateNum: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
        fullDate: d,
      });
    }
    return days;
  };

  // Dynamic formatted full date string for selected date
  const getSelectedDateDisplay = (globalIdx: number) => {
    const { weekOffset, dayIdx } = getWeekOffsetAndDay(globalIdx);
    const todayDate = new Date();
    const currentDayVal = todayDate.getDay();
    const distanceToMon = currentDayVal === 0 ? -6 : 1 - currentDayVal;
    
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() + distanceToMon + weekOffset * 7 + dayIdx);
    
    const dayNum = targetDate.getDate();
    const fullMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthStr = fullMonthNames[targetDate.getMonth()];
    return `${dayNum} ${monthStr}`;
  };

  const selectedDateHeaderStr = getSelectedDateDisplay(selectedGlobalDayIdx);

  // Dynamically calculate metadata and date string for any global day index
  const getDayMetadata = (globalIdx: number) => {
    const { weekOffset, dayIdx } = getWeekOffsetAndDay(globalIdx);
    const todayDate = new Date();
    const currentDayVal = todayDate.getDay();
    const distanceToMon = currentDayVal === 0 ? -6 : 1 - currentDayVal;
    
    const targetDate = new Date(todayDate);
    targetDate.setDate(todayDate.getDate() + distanceToMon + weekOffset * 7 + dayIdx);
    
    const dayNum = targetDate.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = monthNames[targetDate.getMonth()];
    const yearNum = targetDate.getFullYear();
    const dateStr = `${dayNum} ${monthStr} ${yearNum}`;
    
    const todayIndexVal = currentDayVal === 0 ? 6 : currentDayVal - 1;
    
    let label = `guidance ${dateStr}`;
    if (weekOffset === 0 && dayIdx === todayIndexVal) {
      label = `TODAY'S GUIDANCE`;
    } else if ((weekOffset === 0 && dayIdx === todayIndexVal - 1) || (weekOffset === -1 && todayIndexVal === 0 && dayIdx === 6)) {
      label = `YESTERDAY'S GUIDANCE`;
    }
    
    return { label, dateStr };
  };

  const dayMeta = getDayMetadata(selectedGlobalDayIdx);

  // Generate an array of global day indices up to Today [0..INITIAL_DAY_GLOBAL_INDEX]
  // Clamping to today physically prevents carousel sliding into future unlogged dates
  const allDaysArray = Array.from({ length: INITIAL_DAY_GLOBAL_INDEX + 1 }, (_, i) => i);

  // Refs for synchronization
  const scorePagerRef = useRef<FlatList>(null);
  const weekCalendarRef = useRef<FlatList>(null);
  
  // Callback when user slides the main score block day-to-day
  const handleScoreScrollEnd = (e: any) => {
    activeScrollRef.current = null;
    const slideWidth = SCREEN_WIDTH - 40 + 14;
    const xOffset = e.nativeEvent.contentOffset.x;
    const newGlobalIdx = Math.round(xOffset / slideWidth);
    const clampedIdx = Math.max(0, Math.min(newGlobalIdx, INITIAL_DAY_GLOBAL_INDEX));
    if (clampedIdx >= 0 && clampedIdx <= INITIAL_DAY_GLOBAL_INDEX) {
      setSelectedGlobalDayIdx(clampedIdx);
      // Auto-slide calendar week if day moves into a different week
      const targetWeekIdx = Math.floor(clampedIdx / 7);
      if (targetWeekIdx !== visibleWeekIndex) {
        setVisibleWeekIndex(targetWeekIdx);
        weekCalendarRef.current?.scrollToIndex({ index: targetWeekIdx, animated: true });
      }
    }
  };

  // Callback when user slides the calendar strip week-to-week
  // Sliding weeks ONLY changes visible week view, NEVER steals/moves the selected circle!
  const handleWeekScrollEnd = (e: any) => {
    const slideWidth = SCREEN_WIDTH - 40;
    const xOffset = e.nativeEvent.contentOffset.x;
    const newWeekIndex = Math.round(xOffset / slideWidth);
    if (newWeekIndex >= 0 && newWeekIndex < WEEKS_RANGE.length) {
      setVisibleWeekIndex(newWeekIndex);
    }
  };

  // Redirect to Current Week on header date press (No reaction if already in current week)
  const handleHeaderDatePress = useCallback(() => {
    if (visibleWeekIndex === INITIAL_WEEK_INDEX) {
      // In current week: no reaction
      return;
    }
    setVisibleWeekIndex(INITIAL_WEEK_INDEX);
    setSelectedGlobalDayIdx(INITIAL_DAY_GLOBAL_INDEX);
    try {
      weekCalendarRef.current?.scrollToIndex({ index: INITIAL_WEEK_INDEX, animated: true });
    } catch {}
    try {
      scorePagerRef.current?.scrollToIndex({ index: INITIAL_DAY_GLOBAL_INDEX, animated: true });
    } catch {}
  }, [visibleWeekIndex]);

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



  // Scroll-reactive subtle parallax for background aura shapes (moves smoothly on scroll, stays still when idle)
  const bgAuraAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [-100, 0, 300], [40, 0, -60]);
    const opacity = interpolate(scrollY.value, [0, 200], [1, 0.2]);
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121212' : '#f5f5f7' }]}>
      {/* ── FLOW-STYLE TOP HERO AMBIENT AURA (Smoothly fades out and back in during Analyzing transition) ── */}
      <Animated.View 
        pointerEvents="none" 
        style={[styles.heroAmbientContainer, bgAuraAnimatedStyle]}
      >
        {/* Curve 1 (Top Header & Right Aura): Smoothly rounded contour dipping gently below calendar */}
        <Animated.View style={[StyleSheet.absoluteFill, { top: -50, left: -50, right: -50 }, curve1AnimStyle]}>
          <Svg width="100%" height="100%" viewBox="-50 -50 500 630" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="heroCurve1Grad" x1="0.9" y1="0.1" x2="0.1" y2="0.8">
                <Stop offset="0%" stopColor="#937abd" stopOpacity={isDark ? 0.38 : 0.30} />
                <Stop offset="45%" stopColor="#937abd" stopOpacity={isDark ? 0.20 : 0.16} />
                <Stop offset="75%" stopColor="#937abd" stopOpacity={isDark ? 0.08 : 0.06} />
                <Stop offset="100%" stopColor="#937abd" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {/* 1. Curve 1 (Top Header & Right Aura): Extended far above top boundary so downward wave motion never reveals a gap */}
            <Path
              d="M -50 -100
                 L 450 -100
                 L 450 215
                 C 380 230, 290 220, 230 180
                 C 160 135, 80 125, -20 115
                 L -50 115
                 Z"
              fill="url(#heroCurve1Grad)"
            />
          </Svg>
        </Animated.View>

        {/* Curve 2 (Mid-Left): Sweeps deep from left inward towards center */}
        <Animated.View style={[StyleSheet.absoluteFill, { left: -40 }, curve2AnimStyle]}>
          <Svg width="100%" height="100%" viewBox="-40 0 400 580" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="heroCurve2Grad" x1="0" y1="0.3" x2="0.9" y2="0.8">
                <Stop offset="0%" stopColor="#937abd" stopOpacity={isDark ? 0.28 : 0.22} />
                <Stop offset="55%" stopColor="#937abd" stopOpacity={isDark ? 0.14 : 0.10} />
                <Stop offset="100%" stopColor="#937abd" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path
              d="M -50 140
                 C 40 145, 150 205, 160 300
                 C 168 375, 75 450, -50 475
                 Z"
              fill="url(#heroCurve2Grad)"
            />
          </Svg>
        </Animated.View>

        {/* Curve 3 (Lower-Right): Large sweeping wave hugging lower-right */}
        <Animated.View style={[StyleSheet.absoluteFill, { right: -40 }, curve3AnimStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 440 580" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="heroCurve3Grad" x1="1" y1="0.2" x2="0.1" y2="0.85">
                <Stop offset="0%" stopColor="#937abd" stopOpacity={isDark ? 0.30 : 0.24} />
                <Stop offset="50%" stopColor="#937abd" stopOpacity={isDark ? 0.14 : 0.10} />
                <Stop offset="100%" stopColor="#937abd" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path
              d="M 440 240
                 C 330 270, 215 350, 225 455
                 C 235 530, 320 580, 440 600
                 Z"
              fill="url(#heroCurve3Grad)"
            />
          </Svg>
        </Animated.View>


      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 4 }}
      >

        {/* ── HERO ───────────────────────────────────── */}
        <View style={[styles.hero, { paddingTop: insets.top + 10 }]}>

          <View style={{ paddingHorizontal: 20 }}>
            {/* Header row: Profile (left), Date (center), Streak (right) */}
            <View style={styles.topHeaderRow}>
              {/* Profile icon on left (navigates to /profile) */}
              <Pressable 
                onPress={() => router.push('/profile')} 
                style={({ pressed }) => [
                  styles.profileIconBtn, 
                  isDark ? styles.profileIconBtnDark : styles.profileIconBtnLight,
                  { opacity: pressed ? 0.75 : 1 }
                ]}
                accessibilityLabel="Profile"
              >
                <User size={20} color={isDark ? "#ffffff" : "#1f2937"} strokeWidth={2.2} />
              </Pressable>

              {/* Centered Date (e.g., "12 November") - clickable to return to current week */}
              <View style={styles.headerCenterDateWrapper} pointerEvents="box-none">
                <Pressable
                  onPress={handleHeaderDatePress}
                  hitSlop={{ top: 10, bottom: 10, left: 16, right: 16 }}
                  disabled={visibleWeekIndex === INITIAL_WEEK_INDEX}
                  style={({ pressed }) => [
                    { opacity: visibleWeekIndex !== INITIAL_WEEK_INDEX && pressed ? 0.7 : 1 }
                  ]}
                >
                  <Text style={[styles.headerDateTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    {selectedDateHeaderStr}
                  </Text>
                </Pressable>
              </View>

              {/* Streak pill on right */}
              <Pressable
                onPress={() => router.push('/streak')}
                style={({ pressed }) => [
                  styles.streakPill,
                  {
                    backgroundColor: pressed
                      ? (isDark ? '#27272a' : '#f0f0f2')
                      : (isDark ? '#18181b' : '#ffffff'),
                    borderColor: isDark ? '#27272a' : '#e5e7eb',
                  }
                ]}
              >
                <LottieView
                  source={fireAnimation}
                  autoPlay={true}
                  loop={true}
                  speed={1.5}
                  style={{ width: 21, height: 21, backgroundColor: 'transparent' }}
                />
                <Text style={[styles.streakTxt, { fontSize: 14, fontWeight: '700', color: isDark ? '#ffffff' : '#111827' }]}>Day 5</Text>
              </Pressable>
            </View>

            {/* Weekly Calendar Strip (Slideable week-to-week, selectable & synced with the score card) */}
            <View style={styles.weekCalendarContainer}>
              <FlatList
                ref={weekCalendarRef}
                data={WEEKS_RANGE}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH - 40}
                snapToAlignment="center"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={5}
                keyExtractor={(item) => `week-${item}`}
                initialScrollIndex={INITIAL_WEEK_INDEX}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH - 40,
                  offset: (SCREEN_WIDTH - 40) * index,
                  index,
                })}
                onMomentumScrollEnd={handleWeekScrollEnd}
                renderItem={({ item: weekOffset, index: weekIdx }) => {
                  const daysInWeek = getWeekDaysForOffset(weekOffset);

                  return (
                    <View style={[styles.weekCalendarRow, { width: SCREEN_WIDTH - 40 }]}>
                      {daysInWeek.map((item, idx) => {
                        const globalDayIdx = weekIdx * 7 + idx;
                        const isSelected = selectedGlobalDayIdx === globalDayIdx;
                        const isToday = item.isToday;
                        const isFuture = globalDayIdx > INITIAL_DAY_GLOBAL_INDEX;

                        return (
                          <CalendarDayPill
                            key={`pill-${globalDayIdx}`}
                            item={item}
                            globalDayIdx={globalDayIdx}
                            isSelected={isSelected}
                            isToday={isToday}
                            isFuture={isFuture}
                            isDark={isDark}
                            onSelectDay={(dayIdx) => {
                              setSelectedGlobalDayIdx(dayIdx);
                              scorePagerRef.current?.scrollToIndex({ index: dayIdx, animated: true });
                            }}
                            onFutureLockPress={(origin) => {
                              openFutureLockModal(origin);
                            }}
                          />
                        );
                      })}
                    </View>
                  );
                }}
              />
            </View>

            {/* Center Area: Animated Analyzing Data Disc AND Slideable Score Block with smooth transition */}
            <View style={{ height: 240, width: SCREEN_WIDTH - 40, alignSelf: 'center', marginBottom: 0, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Score / Forecast Slideable block across all days */}
              <Animated.View 
                style={[{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, scoreBlockAnimStyle]}
                pointerEvents={isAnalyzing ? 'none' : 'auto'}
              >
                <FlatList
                  ref={scorePagerRef}
                  data={allDaysArray}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={SCREEN_WIDTH - 40 + 14}
                  snapToAlignment="start"
                  disableIntervalMomentum={true}
                  bounces={true}
                  overScrollMode="never"
                  getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH - 40 + 14,
                    offset: (SCREEN_WIDTH - 40 + 14) * index,
                    index,
                  })}
                  ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
                  initialNumToRender={2}
                  maxToRenderPerBatch={3}
                  windowSize={5}
                  removeClippedSubviews={false}
                  keyExtractor={(item) => `score-day-${item}`}
                  initialScrollIndex={INITIAL_DAY_GLOBAL_INDEX}
                  onScrollToIndexFailed={(info) => {
                    scorePagerRef.current?.scrollToOffset({
                      offset: info.index * (SCREEN_WIDTH - 40 + 14),
                      animated: false,
                    });
                  }}
                  style={{ width: SCREEN_WIDTH - 40, overflow: 'hidden' }}
                  contentContainerStyle={{ paddingVertical: 0 }}
                  onScrollBeginDrag={() => { activeScrollRef.current = 'score'; }}
                  onScrollEndDrag={() => { activeScrollRef.current = null; }}
                  onMomentumScrollEnd={handleScoreScrollEnd}
                  scrollEnabled={activeScrollRef.current === null || activeScrollRef.current === 'score'}
                  renderItem={({ item: globalIndex }) => {
                    const dayIdxInWeek = globalIndex % 7;
                    const scoreData = SCORES_BY_DAY[dayIdxInWeek] || SCORES_BY_DAY[todayIdx];
                    const scoreVal = scoreData.overall;
                    const itemMeta = getDayMetadata(globalIndex);
                    const feedbackText = getSkinFeedback(scoreVal);
                    return (
                      <AnimatedScoreItem
                        dayIndex={globalIndex}
                        scoreVal={scoreVal}
                        dayMeta={itemMeta}
                        feedbackText={feedbackText}
                        isDark={isDark}
                        itemWidth={SCREEN_WIDTH - 40}
                        shouldAnimate={globalIndex === selectedGlobalDayIdx}
                        animationKey={selectedGlobalDayIdx}
                        onInfoPress={openForecastModal}
                      />
                    );
                  }}
                />
              </Animated.View>

              {/* Analyzing Data Circle with smooth entrance & exit animations */}
              {isAnalyzing && (
                <Animated.View 
                  style={[
                    StyleSheet.absoluteFill, 
                    { alignItems: 'center', justifyContent: 'center', zIndex: 10 },
                    analyzingCircleAnimStyle
                  ]}
                  pointerEvents="none"
                >
                  <AnalyzingDataCircle isDark={isDark} />
                </Animated.View>
              )}
            </View>

            {/* ── Your Daily Insights Section ───────────────────── */}
            <View style={{ marginTop: 10, paddingHorizontal: 0 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '800',
                color: isDark ? '#ffffff' : '#1a1a1a',
                marginBottom: 14,
              }}>Your Insights</Text>

              {/* Insight Card: Tapping triggers 3-sec analyzing demo */}
              <Pressable 
                onPress={triggerAnalyzing}
                style={({ pressed }) => [
                  styles.upliftedCardBox,
                  isDark ? styles.historyCardBoxDark : styles.historyCardBoxLight,
                  { marginBottom: 4, opacity: pressed ? 0.85 : 1 }
                ]}
              >
                <View style={[styles.emptyIconCircle, isDark ? styles.iconBgDark : styles.iconBgLight]}>
                  <Sparkles size={24} color={isDark ? "#a1a1aa" : "#6b7280"} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.emptyRoutineTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                    Insight overview
                  </Text>
                  <Text style={{
                    fontSize: moderateScale(13, 0.3),
                    fontWeight: '700',
                    lineHeight: 18,
                    color: isDark ? '#d4d4d8' : '#374151',
                    marginTop: verticalScale(2),
                  }}>
                    {`Your skin has shown consistent improvement over the past week. Hydration levels are up and redness has visibly reduced — keep up your evening routine.`}
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* ── Your Daily Journal Section ───────────────────── */}

            <View style={{ marginTop: 10, paddingHorizontal: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  letterSpacing: -0.4,
                }}>Your Daily Journal</Text>
                <Pressable
                  onPress={() => {
                    router.push('/(tabs)/journal');
                  }}
                  style={({ pressed }) => [
                    styles.upliftedViewAllBtn,
                    {
                      backgroundColor: pressed 
                        ? (isDark ? '#27272a' : '#f0f0f2') 
                        : (isDark ? '#18181b' : '#ffffff'),
                      borderColor: isDark ? '#27272a' : '#e5e7eb',
                    },
                  ]}
                >
                  <Text style={[styles.upliftedViewAllText, { color: isDark ? '#ffffff' : '#111827' }]}>View all</Text>
                </Pressable>
              </View>

              {historyRecords.length > 0 ? (
                <FlatList
                  data={historyRecords}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={SCREEN_WIDTH - 40 + 14}
                  snapToAlignment="start"
                  disableIntervalMomentum={true}
                  bounces={true}
                  overScrollMode="never"
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
                  contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 1 }}
                  onScrollBeginDrag={() => { activeScrollRef.current = 'journals'; }}
                  onScrollEndDrag={() => { activeScrollRef.current = null; }}
                  onMomentumScrollEnd={() => { activeScrollRef.current = null; }}
                  scrollEnabled={activeScrollRef.current === null || activeScrollRef.current === 'journals'}
                  renderItem={({ item }) => {
                    const answeredCount = questions.filter((q) => Boolean(item.answers?.[q.key])).length;
                    const totalQuestions = questions.length;

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
                        onPress={() => journalSheetRef.current?.present(item)}
                        style={({ pressed }) => [
                          styles.upliftedCardBox,
                          { width: SCREEN_WIDTH - 40 },
                          isDark ? styles.historyCardBoxDark : styles.historyCardBoxLight,
                          pressed && {
                            backgroundColor: isDark ? '#27272a' : '#f0f0f2',
                          },
                        ]}
                      >
                        {/* Left Column: Date & Status Pill, Day & Answer count */}
                        <View style={styles.journalCardLeft}>
                          <View style={styles.journalTopRow}>
                            <Text style={[styles.journalDateText, { color: isDark ? '#ffffff' : '#111827' }]}>
                              {item.dateStr}
                            </Text>
                            <View
                              style={[
                                styles.journalStatusPill,
                                {
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.journalStatusPillText,
                                  { color: isDark ? '#a1a1aa' : '#6b7280' },
                                ]}
                              >
                                {statusText}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.journalMetaRow}>
                            <Text style={[styles.journalDayText, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                              {item.dayName}
                            </Text>
                            <View style={[styles.journalDotSeparator, { backgroundColor: isDark ? '#52525b' : '#d1d5db' }]} />
                            <Text style={[styles.journalAnswersCount, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                              {answeredCount} of {totalQuestions} answered
                            </Text>
                          </View>
                        </View>

                        {/* Right Column: Status Circle Badge */}
                        <View style={styles.journalBadgeSlot}>
                          {statusText === 'Completed' && (
                            <View
                              style={[
                                styles.journalStatusCircle,
                                {
                                  backgroundColor: Colors.light.primary,
                                  borderColor: Colors.light.primary,
                                  borderStyle: 'solid',
                                },
                              ]}
                            >
                              <Check size={20} color='#ffffff' strokeWidth={3} />
                            </View>
                          )}

                          {statusText === 'In Progress' && (
                            <View
                              style={[
                                styles.journalStatusCircle,
                                {
                                  backgroundColor: isDark ? 'rgba(168, 85, 247, 0.16)' : 'rgba(124, 58, 237, 0.10)',
                                  borderColor: isDark ? '#c084fc' : Colors.light.primary,
                                  borderStyle: 'dashed',
                                },
                              ]}
                            >
                              <Check size={20} color={isDark ? '#c084fc' : Colors.light.primary} strokeWidth={3} />
                            </View>
                          )}

                          {statusText === 'Missed' && (
                            <View
                              style={[
                                styles.journalStatusCircle,
                                {
                                  backgroundColor: Colors.light.primary,
                                  borderColor: Colors.light.primary,
                                  borderStyle: 'solid',
                                },
                              ]}
                            >
                              <X size={20} color='#ffffff' strokeWidth={3} />
                            </View>
                          )}
                        </View>
                      </Pressable>
                    );
                  }}
                />
              ) : (
                <Pressable
                  onPress={() => router.push('/(tabs)/journal')}
                  style={({ pressed }) => [
                    styles.emptyRoutineCard,
                    isDark ? styles.cardDark : styles.cardLight,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={[styles.emptyIconCircle, isDark ? styles.iconBgDark : styles.iconBgLight]}>
                    <BookOpen size={24} color={isDark ? "#a1a1aa" : "#6b7280"} />
                  </View>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.emptyRoutineTitle, { color: isDark ? '#ffffff' : '#111827' }]}>
                      No journal added
                    </Text>
                    <Text style={[styles.emptyRoutineSubtitle, { color: isDark ? '#a1a1aa' : '#6b7280' }]}>
                      Start tracking your daily skincare thoughts and notes.
                    </Text>
                  </View>
                </Pressable>
              )}
            </View>

            {/* ── Recent Photos Section ───────────────────── */}
            <View style={{ marginTop: 28, paddingHorizontal: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 0 }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: isDark ? '#ffffff' : '#1a1a1a',
                  letterSpacing: -0.4,
                }}>Recent Photos</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/scan')}
                  style={({ pressed }) => [
                    styles.upliftedViewAllBtn,
                    {
                      backgroundColor: pressed
                        ? (isDark ? '#27272a' : '#f0f0f2')
                        : (isDark ? '#18181b' : '#ffffff'),
                      borderColor: isDark ? '#27272a' : '#e5e7eb',
                    },
                  ]}
                >
                  <Text style={[styles.upliftedViewAllText, { color: isDark ? '#ffffff' : '#111827' }]}>View all</Text>
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
                    onPress={() => guardedNavigate(`/scan/${scan.id}`)}
                    style={[
                      styles.recentScanSlideCard,
                      { width: SCREEN_WIDTH - 40 },
                      isDark ? styles.cardDark : styles.cardLight,
                    ]}
                  >
                    <View style={styles.recentScanSlideImageWrapper}>
                      <Image
                        source={scan.image}
                        style={styles.recentScanSlideImage}
                        resizeMode="cover"
                      />

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

      </Animated.ScrollView>

      {/* Live Journal Question Sheet for Interactive Daily Tracking */}
      <JournalQuestionSheet ref={journalSheetRef} />

      {/* Forecast Basis Info Modal */}
      <Modal
        visible={forecastModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeForecastModal}
      >
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={closeForecastModal}
        >
          <Animated.View style={[styles.forecastModalBackdrop, animatedBackdropStyle]}>
            <Animated.View style={animatedModalPillStyle}>
              <Pressable 
                style={[
                  styles.forecastModalPill,
                  isDark ? styles.forecastModalPillDark : styles.forecastModalPillLight,
                ]} 
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={[
                  styles.forecastModalText,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  Based on logs from the past {forecastModalDays === 1 ? '1 day' : `${forecastModalDays} days`}
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Future Date Forecast Lock Modal */}
      <FutureLockModal
        visible={futureLockModalVisible}
        origin={futureModalOrigin}
        isDark={isDark}
        onClose={closeFutureLockModal}
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
  /* Top Ambient Aura Background (Flow-style) */
  heroAmbientContainer: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 640,
    overflow: 'hidden',
    zIndex: 0,
  },
  heroBlob1: {
    position: 'absolute',
    top: -60,
    right: -70,
    width: 290,
    height: 290,
    borderRadius: 145,
  },
  heroBlob2: {
    position: 'absolute',
    top: -40,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  heroBlob3: {
    position: 'absolute',
    top: 110,
    left: '18%',
    width: 260,
    height: 260,
    borderRadius: 130,
  },

  /* Forecast Placeholder Typography */
  forecastSubTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  forecastBigNumber: {
    fontSize: 50,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    includeFontPadding: false,
    paddingHorizontal: 12,
  },
  forecastMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  forecastMetaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  forecastInfoCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastInfoText: {
    fontSize: 10,
    fontWeight: '800',
    fontStyle: 'italic',
    lineHeight: 12,
  },

  /* Empty Past Day Uplifted Card — Exact match of upliftedCardBox with 1px border */
  emptyPastForecastCard: {
    width: '100%',
    height: 220,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyPastForecastCardLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  emptyPastForecastCardDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  emptyPastTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyPastSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 8,
    maxWidth: 290,
  },

  analyzingWrapper: {
    width: 280,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientRing2: {
    position: 'absolute',
    width: 270,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientRing1: {
    position: 'absolute',
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingCenterDisc: {
    width: 196,
    height: 196,
    borderRadius: 98,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderWidth: 1.5,
  },
  analyzingCenterDiscLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(147, 122, 189, 0.15)',
  },
  analyzingCenterDiscDark: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(147, 122, 189, 0.25)',
  },
  analyzingText: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    zIndex: 1,
  },
  profileIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 2,
  },
  profileIconBtnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  profileIconBtnDark: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  headerCenterDateWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerDateTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  weekCalendarContainer: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  weekCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },
  dayColumnLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  dayNumberCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
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
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 2,
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
    padding: scale(16),
    borderRadius: moderateScale(16, 0.3),
  },
  emptyIconCircle: {
    width: moderateScale(44, 0.3),
    height: moderateScale(44, 0.3),
    borderRadius: moderateScale(22, 0.3),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  emptyRoutineTitle: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
  },
  emptyRoutineSubtitle: {
    fontSize: moderateScale(12, 0.3),
    marginTop: verticalScale(2),
  },
  createRoutineBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10, 0.3),
  },
  createRoutineBtnTextSmall: {
    color: '#ffffff',
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
  },

  /* Routine Card Preview */
  routineCardPreview: {
    padding: scale(14),
    borderRadius: moderateScale(14, 0.3),
  },
  routineTitlePreview: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
  },

  /* Slideable Recent Scan Card */
  recentScanSlideCard: {
    height: verticalScale(260),
    borderRadius: moderateScale(22, 0.3),
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
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  viewMorePillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  datePillBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 999,
  },
  datePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Uplifted Premium Card - exact match of daily-journal.tsx historyCardBox */
  upliftedCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  journalCardLeft: {
    flex: 1,
    paddingRight: 14,
  },
  journalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  journalDateText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  journalStatusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
    letterSpacing: 0.2,
  },
  journalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  journalDayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  journalDotSeparator: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  journalAnswersCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  journalBadgeSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  journalStatusCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },

  /* Uplifted View All / See All Button Pill */
  upliftedViewAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  upliftedViewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  forecastModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  forecastModalPill: {
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  forecastModalPillLight: {
    backgroundColor: '#FAF8F6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  forecastModalPillDark: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2b2b30',
  },
  forecastModalText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
});
