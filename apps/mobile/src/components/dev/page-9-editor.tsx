import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, RotateCcw, Plus, Minus, ChevronUp, ChevronDown, Wand2, Eye, EyeOff } from 'lucide-react-native';
import OnboardingProgressBar from '@/components/OnboardingProgressBar';
import { getResponsiveValue } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Arc default configuration
const ANGLE_STEP_DEG = 24;
const ARC_RADIUS_APPROX = SCREEN_WIDTH * 0.72;
const CHORD_PX = 2 * ARC_RADIUS_APPROX * Math.sin(((ANGLE_STEP_DEG / 2) * Math.PI) / 180);
const SENSITIVITY = 1 / CHORD_PX;

const ITEM_HALF_WIDTH = 42;
const ITEM_HALF_HEIGHT = 42;

interface DialItem {
  id: string;
  numberStr: string;
  title: string;
  subtitle: string;
}

const ITEMS: DialItem[] = [
  { id: '1', numberStr: '01', title: 'Minimal', subtitle: 'Only when needed and light.' },
  { id: '2', numberStr: '02', title: 'Subtle', subtitle: 'A gentle daily baseline.' },
  { id: '3', numberStr: '03', title: 'Ambient', subtitle: 'Already on and never\nturns off.' },
  { id: '4', numberStr: '04', title: 'Balanced', subtitle: 'Steady throughout the day.' },
  { id: '5', numberStr: '05', title: 'Elevated', subtitle: 'Present when you need focus.' },
  { id: '6', numberStr: '06', title: 'Radiant', subtitle: 'Glowing and active.' },
  { id: '7', numberStr: '07', title: 'Active', subtitle: 'Consistent daily care.' },
  { id: '8', numberStr: '08', title: 'Deep Care', subtitle: 'Nourishing beneath the surface.' },
  { id: '9', numberStr: '09', title: 'Resilient', subtitle: 'Building skin strength.' },
  { id: '10', numberStr: '10', title: 'Revitalized', subtitle: 'Refreshed & energized.' },
  { id: '11', numberStr: '11', title: 'Clarifying', subtitle: 'Pure and clear balance.' },
  { id: '12', numberStr: '12', title: 'Restorative', subtitle: 'Healing overnight.' },
  { id: '13', numberStr: '13', title: 'Intense', subtitle: 'Targeted hydration.' },
  { id: '14', numberStr: '14', title: 'Calming', subtitle: 'Soothing all reactions.' },
  { id: '15', numberStr: '15', title: 'Nourished', subtitle: 'Rich cellular support.' },
  { id: '16', numberStr: '16', title: 'Shielded', subtitle: 'Environmental protection.' },
  { id: '17', numberStr: '17', title: 'Pure Glow', subtitle: 'Optimal dermal defense.' },
  { id: '18', numberStr: '18', title: 'Mastered', subtitle: 'Total skin confidence.' },
  { id: '19', numberStr: '19', title: 'Mastered', subtitle: 'Total skin confidence.' },
  { id: '20', numberStr: '2L', title: '2 Litres', subtitle: 'Deep hydration & harmony.' },
];

export interface Point {
  x: number;
  y: number;
}

export const INITIAL_CALIBRATED_POINTS: Point[] = [
  { x: 44, y: 75 },
  { x: 126, y: 158 },
  { x: 182, y: 293 },
  { x: 183, y: 447 },
  { x: 139, y: 571 },
];

