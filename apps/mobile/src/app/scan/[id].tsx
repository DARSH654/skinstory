import React, { useRef, useState, useEffect } from "react";
import {
  View, StyleSheet, ScrollView, Pressable,
  useWindowDimensions, Image, TextInput, FlatList, Animated as RNAnimated,
} from "react-native";
import { Text } from "@/components/AppText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check, Lightbulb, Zap, Sparkles } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import Animated, {
  useSharedValue, withTiming, useAnimatedProps, useAnimatedStyle,
  useAnimatedScrollHandler, interpolate, Extrapolate, Easing,
} from "react-native-reanimated";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import ConnectingDots from "@/components/ConnectingDots";
import { MOCK_SCANS } from "@/constants/mockScans";
import LottieView from "lottie-react-native";
import fireAnimation from "../../../assets/animations/fire.json";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const INFO_H = 330;

const METRIC_NAMES = [
  { name: "Forehead",  accent: "#a855f7" },
  { name: "Nose",      accent: "#ec4899" },
  { name: "Chin",      accent: "#14b8a6" },
  { name: "L Cheek",   accent: "#f59e0b" },
  { name: "R Cheek",   accent: "#10b981" },
  { name: "Jawline",   accent: "#3b82f6" },
  { name: "T-Zone",    accent: "#6366f1" },
  { name: "U-Zone",    accent: "#8b5cf6" },
  { name: "Under Eye", accent: "#ef4444" },
];

const getMetricScores = (o: number) => [
  Math.min(95,Math.max(40,o-4)), Math.min(92,Math.max(40,o-8)),
  Math.min(94,Math.max(40,o-2)), Math.min(96,Math.max(40,o+2)),
  Math.min(98,Math.max(40,o+4)), Math.min(99,Math.max(40,o+6)),
  Math.min(91,Math.max(40,o-7)), Math.min(95,Math.max(40,o-1)),
  Math.min(88,Math.max(40,o-10)),
];

const getSkinGuidance = (score: number, status: string) =>
  score >= 85 ? '"' + status + ': Your skin is absolutely glowing. Keep up the consistency!"'
  : score >= 75 ? '"' + status + ': Looking great! A little more hydration and you will be flawless."'
  : '"' + status + ': Your skin needs some love. Stick to your routine and rest well tonight."';

// ── Animated Card Wrapper ───────────────────────────────────────────────────
function AnimatedCardWrapper({
  index, scrollX, isLast, children,
}: { index: number; scrollX: Animated.SharedValue<number>; isLast: boolean; children: React.ReactNode }) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_GAP     = 14;
  const CARD_WIDTH   = SCREEN_WIDTH - 52;
  const CARD_ITEM    = CARD_WIDTH + CARD_GAP;

  const animStyle = useAnimatedStyle(() => {
    const dist = Math.abs(scrollX.value - index * CARD_ITEM);
    const scale = interpolate(dist, [0, CARD_ITEM], [1, 0.97], Extrapolate.CLAMP);
    return { transform: [{ scale }] };
  });
  return (
    <Animated.View style={[{ width: CARD_WIDTH, marginRight: isLast ? 0 : CARD_GAP }, animStyle]}>
      {children}
    </Animated.View>
  );
}

