/**
 * PairedBarChart — two bars per row (you vs usual / yes-days vs no-days)
 *
 * Same visual language as BarChart / HorizontalBarChart:
 *  - primary → secondary gradient for the "you" bar, left → right
 *  - same rails, rounded pills, tap-to-reveal value bubble
 *
 * Differences:
 *  - Every row carries TWO bars: "you" (brand gradient) + "usual" (muted lavender)
 *  - A legend chips row explains the two series
 *  - The bubble shows both values as "you / usual"
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
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export type PairedBarDatum = { label: string; you: number; usual: number };

// ─── Default data: you vs your usual baseline (0-100) ─────────────────────────
const PAIRED_DATA: PairedBarDatum[] = [
  { label: 'Stress', you: 80, usual: 40 },
  { label: 'Sleep', you: 55, usual: 70 },
  { label: 'Water', you: 45, usual: 60 },
  { label: 'Junk Food', you: 30, usual: 55 },
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const LABEL_W = 78;
const ROW_H = 56;
const BAR_H = 12;
const INNER_GAP = 6;
const ROW_INNER_H = BAR_H * 2 + INNER_GAP;
const ROW_TOP_OFFSET = (ROW_H - ROW_INNER_H) / 2;
const TOOLTIP_W = 64;
const TOOLTIP_H = 38;

export default function PairedBarChart({
  data = PAIRED_DATA,
  maxValue = 100,
}: {
  data?: PairedBarDatum[];
  maxValue?: number;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const plotAreaWidth = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT - LABEL_W;
  const svgHeight = data.length * ROW_H;

  const [activeIndex, setActiveIndex] = useState(0);

  const youWidths = data.map((d) => Math.max((d.you / maxValue) * plotAreaWidth, BAR_H));
  const usualWidths = data.map((d) =>
    Math.max((d.usual / maxValue) * plotAreaWidth, BAR_H)
  );

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationY } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationY / ROW_H))
    );
    setActiveIndex(idx);
  };

  // Bubble sits past the longer of the two bars, centred on the row
  const tipX = Math.max(youWidths[activeIndex], usualWidths[activeIndex]);
  const placeRight = plotAreaWidth - tipX >= TOOLTIP_W + 10;
  const bubbleLeft = Math.min(
    Math.max(placeRight ? tipX + 8 : tipX - TOOLTIP_W - 8, 0),
    plotAreaWidth - TOOLTIP_W
  );
  const bubbleTop = activeIndex * ROW_H + (ROW_H - TOOLTIP_H) / 2;

  const railFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const usualFill = isDark ? 'rgba(185,166,214,0.55)' : '#b9a6d6';

  return (
    <View style={styles.chartSection}>
      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: '#937abd' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: usualFill }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Usual</Text>
        </View>
      </View>

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

        {/* Paired bars */}
        <View
          style={{ width: plotAreaWidth, height: svgHeight, position: 'relative' }}
        >
          <Pressable
            onPress={handleTouch}
            style={{ width: plotAreaWidth, height: svgHeight }}
          >
            <Svg width={plotAreaWidth} height={svgHeight}>
              <Defs>
                <LinearGradient id="pairedYouGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                  <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
                </LinearGradient>
              </Defs>

              {/* Rails */}
              {data.map((_, i) => (
                <React.Fragment key={`rails-${i}`}>
                  <Rect
                    x={0}
                    y={i * ROW_H + ROW_TOP_OFFSET}
                    width={plotAreaWidth}
                    height={BAR_H}
                    rx={BAR_H / 2}
                    ry={BAR_H / 2}
                    fill={railFill}
                  />
                  <Rect
                    x={0}
                    y={i * ROW_H + ROW_TOP_OFFSET + BAR_H + INNER_GAP}
                    width={plotAreaWidth}
                    height={BAR_H}
                    rx={BAR_H / 2}
                    ry={BAR_H / 2}
                    fill={railFill}
                  />
                </React.Fragment>
              ))}

              {/* You — brand gradient */}
              {data.map((_, i) => (
                <Rect
                  key={`you-${i}`}
                  x={0}
                  y={i * ROW_H + ROW_TOP_OFFSET}
                  width={youWidths[i]}
                  height={BAR_H}
                  rx={BAR_H / 2}
                  ry={BAR_H / 2}
                  fill="url(#pairedYouGrad)"
                  opacity={i === activeIndex ? 1 : 0.35}
                />
              ))}

              {/* Usual — muted lavender */}
              {data.map((_, i) => (
                <Rect
                  key={`usual-${i}`}
                  x={0}
                  y={i * ROW_H + ROW_TOP_OFFSET + BAR_H + INNER_GAP}
                  width={usualWidths[i]}
                  height={BAR_H}
                  rx={BAR_H / 2}
                  ry={BAR_H / 2}
                  fill={usualFill}
                  opacity={i === activeIndex ? 1 : 0.35}
                />
              ))}
            </Svg>
          </Pressable>

          {/* Value bubble: you / usual */}
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
              {data[activeIndex]?.you}
              <Text style={[styles.tooltipDivider, { color: isDark ? '#a1a1aa' : '#a1a1aa' }]}>
                {' / '}
              </Text>
              {data[activeIndex]?.usual}
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
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 14,
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
  tooltipDivider: {
    fontSize: 13,
    fontWeight: '800',
  },
});
