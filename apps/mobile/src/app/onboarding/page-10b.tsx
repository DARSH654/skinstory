import React, { useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Moon, ArrowUpRight } from 'lucide-react-native';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useOnboardingStore } from '@/store/onboardingStore';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NativeWide3DButton from '@/components/page7/NativeWide3DButton';

// Branding colors defined at module scope (Strict Rule 11)
const primaryColor = '#937abd';
const shadowColor = '#735b9c';
const secondaryColor = '#d6cbe8';

export default function OnboardingPage10b() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { navigate } = useNavigationGuard();
  const name = useOnboardingStore((state) => state.name);

  // Personalized skin profile label (e.g. "Sara's skin profile")
  const profileLabel =
    name && name.trim().length > 0
      ? `${name.trim()}'s skin profile`
      : 'your skin profile';

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim])
  );

  const handleNext = useCallback(() => {
    navigate('/onboarding/page-12');
  }, [navigate]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* 1. Top Pill Badge */}
          <View style={styles.pillWrapper}>
            <View style={styles.topPill}>
              <Text style={styles.topPillText}>{profileLabel}</Text>
            </View>
          </View>

          {/* 2. Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleLine1}>You're already ahead</Text>
            <View style={styles.titleLine2}>
              <Text style={styles.titleLine1}>of </Text>
              <View style={styles.highlightWrapper}>
                <View style={[styles.highlightStripe, { backgroundColor: secondaryColor }]} />
                <Text style={styles.titleLine1}>most users.</Text>
              </View>
            </View>
          </View>

          {/* 3. Subtitle */}
          <Text style={styles.subtitle}>
            Your habits aren't the problem — here's what the data says.
          </Text>

          {/* 4. Top Two Cards (Sleep & Hydration) */}
          <View style={styles.twoCardsRow}>
            {/* Card 1: Sleep */}
            <View style={styles.insightCard}>
              <View style={styles.iconContainer}>
                <Moon size={moderateScale(22, 0.3)} color="#937abd" fill="#d6cbe8" strokeWidth={2} />
              </View>
              <Text style={styles.cardTitle}>Optimal sleep</Text>
              <View style={styles.tagBadge}>
                <ArrowUpRight size={moderateScale(12, 0.3)} color="#735b9c" strokeWidth={2.6} />
                <Text style={styles.tagBadgeText}>Top 25% of users</Text>
              </View>
              <Text style={styles.cardDesc}>
                Most users who struggle here get under 6 hrs. You don't.
              </Text>
            </View>

            {/* Card 2: Hydration */}
            <View style={styles.insightCard}>
              <View style={styles.iconContainer}>
                <Svg
                  width={moderateScale(22, 0.3)}
                  height={moderateScale(22, 0.3)}
                  viewBox="0 0 256 256"
                >
                  <Path
                    d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75Z"
                    fill="#d6cbe8"
                    stroke="#937abd"
                    strokeWidth="16"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z"
                    fill="#937abd"
                  />
                </Svg>
              </View>
              <Text style={styles.cardTitle}>Strong hydration</Text>
              <View style={styles.tagBadge}>
                <ArrowUpRight size={moderateScale(12, 0.3)} color="#735b9c" strokeWidth={2.6} />
                <Text style={styles.tagBadgeText}>Better than 70%</Text>
              </View>
              <Text style={styles.cardDesc}>
                Your water intake is already doing more than most realise.
              </Text>
            </View>
          </View>

          {/* 5. Problem Zone Detected Card */}
          <View style={styles.purpleCard}>
            {/* Row 1: Icon — big, tight to text below */}
            <View style={[styles.iconContainer, { marginBottom: verticalScale(2) }]}>
              <Svg
                width={moderateScale(50, 0.3)}
                height={moderateScale(50, 0.3)}
                viewBox="0 0 256 256"
              >
                {/* Fill circle covers all the way to the outer crosshair ring — no white gap */}
                <Circle cx="128" cy="128" r="100" fill="#d6cbe8" />
                {/* Crosshair — primary purple on top */}
                <Path
                  d="M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z"
                  fill="#937abd"
                />
              </Svg>
            </View>

            {/* Row 2: title — directly below the icon */}
            <Text style={styles.purpleCardHeaderLabel}>problem zone detected</Text>

            {/* Spacer */}
            <View style={{ height: verticalScale(10) }} />

            {/* Row 3: 78% body text */}
            <Text style={styles.purpleCardBody}>
              <Text style={styles.purpleCardBold}>78% of users with your lifestyle </Text>
              still struggle here — which means your routine isn't at fault. This is almost always an internal trigger the scan can identify.
            </Text>
          </View>

          {/* 7. Bottom Statement Text */}
          <View style={[styles.bottomTextContainer, { marginTop: verticalScale(24) }]}>
            <Text style={styles.bottomStatementPrimary}>
              Your lifestyle isn't failing you.
            </Text>
            <Text style={styles.bottomStatementSecondary}>
              The cause is just deeper than routines can fix.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* 8. Bottom CTA Button */}
      <View style={styles.bottomBar}>
        <NativeWide3DButton
          label="See how Skin Story can help ↗"
          onPress={handleNext}
          primaryColor={primaryColor}
          shadowColor={shadowColor}
          width={SCREEN_WIDTH - scale(40)}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(16),
  },
  animatedWrapper: {
    alignItems: 'center',
    width: '100%',
  },

  /* Top Pill */
  pillWrapper: {
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  topPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(999, 0.3),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topPillText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: moderateScale(13.5, 0.3),
    color: '#111111',
    letterSpacing: 0.2,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

  /* Title */
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
  },
  titleLine1: {
    fontSize: moderateScale(25, 0.3),
    fontFamily: 'Montserrat_800ExtraBold',
    color: '#111111',
    textAlign: 'center',
    lineHeight: moderateScale(29, 0.3),
  },
  titleLine2: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  highlightWrapper: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  highlightStripe: {
    position: 'absolute',
    bottom: moderateScale(2, 0.3),
    left: scale(-2),
    right: scale(-2),
    height: moderateScale(10, 0.3),
    borderRadius: scale(2),
    zIndex: -1,
  },

  /* Subtitle */
  subtitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: moderateScale(15.5, 0.3),
    color: '#444444',
    textAlign: 'center',
    lineHeight: moderateScale(21, 0.3),
    paddingHorizontal: scale(8),
    marginBottom: verticalScale(14),
  },

  /* Two Cards Row */
  twoCardsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
    marginBottom: verticalScale(14),
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#f7f6fa',
    borderRadius: moderateScale(20, 0.3),
    padding: scale(14),
    borderWidth: 2.5,
    borderColor: '#111111',
  },
  iconContainer: {
    marginBottom: verticalScale(5),
  },
  cardTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: moderateScale(14.5, 0.3),
    color: '#111111',
    marginBottom: verticalScale(6),
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ede7f6',
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(8, 0.3),
    gap: scale(3),
    marginBottom: verticalScale(8),
  },
  tagBadgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: moderateScale(11, 0.3),
    color: '#735b9c',
  },
  cardDesc: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: moderateScale(14, 0.3),
    color: '#555555',
    lineHeight: moderateScale(19, 0.3),
  },

  /* Purple Problem Zone Card */
  purpleCard: {
    width: '100%',
    backgroundColor: '#f7f6fa',
    borderRadius: moderateScale(20, 0.3),
    padding: scale(16),
    borderWidth: 2.5,
    borderColor: '#111111',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  purpleCardHeaderLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: moderateScale(21, 0.3),
    color: '#111111',
    marginBottom: verticalScale(4),
  },
  purpleCardBody: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: moderateScale(16, 0.3),
    color: '#555555',
    lineHeight: moderateScale(22, 0.3),
  },
  purpleCardBold: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: moderateScale(16, 0.3),
    color: '#111111',
  },

  /* Bottom Statement */
  bottomTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(8),
  },
  bottomStatementPrimary: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: moderateScale(22, 0.3),
    color: '#111111',
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  bottomStatementSecondary: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: moderateScale(18.5, 0.3),
    color: '#937abd',
    textAlign: 'center',
    lineHeight: moderateScale(25, 0.3),
  },

  /* Bottom Bar / CTA */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(35),
    height: verticalScale(75),
  },
});