// ── Animated Metric Node ──────────────────────────────────────────────────────
function AnimatedMetricNode({ metric, isDark, pageWidth }: {
  metric: { id: string; name: string; score: number; accent: string };
  isDark: boolean; pageWidth: number;
}) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [metric.score]);
  const animArc  = useAnimatedProps(() => ({ strokeDashoffset: circumference*(1-progress.value*metric.score/100) }));
  const animText = useAnimatedProps(() => ({ text: Math.round(progress.value*metric.score)+"%", defaultValue: Math.round(progress.value*metric.score)+"%" }));
  return (
    <View style={{ alignItems:"center", width:(pageWidth-20)/3 }}>
      <View style={{ width:80, height:80, alignItems:"center", justifyContent:"center" }}>
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Defs>
            <LinearGradient id={"sdM-"+metric.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#937abd"/><Stop offset="100%" stopColor="#d6cbe8"/>
            </LinearGradient>
          </Defs>
          <Circle cx="40" cy="40" r={radius} fill="none" stroke={isDark?"rgba(147,122,189,0.2)":"#e8e3f1"} strokeWidth={7}/>
          <AnimatedCircle cx="40" cy="40" r={radius} fill="none" stroke={"url(#sdM-"+metric.id+")"} strokeWidth={7} strokeDasharray={circumference} strokeLinecap="round" transform="rotate(-90 40 40)" animatedProps={animArc}/>
        </Svg>
        <AnimatedTextInput animatedProps={animText} editable={false} underlineColorAndroid="transparent"
          style={{ position:"absolute", color:isDark?"#ffffff":"#1a1a1a", fontSize:14, fontWeight:"600", textAlign:"center", padding:0, margin:0, backgroundColor:"transparent", minWidth:44 }}/>
      </View>
      <Text style={{ color:isDark?"#ffffff":"#1a1a1a", fontSize:13, fontWeight:"700", marginTop:8, textAlign:"center" }}>{metric.name}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ScanDetailScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const PAGE_WIDTH   = SCREEN_WIDTH - 40;
  const CARD_GAP     = 14;
  const CARD_WIDTH   = SCREEN_WIDTH - 52;
  const CARD_ITEM    = CARD_WIDTH + CARD_GAP;
  const CARD_PEEK    = (SCREEN_WIDTH - CARD_WIDTH) / 2;

  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const insets  = useSafeAreaInsets();

  const scan        = MOCK_SCANS.find(s => s.id === id) ?? MOCK_SCANS[0];
  const scoreVal    = scan.score;
  const guidance    = getSkinGuidance(scoreVal, scan.status);
  const metricScores = getMetricScores(scoreVal);

  const metricsPages = [
    [
      { id:"1", name:METRIC_NAMES[0].name, score:metricScores[0], accent:METRIC_NAMES[0].accent },
      { id:"2", name:METRIC_NAMES[1].name, score:metricScores[1], accent:METRIC_NAMES[1].accent },
      { id:"3", name:METRIC_NAMES[2].name, score:metricScores[2], accent:METRIC_NAMES[2].accent },
    ],
    [
      { id:"4", name:METRIC_NAMES[3].name, score:metricScores[3], accent:METRIC_NAMES[3].accent },
      { id:"5", name:METRIC_NAMES[4].name, score:metricScores[4], accent:METRIC_NAMES[4].accent },
      { id:"6", name:METRIC_NAMES[5].name, score:metricScores[5], accent:METRIC_NAMES[5].accent },
    ],
    [
      { id:"7", name:METRIC_NAMES[6].name, score:metricScores[6], accent:METRIC_NAMES[6].accent },
      { id:"8", name:METRIC_NAMES[7].name, score:metricScores[7], accent:METRIC_NAMES[7].accent },
      { id:"9", name:METRIC_NAMES[8].name, score:metricScores[8], accent:METRIC_NAMES[8].accent },
    ],
  ];

  const [metricPage, setMetricPage] = useState(0);
  const metricFlatRef = useRef<FlatList>(null);
  const metricScrollX = useSharedValue(0);
  const metricScrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      metricScrollX.value = e.contentOffset.x;
    },
  });

  const [cardPage, setCardPage] = useState(0);
  const [answers, setAnswers]   = useState<Record<string,string>>({});
  const setAnswer = (k: string, v: string) =>
    setAnswers(prev => {
      const next = { ...prev };
      if (next[k] === v) {
        delete next[k];
      } else {
        next[k] = v;
      }
      return next;
    });

  // Score arc animation
  const radius = 90;
  const circumference = 2*Math.PI*radius;
  const progress = useSharedValue(0);
  const opacity  = useSharedValue(0);
  React.useEffect(() => {
    progress.value = 0; opacity.value = 0;
    opacity.value  = withTiming(1, { duration:250 });
    progress.value = withTiming(1, { duration:1100, easing:Easing.out(Easing.cubic) });
  }, [scoreVal]);
  const animArc   = useAnimatedProps(() => ({ strokeDashoffset: circumference*(1-progress.value*scoreVal/100) }));
  const animScore = useAnimatedProps(() => ({ text:""+Math.round(progress.value*scoreVal), defaultValue:""+Math.round(progress.value*scoreVal) }));
  const animOpacity = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // Card scroll-driven animation
  const cardScrollX = useSharedValue(0);
  const cardScrollHandler = useAnimatedScrollHandler({ onScroll: e => { cardScrollX.value = e.contentOffset.x; } });

  const insights = [
    scoreVal < 75 ? "Increased inflammation detected around key facial zones." : "Skin barrier integrity is holding strong across most zones.",
    metricScores[0] < 75 ? "Forehead zone shows elevated stress markers — check hydration." : "Forehead zone looks clear and well-balanced.",
    metricScores[1] < 75 ? "Nose area showing mild congestion — pore cleansing recommended." : "Nose and T-Zone pores appear calm and minimally congested.",
    metricScores[2] < 75 ? "Chin zone showing dryness — apply extra moisturiser tonight." : "Chin and jawline show good sebum balance — keep it up.",
  ];

  const insightProTip = scoreVal >= 80
    ? "Double-cleanse once a week to keep pores clear and your barrier strong."
    : "Prioritise sleep tonight — your skin regenerates up to 3× faster during deep sleep.";

  const focusProTip = scoreVal >= 80
    ? "Consistency is your superpower. Even one missed step slows progress."
    : "Start small: just one intentional habit today is better than zero.";

  const focusActions = [
    scoreVal < 75
      ? "Apply a calming barrier-repair serum before sleeping tonight."
      : "Layer your active antioxidant serum before daily moisturiser.",
    metricScores[0] < 75
      ? "Hydrate forehead zone: drink 2 extra glasses of water today."
      : "Maintain balanced hydration levels throughout your day.",
    metricScores[1] < 75
      ? "Double-cleanse T-Zone tonight to clear minor congestion."
      : "Never skip your broad-spectrum SPF 50+ sunscreen tomorrow.",
    scoreVal < 80
      ? "Aim for 8 hours of sleep — barrier repair peaks during deep rest."
      : "Lock in your progress by following both AM & PM routine steps.",
  ];


  const compliment = scoreVal >= 85
    ? { headline: "You are glowing today.", sub: "Your skin barrier is in peak condition. Your consistency with routines is clearly paying off — keep doing exactly what you are doing." }
    : scoreVal >= 75
    ? { headline: "Looking really good.", sub: "Your skin is in solid shape. A little extra hydration and one full night of good sleep will push your score even higher." }
    : { headline: "Your skin is recovering.", sub: "Every journey has dips. Your score of " + scoreVal + " is just a checkpoint, not a destination. Rest, hydrate, and trust your routine." };

  const todayFocus = scoreVal >= 80
    ? "Apply your serum before bed tonight and do not skip sunscreen tomorrow morning."
    : scoreVal >= 70
    ? "Drink 2 full glasses of water right now, and do a 5-minute gentle cleanse tonight."
    : "Sleep early tonight — aim for 8 hours. Your skin repairs itself only during deep sleep.";

  const bg   = isDark ? "#18181b" : "#ffffff";
  const bdr  = isDark ? "#27272a" : "#e5e7eb";
  const tp   = isDark ? "#ffffff" : "#111827";
  const ts   = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.55)";

  const CARD_TYPES = [
    "insights",
    "q_stress",
    "q_water",
    "q_sleep",
    "q_junk",
    "focus",
    "routine",
    "compliment",
  ];

  const CARD_H = 400;

  const renderHighlightTitle = (prefix: string, highlight: string, marginBottom: number = 14, centered: boolean = false, fontSize: number = 22) => {
    const stripeColor = isDark ? "rgba(147, 122, 189, 0.45)" : "#d6cbe8";
    return (
      <View style={[s.highlightRow, { marginBottom }, centered && { justifyContent: "center" }]}>
        <Text style={[s.cardTitle, { color: tp, fontSize }]}>{prefix}</Text>
        <View style={s.highlightWrapper}>
          <View style={[s.highlightStripe, { backgroundColor: stripeColor, height: Math.max(8, fontSize * 0.38) }]} />
          <Text style={[s.cardTitle, { color: tp, fontSize }]}>{highlight}</Text>
        </View>
      </View>
    );
  };

  const render3DOption = (
    key: string,
    label: string,
    isSelected: boolean,
    onPress: () => void,
    height: number = 48,
    marginBottom: number = 10
  ) => {
    const primaryColor = "#937abd";
    // ── LIGHT MODE ──────────────────────────────────────────────────────────
    // Unselected: pure white face, near-black (#111111) border + shadow → clear contrast
    // Selected:   light lavender face (#f0ebf8), medium-purple border (#937abd),
    //             dark-purple shadow (#735b9c) → face is MUCH lighter than shadow → depth reads
    //
    // ── DARK MODE ───────────────────────────────────────────────────────────
    // Unselected: dark face (#2c2c31), near-white border + shadow (0.80 opacity) → mirrors light
    // Selected:   SOLID rich purple face (#6b4ea6) so it pops
    //             VERY DEEP shadow (#2a1c4e) — much darker than the face → clear depth, premium feel
    //             BRIGHT rim border (#b08edc) — lighter than the face → glowing highlight edge
    //             (Same depth relationship as light: light face / dark shadow, just inverted palette)
    const currentShadowColor = isSelected
      ? (isDark ? "#4e2d8a" : "#735b9c")
      : (isDark ? "rgba(255,255,255,0.80)" : "#111111");
    const currentBorderColor = isSelected
      ? (isDark ? "#cdb4f0" : primaryColor)
      : (isDark ? "rgba(255,255,255,0.80)" : "#111111");
    const topBg = isSelected
      ? (isDark ? "#937abd" : "#f0ebf8")
      : (isDark ? "#2c2c31" : "#ffffff");
    const textColor = isDark ? "#ffffff" : "#111111";

    return (
      <View key={key} style={[s.option3DContainer, { height, marginBottom }]}>
        <Pressable style={s.pressableArea} onPress={onPress}>
          {({ pressed }) => (
            <>
              <View style={[s.optionShadow, { backgroundColor: currentShadowColor }]} />
              <View
                style={[
                  s.optionMid,
                  {
                    borderColor: currentShadowColor,
                    top: pressed ? 1 : 1.5,
                    left: pressed ? 1 : 1.5,
                  },
                ]}
              />
              <View
                style={[
                  s.optionTop,
                  {
                    backgroundColor: topBg,
                    borderColor: currentBorderColor,
                    top: pressed ? 2 : 0,
                    left: pressed ? 2 : 0,
                  },
                ]}
              >
                <View style={s.optionRow}>
                  <Text style={[s.pillText, { color: textColor }]}>{label}</Text>
                  {isSelected && (
                    <Check size={22} color={textColor} strokeWidth={3.5} />
                  )}
                </View>
              </View>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  const renderCard = (type: string) => {
    if (type === "insights") {
      const bulletBorder = isDark ? "rgba(255,255,255,0.75)" : "#111111";
      return (
        <View style={[s.card, { height:CARD_H, backgroundColor:bg, borderColor:bdr }]}>
          {/* Title — bigger than default cardTitle */}
          {renderHighlightTitle("Skin ", "Insights", 12, false, 25)}
          {/* 4 bullet points — flex:1 so they fill the middle, gap tightened to leave room for pill */}
          <View style={{ flex: 1, gap: 10, justifyContent: "center" }}>
            {insights.map((ins, i) => (
              <View key={i} style={{ flexDirection:"row", alignItems:"flex-start", gap:10 }}>
                {/* Bullet circle: purple fill + mode-aware border ring */}
                <View style={{
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: "#937abd",
                  borderWidth: 1.5,
                  borderColor: bulletBorder,
                  marginTop: 7,
                  flexShrink: 0,
                }}/>
                <Text style={{ flex:1, fontSize:15, lineHeight:22, fontWeight:"600", color:ts }}>{ins}</Text>
              </View>
            ))}
          </View>
          {/* ProTip pill — anchored at bottom with 1.8px border */}
          <View style={[s.proTipPill, {
            backgroundColor: isDark ? "rgba(147,122,189,0.12)" : "rgba(147,122,189,0.08)",
            borderColor:     isDark ? "rgba(255,255,255,0.75)" : "#111111",
            borderWidth:     1.8,
          }]}>
            {/* App UI styled bulb icon badge: black/white border + primary background */}
            <View style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: isDark ? "#937abd" : "#d6cbe8",
              borderWidth: 1.5,
              borderColor: isDark ? "#ffffff" : "#111111",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}>
              <Lightbulb size={14} color={isDark ? "#ffffff" : "#111111"} strokeWidth={2.5} />
            </View>
            <Text style={[s.proTipBody, { color: ts, fontSize: 14, lineHeight: 20, flex: 1 }]}>
              <Text style={{ fontWeight: "800", color: tp }}>Pro Tip: </Text>
              {insightProTip}
            </Text>
          </View>
        </View>
      );
    }

    // ── 4 Lifestyle Question Cards — shared renderer ──
    const QUESTIONS: Record<string, { prefix: string; highlight: string; subtitle: string; ansKey: string; options: string[] }> = {
      q_stress: {
        prefix: "Stress ", highlight: "Check",
        subtitle: "How stressed have you been today?",
        ansKey: "q_stress",
        options: ["Completely calm & relaxed","Mild stress, manageable","Moderately stressed","Quite stressed today","Extremely overwhelmed"],
      },
      q_water: {
        prefix: "Water ", highlight: "Intake",
        subtitle: "How much water have you had today?",
        ansKey: "q_water",
        options: ["Less than 500ml","Around 1L","Around 1.5L","Around 2L","More than 2L"],
      },
      q_sleep: {
        prefix: "Sleep ", highlight: "Quality",
        subtitle: "How was your sleep last night?",
        ansKey: "q_sleep",
        options: ["Less than 5 hours","5–6 hours, restless","6–7 hours, okay","7–8 hours, good","8+ hours, excellent"],
      },
      q_junk: {
        prefix: "Today's ", highlight: "Diet",
        subtitle: "How clean was your diet today?",
        ansKey: "q_junk",
        options: ["Ate a lot of junk food","Mostly junk, some healthy","Mix of both","Mostly healthy","Very clean diet"],
      },
    };

    if (type in QUESTIONS) {
      const q     = QUESTIONS[type];
      const sel   = answers[q.ansKey] || null;
      const INNER_H = CARD_H - 44 - 50 - 36;
      const optH    = Math.floor(INNER_H / q.options.length) - 6;

      return (
        <View style={[s.card, { height:CARD_H, backgroundColor:bg, borderColor:bdr }]}>
          {renderHighlightTitle(q.prefix, q.highlight, 8)}
          <Text style={{ fontSize:14, fontWeight:"600", color:ts, marginBottom:16 }}>
            {q.subtitle}
          </Text>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            {q.options.map((item, idx) => (
              <View
                key={item}
                style={{
                  flex: 1,
                  marginBottom: idx === q.options.length - 1 ? 0 : 10,
                }}
              >
                {render3DOption(item, item, sel === item, () => setAnswer(q.ansKey, item), optH, 0)}
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (type === "focus") {
      const bulletBorder = isDark ? "rgba(255,255,255,0.75)" : "#111111";
      return (
        <View style={[s.card, { height:CARD_H, backgroundColor:bg, borderColor:bdr }]}>
          {/* Title — same height and font size as Skin Insights */}
          {renderHighlightTitle("Today's ", "Focus", 12, false, 25)}
          {/* Action pointers — flex:1 with same flexible vertical distribution */}
          <View style={{ flex: 1, gap: 10, justifyContent: "center" }}>
            {focusActions.map((action, i) => (
              <View key={i} style={{ flexDirection:"row", alignItems:"flex-start", gap:10 }}>
                {/* Bullet circle: purple fill + mode-aware border ring */}
                <View style={{
                  width: 10, height: 10, borderRadius: 5,
                  backgroundColor: "#937abd",
                  borderWidth: 1.5,
                  borderColor: bulletBorder,
                  marginTop: 7,
                  flexShrink: 0,
                }}/>
                <Text style={{ flex:1, fontSize:15, lineHeight:22, fontWeight:"600", color:ts }}>{action}</Text>
              </View>
            ))}
          </View>
          {/* ProTip pill — anchored at bottom with exact same UI */}
          <View style={[s.proTipPill, {
            backgroundColor: isDark ? "rgba(147,122,189,0.12)" : "rgba(147,122,189,0.08)",
            borderColor:     isDark ? "rgba(255,255,255,0.75)" : "#111111",
            borderWidth:     1.8,
          }]}>
            {/* App UI styled bulb icon badge: black/white border + primary background */}
            <View style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: isDark ? "#937abd" : "#d6cbe8",
              borderWidth: 1.5,
              borderColor: isDark ? "#ffffff" : "#111111",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}>
              <Lightbulb size={14} color={isDark ? "#ffffff" : "#111111"} strokeWidth={2.5} />
            </View>
            <Text style={[s.proTipBody, { color: ts, fontSize: 14, lineHeight: 20, flex: 1 }]}>
              <Text style={{ fontWeight: "800", color: tp }}>Pro Tip: </Text>
              {focusProTip}
            </Text>
          </View>
        </View>
      );
    }

    if (type === "routine") {
      const routineOptions = [
        { label:"Morning & evening routine", value:"Morning & Evening" },
        { label:"Morning routine only", value:"Morning" },
        { label:"Evening routine only", value:"Evening" },
        { label:"Morning, evening & night routine", value:"Morning, Evening & Night" },
        { label:"No - Skipped routine today", value:"No" },
      ];
      const sel = answers["q_routine"] || null;

      // 5 options — compute dynamic height same as question cards
      const INNER_H = CARD_H - 44 - 50 - 36;
      const optH    = Math.floor(INNER_H / routineOptions.length) - 6;

      return (
        <View style={[s.card, { height:CARD_H, backgroundColor:bg, borderColor:bdr }]}>
          {renderHighlightTitle("Routine ", "Compliance", 8)}
          <Text style={{ fontSize:14, fontWeight:"600", color:ts, marginBottom:16 }}>
            {"Are you following your skincare routine today?"}
          </Text>
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            {routineOptions.map((opt, idx) => (
              <View
                key={opt.value}
                style={{
                  flex: 1,
                  marginBottom: idx === routineOptions.length - 1 ? 0 : 10,
                }}
              >
                {render3DOption(opt.value, opt.label, sel === opt.value, () => setAnswer("q_routine", opt.value), optH, 0)}
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (type === "compliment") return (
      <View style={[s.card, { height:CARD_H, backgroundColor:bg, borderColor:bdr, padding: 22 }]}>
        {/* Top Left: outer square with thick black border, inner circle with black border */}
        <View style={{ flexDirection: "row", justifyContent: "flex-start", marginBottom: 16 }}>
          <View style={{
            width: 82,
            height: 82,
            borderRadius: 24,
            backgroundColor: isDark ? "rgba(147,122,189,0.18)" : "#f0ebf8",
            borderWidth: 2.5,
            borderColor: isDark ? "#ffffff" : "#111111",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Inner circle — also with black border */}
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: isDark ? "rgba(147,122,189,0.35)" : "#e4d9f7",
              borderWidth: 1.5,
              borderColor: isDark ? "#ffffff" : "#111111",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Sparkles size={26} color={isDark ? "#d6cbe8" : "#937abd"} strokeWidth={2} fill={isDark ? "#937abd" : "#c9b8f0"} />
            </View>
          </View>
        </View>

        {/* Daily Reflection title */}
        {renderHighlightTitle("Daily ", "Reflection", 14, false, 22)}

        {/* The real compliment — no truncation, fills the space */}
        <Text style={{ fontSize: 28, fontWeight: "800", color: tp, lineHeight: 36, letterSpacing: -0.6 }}>
          {compliment.sub}
        </Text>
      </View>
    );

    return null;
  };

  return (
    <View style={[s.root, { backgroundColor:isDark?"#121212":"#f5f5f7" }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:insets.bottom+32 }}>

        {/* ── HERO ── */}
        <View style={{ paddingTop:insets.top+10, paddingHorizontal:20, paddingBottom:8 }}>

          {/* Back + streak */}
          <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <Pressable onPress={()=>router.back()} style={[s.backBtn,{ backgroundColor:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.06)" }]}>
              <ArrowLeft size={20} color={isDark?"#ffffff":"#1a1a1a"}/>
            </Pressable>
            <View style={[s.streakPill,{ backgroundColor:isDark?"#000000":"#ffffff", borderColor:isDark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)" }]}>
              <LottieView source={fireAnimation} autoPlay loop speed={1.5} style={{ width:21, height:21, backgroundColor:"transparent" }}/>
              <Text style={[s.streakTxt,{ color:isDark?"#ffffff":"#1a1a1a" }]}>{"Day 5"}</Text>
            </View>
          </View>

          {/* Guidance */}
          <View style={{ alignItems:"center", marginBottom:4 }}>
            <View style={[s.tagPill,{ backgroundColor:isDark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.05)" }]}>
              <Text style={[s.tagText,{ color:isDark?"#ffffff":"#1a1a1a" }]}>{"TODAY'S GUIDANCE · "+scan.skinType.toUpperCase()}</Text>
            </View>
            <Text style={[s.guidanceText,{ color:isDark?"#ffffff":"#1a1a1a" }]}>{guidance}</Text>
          </View>

          {/* Score Arc */}
          <View style={{ alignItems:"center", justifyContent:"center", width:240, height:240, alignSelf:"center", marginVertical:16 }}>
            <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position:"absolute" }}>
              <Defs>
                <LinearGradient id="sdScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#937abd"/><Stop offset="100%" stopColor="#d6cbe8"/>
                </LinearGradient>
              </Defs>
              <Circle cx="120" cy="120" r={radius} fill="none" stroke={isDark?"rgba(147,122,189,0.2)":"#e8e3f1"} strokeWidth={16}/>
              <AnimatedCircle cx="120" cy="120" r={radius} fill="none" stroke="url(#sdScoreGrad)" strokeWidth={16} strokeDasharray={circumference} strokeLinecap="round" transform="rotate(-90 120 120)" animatedProps={animArc}/>
            </Svg>
            <View style={{ alignItems:"center", justifyContent:"center" }}>
              <AnimatedTextInput animatedProps={animScore} editable={false} underlineColorAndroid="transparent"
                style={[{ color:isDark?"#ffffff":"#1a1a1a", fontSize:72, fontWeight:"300", lineHeight:80, textAlign:"center", padding:0, margin:0, minWidth:120, backgroundColor:"transparent" }, animOpacity]}/>
              <Text style={{ color:isDark?"rgba(255,255,255,0.6)":"rgba(0,0,0,0.5)", fontSize:13, fontWeight:"400", marginTop:5 }}>{"Overall Skin Score"}</Text>
            </View>
          </View>

          {/* 3-3-3 Metric Slider */}
          <Animated.FlatList
            ref={metricFlatRef as any}
            data={metricsPages}
            keyExtractor={(_,i)=>i.toString()}
            horizontal
            pagingEnabled
            snapToInterval={PAGE_WIDTH}
            snapToAlignment="center"
            decelerationRate="fast"
            disableIntervalMomentum={true}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={metricScrollHandler}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            getItemLayout={(_,index)=>({ length:PAGE_WIDTH, offset:PAGE_WIDTH*index, index })}
            onMomentumScrollEnd={e=>{
              const idx=Math.round(e.nativeEvent.contentOffset.x/PAGE_WIDTH);
              setMetricPage(Math.min(Math.max(idx,0),metricsPages.length-1));
            }}
            style={{ width:PAGE_WIDTH, flexGrow:0 }}
            renderItem={({ item })=>(
              <View style={{ width:PAGE_WIDTH, flexDirection:"row", justifyContent:"space-around", paddingHorizontal:4 }}>
                {item.map((metric: { id:string; name:string; score:number; accent:string })=>(
                  <AnimatedMetricNode key={metric.id} metric={metric} isDark={isDark} pageWidth={PAGE_WIDTH}/>
                ))}
              </View>
            )}
          />

          {/* Metric Connecting Dots */}
          <View style={s.dotsRow}>
            <ConnectingDots
              count={metricsPages.length}
              scrollX={metricScrollX}
              itemWidth={PAGE_WIDTH}
              isDark={isDark}
            />
          </View>
        </View>

        {/* ── PROGRESS BAR (Full width, 6/6 removed, reduced gap) ── */}
        <View style={{ marginTop:14, marginBottom:10, paddingHorizontal:20 }}>
          <View style={[s.trackBorder, { borderColor: isDark ? "#ffffff" : "#111111" }]}>
            <View style={[s.track, { backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#e8e8e8" }]}>
              <ExpoLinearGradient
                colors={["#d6cbe8", "#937abd"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.fill, { width: `${((cardPage + 1) / CARD_TYPES.length) * 100}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Full-width carousel with horizontal peek & vertical padding to prevent shadow/border clipping */}
        <Animated.ScrollView
          horizontal
          onScroll={cardScrollHandler}
          scrollEventThrottle={16}
          snapToInterval={CARD_ITEM}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum={true}
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={{ width: SCREEN_WIDTH }}
          contentContainerStyle={{ paddingHorizontal: CARD_PEEK, paddingVertical: 12 }}
          onMomentumScrollEnd={e => {
            const idx = Math.min(Math.max(Math.round(e.nativeEvent.contentOffset.x / CARD_ITEM), 0), CARD_TYPES.length - 1);
            setCardPage(idx);
          }}
        >
          {CARD_TYPES.map((type,i)=>(
            <AnimatedCardWrapper
              key={type}
              index={i}
              scrollX={cardScrollX}
              isLast={i === CARD_TYPES.length - 1}
            >
              {renderCard(type)}
            </AnimatedCardWrapper>
          ))}
        </Animated.ScrollView>

        {/* Card Connecting Dots */}
        <View style={[s.dotsRow, { marginTop:10, marginBottom:2 }]}>
          <ConnectingDots
            count={CARD_TYPES.length}
            scrollX={cardScrollX}
            itemWidth={CARD_ITEM}
            isDark={isDark}
          />
        </View>


        {/* ── CAPTURED IMAGE SECTION ── */}
        <View style={{ marginTop:24, paddingHorizontal:20 }}>
          <Text style={{ fontSize:20, fontWeight:"800", color:isDark?"#ffffff":"#1a1a1a", letterSpacing:-0.4, marginBottom:12 }}>
            {"Captured Image"}
          </Text>
          <View style={[s.capturedCard, { borderColor:bdr }]}>
            <Image source={scan.image} style={s.capturedImage} resizeMode="cover" />
            <View style={s.capturedDateBadge}>
              <Text style={s.capturedDateText}>{scan.date}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex:1 },
  backBtn: { width:40, height:40, borderRadius:20, alignItems:"center", justifyContent:"center" },
  streakPill: { flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:7, borderRadius:24, borderWidth:1 },
  streakTxt: { fontSize:15, fontWeight:"700" },
  tagPill: { paddingHorizontal:12, paddingVertical:5, borderRadius:12, marginBottom:8 },
  tagText: { fontSize:11, fontWeight:"800", letterSpacing:1.2, textTransform:"uppercase" },
  guidanceText: { fontSize:17, fontWeight:"800", textAlign:"center", lineHeight:23, fontStyle:"italic", paddingHorizontal:12 },
  dotsRow: { flexDirection:"row", justifyContent:"center", alignItems:"center", marginTop:10 },
  trackBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: 99,
    padding: 0.5,
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: '#e8e8e8',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  card: { borderRadius:24, borderWidth:1.5, padding:22, shadowColor:"#000", shadowOffset:{ width:0, height:2 }, shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  highlightRow: { flexDirection:"row", alignItems:"center" },
  highlightWrapper: { position:"relative", justifyContent:"center" },
  highlightStripe: { position:"absolute", bottom:2, left:-2, right:-2, height:8, borderRadius:2, zIndex:-1 },
  cardTitle: { fontSize:22, fontWeight:"800", letterSpacing:-0.4, includeFontPadding:false },
  cardBody:  { fontSize:16, lineHeight:24 },
  option3DContainer: {
    width: "100%",
    position: "relative",
  },
  pressableArea: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  optionShadow: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    position: "absolute",
    top: 3,
    left: 3,
  },
  optionMid: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  optionTop: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    position: "absolute",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 3,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  pillText: {
    fontSize: 16,
    fontWeight: "700",
  },
  capturedCard: {
    width: "100%",
    height: 420,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1.5,
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
  },
  capturedDateBadge: {
    position: "absolute",
    bottom: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  capturedDateText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  proTipPill: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  proTipLabel: {
    color: "#937abd",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  proTipBody: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
});