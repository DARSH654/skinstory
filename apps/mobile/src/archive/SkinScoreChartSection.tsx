/**
 * SkinScoreChartSection — Archived Component
 *
 * Extracted from apps/mobile/src/app/(tabs)/progress.tsx.
 * This is a fully self-contained, standalone component.
 * Drop it back anywhere by importing and rendering <SkinScoreChartSection />.
 *
 * Displays:
 *  - "Skin Score" title + unit badge
 *  - Scrollable SVG line chart with gradient area fill, Y-axis, X-axis labels, tooltip
 *  - Pinned vertical and horizontal baseline lines matching BarChart
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
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import ChartCardHeader from '@/components/charts/ChartCardHeader';

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

// ─── Dimensions (Matching BarChart, PairedBarChart & StackedBarChart) ──────────
const PLOT_TOP = 18;
const BAR_MAX_HEIGHT = 180;
const Y_AXIS_GAP = 4;
const TOOLTIP_WIDTH = 56;
const TOOLTIP_H = 32;
const TOOLTIP_GAP = 8;

export default function SkinScoreChartSection() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const axisStrokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  // Selected Period Tab state: week, month, or year
  const [selectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Active chart data
  const currentChartData =
    selectedPeriod === 'week'
      ? WEEK_DATA
      : selectedPeriod === 'month'
      ? MONTH_DATA
      : YEAR_DATA;

  // Selected chart point index
  const [activePointIndex, setActivePointIndex] = useState<number>(1);

  // Ref for chart horizontal scroll
  const chartScrollRef = useRef<ScrollView>(null);

  // ── Chart geometry ──────────────────────────────────────────────────────────
  const minVal = 0;
  const maxVal = 100;
  const valRange = maxVal - minVal;

  const maxValDigits = String(maxVal).length;
  const yAxisWidth = Math.max(Math.round(maxValDigits * 7.5), 18);

  const cardInnerWidth = SCREEN_WIDTH - 40 - 32; // 20 margin each side, 16 padding each side
  const visiblePlotWidth = cardInnerWidth - yAxisWidth - Y_AXIS_GAP - 2;

  // Dynamic column width matching BarChart: generous breathing room, ~5 days visible on screen, Sat/Sun scroll naturally
  const maxLabelLen = Math.max(...currentChartData.map((d) => (d.label || '').length), 3);
  const minColForContent = Math.max(maxLabelLen * 8 + 12, 56);
  const columnWidth = currentChartData.length > 0
    ? Math.max(visiblePlotWidth / 5.2, minColForContent)
    : 64;
  const plotWidth = currentChartData.length * columnWidth;

  const axisY = PLOT_TOP + BAR_MAX_HEIGHT;
  const svgHeight = axisY + 28;

  // Vertical label bounds: 100 sits inside below top line, 0 sits inside above baseline
  const labelTopMin = PLOT_TOP + 2;
  const labelTopMax = axisY - 14;
  const labelInterval = (labelTopMax - labelTopMin) / 4;

  // 5 clean ticks matching BarChart & PairedBarChart (100, 75, 50, 25, 0)
  const yAxisTicks = [100, 75, 50, 25, 0];

  // Point placement: exactly centered in each column slice (matching the bars in BarChart)
  const points = currentChartData.map((d, index) => {
    const x = index * columnWidth + columnWidth / 2;
    const y = axisY - ((d.value - minVal) / valRange) * BAR_MAX_HEIGHT;
    return { x, y };
  });

  // Touch handler — selects closest data point
  const handleChartTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const idx = Math.min(
      currentChartData.length - 1,
      Math.max(0, Math.floor(locationX / columnWidth))
    );
    setActivePointIndex(idx);
  };

  // Generate smooth line & shadow area paths extending 100% edge-to-edge (0 to plotWidth)
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    const lastPoint = points[points.length - 1];

    // 1. Seamless lead-in from left border (x = 0) to points[0]
    linePath = `M 0 ${points[0].y} L ${points[0].x} ${points[0].y}`;

    // 2. Smooth bezier curves connecting all internal data points
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }

    // 3. Seamless lead-out from points[last] to right border (x = plotWidth)
    linePath += ` L ${plotWidth} ${lastPoint.y}`;

    // 4. Area path closes down to baseline across entire width with ZERO gaps on either side
    areaPath = `${linePath} L ${plotWidth} ${axisY} L 0 ${axisY} Z`;
  }

  // Tooltip position (clamped safely inside plot bounds)
  const activePoint = points[activePointIndex] || points[0];
  const activeCenterX = activePoint?.x ?? columnWidth / 2;
  const activeTopY = activePoint?.y ?? axisY;

  const rawLeft = activeCenterX - TOOLTIP_WIDTH / 2;
  const tooltipLeft = Math.min(
    Math.max(rawLeft, 4),
    plotWidth - TOOLTIP_WIDTH - 4
  );

  const tooltipAbove = activeTopY >= TOOLTIP_H + TOOLTIP_GAP + PLOT_TOP;
  const tooltipTop = tooltipAbove
    ? activeTopY - TOOLTIP_H - TOOLTIP_GAP
    : activeTopY + TOOLTIP_GAP;

  const tailLeft = Math.min(
    Math.max(activeCenterX - tooltipLeft - 5, 8),
    TOOLTIP_WIDTH - 18
  );

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
      {/* Title & Badge Header (Dynamic single-line / multi-line with unit pill below) */}
      <ChartCardHeader title="Skin Score" unit="pts" isDark={isDark} colors={colors} />

      {/* SVG Line Chart with Left Y-Axis */}
      <View style={styles.chartRow}>
        {/* Y-Axis Column (Numeric Only, 5 ticks, equal intervals) */}
        <View style={[styles.yAxisContainer, { width: yAxisWidth, height: BAR_MAX_HEIGHT + PLOT_TOP }]}>
          {yAxisTicks.map((tick, i) => {
            const labelTop = labelTopMin + i * labelInterval;
            return (
              <Text
                key={`ytick-${i}`}
                style={[
                  styles.yAxisLabel,
                  {
                    color: colors.textSecondary,
                    top: labelTop,
                  },
                ]}
              >
                {tick}
              </Text>
            );
          })}
        </View>

        {/* Crisp, pinned vertical axis divider line alongside the numbers — matching BarChart */}
        <View
          style={{
            width: 1.5,
            height: BAR_MAX_HEIGHT + 1,
            backgroundColor: axisStrokeColor,
            marginTop: PLOT_TOP,
            marginRight: 0,
          }}
        />

        {/* Scrollable SVG Area */}
        <ScrollView
          ref={chartScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={{ flex: 1 }}
          contentContainerStyle={{ width: plotWidth }}
        >
          <Pressable
            onPress={handleChartTouch}
            style={{ width: plotWidth, height: svgHeight, position: 'relative' }}
          >
            <Svg width={plotWidth} height={svgHeight}>
              <Defs>
                <LinearGradient id="skinScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="0.25" />
                  <Stop offset="1" stopColor="#937abd" stopOpacity="0.00" />
                </LinearGradient>
              </Defs>

              {/* Horizontal dashed grid lines across the entire plot */}
              {yAxisTicks.map((_, index) => {
                if (index === yAxisTicks.length - 1) return null;
                const yVal = PLOT_TOP + (index / (yAxisTicks.length - 1)) * BAR_MAX_HEIGHT;
                return (
                  <Line
                    key={`dash-${index}`}
                    x1={0}
                    y1={yVal}
                    x2={plotWidth}
                    y2={yVal}
                    stroke={axisStrokeColor}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Gradient Area Fill */}
              {areaPath ? <Path d={areaPath} fill="url(#skinScoreGrad)" /> : null}

              {/* Line */}
              {linePath ? (
                <Path
                  d={linePath}
                  fill="none"
                  stroke="#937abd"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              ) : null}

              {/* Data point circles */}
              {points.map((p, index) => (
                <Circle
                  key={index}
                  cx={p.x}
                  cy={p.y}
                  r={index === activePointIndex ? 6 : 4}
                  fill={isDark ? '#18181b' : '#ffffff'}
                  stroke="#937abd"
                  strokeWidth={index === activePointIndex ? 3 : 2}
                />
              ))}

              {/* Bottom baseline axis */}
              <Line
                x1={0}
                y1={axisY + 0.5}
                x2={plotWidth}
                y2={axisY + 0.5}
                stroke={axisStrokeColor}
                strokeWidth={1}
              />
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
              <Text
                numberOfLines={1}
                style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}
              >
                {currentChartData[activePointIndex]?.value} pts
              </Text>
              <View
                style={{
                  position: 'absolute',
                  [tooltipAbove ? 'bottom' : 'top']: -3,
                  left: tailLeft,
                  width: 10,
                  height: 10,
                  backgroundColor: isDark ? '#ffffff' : '#09090b',
                  borderRadius: 2,
                  transform: [{ rotate: '45deg' }],
                  zIndex: -1,
                }}
              />
            </View>

            {/* X-Axis day labels under each point */}
            <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
              {currentChartData.map((d, i) => {
                const isSelected = i === activePointIndex;
                return (
                  <View key={`xlabel-${i}`} style={{ width: columnWidth, alignItems: 'center' }}>
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
                          fontWeight: isSelected ? '800' : '600',
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
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleWithIcon: {
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  unitPill: {
    flexShrink: 0,
    marginTop: 2,
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
    alignItems: 'flex-start',
  },
  yAxisContainer: {
    position: 'relative',
    marginRight: Y_AXIS_GAP,
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
  },
  xAxisRow: {
    position: 'absolute',
    left: 0,
    flexDirection: 'row',
  },
  xAxisLabel: {
    fontSize: 12,
  },
  tooltipContainer: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 99,
  },
  tooltipText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
