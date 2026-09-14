import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  useWindowDimensions, 
  Image, 
  Modal,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/AppText';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Header from '@/components/layout/Header';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { 
  ArrowLeftRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Maximize2,
  X,
  Sparkles,
  ArrowUpRight,
  CalendarRange,
  PieChart,
  Award
} from 'lucide-react-native';
import { MOCK_SCANS } from '@/constants/mockScans';

// Reusable Circular Progress Icon Component with Primary + Secondary Gradient Arc
function CircularProgressIcon({
  progress,
  icon: IconComponent,
  id,
  size = 48,
  strokeWidth = 3.5,
  isDark = false,
  iconColor,
}: {
  progress: number;
  icon: any;
  id: string;
  size?: number;
  strokeWidth?: number;
  isDark?: boolean;
  iconColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const center = size / 2;
  const gradId = `insightProgressGrad-${id}`;

  // Background track border: in light mode a subtle dark/black border, in dark mode subtle border
  const trackBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
  // Background fill of the icon: clean neutral background in both modes
  const bgFill = isDark ? '#27272a' : '#f4f4f5';
  // Default icon color: dark in light mode, light in dark mode
  const resolvedIconColor = iconColor || (isDark ? '#f4f4f5' : '#18181b');

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#937abd" />
            <Stop offset="100%" stopColor="#d6cbe8" />
          </LinearGradient>
        </Defs>
        {/* Background track circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackBorder}
          strokeWidth={strokeWidth}
          fill={bgFill}
        />
        {/* Progress bar circle with Primary + Secondary Gradient */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>
      <IconComponent size={21} color={resolvedIconColor} />
    </View>
  );
}

// Insights analysis cards configuration
const INSIGHT_CARDS = [
  {
    id: 'weekly',
    type: 'weekly' as const,
    title: 'Weekly Skin Analysis',
    progress: 5 / 7,
    subtitle: 'Tracked across your daily scans & routine logs',
    description: 'Based on your weekly performance, scan logs, and daily routine consistency, your comprehensive 7-day skin report and progress trends are generated here.',
    icon: Sparkles,
  },
  {
    id: 'monthly',
    type: 'monthly' as const,
    title: 'Monthly Skin Analysis',
    progress: 22 / 30,
    subtitle: '30-day skin cycle & routine consistency overview',
    description: 'Aggregated from your full monthly scan timeline and habit adherence to evaluate your overall skin barrier resilience and hydration trends.',
    icon: CalendarRange,
  },
  {
    id: 'quarterly',
    type: 'quarterly' as const,
    title: 'Quarterly Skin Analysis',
    progress: 2 / 3,
    subtitle: 'Seasonal adaptation & multi-week health trends',
    description: 'Generated from long-term scan comparisons to track how your skin adapts across weather changes, product switches, and multi-month routines.',
    icon: PieChart,
  },
  {
    id: 'yearly',
    type: 'yearly' as const,
    title: 'Yearly Skin Analysis',
    progress: 9 / 12,
    subtitle: 'Annual skin health milestone & historical review',
    description: 'A complete historical analysis built from your year-long scan history, milestone completions, and overall skincare progress.',
    icon: Award,
  },
];

// Data sets for different periods
const WEEK_DATA = [
  { label: 'Mon', value: 78 },
  { label: 'Tue', value: 100 },
  { label: 'Wed', value: 78 },
  { label: 'Thu', value: 83 },
  { label: 'Fri', value: 86 },
  { label: 'Sat', value: 89 },
  { label: 'Sun', value: 87 },
];

const MONTH_DATA = [
  { label: 'Week 1', value: 72 },
  { label: 'Week 2', value: 80 },
  { label: 'Week 3', value: 85 },
  { label: 'Week 4', value: 89 },
];

const YEAR_DATA = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 70 },
  { label: 'Mar', value: 68 },
  { label: 'Apr', value: 74 },
  { label: 'May', value: 78 },
  { label: 'Jun', value: 80 },
  { label: 'Jul', value: 85 },
  { label: 'Aug', value: 82 },
  { label: 'Sep', value: 88 },
  { label: 'Oct', value: 86 },
  { label: 'Nov', value: 89 },
  { label: 'Dec', value: 92 },
];

