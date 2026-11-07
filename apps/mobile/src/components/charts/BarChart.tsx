/**
 * BarChart — vertical bars per day
 *
 * Visual language matches the archived line graph (SkinScoreChartSection):
 *  - Same primary → secondary gradient (#937abd → #d6cbe8)
 *  - Same light/dark surfaces (white card text, dark canvas)
 *  - Same tap-to-reveal value bubble (dark bubble in light mode, white in dark)
 *
 * Differences (per spec):
 *  - Bottom (horizontal) axis ONLY — no vertical / y-axis scale
 *  - Fully rounded (pill) bars instead of a line
 *  - Tapping a bar highlights it and pops the value bubble above it
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  GestureResponderEvent,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export type BarChartDatum = { label: string; value: number };

// ─── Default data: skin score per day ─────────────────────────────────────────
const DAY_DATA: BarChartDatum[] = [
  { label: 'Mon', value: 78 },
  { label: 'Tue', value: 100 },
  { label: 'Wed', value: 78 },
  { label: 'Thu', value: 83 },
  { label: 'Fri', value: 86 },
  { label: 'Sat', value: 89 },
  { label: 'Sun', value: 87 },
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14; // aligns with the line graph's left gutter
const H_PADDING_RIGHT = 20; // aligns with the line graph's right gutter
const PLOT_TOP = 56; // head-room so the bubble fits above the tallest bar
const BAR_MAX_HEIGHT = 200;
const AXIS_STROKE = 1;
const TOOLTIP_W = 48;
const TOOLTIP_H = 38;
const TOOLTIP_GAP = 12;

export default function BarChart({
  data = DAY_DATA,
  maxValue = 100,
}: {
  data?: BarChartDatum[];
  maxValue?: number;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const plotWidth = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT;
  const axisY = PLOT_TOP + BAR_MAX_HEIGHT;
  const svgHeight = axisY + AXIS_STROKE;
  const columnWidth = plotWidth / data.length;
  const barWidth = Math.min(columnWidth * 0.5, 34);

  // Default highlight = the peak day
  const [activeIndex, setActiveIndex] = useState(() => {
    const peak = Math.max(...data.map((d) => d.value));
    const idx = data.findIndex((d) => d.value === peak);
    return idx >= 0 ? idx : 0;
  });

  const barHeights = data.map((d) =>
    Math.max((d.value / maxValue) * BAR_MAX_HEIGHT, 4)
  );

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationX / columnWidth))
    );
    setActiveIndex(idx);
  };

  // ─── Bubble placement (above the active bar, clamped inside the plot) ───────
  const activeCenterX = activeIndex * columnWidth + columnWidth / 2;
  const activeTopY = axisY - barHeights[activeIndex];
  const tooltipLeft = Math.min(
    Math.max(activeCenterX - TOOLTIP_W / 2, 0),
    plotWidth - TOOLTIP_W
  );
  const tooltipAbove = activeTopY >= TOOLTIP_H + TOOLTIP_GAP;
  const tooltipTop = tooltipAbove
    ? activeTopY - TOOLTIP_H - TOOLTIP_GAP
    : activeTopY + TOOLTIP_GAP;

  return (
    <View style={styles.chartSection}>
      <View style={{ width: plotWidth, height: svgHeight, position: 'relative' }}>
        <Pressable onPress={handleTouch} style={{ width: plotWidth, height: svgHeight }}>
          <Svg width={plotWidth} height={svgHeight}>
            <Defs>
              <LinearGradient id="barChartGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Full-height tracks — subtle rails behind each bar */}
            {data.map((_, i) => {
              const x = i * columnWidth + (columnWidth - barWidth) / 2;
              return (
                <Rect
                  key={`track-${i}`}
                  x={x}
                  y={PLOT_TOP}
                  width={barWidth}
                  height={BAR_MAX_HEIGHT}
                  rx={barWidth / 2}
                  ry={barWidth / 2}
                  fill={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                />
              );
            })}

            {/* Rounded gradient bars */}
            {data.map((_, i) => {
              const x = i * columnWidth + (columnWidth - barWidth) / 2;
              const h = barHeights[i];
              return (
                <Rect
                  key={`bar-${i}`}
                  x={x}
                  y={axisY - h}
                  width={barWidth}
                  height={h}
                  rx={barWidth / 2}
                  ry={barWidth / 2}
                  fill="url(#barChartGrad)"
                  opacity={i === activeIndex ? 1 : 0.35}
                />
              );
            })}

            {/* Bottom (horizontal) axis — no vertical axis */}
            <Line
              x1={0}
              y1={axisY + 0.5}
              x2={plotWidth}
              y2={axisY + 0.5}
              stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'}
              strokeWidth={AXIS_STROKE}
            />
          </Svg>
        </Pressable>

        {/* Value bubble (tapping a bar pops this up) */}
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
          <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
            {data[activeIndex]?.value}
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
      </View>

      {/* X-axis day labels */}
      <View style={styles.xAxisRow}>
        {data.map((d, i) => {
          const isSelected = i === activeIndex;
          return (
            <View key={`${d.label}-${i}`} style={{ width: columnWidth, alignItems: 'center' }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  chartSection: {
    paddingLeft: H_PADDING_LEFT,
    paddingRight: H_PADDING_RIGHT,
    paddingTop: 16,
    paddingBottom: 8,
  },
  xAxisRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  xAxisLabel: {
    fontSize: 12,
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
  tooltipText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
