/**
 * PairedBarChart — Side-by-Side Vertical Pill Bars (AM vs PM Routine)
 *
 * Real-Life Skincare Example: AM vs PM Routine Compliance
 *  - X-Axis: Days of the week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
 *  - Left Y-Axis: Numeric completion percentage (0, 25, 50, 75, 100)
 *  - Two side-by-side thick pill bars per day (AM Routine vs PM Routine)
 *  - Full-height background rails behind each bar (NO DASHED LINES)
 *  - Enclosed in an uplifted white card (dark mode: #18181b)
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
import Svg, { Rect, Line, Defs, LinearGradient, Stop, ClipPath, G } from 'react-native-svg';
import ChartCardHeader from './ChartCardHeader';

export type PairedBarDatum = {
  label: string;
  series1: number; // e.g. AM Routine
  series2: number; // e.g. PM Routine
};

const REAL_LIFE_PAIRED: PairedBarDatum[] = [
  { label: 'Mon', series1: 100, series2: 100 },
  { label: 'Tue', series1: 100, series2: 80 },
  { label: 'Wed', series1: 80, series2: 60 },
  { label: 'Thu', series1: 100, series2: 100 },
  { label: 'Fri', series1: 90, series2: 70 },
  { label: 'Sat', series1: 60, series2: 80 },
  { label: 'Sun', series1: 100, series2: 100 },
];

const PLOT_TOP = 18;
const BAR_MAX_HEIGHT = 180;
const Y_AXIS_WIDTH = 24;
const Y_AXIS_GAP = 4;
const TOOLTIP_WIDTH = 132;
const TOOLTIP_H = 32;
const TOOLTIP_GAP = 8;

export default function PairedBarChart({
  title = 'Routine Compliance: AM vs PM',
  series1Label = 'AM Routine',
  series2Label = 'PM Routine',
  data = REAL_LIFE_PAIRED,
  maxValue = 100,
  unit = '%',
}: {
  title?: string;
  series1Label?: string;
  series2Label?: string;
  data?: PairedBarDatum[];
  maxValue?: number;
  unit?: string;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const axisStrokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const scrollRef = useRef<ScrollView>(null);

  // Dynamic Y-axis width based on digit count of maxValue (no hardcoded clipping)
  const maxDigits = String(maxValue).length;
  const yAxisWidth = Math.max(Math.round(maxDigits * 7.5), 18);

  // Card geometry: margin 20 each side, padding 16 each side
  const cardInnerWidth = SCREEN_WIDTH - 40 - 32;
  const visiblePlotWidth = cardInnerWidth - yAxisWidth - Y_AXIS_GAP - 2;

  // Dynamic column width: generous breathing room, ~5 days visible on screen, Sat/Sun scroll naturally
  const maxLabelLen = Math.max(...data.map((d) => (d.label || '').length), 3);
  const minColForContent = Math.max(maxLabelLen * 8 + 12, 56);
  const columnWidth = data.length > 0
    ? Math.max(visiblePlotWidth / 5.2, minColForContent)
    : 64;
  const plotWidth = data.length * columnWidth;

  // Dynamically sized bar pairs proportional to column width
  const singleBarWidth = Math.min(Math.max((columnWidth - 14) / 2.4, 15), 24);
  const barGap = Math.max(singleBarWidth * 0.22, 3);
  const pairWidth = singleBarWidth * 2 + barGap;
  const axisY = PLOT_TOP + BAR_MAX_HEIGHT;
  const svgHeight = axisY + 28;

  // Vertical label bounds: 100 sits inside below top line, 0 sits inside above baseline
  const labelTopMin = PLOT_TOP + 2;
  const labelTopMax = axisY - 14;
  const labelInterval = (labelTopMax - labelTopMin) / (data.length > 0 ? 4 : 1);

  const [activeIndex, setActiveIndex] = useState(0);

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationX / columnWidth))
    );
    setActiveIndex(idx);
  };

  // Y-axis ticks calculation (0, 25, 50, 75, 100)
  const tickCount = 5;
  const yAxisTicks = Array.from({ length: tickCount }, (_, i) => {
    const ratio = (tickCount - 1 - i) / (tickCount - 1);
    return Math.round(ratio * maxValue);
  });

  // Tooltip position (clamped safely inside plot bounds)
  const activeCenterX = activeIndex * columnWidth + columnWidth / 2;
  const s1Height = Math.max((data[activeIndex].series1 / maxValue) * BAR_MAX_HEIGHT, 6);
  const s2Height = Math.max((data[activeIndex].series2 / maxValue) * BAR_MAX_HEIGHT, 6);
  const peakHeight = Math.max(s1Height, s2Height);
  const activeTopY = axisY - peakHeight;

  const rawLeft = activeCenterX - TOOLTIP_WIDTH / 2;
  const tooltipLeft = Math.min(
    Math.max(rawLeft, 4),
    plotWidth - TOOLTIP_WIDTH - 4
  );

  const tooltipAbove = activeTopY >= TOOLTIP_H + TOOLTIP_GAP;
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
        styles.card,
        {
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e5e7eb',
        },
      ]}
    >
      {/* Card Header & Legend (Dynamic single-line / multi-line with legend below) */}
      <ChartCardHeader
        title={title}
        isDark={isDark}
        colors={colors}
        rightElement={
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#937abd' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>AM</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#d6cbe8' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>PM</Text>
            </View>
            {unit ? (
              <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
                <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
              </View>
            ) : null}
          </View>
        }
      />

      {/* Chart Row: Left Y-Axis + Scrollable Paired Plot */}
      <View style={styles.chartRow}>
        {/* Y-Axis Column (Numeric Only, left-aligned, inside bounds with equal intervals) */}
        <View style={[styles.yAxisContainer, { width: yAxisWidth, height: BAR_MAX_HEIGHT + PLOT_TOP }]}>
          {yAxisTicks.map((tick, i) => {
            const labelTop = labelTopMin + i * labelInterval;
            return (
              <Text
                key={`ytick-p-${i}`}
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
                <LinearGradient id="pairedGrad1" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                  <Stop offset="1" stopColor="#7a62a3" stopOpacity="1" />
                </LinearGradient>
                <LinearGradient id="pairedGrad2" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#d6cbe8" stopOpacity="1" />
                  <Stop offset="1" stopColor="#b9a6d6" stopOpacity="1" />
                </LinearGradient>
                {/* Mathematical clipping paths matching exact capsule rails for Series 1 & 2 */}
                {data.map((_, i) => {
                  const startX = i * columnWidth + (columnWidth - pairWidth) / 2;
                  return (
                    <React.Fragment key={`p-clips-${i}`}>
                      <ClipPath id={`pClip1-${i}`}>
                        <Rect
                          x={startX}
                          y={PLOT_TOP}
                          width={singleBarWidth}
                          height={BAR_MAX_HEIGHT}
                          rx={singleBarWidth / 2}
                          ry={singleBarWidth / 2}
                        />
                      </ClipPath>
                      <ClipPath id={`pClip2-${i}`}>
                        <Rect
                          x={startX + singleBarWidth + barGap}
                          y={PLOT_TOP}
                          width={singleBarWidth}
                          height={BAR_MAX_HEIGHT}
                          rx={singleBarWidth / 2}
                          ry={singleBarWidth / 2}
                        />
                      </ClipPath>
                    </React.Fragment>
                  );
                })}
              </Defs>

              {/* Horizontal dashed grid lines (hidden on bottom baseline to prevent overlap) */}
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

              {/* Full-height background track rails (opaque mask hides dashed lines behind bars) */}
              {data.map((_, i) => {
                const startX = i * columnWidth + (columnWidth - pairWidth) / 2;
                return (
                  <React.Fragment key={`p-track-${i}`}>
                    {/* Opaque masks */}
                    <Rect
                      x={startX}
                      y={PLOT_TOP}
                      width={singleBarWidth}
                      height={BAR_MAX_HEIGHT}
                      rx={singleBarWidth / 2}
                      ry={singleBarWidth / 2}
                      fill={isDark ? '#18181b' : '#ffffff'}
                    />
                    <Rect
                      x={startX + singleBarWidth + barGap}
                      y={PLOT_TOP}
                      width={singleBarWidth}
                      height={BAR_MAX_HEIGHT}
                      rx={singleBarWidth / 2}
                      ry={singleBarWidth / 2}
                      fill={isDark ? '#18181b' : '#ffffff'}
                    />
                    {/* Grey rails */}
                    <Rect
                      x={startX}
                      y={PLOT_TOP}
                      width={singleBarWidth}
                      height={BAR_MAX_HEIGHT}
                      rx={singleBarWidth / 2}
                      ry={singleBarWidth / 2}
                      fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'}
                    />
                    <Rect
                      x={startX + singleBarWidth + barGap}
                      y={PLOT_TOP}
                      width={singleBarWidth}
                      height={BAR_MAX_HEIGHT}
                      rx={singleBarWidth / 2}
                      ry={singleBarWidth / 2}
                      fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'}
                    />
                  </React.Fragment>
                );
              })}

              {/* Paired thick pill bars — strictly constrained inside rail capsule clip paths */}
              {data.map((d, i) => {
                const startX = i * columnWidth + (columnWidth - pairWidth) / 2;
                const h1 = Math.max((d.series1 / maxValue) * BAR_MAX_HEIGHT, 6);
                const h2 = Math.max((d.series2 / maxValue) * BAR_MAX_HEIGHT, 6);
                const isSelected = i === activeIndex;

                return (
                  <React.Fragment key={`p-bars-${i}`}>
                    {/* Series 1: AM Bar */}
                    <G clipPath={`url(#pClip1-${i})`}>
                      <Rect
                        x={startX}
                        y={axisY - h1}
                        width={singleBarWidth}
                        height={h1}
                        rx={singleBarWidth / 2}
                        ry={singleBarWidth / 2}
                        fill="url(#pairedGrad1)"
                        opacity={isSelected ? 1 : 0.45}
                      />
                    </G>
                    {/* Series 2: PM Bar */}
                    <G clipPath={`url(#pClip2-${i})`}>
                      <Rect
                        x={startX + singleBarWidth + barGap}
                        y={axisY - h2}
                        width={singleBarWidth}
                        height={h2}
                        rx={singleBarWidth / 2}
                        ry={singleBarWidth / 2}
                        fill="url(#pairedGrad2)"
                        opacity={isSelected ? 1 : 0.45}
                      />
                    </G>
                  </React.Fragment>
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

            {/* Tap-to-reveal tooltip showing both values (Guaranteed inside bounds) */}
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
                {`AM: ${data[activeIndex]?.series1}% | PM: ${data[activeIndex]?.series2}%`}
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

            {/* X-Axis day labels */}
            <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
              {data.map((d, i) => {
                const isSelected = i === activeIndex;
                return (
                  <View key={`xlabel-p-${i}`} style={{ width: columnWidth, alignItems: 'center' }}>
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    marginRight: 10,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  legendRow: {
    flexShrink: 0,
    marginTop: 2,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
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
    paddingHorizontal: 6,
    paddingVertical: 5,
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
    textAlign: 'center',
  },
});
