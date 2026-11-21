/**
 * SkinScoreChartSection — Archived Component
 *
 * Extracted from apps/mobile/src/app/(tabs)/progress.tsx.
 * This is a fully self-contained, standalone component.
 * Drop it back anywhere by importing and rendering <SkinScoreChartSection />.
 *
 * Displays:
 *  - "Skin Score" title + Week / Month / Year period selector tabs
 *  - Scrollable SVG line chart with gradient area fill, Y-axis, X-axis labels, tooltip
 *  - Stats row: Avg Score, Max Score, Total Scans
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  GestureResponderEvent,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── Data Sets ────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function SkinScoreChartSection() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Selected Period Tab state: week, month, or year
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Active chart data
  const currentChartData =
    selectedPeriod === 'week'
      ? WEEK_DATA
      : selectedPeriod === 'month'
      ? MONTH_DATA
      : YEAR_DATA;

  // Selected chart point index
  const [activePointIndex, setActivePointIndex] = useState<number>(1);

  // Ref for chart horizontal scroll — resets to left on period change
  const chartScrollRef = useRef<ScrollView>(null);

  // ── Chart geometry ──────────────────────────────────────────────────────────
  const cardInnerWidth = SCREEN_WIDTH - 40 - 32; // 20 margin each side, 16 padding each side
  const visiblePlotWidth = cardInnerWidth - 21 - 10; // minus yAxisContainer (21) minus marginRight (10)
  const chartWidth =
    currentChartData.length <= 5
      ? visiblePlotWidth // Few points (e.g. Month: 4 weeks) — fill the screen, no wide gaps
      : Math.max(visiblePlotWidth * 1.3, currentChartData.length * 60); // Many points — scrollable wide chart
  const chartHeight = 310;
  const paddingX = 40; // Starts 40px from the left edge to make the starting line segment longer
  const paddingTop = 18; // Reduced to 18px matching BarChart, PairedBarChart & StackedBarChart
  const paddingBottom = 16;
  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight; // tick 0 baseline
  const totalChartHeight = baselineY + 24; // compact height containing labels without extra bottom gap
  const minVal = 0;
  const maxVal = 100;
  const valRange = maxVal - minVal;

  const points = currentChartData.map((d, index) => {
    const x = paddingX + (index / (currentChartData.length - 1)) * plotWidth;
    const y = baselineY - ((d.value - minVal) / valRange) * plotHeight;
    return { x, y };
  });

  // Touch handler — selects closest data point
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

  // Generate smooth line path using cubic bezier curves
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
    areaPath = `${linePath} L ${chartWidth} ${baselineY} L 0 ${baselineY} Z`;
  }

  // Y-axis labels from 100 down to 0
  const yAxisTicks = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

  // Smart tooltip positioning — flip below dot if near top of chart
  const TOOLTIP_H = 38;
  const TOOLTIP_GAP = 14;
  const activePoint = points[activePointIndex] || points[0];
  const tooltipAbove = !activePoint || activePoint.y >= TOOLTIP_H + TOOLTIP_GAP;
  const tooltipTop = activePoint
    ? tooltipAbove
      ? activePoint.y - TOOLTIP_H - TOOLTIP_GAP
      : activePoint.y + TOOLTIP_GAP
    : 0;

  return (
    <View
      style={[
        styles.chartSection,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e5e7eb',
        },
      ]}
    >
      {/* Title & Tabs Row */}
      <View style={styles.chartHeader}>
        <View style={styles.titleWithIcon}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Skin Score</Text>
        </View>

        {/* Period selector tabs (commented out per user request) */}
        {/*
        <View style={[styles.tabsContainer, { backgroundColor: isDark ? '#18181b' : '#e4e4e7' }]}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <Pressable
              key={period}
              onPress={() => {
                setSelectedPeriod(period);
                setActivePointIndex(0);
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
                },
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: selectedPeriod === period ? colors.text : colors.textSecondary },
                ]}
              >
                {period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Year'}
              </Text>
            </Pressable>
          ))}
        </View>
        */}
      </View>

      {/* SVG Line Chart with Left Y-Axis */}
      <View style={[styles.chartWrapperRow, { height: totalChartHeight }]}>
        {/* Y-Axis Column */}
        <View style={[styles.yAxisContainer, { height: chartHeight }]}>
          {yAxisTicks.map((tick, index) => {
            const topPosition = paddingTop + (index / (yAxisTicks.length - 1)) * plotHeight;
            return (
              <Text
                key={tick}
                style={[
                  styles.yAxisLabel,
                  {
                    color: colors.textSecondary,
                    position: 'absolute',
                    top: topPosition - 8,
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: '700',
                  },
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
          style={{ flex: 1, height: totalChartHeight }}
          contentContainerStyle={{ width: chartWidth, height: totalChartHeight }}
        >
          <Pressable
            onPress={handleChartTouch}
            style={[styles.chartContainer, { height: totalChartHeight, width: chartWidth }]}
          >
            <Svg width={chartWidth} height={totalChartHeight}>
              <Defs>
                <LinearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="0.25" />
                  <Stop offset="1" stopColor="#937abd" stopOpacity="0.00" />
                </LinearGradient>
              </Defs>

              {/* Horizontal grid lines at each Y-axis tick */}
              {yAxisTicks.map((tick, index) => {
                const yVal = paddingTop + (index / (yAxisTicks.length - 1)) * plotHeight;
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
                    left: activePoint.x - 24,
                    top: tooltipTop,
                    backgroundColor: isDark ? '#ffffff' : '#09090b',
                    zIndex: 999,
                  },
                ]}
              >
                <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
                  {currentChartData[activePointIndex]?.value}
                </Text>
                {/* Rounded speech-bubble tail */}
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

            {/* X Axis labels — placed cleanly below baseline without expanding bottom card gap */}
            <View style={[styles.xAxisContainerInner, { top: baselineY + 5 }]}>
              {currentChartData.map((d, i) => {
                const p = points[i] || { x: 0 };
                const isSelected = i === activePointIndex;
                return (
                  <View key={i} style={[styles.xAxisLabelWrapper, { left: p.x - 40 }]}>
                    <Text
                      style={[
                        styles.xAxisLabel,
                        {
                          color: isSelected
                            ? isDark
                              ? '#ffffff'
                              : '#000000'
                            : isDark
                            ? '#71717a'
                            : '#9ca3af',
                          fontSize: 12,
                        },
                      ]}
                    >
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
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chartSection: {
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginTop: 0,
    position: 'relative',
  },
  yAxisContainer: {
    width: 21,
    position: 'relative',
    marginRight: 10,
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  chartContainer: {
    position: 'relative',
  },
  xAxisContainerInner: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 18,
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
});