function getCatmullRomBezierPath(pts: Point[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y };
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x, y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y };

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function sampleSplinePoint(pts: Point[], d: number): Point {
  if (pts.length < 5) return { x: 0, y: 0 };

  if (d <= -2) {
    const diffX = pts[1].x - pts[0].x;
    const diffY = pts[1].y - pts[0].y;
    const factor = d - (-2);
    return { x: pts[0].x + factor * diffX, y: pts[0].y + factor * diffY };
  }
  if (d >= 2) {
    const diffX = pts[4].x - pts[3].x;
    const diffY = pts[4].y - pts[3].y;
    const factor = d - 2;
    return { x: pts[4].x + factor * diffX, y: pts[4].y + factor * diffY };
  }

  const globalT = d + 2;
  const seg = Math.min(3, Math.max(0, Math.floor(globalT)));
  const t = globalT - seg;

  const p0 = seg > 0 ? pts[seg - 1] : { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y };
  const p1 = pts[seg];
  const p2 = pts[seg + 1];
  const p3 = seg + 2 < pts.length ? pts[seg + 2] : { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x, y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y };

  const cp1x = p1.x + (p2.x - p0.x) / 6;
  const cp1y = p1.y + (p2.y - p0.y) / 6;
  const cp2x = p2.x - (p3.x - p1.x) / 6;
  const cp2y = p2.y - (p3.y - p1.y) / 6;

  const oneMinusT = 1 - t;
  const x =
    Math.pow(oneMinusT, 3) * p1.x +
    3 * Math.pow(oneMinusT, 2) * t * cp1x +
    3 * oneMinusT * Math.pow(t, 2) * cp2x +
    Math.pow(t, 3) * p2.x;
  const y =
    Math.pow(oneMinusT, 3) * p1.y +
    3 * Math.pow(oneMinusT, 2) * t * cp1y +
    3 * oneMinusT * Math.pow(t, 2) * cp2y +
    Math.pow(t, 3) * p2.y;

  return { x, y };
}

// Least-squares circle fitting
function refineToBestFitCircle(pts: Point[]): Point[] {
  if (pts.length < 3) return pts;
  const n = pts.length;
  let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
  let sumX3 = 0, sumY3 = 0, sumXY2 = 0, sumX2Y = 0;

  for (const p of pts) {
    const x = p.x;
    const y = p.y;
    const x2 = x * x;
    const y2 = y * y;
    sumX += x;
    sumY += y;
    sumX2 += x2;
    sumY2 += y2;
    sumXY += x * y;
    sumX3 += x * x2;
    sumY3 += y * y2;
    sumXY2 += x * y2;
    sumX2Y += x2 * y;
  }

  const C = n * sumX2 - sumX * sumX;
  const D = n * sumXY - sumX * sumY;
  const E = n * sumX3 + n * sumXY2 - (sumX2 + sumY2) * sumX;
  const G = n * sumY2 - sumY * sumY;
  const H = n * sumX2Y + n * sumY3 - (sumX2 + sumY2) * sumY;

  const denom = 2 * (C * G - D * D);
  if (Math.abs(denom) < 1e-6) return pts;

  const cx = (G * E - D * H) / denom;
  const cy = (C * H - D * E) / denom;

  let sumR = 0;
  for (const p of pts) {
    sumR += Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
  }
  const R = sumR / n;

  return pts.map((p) => {
    const angle = Math.atan2(p.y - cy, p.x - cx);
    return {
      x: Math.round(cx + R * Math.cos(angle)),
      y: Math.round(cy + R * Math.sin(angle)),
    };
  });
}

function computeOrbitCurveAndTicks(pts: Point[], deltas: number[], orbitOffset: number = 32) {
  const orbitControlPoints = pts.map((p, i) => {
    const pPrev = i > 0 ? pts[i - 1] : { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y };
    const pNext = i < pts.length - 1 ? pts[i + 1] : { x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x, y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y };
    const tx = pNext.x - pPrev.x;
    const ty = pNext.y - pPrev.y;
    const len = Math.hypot(tx, ty) || 1;
    let nx = -ty / len;
    let ny = tx / len;
    if (nx > 0) { nx = -nx; ny = -ny; }
    return {
      x: p.x + nx * orbitOffset,
      y: p.y + ny * orbitOffset,
    };
  });

  const orbitPath = getCatmullRomBezierPath(orbitControlPoints);

  const ticks = deltas.map((d) => {
    const pNum = sampleSplinePoint(pts, d);
    const pPrev = sampleSplinePoint(pts, d - 0.1);
    const pNext = sampleSplinePoint(pts, d + 0.1);
    const tx = pNext.x - pPrev.x;
    const ty = pNext.y - pPrev.y;
    const len = Math.hypot(tx, ty) || 1;
    let nx = -ty / len;
    let ny = tx / len;
    if (nx > 0) { nx = -nx; ny = -ny; }

    const pOrbit = {
      x: pNum.x + nx * orbitOffset,
      y: pNum.y + ny * orbitOffset,
    };

    const tickLen = 14;
    const pTickEnd = {
      x: pOrbit.x - nx * tickLen,
      y: pOrbit.y - ny * tickLen,
    };

    return {
      d,
      numPos: pNum,
      orbitPos: pOrbit,
      tickEnd: pTickEnd,
      isActive: d === 0,
    };
  });

  return { orbitPath, ticks };
}

