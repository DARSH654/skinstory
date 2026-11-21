/**
 * ChartLandscapeScreen — Full-Screen Portrait Card with Rotated Landscape Chart
 *
 * Requirements:
 *  - Screen stays held vertically in portrait
 *  - Top Bar: Uplifted circular Back button on the left, Chart Title centered on the top line
 *  - Card is placed portraitly, filling the screen below the top bar (no giant empty space)
 *  - Content inside the card is rotated 90 degrees so the user views the widescreen landscape
 *    chart along the full vertical height of the phone
 *  - Supports all 5 chart primitives:
 *      1. Line Graph (Overall Trajectory)
 *      2. Bar Chart (Daily Hydration Intake)
 *      3. Horizontal Bar Chart (Top Skincare Actives Used)
 *      4. Paired Bar Chart (Routine Compliance: AM vs PM)
 *      5. Stacked Bar Chart (Daily Skincare Layers)
 *  - Dashed grid lines hidden behind bars and omitted from bottom baseline
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Text } from '@/components/AppText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import Svg, { Rect, Line, Path, Circle, Defs, LinearGradient, Stop, ClipPath, G } from 'react-native-svg';

type ChartType = 'bar' | 'line' | 'horizontal' | 'paired' | 'stacked';

const CHART_TITLES: Record<ChartType, string> = {
  line: 'Overall Trajectory',
  bar: 'Daily Hydration Intake',
  horizontal: 'Top Skincare Actives Used',
  paired: 'Routine Compliance: AM vs PM',
  stacked: 'Daily Skincare Layers',
};

export default function ChartLandscapeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ chartType?: ChartType }>();

  const chartType: ChartType = params.chartType || 'bar';
  const pageTitle = CHART_TITLES[chartType] || 'Chart Analysis';

  // Measure card dimensions dynamically so the rotated inner canvas matches exactly
  const [cardDim, setCardDim] = useState({ width: 0, height: 0 });

  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - cardDim.width) > 2 || Math.abs(height - cardDim.height) > 2) {
      setCardDim({ width, height });
    }
  };

  // The rotated canvas dimensions:
  // Widescreen width = card height (long edge of phone)
  // Widescreen height = card width (short edge of phone)
  const plotCanvasW = cardDim.height > 0 ? cardDim.height : 600;
  const plotCanvasH = cardDim.width > 0 ? cardDim.width : 340;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#101012' : '#F4F4F6' }]}>
      {/* ── Top Bar: Circular Back Button (Left) + Center-Aligned Title ── */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={16}
          style={({ pressed }) => [
            styles.circularBackButton,
            {
              backgroundColor: pressed
                ? (isDark ? '#27272a' : '#e4e4e7')
                : (isDark ? '#1c1c1f' : '#ffffff'),
              borderColor: isDark ? '#27272a' : '#e5e7eb',
            },
          ]}
        >
          <ChevronLeft size={22} color={colors.text} strokeWidth={2.4} />
        </Pressable>

        {/* Center-Aligned Title */}
        <View style={styles.centerTitleWrapper} pointerEvents="none">
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {pageTitle}
          </Text>
        </View>

        {/* Right empty spacer for symmetry */}
        <View style={{ width: 42 }} />
      </View>

      {/* ── Tall Portrait Card Filling the Screen Below ── */}
      <View
        onLayout={onCardLayout}
        style={[
          styles.portraitCard,
          {
            marginBottom: Math.max(insets.bottom, 16),
            backgroundColor: isDark ? '#18181b' : '#ffffff',
            borderColor: isDark ? '#27272a' : '#e5e7eb',
          },
        ]}
      >
        {cardDim.width > 0 && cardDim.height > 0 && (
          <View
            style={[
              styles.rotatedContentWrapper,
              {
                width: plotCanvasW,
                height: plotCanvasH,
              },
            ]}
          >
            {chartType === 'bar' && (
              <RotatedBarChart
                isDark={isDark}
                colors={colors}
                width={plotCanvasW}
                height={plotCanvasH}
              />
            )}
            {chartType === 'line' && (
              <RotatedLineChart
                isDark={isDark}
                colors={colors}
                width={plotCanvasW}
                height={plotCanvasH}
              />
            )}
            {chartType === 'horizontal' && (
              <RotatedHorizontalBarChart
                isDark={isDark}
                colors={colors}
                width={plotCanvasW}
                height={plotCanvasH}
              />
            )}
            {chartType === 'paired' && (
              <RotatedPairedBarChart
                isDark={isDark}
                colors={colors}
                width={plotCanvasW}
                height={plotCanvasH}
              />
            )}
            {chartType === 'stacked' && (
              <RotatedStackedBarChart
                isDark={isDark}
                colors={colors}
                width={plotCanvasW}
                height={plotCanvasH}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ROTATED BAR CHART (Daily Hydration Intake)
// ─────────────────────────────────────────────────────────────────────────────
function RotatedBarChart({
  isDark,
  colors,
  width,
  height,
}: {
  isDark: boolean;
  colors: any;
  width: number;
  height: number;
}) {
  const data = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 11 },
    { label: 'Wed', value: 6 },
    { label: 'Thu', value: 9 },
    { label: 'Fri', value: 10 },
    { label: 'Sat', value: 7 },
    { label: 'Sun', value: 12 },
  ];
  const maxValue = 12;
  const unit = 'glasses';

  const [activeIndex, setActiveIndex] = useState(6);

  const paddingH = 20;
  const headerH = 46;
  const yAxisW = 24;
  const yAxisGap = 8;
  const bottomLabelsH = 28;

  const plotW = width - paddingH * 2 - yAxisW - yAxisGap;
  const barMaxH = height - headerH - bottomLabelsH - 30;
  const plotTop = headerH + 10;
  const axisY = plotTop + barMaxH;

  const colWidth = plotW / data.length;
  const barW = Math.min(colWidth * 0.52, 42);

  const yTicks = [12, 9, 6, 3, 0];
  const tooltipW = 86;

  const activeCenterX = activeIndex * colWidth + colWidth / 2;
  const barH = Math.max((data[activeIndex].value / maxValue) * barMaxH, 10);
  const activeTopY = axisY - barH;

  const rawLeft = activeCenterX - tooltipW / 2;
  const tipLeft = Math.min(Math.max(rawLeft, 4), plotW - tooltipW - 4);
  const tipTop = activeTopY >= 40 ? activeTopY - 40 : activeTopY + 8;
  const tailLeft = Math.min(Math.max(activeCenterX - tipLeft - 5, 8), tooltipW - 18);

  return (
    <View style={{ width, height, paddingHorizontal: paddingH, paddingTop: 14 }}>
      {/* Card Header inside rotated canvas */}
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitleText, { color: colors.text }]}>Daily Hydration Intake</Text>
        <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        {/* Y Axis */}
        <View style={[styles.yAxisCol, { height: barMaxH + plotTop }]}>
          {yTicks.map((t, i) => {
            const yPos = plotTop + (i / (yTicks.length - 1)) * barMaxH;
            return (
              <Text key={`y-${i}`} style={[styles.yTickText, { color: colors.textSecondary, top: yPos - 7 }]}>
                {t}
              </Text>
            );
          })}
        </View>

        {/* SVG Plot */}
        <Pressable
          onPress={(e) => {
            const idx = Math.min(data.length - 1, Math.max(0, Math.floor(e.nativeEvent.locationX / colWidth)));
            setActiveIndex(idx);
          }}
          style={{ width: plotW, height: height - headerH, position: 'relative' }}
        >
          <Svg width={plotW} height={height - headerH}>
            <Defs>
              <LinearGradient id="rBarGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {/* Horizontal Dashed Lines — omitted on bottom baseline (tick 0) */}
            {yTicks.map((_, i) => {
              if (i === yTicks.length - 1) return null;
              const yVal = plotTop + (i / (yTicks.length - 1)) * barMaxH;
              return (
                <Line
                  key={`dash-${i}`}
                  x1={0}
                  y1={yVal}
                  x2={plotW}
                  y2={yVal}
                  stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Opaque mask + grey background rails — hides dashed line behind bars */}
            {data.map((_, i) => {
              const x = i * colWidth + (colWidth - barW) / 2;
              return (
                <React.Fragment key={`rail-g-${i}`}>
                  <Rect x={x} y={plotTop} width={barW} height={barMaxH} rx={barW / 2} ry={barW / 2} fill={isDark ? '#18181b' : '#ffffff'} />
                  <Rect x={x} y={plotTop} width={barW} height={barMaxH} rx={barW / 2} ry={barW / 2} fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'} />
                </React.Fragment>
              );
            })}

            {/* Colored pill bars */}
            {data.map((d, i) => {
              const x = i * colWidth + (colWidth - barW) / 2;
              const h = Math.max((d.value / maxValue) * barMaxH, 10);
              const isSel = i === activeIndex;
              return (
                <Rect
                  key={`b-${i}`}
                  x={x}
                  y={axisY - h}
                  width={barW}
                  height={h}
                  rx={barW / 2}
                  ry={barW / 2}
                  fill="url(#rBarGrad)"
                  opacity={isSel ? 1 : 0.4}
                />
              );
            })}

            {/* Solid bottom baseline */}
            <Line x1={0} y1={axisY + 0.5} x2={plotW} y2={axisY + 0.5} stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} />
          </Svg>

          {/* Tooltip */}
          <View pointerEvents="none" style={[styles.tooltipBox, { left: tipLeft, top: tipTop, width: tooltipW, backgroundColor: isDark ? '#ffffff' : '#09090b' }]}>
            <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
              {data[activeIndex].value} {unit}
            </Text>
            <View style={[styles.tooltipTail, { left: tailLeft, backgroundColor: isDark ? '#ffffff' : '#09090b', bottom: -4 }]} />
          </View>

          {/* X Axis Labels */}
          <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
            {data.map((d, i) => (
              <View key={`day-${i}`} style={{ width: colWidth, alignItems: 'center' }}>
                <Text style={[styles.xAxisLabel, { color: i === activeIndex ? (isDark ? '#fff' : '#000') : colors.textSecondary, fontWeight: i === activeIndex ? '800' : '600' }]}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ROTATED LINE CHART (Overall Trajectory)
// ─────────────────────────────────────────────────────────────────────────────
function RotatedLineChart({
  isDark,
  colors,
  width,
  height,
}: {
  isDark: boolean;
  colors: any;
  width: number;
  height: number;
}) {
  const data = [
    { label: 'Mon', score: 72 },
    { label: 'Tue', score: 74 },
    { label: 'Wed', score: 73 },
    { label: 'Thu', score: 78 },
    { label: 'Fri', score: 77 },
    { label: 'Sat', score: 81 },
    { label: 'Sun', score: 84 },
  ];
  const [activeIdx, setActiveIdx] = useState(6);

  const paddingH = 20;
  const headerH = 46;
  const yAxisW = 24;
  const yAxisGap = 8;
  const bottomLabelsH = 28;

  const plotW = width - paddingH * 2 - yAxisW - yAxisGap;
  const lineH = height - headerH - bottomLabelsH - 30;
  const plotTop = headerH + 10;
  const axisY = plotTop + lineH;
  const colWidth = plotW / (data.length - 1);

  const yTicks = [100, 80, 60, 40, 20, 0];

  const points = data.map((d, i) => {
    const x = i * colWidth;
    const y = plotTop + (1 - d.score / 100) * lineH;
    return { x, y, score: d.score, label: d.label };
  });

  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${axisY} L ${points[0].x} ${axisY} Z`;

  const activeP = points[activeIdx];
  const tipW = 68;
  const rawLeft = activeP.x - tipW / 2;
  const tipLeft = Math.min(Math.max(rawLeft, 4), plotW - tipW - 4);
  const tipTop = activeP.y - 36;

  return (
    <View style={{ width, height, paddingHorizontal: paddingH, paddingTop: 14 }}>
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitleText, { color: colors.text }]}>Overall Trajectory</Text>
        <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>score / 100</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={[styles.yAxisCol, { height: lineH + plotTop }]}>
          {yTicks.map((t, i) => {
            const yPos = plotTop + (i / (yTicks.length - 1)) * lineH;
            return (
              <Text key={`y-${i}`} style={[styles.yTickText, { color: colors.textSecondary, top: yPos - 7 }]}>
                {t}
              </Text>
            );
          })}
        </View>

        <Pressable
          onPress={(e) => {
            const idx = Math.min(data.length - 1, Math.max(0, Math.round(e.nativeEvent.locationX / colWidth)));
            setActiveIdx(idx);
          }}
          style={{ width: plotW, height: height - headerH, position: 'relative' }}
        >
          <Svg width={plotW} height={height - headerH}>
            <Defs>
              <LinearGradient id="rLineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#937abd" stopOpacity="0.25" />
                <Stop offset="1" stopColor="#937abd" stopOpacity="0.00" />
              </LinearGradient>
            </Defs>

            {yTicks.map((_, i) => {
              const yVal = plotTop + (i / (yTicks.length - 1)) * lineH;
              return (
                <Line
                  key={`dash-${i}`}
                  x1={0}
                  y1={yVal}
                  x2={plotW}
                  y2={yVal}
                  stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}

            <Path d={areaPath} fill="url(#rLineAreaGrad)" />
            <Path d={linePath} fill="none" stroke="#937abd" strokeWidth={3.5} strokeLinecap="round" />

            {points.map((p, i) => (
              <Circle
                key={`p-${i}`}
                cx={p.x}
                cy={p.y}
                r={i === activeIdx ? 6 : 4}
                fill={isDark ? '#18181b' : '#ffffff'}
                stroke="#937abd"
                strokeWidth={i === activeIdx ? 3.5 : 2.5}
              />
            ))}

            <Line x1={0} y1={axisY + 0.5} x2={plotW} y2={axisY + 0.5} stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} />
          </Svg>

          <View pointerEvents="none" style={[styles.tooltipBox, { left: tipLeft, top: tipTop, width: tipW, backgroundColor: isDark ? '#ffffff' : '#09090b' }]}>
            <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>{activeP.score} pts</Text>
            <View style={[styles.tooltipTail, { left: Math.min(Math.max(activeP.x - tipLeft - 5, 8), tipW - 18), backgroundColor: isDark ? '#ffffff' : '#09090b', bottom: -4 }]} />
          </View>

          {/* Weekday labels shifted cleanly downwards */}
          <View style={[styles.xAxisRow, { top: axisY + 10 }]}>
            {data.map((d, i) => (
              <View key={`day-${i}`} style={{ width: colWidth, alignItems: i === 0 ? 'flex-start' : i === data.length - 1 ? 'flex-end' : 'center' }}>
                <Text style={[styles.xAxisLabel, { color: i === activeIdx ? (isDark ? '#fff' : '#000') : colors.textSecondary, fontWeight: i === activeIdx ? '800' : '600' }]}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROTATED HORIZONTAL BAR CHART (Top Skincare Actives Used)
// ─────────────────────────────────────────────────────────────────────────────
function RotatedHorizontalBarChart({
  isDark,
  colors,
  width,
  height,
}: {
  isDark: boolean;
  colors: any;
  width: number;
  height: number;
}) {
  const data = [
    { label: 'Sunscreen (SPF 50)', value: 7 },
    { label: 'Ceramide Cream', value: 7 },
    { label: 'Niacinamide 10%', value: 5 },
    { label: 'Hyaluronic Acid', value: 5 },
    { label: 'Retinol 0.2%', value: 3 },
    { label: 'Salicylic (BHA)', value: 2 },
  ];
  const maxValue = 7;
  const unit = 'days';

  const [activeIndex, setActiveIndex] = useState(0);

  const paddingH = 20;
  const headerH = 46;
  const labelW = 150;
  const rowH = Math.min((height - headerH - 24) / data.length, 42);
  const barH = 22; // Sleek thin bar
  const plotW = width - paddingH * 2 - labelW;
  const svgH = data.length * rowH;

  const barWidths = data.map((d) => Math.max((d.value / maxValue) * plotW, barH));
  const tipW = 70;
  const tipX = barWidths[activeIndex];
  const placeRight = plotW - tipX >= tipW + 10;
  const rawLeft = placeRight ? tipX + 8 : tipX - tipW - 8;
  const tipLeft = Math.min(Math.max(rawLeft, 4), plotW - tipW - 4);
  const tipTop = activeIndex * rowH + (rowH - 28) / 2;

  return (
    <View style={{ width, height, paddingHorizontal: paddingH, paddingTop: 14 }}>
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitleText, { color: colors.text }]}>Top Skincare Actives Used</Text>
        <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>{unit}</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={{ width: labelW }}>
          {data.map((d, i) => (
            <View key={`lbl-${i}`} style={{ height: rowH, justifyContent: 'center', paddingRight: 12 }}>
              <Text numberOfLines={1} style={[styles.rowLabel, { color: i === activeIndex ? colors.text : colors.textSecondary, fontWeight: i === activeIndex ? '800' : '600' }]}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={(e) => {
            const idx = Math.min(data.length - 1, Math.max(0, Math.floor(e.nativeEvent.locationY / rowH)));
            setActiveIndex(idx);
          }}
          style={{ width: plotW, height: svgH, position: 'relative' }}
        >
          <Svg width={plotW} height={svgH}>
            <Defs>
              <LinearGradient id="rHGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#937abd" stopOpacity="1" />
                <Stop offset="1" stopColor="#d6cbe8" stopOpacity="1" />
              </LinearGradient>
            </Defs>

            {data.map((_, i) => (
              <Rect
                key={`bg-${i}`}
                x={0}
                y={i * rowH + (rowH - barH) / 2}
                width={plotW}
                height={barH}
                rx={barH / 2}
                ry={barH / 2}
                fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'}
              />
            ))}

            {data.map((_, i) => (
              <Rect
                key={`bar-${i}`}
                x={0}
                y={i * rowH + (rowH - barH) / 2}
                width={barWidths[i]}
                height={barH}
                rx={barH / 2}
                ry={barH / 2}
                fill="url(#rHGrad)"
                opacity={i === activeIndex ? 1 : 0.4}
              />
            ))}

            <Line x1={0.5} y1={0} x2={0.5} y2={svgH} stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} />
          </Svg>

          <View pointerEvents="none" style={[styles.tooltipBox, { left: tipLeft, top: tipTop, width: tipW, height: 28, backgroundColor: isDark ? '#ffffff' : '#09090b' }]}>
            <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
              {data[activeIndex].value} {unit}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ROTATED PAIRED BAR CHART (AM vs PM Routine)
// ─────────────────────────────────────────────────────────────────────────────
function RotatedPairedBarChart({
  isDark,
  colors,
  width,
  height,
}: {
  isDark: boolean;
  colors: any;
  width: number;
  height: number;
}) {
  const data = [
    { label: 'Mon', am: 100, pm: 100 },
    { label: 'Tue', am: 100, pm: 80 },
    { label: 'Wed', am: 80, pm: 60 },
    { label: 'Thu', am: 100, pm: 100 },
    { label: 'Fri', am: 90, pm: 70 },
    { label: 'Sat', am: 60, pm: 80 },
    { label: 'Sun', am: 100, pm: 100 },
  ];
  const [activeIndex, setActiveIndex] = useState(3);

  const paddingH = 20;
  const headerH = 46;
  const yAxisW = 24;
  const yAxisGap = 8;
  const bottomLabelsH = 28;

  const plotW = width - paddingH * 2 - yAxisW - yAxisGap;
  const barMaxH = height - headerH - bottomLabelsH - 30;
  const plotTop = headerH + 10;
  const axisY = plotTop + barMaxH;

  const colWidth = plotW / data.length;
  const singleBarW = Math.min((colWidth - 20) / 2, 24);
  const barGap = 6;
  const pairW = singleBarW * 2 + barGap;

  const yTicks = [100, 75, 50, 25, 0];
  const tooltipW = 132;

  const activeCenterX = activeIndex * colWidth + colWidth / 2;
  const rawLeft = activeCenterX - tooltipW / 2;
  const tipLeft = Math.min(Math.max(rawLeft, 4), plotW - tooltipW - 4);
  const tipTop = 8;

  return (
    <View style={{ width, height, paddingHorizontal: paddingH, paddingTop: 14 }}>
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitleText, { color: colors.text }]}>Routine Compliance: AM vs PM</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#937abd' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>AM</Text>
          <View style={[styles.legendDot, { backgroundColor: '#d6cbe8', marginLeft: 8 }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>PM</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={[styles.yAxisCol, { height: barMaxH + plotTop }]}>
          {yTicks.map((t, i) => {
            const yPos = plotTop + (i / (yTicks.length - 1)) * barMaxH;
            return (
              <Text key={`y-${i}`} style={[styles.yTickText, { color: colors.textSecondary, top: yPos - 7 }]}>
                {t}
              </Text>
            );
          })}
        </View>

        <Pressable
          onPress={(e) => {
            const idx = Math.min(data.length - 1, Math.max(0, Math.floor(e.nativeEvent.locationX / colWidth)));
            setActiveIndex(idx);
          }}
          style={{ width: plotW, height: height - headerH, position: 'relative' }}
        >
          <Svg width={plotW} height={height - headerH}>
            {yTicks.map((_, i) => {
              if (i === yTicks.length - 1) return null;
              const yVal = plotTop + (i / (yTicks.length - 1)) * barMaxH;
              return (
                <Line
                  key={`dash-${i}`}
                  x1={0}
                  y1={yVal}
                  x2={plotW}
                  y2={yVal}
                  stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}

            {data.map((_, i) => {
              const startX = i * colWidth + (colWidth - pairW) / 2;
              return (
                <React.Fragment key={`p-rail-g-${i}`}>
                  <Rect x={startX} y={plotTop} width={singleBarW} height={barMaxH} rx={singleBarW / 2} ry={singleBarW / 2} fill={isDark ? '#18181b' : '#ffffff'} />
                  <Rect x={startX + singleBarW + barGap} y={plotTop} width={singleBarW} height={barMaxH} rx={singleBarW / 2} ry={singleBarW / 2} fill={isDark ? '#18181b' : '#ffffff'} />
                  <Rect x={startX} y={plotTop} width={singleBarW} height={barMaxH} rx={singleBarW / 2} ry={singleBarW / 2} fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'} />
                  <Rect x={startX + singleBarW + barGap} y={plotTop} width={singleBarW} height={barMaxH} rx={singleBarW / 2} ry={singleBarW / 2} fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'} />
                </React.Fragment>
              );
            })}

            {data.map((d, i) => {
              const startX = i * colWidth + (colWidth - pairW) / 2;
              const h1 = Math.max((d.am / 100) * barMaxH, 6);
              const h2 = Math.max((d.pm / 100) * barMaxH, 6);
              const isSel = i === activeIndex;

              return (
                <React.Fragment key={`bars-${i}`}>
                  <Rect x={startX} y={axisY - h1} width={singleBarW} height={h1} rx={singleBarW / 2} ry={singleBarW / 2} fill="#937abd" opacity={isSel ? 1 : 0.4} />
                  <Rect x={startX + singleBarW + barGap} y={axisY - h2} width={singleBarW} height={h2} rx={singleBarW / 2} ry={singleBarW / 2} fill="#d6cbe8" opacity={isSel ? 1 : 0.4} />
                </React.Fragment>
              );
            })}

            <Line x1={0} y1={axisY + 0.5} x2={plotW} y2={axisY + 0.5} stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} />
          </Svg>

          <View pointerEvents="none" style={[styles.tooltipBox, { left: tipLeft, top: tipTop, width: tooltipW, backgroundColor: isDark ? '#ffffff' : '#09090b' }]}>
            <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
              AM: {data[activeIndex].am}% | PM: {data[activeIndex].pm}%
            </Text>
          </View>

          <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
            {data.map((d, i) => (
              <View key={`day-${i}`} style={{ width: colWidth, alignItems: 'center' }}>
                <Text style={[styles.xAxisLabel, { color: i === activeIndex ? (isDark ? '#fff' : '#000') : colors.textSecondary, fontWeight: i === activeIndex ? '800' : '600' }]}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ROTATED STACKED BAR CHART (Daily Skincare Layers)
// ─────────────────────────────────────────────────────────────────────────────
function RotatedStackedBarChart({
  isDark,
  colors,
  width,
  height,
}: {
  isDark: boolean;
  colors: any;
  width: number;
  height: number;
}) {
  const data = [
    { label: 'Mon', layer1: 1, layer2: 1, layer3: 1 },
    { label: 'Tue', layer1: 1, layer2: 2, layer3: 1 },
    { label: 'Wed', layer1: 1, layer2: 1, layer3: 0 },
    { label: 'Thu', layer1: 1, layer2: 1, layer3: 1 },
    { label: 'Fri', layer1: 1, layer2: 2, layer3: 1 },
    { label: 'Sat', layer1: 1, layer2: 1, layer3: 0 },
    { label: 'Sun', layer1: 1, layer2: 2, layer3: 1 },
  ];
  const maxSteps = 4;
  const layerColors = ['#937abd', '#b9a6d6', '#d6cbe8'];

  const [activeIndex, setActiveIndex] = useState(1);

  const paddingH = 20;
  const headerH = 46;
  const yAxisW = 24;
  const yAxisGap = 8;
  const bottomLabelsH = 28;

  const plotW = width - paddingH * 2 - yAxisW - yAxisGap;
  const barMaxH = height - headerH - bottomLabelsH - 30;
  const plotTop = headerH + 10;
  const axisY = plotTop + barMaxH;

  const colWidth = plotW / data.length;
  const barW = Math.min(colWidth * 0.52, 42);

  const yTicks = [4, 3, 2, 1, 0];
  const tooltipW = 86;

  const dailyTotals = data.map((d) => d.layer1 + d.layer2 + d.layer3);
  const activeCenterX = activeIndex * colWidth + colWidth / 2;
  const totalSteps = dailyTotals[activeIndex];
  const activeH = Math.max((totalSteps / maxSteps) * barMaxH, 10);
  const activeTopY = axisY - activeH;

  const rawLeft = activeCenterX - tooltipW / 2;
  const tipLeft = Math.min(Math.max(rawLeft, 4), plotW - tooltipW - 4);
  const tipTop = activeTopY >= 40 ? activeTopY - 40 : activeTopY + 8;
  const tailLeft = Math.min(Math.max(activeCenterX - tipLeft - 5, 8), tooltipW - 18);

  return (
    <View style={{ width, height, paddingHorizontal: paddingH, paddingTop: 14 }}>
      <View style={styles.chartHeaderRow}>
        <Text style={[styles.chartTitleText, { color: colors.text }]}>Daily Skincare Layers</Text>
        <View style={[styles.unitPill, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
          <Text style={[styles.unitText, { color: colors.textSecondary }]}>layers</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={[styles.yAxisCol, { height: barMaxH + plotTop }]}>
          {yTicks.map((t, i) => {
            const yPos = plotTop + (i / (yTicks.length - 1)) * barMaxH;
            return (
              <Text key={`y-${i}`} style={[styles.yTickText, { color: colors.textSecondary, top: yPos - 7 }]}>
                {t}
              </Text>
            );
          })}
        </View>

        <Pressable
          onPress={(e) => {
            const idx = Math.min(data.length - 1, Math.max(0, Math.floor(e.nativeEvent.locationX / colWidth)));
            setActiveIndex(idx);
          }}
          style={{ width: plotW, height: height - headerH, position: 'relative' }}
        >
          <Svg width={plotW} height={height - headerH}>
            <Defs>
              {data.map((_, col) => {
                const x = col * colWidth + (colWidth - barW) / 2;
                const total = dailyTotals[col];
                const totalH = Math.max((total / maxSteps) * barMaxH, 8);
                return (
                  <ClipPath key={`clip-${col}`} id={`rStackClip-${col}`}>
                    <Rect x={x} y={axisY - totalH} width={barW} height={totalH} rx={barW / 2} ry={barW / 2} />
                  </ClipPath>
                );
              })}
            </Defs>

            {/* Dashed lines (hidden on bottom baseline 0) */}
            {yTicks.map((_, i) => {
              if (i === yTicks.length - 1) return null;
              const yVal = plotTop + (i / (yTicks.length - 1)) * barMaxH;
              return (
                <Line
                  key={`dash-${i}`}
                  x1={0}
                  y1={yVal}
                  x2={plotW}
                  y2={yVal}
                  stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Opaque mask + grey background rails — hides dashed line behind bars */}
            {data.map((_, i) => {
              const x = i * colWidth + (colWidth - barW) / 2;
              return (
                <React.Fragment key={`s-rail-g-${i}`}>
                  <Rect x={x} y={plotTop} width={barW} height={barMaxH} rx={barW / 2} ry={barW / 2} fill={isDark ? '#18181b' : '#ffffff'} />
                  <Rect x={x} y={plotTop} width={barW} height={barMaxH} rx={barW / 2} ry={barW / 2} fill={isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f3'} />
                </React.Fragment>
              );
            })}

            {/* Stacked capsules touching seamlessly with ZERO gap */}
            {data.map((d, col) => {
              const x = col * colWidth + (colWidth - barW) / 2;
              const isSel = col === activeIndex;
              const layers = [d.layer1, d.layer2, d.layer3];

              let cumulativeSteps = 0;
              return (
                <G key={`stacked-col-${col}`} clipPath={`url(#rStackClip-${col})`}>
                  {layers.map((val, sIdx) => {
                    if (val <= 0) return null;
                    const segH = (val / maxSteps) * barMaxH;
                    const bottomY = axisY - (cumulativeSteps / maxSteps) * barMaxH;
                    const topY = bottomY - segH;
                    cumulativeSteps += val;

                    return (
                      <Rect
                        key={`seg-${col}-${sIdx}`}
                        x={x}
                        y={topY}
                        width={barW}
                        height={segH + 0.5}
                        fill={layerColors[sIdx]}
                        opacity={isSel ? 1 : 0.4}
                      />
                    );
                  })}
                </G>
              );
            })}

            <Line x1={0} y1={axisY + 0.5} x2={plotW} y2={axisY + 0.5} stroke={isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} />
          </Svg>

          <View pointerEvents="none" style={[styles.tooltipBox, { left: tipLeft, top: tipTop, width: tooltipW, backgroundColor: isDark ? '#ffffff' : '#09090b' }]}>
            <Text style={[styles.tooltipText, { color: isDark ? '#09090b' : '#ffffff' }]}>
              {totalSteps} / {maxSteps} layers
            </Text>
            <View style={[styles.tooltipTail, { left: tailLeft, backgroundColor: isDark ? '#ffffff' : '#09090b', bottom: -4 }]} />
          </View>

          <View style={[styles.xAxisRow, { top: axisY + 8 }]}>
            {data.map((d, i) => (
              <View key={`day-${i}`} style={{ width: colWidth, alignItems: 'center' }}>
                <Text style={[styles.xAxisLabel, { color: i === activeIndex ? (isDark ? '#fff' : '#000') : colors.textSecondary, fontWeight: i === activeIndex ? '800' : '600' }]}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    position: 'relative',
    zIndex: 10,
  },
  circularBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 2,
  },
  centerTitleWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  portraitCard: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  rotatedContentWrapper: {
    transform: [{ rotate: '90deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartTitleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  },
  yAxisCol: {
    width: 24,
    marginRight: 8,
    position: 'relative',
    paddingHorizontal: 0,
  },
  yTickText: {
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
    textAlign: 'left',
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
  rowLabel: {
    fontSize: 12,
    textAlign: 'right',
  },
  tooltipBox: {
    position: 'absolute',
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
  tooltipTail: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
});
