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

        {/* Scan Comparison Section */}
        {/* Title is outside on top of card */}
        <View
          style={styles.compareTitleRow}
          onLayout={(e) => { compareSectionY.current = e.nativeEvent.layout.y; }}
        >
          <Text style={[styles.sectionTitleOutside, { color: colors.text }]}>Compare Photos</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/select-scans',
                params: { selectedIds: JSON.stringify(compareIds) },
              })
            }
            style={[styles.selectScanBtn, { backgroundColor: isDark ? '#000000' : '#ffffff', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderWidth: 1 }]}
          >
            <Text style={[styles.selectScanText, { color: colors.text }]}>Select Photos</Text>
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
    paddingBottom: 16,
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