export interface Page9EditorProps {
  onBack?: () => void;
  onNext?: (selectedAmbientLevel: string) => void;
  initialPoints?: Point[];
  initialIconPos?: Point;
  initialIconSize?: number;
  initialTextGap?: number;
}

export default function Page9Editor({
  onBack,
  onNext,
  initialPoints = INITIAL_CALIBRATED_POINTS,
  initialIconPos = { x: Math.round(SCREEN_WIDTH * 0.76), y: 324 },
  initialIconSize = 64,
  initialTextGap = 72,
}: Page9EditorProps) {
  // 5 Draggable Control Points state
  const [controlPoints, setControlPoints] = useState<Point[]>(initialPoints);
  const controlPointsRef = useRef<Point[]>(controlPoints);
  controlPointsRef.current = controlPoints;

  const dotStartPositions = useRef<{ [key: number]: Point }>({});

  // Draggable & Resizable Icon State
  const [iconPos, setIconPos] = useState<Point>(initialIconPos);
  const iconPosRef = useRef<Point>(iconPos);
  iconPosRef.current = iconPos;
  const [iconSize, setIconSize] = useState<number>(initialIconSize);
  const iconStartPos = useRef<Point>({ x: 0, y: 0 });

  // Fixed text gap distance from apex number
  const [textGap, setTextGap] = useState<number>(initialTextGap);

  // Calibration Tools visibility / Preview Mode toggle
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // HUD collapsed state
  const [hudExpanded, setHudExpanded] = useState<boolean>(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const animIndex = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  const contentFade = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;

  // Layout Rules (Dynamic measurement, line wrapping detection, border radius merging)
  const [wordLayouts, setWordLayouts] = useState<{ [key: string]: { x: number; y: number; width: number } }>({});
  const layoutFrozen = useRef(false);

  const handleWordLayout = useCallback((key: string, e: any) => {
    if (layoutFrozen.current) return;
    const { x, y, width } = e.nativeEvent.layout;
    setWordLayouts((prev) => {
      if (prev[key] && Math.abs(prev[key].y - y) < 1) return prev;
      const next = { ...prev, [key]: { x, y, width } };
      if (next['cellular'] && next['repair']) {
        layoutFrozen.current = true;
      }
      return next;
    });
  }, []);

  const isSameLine = (key1: string, key2: string) => {
    if (!wordLayouts[key1] || !wordLayouts[key2]) return true;
    return Math.abs(wordLayouts[key1].y - wordLayouts[key2].y) < 10;
  };

  const cellularSameAsRepair = isSameLine('cellular', 'repair');

  const cellularBorderRadius = {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    borderTopRightRadius: cellularSameAsRepair ? 0 : 2,
    borderBottomRightRadius: cellularSameAsRepair ? 0 : 2,
  };

  const repairBorderRadius = {
    borderTopLeftRadius: cellularSameAsRepair ? 0 : 2,
    borderBottomLeftRadius: cellularSameAsRepair ? 0 : 2,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  };

  const animateToIndex = useCallback((targetIndex: number) => {
    const clamped = Math.max(0, Math.min(ITEMS.length - 1, targetIndex));
    currentOffset.current = clamped;

    Animated.parallel([
      Animated.spring(animIndex, {
        toValue: clamped,
        tension: 90,
        friction: 12,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(contentFade, { toValue: 0.3, duration: 80, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(contentSlide, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();

    setCurrentIndex(clamped);
  }, [animIndex, contentFade, contentSlide]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        animIndex.stopAnimation((val) => {
          currentOffset.current = val;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const nextVal = currentOffset.current - gesture.dy * SENSITIVITY;
        const clamped = Math.max(-0.4, Math.min(ITEMS.length - 0.6, nextVal));
        animIndex.setValue(clamped);

        const rounded = Math.max(0, Math.min(ITEMS.length - 1, Math.round(clamped)));
        if (rounded !== currentIndex) {
          setCurrentIndex(rounded);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const velocityOffset = -gesture.vy * 0.15;
        const target = Math.round(currentOffset.current - gesture.dy * SENSITIVITY + velocityOffset);
        animateToIndex(target);
      },
    })
  ).current;

  // Individual PanResponders for the 5 draggable points
  const dotPanResponders = useRef(
    [0, 1, 2, 3, 4].map((index) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          const currentPt = controlPointsRef.current[index];
          dotStartPositions.current[index] = { ...currentPt };
        },
        onPanResponderMove: (_, gesture) => {
          const start = dotStartPositions.current[index] || controlPointsRef.current[index];
          const newX = Math.round(start.x + gesture.dx);
          const newY = Math.round(start.y + gesture.dy);
          setControlPoints((prev) => {
            const next = [...prev];
            next[index] = { x: newX, y: newY };
            return next;
          });
        },
        onPanResponderRelease: () => {
          dotStartPositions.current[index] = { ...controlPointsRef.current[index] };
        },
      })
    )
  ).current;

  // PanResponder for Draggable Icon
  const iconPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        iconStartPos.current = { ...iconPosRef.current };
      },
      onPanResponderMove: (_, gesture) => {
        const newX = Math.round(iconStartPos.current.x + gesture.dx);
        const newY = Math.round(iconStartPos.current.y + gesture.dy);
        setIconPos({ x: newX, y: newY });
      },
      onPanResponderRelease: () => {
        iconStartPos.current = { ...iconPosRef.current };
      },
    })
  ).current;

  const handleResetPoints = () => {
    setControlPoints(INITIAL_CALIBRATED_POINTS);
    setIconPos({
      x: Math.round(SCREEN_WIDTH * 0.76),
      y: 324,
    });
    setIconSize(64);
    setTextGap(72);
  };

  const handleRefineArc = () => {
    setControlPoints((prev) => refineToBestFitCircle(prev));
  };

  useEffect(() => {
    animIndex.setValue(0);
    currentOffset.current = 0;
  }, [animIndex]);

  const activeItem = ITEMS[currentIndex] || ITEMS[0];

  const primaryColor = '#937abd';
  const shadowColor = '#735b9c';

  const handleNext = () => {
    if (onNext) {
      onNext(activeItem.numberStr);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const apexX = controlPoints[2]?.x ?? 182;
  const apexY = controlPoints[2]?.y ?? 293;

  const inputRange = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
  const redPathData = getCatmullRomBezierPath(controlPoints);

  const { orbitPath, ticks } = computeOrbitCurveAndTicks(controlPoints, [-3, -2, -1, 0, 1, 2, 3], 34);

  return (
    <View style={styles.root} {...panResponder.panHandlers}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header with Progress Bar and Top-Right Coordinates HUD */}
        <View style={styles.headerWrapper}>
          <Pressable onPress={handleBack} style={styles.backButtonTop} hitSlop={12}>
            <ArrowLeft size={20} color="#2a2a2a" strokeWidth={2.5} />
          </Pressable>

          <View style={styles.progressContainer}>
            <OnboardingProgressBar step={4} total={7} />
          </View>

          {/* Top-Right HUD - only shown in Edit/Calibration Mode */}
          {isEditMode && (
            <View style={styles.topRightHud}>
              <View style={styles.hudHeader}>
                <Text style={styles.hudTitle}>LAYOUT HUD</Text>
                <View style={styles.hudHeaderActions}>
                  <Pressable onPress={handleResetPoints} hitSlop={8} style={styles.resetButton}>
                    <RotateCcw size={10} color="#fca5a5" />
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setHudExpanded((v) => !v)}
                    hitSlop={8}
                    style={styles.collapseButton}
                  >
                    {hudExpanded ? <ChevronUp size={14} color="#ffffff" /> : <ChevronDown size={14} color="#ffffff" />}
                  </Pressable>
                </View>
              </View>

              {hudExpanded && (
                <View style={styles.hudBody}>
                  {/* 5 Points coordinates */}
                  <View style={styles.hudPointsGrid}>
                    {controlPoints.map((pt, idx) => (
                      <View key={`hud-pt-${idx}`} style={styles.hudPointItem}>
                        <View style={styles.hudDotBadge}>
                          <Text style={styles.hudDotBadgeText}>P{idx + 1}</Text>
                        </View>
                        <Text style={styles.hudCoordText}>
                          {pt.x},{pt.y}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Draggable Icon info & Resizer */}
                  <View style={styles.hudControlRow}>
                    <Text style={styles.hudLabel}>Icon ({iconPos.x},{iconPos.y}):</Text>
                    <View style={styles.hudSizeControls}>
                      <Pressable
                        onPress={() => setIconSize((s) => Math.max(20, s - 4))}
                        style={styles.hudStepBtn}
                        hitSlop={5}
                      >
                        <Minus size={11} color="#ffffff" />
                      </Pressable>
                      <Text style={styles.hudSizeVal}>{iconSize}px</Text>
                      <Pressable
                        onPress={() => setIconSize((s) => Math.min(180, s + 4))}
                        style={styles.hudStepBtn}
                        hitSlop={5}
                      >
                        <Plus size={11} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>

                  {/* Number to Text gap adjuster */}
                  <View style={styles.hudControlRow}>
                    <Text style={styles.hudLabel}>Text Gap:</Text>
                    <View style={styles.hudSizeControls}>
                      <Pressable
                        onPress={() => setTextGap((g) => Math.max(10, g - 4))}
                        style={styles.hudStepBtn}
                        hitSlop={5}
                      >
                        <Minus size={11} color="#ffffff" />
                      </Pressable>
                      <Text style={styles.hudSizeVal}>{textGap}px</Text>
                      <Pressable
                        onPress={() => setTextGap((g) => Math.min(140, g + 4))}
                        style={styles.hudStepBtn}
                        hitSlop={5}
                      >
                        <Plus size={11} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Question Title */}
          <View style={styles.titleContainer}>
            <View style={styles.titleFlow}>
              <Text style={styles.title}>And </Text>
              <Text style={styles.title}>how </Text>
              <Text style={styles.title}>many </Text>
              <Text style={styles.title}>hours </Text>
              <Text style={styles.title}>of </Text>
              <View
                style={styles.highlightWrapper}
                onLayout={(e) => handleWordLayout('cellular', e)}
              >
                <View style={[styles.highlightStripe, cellularBorderRadius]} />
                <Text style={styles.title}>cellular </Text>
              </View>
              <View
                style={styles.highlightWrapper}
                onLayout={(e) => handleWordLayout('repair', e)}
              >
                <View style={[styles.highlightStripe, repairBorderRadius]} />
                <Text style={styles.title}>repair </Text>
              </View>
              <Text style={styles.title}>do </Text>
              <Text style={styles.title}>you </Text>
              <Text style={styles.title}>get?</Text>
            </View>
          </View>

          {/* Main interactive dial container */}
          <View style={styles.dialContainer}>
            {/* SVG Orbit Track Curve, Radial Spoke Ticks, and Indicator Dots (only in Edit mode) */}
            {isEditMode && (
              <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Concentric Inner Orbit Track Arc */}
                <Path
                  d={orbitPath}
                  stroke="#e2e1e8"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Red Calibration Guide Curve */}
                <Path
                  d={redPathData}
                  stroke="#ff2b2b"
                  strokeWidth={2.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6,4"
                  fill="none"
                />

                {/* Radial spoke connector ticks from orbit to numbers */}
                {ticks.map((t) => (
                  <Line
                    key={`orbit-tick-${t.d}`}
                    x1={t.orbitPos.x}
                    y1={t.orbitPos.y}
                    x2={t.tickEnd.x}
                    y2={t.tickEnd.y}
                    stroke={t.isActive ? '#2a2a2a' : '#d8d7df'}
                    strokeWidth={t.isActive ? 2.5 : 1.5}
                    strokeLinecap="round"
                  />
                ))}

                {/* Dots along the concentric orbit line */}
                {ticks.map((t) => (
                  <Circle
                    key={`orbit-dot-${t.d}`}
                    cx={t.orbitPos.x}
                    cy={t.orbitPos.y}
                    r={3}
                    fill="#c8c7cf"
                  />
                ))}
              </Svg>
            )}

            {/* Dial Numbers interpolated along the dynamic curve */}
            {ITEMS.map((item, index) => {
              const delta = Animated.subtract(index, animIndex);

              const translateX = delta.interpolate({
                inputRange,
                outputRange: inputRange.map((d) => {
                  const sampled = sampleSplinePoint(controlPoints, d);
                  return sampled.x - ITEM_HALF_WIDTH;
                }),
                extrapolate: 'clamp',
              });

              const translateY = delta.interpolate({
                inputRange,
                outputRange: inputRange.map((d) => {
                  const sampled = sampleSplinePoint(controlPoints, d);
                  return sampled.y - ITEM_HALF_HEIGHT;
                }),
                extrapolate: 'clamp',
              });

              const rotate = delta.interpolate({
                inputRange,
                outputRange: inputRange.map((d) => `${d * ANGLE_STEP_DEG}deg`),
                extrapolate: 'clamp',
              });

              const opacity = delta.interpolate({
                inputRange: [-5, -4, -3, -2.5, -1.5, -1, 0, 1, 1.5, 2.5, 3, 4, 5],
                outputRange: [0, 0, 0, 0, 0.25, 0.4, 1, 0.4, 0.25, 0, 0, 0, 0],
                extrapolate: 'clamp',
              });

              const scale = delta.interpolate({
                inputRange: [-3, -2, -1, 0, 1, 2, 3],
                outputRange: [0.65, 0.75, 0.88, 1.15, 0.88, 0.75, 0.65],
                extrapolate: 'clamp',
              });

              const isCenter = index === currentIndex;

              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.itemWrapper,
                    {
                      transform: [
                        { translateX },
                        { translateY },
                        { rotate },
                        { scale },
                      ],
                      opacity,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => animateToIndex(index)}
                    hitSlop={15}
                    style={styles.numberPressable}
                  >
                    <Text
                      style={[
                        styles.numberText,
                        isCenter ? styles.numberTextActive : styles.numberTextInactive,
                      ]}
                    >
                      {item.numberStr}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}

            {/* 5 Big Draggable Numbers (1, 2, 3, 4, 5) - shown in Edit Mode */}
            {isEditMode &&
              controlPoints.map((pt, idx) => (
                <View
                  key={`control-dot-${idx}`}
                  style={[
                    styles.controlDotWrapper,
                    {
                      left: pt.x - 26,
                      top: pt.y - 26,
                    },
                  ]}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  {...dotPanResponders[idx].panHandlers}
                >
                  <View style={styles.controlDot}>
                    <Text style={styles.controlDotText}>{idx + 1}</Text>
                  </View>
                </View>
              ))}

            {/* Draggable & Resizable Illustration/Icon Badge */}
            <View
              style={[
                styles.draggableIconWrapper,
                {
                  left: iconPos.x - iconSize / 2,
                  top: iconPos.y - iconSize / 2,
                  width: iconSize + 16,
                  height: iconSize + 16,
                },
              ]}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              {...iconPanResponder.panHandlers}
            >
              <View
                style={[
                  styles.iconPill,
                  {
                    width: iconSize,
                    height: iconSize,
                    borderRadius: iconSize / 2,
                    backgroundColor: '#f5f0fc',
                    borderWidth: isEditMode ? 2 : 0,
                    borderColor: '#937abd',
                    borderStyle: isEditMode ? 'dashed' : 'solid',
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/images/envelope_heart.webp')}
                  style={{ width: iconSize * 0.72, height: iconSize * 0.72, resizeMode: 'contain' }}
                />
              </View>
              {isEditMode && (
                <View style={styles.iconDragBadge}>
                  <Text style={styles.iconDragBadgeText}>{iconSize}px</Text>
                </View>
              )}
            </View>

            {/* Active Item Description Box */}
            <Animated.View
              style={[
                styles.infoCard,
                {
                  top: apexY - 34,
                  left: apexX + textGap,
                  maxWidth: SCREEN_WIDTH - (apexX + textGap) - 20,
                  opacity: contentFade,
                  transform: [{ translateY: contentSlide }],
                },
              ]}
            >
              <Text style={styles.infoTitle} numberOfLines={2} ellipsizeMode="tail">
                {activeItem.title}
              </Text>
              <Text style={styles.infoSubtitle} numberOfLines={3} ellipsizeMode="tail">
                {activeItem.subtitle}
              </Text>
            </Animated.View>
          </View>

          {/* Bottom Action Area: Refine & Toggle at Bottom-Left, Next Button at Bottom-Right */}
          <View style={styles.bottomContainer}>
            {/* Bottom Left Controls */}
            <View style={styles.bottomLeftActions}>
              {isEditMode && (
                <Pressable onPress={handleRefineArc} hitSlop={10} style={styles.refineButton}>
                  <Wand2 size={14} color="#ffffff" strokeWidth={2.4} />
                  <Text style={styles.refineButtonText}>Refine Arc</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => setIsEditMode((v) => !v)}
                hitSlop={10}
                style={[
                  styles.toggleModeButton,
                  isEditMode ? styles.toggleModeButtonActive : styles.toggleModeButtonPreview,
                ]}
              >
                {isEditMode ? <Eye size={13} color="#ffffff" /> : <EyeOff size={13} color="#374151" />}
                <Text style={[styles.toggleModeText, isEditMode ? styles.toggleModeTextActive : styles.toggleModeTextPreview]}>
                  {isEditMode ? 'Editing' : 'Preview'}
                </Text>
              </Pressable>
            </View>

            {/* Bottom Right Next Button */}
            <View style={styles.button3DContainer}>
              <Pressable style={styles.pressableArea} onPress={handleNext}>
                {({ pressed }) => (
                  <>
                    <View style={[styles.buttonShadow, { backgroundColor: shadowColor }]} />
                    <View
                      style={[
                        styles.buttonMid,
                        {
                          backgroundColor: shadowColor,
                          top: pressed ? getResponsiveValue(1, 1, 1, 1) : getResponsiveValue(-2, -2.5, -2.5, -2.5),
                          left: pressed ? getResponsiveValue(1, 1, 1, 1) : getResponsiveValue(-2, -2.5, -2.5, -2.5),
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.nextButton,
                        {
                          backgroundColor: primaryColor,
                          top: pressed ? getResponsiveValue(1.5, 2, 2, 2) : getResponsiveValue(-4, -5, -5, -5),
                          left: pressed ? getResponsiveValue(1.5, 2, 2, 2) : getResponsiveValue(-4, -5, -5, -5),
                        },
                      ]}
                    >
                      <ArrowRight size={getResponsiveValue(22, 24, 26, 28)} color="#ffffff" strokeWidth={2.8} />
                    </View>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#faf9f8',
  },
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 8,
    position: 'relative',
    zIndex: 100,
  },
  backButtonTop: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressContainer: {
    flex: 1,
    paddingRight: 140,
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: getResponsiveValue(2, 4, 6, 8),
    paddingRight: 12,
  },
  titleFlow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#d6cbe8',
    zIndex: -1,
  },
  title: {
    fontSize: getResponsiveValue(19, 22, 25, 28),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#111111',
    textAlign: 'left',
    lineHeight: getResponsiveValue(26, 28, 33, 36),
  },
  dialContainer: {
    flex: 1,
    position: 'relative',
  },
  itemWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  numberPressable: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: 'Montserrat_800ExtraBold',
    letterSpacing: -2,
  },
  numberTextActive: {
    fontSize: getResponsiveValue(80, 86, 92, 98),
    color: '#2a2a2a',
    fontWeight: '900',
    lineHeight: getResponsiveValue(82, 88, 94, 100),
  },
  numberTextInactive: {
    fontSize: getResponsiveValue(40, 44, 48, 52),
    color: '#cfced4',
    fontWeight: '800',
  },
  infoCard: {
    position: 'absolute',
    paddingVertical: 4,
    paddingRight: 12,
    zIndex: 20,
    flexShrink: 1,
  },
  infoTitle: {
    fontSize: getResponsiveValue(17, 18, 19, 20),
    fontFamily: 'Montserrat_700Bold',
    fontWeight: '700',
    color: '#2b2b2b',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  infoSubtitle: {
    fontSize: getResponsiveValue(13, 13.5, 14, 14.5),
    fontFamily: 'Montserrat_500Medium',
    color: '#84838b',
    lineHeight: getResponsiveValue(17, 18, 19, 20),
    flexWrap: 'wrap',
  },
  controlDotWrapper: {
    position: 'absolute',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 60,
  },
  controlDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff1e1e',
    borderWidth: 3.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 14,
  },
  controlDotText: {
    fontSize: 19,
    fontFamily: 'Montserrat_800ExtraBold',
    fontWeight: '900',
    color: '#ffffff',
  },
  draggableIconWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 70,
  },
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#735b9c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },
  iconDragBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#27272a',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  iconDragBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#e4e4e7',
  },
  topRightHud: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.92)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 12,
    minWidth: 148,
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  hudHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hudTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#f87171',
    letterSpacing: 0.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resetButtonText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  collapseButton: {
    padding: 2,
  },
  hudBody: {
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 4,
  },
  hudPointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  hudPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  hudDotBadge: {
    backgroundColor: '#ff2222',
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
  },
  hudDotBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#ffffff',
  },
  hudCoordText: {
    fontSize: 9.5,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: '#ffffff',
  },
  hudControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#d4d4d8',
  },
  hudSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hudStepBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 3,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudSizeVal: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ffffff',
    minWidth: 26,
    textAlign: 'center',
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: getResponsiveValue(24, 28, 32, 36),
    paddingBottom: getResponsiveValue(20, 24, 28, 32),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bottomLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  refineButtonText: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    fontWeight: '800',
    color: '#ffffff',
  },
  toggleModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  toggleModeButtonActive: {
    backgroundColor: '#18181b',
  },
  toggleModeButtonPreview: {
    backgroundColor: '#e4e4e7',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  toggleModeText: {
    fontSize: 11,
    fontFamily: 'Montserrat_700Bold',
    fontWeight: '700',
  },
  toggleModeTextActive: {
    color: '#ffffff',
  },
  toggleModeTextPreview: {
    color: '#374151',
  },
  button3DContainer: {
    width: getResponsiveValue(54, 58, 62, 66),
    height: getResponsiveValue(54, 58, 62, 66),
    position: 'relative',
  },
  pressableArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  buttonShadow: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonMid: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    position: 'absolute',
  },
  nextButton: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});
