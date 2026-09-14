import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  useWindowDimensions, 
  GestureResponderEvent,
  TextInput,
  Image,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Header from '@/components/layout/Header';
import { 
  Sparkles, 
  Flame, 
  Heart, 
  Droplets, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Award,
  Sun,
  Moon,
  Clock,
  ChevronRight,
  Scan,
  Crown,
  Calendar,
  X,
  Apple
} from 'lucide-react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
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

// Animated circle & text inputs for smooth UI thread 60fps animations
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// 9 Facial Zones Configuration
const FACIAL_METRIC_PAGES = [
  [
    { id: 'forehead', name: 'Forehead', score: 75, accent: '#a855f7' },
    { id: 'nose',     name: 'Nose',     score: 70, accent: '#ec4899' },
    { id: 'chin',     name: 'Chin',     score: 82, accent: '#14b8a6' },
  ],
  [
    { id: 'lcheek',   name: 'L Cheek',  score: 78, accent: '#f59e0b' },
    { id: 'rcheek',   name: 'R Cheek',  score: 80, accent: '#10b981' },
    { id: 'jawline',  name: 'Jawline',  score: 85, accent: '#3b82f6' },
  ],
  [
    { id: 'tzone',    name: 'T-Zone',   score: 74, accent: '#6366f1' },
    { id: 'uzone',    name: 'U-Zone',   score: 82, accent: '#8b5cf6' },
    { id: 'undereye', name: 'Under Eye',score: 72, accent: '#ef4444' },
  ],
];

function AnimatedCounterText({
  targetValue,
  duration = 1000,
  trigger = true,
  style,
  suffix = '',
}: {
  targetValue: number;
  duration?: number;
  trigger?: boolean;
  style?: any;
  suffix?: string;
}) {
  const count = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      count.value = 0;
      count.value = withTiming(targetValue, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [trigger, targetValue]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(count.value)}${suffix}`,
    defaultValue: `${Math.round(count.value)}${suffix}`,
  }));

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      underlineColorAndroid="transparent"
      style={style}
    />
  );
}

function AnimatedScoreGauge({
  score,
  isDark,
  trigger = true,
  size = 186,
  strokeWidth = 14.5,
}: {
  score: number;
  isDark: boolean;
  trigger?: boolean;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      progress.value = 0;
      progress.value = withTiming(score / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [trigger, score]);

  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const animatedTextProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value * 100)}`,
    defaultValue: `${Math.round(progress.value * 100)}`,
  }));

  const textColor = isDark ? '#ffffff' : '#000000';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="bigScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#937abd" />
            <Stop offset="100%" stopColor="#d6cbe8" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? 'rgba(147, 122, 189, 0.2)' : '#e8e3f1'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#bigScoreGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animatedProps={animatedArcProps}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
        <AnimatedTextInput
          animatedProps={animatedTextProps}
          editable={false}
          underlineColorAndroid="transparent"
          style={{
            fontSize: 58,
            fontWeight: '300',
            lineHeight: 64,
            textAlign: 'center',
            letterSpacing: -1,
            color: textColor,
            padding: 0,
            margin: 0,
            backgroundColor: 'transparent',
            minWidth: 80,
          }}
        />
        <Text style={[styles.gaugeScoreLabel, { color: textColor }]}>Overall Skin Score</Text>
      </View>
    </View>
  );
}

