/**
 * BarChart — Vertical Pill Bars per Day with Left Y-Axis & Horizontal Scrolling
 *
 * Real-Life Skincare Example: Daily Hydration Intake (Glasses of Water)
 *  - X-Axis: Days of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
 *  - Y-Axis: Numeric scale (0, 3, 6, 9, 12) with unit badge "glasses"
 *  - Thick, juicy pill-shaped bars with full-height background track rails
 *  - No dashed gridlines (clean modern look)
 *  - Tooltip guaranteed fully inside viewport with zero text clipping
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
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export type BarChartDatum = { label: string; value: number };

const REAL_LIFE_DATA: BarChartDatum[] = [
  { label: 'Mon', value: 8 },
  { label: 'Tue', value: 11 },
  { label: 'Wed', value: 6 },
  { label: 'Thu', value: 9 },
  { label: 'Fri', value: 10 },
  { label: 'Sat', value: 7 },
  { label: 'Sun', value: 12 },
];

const PLOT_TOP = 18;
const BAR_MAX_HEIGHT = 180;
const Y_AXIS_WIDTH = 18;
const Y_AXIS_GAP = 4;
const TOOLTIP_WIDTH = 86;
const TOOLTIP_H = 32;
const TOOLTIP_GAP = 8;

export default function BarChart({
  title = 'Daily Hydration Intake',
  data = REAL_LIFE_DATA,
  maxValue = 12,
  unit = 'glasses',
}: {
  title?: string;
  data?: BarChartDatum[];
  maxValue?: number;
  unit?: string;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const axisStrokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const scrollRef = useRef<ScrollView>(null);

  // Card geometry: margin 20 on each side, padding 16 on each side
  const cardInnerWidth = SCREEN_WIDTH - 40 - 32;
  const visiblePlotWidth = cardInnerWidth - Y_AXIS_WIDTH - Y_AXIS_GAP - 2;

  // Generous column width matching paired bar chart: larger bar size and comfortable gap
  const columnWidth = Math.max(visiblePlotWidth / data.length, 64);
  const plotWidth = data.length * columnWidth;

  // Thick, increased bar size matching paired chart
  const barWidth = 36;
  const axisY = PLOT_TOP + BAR_MAX_HEIGHT;
  const svgHeight = axisY + 28;

  // Vertical label bounds: 12 sits inside below top line, 0 sits inside above baseline
  const labelTopMin = PLOT_TOP + 2;
  const labelTopMax = axisY - 14;
  const labelInterval = (labelTopMax - labelTopMin) / (data.length > 0 ? 4 : 1);

  // Default highlight = the peak day
  const [activeIndex, setActiveIndex] = useState(() => {
    const peak = Math.max(...data.map((d) => d.value));
    const idx = data.findIndex((d) => d.value === peak);
    return idx >= 0 ? idx : 0;
  });

  const barHeights = data.map((d) =>
    Math.max((d.value / maxValue) * BAR_MAX_HEIGHT, 8)
  );

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationX / columnWidth))
    );
    setActiveIndex(idx);
  };

  // Y-axis ticks calculation (0, 3, 6, 9, 12)
  const tickCount = 5;
  const yAxisTicks = Array.from({ length: tickCount }, (_, i) => {
    const ratio = (tickCount - 1 - i) / (tickCount - 1);
    return Math.round(ratio * maxValue);
  });

  // Clamp tooltip safely inside visible plot area so it NEVER clips or overflows
  const activeCenterX = activeIndex * columnWidth + columnWidth / 2;
  const activeTopY = axisY - barHeights[activeIndex];

  // Dynamically clamp: keep at least 4px clearance from left and right edges
  const rawLeft = activeCenterX - TOOLTIP_WIDTH / 2;
  const tooltipLeft = Math.min(
    Math.max(rawLeft, 4),
    plotWidth - TOOLTIP_WIDTH - 4
  );

  const tooltipAbove = activeTopY >= TOOLTIP_H + TOOLTIP_GAP;
  const tooltipTop = tooltipAbove
    ? activeTopY - TOOLTIP_H - TOOLTIP_GAP
    : activeTopY + TOOLTIP_GAP;

  // Tail follows the active bar's center, relative to tooltip box
  const tailLeft = Math.min(
    Math.max(activeCenterX - tooltipLeft - 5, 8),
    TOOLTIP_WIDTH - 18
  );

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
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        {unit ? (
          <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
            <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
          </View>
        ) : null}
      </View>

      {/* Chart Row: Left Y-Axis + Scrollable Bar Plot */}
      <View style={styles.chartRow}>
        {/* Y-Axis Column (Numeric Only, left-aligned, inside bounds with equal intervals) */}
        <View style={[styles.yAxisContainer, { height: BAR_MAX_HEIGHT + PLOT_TOP }]}>
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

        {/* Crisp, pinned vertical axis divider line alongside the numbers — seamlessly connects with baseline */}
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
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={{ flex: 1 }}
          contentContainerStyle={{ width: plotWidth }}
        >
          <Pressable
            onPress={handleTouch}
            style={{ width: plotWidth, height: svgHeight, position: 'relative' }}
          >
            <Svg width={plotWidth} height={svgHeight}>
              <Defs>
                <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                  <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
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

              {/* Full-height background rails behind each bar (opaque mask hides dashed lines behind bars) */}
              {data.map((_, i) => {
                const x = i * columnWidth + (columnWidth - barWidth) / 2;
                return (
                  <React.Fragment key={`rail-group-${i}`}>
                    <Rect
                      x={x}
                      y={PLOT_TOP}
                      width={barWidth}
                      height={BAR_MAX_HEIGHT}
                      rx={barWidth / 2}
                      ry={barWidth / 2}
                      fill={isDark ? '#18181b' : '#ffffff'}
                    />
                    <Rect
                      x={x}
                      y={PLOT_TOP}
                      width={barWidth}
                      height={BAR_MAX_HEIGHT}
                      rx={barWidth / 2}
                      ry={barWidth / 2}
                      fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'}
                    />
                  </React.Fragment>
                );
              })}

              {/* Rounded thick pill bars */}
              {data.map((_, i) => {
                const x = i * columnWidth + (columnWidth - barWidth) / 2;
                const h = barHeights[i];
                const isSelected = i === activeIndex;
                return (
                  <Rect
                    key={`bar-${i}`}
                    x={x}
                    y={axisY - h}
                    width={barWidth}
                    height={h}
                    rx={barWidth / 2}
                    ry={barWidth / 2}
                    fill="url(#barGrad)"
                    opacity={isSelected ? 1 : 0.4}
                  />
                );
              })}

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

            {/* Tap-to-reveal speech-bubble tooltip (Guaranteed inside viewport) */}
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
                {data[activeIndex]?.value} {unit}
              </Text>
              <View
                style={{
                  position: 'absolute',
                  [tooltipAbove ? 'bottom' : 'top']: -3,
                  left: tailLeft,
                  width: 8,
                  height: 8,
                  backgroundColor: isDark ? '#ffffff' : '#09090b',
                  borderRadius: 1.5,
                  transform: [{ rotate: '45deg' }],
                  zIndex: -1,
                }}
              />
            </View>

            {/* X-Axis day labels under each bar */}
            <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
              {data.map((d, i) => {
                const isSelected = i === activeIndex;
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
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
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
    fontSize: 12,
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
  xAxisLabel: {
    fontSize: 12,
  },
  tooltipContainer: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    paddingHorizontal: 4,
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
    fontSize: 11,
    fontWeight: '800',
  },
});
