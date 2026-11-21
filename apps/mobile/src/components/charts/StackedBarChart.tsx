/**
 * StackedBarChart — Vertically Stacked Pill Capsules per Day
 *
 * Real-Life Skincare Example: Daily Skincare Routine Layers (Base, Treatment, Protection)
 *  - Each segment is its OWN standalone rounded pill capsule (rx={barWidth / 2})
 *  - Stacked vertically with clean gaps between capsules
 *  - Bar width and sizing EXACTLY matches BarChart
 *  - Left Y-Axis: Left-aligned numeric scale (0, 1, 2, 3, 4 layers) matching SkinScoreChart
 *  - Horizontal dashed gridlines at each Y-axis tick mark
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
import Svg, { Rect, Line, ClipPath, G, Defs } from 'react-native-svg';
import ChartCardHeader from './ChartCardHeader';

export type StackedBarDatum = {
  label: string;
  layer1: number; // Base Care
  layer2: number; // Active Treatment
  layer3: number; // Barrier Seal
};

const REAL_LIFE_STACKED: StackedBarDatum[] = [
  { label: 'Mon', layer1: 1, layer2: 1, layer3: 1 },
  { label: 'Tue', layer1: 1, layer2: 2, layer3: 1 },
  { label: 'Wed', layer1: 1, layer2: 1, layer3: 0 },
  { label: 'Thu', layer1: 1, layer2: 1, layer3: 1 },
  { label: 'Fri', layer1: 1, layer2: 2, layer3: 1 },
  { label: 'Sat', layer1: 1, layer2: 1, layer3: 0 },
  { label: 'Sun', layer1: 1, layer2: 2, layer3: 1 },
];

const LAYER_COLORS = ['#937abd', '#b9a6d6', '#d6cbe8'];

const PLOT_TOP = 18;
const BAR_MAX_HEIGHT = 180;
const Y_AXIS_WIDTH = 16;
const Y_AXIS_GAP = 4;
const SEG_GAP = 0; // ZERO gap between stacked pills
const TOOLTIP_WIDTH = 86;
const TOOLTIP_H = 32;
const TOOLTIP_GAP = 8;

export default function StackedBarChart({
  title = 'Daily Skincare Layers',
  data = REAL_LIFE_STACKED,
  maxSteps = 4,
  unit = 'layers',
}: {
  title?: string;
  data?: StackedBarDatum[];
  maxSteps?: number;
  unit?: string;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const axisStrokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const scrollRef = useRef<ScrollView>(null);

  // Dynamic Y-axis width based on maxSteps digits (no hardcoded clipping)
  const maxDigits = String(maxSteps).length;
  const yAxisWidth = Math.max(Math.round(maxDigits * 7.5), 18);

  const cardInnerWidth = SCREEN_WIDTH - 40 - 32;
  const visiblePlotWidth = cardInnerWidth - yAxisWidth - Y_AXIS_GAP - 2;

  // Dynamic column width: generous breathing room, ~5 days visible on screen, Sat/Sun scroll naturally
  const maxLabelLen = Math.max(...data.map((d) => (d.label || '').length), 3);
  const minColForContent = Math.max(maxLabelLen * 8 + 12, 56);
  const columnWidth = data.length > 0
    ? Math.max(visiblePlotWidth / 5.2, minColForContent)
    : 64;
  const plotWidth = data.length * columnWidth;

  // Proportional bar width: scales with column width for consistent visual rhythm
  const barWidth = Math.min(Math.max(columnWidth * 0.44, 20), 32);
  const axisY = PLOT_TOP + BAR_MAX_HEIGHT;
  const svgHeight = axisY + 28;

  // Vertical label bounds: max steps sits inside below top line, 0 sits inside above baseline
  const labelTopMin = PLOT_TOP + 2;
  const labelTopMax = axisY - 14;
  const labelInterval = (labelTopMax - labelTopMin) / (maxSteps > 0 ? maxSteps : 1);

  const [activeIndex, setActiveIndex] = useState(1);

  // Compute total layers per day
  const dailyTotals = data.map(
    (d) => d.layer1 + d.layer2 + d.layer3
  );

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationX / columnWidth))
    );
    setActiveIndex(idx);
  };

  // Y-axis ticks (0, 1, 2, 3, 4)
  const yAxisTicks = Array.from({ length: maxSteps + 1 }, (_, i) => maxSteps - i);

  // Tooltip position (clamped inside bounds)
  const activeCenterX = activeIndex * columnWidth + columnWidth / 2;
  const activeTotal = dailyTotals[activeIndex];
  const activeHeight = Math.max((activeTotal / maxSteps) * BAR_MAX_HEIGHT, 10);
  const activeTopY = axisY - activeHeight;

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
      {/* Card Header (Dynamic single-line / multi-line with unit pill below) */}
      <ChartCardHeader title={title} unit={unit} isDark={isDark} colors={colors} />

      {/* Chart Row: Left Y-Axis + Scrollable Bar Plot */}
      <View style={styles.chartRow}>
        {/* Y-Axis Column (Numeric Only, left-aligned, inside bounds with equal intervals) */}
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
                {/* Mathematical ClipPath for each column matching the exact capsule rail boundary */}
                {data.map((_, col) => {
                  const x = col * columnWidth + (columnWidth - barWidth) / 2;
                  return (
                    <ClipPath key={`clip-${col}`} id={`stackClip-${col}`}>
                      <Rect
                        x={x}
                        y={PLOT_TOP}
                        width={barWidth}
                        height={BAR_MAX_HEIGHT}
                        rx={barWidth / 2}
                        ry={barWidth / 2}
                      />
                    </ClipPath>
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
                const x = i * columnWidth + (columnWidth - barWidth) / 2;
                return (
                  <React.Fragment key={`s-rail-group-${i}`}>
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

              {/* Stacked capsules: Touching seamlessly with ZERO gap inside pill clip */}
              {data.map((d, col) => {
                const total = dailyTotals[col];
                if (total <= 0) return null;
                const x = col * columnWidth + (columnWidth - barWidth) / 2;
                const isSelected = col === activeIndex;
                const layers = [d.layer1, d.layer2, d.layer3];

                let cumulativeSteps = 0;
                return (
                  <G key={`stacked-col-${col}`} clipPath={`url(#stackClip-${col})`}>
                    {layers.map((val, sIdx) => {
                      if (val <= 0) return null;
                      const segH = (val / maxSteps) * BAR_MAX_HEIGHT;
                      const bottomY = axisY - (cumulativeSteps / maxSteps) * BAR_MAX_HEIGHT;
                      const topY = bottomY - segH;
                      cumulativeSteps += val;

                      return (
                        <Rect
                          key={`seg-${col}-${sIdx}`}
                          x={x}
                          y={topY}
                          width={barWidth}
                          height={segH + 0.5}
                          fill={LAYER_COLORS[sIdx]}
                          opacity={isSelected ? 1 : 0.4}
                        />
                      );
                    })}
                  </G>
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

            {/* Tap-to-reveal tooltip (Guaranteed inside bounds) */}
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
                {activeTotal} / {maxSteps} {unit}
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
            <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
              {data.map((d, i) => {
                const isSelected = i === activeIndex;
                return (
                  <View key={`day-${i}`} style={{ width: columnWidth, alignItems: 'center' }}>
                    <Text
                      style={[
                        styles.xAxisLabel,
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
  tooltipTail: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
});
