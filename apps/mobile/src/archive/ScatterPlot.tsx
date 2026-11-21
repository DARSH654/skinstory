/**
 * ScatterPlot — Real Skincare Journal Stress Pattern Analysis
 *
 * Real-Life Journal Behavior:
 *  - Users log qualitative stress levels: High, Medium, Low (NO fake numeric scores)
 *  - X-Axis: 14 days of journal logs (scrollable horizontally matching BarChart)
 *  - Y-Axis: Categorical levels: High, Med, Low
 *  - Horizontal dashed grid lines at each severity level
 *  - Dashed connector line showing stress trajectory across logged days
 *  - Tap any day point to view day, severity, and journal note
 *  - Zero scores anywhere on the chart
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  GestureResponderEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export type StressSeverity = 'High' | 'Med' | 'Low';

export type StressLogEntry = {
  day: number;
  label: string;
  dateStr: string;
  level: StressSeverity;
  note: string;
};

// 14 real-life journal logs depicting the exact user pattern:
// High, Low, Medium, High, High ... across 14 days
const DEFAULT_STRESS_LOGS: StressLogEntry[] = [
  { day: 1, label: 'D1', dateStr: 'Nov 6', level: 'Low', note: 'Weekend rest & good sleep' },
  { day: 2, label: 'D2', dateStr: 'Nov 7', level: 'Med', note: 'Start of work week' },
  { day: 3, label: 'D3', dateStr: 'Nov 8', level: 'High', note: 'Heavy project deadline' },
  { day: 4, label: 'D4', dateStr: 'Nov 9', level: 'High', note: 'Late night overtime' },
  { day: 5, label: 'D5', dateStr: 'Nov 10', level: 'High', note: 'Continuous work pressure' },
  { day: 6, label: 'D6', dateStr: 'Nov 11', level: 'Med', note: 'Deadline passed, easing up' },
  { day: 7, label: 'D7', dateStr: 'Nov 12', level: 'Low', note: 'Relaxed evening & hydration' },
  { day: 8, label: 'D8', dateStr: 'Nov 13', level: 'Low', note: 'Full 8h sleep & skincare' },
  { day: 9, label: 'D9', dateStr: 'Nov 14', level: 'Med', note: 'Normal daily meetings' },
  { day: 10, label: 'D10', dateStr: 'Nov 15', level: 'High', note: 'Travel & interrupted routine' },
  { day: 11, label: 'D11', dateStr: 'Nov 16', level: 'High', note: 'Airport delays & fatigue' },
  { day: 12, label: 'D12', dateStr: 'Nov 17', level: 'Med', note: 'Returning home' },
  { day: 13, label: 'D13', dateStr: 'Nov 18', level: 'Low', note: 'Rest & recovery balm' },
  { day: 14, label: 'D14', dateStr: 'Nov 19', level: 'Low', note: 'Calm weekend self-care' },
];

const PLOT_TOP = 18;
const PLOT_HEIGHT = 150;
const Y_AXIS_WIDTH = 34;
const Y_AXIS_GAP = 6;
const DOT_R = 7;
const TOOLTIP_W = 124;
const TOOLTIP_H = 46;
const TOOLTIP_GAP = 10;
const COL_W = 54;

export default function ScatterPlot({
  title = 'Daily Stress Pattern',
  data = DEFAULT_STRESS_LOGS,
}: {
  title?: string;
  data?: StressLogEntry[];
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const axisStrokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

  // Card geometry: margin 20 each side, padding 16 each side
  const cardInnerWidth = SCREEN_WIDTH - 40 - 32;
  const visiblePlotWidth = cardInnerWidth - Y_AXIS_WIDTH - Y_AXIS_GAP - 2;

  // Scrollable plot width spanning all logged days
  const plotWidth = Math.max(visiblePlotWidth, data.length * COL_W);
  const axisBottomY = PLOT_TOP + PLOT_HEIGHT;
  const svgHeight = axisBottomY + 28;

  // Y-Axis Levels & Coordinates
  const yHigh = PLOT_TOP + 16;
  const yMed = PLOT_TOP + PLOT_HEIGHT / 2;
  const yLow = axisBottomY - 18;

  const getYForLevel = (lvl: StressSeverity) => {
    switch (lvl) {
      case 'High':
        return yHigh;
      case 'Med':
        return yMed;
      case 'Low':
      default:
        return yLow;
    }
  };

  const yLevels: { label: StressSeverity; y: number }[] = [
    { label: 'High', y: yHigh },
    { label: 'Med', y: yMed },
    { label: 'Low', y: yLow },
  ];

  // Default active day = Day 3 (High stress)
  const [activeIndex, setActiveIndex] = useState(2);

  const selectPoint = (idx: number) => {
    setActiveIndex(idx);
    const pointX = idx * COL_W + COL_W / 2;
    // Auto-scroll if selected point is near viewport edges
    if (pointX > scrollX + visiblePlotWidth - 30) {
      const targetX = Math.min(plotWidth - visiblePlotWidth, pointX - visiblePlotWidth + TOOLTIP_W);
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    } else if (pointX < scrollX + 30) {
      const targetX = Math.max(0, pointX - 30);
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    }
  };

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const idx = Math.min(data.length - 1, Math.max(0, Math.floor(locationX / COL_W)));
    selectPoint(idx);
  };

  const active = data[activeIndex] || data[0];
  const activeDotX = activeIndex * COL_W + COL_W / 2;
  const activeDotY = getYForLevel(active.level);

  // Clamped tooltip positioning within visible viewport
  const rawLeft = activeDotX - TOOLTIP_W / 2;
  const minLeft = scrollX + 4;
  const maxLeft = Math.min(plotWidth - TOOLTIP_W - 4, scrollX + visiblePlotWidth - TOOLTIP_W - 4);
  const tooltipLeft = Math.min(Math.max(rawLeft, minLeft), maxLeft);

  const tooltipAbove = activeDotY >= TOOLTIP_H + TOOLTIP_GAP;
  const tooltipTop = tooltipAbove
    ? activeDotY - TOOLTIP_H - TOOLTIP_GAP
    : activeDotY + TOOLTIP_GAP;

  const tailLeft = Math.min(Math.max(activeDotX - tooltipLeft - 5, 8), TOOLTIP_W - 18);

  // Count distribution
  const highCount = data.filter((d) => d.level === 'High').length;
  const medCount = data.filter((d) => d.level === 'Med').length;
  const lowCount = data.filter((d) => d.level === 'Low').length;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e5e7eb',
        },
      ]}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            High: {highCount}d • Med: {medCount}d • Low: {lowCount}d
          </Text>
        </View>
        <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>
            {data.length} Days Logged
          </Text>
        </View>
      </View>

      {/* Chart Row: Left Y-Axis Levels + Scrollable Plot Area */}
      <View style={styles.chartRow}>
        {/* Pinned Left Y-Axis (High, Med, Low labels) */}
        <View style={[styles.yAxisContainer, { height: PLOT_HEIGHT + PLOT_TOP }]}>
          {yLevels.map((item, i) => (
            <Text
              key={`ylevel-${i}`}
              style={[
                styles.yAxisLabel,
                {
                  color:
                    item.label === 'High'
                      ? '#ef4444'
                      : item.label === 'Med'
                      ? '#937abd'
                      : colors.textSecondary,
                  top: item.y - 7,
                },
              ]}
            >
              {item.label}
            </Text>
          ))}
        </View>

        {/* Crisp Pinned Vertical Axis Divider (terminates cleanly at baseline) */}
        <View
          style={{
            width: 1.5,
            height: PLOT_HEIGHT,
            backgroundColor: axisStrokeColor,
            marginTop: PLOT_TOP,
            marginRight: 0,
          }}
        />

        {/* Scrollable Timeline Area */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
            setScrollX(e.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ width: plotWidth }}
        >
          <Pressable onPress={handleTouch} style={{ width: plotWidth, height: svgHeight }}>
            <Svg width={plotWidth} height={svgHeight}>
              <Defs>
                <LinearGradient id="scatterDotGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                  <Stop offset="1" stopColor="#b9a6d6" stopOpacity="1" />
                </LinearGradient>
              </Defs>

              {/* Horizontal dashed grid lines for High, Med, Low */}
              {yLevels.map((item, idx) => (
                <Line
                  key={`dash-grid-${idx}`}
                  x1={0}
                  y1={item.y}
                  x2={plotWidth}
                  y2={item.y}
                  stroke={axisStrokeColor}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              ))}

              {/* Connecting Trajectory Dashed Line across all logged days */}
              {data.map((item, i) => {
                if (i === data.length - 1) return null;
                const nextItem = data[i + 1];
                const x1 = i * COL_W + COL_W / 2;
                const y1 = getYForLevel(item.level);
                const x2 = (i + 1) * COL_W + COL_W / 2;
                const y2 = getYForLevel(nextItem.level);

                return (
                  <Line
                    key={`conn-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isDark ? 'rgba(214,203,232,0.5)' : 'rgba(147,122,189,0.45)'}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Bottom Baseline Axis */}
              <Line
                x1={0}
                y1={axisBottomY}
                x2={plotWidth}
                y2={axisBottomY}
                stroke={axisStrokeColor}
                strokeWidth={1}
              />

              {/* Logged Day Dots */}
              {data.map((item, i) => {
                const cx = i * COL_W + COL_W / 2;
                const cy = getYForLevel(item.level);
                const isActive = i === activeIndex;

                const dotFill =
                  item.level === 'High'
                    ? '#937abd'
                    : item.level === 'Med'
                    ? '#b9a6d6'
                    : isDark
                    ? '#635b75'
                    : '#d6cbe8';

                return (
                  <React.Fragment key={`dot-${i}`}>
                    {/* Active Halo */}
                    {isActive && (
                      <Circle cx={cx} cy={cy} r={DOT_R + 7} fill="rgba(147,122,189,0.22)" />
                    )}
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? DOT_R + 1.5 : DOT_R}
                      fill={dotFill}
                      stroke={isActive ? (isDark ? '#ffffff' : '#09090b') : 'transparent'}
                      strokeWidth={isActive ? 2 : 0}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* Tap-to-reveal speech-bubble tooltip */}
            <View
              pointerEvents="none"
              style={[
                styles.tooltipContainer,
                {
                  left: tooltipLeft,
                  top: tooltipTop,
                  backgroundColor: isDark ? '#ffffff' : '#09090b',
                },
              ]}
            >
              <Text style={[styles.tooltipMain, { color: isDark ? '#09090b' : '#ffffff' }]}>
                {active.label} • {active.level} Stress
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.tooltipSub,
                  { color: isDark ? 'rgba(9,9,11,0.65)' : 'rgba(255,255,255,0.7)' },
                ]}
              >
                {active.note}
              </Text>
              <View
                style={[
                  styles.tooltipTail,
                  {
                    left: tailLeft,
                    backgroundColor: isDark ? '#ffffff' : '#09090b',
                    ...(tooltipAbove ? { bottom: -4 } : { top: -4 }),
                  },
                ]}
              />
            </View>

            {/* Bottom X-Axis Days Labels */}
            <View style={[styles.xAxisRow, { top: axisBottomY + 6 }]}>
              {data.map((d, i) => {
                const isSelected = i === activeIndex;
                return (
                  <View key={`day-label-${i}`} style={{ width: COL_W, alignItems: 'center' }}>
                    <Text
                      style={[
                        styles.xAxisDayLabel,
                        {
                          color: isSelected
                            ? isDark
                              ? '#ffffff'
                              : '#000000'
                            : colors.textSecondary,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {d.label}
                    </Text>
                    <Text
                      style={[
                        styles.xAxisDateLabel,
                        {
                          color: colors.textSecondary,
                        },
                      ]}
                    >
                      {d.dateStr}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  },
  yAxisContainer: {
    width: Y_AXIS_WIDTH,
    position: 'relative',
    marginRight: Y_AXIS_GAP,
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: 11,
    fontWeight: '700',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
  },
  xAxisRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  xAxisDayLabel: {
    fontSize: 12,
  },
  xAxisDateLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  tooltipContainer: {
    position: 'absolute',
    width: TOOLTIP_W,
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
  tooltipMain: {
    fontSize: 11,
    fontWeight: '800',
  },
  tooltipSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  tooltipTail: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
});
