/**
 * HorizontalBarChart — ranked values (horizontal bars)
 *
 * Same visual language as BarChart / the archived line graph:
 *  - primary → secondary gradient (#937abd → #d6cbe8), now flowing left → right
 *  - same light/dark surfaces + tap-to-reveal value bubble
 *  - faint full-width "rails" behind each bar
 *
 * Differences:
 *  - Bars grow horizontally (ranked, top = highest)
 *  - Left-aligned category labels; a faint vertical baseline on the left
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

export type HorizontalBarDatum = { label: string; value: number };

// ─── Default data: skin score per facial zone, ranked high → low ──────────────
const RANKED_DATA: HorizontalBarDatum[] = [
  { label: 'Jawline', value: 85 },
  { label: 'Chin', value: 82 },
  { label: 'Cheek', value: 80 },
  { label: 'Forehead', value: 75 },
  { label: 'Nose', value: 73 },
  { label: 'Eye Area', value: 72 },
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const LABEL_W = 78;
const ROW_H = 46;
const BAR_H = 16;
const TOOLTIP_W = 48;
const TOOLTIP_H = 38;

export default function HorizontalBarChart({
  data = RANKED_DATA,
  maxValue = 100,
}: {
  data?: HorizontalBarDatum[];
  maxValue?: number;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const plotAreaWidth = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT - LABEL_W;
  const svgHeight = data.length * ROW_H;

  // Top-ranked bar is highlighted by default
  const [activeIndex, setActiveIndex] = useState(0);

  const barWidths = data.map((d) =>
    Math.max((d.value / maxValue) * plotAreaWidth, BAR_H)
  );

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationY } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationY / ROW_H))
    );
    setActiveIndex(idx);
  };

  // ─── Bubble placement: just past the active bar's tip (flips if no room) ────
  const tipX = barWidths[activeIndex];
  const placeRight = plotAreaWidth - tipX >= TOOLTIP_W + 10;
  const bubbleLeft = Math.min(
    Math.max(placeRight ? tipX + 8 : tipX - TOOLTIP_W - 8, 0),
    plotAreaWidth - TOOLTIP_W
  );
  const bubbleTop = activeIndex * ROW_H + (ROW_H - TOOLTIP_H) / 2;

  return (
    <View style={styles.chartSection}>
      <View style={{ flexDirection: 'row' }}>
        {/* Left category labels */}
        <View style={{ width: LABEL_W, height: svgHeight }}>
          {data.map((d, i) => {
            const isSelected = i === activeIndex;
            return (
              <View key={`${d.label}-${i}`} style={styles.labelCell}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowLabel,
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

        {/* Bars */}
        <View
          style={{ width: plotAreaWidth, height: svgHeight, position: 'relative' }}
        >
          <Pressable
            onPress={handleTouch}
            style={{ width: plotAreaWidth, height: svgHeight }}
          >
            <Svg width={plotAreaWidth} height={svgHeight}>
              <Defs>
                <LinearGradient id="horizontalBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                  <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
                </LinearGradient>
              </Defs>

              {/* Faint full-width rails */}
              {data.map((_, i) => (
                <Rect
                  key={`rail-${i}`}
                  x={0}
                  y={i * ROW_H + (ROW_H - BAR_H) / 2}
                  width={plotAreaWidth}
                  height={BAR_H}
                  rx={BAR_H / 2}
                  ry={BAR_H / 2}
                  fill={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                />
              ))}

              {/* Ranked bars */}
              {data.map((_, i) => (
                <Rect
                  key={`hbar-${i}`}
                  x={0}
                  y={i * ROW_H + (ROW_H - BAR_H) / 2}
                  width={barWidths[i]}
                  height={BAR_H}
                  rx={BAR_H / 2}
                  ry={BAR_H / 2}
                  fill="url(#horizontalBarGrad)"
                  opacity={i === activeIndex ? 1 : 0.35}
                />
              ))}

              {/* Left baseline (the horizontal chart's "axis") */}
              <Line
                x1={0.5}
                y1={0}
                x2={0.5}
                y2={svgHeight}
                stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'}
                strokeWidth={1}
              />
            </Svg>
          </Pressable>

          {/* Value bubble */}
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
            <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
              {data[activeIndex]?.value}
            </Text>
            <View
              style={{
                position: 'absolute',
                [placeRight ? 'left' : 'right']: -3,
                top: (TOOLTIP_H - 12) / 2,
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
  labelCell: {
    height: ROW_H,
    justifyContent: 'center',
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 12,
    textAlign: 'right',
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