export default function ProgressScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  // Receive selected scan IDs from select-scans picker
  const params = useLocalSearchParams<{ compareScanIds?: string }>();
  const [compareIds, setCompareIds] = useState<string[]>(['1', '2']);

  // Refs for auto-scroll to compare section
  const mainScrollRef = useRef<ScrollView>(null);
  const compareSectionY = useRef<number>(0);

  useEffect(() => {
    if (params.compareScanIds) {
      try {
        const parsed = JSON.parse(params.compareScanIds);
        if (Array.isArray(parsed) && parsed.length === 2) {
          setCompareIds(parsed);
          // Slight delay so layout has completed before scrolling
          setTimeout(() => {
            mainScrollRef.current?.scrollTo({ y: compareSectionY.current, animated: true });
          }, 200);
        }
      } catch {}
    }
  }, [params.compareScanIds]);

  // Resolve scan objects from IDs
  const beforeScan = MOCK_SCANS.find((s) => s.id === compareIds[0]) ?? MOCK_SCANS[0];
  const afterScan  = MOCK_SCANS.find((s) => s.id === compareIds[1]) ?? MOCK_SCANS[1];

  // Fullscreen modal state & which image (0=before, 1=after)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  // Hide chrome (X + chevrons) when user holds the image
  const [chromeVisible, setChromeVisible] = useState(true);

  // Ref to track active index reliably inside panResponder callbacks
  const modalIndexRef = useRef(0);

  const switchImage = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx > 1) return;
    modalIndexRef.current = targetIdx;
    setModalIndex(targetIdx);
  };

  // Reset chrome when modal opens/closes
  useEffect(() => {
    if (modalVisible) {
      modalIndexRef.current = modalIndex;
      setChromeVisible(true);
    }
  }, [modalVisible]);

  // PanResponder handling hold-to-hide UI and direct swipe between images
  const modalImagePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setChromeVisible(false);
      },

      onPanResponderMove: () => {},

      onPanResponderRelease: (_evt, gs) => {
        setChromeVisible(true);
        const currentIdx = modalIndexRef.current;

        if (gs.dx < -40 && currentIdx < 1) {
          switchImage(1); // Swipe left -> After
        } else if (gs.dx > 40 && currentIdx > 0) {
          switchImage(0); // Swipe right -> Before
        }
      },
    })
  ).current;

  // Selected Period Tab state: week, month, or year
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Active chart data
  const currentChartData = selectedPeriod === 'week' 
    ? WEEK_DATA 
    : selectedPeriod === 'month' 
      ? MONTH_DATA 
      : YEAR_DATA;

  // Selected chart point index
  const [activePointIndex, setActivePointIndex] = useState<number>(1);

  // Ref for chart horizontal scroll — resets to left on period change
  const chartScrollRef = useRef<ScrollView>(null);

  // Before/After comparison slider position (percentage 0 to 100)
  const [sliderPercentage, setSliderPercentage] = useState<number>(50);
  const [containerWidth, setContainerWidth] = useState<number>(SCREEN_WIDTH - 40);
  // Track navigation lock to prevent double-clicks from opening screen twice
  const isNavigating = useRef(false);

  // Modal scans array for chevron navigation
  const modalScans = [beforeScan, afterScan];

  // Setup PanResponder for Before/After horizontal Slider
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const touchX = gestureState.moveX - 20; // Subtract padding/margin of card
        let percentage = (touchX / containerWidth) * 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        setSliderPercentage(percentage);
      },
    })
  ).current;

  // ── Drag-to-resize compare card ──
  const MIN_CARD_H = 220;
  const MAX_CARD_H = 450;
  const [compareCardHeight, setCompareCardHeight] = useState(220);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const compareCardHeightRef = useRef(220);
  const dragStartHeight = useRef(220);

  // Keep ref synchronized with state to prevent stale values
  useEffect(() => {
    compareCardHeightRef.current = compareCardHeight;
  }, [compareCardHeight]);

  const resizePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: () => {
        setIsScrollEnabled(false);
        setIsDraggingHandle(true);
        dragStartHeight.current = compareCardHeightRef.current;
      },
      onPanResponderMove: (_evt: GestureResponderEvent, gs: PanResponderGestureState) => {
        let newH = dragStartHeight.current + gs.dy;
        if (newH < MIN_CARD_H) newH = MIN_CARD_H;
        if (newH > MAX_CARD_H) newH = MAX_CARD_H;
        setCompareCardHeight(newH);
      },
      onPanResponderRelease: () => {
        setIsScrollEnabled(true);
        setIsDraggingHandle(false);
      },
      onPanResponderTerminate: () => {
        setIsScrollEnabled(true);
        setIsDraggingHandle(false);
      },
    })
  ).current;

  const visiblePlotWidth = SCREEN_WIDTH - 21 - 10 - 28; // Screen width minus yAxisContainer (21) minus marginRight (10) minus left/right screen paddings (28)
  const chartWidth = currentChartData.length <= 5
    ? visiblePlotWidth // Few points (e.g. Month: 4 weeks) — fill the screen, no wide gaps
    : Math.max(visiblePlotWidth * 1.3, currentChartData.length * 60); // Many points (Week: 7 days, Year: 12 months) — scrollable wide chart
  const chartHeight = 340; // Taller chart so 100 is near top with proper spacing
  const paddingX = 40; // Starts 40px from the left edge to make the starting line segment longer
  const paddingY = 16; // Small top/bottom padding — 100 sits just below the title
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;
  const minVal = 0;
  const maxVal = 100;
  const valRange = maxVal - minVal;

  const points = currentChartData.map((d, index) => {
    const x = paddingX + (index / (currentChartData.length - 1)) * plotWidth;
    const y = chartHeight - paddingY - ((d.value - minVal) / valRange) * plotHeight;
    return { x, y };
  });

  // Remove custom PanResponder that was blocking normal scrolling
  const handleChartTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    // Find closest point to touch coordinate
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

  // Generate smooth line path using simple cubic bezier curves
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    // Start drawing the line from the far left edge of the canvas (x = 0) at the same height as Monday
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
    // Extend the line from Sunday to the far right edge of the canvas (x = chartWidth)
    linePath += ` L ${chartWidth} ${points[points.length - 1].y}`;
    
    // Construct the filled gradient area extending from x = 0 to x = chartWidth, closed at the bottom
    areaPath = `${linePath} L ${chartWidth} ${chartHeight - paddingY} L 0 ${chartHeight - paddingY} Z`;
  }

  // Helper to get stats dynamically
  const getStats = () => {
    const values = currentChartData.map(d => d.value);
    const avg = (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1);
    const max = Math.max(...values);
    return { avg, max, total: values.length };
  };

  const stats = getStats();

  // Y-axis labels from 100 down to 0
  const yAxisTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

  // Smart tooltip positioning — flip below dot if near top of chart
  const TOOLTIP_H = 38;  // smaller height for smaller tooltip
  const TOOLTIP_GAP = 14; // gap between tail tip and dot edge
  const activePoint = points[activePointIndex] || points[0];
  const tooltipAbove = !activePoint || activePoint.y >= (TOOLTIP_H + TOOLTIP_GAP);
  const tooltipTop = activePoint
    ? (tooltipAbove
        ? activePoint.y - TOOLTIP_H - TOOLTIP_GAP   // above dot
        : activePoint.y + TOOLTIP_GAP)               // below dot (flipped)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Progress Reports" />

      {/* ── Fullscreen Scan Modal — blurred overlay ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Dark overlay on top of blur for more depth */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />

        {/* Modal content — centered card */}
        <View style={styles.modalFullscreen}>
          {/* Card wrapper — image + X + chevrons together */}
          <View style={styles.modalCardWrapper}>

            {/* X close — top-right corner of card, hidden while holding */}
            {chromeVisible && (
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <X size={18} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            {/* Portrait image card (9:16) with gesture handling */}
            <View style={styles.modalImageContainer} {...modalImagePanResponder.panHandlers}>
              <Image
                source={modalScans[modalIndex].image}
                style={styles.modalImage}
                resizeMode="cover"
              />

              {/* Bottom-left date pill (e.g. Before (01 Aug) / After (15 Aug)) with rounded edges — disappears on hold */}
              {chromeVisible && (
                <View style={styles.modalDatePillBottomLeft}>
                  <Text style={styles.modalDatePillText}>
                    {modalIndex === 0 ? `Before (${beforeScan.date})` : `After (${afterScan.date})`}
                  </Text>
                </View>
              )}
            </View>

            {/* Left chevron — hidden while holding */}
            {chromeVisible && modalIndex === 1 && (
              <TouchableOpacity
                style={[styles.modalChevronBtn, styles.modalChevronLeft]}
                onPress={() => switchImage(0)}
                activeOpacity={0.8}
              >
                <ChevronLeft size={26} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            {/* Right chevron — hidden while holding */}
            {chromeVisible && modalIndex === 0 && (
              <TouchableOpacity
                style={[styles.modalChevronBtn, styles.modalChevronRight]}
                onPress={() => switchImage(1)}
                activeOpacity={0.8}
              >
                <ChevronRightIcon size={26} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView 
        ref={mainScrollRef}
        scrollEnabled={isScrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Skin Score Trend — directly on screen, no card */}
        <View style={styles.chartSection}>
          {/* Title & Tabs Row */}
          <View style={styles.chartHeader}>
            <View style={styles.titleWithIcon}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Skin Score</Text>
            </View>
            
            {/* Period selector tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: isDark ? '#18181b' : '#e4e4e7' }]}>
              {(['week', 'month', 'year'] as const).map((period) => (
                <Pressable
                  key={period}
                  onPress={() => {
                    setSelectedPeriod(period);
                    setActivePointIndex(0);
                    // Reset chart scroll back to left edge
                    chartScrollRef.current?.scrollTo({ x: 0, animated: false });
                  }}
                  style={[
                    styles.tabButton,
                    selectedPeriod === period && {
                      backgroundColor: isDark ? '#27272a' : '#ffffff',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  ]}
                >
                  <Text style={[
                    styles.tabButtonText,
                    { color: selectedPeriod === period ? colors.text : colors.textSecondary }
                  ]}>
                    {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Year'}
                  </Text>
                </Pressable>
              ))}
            </View>
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
                        color: colors.textSecondary,
                        position: 'absolute',
                        top: topPosition - 8, // Center text vertically
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
                    <LinearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Path d={areaPath} fill="url(#chartAreaGrad)" />

                  {/* Line */}
                  <Path d={linePath} fill="none" stroke="#937abd" strokeWidth={3.5} strokeLinecap="round" />

                  {/* Data point circles */}
                  {points.map((p, index) => (
                    <Circle
                      key={index}
                      cx={p.x}
                      cy={p.y}
                      r={index === activePointIndex ? 6.5 : 4.5}
                      fill={colors.background}
                      stroke="#937abd"
                      strokeWidth={index === activePointIndex ? 3.5 : 2.5}
                    />
                  ))}
                </Svg>

                {/* Tooltip — smart position: above dot normally, flips below when near chart top */}
                {activePoint && (
                  <View
                    style={[
                      styles.tooltipContainer,
                      {
                        left: activePoint.x - 24, // Centered: half of width 48
                        top: tooltipTop,
                        backgroundColor: isDark ? '#ffffff' : '#09090b',
                        zIndex: 999,
                      }
                    ]}
                  >
                    <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
                      {currentChartData[activePointIndex]?.value}
                    </Text>
                    {/* Rounded speech-bubble tail — rotated rounded square, no sharp point */}
                    <View
                      style={{
                        position: 'absolute',
                        [tooltipAbove ? 'bottom' : 'top']: -3, // Moved slightly inside the container to overlap with border radius curve
                        alignSelf: 'center',
                        width: 12,
                        height: 12,
                        backgroundColor: isDark ? '#ffffff' : '#09090b',
                        borderRadius: 2,
                        transform: [{ rotate: '45deg' }],
                        zIndex: -1, // Keep behind tooltip text if needed
                      }}
                    />
                  </View>
                )}

                {/* X Axis labels positioned directly inside chart container to prevent spacing gaps */}
                <View style={styles.xAxisContainerInner}>
                  {currentChartData.map((d, i) => {
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
                            fontSize: 12,
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

          {/* Stats Row in Beautiful Individual Boxes */}
          <View style={styles.statsGridRow}>
            <View style={[styles.statGridBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Score</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.avg}</Text>
            </View>
            <View style={[styles.statGridBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Max Score</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.max}</Text>
            </View>
            <View style={[styles.statGridBox, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Scans</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            </View>
          </View>
        </View>

        {/* Scan Comparison Section */}
        {/* Title is outside on top of card */}
        <View
          style={styles.compareTitleRow}
          onLayout={(e) => { compareSectionY.current = e.nativeEvent.layout.y; }}
        >
          <Text style={[styles.sectionTitleOutside, { color: colors.text }]}>Compare Scans</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/select-scans',
                params: { selectedIds: JSON.stringify(compareIds) },
              })
            }
            style={[styles.selectScanBtn, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: 1 }]}
          >
            <Text style={[styles.selectScanText, { color: colors.text }]}>Select Scans</Text>
            <ChevronDown size={16} color={colors.text} />
          </Pressable>
        </View>

        <View style={[
          styles.card,
          styles.compareCard,
          { 
            backgroundColor: colors.backgroundElement,
            borderColor: isDark ? '#27272a' : '#e4e4e7',
          }
        ]}>
          {/* Interactive slider image comparison */}
          <View 
            style={[styles.sliderContainer, { height: compareCardHeight }]}
            onLayout={(e) => {
              setContainerWidth(e.nativeEvent.layout.width);
            }}
          >
            {/* After Image (Background) — the second selected scan */}
            <Image 
              source={afterScan.image} 
              style={styles.sliderImage}
              resizeMode="cover"
            />
            
            {/* Before Image (Overlay clipped by width) — the first selected scan */}
            <View style={[styles.beforeImageWrapper, { width: `${sliderPercentage}%` }]}>
              <Image 
                source={beforeScan.image} 
                style={[styles.sliderImage, { width: containerWidth }]}
                resizeMode="cover"
              />
            </View>

            {/* Labels overlay — real dates from selected scans */}
            <View style={[styles.labelBadge, styles.labelBefore, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Text style={styles.labelText}>Before ({beforeScan.date})</Text>
            </View>
            <View style={[styles.labelBadge, styles.labelAfter, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
              <Text style={styles.labelText}>After ({afterScan.date})</Text>
            </View>

            {/* Draggable horizontal slider line + handle */}
            <View 
              style={[styles.sliderLine, { left: `${sliderPercentage}%` }]}
              {...panResponder.panHandlers}
            >
              <View style={styles.sliderHandle}>
                <ArrowLeftRight size={14} color="#ffffff" strokeWidth={2.5} />
              </View>
            </View>

            {/* Maximize button — top-right corner */}
            <TouchableOpacity
              style={styles.maximizeBtn}
              onPress={() => { setModalIndex(0); setModalVisible(true); }}
              activeOpacity={0.8}
            >
              <Maximize2 size={14} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Drag handle — hold and drag down/up to resize height */}
          <View
            style={styles.dragHandleRow}
            hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}
            {...resizePanResponder.panHandlers}
          >
            <View 
              style={[
                styles.dragHandlePill,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.18)' },
                isDraggingHandle && {
                  width: 48,
                  backgroundColor: isDark ? '#ffffff' : '#71717a',
                }
              ]} 
            />
          </View>
        </View>
        {/* Insight Report Section */}
        <View style={styles.insightTitleRow}>
          <Text style={[styles.sectionTitleOutside, { color: colors.text }]}>Your Insights</Text>
        </View>

        {INSIGHT_CARDS.map((card) => (
          <Pressable 
            key={card.id}
            onPress={() => {
              if (isNavigating.current) return;
              isNavigating.current = true;
              router.push({
                pathname: '/insight',
                params: { type: card.type },
              });
              // Release lock after route has changed
              setTimeout(() => {
                isNavigating.current = false;
              }, 800);
            }}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? '#000000' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            ]}
          >
            <View style={styles.insightHeaderRow}>
              <CircularProgressIcon
                id={card.id}
                progress={card.progress}
                icon={card.icon}
                size={48}
                strokeWidth={3.5}
                isDark={isDark}
              />
              <View style={styles.insightTextContent}>
                <Text style={[styles.insightCardTitle, { color: colors.text }]}>{card.title}</Text>
                <Text style={[styles.insightCardSubtitle, { color: colors.textSecondary }]}>{card.subtitle}</Text>
              </View>
              <View style={styles.insightArrowContainer}>
                <ArrowUpRight size={28} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
            </View>
            <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
              {card.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    marginTop: 10,
    marginBottom: 0,
  },
  insightTitleRow: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 2,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  insightIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextContent: {
    flex: 1,
    paddingRight: 6,
  },
  insightArrowContainer: {
    alignSelf: 'flex-start',
    marginTop: -2,
  },
  insightCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  insightCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  insightDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  chartSection: {
    paddingLeft: 14,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 3,
    gap: 2,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartWrapperRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 8,
    position: 'relative',
  },
  yAxisContainer: {
    width: 21,
    position: 'relative',
    marginRight: 10,
    paddingHorizontal: 0,
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
    bottom: -4, // Shifted lower to align below 0 Y-axis tick
    left: 0,
    right: 0,
    height: 22,
  },
  xAxisLabelWrapper: {
    position: 'absolute',
    width: 80, // Increased from 40 to prevent text wrapping on "Week 1", "Week 2" etc.
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '700', // Bold labels
  },
  tooltipContainer: {
    position: 'absolute',
    width: 48,                // Smaller width
    paddingHorizontal: 8,
    paddingVertical: 6,       // Smaller vertical padding
    borderRadius: 8,          // Slightly smaller border radius
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 13,             // Smaller text size
    fontWeight: '800',
  },
  // tooltipArrow removed — replaced with inline rotated rounded View (speech bubble tail)
  statsDivider: {
    height: 1,
    marginVertical: 16,
  },
  statsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  statGridBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
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
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  verticalDivider: {
    width: 1,
    height: 24,
  },
  compareTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  sectionTitleOutside: {
    fontSize: 18,             // Bigger section title
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  selectScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,    // Bigger padding
    paddingVertical: 10,      // Bigger padding
    borderRadius: 24,         // Rounded button
  },
  selectScanText: {
    fontSize: 13,             // Bigger text size
    fontWeight: '700',
  },
  compareCard: {
    padding: 10,
    paddingBottom: 2,
  },
  sliderContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#3f3f46',
  },
  dragHandleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: 60,
    alignSelf: 'center',
    width: '100%',
  },
  dragHandlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  maximizeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderImage: {
    height: '100%',
  },
  beforeImageWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -1,
  },
  sliderHandle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#937abd',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  labelBadge: {
    position: 'absolute',
    bottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelBefore: {
    left: 12,
  },
  labelAfter: {
    right: 12,
  },
  labelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
  },
  reportsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  reportIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reportDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reportDate: {
    fontSize: 9,
    fontWeight: '600',
  },
  // ── Fullscreen Modal Styles (blurred overlay) ──
  modalFullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Wrapper that holds image + X button + chevrons together
  // No overflow:hidden so chevrons can peek outside
  modalCardWrapper: {
    position: 'relative',
    width: '78%',
    // height auto from aspectRatio on image container
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
    // Portrait ratio: 9:16 — always portrait regardless of image orientation
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  // Chevron buttons — positioned on the CARD WRAPPER, half inside half outside
  modalChevronBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(20,20,20,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  // Left chevron: 50% hangs outside the left edge
  modalChevronLeft: {
    left: -26,
  },
  // Right chevron: 50% hangs outside the right edge
  modalChevronRight: {
    right: -26,
  },
  // Bottom-left rounded pill inside modal image container
  modalDatePillBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalDatePillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
