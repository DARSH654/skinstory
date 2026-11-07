/**
 * StackedBarChart — composition per period
 *
 * Same visual language as the other charts:
 *  - lavender brand family, rounded (pill) capsules, faint chrome
 *  - bottom (horizontal) axis only — no vertical scale
 *  - tap a segment to reveal its value bubble
 *
 * Each period column is split into stacked capsules (bottom → top) using
 * three brand shades: primary → mid → secondary. A legend chips row explains
 * the composition. The tapped capsule is highlighted and pops its value.
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
import Svg, { Rect, Line } from 'react-native-svg';

export type StackedBarDatum = {
  label: string;
  good: number;
  fair: number;
  rough: number;
};

// ─── Composition layers, drawn bottom → top ───────────────────────────────────
const SEGMENTS = [
  { key: 'good', label: 'Good', color: '#937abd' },
  { key: 'fair', label: 'Fair', color: '#b9a6d6' },
  { key: 'rough', label: 'Rough', color: '#d6cbe8' },
] as const;

type SegmentKey = (typeof SEGMENTS)[number]['key'];

// ─── Default data: good / fair / rough days per week (7-day weeks) ────────────
const STACKED_DATA: StackedBarDatum[] = [
  { label: 'Wk 1', good: 3, fair: 2, rough: 2 },
  { label: 'Wk 2', good: 4, fair: 2, rough: 1 },
  { label: 'Wk 3', good: 5, fair: 1, rough: 1 },
  { label: 'Wk 4', good: 6, fair: 1, rough: 0 },
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const PLOT_TOP = 60; // head-room so the bubble clears the tallest column
const BAR_MAX_HEIGHT = 190;
const SEG_GAP = 3;
const TOOLTIP_W = 56;
const TOOLTIP_H = 38;

export default function StackedBarChart({
  data = STACKED_DATA,
}: {
  data?: StackedBarDatum[];
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const plotWidth = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT;
  const axisY = PLOT_TOP + BAR_MAX_HEIGHT;
  const svgHeight = axisY + 1;
  const columnWidth = plotWidth / data.length;
  const barWidth = Math.min(columnWidth * 0.5, 34);

  const [active, setActive] = useState({ col: 0, seg: 0 });

  // Global scale so stacked columns are comparable across periods
  const grandMax = Math.max(
    1,
    ...data.map((c) => SEGMENTS.reduce((sum, s) => sum + c[s.key], 0))
  );

  // Pre-compute capsule rects + per-column hit-test bands
  const columns = data.map((c, col) => {
    const x = col * columnWidth + (columnWidth - barWidth) / 2;
    let cumulative = 0;
    const bars: { seg: number; y: number; h: number; color: string }[] = [];
    const bands: { seg: number; top: number; bottom: number }[] = [];

    SEGMENTS.forEach((s, seg) => {
      const v = c[s.key];
      const h = (v / grandMax) * BAR_MAX_HEIGHT;
      if (h > 0) {
        const bottom = axisY - cumulative;
        const top = bottom - h;
        bands.push({ seg, top, bottom });
        if (h - SEG_GAP > 0) {
          bars.push({
            seg,
            y: top + SEG_GAP / 2,
            h: h - SEG_GAP,
            color: s.color,
          });
        }
        cumulative += h;
      }
    });

    return { x, totalH: cumulative, bars, bands };
  });

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const col = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationX / columnWidth))
    );
    const bands = columns[col].bands;

    let seg = bands.length ? bands[0].seg : 0;
    let matched = false;
    for (const b of bands) {
      if (locationY >= b.top && locationY <= b.bottom) {
        seg = b.seg;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Nearest band fallback (tap landed in a gap or above the column)
      let best = Infinity;
      for (const b of bands) {
        const dist = Math.abs((b.top + b.bottom) / 2 - locationY);
        if (dist < best) {
          best = dist;
          seg = b.seg;
        }
      }
    }
    setActive({ col, seg });
  };

  // ─── Bubble: centred on the active column, above its stack ──────────────────
  const bubbleLeft = Math.min(
    Math.max(active.col * columnWidth + columnWidth / 2 - TOOLTIP_W / 2, 0),
    plotWidth - TOOLTIP_W
  );
  const bubbleTop = Math.max(
    axisY - columns[active.col].totalH - TOOLTIP_H - 12,
    2
  );

  const activeSegment = SEGMENTS[active.seg];
  const activeValue = data[active.col]?.[activeSegment.key as SegmentKey] ?? 0;
  const activeStroke = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.3)';
  const edgeStroke = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={styles.chartSection}>
      {/* Legend */}
      <View style={styles.legendRow}>
        {SEGMENTS.map((s) => (
          <View key={s.key} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ width: plotWidth, height: svgHeight, position: 'relative' }}>
        <Pressable onPress={handleTouch} style={{ width: plotWidth, height: svgHeight }}>
          <Svg width={plotWidth} height={svgHeight}>
            {/* Stacked capsules */}
            {columns.map((c, col) =>
              c.bars.map((b) => {
                const isActive = col === active.col && b.seg === active.seg;
                return (
                  <Rect
                    key={`${col}-${b.seg}`}
                    x={c.x}
                    y={b.y}
                    width={barWidth}
                    height={b.h}
                    rx={barWidth / 2}
                    ry={barWidth / 2}
                    fill={b.color}
                    opacity={isActive ? 1 : 0.6}
                    stroke={isActive ? activeStroke : edgeStroke}
                    strokeWidth={isActive ? 2 : 1}
                  />
                );
              })
            )}

            {/* Bottom (horizontal) axis — no vertical axis */}
            <Line
              x1={0}
              y1={axisY + 0.5}
              x2={plotWidth}
              y2={axisY + 0.5}
              stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'}
              strokeWidth={1}
            />
          </Svg>
        </Pressable>

        {/* Value bubble — coloured dot + value of the tapped segment */}
        <View
          pointerEvents="none"
          style={[
            styles.tooltipContainer,
            {
              left: bubbleLeft,
              top: bubbleTop,
              backgroundColor: isDark ? '#ffffff' : '#09090b',
            },
          ]}
        >
          <View style={[styles.tooltipDot, { backgroundColor: activeSegment.color }]} />
          <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
            {activeValue}
          </Text>
          <View
            style={{
              position: 'absolute',
              bottom: -3,
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

      {/* X-axis period labels */}
      <View style={styles.xAxisRow}>
        {data.map((d, i) => {
          const isSelected = i === active.col;
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
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tooltipDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  tooltipText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
