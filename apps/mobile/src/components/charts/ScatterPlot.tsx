/**
 * ScatterPlot — numeric vs numeric correlation
 *
 * Same visual language as the other charts:
 *  - lavender brand family, dark/light surfaces
 *  - tap-to-reveal value bubble (dark bubble in light mode, white in dark)
 *
 * Each dot plots one observation (x = factor, y = skin score). A dashed
 * best-fit line shows the overall trend. Tapping near a dot highlights it
 * and pops a bubble with both values.
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
import Svg, { Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

export type ScatterDatum = { x: number; y: number };

// ─── Default data: hydration (x) vs skin score (y) ────────────────────────────
const DEFAULT_DATA: ScatterDatum[] = [
  { x: 22, y: 48 },
  { x: 28, y: 55 },
  { x: 34, y: 52 },
  { x: 41, y: 63 },
  { x: 47, y: 60 },
  { x: 53, y: 72 },
  { x: 58, y: 68 },
  { x: 64, y: 79 },
  { x: 71, y: 74 },
  { x: 78, y: 86 },
  { x: 85, y: 82 },
  { x: 92, y: 91 },
];

// ─── Geometry ─────────────────────────────────────────────────────────────────
const H_PADDING_LEFT = 14;
const H_PADDING_RIGHT = 20;
const PLOT_LEFT = 34; // room for y labels
const PLOT_RIGHT = 12;
const PLOT_TOP = 16;
const PLOT_HEIGHT = 210;
const PLOT_BOTTOM = 24; // room for x labels
const DOT_R = 5;
const HIT_RADIUS = 20;
const TOOLTIP_W = 60;
const TOOLTIP_H = 46;
const TOOLTIP_GAP = 12;

export default function ScatterPlot({
  data = DEFAULT_DATA,
  xMax = 100,
  yMax = 100,
  xLabel = 'Hydration',
  yLabel = 'Skin Score',
}: {
  data?: ScatterDatum[];
  xMax?: number;
  yMax?: number;
  xLabel?: string;
  yLabel?: string;
}) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const plotWidth = SCREEN_WIDTH - H_PADDING_LEFT - H_PADDING_RIGHT - PLOT_LEFT - PLOT_RIGHT;
  const svgWidth = plotWidth + PLOT_LEFT + PLOT_RIGHT;
  const svgHeight = PLOT_TOP + PLOT_HEIGHT + PLOT_BOTTOM;
  const axisBottomY = PLOT_TOP + PLOT_HEIGHT;

  // Default highlight = the highest-scoring point
  const [activeIndex, setActiveIndex] = useState(() => {
    let best = 0;
    data.forEach((d, i) => {
      if (d.y > data[best].y) best = i;
    });
    return best;
  });

  const toPx = (d: ScatterDatum) => ({
    cx: PLOT_LEFT + (d.x / xMax) * plotWidth,
    cy: PLOT_TOP + (1 - d.y / yMax) * PLOT_HEIGHT,
  });

  // ─── Linear regression (best-fit trend) ─────────────────────────────────────
  const n = data.length;
  const meanX = data.reduce((s, d) => s + d.x, 0) / n;
  const meanY = data.reduce((s, d) => s + d.y, 0) / n;
  const cov = data.reduce((s, d) => s + (d.x - meanX) * (d.y - meanY), 0);
  const varX = data.reduce((s, d) => s + (d.x - meanX) ** 2, 0);
  const slope = varX === 0 ? 0 : cov / varX;
  const intercept = meanY - slope * meanX;

  const clampY = (v: number) => Math.min(Math.max(v, 0), yMax);
  const trendStart = {
    x: PLOT_LEFT,
    y: PLOT_TOP + (1 - clampY(intercept) / yMax) * PLOT_HEIGHT,
  };
  const trendEnd = {
    x: PLOT_LEFT + plotWidth,
    y: PLOT_TOP + (1 - clampY(intercept + slope * xMax) / yMax) * PLOT_HEIGHT,
  };

  const handleTouch = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    let nearest = -1;
    let nearestDist = HIT_RADIUS;
    data.forEach((d, i) => {
      const { cx, cy } = toPx(d);
      const dist = Math.hypot(locationX - cx, locationY - cy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    if (nearest >= 0) setActiveIndex(nearest);
  };

  const active = data[activeIndex];
  const activePx = toPx(active);
  const tooltipLeft = Math.min(
    Math.max(activePx.cx - TOOLTIP_W / 2, 0),
    svgWidth - TOOLTIP_W
  );
  const tooltipAbove = activePx.cy >= TOOLTIP_H + TOOLTIP_GAP;
  const tooltipTop = tooltipAbove
    ? activePx.cy - TOOLTIP_H - TOOLTIP_GAP
    : activePx.cy + TOOLTIP_GAP;

  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const axisColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';

  return (
    <View style={styles.chartSection}>
      {/* Axis titles: y on top-left, x centered at the bottom */}
      <View style={styles.axisTitleRow}>
        <Text style={[styles.axisTitle, { color: colors.textSecondary }]}>{yLabel}</Text>
      </View>

      <View style={{ width: svgWidth, height: svgHeight, position: 'relative' }}>
        <Pressable onPress={handleTouch} style={{ width: svgWidth, height: svgHeight }}>
          <Svg width={svgWidth} height={svgHeight}>
            <Defs>
              <LinearGradient id="scatterDotGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                <Stop offset="1" stopColor="#b9a6d6" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Horizontal gridlines at 0 / 50 / 100 */}
            {[0, 0.5, 1].map((f) => {
              const yy = PLOT_TOP + (1 - f) * PLOT_HEIGHT + 0.5;
              return (
                <Line
                  key={`grid-${f}`}
                  x1={PLOT_LEFT}
                  y1={yy}
                  x2={PLOT_LEFT + plotWidth}
                  y2={yy}
                  stroke={gridColor}
                  strokeWidth={1}
                />
              );
            })}

            {/* Best-fit trend line */}
            <Line
              x1={trendStart.x}
              y1={trendStart.y}
              x2={trendEnd.x}
              y2={trendEnd.y}
              stroke={isDark ? 'rgba(214,203,232,0.5)' : 'rgba(147,122,189,0.45)'}
              strokeWidth={2}
              strokeDasharray="5 5"
              strokeLinecap="round"
            />

            {/* Axis lines (left + bottom) */}
            <Line
              x1={PLOT_LEFT + 0.5}
              y1={PLOT_TOP}
              x2={PLOT_LEFT + 0.5}
              y2={axisBottomY}
              stroke={axisColor}
              strokeWidth={1}
            />
            <Line
              x1={PLOT_LEFT}
              y1={axisBottomY + 0.5}
              x2={PLOT_LEFT + plotWidth}
              y2={axisBottomY + 0.5}
              stroke={axisColor}
              strokeWidth={1}
            />

            {/* Data points */}
            {data.map((d, i) => {
              const { cx, cy } = toPx(d);
              const isActive = i === activeIndex;
              return (
                <React.Fragment key={`pt-${i}`}>
                  {isActive && (
                    <Circle cx={cx} cy={cy} r={DOT_R + 5} fill="rgba(147,122,189,0.18)" />
                  )}
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? DOT_R + 1 : DOT_R}
                    fill="url(#scatterDotGrad)"
                    opacity={isActive ? 1 : 0.5}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
        </Pressable>

        {/* Y-axis labels */}
        <View pointerEvents="none" style={[styles.yLabels, { height: PLOT_HEIGHT, top: PLOT_TOP }]}>
          {[yMax, Math.round(yMax / 2), 0].map((v, i) => (
            <Text key={`y-${i}`} style={[styles.axisTick, { color: colors.textSecondary }]}>
              {v}
            </Text>
          ))}
        </View>

        {/* Value bubble */}
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
          <Text style={[styles.tooltipMain, { color: isDark ? '#09090b' : '#ffffff' }]}>
            {active.y}
          </Text>
          <Text style={[styles.tooltipSub, { color: isDark ? 'rgba(9,9,11,0.6)' : 'rgba(255,255,255,0.7)' }]}>
            x {active.x}
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

      {/* X-axis labels */}
      <View style={[styles.xLabelsRow, { marginLeft: PLOT_LEFT, width: plotWidth }]}>
        {[0, Math.round(xMax / 2), xMax].map((v, i) => (
          <Text key={`x-${i}`} style={[styles.axisTick, { color: colors.textSecondary }]}>
            {v}
          </Text>
        ))}
      </View>
      <Text style={[styles.xAxisTitle, { color: colors.textSecondary }]}>{xLabel}</Text>
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
  axisTitleRow: {
    marginBottom: 6,
  },
  axisTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  yLabels: {
    position: 'absolute',
    left: 0,
    width: PLOT_LEFT - 6,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  axisTick: {
    fontSize: 10,
    fontWeight: '600',
  },
  xLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  xAxisTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 8,
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
  tooltipMain: {
    fontSize: 14,
    fontWeight: '800',
  },
  tooltipSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});
