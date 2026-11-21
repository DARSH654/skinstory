/**
 * HorizontalBarChart — Ranked Values (Horizontal Pill Bars) with Bottom X-Axis
 *
 * Real-Life Skincare Example: Top Active Ingredients Used This Week
 *  - Left Y-Axis: Skincare Actives (Sunscreen SPF, Ceramides, Niacinamide, Hyaluronic, Retinol, Salicylic BHA)
 *  - Bottom X-Axis: Days logged this week (0, 2, 4, 6, 7) with unit badge "days"
 *  - Extra thick bars (26px) with clean, tight spacing (40px row height)
 *  - No dashed gridlines
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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export type HorizontalBarDatum = { label: string; value: number };

// 100% Real-Life Skincare Actives logged by users in their routines
const REAL_LIFE_ACTIVES: HorizontalBarDatum[] = [
  { label: 'Sunscreen (SPF)', value: 7 },
  { label: 'Ceramide Cream', value: 7 },
  { label: 'Niacinamide', value: 5 },
  { label: 'Hyaluronic Acid', value: 5 },
  { label: 'Retinol 0.2%', value: 3 },
  { label: 'Salicylic (BHA)', value: 2 },
];

const LABEL_W = 114; // Room for realistic skincare active names
const ROW_H = 38;    // Clean, elegant row height
const BAR_H = 22;    // Sleek, refined pill bars (not overly thick)
const TOOLTIP_WIDTH = 70;
const TOOLTIP_H = 30;

export default function HorizontalBarChart({
  title = 'Top Skincare Actives Used',
  data = REAL_LIFE_ACTIVES,
  maxValue = 7,
  unit = 'days',
}: {
  title?: string;
  data?: HorizontalBarDatum[];
  maxValue?: number;
  unit?: string;
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
  const visiblePlotWidth = cardInnerWidth - LABEL_W - 1.5;

  // Generous unit step width (46px per day) so all 7 intervals are 100% equalized
  // and comfortable to read, scrollable horizontally matching BarChart and PairedBarChart
  const minPlotWidth = 7 * 46;
  const plotWidth = Math.max(visiblePlotWidth, minPlotWidth);
  const svgHeight = data.length * ROW_H;
  const totalSvgHeight = svgHeight + 2;

  // Top-ranked bar is highlighted by default
  const [activeIndex, setActiveIndex] = useState(0);

  const barWidths = data.map((d) =>
    Math.max((d.value / maxValue) * plotWidth, BAR_H)
  );

  const selectRow = (idx: number) => {
    setActiveIndex(idx);
    const barEnd = barWidths[idx];
    if (barEnd > scrollX + visiblePlotWidth - 16) {
      const targetX = Math.min(
        plotWidth - visiblePlotWidth,
        barEnd - visiblePlotWidth + TOOLTIP_WIDTH + 16
      );
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    } else if (barEnd < scrollX + TOOLTIP_WIDTH + 16) {
      const targetX = Math.max(0, barEnd - TOOLTIP_WIDTH - 16);
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    }
  };

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationY } = evt.nativeEvent;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.floor(locationY / ROW_H))
    );
    selectRow(idx);
  };

  // 100% equalized daily X-axis ticks (0, 1, 2, 3, 4, 5, 6, 7)
  const xAxisTicks = [0, 1, 2, 3, 4, 5, 6, 7];

  // Tooltip placement: dynamically clamped inside the visible viewport [scrollX, scrollX + visiblePlotWidth]
  // so that even before scrolling or at extremes, the tooltip is 100% visible on screen
  const tipX = barWidths[activeIndex];
  const minVisibleX = scrollX + 6;
  const maxVisibleX = Math.min(
    plotWidth - TOOLTIP_WIDTH - 6,
    scrollX + visiblePlotWidth - TOOLTIP_WIDTH - 6
  );
  const canFitRight =
    tipX + TOOLTIP_WIDTH + 8 <= scrollX + visiblePlotWidth - 6 &&
    tipX + TOOLTIP_WIDTH + 8 <= plotWidth - 6;
  const preferredLeft = canFitRight ? tipX + 8 : tipX - TOOLTIP_WIDTH - 8;
  const bubbleLeft = Math.min(Math.max(preferredLeft, minVisibleX), maxVisibleX);
  const bubbleTop = activeIndex * ROW_H + (ROW_H - TOOLTIP_H) / 2;

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

      {/* Main Chart Body: Left Labels + Plot Area */}
      <View style={styles.chartBody}>
        {/* Left Category Labels (Real Skincare Products) */}
        <View style={{ width: LABEL_W, height: svgHeight }}>
          {data.map((d, i) => {
            const isSelected = i === activeIndex;
            return (
              <Pressable
                key={`hlabel-${i}`}
                onPress={() => selectRow(i)}
                style={styles.labelCell}
              >
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
              </Pressable>
            );
          })}
        </View>

        {/* Crisp, pinned vertical Y-axis divider line — seamlessly meets baseline at (0, svgHeight) with ZERO overshoot */}
        <View
          style={{
            width: 1.5,
            height: svgHeight,
            backgroundColor: axisStrokeColor,
            marginRight: 0,
          }}
        />

        {/* Scrollable Plot Area (Bars + Bottom X-Axis Scale scroll together in lockstep) */}
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
          <View style={{ width: plotWidth }}>
            <Pressable
              onPress={handleTouch}
              style={{ width: plotWidth, height: totalSvgHeight }}
            >
              <Svg width={plotWidth} height={totalSvgHeight}>
                <Defs>
                  <LinearGradient id="horizontalBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                    <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
                  </LinearGradient>
                </Defs>

                {/* Vertical dashed grid lines at each day mark (1, 2, 3, 4, 5, 6, 7) */}
                {xAxisTicks.map((tick, index) => {
                  if (tick === 0) return null;
                  const xVal = (tick / maxValue) * plotWidth;
                  return (
                    <Line
                      key={`dash-${index}`}
                      x1={xVal}
                      y1={0}
                      x2={xVal}
                      y2={svgHeight}
                      stroke={axisStrokeColor}
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Faint full-width track rails with opaque mask hiding dashed lines behind bars */}
                {data.map((_, i) => (
                  <React.Fragment key={`rail-group-${i}`}>
                    <Rect
                      x={0}
                      y={i * ROW_H + (ROW_H - BAR_H) / 2}
                      width={plotWidth}
                      height={BAR_H}
                      rx={BAR_H / 2}
                      ry={BAR_H / 2}
                      fill={isDark ? '#18181b' : '#ffffff'}
                    />
                    <Rect
                      x={0}
                      y={i * ROW_H + (ROW_H - BAR_H) / 2}
                      width={plotWidth}
                      height={BAR_H}
                      rx={BAR_H / 2}
                      ry={BAR_H / 2}
                      fill={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                    />
                  </React.Fragment>
                ))}

                {/* Ranked gradient extra-thick pill bars */}
                {data.map((_, i) => {
                  const isSelected = i === activeIndex;
                  return (
                    <Rect
                      key={`hbar-${i}`}
                      x={0}
                      y={i * ROW_H + (ROW_H - BAR_H) / 2}
                      width={barWidths[i]}
                      height={BAR_H}
                      rx={BAR_H / 2}
                      ry={BAR_H / 2}
                      fill="url(#horizontalBarGrad)"
                      opacity={isSelected ? 1 : 0.4}
                    />
                  );
                })}

                {/* Bottom horizontal X-axis baseline */}
                <Line
                  x1={0}
                  y1={svgHeight}
                  x2={plotWidth}
                  y2={svgHeight}
                  stroke={axisStrokeColor}
                  strokeWidth={1}
                />
              </Svg>
            </Pressable>

            {/* Tap-to-reveal speech-bubble tooltip */}
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
              <Text
                numberOfLines={1}
                style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}
              >
                {data[activeIndex]?.value} {unit}
              </Text>
            </View>

            {/* Bottom X-Axis Numeric Ticks inside ScrollView */}
            <View style={[styles.xAxisContainer, { width: plotWidth }]}>
              {xAxisTicks.map((tick, i) => {
                const tickX = (tick / maxValue) * plotWidth;
                const isFirst = i === 0;
                const isLast = i === xAxisTicks.length - 1;
                const TICK_BOX_W = 20;

                let posStyle: any = {
                  position: 'absolute',
                  width: TICK_BOX_W,
                  top: 0,
                };

                if (isFirst) {
                  posStyle = {
                    position: 'absolute',
                    left: 0,
                    width: TICK_BOX_W,
                    alignItems: 'flex-start',
                  };
                } else if (isLast) {
                  posStyle = {
                    position: 'absolute',
                    right: 0,
                    width: TICK_BOX_W,
                    alignItems: 'flex-end',
                  };
                } else {
                  posStyle = {
                    position: 'absolute',
                    left: tickX - TICK_BOX_W / 2,
                    width: TICK_BOX_W,
                    alignItems: 'center',
                  };
                }

                return (
                  <View key={`x-axis-tick-${i}`} style={posStyle}>
                    <Text
                      style={[
                        styles.xAxisTickLabel,
                        {
                          color: colors.textSecondary,
                          textAlign: isFirst ? 'left' : isLast ? 'right' : 'center',
                        },
                      ]}
                    >
                      {tick}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
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
  chartBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  labelCell: {
    height: ROW_H,
    justifyContent: 'center',
    paddingRight: 10,
  },
  rowLabel: {
    fontSize: 12,
    textAlign: 'right',
  },
  xAxisContainer: {
    height: 18,
    position: 'relative',
    marginTop: 8,
  },
  xAxisTickLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tooltipContainer: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    paddingHorizontal: 4,
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
  },
});
