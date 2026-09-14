import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Text, TitleText, SubtitleText, BodyText } from '@/components/AppText';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Text as SvgText, G } from 'react-native-svg';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import OnboardingProgressBar from '@/components/OnboardingProgressBar';
import Native3DButton from '@/components/page7/Native3DButton';

const AnimatedCircleSVG = Animated.createAnimatedComponent(Circle);
const AnimatedGSVG      = Animated.createAnimatedComponent(G);
const AnimatedRectSVG   = Animated.createAnimatedComponent(Rect);

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

export default function OnboardingPage6b() {
  const { navigate } = useNavigationGuard();
  const navigation = useNavigation();

  const handleNext = useCallback(() => {
    navigate('/onboarding/page-7');
  }, [navigate]);

  // ─── Each element owns its own value. Zero chaining. Zero graph. ──────────
  const clipAnim       = useRef(new Animated.Value(0)).current;   // reveals curves
  const titleAnim      = useRef(new Animated.Value(0)).current;   // title fade+slide
  const dottedAnim     = useRef(new Animated.Value(0.25)).current;// grid lines
  const month1Anim     = useRef(new Animated.Value(0)).current;   // month1 label
  const brandAnim      = useRef(new Animated.Value(0)).current;   // skinstory brand
  const guessAnim      = useRef(new Animated.Value(0)).current;   // guess label
  const dot1Anim       = useRef(new Animated.Value(0)).current;   // month1 dot
  const dotTravelAnim  = useRef(new Animated.Value(0)).current;   // traveling dot
  const month6Anim     = useRef(new Animated.Value(0)).current;   // month6 label
  const text1Anim      = useRef(new Animated.Value(0)).current;   // bottom text 1
  const text2Anim      = useRef(new Animated.Value(0)).current;   // bottom text 2

  // Clip curtain: x position sweeps in exact lockstep with dotX so dot leads the line
  const clipRectX = dotTravelAnim.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, 42.96, 77.28, 105.12, 128.64, 150.0, 171.36, 194.88, 222.72, 257.04, 310],
  });

  // Title: faded (0.25) → fully visible (1), zero slide
  const titleOpacity = titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });

  // Month 1 label: opacity 0→1, translateX -12→0
  const month1Opacity  = month1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const month1SlideX   = month1Anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });

  // Brand: opacity 0→1, translateY 10→0
  const brandOpacity   = brandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const brandSlideY    = brandAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  // Guess yourself: opacity 0→1, translateY 8→0
  const guessOpacity   = guessAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const guessSlideY    = guessAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  // Month1 dot: radius 3→5, opacity 0→1
  const dot1Radius     = dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [3, 5] });
  const dot1Opacity    = dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // Traveling dot X and Y — exact 11-point bezier curve tracking for purple line
  const dotX = dotTravelAnim.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, 42.96, 77.28, 105.12, 128.64, 150.0, 171.36, 194.88, 222.72, 257.04, 300],
  });
  const dotY = dotTravelAnim.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [15, 18.92, 29.56, 45.24, 64.28, 85.0, 105.72, 124.76, 140.44, 151.08, 155],
  });

  // Month6 label: opacity 0→1, translateX -12→0
  const month6Opacity  = month6Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const month6SlideX   = month6Anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });

  // Bottom text lines
  const text1TranslateY = text1Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  const text2TranslateY = text2Anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  // ─── Animation chain ──────────────────────────────────────────────────────
  const startAnimations = useCallback(() => {
    // T=0ms: Clip curtain sweeps right revealing all curves (900ms)
    Animated.timing(clipAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // T=1ms: Rest follow immediately but in separate event loop ticks
    setTimeout(() => {
      Animated.timing(dotTravelAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 0);

    setTimeout(() => {
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 0);

    setTimeout(() => {
      Animated.timing(dottedAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 0);

    // T=160ms: Month 1 label slides in
    setTimeout(() => {
      Animated.timing(month1Anim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 160);

    // T=380ms: Month 1 dot appears
    setTimeout(() => {
      Animated.timing(dot1Anim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 380);

    // T=400ms: SkinStory brand slides up
    setTimeout(() => {
      Animated.timing(brandAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 400);

    // T=720ms: Guess yourself label appears
    setTimeout(() => {
      Animated.timing(guessAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 720);

    // T=900ms: Month 6 label appears after reveal completes
    setTimeout(() => {
      Animated.timing(month6Anim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 900);

    // T=1250ms: Bottom text line 1
    setTimeout(() => {
      Animated.timing(text1Anim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 1250);

    // T=1490ms: Bottom text line 2
    setTimeout(() => {
      Animated.timing(text2Anim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 1490);
  }, []);

  // Track whether we left toward the next screen so we can skip animation on return
  const didNavigateForward = useRef(false);
  // Prevent double-firing when both focus and transitionEnd fire on normal navigation
  const hasAnimated = useRef(false);
  // Whether a native transition is currently in progress
  const transitionActive = useRef(false);

  useEffect(() => {
    // Mark transition as active — prevents focus event from animating during slide-in
    const unsubTransitionStart = (navigation as any).addListener('transitionStart', () => {
      transitionActive.current = true;
    });

    // focus fires on hot reload (no transitionEnd fires then). Only animate here
    // when there is no live transition — that is the hot reload scenario.
    const unsubFocus = (navigation as any).addListener('focus', () => {
      if (!transitionActive.current && !didNavigateForward.current && !hasAnimated.current) {
        hasAnimated.current = true;
        startAnimations();
      }
    });

    const unsubBlur = (navigation as any).addListener('blur', () => {
      didNavigateForward.current = true;
      hasAnimated.current = false;
      transitionActive.current = false;
    });

    const unsubTransitionEnd = (navigation as any).addListener('transitionEnd', (e: any) => {
      transitionActive.current = false;
      if (!e?.data?.closing) {
        if (didNavigateForward.current) {
          // Returning from next screen — skip animation, reset flag
          didNavigateForward.current = false;
        } else if (!hasAnimated.current) {
          // Forward arrival — animate (hasAnimated prevents double-fire with focus)
          hasAnimated.current = true;
          startAnimations();
        }
      }
    });

    return () => {
      unsubTransitionStart();
      unsubFocus();
      unsubBlur();
      unsubTransitionEnd();
      hasAnimated.current = false;
      [clipAnim, titleAnim, month1Anim, brandAnim, guessAnim,
       dot1Anim, dotTravelAnim, month6Anim,
       text1Anim, text2Anim].forEach(a => a.setValue(0));
      dottedAnim.setValue(0.25);
    };
  }, [navigation, startAnimations]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Header: Standard Onboarding Progress Bar */}
      <OnboardingProgressBar step={3} total={7} />

      {/* 2. Content Area */}
      <View style={styles.content}>
        {/* Title Container */}
        <View style={styles.titleContainer}>
          <TitleText style={styles.titleOverride}>Designed to handle chaos</TitleText>
          <View style={styles.titleLine2}>
            <TitleText style={styles.titleOverride}>and </TitleText>
            <View style={styles.highlightWrapper}>
              <View style={styles.titleHighlightStripe} />
              <TitleText style={styles.titleOverride}>unexpected breakouts</TitleText>
            </View>
          </View>
        </View>

        {/* 3. Central Card Container */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* SVG Chart Area */}
            <View style={styles.chartContainer}>
              {/* Title — no slide, just faded → visible */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: verticalScale(-8),
                  left: scale(4),
                  zIndex: 1,
                  opacity: titleOpacity,
                }}
              >
                <SubtitleText style={styles.chartTitleOverride}>Your sudden flare-ups</SubtitleText>
              </Animated.View>

              <Svg width="100%" height="100%" viewBox="-10 -20 320 200" preserveAspectRatio="none" style={styles.svgOverflow}>
                <Defs>
                  {/* Purple Gradient for Primary Wave */}
                  <SvgLinearGradient id="purpleFillGrad" x1="0" y1="15" x2="0" y2="155" gradientUnits="userSpaceOnUse">
                    <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.5" />
                    <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                  </SvgLinearGradient>
                  {/* Pink/Red Gradient for Red Line */}
                  <SvgLinearGradient id="redFillGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#2a2a2a" stopOpacity="0.25" />
                    <Stop offset="100%" stopColor="#2a2a2a" stopOpacity="0.05" />
                  </SvgLinearGradient>
                </Defs>

                {/* Dotted Grid lines */}
                <AnimatedGSVG opacity={dottedAnim}>
                  <Line x1="0" y1="15" x2="300" y2="15" stroke="#e6e6eb" strokeDasharray="3,3" strokeWidth={1} />
                  <Line x1="0" y1="80" x2="300" y2="80" stroke="#e6e6eb" strokeDasharray="3,3" strokeWidth={1} />
                </AnimatedGSVG>

                {/* Static fills */}
                <Path d="M 0,15 C 160,15 140,155 300,155 L 300,155 L 300,155 L 0,155 Z" fill="url(#purpleFillGrad)" opacity={0.85} />
                <Path d="M 198,15 C 227,-10 286,-20 300,-20 L 300,15 Z" fill="url(#redFillGrad)" opacity={0.85} />

                {/* Static curves and axis */}
                <Path d="M 0,155 L 300,155" stroke="#111111" strokeWidth={2} />
                <Path d="M 0,15 C 55,15 75,98 110,98 C 165,98 147,-10 300,-19" stroke="#2a2a2a" strokeWidth={3} fill="none" />
                <Path d="M 0,15 C 160,15 140,155 300,155" stroke={primaryColor} strokeWidth={3} fill="none" />

                {/* White curtain rect */}
                <AnimatedRectSVG x={clipRectX} y={-20} width={320} height={220} fill="#ffffff" />

                {/* Month 1 dot */}
                <AnimatedCircleSVG cx={0} cy={15} r={dot1Radius} opacity={dot1Opacity} fill="#ffffff" stroke="#111111" strokeWidth={2} />

                {/* Traveling dot */}
                <AnimatedCircleSVG cx={dotX} cy={dotY} r={5} fill="#ffffff" stroke="#111111" strokeWidth={2} />

                {/* Guess yourself */}
                <AnimatedGSVG opacity={guessOpacity} y={guessSlideY} x={0}>
                  <SvgText x={250} y={33} textAnchor="middle" fontFamily="Outfit_500Medium" fontSize={13.5} fill="#111111">
                    Guess yourself
                  </SvgText>
                </AnimatedGSVG>

                {/* SkinStory brand */}
                <AnimatedGSVG opacity={brandOpacity} y={brandSlideY} x={0}>
                  <Rect x={8} y={141.5} width={4.5} height={4.5} fill="#111111" />
                  <Rect x={14} y={133} width={8.5} height={8.5} fill="#111111" />
                  <SvgText x={28} y={144} fontFamily="Outfit_600SemiBold" fontSize={14} fill="#111111">SkinStory</SvgText>
                </AnimatedGSVG>

                {/* Month 1 label */}
                <AnimatedGSVG opacity={month1Opacity} x={month1SlideX} y={0}>
                  <SvgText x={0} y={180} textAnchor="start" fontFamily="Outfit_700Bold" fontSize={17} fill="#111111">
                    Month 1
                  </SvgText>
                </AnimatedGSVG>

                {/* Month 6 label */}
                <AnimatedGSVG opacity={month6Opacity} x={month6SlideX} y={0}>
                  <SvgText x={300} y={180} textAnchor="end" fontFamily="Outfit_700Bold" fontSize={17} fill="#111111">
                    Month 6
                  </SvgText>
                </AnimatedGSVG>
              </Svg>
            </View>

            {/* Card Bottom Text */}
            <View style={styles.cardBottomTextContainer}>
              <Animated.View style={[styles.textLineRow, { opacity: text1Anim, transform: [{ translateY: text1TranslateY }] }]}>
                <Text style={styles.cardBottomText} maxFontSizeMultiplier={1.0}>80% of SkinStory users get </Text>
                <View style={styles.highlightWrapper}>
                  <View style={styles.cardHighlightStripe} />
                  <Text style={styles.cardBottomTextHighlight} maxFontSizeMultiplier={1.0}>real skin</Text>
                </View>
              </Animated.View>
              <Animated.View style={[styles.textLineRow, { opacity: text2Anim, transform: [{ translateY: text2TranslateY }] }]}>
                <View style={styles.highlightWrapper}>
                  <View style={styles.cardHighlightStripe} />
                  <Text style={styles.cardBottomTextHighlight} maxFontSizeMultiplier={1.0}>insights,</Text>
                </View>
                <Text style={styles.cardBottomText} maxFontSizeMultiplier={1.0}> which they never knew.</Text>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>

      {/* 4. Bottom Controls / Next Button */}
      <View style={styles.bottomBar}>
        <Native3DButton
          enabled={true}
          onPress={handleNext}
          primaryColor={primaryColor}
          shadowColor={shadowColor}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(4),
    marginBottom: verticalScale(16),
    alignItems: 'center',
  },
  titleLine2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleOverride: {
    color: '#111111',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: 'center',
    marginBottom: verticalScale(60),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(24, 0.3),
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 320 / 205,
  },
  chartTitleOverride: {
    color: '#111111',
    fontSize: moderateScale(19, 0.3),
  },
  svgOverflow: {
    overflow: 'visible',
  },
  cardBottomTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(4),
  },
  textLineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  titleHighlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: 0,
    right: 0,
    height: moderateScale(10, 0.3),
    backgroundColor: secondaryColor,
    borderRadius: scale(2),
    zIndex: -1,
  },
  cardHighlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: 0,
    right: 0,
    height: moderateScale(8.5, 0.3),
    backgroundColor: secondaryColor,
    borderRadius: scale(2),
    zIndex: -1,
  },
  cardBottomText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: moderateScale(17.5, 0.3),
    color: '#444444',
    textAlign: 'center',
  },
  cardBottomTextHighlight: {
    fontFamily: 'Outfit_700Bold',
    fontSize: moderateScale(17.5, 0.3),
    color: '#111111',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
  },
});