function AnimatedMetricNode({
  metric,
  isDark,
  pageWidth,
  trigger = true,
}: {
  metric: { id: string; name: string; score: number; accent: string };
  isDark: boolean;
  pageWidth: number;
  trigger?: boolean;
}) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [trigger, metric.score]);

  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - (progress.value * metric.score) / 100),
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
            <LinearGradient id={`insightMetricGrad-${metric.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
          {/* Animated progress arc */}
          <AnimatedCircle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={`url(#insightMetricGrad-${metric.id})`}
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
            fontWeight: '700',
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

function AnimatedBehaviorBar({
  progressRatio,
  isDark,
  trigger = true,
}: {
  progressRatio: number;
  isDark: boolean;
  trigger?: boolean;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const animProgress = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      animProgress.value = 0;
      animProgress.value = withTiming(progressRatio, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [trigger, progressRatio]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: trackWidth > 0 ? animProgress.value * trackWidth : 0,
  }));

  return (
    <View
      style={[
        styles.behaviorProgressBarTrack,
        { backgroundColor: isDark ? 'rgba(147, 122, 189, 0.2)' : '#e8e3f1' },
      ]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {trackWidth > 0 && (
        <Animated.View style={[{ height: '100%', borderRadius: 4, overflow: 'hidden' }, animatedStyle]}>
          <Svg width={trackWidth} height={8}>
            <Defs>
              <LinearGradient id="behaviorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#937abd" />
                <Stop offset="100%" stopColor="#d6cbe8" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={trackWidth} height={8} rx={4} ry={4} fill="url(#behaviorGradient)" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}

// Period configuration for metadata and header
const PERIOD_CONFIG: Record<string, {
  title: string;
  section1Title: string;
  dateRangeTitle: string;
  scanLabel: string;
  totalScans: number;
  avgLabel: string;
}> = {
  weekly: {
    title: 'Weekly Skin Analysis',
    section1Title: 'Weekly Analysis',
    dateRangeTitle: 'Jul 15 – Jul 21',
    scanLabel: '7 scans',
    totalScans: 7,
    avgLabel: '7-Day Avg',
  },
  monthly: {
    title: 'Monthly Skin Analysis',
    section1Title: 'Monthly Analysis',
    dateRangeTitle: 'Jul 1 – Jul 31',
    scanLabel: '22 scans',
    totalScans: 22,
    avgLabel: '30-Day Avg',
  },
  quarterly: {
    title: 'Quarterly Skin Analysis',
    section1Title: 'Quarterly Analysis',
    dateRangeTitle: 'Jul – Sep 2026',
    scanLabel: '64 scans',
    totalScans: 64,
    avgLabel: 'Quarter Avg',
  },
  yearly: {
    title: 'Yearly Skin Analysis',
    section1Title: 'Yearly Analysis',
    dateRangeTitle: '2026',
    scanLabel: '248 scans',
    totalScans: 248,
    avgLabel: 'Annual Avg',
  },
};

// 7-day performance data with dates 15 to 21 (exactly 7 full days)
const WEEKLY_LOGS = [
  { day: 'Tue', dateNum: '15', date: 'Jul 15', score: 100, routineCompleted: true, waterIntake: '3.0L', sleep: '8.0h' },
  { day: 'Wed', dateNum: '16', date: 'Jul 16', score: 78, routineCompleted: false, waterIntake: '1.8L', sleep: '6.0h' },
  { day: 'Thu', dateNum: '17', date: 'Jul 17', score: 83, routineCompleted: true, waterIntake: '2.4L', sleep: '7.0h' },
  { day: 'Fri', dateNum: '18', date: 'Jul 18', score: 86, routineCompleted: true, waterIntake: '2.8L', sleep: '7.5h' },
  { day: 'Sat', dateNum: '19', date: 'Jul 19', score: 89, routineCompleted: true, waterIntake: '2.5L', sleep: '8.0h' },
  { day: 'Sun', dateNum: '20', date: 'Jul 20', score: 87, routineCompleted: true, waterIntake: '2.6L', sleep: '7.5h' },
  { day: 'Mon', dateNum: '21', date: 'Jul 21', score: 89, routineCompleted: true, waterIntake: '2.7L', sleep: '7.5h' },
];

// Section 6: Behavior Summary Data
const BEHAVIOR_DATA = [
  {
    id: 'sleep',
    title: 'Sleep',
    subtitle: 'Good 5 out of 7 days',
    daysAchieved: 5,
    totalDays: 7,
    icon: Moon,
  },
  {
    id: 'water',
    title: 'Water',
    subtitle: 'Good 3 out of 7 days',
    daysAchieved: 3,
    totalDays: 7,
    icon: Droplets,
  },
  {
    id: 'junk_food',
    title: 'Junk Food',
    subtitle: 'Avoided 6 out of 7 days',
    daysAchieved: 6,
    totalDays: 7,
    icon: Apple,
  },
  {
    id: 'stress',
    title: 'Stress',
    subtitle: 'Low 4 out of 7 days',
    daysAchieved: 4,
    totalDays: 7,
    icon: Activity,
  },
];

export default function InsightDetailScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const params = useLocalSearchParams<{ type?: string }>();
  
  const currentType = (params.type && PERIOD_CONFIG[params.type]) ? params.type : 'weekly';
  const periodInfo = PERIOD_CONFIG[currentType];

  const textColor = isDark ? '#ffffff' : '#000000';
  const textSecColor = isDark ? '#71717a' : '#9ca3af';
  const cardBg = isDark ? '#000000' : '#ffffff';
  const statCardBg = isDark ? '#09090b' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // Calculate statistics from the 7-day scan logs
  const scores = WEEKLY_LOGS.map(l => l.score);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);

  // Big circle gauge params for Bento Box (enlarged arc)
  const GAUGE_SIZE = 186;
  const STROKE_W = 14.5;
  const radius = (GAUGE_SIZE - STROKE_W) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Number(avgScore) / 100;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // ── Section 5: Best Day Image Modal State ──
  const [bestDayModalVisible, setBestDayModalVisible] = useState(false);

  // ── Section 3: Skin Score Chart Logic ──
  const [activePointIndex, setActivePointIndex] = useState(1); // Default to Tue (Peak 100)
  const chartScrollRef = useRef<ScrollView>(null);
  const chartData = WEEKLY_LOGS.map(l => ({ label: l.dateNum, value: l.score }));

  const visiblePlotWidth = SCREEN_WIDTH - 21 - 10 - 40;
  const chartWidth = Math.max(visiblePlotWidth * 1.25, chartData.length * 56);
  const chartHeight = 320;
  const paddingX = 36;
  const paddingY = 16;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;
  const minVal = 0;
  const maxVal = 100;
  const valRange = maxVal - minVal;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * plotWidth;
    const y = chartHeight - paddingY - ((d.value - minVal) / valRange) * plotHeight;
    return { x, y };
  });

  const handleChartTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    let closestIndex = 0;
    let minDistance = Infinity;
    points.forEach((p, index) => {
      const dist = Math.abs(p.x - locationX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });
    setActivePointIndex(closestIndex);
  };

  // Generate smooth line path
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = `M 0 ${points[0].y} L ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    linePath += ` L ${chartWidth} ${points[points.length - 1].y}`;
    areaPath = `${linePath} L ${chartWidth} ${chartHeight - paddingY} L 0 ${chartHeight - paddingY} Z`;
  }

  const yAxisTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];
  const TOOLTIP_H = 38;
  const TOOLTIP_GAP = 14;
  const activePoint = points[activePointIndex] || points[0];
  const tooltipAbove = !activePoint || activePoint.y >= (TOOLTIP_H + TOOLTIP_GAP);
  const tooltipTop = activePoint
    ? (tooltipAbove
        ? activePoint.y - TOOLTIP_H - TOOLTIP_GAP
        : activePoint.y + TOOLTIP_GAP)
    : 0;

  const PAGE_WIDTH = SCREEN_WIDTH - 40;
  const metricsScrollX = useSharedValue(0);
  const metricsScrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      metricsScrollX.value = e.contentOffset.x;
    },
  });

  // Viewport scroll triggers for each section
  const [section2Trigger, setSection2Trigger] = useState(true); // Active immediately on mount (top of page)
  const [section4Trigger, setSection4Trigger] = useState(false);
  const [section6Trigger, setSection6Trigger] = useState(false);

  const section4Y = useRef(0);
  const section6Y = useRef(0);

  const handleVerticalScroll = (e: any) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const viewportBottom = scrollY + SCREEN_HEIGHT * 0.9;

    if (!section4Trigger && section4Y.current > 0 && viewportBottom >= section4Y.current) {
      setSection4Trigger(true);
    }
    if (!section6Trigger && section6Y.current > 0 && viewportBottom >= section6Y.current) {
      setSection6Trigger(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F7' }]}>
      <Header title={periodInfo.title} showBack />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
      >
        
        {/* ── SECTION 1: HEADER (Center Aligned Weekly Analysis · Date Range) ───── */}
        <View style={styles.section1Header}>
          <Text style={[styles.periodTitle, { color: textColor }]}>
            {periodInfo.section1Title} · {periodInfo.dateRangeTitle}
          </Text>
        </View>

        {/* ── SECTION 2: 3-BOX BENTO GRID (2 Left Stacked + 1 Right Big Card) ──── */}
        <View style={styles.bentoGridRow}>
          {/* Left Column: 2 stacked metric cards with animated counting numbers */}
          <View style={styles.leftBoxesCol}>
            {/* Box 1: Max Score */}
            <View style={[styles.statBentoBox, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.statLabel, { color: textSecColor }]}>Max Score</Text>
              <AnimatedCounterText
                targetValue={highestScore}
                trigger={section2Trigger}
                style={[styles.statValue, { color: textColor }]}
              />
            </View>

            {/* Box 2: Total Scans */}
            <View style={[styles.statBentoBox, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.statLabel, { color: textSecColor }]}>Total Scans</Text>
              <AnimatedCounterText
                targetValue={periodInfo.totalScans}
                trigger={section2Trigger}
                style={[styles.statValue, { color: textColor }]}
              />
            </View>
          </View>

          {/* Right Column: 1 Big Animated Gauge Card */}
          <View style={[styles.bigGaugeBentoBox, { backgroundColor: cardBg, borderColor }]}>
            <AnimatedScoreGauge
              score={Number(avgScore)}
              isDark={isDark}
              trigger={section2Trigger}
              size={GAUGE_SIZE}
              strokeWidth={STROKE_W}
            />
          </View>
        </View>

        {/* ── SECTION 3: SKIN SCORE CHART ────────────────────────────────────── */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: textColor }]}>
              Skin Score from {periodInfo.dateRangeTitle}
            </Text>
          </View>

          {/* SVG Line Chart with Left Y-Axis */}
          <View style={styles.chartWrapperRow}>
            {/* Y-Axis Column */}
            <View style={[styles.yAxisContainer, { height: chartHeight }]}>
              {yAxisTicks.map((tick, index) => {
                const usableHeight = chartHeight - paddingY * 2;
                const topPosition = paddingY + (index / (yAxisTicks.length - 1)) * usableHeight;
                return (
                  <Text 
                    key={tick} 
                    style={[
                      styles.yAxisLabel, 
                      { 
                        color: textSecColor,
                        position: 'absolute',
                        top: topPosition - 8,
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: '700',
                      }
                    ]}
                  >
                    {tick}
                  </Text>
                );
              })}
            </View>

            {/* Scrollable SVG Plot Area */}
            <ScrollView 
              ref={chartScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              style={{ flex: 1 }}
              contentContainerStyle={{ width: chartWidth }}
            >
              <Pressable 
                onPress={handleChartTouch}
                style={[styles.chartContainer, { height: chartHeight, width: chartWidth }]}
              >
                <Svg width={chartWidth} height={chartHeight}>
                  <Defs>
                    <LinearGradient id="chartAreaGradInsight" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#937abd" stopOpacity="0.25" />
                      <Stop offset="1" stopColor="#937abd" stopOpacity="0.00" />
                    </LinearGradient>
                  </Defs>

                  {/* Horizontal grid lines at each Y-axis tick */}
                  {yAxisTicks.map((tick, index) => {
                    const usableH = chartHeight - paddingY * 2;
                    const yVal = paddingY + (index / (yAxisTicks.length - 1)) * usableH;
                    return (
                      <Path
                        key={`grid-${tick}`}
                        d={`M 0 ${yVal} L ${chartWidth} ${yVal}`}
                        stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                    );
                  })}

                  {/* Gradient Area Fill */}
                  <Path d={areaPath} fill="url(#chartAreaGradInsight)" />

                  {/* Line */}
                  <Path d={linePath} fill="none" stroke="#937abd" strokeWidth={3.5} strokeLinecap="round" />

                  {/* Data point circles */}
                  {points.map((p, index) => (
                    <Circle
                      key={index}
                      cx={p.x}
                      cy={p.y}
                      r={index === activePointIndex ? 6.5 : 4.5}
                      fill={isDark ? '#121212' : '#F5F5F7'}
                      stroke="#937abd"
                      strokeWidth={index === activePointIndex ? 3.5 : 2.5}
                    />
                  ))}
                </Svg>

                {/* Tooltip */}
                {activePoint && (
                  <View
                    style={[
                      styles.tooltipContainer,
                      {
                        left: activePoint.x - 24,
                        top: tooltipTop,
                        backgroundColor: isDark ? '#ffffff' : '#09090b',
                        zIndex: 999,
                      }
                    ]}
                  >
                    <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
                      {chartData[activePointIndex]?.value}
                    </Text>
                    <View
                      style={{
                        position: 'absolute',
                        [tooltipAbove ? 'bottom' : 'top']: -3,
                        alignSelf: 'center',
                        width: 12,
                        height: 12,
                        backgroundColor: isDark ? '#ffffff' : '#09090b',
                        borderRadius: 2,
                        transform: [{ rotate: '45deg' }],
                        zIndex: -1,
                      }}
                    />
                  </View>
                )}

                {/* X Axis labels positioned directly inside chart — showing date numbers */}
                <View style={styles.xAxisContainerInner}>
                  {chartData.map((d, i) => {
                    const p = points[i] || { x: 0 };
                    const isSelected = i === activePointIndex;
                    return (
                      <View 
                        key={i} 
                        style={[
                          styles.xAxisLabelWrapper, 
                          { left: p.x - 40 }
                        ]}
                      >
                        <Text style={[
                          styles.xAxisLabel, 
                          { 
                            color: isSelected 
                              ? (isDark ? '#ffffff' : '#000000') 
                              : (isDark ? '#71717a' : '#9ca3af'), 
                            fontSize: 13,
                            fontWeight: isSelected ? '800' : '600',
                          }
                        ]}>
                          {d.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Pressable>
            </ScrollView>
          </View>
        </View>

        {/* ── SECTION 4: OVERALL ZONE PERFORMANCE ────────────────────────────── */}
        <View 
          style={styles.zoneSectionWrapper}
          onLayout={(e) => {
            section4Y.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={[styles.sectionHeadingTitle, { color: textColor }]}>Overall Zone Performance</Text>
          
          <View style={styles.metricsWrapper}>
            <Animated.FlatList
              data={FACIAL_METRIC_PAGES}
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
              getItemLayout={(_, index) => (
                { length: PAGE_WIDTH, offset: PAGE_WIDTH * index, index }
              )}
              style={{ width: PAGE_WIDTH, flexGrow: 0 }}
              renderItem={({ item }) => (
                <View style={{ width: PAGE_WIDTH, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 4 }}>
                  {item.map((metric) => (
                    <AnimatedMetricNode
                      key={metric.id}
                      metric={metric}
                      isDark={isDark}
                      pageWidth={PAGE_WIDTH}
                      trigger={section4Trigger}
                    />
                  ))}
                </View>
              )}
            />
          </View>

          {/* Connecting Dots */}
          <View style={styles.dotsRow}>
            <ConnectingDots
              count={FACIAL_METRIC_PAGES.length}
              scrollX={metricsScrollX}
              itemWidth={PAGE_WIDTH}
              isDark={isDark}
            />
          </View>
        </View>

        {/* ── SECTION 5: BEST DAY (Direct Square Photo Card with Lightbox Modal) */}
        <View style={styles.bestDaySection}>
          <TouchableOpacity
            onPress={() => setBestDayModalVisible(true)}
            activeOpacity={0.9}
            style={[styles.bestDayCard, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
          >
            {/* Full-bleed portrait skin photo */}
            <Image
              source={MOCK_SCANS[0].image}
              style={styles.bestDayImage}
              resizeMode="cover"
            />

            {/* Top Left Badge: Best Day (Matching Progress page compare scan badges) */}
            <View style={styles.bestDayTopBadge}>
              <Text style={styles.bestDayBadgeText}>Best Day</Text>
            </View>

            {/* Bottom Left Badge: Date (Matching Progress page compare scan badges) */}
            <View style={styles.bestDayBottomBadge}>
              <Text style={styles.bestDayBadgeText}>Wednesday, Oct 4</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── SECTION 6: BEHAVIOR SUMMARY ────────────────────────────────────── */}
        <View 
          style={styles.behaviorSection}
          onLayout={(e) => {
            section6Y.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={[styles.sectionHeadingTitle, { color: textColor }]}>Behavior Summary</Text>

          <View style={[styles.behaviorCard, { backgroundColor: cardBg, borderColor }]}>
            {BEHAVIOR_DATA.map((item, index) => {
              const isLast = index === BEHAVIOR_DATA.length - 1;

              return (
                <View 
                  key={item.id} 
                  style={[
                    styles.behaviorItemContainer,
                    !isLast && { 
                      borderBottomWidth: 1, 
                      borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      paddingBottom: 16,
                      marginBottom: 16
                    }
                  ]}
                >
                  {/* Top Row: Title + Status description */}
                  <View style={styles.behaviorHeaderRow}>
                    <Text style={[styles.behaviorTitleText, { color: textColor }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.behaviorSubtitleText, { color: textSecColor }]}>
                      {item.subtitle}
                    </Text>
                  </View>

                  {/* Animated Gradient Progress Track */}
                  <AnimatedBehaviorBar
                    progressRatio={item.daysAchieved / item.totalDays}
                    isDark={isDark}
                    trigger={section6Trigger}
                  />
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* ── SECTION 5: BEST DAY FULLSCREEN MODAL ─────────────────────────────── */}
      <Modal
        visible={bestDayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBestDayModalVisible(false)}
      >
        {/* Backdrop — tapping outside closes the popup */}
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
          onPress={() => setBestDayModalVisible(false)}
        />

        {/* Modal content — centered card */}
        <View style={styles.modalFullscreen} pointerEvents="box-none">
          <View style={styles.modalCardWrapper}>
            {/* Top-Right Close Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setBestDayModalVisible(false)}
              activeOpacity={0.8}
            >
              <X size={18} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>

            {/* Portrait Image Card with date on bottom right */}
            <View style={styles.modalImageContainer}>
              <Image
                source={MOCK_SCANS[0].image}
                style={styles.modalImage}
                resizeMode="cover"
              />

              {/* Date written at bottom right */}
              <View style={styles.modalDateBottomRight}>
                <Text style={styles.modalDateBadgeText}>Wednesday, Oct 4</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  // ── Section 1 Header ──
  section1Header: {
    marginBottom: 20,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  // ── Section 2: 3-Box Bento Grid (60/40 Ratio) ──
  bentoGridRow: {
    flexDirection: 'row',
    gap: 12,
    height: 245,
    marginBottom: 28,
  },
  leftBoxesCol: {
    flex: 1, // 40%
    gap: 12,
    justifyContent: 'space-between',
  },
  statBentoBox: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 38,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  bigGaugeBentoBox: {
    flex: 1.5, // 60%
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  gaugeCenterContainer: {
    width: 186,
    height: 186,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenterTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gaugeScoreNumber: {
    fontSize: 58,
    fontWeight: '300',
    lineHeight: 64,
    textAlign: 'center',
    letterSpacing: -1,
  },
  gaugeScoreLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  // ── Section 3: Chart ──
  chartSection: {
    marginBottom: 28,
  },
  chartHeader: {
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chartWrapperRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 4,
    position: 'relative',
  },
  yAxisContainer: {
    width: 21,
    position: 'relative',
    marginRight: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'left',
    width: '100%',
  },
  chartContainer: {
    position: 'relative',
  },
  xAxisContainerInner: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 22,
  },
  xAxisLabelWrapper: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tooltipContainer: {
    position: 'absolute',
    width: 48,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  // ── Section Titles ──
  sectionHeadingTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  // ── Section 4: Zone Performance ──
  zoneSectionWrapper: {
    marginBottom: 32,
  },
  metricsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dotsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  // ── Section 5: Best Day Card ──
  bestDaySection: {
    marginBottom: 20,
  },
  bestDayCard: {
    width: '100%',
    aspectRatio: 1, // 1:1 True square aspect ratio
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
    backgroundColor: '#18181b',
  },
  bestDayImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bestDayTopBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
    elevation: 5,
  },
  bestDayBottomBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
    elevation: 5,
  },
  bestDayBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // ── Best Day Modal Styles ──
  modalFullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCardWrapper: {
    position: 'relative',
    width: '82%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: -18,
    right: -18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30,30,30,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  modalImageContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalDateBottomRight: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  modalDateBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // ── Section 6: Behavior Summary Styles ──
  behaviorSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  behaviorCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  behaviorItemContainer: {
    width: '100%',
  },
  behaviorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  behaviorTitleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  behaviorSubtitleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  behaviorProgressBarTrack: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  behaviorProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
